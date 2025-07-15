/**
 * Auth Provider for Next.js apps
 */

'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import type { Session, User } from '../types';
import { authClient } from './client';

/**
 * Authentication context value interface
 */
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeOrganizationId: string | null;

  // Helper methods
  getUserId: () => string | null;
  getSessionId: () => string | null;
  requireAuth: () => { userId: string; sessionId: string };

  // Auth state helpers
  canPerformAction: (action: string) => boolean;
  hasRole: (role: string) => boolean;
  belongsToOrganization: (orgId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Authentication provider component for React applications
 * @param children - Child components to wrap with auth context
 * @returns Auth provider with context value
 */
/**
 * Transform raw session user data to UserProfile interface
 */
function transformUser(rawUser: any): User | null {
  if (!rawUser) return null;

  return {
    ...rawUser,
    role: rawUser.role || 'user',
    phoneNumberVerified: rawUser.phoneNumberVerified || false,
    bio: rawUser.bio || null,
    image: rawUser.image || null,
    phoneNumber: rawUser.phoneNumber || null,
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, error, isPending } = authClient.useSession();

  const user = transformUser(sessionData?.user) || null;
  const session = sessionData || null;

  const getUserId = useCallback(() => user?.id || null, [user]);
  const getSessionId = useCallback(() => session?.session?.id || null, [session]);

  const requireAuth = useCallback(() => {
    const userId = getUserId();
    const sessionId = getSessionId();

    if (!userId || !sessionId) {
      throw new Error('Authentication required');
    }

    return { userId, sessionId };
  }, [getUserId, getSessionId]);

  const canPerformAction = useCallback(() => {
    return !!user; // Simplified - implement your logic
  }, [user]);

  const hasRole = useCallback(
    (role: string) => {
      if (!user) return false;
      return (user as any).role === role;
    },
    [user],
  );

  const belongsToOrganization = useCallback(
    (orgId: string) => {
      if (!session) return false;
      return (session.session as any)?.activeOrganizationId === orgId;
    },
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isAuthenticated: !!user && !!session,
      isLoading: isPending,
      activeOrganizationId: (session?.session as any)?.activeOrganizationId || null,
      getUserId,
      getSessionId,
      requireAuth,
      canPerformAction,
      hasRole,
      belongsToOrganization,
    }),
    [
      user,
      session,
      isPending,
      getUserId,
      getSessionId,
      requireAuth,
      canPerformAction,
      hasRole,
      belongsToOrganization,
    ],
  );

  if (isPending && !error) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
