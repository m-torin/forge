/**
 * Next.js client-side authentication exports
 */

'use client';

import React, { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';

// Re-export all client functionality
export * from './client';

// Next.js specific client features
import type { AuthContextType } from './shared/types';
import { useAuth } from './client/hooks';

// Auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth provider component for Next.js apps
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
}

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
 * Auth redirect utilities for Next.js
 */
export function useAuthRedirect() {
  const router = useRouter();
  
  return {
    redirectToLogin: (returnUrl?: string) => {
      const url = returnUrl ? `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}` : '/sign-in';
      router.push(url);
    },
    redirectAfterLogin: (returnUrl?: string) => {
      const url = returnUrl || '/dashboard';
      router.replace(url);
    },
    redirectToSignUp: (returnUrl?: string) => {
      const url = returnUrl ? `/sign-up?returnUrl=${encodeURIComponent(returnUrl)}` : '/sign-up';
      router.push(url);
    },
  };
}