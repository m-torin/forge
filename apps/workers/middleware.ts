import { NextResponse } from 'next/server';

import { auth } from '@repo/auth/server';
import { devLog as logger } from '@repo/orchestration';
// Removed nosecone imports for now - need to integrate properly
import { createRateLimiter, slidingWindow } from '@repo/security/rate-limit';

import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/api/health',
  '/', // Allow homepage
];

// Create rate limiters for different endpoints
const rateLimiters = {
  default: createRateLimiter({ limiter: slidingWindow(60, '60s'), prefix: 'default' }),
  observability: createRateLimiter({ limiter: slidingWindow(100, '60s'), prefix: 'observability' }),
  trigger: createRateLimiter({ limiter: slidingWindow(20, '60s'), prefix: 'trigger' }),
  workflows: createRateLimiter({ limiter: slidingWindow(10, '60s'), prefix: 'workflows' }),
};

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  try {
    // 1. Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    const response = NextResponse.next();

    if (!isPublicRoute) {
      // 2. Authenticate user
      const session = await auth.api.getSession({ headers: request.headers });

      if (!session) {
        // Redirect to sign-in for web pages, return 401 for API
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Please authenticate to access this resource' },
            { status: 401 },
          );
        }
        // For now, allow unauthenticated access with warning
        logger.warn('Unauthenticated access to:', pathname);
      } else {
        // Add user context to headers for downstream use
        response.headers.set('x-user-id', session.user.id);
        response.headers.set('x-user-email', session.user.email || '');
        if (session.session.activeOrganizationId) {
          response.headers.set('x-organization-id', session.session.activeOrganizationId);
        }
      }
    }

    // 3. Apply rate limiting (for all routes, including public)
    if (pathname.startsWith('/api/')) {
      // Select appropriate rate limiter
      let rateLimiter = rateLimiters.default;
      if (pathname.startsWith('/api/workflows')) {
        rateLimiter = rateLimiters.workflows;
      } else if (pathname.startsWith('/api/client/trigger')) {
        rateLimiter = rateLimiters.trigger;
      } else if (pathname.startsWith('/api/observability')) {
        rateLimiter = rateLimiters.observability;
      }

      const identifier =
        request.headers.get('x-user-id') ||
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'anonymous';

      const { limit, remaining, reset, success } = await rateLimiter.limit(identifier);

      if (!success) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            limit,
            message: `Too many requests. Please try again later.`,
            remaining,
            reset: new Date(reset * 1000).toISOString(),
          },
          {
            headers: {
              'Retry-After': Math.ceil(reset - Date.now() / 1000).toString(),
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': reset.toString(),
            },
            status: 429,
          },
        );
      }

      // Add rate limit headers to successful responses
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());
    }

    return response;
  } catch (error) {
    logger.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Middleware processing failed' },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
