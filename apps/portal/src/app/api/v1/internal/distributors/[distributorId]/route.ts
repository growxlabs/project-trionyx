import { getServerActiveOrg } from '@/lib/serverOrg';
import { getDistributorScope } from '@trionyx/auth';
import { distributorsService, apiSuccess, apiError } from '@trionyx/api';
import { updateDistributorSchema } from '@trionyx/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);

    const distributorScope = getDistributorScope(user);
    const distributor = await distributorsService.getDistributorById(distributorId, distributorScope, activeOrg.id);
    if (!distributor) {
      return apiError('NOT_FOUND', 'Distributor not found', 404);
    }

    return apiSuccess(distributor, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to fetch distributor', status);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ distributorId: string }> }
) {
  try {
    const { distributorId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = updateDistributorSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid distributor data', 422);
    }

    const updated = await distributorsService.updateDistributor(distributorId, parse.data, user.id, activeOrg.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    if (err.code === 'NOT_FOUND') return apiError('NOT_FOUND', 'Distributor not found', 404);
    return apiError(code, err.message || 'Failed to update distributor', status);
  }
}
