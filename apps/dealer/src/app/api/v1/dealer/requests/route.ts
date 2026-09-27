import { cookies } from 'next/headers';
import { dealerAuthService, dealerRequestsService, apiSuccess, apiCollection, apiError } from '@trionyx/api';
import { createDealerPortalRequestSchema } from '@trionyx/validation';
import type { DealerRequestStatus, DealerRequestType } from '@trionyx/types';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealer } = await dealerAuthService.getSession(token);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!, 10) : 25;
    const status = (searchParams.get('status') as DealerRequestStatus) || undefined;
    const type = (searchParams.get('type') as DealerRequestType) || undefined;

    const result = await dealerRequestsService.listDealerPortalRequests(dealer.id, {
      status,
      type,
      page,
      pageSize,
    });

    return apiCollection(result.items, result.meta, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to list requests', 500);
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const body = await request.json().catch(() => ({}));
    const parse = createDealerPortalRequestSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid request data', 422);
    }

    const created = await dealerRequestsService.createDealerPortalRequest(
      parse.data,
      dealer.id,
      dealerUser.id,
      dealer.dealerCode
    );

    return apiSuccess(created, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to create request', 500);
  }
}
