'use client';

import { ErrorInfo, ReactNode, Component } from 'react';
import { Alert, Button, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Something went wrong"
          color="red"
          variant="light"
        >
          <Text size="sm" mb="sm">
            Unable to load this component
          </Text>
          <Button
            leftSection={<IconRefresh size={14} />}
            onClick={this.handleRetry}
            variant="light"
            size="xs"
          >
            Try Again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
