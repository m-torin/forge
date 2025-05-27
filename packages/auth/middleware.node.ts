import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from './server';

import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/sign-in',
  '/sign-up',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/.well-known',
];

const isPublicRoute = (pathname: string) => {
  // Special case for home page
  if (pathname === '/') {
    return true;
  }
  return publicRoutes.some((route) => pathname.startsWith(route));
};

// Node.js runtime middleware for Next.js 15.2.0+ (requires runtime: "nodejs" config)
export const nodeAuthMiddleware = (next?: () => NextResponse) => {
  return async (request: NextRequest) => {
    const { pathname } = request.nextUrl;

    // Skip authentication for public routes
    if (isPublicRoute(pathname)) {
      return next ? next() : NextResponse.next();
    }

    // Check session using auth.api (requires Node.js runtime)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      // No session, redirect to sign-in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Session exists, continue
    return next ? next() : NextResponse.next();
  };
};
