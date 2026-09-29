import type {
  SafeUser,
  Session,
  DistributorWithRelations,
  Role,
} from '@trionyx/types';
import {
  usersRepository,
  distributorsRepository,
  auditLogsRepository,
  ensureDatabaseReady,
} from '@trionyx/database';
import { normalizeEmail } from '@trionyx/validation';
import { verifyPassword, hashSessionToken } from './crypto';
import { checkIsLocked, handleFailedLogin, handleSuccessfulLogin } from './lockout';
import { createSession, validateSessionToken } from './session';
import { toSafeUser } from './guards';
import { SAFE_AUTH_ERRORS } from './config';

export const DISTRIBUTOR_AUTH_CONFIG = {
  cookieName: 'trionyx_distributor_session',
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxFailedLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
} as const;

export const SAFE_DISTRIBUTOR_AUTH_ERRORS = {
  invalidCredentials: 'Email or password is incorrect.',
  accountLocked: 'Unable to sign in right now. Try again in 15 minutes.',
  unauthorizedRole: 'Account is not authorized for the Distributor Workspace.',
  noDistributorAssigned: 'No distributor territory is assigned to this account. Contact Trionyx Operations HQ.',
  distributorInactive: 'Distributor territory is currently inactive. Contact Trionyx Operations HQ.',
} as const;

export interface AuthenticateDistributorResult {
  success: boolean;
  user?: SafeUser;
  session?: Session;
  rawToken?: string;
  distributor?: DistributorWithRelations;
  error?: string;
  statusCode: number;
}

/**
 * Authoritative Distributor Workspace Authentication Workflow.
 * Reuses canonical users and sessions tables (no duplicate identities).
 */
export async function authenticateDistributorUser(params: {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<AuthenticateDistributorResult> {
  await ensureDatabaseReady();
  const normalizedEmail = normalizeEmail(params.email);

  // 1. Look up user in canonical users table
  const user = await usersRepository.findByEmail(normalizedEmail);
  if (!user) {
    await auditLogsRepository.recordEvent({
      userId: null,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'USER_NOT_FOUND', target: 'DISTRIBUTOR_WORKSPACE' },
    });
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.invalidCredentials,
      statusCode: 401,
    };
  }

  // 2. Check Lockout State
  if (checkIsLocked(user.lockedUntil)) {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'ACCOUNT_LOCKED', target: 'DISTRIBUTOR_WORKSPACE' },
    });
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.accountLocked,
      statusCode: 423,
    };
  }

  // 3. Check User Status
  if (user.status !== 'ACTIVE') {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'INACTIVE_USER_STATUS', status: user.status },
    });
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.invalidCredentials,
      statusCode: 401,
    };
  }

  // 4. Verify password
  if (!user.passwordHash) {
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.invalidCredentials,
      statusCode: 401,
    };
  }

  const isPasswordValid = await verifyPassword(params.password, user.passwordHash);
  if (!isPasswordValid) {
    const lockoutStatus = await handleFailedLogin(user, params.ipAddress, params.userAgent);
    return {
      success: false,
      error: lockoutStatus.isLocked
        ? SAFE_DISTRIBUTOR_AUTH_ERRORS.accountLocked
        : SAFE_DISTRIBUTOR_AUTH_ERRORS.invalidCredentials,
      statusCode: lockoutStatus.isLocked ? 423 : 401,
    };
  }

  // 5. Enforce authorized roles: DISTRIBUTOR, MANAGING_DIRECTOR, ADMIN
  const allowedRoles: Role[] = ['DISTRIBUTOR', 'MANAGING_DIRECTOR', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { reason: 'UNAUTHORIZED_ROLE', role: user.role, target: 'DISTRIBUTOR_WORKSPACE' },
    });
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.unauthorizedRole,
      statusCode: 403,
    };
  }

  // 6. Resolve distributor identity
  let distributor: DistributorWithRelations | null = null;
  if (user.role === 'DISTRIBUTOR') {
    if (!user.distributorId) {
      return {
        success: false,
        error: SAFE_DISTRIBUTOR_AUTH_ERRORS.noDistributorAssigned,
        statusCode: 403,
      };
    }
    distributor = await distributorsRepository.findById(user.distributorId);
    if (!distributor) {
      return {
        success: false,
        error: SAFE_DISTRIBUTOR_AUTH_ERRORS.noDistributorAssigned,
        statusCode: 403,
      };
    }
    if (distributor.status !== 'ACTIVE') {
      return {
        success: false,
        error: SAFE_DISTRIBUTOR_AUTH_ERRORS.distributorInactive,
        statusCode: 403,
      };
    }
  } else {
    // Admin / Managing Director previewing workspace: resolve linked or primary distributor
    if (user.distributorId) {
      distributor = await distributorsRepository.findById(user.distributorId);
    }
    if (!distributor) {
      // Default to first active distributor
      const activeList = await distributorsRepository.listAllActive();
      if (activeList.length > 0) {
        distributor = await distributorsRepository.findById(activeList[0].id);
      }
    }
  }

  if (!distributor) {
    return {
      success: false,
      error: SAFE_DISTRIBUTOR_AUTH_ERRORS.noDistributorAssigned,
      statusCode: 403,
    };
  }

  // 7. Successful login: reset counters and create session
  await handleSuccessfulLogin(user.id, params.ipAddress, params.userAgent);
  const { session, rawToken } = await createSession(user.id);

  return {
    success: true,
    user: toSafeUser(user),
    session,
    rawToken,
    distributor,
    statusCode: 200,
  };
}

/**
 * Authoritative Server Session Guard for Distributor Workspace.
 * Enforces:
 * 1. Valid active session from canonical sessions table.
 * 2. User status is ACTIVE.
 * 3. User role is DISTRIBUTOR, MANAGING_DIRECTOR, or ADMIN.
 * 4. Resolves authenticated distributor territory.
 */
export async function requireDistributorSession(
  token?: string | null
): Promise<{ user: SafeUser; session: Session; distributor: DistributorWithRelations }> {
  if (!token) {
    throw new Error('UNAUTHENTICATED');
  }

  const result = await validateSessionToken(token);
  if (!result) {
    throw new Error('UNAUTHENTICATED');
  }

  const { user, session } = result;

  const allowedRoles: Role[] = ['DISTRIBUTOR', 'MANAGING_DIRECTOR', 'ADMIN'];
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN');
  }

  let distributor: DistributorWithRelations | null = null;
  if (user.role === 'DISTRIBUTOR') {
    if (!user.distributorId) {
      throw new Error('NO_DISTRIBUTOR_ASSIGNED');
    }
    distributor = await distributorsRepository.findById(user.distributorId);
    if (!distributor || distributor.status !== 'ACTIVE') {
      throw new Error('DISTRIBUTOR_INACTIVE');
    }
  } else {
    // Admin / Managing Director inspecting distributor workspace
    if (user.distributorId) {
      distributor = await distributorsRepository.findById(user.distributorId);
    }
    if (!distributor) {
      const activeList = await distributorsRepository.listAllActive();
      if (activeList.length > 0) {
        distributor = await distributorsRepository.findById(activeList[0].id);
      }
    }
    if (!distributor) {
      throw new Error('NO_DISTRIBUTOR_ASSIGNED');
    }
  }

  return {
    user: toSafeUser(user),
    session,
    distributor,
  };
}

/**
 * Invalidates the distributor session from the canonical sessions table.
 */
export async function invalidateDistributorSession(token: string): Promise<void> {
  await ensureDatabaseReady();
  const tokenHash = hashSessionToken(token);
  const { sessionsRepository } = await import('@trionyx/database');
  await sessionsRepository.deleteByTokenHash(tokenHash);
}

