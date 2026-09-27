import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateDealerSession, DEALER_AUTH_CONFIG } from '@trionyx/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DEALER_AUTH_CONFIG.cookieName)?.value;

    if (token) {
      await invalidateDealerSession(token);
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: DEALER_AUTH_CONFIG.cookieName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error('Dealer logout route error:', err);
    return NextResponse.json({ success: false, error: 'Sign out failed' }, { status: 500 });
  }
}
