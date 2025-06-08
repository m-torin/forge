'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Alert,
  Button,
  Card,
  Stack,
  Text,
  Group,
  Code,
  Collapse,
  ActionIcon,
  Paper,
  ThemeIcon,
  Badge,
  Divider,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconRefresh,
  IconBug,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context } = this.props;
    
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
      title: 'Application Error',
      message: 'An unexpected error occurred. Please try refreshing the page.',
      color: 'red',
      autoClose: false,
    });
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, context?: string) => {
    try {
      // In a real application, send to error tracking service (Sentry, etc.)
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId,
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
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
      });

      notifications.show({
        title: 'Retrying...',
        message: `Attempt ${retryCount + 1} of ${this.maxRetries}`,
        color: 'blue',
      });
    } else {
      notifications.show({
        title: 'Max Retries Reached',
        message: 'Please refresh the page manually',
        color: 'red',
      });
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private copyErrorToClipboard = () => {
    const { error, errorInfo, errorId } = this.state;
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
        title: 'Copied',
        message: 'Error details copied to clipboard',
        color: 'green',
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
    const { hasError, error, errorInfo, errorId, showDetails, retryCount } = this.state;
    const { children, fallback, showDetails: showDetailsProp = true, context } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      const severity = this.getErrorSeverity(error);
      const suggestions = this.getSuggestions(error);
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card withBorder p="lg" style={{ maxWidth: 800, margin: '2rem auto' }}>
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon 
                  size="lg" 
                  color={severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'yellow'}
                  variant="light"
                >
                  <IconAlertTriangle size={24} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="lg" fw={600}>Something went wrong</Text>
                  <Text size="sm" c="dimmed">
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
              <Text fw={500} mb="xs">Error Message:</Text>
              <Text size="sm">{error.message}</Text>
            </Alert>

            {/* Error ID */}
            <Paper p="sm" withBorder>
              <Group justify="space-between">
                <Text size="sm">
                  <Text component="span" fw={500}>Error ID:</Text> {errorId}
                </Text>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={this.copyErrorToClipboard}
                  title="Copy error details"
                >
                  <IconCopy size={14} />
                </ActionIcon>
              </Group>
            </Paper>

            {/* Suggestions */}
            <Stack gap="xs">
              <Text fw={500} size="sm">Try these solutions:</Text>
              {suggestions.map((suggestion, index) => (
                <Group key={index} gap="xs">
                  <Text size="sm" c="dimmed">•</Text>
                  <Text size="sm">{suggestion}</Text>
                </Group>
              ))}
            </Stack>

            {/* Actions */}
            <Group gap="sm">
              {canRetry && (
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleRetry}
                  color="blue"
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
                    <Text fw={500} size="sm">Technical Details</Text>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => this.setState({ showDetails: !showDetails })}
                    >
                      {showDetails ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                    </ActionIcon>
                  </Group>
                  
                  <Collapse in={showDetails}>
                    <Stack gap="sm">
                      {error.stack && (
                        <Stack gap="xs">
                          <Text size="sm" fw={500}>Stack Trace:</Text>
                          <Code block style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                            {error.stack}
                          </Code>
                        </Stack>
                      )}
                      
                      {errorInfo?.componentStack && (
                        <Stack gap="xs">
                          <Text size="sm" fw={500}>Component Stack:</Text>
                          <Code block style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                            {errorInfo.componentStack}
                          </Code>
                        </Stack>
                      )}
                      
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>Environment:</Text>
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
  errorBoundaryProps?: Omit<Props, 'children'>
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
      message: error.message,
      stack: error.stack,
      context,
      metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    console.error('Manual Error Report:', errorReport);
    
    // Store in localStorage
    const existingErrors = JSON.parse(localStorage.getItem('error-reports') || '[]');
    existingErrors.push(errorReport);
    localStorage.setItem('error-reports', JSON.stringify(existingErrors));

    notifications.show({
      title: 'Error Reported',
      message: 'Error has been logged for debugging',
      color: 'blue',
    });
  };

  return { reportError };
}