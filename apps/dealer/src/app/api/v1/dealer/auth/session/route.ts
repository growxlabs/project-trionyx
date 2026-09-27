import { cookies } from 'next/headers';
import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;
    const { dealerUser, dealer } = await dealerAuthService.getSession(token);

    return apiSuccess(
      {
        user: dealerUser,
        dealer,
      },
      200
    );
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED' || err.code === 'UNAUTHENTICATED') {
      return apiError('UNAUTHENTICATED', 'Not authenticated', 401);
    }
    return apiError('INTERNAL_ERROR', err.message || 'Session verification failed', 500);
  }
}
