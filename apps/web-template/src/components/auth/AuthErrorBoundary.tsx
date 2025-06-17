'use client';

import React from 'react';
import { Button, Container, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

export class AuthErrorBoundary extends React.Component<
  AuthErrorBoundaryProps,
  AuthErrorBoundaryState
> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('Auth Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            reset={this.handleReset}
          />
        );
      }

      return (
        <Container size="sm" className="py-8">
          <div className="text-center">
            <IconAlertTriangle 
              size={48} 
              className="mx-auto mb-4 text-yellow-500"
            />
            <Title order={2} className="mb-2">
              Authentication Error
            </Title>
            <Text color="dimmed" className="mb-4">
              Something went wrong with authentication. Please try again.
            </Text>
            <Text size="sm" color="dimmed" className="mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button onClick={this.handleReset}>
              Try Again
            </Button>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Hook for using error boundary functionality
export function useAuthErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
}