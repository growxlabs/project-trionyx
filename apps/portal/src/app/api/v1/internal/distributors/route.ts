import { getServerActiveOrg } from '@/lib/serverOrg';
import { getDistributorScope } from '@trionyx/auth';
import { distributorsService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createDistributorSchema } from '@trionyx/validation';
import type { DistributorStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DistributorStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const distributorScope = getDistributorScope(user);
    const result = await distributorsService.listDistributors(
      { search, status, state, page, pageSize, organizationId: activeOrg.id },
      distributorScope
    );

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to list distributors', status);
  }
}

export async function POST(request: Request) {
  try {
    const { user, activeOrg } = await getServerActiveOrg(request);
    if (user.role !== 'MANAGING_DIRECTOR' && user.role !== 'ADMIN') {
      return apiError('FORBIDDEN', 'Access denied', 403);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createDistributorSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid distributor data', 422);
    }

    const created = await distributorsService.createDistributor(
      {
        ...parse.data,
        organizationId: activeOrg.id,
      },
      user.id
    );
    return apiSuccess(created, 201);
  } catch (err: any) {
    const status = err.statusCode || (err.message === 'UNAUTHENTICATED' ? 401 : 500);
    const code = err.code || (status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR');
    return apiError(code, err.message || 'Failed to create distributor', status);
  }
}
