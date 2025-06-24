"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@repo/auth/client/next";
import { ErrorBoundary } from "./ErrorBoundary";
import { EnvironmentError } from "./EnvironmentError";
import theme from "../app/theme";

interface AppProvidersProps {
  children: React.ReactNode;
  envError: string | null;
}

/**
 * App providers component that wraps the application with necessary providers
 * and error boundaries to prevent white screens.
 *
 * This component:
 * - Shows environment errors gracefully instead of crashing
 * - Provides Mantine UI context
 * - Includes notification system
 * - Wraps everything in error boundaries
 */
export function AppProviders({
  children,
  envError,
}: AppProvidersProps): React.JSX.Element {
  // If there's an environment error, show it instead of the app
  if (envError) {
    return (
      <MantineProvider theme={theme}>
        <EnvironmentError error={envError} showDetails />
      </MantineProvider>
    );
  }

  return (
    <ErrorBoundary
      showDetails={process.env.NEXT_PUBLIC_NODE_ENV === "development"}
    >
      <MantineProvider theme={theme}>
        <AuthProvider>
          <Notifications position="top-right" zIndex={1000} limit={5} />
          <ErrorBoundary>{children}</ErrorBoundary>
        </AuthProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}
