'use client';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import { AnalyticsProvider } from '@/react/AnalyticsProvider';
import { GuestActionsProvider } from '@/react/GuestActionsContext';
import theme from '@/styles/theme';
import { AuthProvider } from '@repo/auth/client/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AuthProvider>
        <AnalyticsProvider>
          <GuestActionsProvider>{children}</GuestActionsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
