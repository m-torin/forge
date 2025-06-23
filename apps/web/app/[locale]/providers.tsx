"use client";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@repo/auth/client/next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import theme from "../theme";

interface ProvidersProps {
  children: React.ReactNode;
  "data-testid"?: string;
}

/**
 * Providers component that wraps the application with necessary providers
 *
 * This component centralizes all the context providers needed for the app,
 * including authentication, UI providers, and notifications. The AuthProvider
 * gives all pages access to auth context without requiring authentication by default.
 *
 * Error boundaries are included to catch provider initialization failures.
 */
export function Providers({
  children,
  "data-testid": testId = "providers",
}: ProvidersProps): React.JSX.Element {
  return (
    <div data-testid={testId}>
      <ErrorBoundary>
        <AuthProvider>
          <MantineProvider theme={theme}>
            <Notifications position="top-right" />
            <ErrorBoundary>{children}</ErrorBoundary>
          </MantineProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}
