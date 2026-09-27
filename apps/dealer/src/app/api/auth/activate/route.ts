import { NextResponse } from 'next/server';
import { activateDealerUserSchema } from '@trionyx/validation';
import { activateDealerUser, DEALER_AUTH_CONFIG } from '@trionyx/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = activateDealerUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || 'Invalid activation data',
        },
        { status: 400 }
      );
    }

    const { token, password } = parseResult.data;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
    const userAgent = request.headers.get('user-agent') || null;

    const result = await activateDealerUser(token, password, ipAddress, userAgent);

    const response = NextResponse.json(
      {
        success: true,
        user: result.dealerUser,
        dealer: result.dealer,
      },
      { status: 200 }
    );

    // Automatically set session cookie upon successful activation
    response.cookies.set({
      name: DEALER_AUTH_CONFIG.cookieName,
      value: result.rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('Dealer activation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Activation failed',
      },
      { status: 400 }
    );
  }
}
