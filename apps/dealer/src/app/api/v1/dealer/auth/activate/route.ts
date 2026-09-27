import { cookies } from 'next/headers';
import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';
import { activateDealerUserSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = activateDealerUserSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', parse.error.issues[0]?.message || 'Invalid activation data', 422);
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
    const userAgent = request.headers.get('user-agent') || null;

    const result = await dealerAuthService.activate(
      parse.data.token,
      parse.data.password,
      ipAddress,
      userAgent
    );

    const cookieStore = await cookies();
    cookieStore.set({
      name: dealerAuthService.cookieConfig.cookieName,
      value: result.rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return apiSuccess({ user: result.dealerUser, dealer: result.dealer }, 200);
  } catch (err: any) {
    return apiError('BAD_REQUEST', err.message || 'Activation failed', 400);
  }
}
