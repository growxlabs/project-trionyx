import {
  authenticateInternalUser,
  requireInternalUser,
  invalidateSession,
  AUTH_CONFIG,
} from '@trionyx/auth';
import type { SafeUser, Session } from '@trionyx/types';

export interface InternalLoginInput {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface InternalLoginResult {
  user: SafeUser;
  session: Session;
  rawToken: string;
}

export const internalAuthService = {
  async login(input: InternalLoginInput): Promise<InternalLoginResult> {
    const authResult = await authenticateInternalUser(input);
    if (!authResult.success || !authResult.user || !authResult.session || !authResult.rawToken) {
      const err = new Error(authResult.error || 'Authentication failed');
      (err as any).statusCode = authResult.statusCode || 401;
      (err as any).code = authResult.statusCode === 429 ? 'RATE_LIMITED' : 'UNAUTHENTICATED';
      throw err;
    }
    return {
      user: authResult.user,
      session: authResult.session,
      rawToken: authResult.rawToken,
    };
  },

  async getSession(token?: string | null): Promise<{ user: SafeUser; session: Session }> {
    if (!token) {
      const err = new Error('Not authenticated');
      (err as any).statusCode = 401;
      (err as any).code = 'UNAUTHENTICATED';
      throw err;
    }
    return requireInternalUser(token);
  },

  async logout(token?: string | null): Promise<void> {
    if (token) {
      await invalidateSession(token);
    }
  },

  cookieConfig: AUTH_CONFIG,
};
