/**
 * Auth hooks for React
 */

'use client';

import { useAuthContext } from './auth-provider';
import { authClient } from './client';

/**
 * Alias for useAuthContext providing authentication state and methods
 */
export { useAuthContext as useAuth };

/**
 * Better Auth's useSession hook from configured client
 * @returns Session data and loading state
 */
export const useSession = authClient.useSession;

/**
 * Hook to get the current authenticated user
 * @returns Current user object or null if not authenticated
 */
export function useUser() {
  const { user } = useAuthContext();
  return user;
}

/**
 * Hook to check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

/**
 * Hook to enforce authentication requirement
 * @returns Function to require authentication
 */
export function useRequireAuth() {
  const { requireAuth } = useAuthContext();
  return requireAuth;
}

/**
 * Hook for authentication guard with optional redirect
 * @param redirectTo - Optional URL to redirect to if not authenticated
 * @returns Object with authentication status and loading state
 */
export function useAuthGuard(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (!isLoading && !isAuthenticated && redirectTo) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }

  return { isAuthenticated, isLoading };
}

/**
 * Hook for organization context (placeholder implementation)
 * TODO: Implement organization hooks based on organization structure
 * @returns Organization state with loading and error states
 */
export function useOrganization() {
  // Placeholder - implement based on your organization structure
  return {
    organization: null,
    isLoading: false,
    error: null,
  };
}

// Export alias for backwards compatibility with tests
export function useAuthLoading() {
  const { isLoading } = useAuthContext();
  return isLoading;
}
