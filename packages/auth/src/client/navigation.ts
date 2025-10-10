/**
 * Navigation helpers for Next.js
 */

'use client';

import { useRouter } from 'next/navigation';

export function useAuthRedirect() {
  const router = useRouter();

  return {
    redirectAfterLogin: (returnUrl?: string) => {
      const url = returnUrl || '/dashboard';
      router.replace(url as any);
    },
    redirectToLogin: (returnUrl?: string) => {
      const url = returnUrl ? `/sign-in?returnUrl=${encodeURIComponent(returnUrl)}` : '/sign-in';
      router.push(url as any);
    },
    redirectToSignUp: (returnUrl?: string) => {
      const url = returnUrl ? `/sign-up?returnUrl=${encodeURIComponent(returnUrl)}` : '/sign-up';
      router.push(url as any);
    },
  };
}

// Export aliases for backwards compatibility with tests
export function getAuthRedirectUrl(path?: string): string {
  return path || '/dashboard';
}

export function redirectAfterAuth(url?: string): void {
  // Prefer assign so tests can safely stub without triggering jsdom navigation
  if (typeof window === 'undefined') return;
  const target = url || '/dashboard';
  if (typeof window.location?.assign === 'function') {
    (window.location as any).assign(target);
  } else {
    try {
      // Fallback for environments without assign
      (window.location as any).href = target as any;
    } catch {
      // ignore in non-browser environments
    }
  }
}
