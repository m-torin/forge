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
  title: 'Workers',
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3400'
  ),
};

export default function RootLayout({ children }: RootLayoutProperties): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider>
          <ModalsProvider>
            <WorkflowProvider>{children}</WorkflowProvider>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
