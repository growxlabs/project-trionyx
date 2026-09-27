import { cookies } from 'next/headers';
import {
  requireInternalUser,
  requireDealerWritePermission,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import { dealersService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createDealerSchema } from '@trionyx/validation';
import type { DealerStatus } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') as DealerStatus) || undefined;
    const state = searchParams.get('state') || undefined;
    const distributorId = searchParams.get('distributorId') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;

    const distributorScope = getDistributorScope(user);

    const result = await dealersService.listDealers(
      { search, status, state, distributorId, page, pageSize },
      distributorScope
    );

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list dealers', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireDealerWritePermission(token);

    const body = await request.json().catch(() => ({}));
    const parse = createDealerSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid dealer data', 422);
    }

    const distributorScope = getDistributorScope(user);
    const created = await dealersService.createDealer(parse.data, user.id, distributorScope);
    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    if (err.code === 'CONFLICT' || err.statusCode === 409) {
      return apiError('CONFLICT', err.message, 409);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create dealer', 500);
  }
}
