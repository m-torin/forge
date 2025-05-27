import { AnalyticsProvider } from '@repo/analytics';
import { AuthProvider } from '@repo/auth/provider';

import { TooltipProvider } from './components/ui/tooltip';
import { MantineProvider } from './providers/mantine-provider';
import { ThemeProvider } from './providers/theme';

import type { ThemeProviderProps } from 'next-themes';

type DesignSystemProviderProperties = ThemeProviderProps & {
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const DesignSystemProvider = ({
  children,
  helpUrl,
  privacyUrl,
  termsUrl,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <MantineProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </MantineProvider>
  </ThemeProvider>
);

// Export auth components
export { SignIn } from './components/auth/sign-in';
export { SignUp } from './components/auth/sign-up';
export { OrganizationSwitcher } from './components/auth/organization-switcher';
export { OrganizationDetail } from './components/auth/organization-detail';
export { AcceptInvitation } from './components/auth/accept-invitation';
export { InvitationPreview } from './components/auth/invitation-preview';

// Export Mantine components and utilities
export * from '@mantine/core';
export * from '@mantine/hooks';
export * from '@mantine/dates';
export * from '@mantine/form';
export * from '@mantine/notifications';
export * from '@mantine/modals';
export * from '@mantine/dropzone';
export * from '@mantine/charts';
export * from '@mantine/carousel';
export * from '@mantine/spotlight';
export * from '@mantine/nprogress';
export * from '@mantine/code-highlight';

// Export our theme
export { mantineTheme, theme } from './lib/mantine-theme';
export { MantineProvider } from './providers/mantine-provider';
