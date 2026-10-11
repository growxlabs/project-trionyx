import { cookies } from 'next/headers';
import { internalAuthService, ACTIVE_ORG_COOKIE_NAME, ACTIVE_ORG_HEADER_NAME } from '@trionyx/api';
import type { SafeUser, Organization, OrganizationMembership, Session } from '@trionyx/types';

export async function getServerActiveOrg(request?: Request): Promise<{
  user: SafeUser;
  session: Session;
  activeOrg: Organization;
  membership: OrganizationMembership;
  memberships: OrganizationMembership[];
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(internalAuthService.cookieConfig.cookieName)?.value;
  if (!token) {
    const err = new Error('Not authenticated');
    (err as any).statusCode = 401;
    (err as any).code = 'UNAUTHENTICATED';
    throw err;
  }

  const headerOrg = request?.headers.get(ACTIVE_ORG_HEADER_NAME);
  const cookieOrg = cookieStore.get(ACTIVE_ORG_COOKIE_NAME)?.value;
  const requestedOrg = headerOrg || cookieOrg || null;

  return internalAuthService.getActiveOrganization(token, requestedOrg);
}
