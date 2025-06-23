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
import { ObservabilityProvider } from '@repo/observability/client/next';
import { env } from '@/env';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Extract locale from pathname
  const locale = pathname.split('/')[1] || 'en';

  // Handle successful sign in
  const _handleSignIn = useCallback(() => {
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
  const _handleSignOut = useCallback(() => {
    // Redirect to home page after sign out
    router.push(`/${locale}`);
  }, [router, locale]);

  return (
    <ObservabilityProvider
      config={{
        providers: {
          sentry: {
            dsn: env.NEXT_PUBLIC_SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            release: process.env.NEXT_PUBLIC_APP_VERSION,
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            beforeSend: (event: any) => {
              // Add web-specific context
              if (event.tags) {
                event.tags.app = 'web';
                event.tags.runtime = 'client';
              } else {
                event.tags = { app: 'web', runtime: 'client' };
              }
              return event;
            },
          },
        },
      }}
    >
      <MantineProvider theme={theme}>
        <Notifications />
        <AuthProvider>
          <SessionTimeoutWarning />
          <AnalyticsProvider>
            <GuestActionsProvider>{children}</GuestActionsProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </MantineProvider>
    </ObservabilityProvider>
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
