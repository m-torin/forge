'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { AnalyticsProvider } from '@/react/AnalyticsProvider';
import { GuestActionsProvider } from '@/react/GuestActionsContext';
import theme from '@/styles/theme';
import { AuthProvider } from '@repo/auth/client/next';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';
  
  // Handle successful sign in
  const handleSignIn = useCallback(() => {
    // Check for return URL in search params
    const returnUrl = searchParams.get('returnUrl');
    
    if (returnUrl && isValidRedirect(returnUrl)) {
      router.push(returnUrl);
    } else {
      // Default redirect to account page
      router.push(`/${locale}/account`);
    }
  }, [router, searchParams, locale]);
  
  // Handle sign out
  const handleSignOut = useCallback(() => {
    // Redirect to home page after sign out
    router.push(`/${locale}`);
  }, [router, locale]);
  
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AuthProvider
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      >
        <SessionTimeoutWarning />
        <AnalyticsProvider>
          <GuestActionsProvider>{children}</GuestActionsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

// Validate redirect URLs to prevent open redirect attacks
function isValidRedirect(url: string): boolean {
  // Must be a relative URL starting with /
  if (!url.startsWith('/')) return false;
  
  // Must not be a protocol-relative URL
  if (url.startsWith('//')) return false;
  
  // Must not contain @ (prevents user@host URLs)
  if (url.includes('@')) return false;
  
  return true;
}
