/**
 * Next.js server-side authentication exports
 */

import { auth } from './server/auth';

import type { AuthSession } from './shared/types';
// Re-export all server functionality
// Next.js specific server features
import type { NextRequest } from 'next/server';

export * from './server';

/**
 * Get session from Next.js server components
 */
export async function getServerSession(): Promise<AuthSession | null> {
  const { getSession } = await import('./server/auth');
  return getSession();
}

/**
 * Authentication middleware for Next.js
 */
export async function authMiddleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Add session info to headers for downstream components
    const headers = new Headers(request.headers);
    if (session) {
      headers.set('x-user-id', session.user.id);
      headers.set('x-session-id', session.session.id);
      if (session.session.activeOrganizationId) {
        headers.set('x-organization-id', session.session.activeOrganizationId);
      }
    }

    return new Response(null, {
      headers,
      status: 200,
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return new Response('Authentication failed', { status: 401 });
  }
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, session: AuthSession, ...args: T) => Promise<Response>,
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 401,
        });
      }

      const authSession: AuthSession = {
        activeOrganizationId: session.session.activeOrganizationId || undefined,
        session: session.session,
        user: session.user,
      };

      return handler(request, authSession, ...args);
    } catch (error) {
      console.error('Auth wrapper error:', error);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  };
}

/**
 * Require authentication and specific organization access
 */
export function withOrgAuth<T extends any[]>(
  handler: (
    request: NextRequest,
    session: AuthSession,
    organizationId: string,
    ...args: T
  ) => Promise<Response>,
) {
  return withAuth(async (request: NextRequest, session: AuthSession, ...args: T) => {
    const organizationId = session.activeOrganizationId;

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'No active organization' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    return handler(request, session, organizationId, ...args);
  });
}

/**
 * Require admin permissions
 */
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, session: AuthSession, ...args: T) => Promise<Response>,
) {
  return withAuth(async (request: NextRequest, session: AuthSession, ...args: T) => {
    // Check if user has admin role - type cast for compatibility
    const userWithRole = session.user as any;
    const isAdmin =
      userWithRole.role && ['admin', 'moderator', 'super-admin'].includes(userWithRole.role);

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    return handler(request, session, ...args);
  });
}
