/**
 * Better Auth Context Helper
 *
 * Provides server-side auth context using Better Auth
 */

import { logInfo } from '@repo/observability';
import { headers } from 'next/headers';
import { auth } from './auth-config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Get auth context for server components using Better Auth
 * Safe for static generation - returns unauthenticated state during build
 */
export async function getAuthContextSafe(): Promise<AuthContext> {
  // During static generation/build, return safe defaults
  if (!process.env.NEXT_RUNTIME) {
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  return getAuthContext();
}

/**
 * Get auth context for server components using Better Auth
 */
export async function getAuthContext(): Promise<AuthContext> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const user = session?.user
      ? {
          ...session.user,
          role: session.user.role || 'user',
          image: session.user.image || undefined,
        }
      : null;
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    if (process.env.NODE_ENV === 'development') {
      logInfo('[Auth Context] Retrieved session', {
        isAuthenticated,
        userId: user?.id,
        userRole: user?.role,
      });
    }

    return {
      user,
      isAuthenticated,
      isAdmin,
    };
  } catch (error) {
    logInfo('[Auth Context] Failed to get session, returning unauthenticated state', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}
