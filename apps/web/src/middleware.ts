import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
const AUTH_PATHS = ['/home', '/network', '/messages', '/notifications', '/jobs', '/in', '/search', '/settings', '/my-applications', '/company'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the refresh token cookie set by the auth endpoints
  const token = request.cookies.get('refreshToken')?.value;
  const isAuthenticated = Boolean(token);

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p))
  );

  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p)
  );

  // Redirect authenticated users away from login/register
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isAuthPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
