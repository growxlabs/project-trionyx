import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken, AUTH_CONFIG, toSafeUser } from '@trionyx/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionData = await validateSessionToken(token);
    if (!sessionData) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: toSafeUser(sessionData.user),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[/api/auth/me Error]', err);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
