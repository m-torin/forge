/**
 * Next.js client-side auth exports - Placeholder for future migration
 * Re-exports client functionality with Next.js specific additions
 */

import type { ReactNode } from 'react';

// Re-export all client functionality
export * from './client';

// Next.js specific client features (placeholder)
export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return children;
}

// Next.js auth hooks (placeholder)
export function useAuthRedirect() {
  return {
    redirectToLogin: () => {},
    redirectAfterLogin: () => {},
  };
}