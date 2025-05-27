import { NextResponse } from 'next/server';

import { createAuthMiddleware } from '@repo/auth/server-utils';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';

import { env } from './env';

import type { NextMiddleware } from 'next/server';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

const authMiddleware = createAuthMiddleware({
  apiKeyHeaders: ['x-api-key'],
  publicApiRoutes: ['/api/public/health', '/api/webhooks', '/api/auth'],
  publicWebRoutes: [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/_next',
    '/favicon.ico',
    '/.well-known',
  ],
  redirectPath: '/sign-in',
});

export default authMiddleware(() => {
  securityHeaders();
  return NextResponse.next();
}) as unknown as NextMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
  runtime: 'nodejs', // Use Node.js runtime instead of Edge
};
