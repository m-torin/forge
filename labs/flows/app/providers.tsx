'use client';

// import { SessionProvider } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { PathProvider } from '#/lib/pathContext';
import { Notifications } from '@mantine/notifications';
import { ReactFlowProvider } from '@xyflow/react';
import instagramTheme from '#/styles/instagramTheme';
import { Analytics } from '@vercel/analytics/react';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={instagramTheme} defaultColorScheme="light">
        <ModalsProvider>
          <PathProvider>
            <ReactFlowProvider>{children}</ReactFlowProvider>
          </PathProvider>

          <Analytics />
          <Notifications />
        </ModalsProvider>
      </MantineProvider>
  );
}
