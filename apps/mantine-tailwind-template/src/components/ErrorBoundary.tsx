'use client';

import { Alert, Button, Card, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] items-center justify-center p-4">
          <Card withBorder shadow="sm" className="max-w-md">
            <Stack gap="md" align="center">
              <IconAlertTriangle size={48} className="text-red-500" />
              <div className="text-center">
                <Text size="lg" fw={600} mb="xs">
                  Something went wrong
                </Text>
                <Text size="sm" className="harmony-text-muted">
                  An unexpected error occurred. Please try refreshing the page.
                </Text>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert color="red" variant="light" className="w-full">
                  <Text size="xs" ff="monospace">
                    {this.state.error.message}
                  </Text>
                </Alert>
              )}

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleReset}
                variant="outline"
              >
                Try Again
              </Button>
            </Stack>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
