import { cookies } from 'next/headers';
import { dealerAuthService, dealerRequestsService, apiSuccess, apiError } from '@trionyx/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealer } = await dealerAuthService.getSession(token);

    const data = await dealerRequestsService.getDealerPortalRequestById(requestId, dealer.id);
    return apiSuccess(data, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    if (err.code === 'NOT_FOUND' || err.statusCode === 404) {
      return apiError('NOT_FOUND', 'Request not found', 404);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch request', 500);
  }
}
