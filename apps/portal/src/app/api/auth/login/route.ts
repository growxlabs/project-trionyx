import { NextResponse } from 'next/server';
import { loginSchema } from '@trionyx/validation';
import { authenticateInternalUser, AUTH_CONFIG } from '@trionyx/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(body);

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

    const authResult = await authenticateInternalUser({
      email,
      password,
      ipAddress,
      userAgent,
    });

    if (!authResult.success || !authResult.rawToken || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Email or password is incorrect.',
        },
        { status: authResult.statusCode }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: authResult.user,
      },
      { status: 200 }
    );

    // Set secure, HTTP-only, SameSite session cookie
    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: authResult.rawToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_CONFIG.sessionDurationSeconds,
    });

    return response;
  } catch (err) {
    // Zero stack trace leaks to client; log error on server
    console.error('[Internal Auth Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to sign in right now. Try again later.',
      },
      { status: 500 }
    );
  }
}
