import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
];

const AUTH_PATHS = [
  '/home',
  '/network',
  '/messages',
  '/notifications',
  '/jobs',
  '/in',
  '/search',
  '/settings',
  '/my-applications',
  '/company',
  '/events',
  '/newsletters',
  '/saved-posts',
  '/admin',
  '/profile',
];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Read the refresh token cookie set by auth endpoints
    const token = request.cookies.get('refreshToken')?.value;
    const isAuthenticated = Boolean(token);

    const isPublicPath = PUBLIC_PATHS.some(
      (p) => pathname === p || (p !== '/' && pathname.startsWith(p))
    );

    const isAuthPath = AUTH_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p)
    );

    // Redirect authenticated users away from login/register unless redirected from auth failure
    const isFromProtected = request.nextUrl.searchParams.has('from');
    if (isAuthenticated && !isFromProtected && (pathname === '/login' || pathname === '/register')) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/home';
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }

    // Redirect unauthenticated users away from protected routes
    if (!isAuthenticated && isAuthPath) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    // If any unexpected error occurs in middleware, fail open rather than breaking the application
    console.error('Middleware execution error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static asset extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|css|js)$).*)',
  ],
};
