/**
 * Better Auth Client Configuration for Mantine Tailwind Template
 *
 * Re-exports from centralized @repo/auth package for backward compatibility
 */

'use client';

// Re-export everything from the centralized auth package
export {
  authClient,
  getSession,
  signIn,
  signOut,
  signUp,
  useAuth,
  // Additional hooks and utilities
  useAuthSession,
  useIsAuthenticated,
  useSession,
  useUser,
} from '@repo/auth/client/next';
