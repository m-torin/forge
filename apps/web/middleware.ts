import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g., /en/account -> 'en')
  const pathnameHasLocale = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const locale = pathnameHasLocale ? pathnameHasLocale[1] : 'en';

  // Define protected routes that require authentication
  const protectedRoutes = [
    `/${locale}/account`,
    `/${locale}/account-password`,
    `/${locale}/account-billing`,
    `/${locale}/account-wishlists`,
    `/${locale}/orders`,
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Check for Better Auth session token
    const sessionToken = request.cookies.get('better-auth.session_token');

    if (!sessionToken) {
      // Redirect to login with return URL
      const url = new URL(`/${locale}/login`, request.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Allow the request to continue
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
