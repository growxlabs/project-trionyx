import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { inviteDealerUserSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to invite dealer users', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = inviteDealerUserSchema.safeParse({ ...body, dealerId });
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid user data', 422);
    }

    const { user: createdUser, rawToken, activationPath } = await dealersService.inviteDealerUser(
      dealerId,
      parse.data.name,
      parse.data.email,
      user.id
    );

    const dealerPortalBaseUrl =
      process.env.NEXT_PUBLIC_DEALER_PORTAL_URL || 'http://localhost:3001';
    const invitationLink = `${dealerPortalBaseUrl}${activationPath}`;

    return apiSuccess(
      {
        user: createdUser,
        token: rawToken,
        invitationLink,
      },
      201
    );
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Dealer not found', 404);
    return apiError('BAD_REQUEST', err.message || 'Failed to invite dealer user', 400);
  }
}
