import { NextResponse, NextRequest } from 'next/server';

// Defining paths that do not require authentication
const authPaths = ['/login', '/register'];

// Defining paths that require authentication
const protectedPaths = ['/dashboard', '/portfolio', '/orders', '/transactions', '/watchlist', '/ai', '/stocks'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is logged in and trying to access auth pages (login/register), redirect to dashboard
  if (token && authPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. If user is logged out and trying to access protected pages, redirect to login
  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. For any other page (like public homepage '/'), allow request to continue
  return NextResponse.next();
}

// Matching routes for middleware checks
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
export type Middleware = typeof middleware;
