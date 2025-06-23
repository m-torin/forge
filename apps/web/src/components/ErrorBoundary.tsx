"use client";

import React from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Alert,
  Center,
} from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches errors in child components
 *
 * This provides a user-friendly error page with recovery options.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} reset={this.reset} />;
      }

      // Default error UI
      return (
        <Container size="sm" py="xl">
          <Center>
            <Stack align="center" gap="lg" maw={500}>
              <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />

              <Stack align="center" gap="sm">
                <Title order={1} ta="center" c="red">
                  Something went wrong
                </Title>
                <Text ta="center" c="dimmed">
                  We encountered an unexpected error. Please try refreshing the
                  page.
                </Text>
              </Stack>

              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Error Details"
                color="red"
                variant="light"
                w="100%"
              >
                <Text size="sm" ff="monospace">
                  {this.state.error.message || "An unknown error occurred"}
                </Text>
                {this.state.error.stack &&
                  process.env.NODE_ENV === "development" && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">
                        Stack trace
                      </summary>
                      <pre className="text-xs mt-2 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
              </Alert>

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.reset}
                variant="filled"
                size="md"
              >
                Try again
              </Button>
            </Stack>
          </Center>
        </Container>
      );
    }

    return this.props.children;
  }
}
