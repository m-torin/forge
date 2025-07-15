/**
 * API middleware for authentication and authorization
 */

import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';
import type { MiddlewareOptions } from '../../shared/types';

const defaultPublicApiRoutes = ['/api/health', '/api/public', '/api/auth'];

const isPublicApiRoute = (pathname: string, publicRoutes: string[]) => {
  const allPublicRoutes = [...defaultPublicApiRoutes, ...publicRoutes];
  return allPublicRoutes.some(route => pathname.startsWith(route));
};

/**
 * Enhanced middleware specifically for API routes with API key support
 */
export function createApiMiddleware(
  options: MiddlewareOptions & {
    allowedHeaders?: string[];
    publicApiRoutes?: string[];
  } = {},
) {
  const {
    allowedHeaders = ['x-api-key', 'authorization'],
    enableRateLimit = false,
    publicApiRoutes = [],
    publicPaths = [],
    requireAuth = true,
  } = options;

  return async function apiMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if this is a public API route
    if (isPublicApiRoute(pathname, [...publicPaths, ...publicApiRoutes])) {
      return NextResponse.next();
    }

    // Check for API key in any of the allowed headers
    let apiKey: string | null = null;
    for (const header of allowedHeaders) {
      const headerValue = request.headers.get(header);
      if (headerValue) {
        // Handle Bearer token format
        if (header === 'authorization' && headerValue.startsWith('Bearer ')) {
          apiKey = headerValue.substring(7);
        } else {
          apiKey = headerValue;
        }
        break;
      }
    }

    if (apiKey) {
      // API key is present, let Better Auth handle validation
      // Add headers to indicate API key auth method
      const response = NextResponse.next();
      response.headers.set('x-auth-method', 'api-key');

      if (enableRateLimit) {
        response.headers.set('x-rate-limit-check', 'api-key');
      }

      return response;
    }

    // No API key, check for session
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie && requireAuth) {
      // No authentication provided
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please provide a valid API key or authentication.',
          supportedMethods: {
            'API Key': allowedHeaders.map((h: string) => `${h}: your-api-key`),
            Session: 'Include session cookie with request',
          },
        },
        { status: 401 },
      );
    }

    if (sessionCookie) {
      const response = NextResponse.next();
      response.headers.set('x-auth-method', 'session');

      if (enableRateLimit) {
        response.headers.set('x-rate-limit-check', 'session');
      }

      return response;
    }

    // No auth but not required
    return NextResponse.next();
  };
}

/**
 * Default API middleware with common settings
 */
export const apiMiddleware = createApiMiddleware();
