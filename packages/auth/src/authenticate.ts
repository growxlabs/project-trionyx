import { usersRepository, auditLogsRepository, ensureDatabaseReady } from '@trionyx/database';
import { normalizeEmail } from '@trionyx/validation';
import type { SafeUser, Session } from '@trionyx/types';
import { verifyPassword } from './crypto';
import { checkIsLocked, handleFailedLogin, handleSuccessfulLogin } from './lockout';
import { createSession } from './session';
import { toSafeUser, isInternalPortalRole } from './guards';
import { SAFE_AUTH_ERRORS } from './config';

export interface AuthenticateResult {
  success: boolean;
  user?: SafeUser;
  session?: Session;
  rawToken?: string;
  error?: string;
  statusCode: number;
}

/**
 * Authoritative Internal Portal Authentication Workflow.
 * Directives:
 * 1. Normalize email (trim + lowercase).
 * 2. Lookup user record.
 * 3. Check account lockout state (5 failures = 15m lockout).
 * 4. Check user status (must be ACTIVE).
 * 5. Verify Argon2id password hash.
 * 6. Enforce internal portal role (DISTRIBUTOR / MANAGING_DIRECTOR / ADMIN).
 * 7. On success: reset failure counter, update lastLoginAt, create server session, record LOGIN_SUCCESS.
 * 8. On failure: record audit event, increment failure counter, return safe generic error.
 */
export async function authenticateInternalUser(params: {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<AuthenticateResult> {
  await ensureDatabaseReady();
  const normalizedEmail = normalizeEmail(params.email);

  // 1. Look up user
  const user = await usersRepository.findByEmail(normalizedEmail);
  if (!user) {
    // Record login failure without revealing email absence
    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'USER_NOT_FOUND' },
    });
    return {
      success: false,
      error: SAFE_AUTH_ERRORS.invalidCredentials,
      statusCode: 401,
    };
  }

  // 2. Check Lockout State
  if (checkIsLocked(user.lockedUntil)) {
    return {
      success: false,
      error: SAFE_AUTH_ERRORS.accountLocked,
      statusCode: 429,
    };
  }

  // 3. Check User Status
  if (user.status !== 'ACTIVE') {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'ACCOUNT_NOT_ACTIVE', status: user.status },
    });
    return {
      success: false,
      error: SAFE_AUTH_ERRORS.disabledAccount,
      statusCode: 401,
    };
  }

  // 4. Verify Internal Portal Role
  if (!isInternalPortalRole(user.role)) {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'UNAUTHORIZED_ROLE', role: user.role },
    });
    return {
      success: false,
      error: SAFE_AUTH_ERRORS.unauthorizedRole,
      statusCode: 401,
    };
  }

  // 5. Verify Password Hash
  const isValid = await verifyPassword(params.password, user.passwordHash || '');
  if (!isValid) {
    const { isLocked } = await handleFailedLogin(user, params.ipAddress, params.userAgent);
    return {
      success: false,
      error: isLocked ? SAFE_AUTH_ERRORS.accountLocked : SAFE_AUTH_ERRORS.invalidCredentials,
      statusCode: isLocked ? 429 : 401,
    };
  }

  // 6. Reset Failures & Record Login Success
  await handleSuccessfulLogin(user.id, params.ipAddress, params.userAgent);

  // 7. Create Session
  const { session, rawToken } = await createSession(user.id);

  return {
    success: true,
    user: toSafeUser(user),
    session,
    rawToken,
    statusCode: 200,
  };
}
