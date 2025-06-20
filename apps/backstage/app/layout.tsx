import { env } from '@/env';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@repo/auth/client/next';
import { ObservabilityProvider } from '@repo/observability/client/next';
import { VercelToolbar } from '@vercel/toolbar/next';
import { type Metadata } from 'next';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import React, { type ReactNode } from 'react';

interface RootLayoutProperties {
  readonly children: ReactNode;
}

export const metadata: Metadata = {
  description: 'Backstage application',
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || 'http://localhost:3300'),
  title: 'Backstage',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: RootLayoutProperties): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <ObservabilityProvider
          config={{
            providers: {
              sentry: {
                dsn: env.NEXT_PUBLIC_SENTRY_DSN,
                environment: env.NODE_ENV,
                replaysSessionSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
                tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 0,
                // Debug mode removed to prevent bundle conflicts
              },
            },
          }}
          enableConcurrent={false}
        >
          <AuthProvider>
            <MantineProvider>
              <Notifications />
              {children}
            </MantineProvider>
          </AuthProvider>
        </ObservabilityProvider>
        {process.env.NODE_ENV === 'development' && <VercelToolbar />}
      </body>
    </html>
  );
}
