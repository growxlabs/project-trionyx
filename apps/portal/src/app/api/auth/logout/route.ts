import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { invalidateSession, AUTH_CONFIG, validateSessionToken } from '@trionyx/auth';
import { auditLogsRepository } from '@trionyx/database';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.cookieName)?.value;

    if (token) {
      // Find session before invalidating to attribute logout in audit log
      const sessionData = await validateSessionToken(token);
      await invalidateSession(token);

      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || null;
      const userAgent = request.headers.get('user-agent') || null;

      await auditLogsRepository.recordEvent({
        userId: sessionData?.user.id || null,
        event: 'LOGOUT',
        ipAddress,
        userAgent,
      });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Clear session cookie
    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error('[Logout Error]', err);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
