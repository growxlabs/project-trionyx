import { cookies } from 'next/headers';
import {
  requireDealerWritePermission,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { dealerStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireDealerWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = dealerStatusSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid status data', 422);
    }

    const distributorScope = getDistributorScope(user);
    const updated = await dealersService.updateDealerStatus(dealerId, parse.data, user.id, distributorScope);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Dealer not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update dealer status', 500);
  }
}
