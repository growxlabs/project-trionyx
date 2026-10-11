import { getServerActiveOrg } from '@/lib/serverOrg';
import { getDistributorScope } from '@trionyx/auth';
import { dealersService, apiSuccess, apiError } from '@trionyx/api';
import { updateDealerSchema } from '@trionyx/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);

    const distributorScope = getDistributorScope(user);
    const dealer = await dealersService.getDealerById(dealerId, distributorScope, activeOrg.id);
    if (!dealer) {
      return apiError('NOT_FOUND', 'Dealer not found', 404);
    }

    return apiSuccess(dealer, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to fetch dealer', status);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN' && user.role !== 'DISTRIBUTOR') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = updateDealerSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid dealer data', 422);
    }

    const distributorScope = getDistributorScope(user);
    const updated = await dealersService.updateDealer(dealerId, parse.data, user.id, distributorScope, activeOrg.id);
    return apiSuccess(updated, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 409 ? 'CONFLICT' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to update dealer', status);
  }
}
