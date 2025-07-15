/**
 * Auth hooks for React
 */

'use client';

import { useAuthContext } from './auth-provider';
import { authClient } from './client';

export { useAuthContext as useAuth };

// Export Better Auth's useSession hook from our configured client
export const useSession = authClient.useSession;

export function useUser() {
  const { user } = useAuthContext();
  return user;
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated;
}

export function useRequireAuth() {
  const { requireAuth } = useAuthContext();
  return requireAuth;
}

export function useAuthGuard(redirectTo?: string) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (!isLoading && !isAuthenticated && redirectTo) {
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }

  return { isAuthenticated, isLoading };
}

// TODO: Implement organization hooks
export function useOrganization() {
  // Placeholder - implement based on your organization structure
  return {
    organization: null,
    isLoading: false,
    error: null,
  };
}
