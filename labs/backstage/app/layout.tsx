import { env } from '@/env';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@repo/auth/client/next';
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
        <AuthProvider>
          <MantineProvider>
            <Notifications />
            {children}
          </MantineProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <VercelToolbar />}
      </body>
    </html>
  );
}
