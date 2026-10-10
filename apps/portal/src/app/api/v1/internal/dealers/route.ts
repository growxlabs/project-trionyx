import { getServerActiveOrg } from '@/lib/serverOrg';
import { getDistributorScope } from '@trionyx/auth';
import { dealersService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createDealerSchema } from '@trionyx/validation';
import type { DealerStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DealerStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const distributorId = searchParams.get('distributorId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const distributorScope = getDistributorScope(user);

    const result = await dealersService.listDealers(
      { search, status, state, distributorId, page, pageSize, organizationId: activeOrg.id },
      distributorScope
    );

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list dealers', status);
  }
}

export async function POST(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN' && user.role !== 'DISTRIBUTOR') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createDealerSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid dealer data', 422);
    }

    const distributorScope = getDistributorScope(user);
    const created = await dealersService.createDealer(
      {
        ...parse.data,
        organizationId: activeOrg.id,
      },
      user.id,
      distributorScope
    );
    return apiSuccess(created, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 409 ? 'CONFLICT' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to create dealer', status);
  }
}
