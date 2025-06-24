'use client';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/code-highlight/styles.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppLayout } from '@repo/design-system/backstage';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <Notifications />
          <AppLayout 
            title="Backstage" 
            description="Workflow Management System"
            appName="workflows"
          >
            {children}
          </AppLayout>
        </MantineProvider>
      </body>
    </html>
  );
}