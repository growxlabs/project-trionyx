import { cookies } from 'next/headers';
import { requireInternalUser, canManageDealers, AUTH_CONFIG } from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ dealerUserId: string }> }
) {
  try {
    const { dealerUserId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canManageDealers(user.role)) {
      return apiError('FORBIDDEN', 'You do not have permission to disable dealer users', 403);
    }

    const updated = await dealersService.disableDealerUser(dealerUserId, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Dealer user not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to disable dealer user', 500);
  }
}
