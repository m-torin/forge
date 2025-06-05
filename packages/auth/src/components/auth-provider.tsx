/**
 * Authentication provider component
 */

'use client';

import { createContext, type ReactNode, useContext } from 'react';

import { useAuth } from '../client/hooks';

import type { AuthContextType } from '../shared/types';

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access auth context
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Auth provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Provides auth context to all child components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Session context for compatibility
 */
export function useSessionContext() {
  const { isLoading } = useAuthContext();
  return {
    isLoaded: !isLoading,
  };
}
