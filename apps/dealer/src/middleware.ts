import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'trionyx_dealer_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // Static assets and API routes are exempt
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const isPublicAuthPage =
    pathname === '/login' ||
    pathname === '/activate' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  // 1. Guest trying to access protected route -> redirect to /login
  if (!token && !isPublicAuthPage) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  }



  const response = NextResponse.next();

  // Prevent caching for all dealer portal pages
  if (!isPublicAuthPage) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
