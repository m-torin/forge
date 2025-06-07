import { WorkflowProvider } from '@/contexts/workflow-context';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { ModalsProvider } from '@mantine/modals';
import React, { type ReactNode } from 'react';

interface RootLayoutProperties {
  readonly children: ReactNode;
}

export const metadata = {
  description: 'Workflow orchestration and management',
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3400',
  ),
  title: 'Workers',
};

export default function RootLayout({ children }: RootLayoutProperties): React.ReactElement {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider defaultColorScheme="auto">
          <ModalsProvider>
            <WorkflowProvider>{children}</WorkflowProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
