import type { Role } from '@trionyx/types';

export const AUTH_CONFIG = {
  cookieName: 'trionyx_portal_session',
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  sessionDurationSeconds: 7 * 24 * 60 * 60,
  maxFailedLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  internalPortalRoles: ['DISTRIBUTOR', 'MANAGING_DIRECTOR', 'ADMIN'] as const satisfies readonly Role[],
} as const;

export const SAFE_AUTH_ERRORS = {
  invalidCredentials: 'Email or password is incorrect.',
  accountLocked: 'Unable to sign in right now. Try again later.',
  unauthorizedRole: 'Email or password is incorrect.', // Safe error, zero role leakage
  disabledAccount: 'Email or password is incorrect.', // Safe error, zero account leakage
} as const;
