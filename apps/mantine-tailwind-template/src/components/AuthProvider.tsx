/**
 * Better Auth Provider Component
 *
 * Wraps the app with Better Auth context for client-side authentication state management
 */

'use client';

import { authClient } from '#/lib/auth-client';
import { logInfo } from '@repo/observability';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth client and log session state in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const initializeAuth = async () => {
        try {
          const { data: session } = await authClient.getSession();
          logInfo('[Auth Provider] Session initialized', {
            isAuthenticated: !!session?.user,
            userId: session?.user?.id,
          });
        } catch (error) {
          logInfo('[Auth Provider] Session initialization failed', error);
        }
      };

      void initializeAuth();
    }
  }, []);

  return children;
}
