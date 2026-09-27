import { cookies } from 'next/headers';
import { requireDistributorWritePermission, AUTH_CONFIG } from '@trionyx/auth';
import { distributorsService, apiSuccess, apiError } from '@trionyx/api';
import { distributorStatusSchema } from '@trionyx/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireDistributorWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = distributorStatusSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid status data', 422);
    }

    const updated = await distributorsService.updateDistributorStatus(distributorId, parse.data, user.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Distributor not found', 404);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to update distributor status', 500);
  }
}
