import { cookies } from 'next/headers';
import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(dealerAuthService.cookieConfig.cookieName)?.value;

    if (token) {
      await dealerAuthService.logout(token);
    }

    cookieStore.set({
      name: dealerAuthService.cookieConfig.cookieName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return apiSuccess({ loggedOut: true }, 200);
  } catch (err: any) {
    return apiError('INTERNAL_ERROR', err.message || 'Sign out failed', 500);
  }
}
