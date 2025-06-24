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
  Code,
  Group,
} from "@mantine/core";
import { IconAlertTriangle, IconRefresh, IconHome } from "@tabler/icons-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component that catches errors in child components
 * and provides a user-friendly error page with recovery options.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  // Add refs property for compatibility
  refs: { [key: string]: React.ReactInstance } = {};

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console in development
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
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
            <Stack align="center" gap="lg" maw={600}>
              <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />

              <Stack align="center" gap="sm">
                <Title order={1} ta="center" c="red">
                  Something went wrong
                </Title>
                <Text ta="center" c="dimmed" size="lg">
                  We encountered an unexpected error. The application is still
                  running, but this component couldn&apos;t load properly.
                </Text>
              </Stack>

              <Alert
                icon={<IconAlertTriangle size={16} />}
                title="Error Details"
                color="red"
                variant="light"
                w="100%"
              >
                <Text size="sm" fw={500} mb="xs">
                  {this.state.error.message || "An unknown error occurred"}
                </Text>

                {this.props.showDetails && this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm mb-2 font-medium">
                      Technical Details (for developers)
                    </summary>
                    <Code block className="text-xs overflow-auto max-h-40">
                      {this.state.error.stack}
                    </Code>
                  </details>
                )}
              </Alert>

              <Group gap="md">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.reset}
                  variant="filled"
                  size="md"
                >
                  Try again
                </Button>

                <Button
                  leftSection={<IconHome size={16} />}
                  onClick={() => (window.location.href = "/")}
                  variant="outline"
                  size="md"
                >
                  Go home
                </Button>
              </Group>

              <Text size="xs" c="dimmed" ta="center">
                If this problem persists, please refresh the page or contact
                support.
              </Text>
            </Stack>
          </Center>
        </Container>
      );
    }

    return this.props.children;
  }
}
