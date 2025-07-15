import { guestRegex, isDevelopmentEnvironment } from '#/lib/constants';
import { precomputeFlags } from '#/lib/precompute-flags';
import { env } from '#/root/env';
import { unstable_precompute } from 'flags/next';
import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js middleware for authentication and route protection
 * @param request - Incoming Next.js request
 * @returns Response or redirect based on authentication status
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: env.BETTER_AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (!token) {
    const redirectUrl = encodeURIComponent(request.url);

    return NextResponse.redirect(
      new URL(`/api/auth/guest?redirectUrl=${redirectUrl}`, request.url),
    );
  }

  const isGuest = guestRegex.test(token?.email ?? '');

  if (token && !isGuest && ['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Precompute feature flags for performance
  let response = NextResponse.next();

  try {
    // Extract context for flag evaluation (non-user-specific)
    const context = {
      country: request.headers.get('x-vercel-ip-country') || 'US',
      userAgent: request.headers.get('user-agent') || 'unknown',
      environment: env.NODE_ENV || 'development',
    };

    // Precompute flag values
    const code = await unstable_precompute(precomputeFlags, context);

    response.headers.set('x-flags-code', code);
  } catch (error) {
    console.warn('Flag precomputation failed:', error);
    // Continue without flags precomputation
  }

  return response;
}

/**
 * Middleware configuration defining which routes to process
 */
export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/login',
    '/register',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
