import { cookies } from 'next/headers';
import { dealerAuthService, apiSuccess, apiError } from '@trionyx/api';
import { dealerLoginSchema } from '@trionyx/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parse = dealerLoginSchema.safeParse(body);
    if (!parse.success) {
      return apiError('VALIDATION_ERROR', 'Email or password is incorrect.', 400);
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
    const userAgent = request.headers.get('user-agent') || null;

    const result = await dealerAuthService.login({
      email: parse.data.email,
      password: parse.data.password,
      ipAddress,
      userAgent,
    });

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

    return apiSuccess({ user: result.user, dealer: result.dealer }, 200);
  } catch (err: any) {
    const status = err.statusCode || 401;
    const code = err.code || (status === 429 ? 'RATE_LIMITED' : 'UNAUTHENTICATED');
    return apiError(code, err.message || 'Authentication failed', status);
  }
}
