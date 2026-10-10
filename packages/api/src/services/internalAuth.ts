import {
  authenticateInternalUser,
  requireInternalUser,
  requireActiveOrganization,
  invalidateSession,
  AUTH_CONFIG,
  ACTIVE_ORG_COOKIE_NAME,
  ACTIVE_ORG_HEADER_NAME,
} from '@trionyx/auth';
import type { SafeUser, Session, Organization, OrganizationMembership } from '@trionyx/types';

export { ACTIVE_ORG_COOKIE_NAME, ACTIVE_ORG_HEADER_NAME };

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

  async getActiveOrganization(
    token?: string | null,
    requestedOrgIdOrSlug?: string | null
  ): Promise<{
    user: SafeUser;
    session: Session;
    activeOrg: Organization;
    membership: OrganizationMembership;
    memberships: OrganizationMembership[];
  }> {
    if (!token) {
      const err = new Error('Not authenticated');
      (err as any).statusCode = 401;
      (err as any).code = 'UNAUTHENTICATED';
      throw err;
    }
    return requireActiveOrganization(token, { requestedOrgIdOrSlug });
  },

  async logout(token?: string | null): Promise<void> {
    if (token) {
      await invalidateSession(token);
    }
  },

  cookieConfig: {
    ...AUTH_CONFIG,
    activeOrgCookieName: ACTIVE_ORG_COOKIE_NAME,
    activeOrgHeaderName: ACTIVE_ORG_HEADER_NAME,
  },
};
