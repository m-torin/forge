'use server';

import { logger } from '@/lib/logger';
import { headers } from 'next/headers';
import { auth, createAuthHelpers, type AuthSession } from '@repo/auth/server/next';

// Create auth helpers instance
const _authHelpers = createAuthHelpers({
  serviceName: 'Web App',
  serviceEmail: 'webapp@system',
});

/**
 * Get the current authenticated user's context
 * Returns userId and sessionId if authenticated, null otherwise
 */
export async function getAuthContext(): Promise<AuthSession | null> {
  'use server';

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id || !session?.session?.id) {
      return null;
    }

    // Return in AuthSession format
    return {
      user: session.user,
      session: session.session,
      activeOrganizationId: (session.session as any).activeOrganizationId,
    };
  } catch (_error) {
    logger.error('Failed to get auth context', _error);
    return null;
  }
}

/**
 * Require authentication for an action
 * Throws an error if the user is not authenticated
 */
export async function requireAuthContext(): Promise<AuthSession> {
  'use server';

  const context = await getAuthContext();

  if (!context) {
    throw new Error('Authentication required');
  }

  return context;
}

/**
 * Get user ID for database operations
 * Returns the authenticated user's ID or null for guest operations
 */
export async function getUserIdForDb() {
  'use server';

  const context = await getAuthContext();
  return context?.user?.id || null;
}

/**
 * Get session ID for database operations
 * Returns the authenticated session ID or a generated guest session ID
 */
export async function getSessionIdForDb() {
  'use server';

  const context = await getAuthContext();

  if (context?.session?.id) {
    return context.session.id;
  }

  // For guest users, we need to get/create a session ID from cookies
  // This would typically be handled by your session management
  // For now, return null and let the calling code handle it
  return null;
}

/**
 * Check if the current user owns a resource
 * Useful for authorization checks
 */
export async function userOwnsResource(resourceUserId: string): Promise<boolean> {
  'use server';

  const context = await getAuthContext();
  return context?.user.id === resourceUserId;
}

/**
 * Get the current user's organization context
 */
export async function getOrgContext(): Promise<string | null> {
  'use server';

  const context = await getAuthContext();
  return context?.activeOrganizationId || null;
}
