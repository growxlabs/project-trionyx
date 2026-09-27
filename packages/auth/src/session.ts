import type { Session, User } from '@trionyx/types';
import { sessionsRepository, usersRepository, ensureDatabaseReady } from '@trionyx/database';
import { generateSessionToken, hashSessionToken } from './crypto';
import { AUTH_CONFIG } from './config';

/**
 * Creates an opaque server-side session, persisting the SHA-256 token hash to the database
 * and returning the raw token to be set in an HTTP-only cookie.
 */
export async function createSession(userId: string): Promise<{ session: Session; rawToken: string }> {
  await ensureDatabaseReady();
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionDurationMs).toISOString();

  const session = await sessionsRepository.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return { session, rawToken };
}

/**
 * Authoritative server session validator.
 * Validates:
 * 1. Session exists in DB
 * 2. Session is not expired
 * 3. Associated user exists
 * 4. User status is ACTIVE
 * 5. Touches lastSeenAt timestamp
 */
export async function validateSessionToken(
  rawToken: string
): Promise<{ session: Session; user: User } | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  await ensureDatabaseReady();
  const tokenHash = hashSessionToken(rawToken);
  const session = await sessionsRepository.findByTokenHash(tokenHash);
  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await sessionsRepository.deleteByTokenHash(tokenHash);
    return null;
  }

  // Fetch associated user
  const user = await usersRepository.findById(session.userId);
  if (!user) {
    await sessionsRepository.deleteByTokenHash(tokenHash);
    return null;
  }

  // Enforce ACTIVE status
  if (user.status !== 'ACTIVE') {
    return null;
  }

  // Touch lastSeenAt asynchronously
  sessionsRepository.touch(session.id).catch(() => {});

  return { session, user };
}

/**
 * Invalidation on logout.
 * Deletes server-side session matching raw cookie token.
 */
export async function invalidateSession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashSessionToken(rawToken);
  await sessionsRepository.deleteByTokenHash(tokenHash);
}

/**
 * Invalidate all active sessions for a user (e.g. security reset).
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await sessionsRepository.deleteByUserId(userId);
}
