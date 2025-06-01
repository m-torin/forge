import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import React, { type ReactNode } from 'react';
import '@mantine/core/styles.css';

interface RootLayoutProperties {
  readonly children: ReactNode;
}

export const metadata = {
  description: 'Backstage application',
  title: 'Backstage',
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
