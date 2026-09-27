import { cookies } from 'next/headers';
import { requireInternalUser, AUTH_CONFIG } from '@trionyx/auth';
import { dealerRequestsService, apiSuccess, apiError } from '@trionyx/api';
import { updateDealerRequestStatusSchema } from '@trionyx/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ dealerId: string; requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    await requireInternalUser(token);

    const data = await dealerRequestsService.getInternalRequestById(requestId);
    if (!data) {
      return apiError('NOT_FOUND', 'Request not found', 404);
    }

    return apiSuccess(data, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch request', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dealerId: string; requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const body = await request.json().catch(() => ({}));
    const parse = updateDealerRequestStatusSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid status data', 422);
    }

    const updated = await dealerRequestsService.updateInternalRequestStatus(requestId, parse.data, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update request', 500);
  }
}
