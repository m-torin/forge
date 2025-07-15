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
