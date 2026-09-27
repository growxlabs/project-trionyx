import { NextResponse } from 'next/server';
import { dealerLoginSchema } from '@trionyx/validation';
import { authenticateDealerUser, DEALER_AUTH_CONFIG } from '@trionyx/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = dealerLoginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email or password is incorrect.',
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
    const userAgent = request.headers.get('user-agent') || null;

    const authResult = await authenticateDealerUser(email, password, ipAddress, userAgent);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
        },
        { status: authResult.statusCode }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: authResult.dealerUser,
        dealer: authResult.dealer,
      },
      { status: 200 }
    );

    // Set secure, HTTP-only, SameSite session cookie
    response.cookies.set({
      name: DEALER_AUTH_CONFIG.cookieName,
      value: authResult.rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error('Dealer login route error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected authentication error occurred.',
      },
      { status: 500 }
    );
  }
}
