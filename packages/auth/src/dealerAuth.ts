import type {
  DealerUser,
  SafeDealerUser,
  DealerSession,
  DealerWithRelations,
} from '@trionyx/types';
import {
  dealerUsersRepository,
  dealerSessionsRepository,
  dealersRepository,
  auditLogsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } from './crypto';
import crypto from 'crypto';

export const DEALER_AUTH_CONFIG = {
  cookieName: 'trionyx_dealer_session',
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxFailedLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  invitationDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  resetDurationMs: 60 * 60 * 1000, // 1 hour
} as const;

export const SAFE_DEALER_AUTH_ERRORS = {
  invalidCredentials: 'Email or password is incorrect.',
  accountLocked: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
  accountDisabled: 'Account has been disabled. Contact Trionyx administrator.',
  dealerInactive: 'Dealership account is not active. Please contact Trionyx.',
  invalidOrExpiredToken: 'This activation or reset link is invalid or has expired.',
} as const;

export function toSafeDealerUser(user: DealerUser): SafeDealerUser {
  const { passwordHash: _, invitationTokenHash: __, resetTokenHash: ___, ...safe } = user;
  return safe;
}

/**
 * Creates a server-controlled session for an authenticated dealer user.
 */
export async function createDealerSession(
  dealerUserId: string
): Promise<{ session: DealerSession; rawToken: string }> {
  await ensureDatabaseReady();
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + DEALER_AUTH_CONFIG.sessionDurationMs).toISOString();

  const session = await dealerSessionsRepository.create({
    dealerUserId,
    tokenHash,
    expiresAt,
  });

  return { session, rawToken };
}

/**
 * Authoritative dealer session validator.
 * Validates:
 * 1. Session exists in DB and is not expired
 * 2. Associated dealer user exists and is ACTIVE
 * 3. Associated dealer business exists and is ACTIVE
 * 4. Touches lastSeenAt timestamp
 */
export async function validateDealerSessionToken(
  rawToken: string
): Promise<{ session: DealerSession; dealerUser: DealerUser; dealer: DealerWithRelations } | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  await ensureDatabaseReady();
  const tokenHash = hashSessionToken(rawToken);
  const session = await dealerSessionsRepository.findByTokenHash(tokenHash);
  if (!session) return null;

  // Check session expiration
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await dealerSessionsRepository.deleteByTokenHash(tokenHash);
    return null;
  }

  // Fetch dealer user
  const dealerUser = await dealerUsersRepository.findById(session.dealerUserId);
  if (!dealerUser || dealerUser.status !== 'ACTIVE') {
    return null;
  }

  // Fetch linked dealer business
  const dealer = await dealersRepository.findById(dealerUser.dealerId);
  if (!dealer || dealer.status !== 'ACTIVE') {
    return null;
  }

  // Touch lastSeenAt asynchronously
  dealerSessionsRepository.touch(session.id).catch(() => {});

  return { session, dealerUser, dealer };
}

/**
 * Server-side guard for protected Dealer Portal pages and APIs.
 * Throws UNAUTHENTICATED or FORBIDDEN.
 */
export async function requireDealerSession(
  token?: string | null
): Promise<{ dealerUser: SafeDealerUser; dealer: DealerWithRelations; session: DealerSession }> {
  if (!token) {
    throw new Error('UNAUTHENTICATED');
  }

  const result = await validateDealerSessionToken(token);
  if (!result) {
    throw new Error('UNAUTHENTICATED');
  }

  return {
    dealerUser: toSafeDealerUser(result.dealerUser),
    dealer: result.dealer,
    session: result.session,
  };
}

/**
 * Authenticates a dealer user with email and password.
 * Strictly enforces brute-force protection, account status, and dealer business status.
 */
export async function authenticateDealerUser(
  email: string,
  password: string,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<
  | { success: true; session: DealerSession; rawToken: string; dealerUser: SafeDealerUser; dealer: DealerWithRelations }
  | { success: false; error: string; statusCode: number }
> {
  await ensureDatabaseReady();
  const cleanEmail = email.trim().toLowerCase();

  const user = await dealerUsersRepository.findByEmail(cleanEmail);

  // User does not exist -> constant-time dummy verify to prevent timing enumeration
  if (!user) {
    await verifyPassword(password, '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$dHVtbXloYXNo').catch(() => {});
    await auditLogsRepository.recordEvent({
      event: 'DEALER_LOGIN_FAILURE',
      ipAddress: clientIp,
      userAgent,
      metadata: { reason: 'USER_NOT_FOUND' },
    });
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.invalidCredentials, statusCode: 401 };
  }

  // Check lockout
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.accountLocked, statusCode: 429 };
  }

  // Check user account status
  if (user.status !== 'ACTIVE') {
    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_LOGIN_FAILURE',
      ipAddress: clientIp,
      userAgent,
      metadata: { reason: `USER_STATUS_${user.status}`, dealerUserId: user.id },
    });
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.accountDisabled, statusCode: 403 };
  }

  // Verify password
  if (!user.passwordHash) {
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.invalidCredentials, statusCode: 401 };
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    const { locked, lockedUntil } = await dealerUsersRepository.incrementFailedLogin(
      user.id,
      DEALER_AUTH_CONFIG.maxFailedLoginAttempts,
      DEALER_AUTH_CONFIG.lockoutDurationMs
    );

    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_LOGIN_FAILURE',
      ipAddress: clientIp,
      userAgent,
      metadata: { reason: 'INVALID_PASSWORD', locked, lockedUntil, dealerUserId: user.id },
    });

    if (locked) {
      return { success: false, error: SAFE_DEALER_AUTH_ERRORS.accountLocked, statusCode: 429 };
    }
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.invalidCredentials, statusCode: 401 };
  }

  // Verify linked dealer business
  const dealer = await dealersRepository.findById(user.dealerId);
  if (!dealer || dealer.status !== 'ACTIVE') {
    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'DEALER_LOGIN_FAILURE',
      ipAddress: clientIp,
      userAgent,
      metadata: { reason: 'DEALER_BUSINESS_INACTIVE', dealerId: user.dealerId, dealerUserId: user.id },
    });
    return { success: false, error: SAFE_DEALER_AUTH_ERRORS.dealerInactive, statusCode: 403 };
  }

  // Success: touch login and create session
  await dealerUsersRepository.touchLogin(user.id);
  const { session, rawToken } = await createDealerSession(user.id);

  await auditLogsRepository.recordEvent({
    userId: null,
    event: 'DEALER_LOGIN_SUCCESS',
    ipAddress: clientIp,
    userAgent,
    metadata: { dealerId: dealer.id, dealerCode: dealer.dealerCode, dealerUserId: user.id },
  });

  return {
    success: true,
    session,
    rawToken,
    dealerUser: toSafeDealerUser(user),
    dealer,
  };
}

/**
 * Generates an invitation token for a new or re-invited dealer user.
 */
export async function inviteDealerUser(
  dealerId: string,
  name: string,
  email: string,
  actorId: string
): Promise<{ user: SafeDealerUser; rawToken: string; activationPath: string }> {
  await ensureDatabaseReady();
  const cleanEmail = email.trim().toLowerCase();

  const dealer = await dealersRepository.findById(dealerId);
  if (!dealer) throw new Error('Dealer not found');

  const existing = await dealerUsersRepository.findByEmail(cleanEmail);
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + DEALER_AUTH_CONFIG.invitationDurationMs).toISOString();

  let user: DealerUser;
  if (existing) {
    if (existing.dealerId !== dealerId) {
      throw new Error('This email is already associated with another dealer account.');
    }
    if (existing.status === 'ACTIVE') {
      throw new Error('This user is already active. Use password reset if credentials are lost.');
    }
    // Re-invite pending user
    await dealerUsersRepository.setInvitationToken(existing.id, tokenHash, expiresAt);
    user = (await dealerUsersRepository.findById(existing.id))!;
  } else {
    user = await dealerUsersRepository.createInvited({
      dealerId,
      name,
      email: cleanEmail,
      invitationTokenHash: tokenHash,
      invitationExpiresAt: expiresAt,
      createdBy: actorId,
    });
  }

  await auditLogsRepository.recordEvent({
    userId: actorId,
    event: 'DEALER_USER_INVITED',
    metadata: {
      dealerId,
      dealerUserId: user.id,
      email: cleanEmail,
    },
  });

  return {
    user: toSafeDealerUser(user),
    rawToken,
    activationPath: `/activate?token=${rawToken}`,
  };
}

/**
 * Activates a dealer account with an invitation token and password.
 */
export async function activateDealerUser(
  token: string,
  password: string,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<{ session: DealerSession; rawToken: string; dealerUser: SafeDealerUser; dealer: DealerWithRelations }> {
  await ensureDatabaseReady();
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

  const user = await dealerUsersRepository.findByInvitationTokenHash(tokenHash);
  if (!user) {
    throw new Error(SAFE_DEALER_AUTH_ERRORS.invalidOrExpiredToken);
  }

  if (user.invitationExpiresAt && new Date(user.invitationExpiresAt).getTime() <= Date.now()) {
    throw new Error(SAFE_DEALER_AUTH_ERRORS.invalidOrExpiredToken);
  }

  const passwordHash = await hashPassword(password);
  const activated = await dealerUsersRepository.activate(user.id, passwordHash);

  const dealer = await dealersRepository.findById(activated.dealerId);
  if (!dealer) throw new Error('Dealer not found');

  await auditLogsRepository.recordEvent({
    userId: null,
    event: 'DEALER_USER_ACTIVATED',
    ipAddress: clientIp,
    userAgent,
    metadata: { dealerId: dealer.id, dealerUserId: activated.id },
  });

  // Automatically sign in upon activation
  const { session, rawToken } = await createDealerSession(activated.id);

  return {
    session,
    rawToken,
    dealerUser: toSafeDealerUser(activated),
    dealer,
  };
}

/**
 * Requests a password reset for a dealer user (neutral response to avoid enumeration).
 */
export async function requestDealerPasswordReset(
  email: string
): Promise<{ success: true; rawToken?: string }> {
  await ensureDatabaseReady();
  const cleanEmail = email.trim().toLowerCase();
  const user = await dealerUsersRepository.findByEmail(cleanEmail);

  if (!user || user.status !== 'ACTIVE') {
    return { success: true };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + DEALER_AUTH_CONFIG.resetDurationMs).toISOString();

  await dealerUsersRepository.setResetToken(user.id, tokenHash, expiresAt);

  await auditLogsRepository.recordEvent({
    userId: null,
    event: 'DEALER_PASSWORD_RESET_REQUESTED',
    metadata: { email: cleanEmail, dealerUserId: user.id },
  });

  return { success: true, rawToken };
}

/**
 * Completes a dealer password reset using a single-use token.
 */
export async function resetDealerPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await ensureDatabaseReady();
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

  const user = await dealerUsersRepository.findByResetTokenHash(tokenHash);
  if (!user) {
    throw new Error(SAFE_DEALER_AUTH_ERRORS.invalidOrExpiredToken);
  }

  if (user.resetExpiresAt && new Date(user.resetExpiresAt).getTime() <= Date.now()) {
    throw new Error(SAFE_DEALER_AUTH_ERRORS.invalidOrExpiredToken);
  }

  const passwordHash = await hashPassword(newPassword);
  await dealerUsersRepository.updatePassword(user.id, passwordHash);

  // Invalidate all existing sessions on password reset
  await dealerSessionsRepository.deleteByUserId(user.id);

  await auditLogsRepository.recordEvent({
    userId: null,
    event: 'DEALER_PASSWORD_RESET_COMPLETED',
    metadata: { dealerId: user.dealerId, dealerUserId: user.id },
  });
}

/**
 * Changes a dealer user's password requiring the current password.
 */
export async function changeDealerPassword(
  dealerUserId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await ensureDatabaseReady();
  const user = await dealerUsersRepository.findById(dealerUserId);
  if (!user || !user.passwordHash) {
    throw new Error('User not found');
  }

  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error('Current password is incorrect.');
  }

  const newHash = await hashPassword(newPassword);
  await dealerUsersRepository.updatePassword(user.id, newHash);

  // Invalidate other sessions
  await dealerSessionsRepository.deleteByUserId(user.id);

  await auditLogsRepository.recordEvent({
    userId: null,
    event: 'DEALER_PASSWORD_CHANGED',
    metadata: { dealerId: user.dealerId, dealerUserId: user.id },
  });
}

/**
 * Invalidation on logout.
 */
export async function invalidateDealerSession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashSessionToken(rawToken);
  await dealerSessionsRepository.deleteByTokenHash(tokenHash);
}
