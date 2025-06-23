import { NextRequest, NextResponse } from 'next/server';

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

  // For now, allow all requests to pass through
  // TODO: Implement proper authentication middleware
  return NextResponse.next();
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
