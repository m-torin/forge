/**
 * Better Auth Client Configuration for Mantine Tailwind Template
 *
 * Provides a configured Better Auth client with proper hooks and methods
 */

'use client';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { AuthInstance } from './auth-config';

/**
 * Better Auth client configuration
 */
const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  // Include plugins for proper type inference
  plugins: [inferAdditionalFields<AuthInstance>()],
});

// Type inference for client
type _ClientSession = typeof authClient.$Infer.Session;

/**
 * Export hooks and methods for easy use
 */
export const { useSession, signIn, signUp, signOut } = authClient;

/**
 * Export the auth client for provider use
 */
export { authClient };

/**
 * Custom hook for authentication context
 */
export function useAuth() {
  const session = useSession();

  return {
    user: session.data?.user || null,
    session: session.data || null,
    isAuthenticated: !!session.data?.user,
    isLoading: session.isPending,
    error: session.error,
    signIn,
    signUp,
    signOut,
  };
}
