import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DISTRIBUTOR_COOKIE_NAME = 'trionyx_distributor_session';
const PORTAL_COOKIE_NAME = 'trionyx_portal_session';
const DEALER_COOKIE_NAME = 'trionyx_dealer_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get(DISTRIBUTOR_COOKIE_NAME)?.value ||
    request.cookies.get(PORTAL_COOKIE_NAME)?.value ||
    request.cookies.get(DEALER_COOKIE_NAME)?.value;

  // Static assets and API routes are exempt
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/brand') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/login';

  // 1. Guest trying to access protected route -> redirect to /login
  if (!token && !isLoginPage) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  }

  // 2. Logged-in user visiting /login -> redirect to /overview
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  const response = NextResponse.next();

  // Prevent caching for all protected distributor workspace pages
  if (!isLoginPage) {
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
