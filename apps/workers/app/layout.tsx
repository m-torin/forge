import { AppShellLayout } from '@/components/app-shell-layout';
import { WorkflowProvider } from '@/contexts/workflow-context';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ModalsProvider } from '@mantine/modals';
import React, { type ReactNode } from 'react';

import { Toolbar } from '@repo/feature-flags/components/toolbar';

interface RootLayoutProperties {
  readonly children: ReactNode;
}

export const metadata = {
  description: 'Workflow orchestration and management',
  title: 'Workers',
};

export default function RootLayout({ children }: RootLayoutProperties): React.ReactElement {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider>
          <ModalsProvider>
            <WorkflowProvider>
              <AppShellLayout>{children}</AppShellLayout>
            </WorkflowProvider>
          </ModalsProvider>
        </MantineProvider>
        <Toolbar />
      </body>
    </html>
  );
}
