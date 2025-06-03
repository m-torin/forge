import { type NextRequest, NextResponse } from 'next/server';

import { validateApiKey } from '@repo/auth/api-key-helpers';
import { auth } from '@repo/auth/server';

export async function middleware(request: NextRequest) {
  // First check for API key authentication
  const apiKeyResult = await validateApiKey(request.headers, {
    admin: ['*'], // Require admin permissions
  });

  if (apiKeyResult.valid) {
    // API key is valid and has admin permissions
    return NextResponse.next();
  }

  // Fall back to session authentication
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Check if user has admin role
  interface SessionUser {
    role?: string;
  }

  const userRole = (session.user as SessionUser)?.role || 'user';
  const adminRoles = ['admin', 'super-admin', 'moderator', 'support'];

  if (!adminRoles.includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/guests/:path*',
};
