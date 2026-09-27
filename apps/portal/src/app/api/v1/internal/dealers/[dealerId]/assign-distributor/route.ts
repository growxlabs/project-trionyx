import { cookies } from 'next/headers';
import {
  requireInternalUser,
  canReassignDistributor,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { reassignDealerDistributorSchema } from '@trionyx/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    if (!canReassignDistributor(user.role)) {
      return apiError('FORBIDDEN', 'Only Managing Directors and Admins can reassign distributors', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = reassignDealerDistributorSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid reassignment data', 422);
    }

    const updated = await dealersService.assignDistributor(dealerId, parse.data, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Dealer not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to reassign distributor', 500);
  }
}
