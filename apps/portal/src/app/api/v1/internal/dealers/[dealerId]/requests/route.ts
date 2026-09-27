import { cookies } from 'next/headers';
import {
  requireInternalUser,
  getDistributorScope,
  AUTH_CONFIG,
} from '@trionyx/auth';
import {
  dealersService,
  dealerRequestsService,
  apiSuccess,
  apiCollection,
  apiError,
} from '@trionyx/api';
import { createDealerRequestSchema } from '@trionyx/validation';
import type { DealerRequestStatus, DealerRequestType } from '@trionyx/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const distributorScope = getDistributorScope(user);
    const dealer = await dealersService.getDealerById(dealerId, distributorScope);
    if (!dealer) {
      return apiError('NOT_FOUND', 'Dealer not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;
    const status = (searchParams.get('status') as DealerRequestStatus) || undefined;
    const type = (searchParams.get('type') as DealerRequestType) || undefined;

    const result = await dealerRequestsService.listInternalDealerRequests(dealerId, {
      status,
      type,
      page,
      pageSize,
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list dealer requests', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ dealerId: string }> }
) {
  try {
    const { dealerId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;
    const { user } = await requireInternalUser(token);

    const distributorScope = getDistributorScope(user);
    const dealer = await dealersService.getDealerById(dealerId, distributorScope);
    if (!dealer) {
      return apiError('NOT_FOUND', 'Dealer not found', 404);
    }

    const body = await request.json().catch(() => ({}));
    const parse = createDealerRequestSchema.safeParse({ ...body, dealerId });
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid request data', 422);
    }

    const created = await dealerRequestsService.createInternalDealerRequest(dealerId, parse.data, user.id);
    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    if (err.message === 'FORBIDDEN' || err.code === 'FORBIDDEN') return apiError('FORBIDDEN', 'Access denied', 403);
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create dealer request', 500);
  }
}
