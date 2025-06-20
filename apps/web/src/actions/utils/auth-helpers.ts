/**
 * Auth helper functions that return server actions
 * These are not server actions themselves, but return functions that are
 */

import { requireAuthContext, getUserIdForDb, getAuthContext } from './auth-wrapper';

/**
 * Wrapper for actions that require authentication
 * Automatically injects userId into the action
 */
export function withAuth<T extends any[], R>(action: (userId: string, ...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    'use server';

    const context = await requireAuthContext();
    return action(context.user.id, ...args);
  };
}

/**
 * Wrapper for actions that work for both authenticated and guest users
 * Automatically injects userId (or null for guests) into the action
 */
export function withOptionalAuth<T extends any[], R>(
  action: (userId: string | null, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    'use server';

    const userId = await getUserIdForDb();
    return action(userId, ...args);
  };
}

/**
 * Create an auth-aware wrapper for any database action
 * This injects the current user context into the action
 */
export function createAuthAwareAction<T extends any[], R>(
  action: (context: { userId: string | null; sessionId: string | null }, ...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R> => {
    'use server';

    const authContext = await getAuthContext();

    const context = {
      userId: authContext?.user.id || null,
      sessionId: authContext?.session.id || null,
    };

    return action(context, ...args);
  };
}
