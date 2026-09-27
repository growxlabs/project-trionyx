import { cookies } from 'next/headers';
import { dealerAuthService, dealerPortalService, apiSuccess, apiError } from '@trionyx/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    const overview = await dealerPortalService.getOverview(dealer, dealerUser);
    return apiSuccess(overview, 200);
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Failed to fetch overview', 500);
  }
}
