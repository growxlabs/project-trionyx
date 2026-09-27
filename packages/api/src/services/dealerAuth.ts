import {
  authenticateDealerUser,
  requireDealerSession,
  invalidateDealerSession,
  activateDealerUser as authActivateDealerUser,
  requestDealerPasswordReset,
  resetDealerPassword as authResetDealerPassword,
  DEALER_AUTH_CONFIG,
} from '@trionyx/auth';

export const dealerAuthService = {
  async login(input: { email: string; password: string; ipAddress?: string | null; userAgent?: string | null }) {
    const authResult = await authenticateDealerUser(
      input.email,
      input.password,
      input.ipAddress,
      input.userAgent
    );

    if (!authResult.success) {
      const err = new Error(authResult.error || 'Authentication failed');
      (err as any).statusCode = authResult.statusCode || 401;
      (err as any).code = authResult.statusCode === 429 ? 'RATE_LIMITED' : 'UNAUTHENTICATED';
      throw err;
    }

    return {
      user: authResult.dealerUser,
      dealer: authResult.dealer,
      session: authResult.session,
      rawToken: authResult.rawToken,
    };
  },

  async getSession(token?: string | null) {
    if (!token) {
      const err = new Error('Not authenticated');
      (err as any).statusCode = 401;
      (err as any).code = 'UNAUTHENTICATED';
      throw err;
    }
    return requireDealerSession(token);
  },

  async logout(token?: string | null) {
    if (token) {
      await invalidateDealerSession(token);
    }
  },

  async activate(token: string, password: string, clientIp?: string | null, userAgent?: string | null) {
    return authActivateDealerUser(token, password, clientIp, userAgent);
  },

  async forgotPassword(email: string) {
    return requestDealerPasswordReset(email);
  },

  async resetPassword(token: string, newPassword: string) {
    return authResetDealerPassword(token, newPassword);
  },

  cookieConfig: DEALER_AUTH_CONFIG,
};
