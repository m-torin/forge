import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  // Get pathname
  const pathname = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    '/health',
    '/api/health',
    '/auth',
    '/login',
    '/signup',
    '/api/auth',
    '/_next',
    '/static',
    '/favicon.ico',
    '/apple-icon.png',
    '/icon.png',
    '/opengraph-image.png',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path) || pathname === path);

  // Allow public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected routes, check for session using edge-compatible approach
  try {
    const sessionCookie = getSessionCookie(request);

    // If no session cookie, redirect to login
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists, allow the request to continue
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    // Redirect to login on auth errors
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|health).*)',
  ],
};
