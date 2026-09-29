import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateDistributorSession, DISTRIBUTOR_AUTH_CONFIG } from '@trionyx/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(DISTRIBUTOR_AUTH_CONFIG.cookieName)?.value;

    if (token) {
      await invalidateDistributorSession(token);
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set({
      name: DISTRIBUTOR_AUTH_CONFIG.cookieName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error('Distributor logout route error:', err);
    return NextResponse.json({ success: false, error: 'Sign out failed' }, { status: 500 });
  }
}
