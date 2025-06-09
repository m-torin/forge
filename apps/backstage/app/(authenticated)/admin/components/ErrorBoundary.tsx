'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Collapse,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBug,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconExternalLink,
  IconRefresh,
} from '@tabler/icons-react';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  context?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  error: Error | null;
  errorId: string;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
  retryCount: number;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      errorId: '',
      errorInfo: null,
      hasError: false,
      retryCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { context, onError } = this.props;

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Report error to monitoring service
    this.reportError(error, errorInfo, context);

    // Show notification
    notifications.show({
      autoClose: false,
      color: 'red',
      message: 'An unexpected error occurred. Please try refreshing the page.',
      title: 'Application Error',
    });
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, context?: string) => {
    try {
      // In a real application, send to error tracking service (Sentry, etc.)
      const errorReport = {
        url: window.location.href,
        componentStack: errorInfo.componentStack,
        context,
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };

      // Log to console for now (replace with actual error service)
      console.error('Error Report:', errorReport);

      // Store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('error-reports') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('error-reports', JSON.stringify(existingErrors));
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        error: null,
        errorInfo: null,
        hasError: false,
        retryCount: retryCount + 1,
      });

      notifications.show({
        color: 'blue',
        message: `Attempt ${retryCount + 1} of ${this.maxRetries}`,
        title: 'Retrying...',
      });
    } else {
      notifications.show({
        color: 'red',
        message: 'Please refresh the page manually',
        title: 'Max Retries Reached',
      });
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private copyErrorToClipboard = () => {
    const { error, errorId, errorInfo } = this.state;
    const errorText = `
Error ID: ${errorId}
Message: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      notifications.show({
        color: 'green',
        message: 'Error details copied to clipboard',
        title: 'Copied',
      });
    });
  };

  private getErrorSeverity = (error: Error): 'low' | 'medium' | 'high' => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    if (message.includes('security') || message.includes('authorization')) {
      return 'high';
    }
    if (message.includes('chunk') || message.includes('loading')) {
      return 'low';
    }

    return 'medium';
  };

  private getSuggestions = (error: Error): string[] => {
    const message = error.message.toLowerCase();
    const suggestions: string[] = [];

    if (message.includes('network') || message.includes('fetch')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Verify the server is running');
    }

    if (message.includes('chunk') || message.includes('loading')) {
      suggestions.push('Clear your browser cache');
      suggestions.push('Refresh the page');
      suggestions.push('Try opening in an incognito window');
    }

    if (message.includes('memory') || message.includes('heap')) {
      suggestions.push('Close other browser tabs');
      suggestions.push('Restart your browser');
      suggestions.push('Try with a smaller dataset');
    }

    if (suggestions.length === 0) {
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear browser cache and cookies');
      suggestions.push('Contact support if the issue persists');
    }

    return suggestions;
  };

  render() {
    const { error, errorId, errorInfo, hasError, retryCount, showDetails } = this.state;
    const { children, context, fallback, showDetails: showDetailsProp = true } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      const severity = this.getErrorSeverity(error);
      const suggestions = this.getSuggestions(error);
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card withBorder style={{ maxWidth: 800, margin: '2rem auto' }} p="lg">
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon
                  color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'yellow'}
                  size="lg"
                  variant="light"
                >
                  <IconAlertTriangle size={24} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text fw={600} size="lg">
                    Something went wrong
                  </Text>
                  <Text c="dimmed" size="sm">
                    {context ? `Error in ${context}` : 'An unexpected error occurred'}
                  </Text>
                </Stack>
              </Group>
              <Badge
                color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'yellow'}
                variant="light"
              >
                {severity} severity
              </Badge>
            </Group>

            {/* Error Message */}
            <Alert
              color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'yellow'}
              icon={<IconBug size={16} />}
            >
              <Text fw={500} mb="xs">
                Error Message:
              </Text>
              <Text size="sm">{error.message}</Text>
            </Alert>

            {/* Error ID */}
            <Paper withBorder p="sm">
              <Group justify="space-between">
                <Text size="sm">
                  <Text component="span" fw={500}>
                    Error ID:
                  </Text>{' '}
                  {errorId}
                </Text>
                <ActionIcon
                  onClick={this.copyErrorToClipboard}
                  size="sm"
                  title="Copy error details"
                  variant="subtle"
                >
                  <IconCopy size={14} />
                </ActionIcon>
              </Group>
            </Paper>

            {/* Suggestions */}
            <Stack gap="xs">
              <Text fw={500} size="sm">
                Try these solutions:
              </Text>
              {suggestions.map((suggestion, index) => (
                <Group key={index} gap="xs">
                  <Text c="dimmed" size="sm">
                    •
                  </Text>
                  <Text size="sm">{suggestion}</Text>
                </Group>
              ))}
            </Stack>

            {/* Actions */}
            <Group gap="sm">
              {canRetry && (
                <Button
                  color="blue"
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRetry}
                >
                  Retry ({this.maxRetries - retryCount} left)
                </Button>
              )}

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleRefresh}
                variant="light"
              >
                Refresh Page
              </Button>

              <Button
                leftSection={<IconExternalLink size={16} />}
                onClick={() => window.open('/admin', '_blank')}
                variant="subtle"
              >
                Open Admin Home
              </Button>
            </Group>

            {/* Technical Details */}
            {showDetailsProp && (
              <>
                <Divider />
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={500} size="sm">
                      Technical Details
                    </Text>
                    <ActionIcon
                      onClick={() => this.setState({ showDetails: !showDetails })}
                      size="sm"
                      variant="subtle"
                    >
                      {showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </ActionIcon>
                  </Group>

                  <Collapse in={showDetails}>
                    <Stack gap="sm">
                      {error.stack && (
                        <Stack gap="xs">
                          <Text fw={500} size="sm">
                            Stack Trace:
                          </Text>
                          <Code
                            block
                            style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}
                          >
                            {error.stack}
                          </Code>
                        </Stack>
                      )}

                      {errorInfo?.componentStack && (
                        <Stack gap="xs">
                          <Text fw={500} size="sm">
                            Component Stack:
                          </Text>
                          <Code
                            block
                            style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}
                          >
                            {errorInfo.componentStack}
                          </Code>
                        </Stack>
                      )}

                      <Stack gap="xs">
                        <Text fw={500} size="sm">
                          Environment:
                        </Text>
                        <Code block style={{ fontSize: '11px' }}>
                          {`URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
Retry Count: ${retryCount}`}
                        </Code>
                      </Stack>
                    </Stack>
                  </Collapse>
                </Stack>
              </>
            )}
          </Stack>
        </Card>
      );
    }

    return children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = (error: Error, context?: string, metadata?: Record<string, any>) => {
    const errorReport = {
      url: window.location.href,
      context,
      errorId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      metadata,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    console.error('Manual Error Report:', errorReport);

    // Store in localStorage
    const existingErrors = JSON.parse(localStorage.getItem('error-reports') || '[]');
    existingErrors.push(errorReport);
    localStorage.setItem('error-reports', JSON.stringify(existingErrors));

    notifications.show({
      color: 'blue',
      message: 'Error has been logged for debugging',
      title: 'Error Reported',
    });
  };

  return { reportError };
}
