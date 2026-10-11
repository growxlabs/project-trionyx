import { cookies } from 'next/headers';
import { internalAuthService, ACTIVE_ORG_COOKIE_NAME, apiSuccess, apiError } from '@trionyx/api';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(internalAuthService.cookieConfig.cookieName)?.value;
    if (!token) {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }

    const body = await request.json().catch(() => ({}));
    const requestedOrgIdOrSlug = body.organizationId || body.slug || body.orgIdOrSlug;
    if (!requestedOrgIdOrSlug) {
      return apiError('VALIDATION_ERROR', 'Organization ID or slug is required', 400);
    }

    // Verify user has membership in this organization
    const { activeOrg, membership, memberships } = await internalAuthService.getActiveOrganization(
      token,
      requestedOrgIdOrSlug
    );

    // Set active organization cookie
    cookieStore.set({
      name: ACTIVE_ORG_COOKIE_NAME,
      value: activeOrg.id,
      httpOnly: false, // Accessible to client-side JS for optimistic switcher state
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return apiSuccess(
      {
        activeOrg,
        membership,
        memberships,
      },
      200
    );
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 403);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to switch organization', status);
  }
}
