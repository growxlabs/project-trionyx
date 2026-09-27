import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireDistributorWritePermission,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { distributorsService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createDistributorSchema } from '@trionyx/validation';
import type { DistributorStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DistributorStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const distributorScope = getDistributorScope(user);
    const result = await distributorsService.listDistributors(
      { search, status, state, page, pageSize },
      distributorScope
    );

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list distributors', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireDistributorWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = createDistributorSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid distributor data', 422);
    }

    const created = await distributorsService.createDistributor(parse.data, user.id);
    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create distributor', 500);
  }
}
