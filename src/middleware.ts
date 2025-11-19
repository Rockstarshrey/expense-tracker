import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from './lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/register', '/api/auth/logout'];

  // Allow access to static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/auth/') || publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const user = await getUserFromRequest(req);

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/api/expenses'))) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};