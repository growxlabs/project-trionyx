import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { internalAuthService, ACTIVE_ORG_COOKIE_NAME, apiError } from '@trionyx/api';

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

    const isSecure = request.url.startsWith('https://') || request.headers.get('x-forwarded-proto') === 'https';

    const cookieOptions = {
      name: ACTIVE_ORG_COOKIE_NAME,
      value: activeOrg.id,
      httpOnly: false, // Accessible to client-side JS for optimistic switcher state & sync
      secure: isSecure,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    };

    // Set active organization cookie in server context
    cookieStore.set(cookieOptions);

    // Build NextResponse with explicit Set-Cookie header and cache-prevention
    const response = NextResponse.json(
      {
        data: {
          activeOrg,
          membership,
          memberships,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      }
    );

    response.cookies.set(cookieOptions);

    return response;
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 403);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to switch organization', status);
  }
}
