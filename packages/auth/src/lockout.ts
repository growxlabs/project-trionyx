import { usersRepository, auditLogsRepository } from '@trionyx/database';
import { AUTH_CONFIG } from './config';

export interface LockoutStatus {
  isLocked: boolean;
  lockedUntil?: string | null;
}

/**
 * Checks whether an account is currently in a temporary locked state.
 */
export function checkIsLocked(lockedUntil?: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil).getTime() > Date.now();
}

/**
 * Handles failed login attempt:
 * - Increments failed login count
 * - If attempts reach threshold (5), triggers 15-minute lock
 * - Records LOGIN_FAILURE or ACCOUNT_LOCKED audit event
 */
export async function handleFailedLogin(
  user: { id: string; email: string; failedLoginCount: number },
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<LockoutStatus> {
  const newCount = (user.failedLoginCount || 0) + 1;
  let lockedUntil: string | null = null;
  let isLocked = false;

  if (newCount >= AUTH_CONFIG.maxFailedLoginAttempts) {
    lockedUntil = new Date(Date.now() + AUTH_CONFIG.lockoutDurationMs).toISOString();
    isLocked = true;
  }

  await usersRepository.updateLoginAttempt(user.id, newCount, lockedUntil);

  if (isLocked) {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'ACCOUNT_LOCKED',
      ipAddress,
      userAgent,
      metadata: { failedAttempts: newCount, lockDurationMinutes: 15 },
    });
  } else {
    await auditLogsRepository.recordEvent({
      userId: user.id,
      event: 'LOGIN_FAILURE',
      ipAddress,
      userAgent,
      metadata: { failedAttempts: newCount },
    });
  }

  return { isLocked, lockedUntil };
}

/**
 * Resets failed login counters upon successful authentication
 * and records LOGIN_SUCCESS audit event.
 */
export async function handleSuccessfulLogin(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await usersRepository.recordSuccessfulLogin(userId);
  await auditLogsRepository.recordEvent({
    userId,
    event: 'LOGIN_SUCCESS',
    ipAddress,
    userAgent,
  });
}
