'use client';

import { Alert, Button, Container, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }

      return <ErrorFallback error={this.state.error!} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function ErrorFallback({ error, reset }: ErrorFallbackProps): React.ReactElement {
  React.useEffect(() => {
    // Log error to console
    console.error('Error caught by error boundary:', error);
    // TODO: Add direct Sentry error capture here if needed
  }, [error]);

  return (
    <Container size="sm" py="xl">
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Something went wrong"
        color="red"
        variant="light"
      >
        <Stack gap="md">
          <Text c="dimmed" size="sm">
            An unexpected error occurred while rendering this page.
          </Text>
          {process.env.NODE_ENV === 'development' && (
            <Text size="xs" style={{ fontFamily: 'monospace' }}>
              {error.message}
            </Text>
          )}
          <Button onClick={reset} size="sm" variant="subtle">
            Try again
          </Button>
        </Stack>
      </Alert>
    </Container>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, reset: () => void) => ReactNode,
): React.ComponentType<P> {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WithErrorBoundaryComponent;
}
