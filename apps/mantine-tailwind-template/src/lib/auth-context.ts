/**
 * Better Auth Context Helper
 *
 * Provides server-side auth context using Better Auth
 */

import { logInfo } from '@repo/observability';
import { headers } from 'next/headers';
import { auth } from './auth-config';

interface User {
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
 */
async function _getAuthContext(): Promise<AuthContext> {
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
