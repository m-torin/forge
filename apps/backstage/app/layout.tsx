import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { type Metadata } from 'next';
import React, { type ReactNode } from 'react';
import '@mantine/core/styles.css';

import { env } from '@/env';

interface RootLayoutProperties {
  readonly children: ReactNode;
}

export const metadata: Metadata = {
  description: 'Backstage application',
  title: 'Backstage',
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL || 'http://localhost:3300'),
};

export default function RootLayout({ children }: RootLayoutProperties): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
