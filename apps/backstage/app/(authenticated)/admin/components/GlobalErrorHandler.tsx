'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Group,
  Modal,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBug,
  IconCopy,
  IconExternalLink,
  IconRefresh,
  IconWifi,
  IconWifiOff,
} from '@tabler/icons-react';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface ErrorDetails {
  context?: string;
  id: string;
  maxRetries: number;
  message: string;
  retryable: boolean;
  retryCount: number;
  stack?: string;
  timestamp: string;
  type: 'network' | 'api' | 'validation' | 'permission' | 'unknown';
}

interface ErrorContextType {
  clearErrors: () => void;
  connectionQuality: 'good' | 'poor' | 'offline';
  isOnline: boolean;
  reportError: (error: Error, context?: string, options?: ErrorOptions) => void;
  retryLastOperation: () => Promise<void>;
}

interface ErrorOptions {
  maxRetries?: number;
  retryable?: boolean;
  silent?: boolean;
  type?: ErrorDetails['type'];
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export function useErrorHandler() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
}

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);
  const [currentError, setCurrentError] = useState<ErrorDetails | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');
  const [lastOperation, setLastOperation] = useState<(() => Promise<void>) | null>(null);
  const [retryInProgress, setRetryInProgress] = useState(false);

  const [errorModalOpened, { close: closeErrorModal, open: openErrorModal }] = useDisclosure(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
      notifications.show({
        color: 'green',
        message: 'Your internet connection has been restored',
        title: 'Connection Restored',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      notifications.show({
        autoClose: false,
        color: 'red',
        message: 'You are currently offline. Some features may not work.',
        title: 'Connection Lost',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor connection quality
  useEffect(() => {
    const checkConnectionQuality = async () => {
      if (!isOnline) {
        setConnectionQuality('offline');
        return;
      }

      try {
        const start = Date.now();
        const response = await fetch('/api/health', {
          cache: 'no-cache',
          method: 'HEAD',
        });
        const end = Date.now();
        const latency = end - start;

        if (response.ok) {
          setConnectionQuality(latency < 1000 ? 'good' : 'poor');
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        setConnectionQuality('poor');
      }
    };

    const interval = setInterval(checkConnectionQuality, 30000); // Check every 30 seconds
    checkConnectionQuality(); // Initial check

    return () => clearInterval(interval);
  }, [isOnline]);

  const categorizeError = (error: Error): ErrorDetails['type'] => {
    const message = error.message.toLowerCase();

    if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
      return 'network';
    }
    if (
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('permission')
    ) {
      return 'permission';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('api') || message.includes('server')) {
      return 'api';
    }

    return 'unknown';
  };

  const isRetryable = (error: Error, type: ErrorDetails['type']): boolean => {
    // Network errors are usually retryable
    if (type === 'network') return true;

    // API errors might be retryable (except 4xx client errors)
    if (type === 'api') {
      const message = error.message.toLowerCase();
      return (
        !message.includes('400') &&
        !message.includes('401') &&
        !message.includes('403') &&
        !message.includes('404')
      );
    }

    // Permission and validation errors are usually not retryable
    if (type === 'permission' || type === 'validation') return false;

    // Unknown errors get one retry attempt
    return true;
  };

  const reportError = (error: Error, context?: string, options: ErrorOptions = {}) => {
    const type = options.type || categorizeError(error);
    const retryable = options.retryable ?? isRetryable(error, type);

    const errorDetails: ErrorDetails = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      context,
      maxRetries: options.maxRetries || (retryable ? 3 : 0),
      message: error.message,
      retryable,
      retryCount: 0,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    setErrors((prev) => [...prev, errorDetails]);

    // Show notification unless silent
    if (!options.silent) {
      const severity = type === 'network' ? 'warning' : 'error';
      notifications.show({
        autoClose: severity === 'error' ? false : 5000,
        color: severity === 'error' ? 'red' : 'orange',
        message: errorDetails.message,
        onClick: () => {
          setCurrentError(errorDetails);
          openErrorModal();
        },
        title: 'Error Occurred',
      });
    }

    // Auto-retry for retryable errors
    if (retryable && errorDetails.retryCount < errorDetails.maxRetries) {
      setTimeout(
        () => {
          attemptRetry(errorDetails);
        },
        Math.pow(2, errorDetails.retryCount) * 1000,
      ); // Exponential backoff
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('admin-errors') || '[]');
      existingErrors.push(errorDetails);
      // Keep only last 50 errors
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      localStorage.setItem('admin-errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.error('Failed to store error details:', e);
    }
  };

  const attemptRetry = async (errorDetails: ErrorDetails) => {
    if (!lastOperation || errorDetails.retryCount >= errorDetails.maxRetries) {
      return;
    }

    setRetryInProgress(true);

    try {
      await lastOperation();

      // Success - remove error
      setErrors((prev) => prev.filter((e) => e.id !== errorDetails.id));
      notifications.show({
        color: 'green',
        message: 'The operation completed successfully after retry',
        title: 'Operation Successful',
      });
    } catch (error) {
      // Update retry count
      setErrors((prev) =>
        prev.map((e) => (e.id === errorDetails.id ? { ...e, retryCount: e.retryCount + 1 } : e)),
      );

      // Report the retry failure
      if (error instanceof Error) {
        reportError(error, `Retry attempt ${errorDetails.retryCount + 1}`, { silent: true });
      }
    } finally {
      setRetryInProgress(false);
    }
  };

  const retryLastOperation = async () => {
    if (!lastOperation) {
      notifications.show({
        color: 'yellow',
        message: 'There is no previous operation to retry',
        title: 'No Operation to Retry',
      });
      return;
    }

    setRetryInProgress(true);

    try {
      await lastOperation();
      notifications.show({
        color: 'green',
        message: 'The operation completed successfully',
        title: 'Operation Successful',
      });
    } catch (error) {
      if (error instanceof Error) {
        reportError(error, 'Manual retry');
      }
    } finally {
      setRetryInProgress(false);
    }
  };

  const clearErrors = () => {
    setErrors([]);
    setCurrentError(null);
    localStorage.removeItem('admin-errors');
    notifications.show({
      color: 'blue',
      message: 'All error records have been cleared',
      title: 'Errors Cleared',
    });
  };

  const copyErrorToClipboard = (error: ErrorDetails) => {
    const errorText = `
Error ID: ${error.id}
Type: ${error.type}
Message: ${error.message}
Context: ${error.context || 'N/A'}
Timestamp: ${error.timestamp}
Stack: ${error.stack || 'N/A'}
Retry Count: ${error.retryCount}/${error.maxRetries}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      notifications.show({
        color: 'green',
        message: 'Error details copied to clipboard',
        title: 'Copied',
      });
    });
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <IconWifi color="green" size={16} />;
      case 'poor':
        return <IconWifi color="orange" size={16} />;
      case 'offline':
        return <IconWifiOff color="red" size={16} />;
    }
  };

  const getRetryProgress = (error: ErrorDetails) => {
    if (error.maxRetries === 0) return 0;
    return (error.retryCount / error.maxRetries) * 100;
  };

  return (
    <ErrorContext.Provider
      value={{
        clearErrors,
        connectionQuality,
        isOnline,
        reportError,
        retryLastOperation,
      }}
    >
      {children}

      {/* Connection Status Indicator */}
      <Card
        withBorder
        style={{
          minWidth: 200,
          bottom: 20,
          position: 'fixed',
          right: 20,
          zIndex: 1000,
        }}
        p="sm"
      >
        <Group gap="xs">
          {getConnectionIcon()}
          <Stack gap={0}>
            <Text fw={500} size="sm">
              Connection: {connectionQuality}
            </Text>
            {errors.length > 0 && (
              <Badge color="red" size="xs" variant="filled">
                {errors.length} errors
              </Badge>
            )}
          </Stack>

          {errors.length > 0 && (
            <ActionIcon
              onClick={() => {
                setCurrentError(errors[errors.length - 1]);
                openErrorModal();
              }}
              size="sm"
              variant="subtle"
            >
              <IconBug size={14} />
            </ActionIcon>
          )}
        </Group>
      </Card>

      {/* Error Details Modal */}
      <Modal onClose={closeErrorModal} opened={errorModalOpened} size="lg" title="Error Details">
        {currentError && (
          <Stack gap="md">
            <Group justify="space-between">
              <Badge
                color={
                  currentError.type === 'network'
                    ? 'orange'
                    : currentError.type === 'permission'
                      ? 'red'
                      : currentError.type === 'validation'
                        ? 'yellow'
                        : 'red'
                }
              >
                {currentError.type.toUpperCase()}
              </Badge>
              <ActionIcon
                onClick={() => copyErrorToClipboard(currentError)}
                title="Copy error details"
                variant="subtle"
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Group>

            <Alert
              color={currentError.type === 'network' ? 'orange' : 'red'}
              icon={<IconAlertTriangle size={16} />}
            >
              <Text fw={500} mb="xs">
                Error Message:
              </Text>
              <Text size="sm">{currentError.message}</Text>
            </Alert>

            {currentError.context && (
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Context:
                </Text>
                <Code block>{currentError.context}</Code>
              </Stack>
            )}

            {currentError.retryable && (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500} size="sm">
                    Retry Progress:
                  </Text>
                  <Text c="dimmed" size="sm">
                    {currentError.retryCount}/{currentError.maxRetries}
                  </Text>
                </Group>
                <Progress color="blue" value={getRetryProgress(currentError)} />
              </Stack>
            )}

            <Stack gap="xs">
              <Text fw={500} size="sm">
                Technical Details:
              </Text>
              <Code block style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto' }}>
                {`Error ID: ${currentError.id}
Timestamp: ${new Date(currentError.timestamp).toLocaleString()}
Type: ${currentError.type}
Retryable: ${currentError.retryable}

${currentError.stack || 'No stack trace available'}`}
              </Code>
            </Stack>

            <Divider />

            <Group justify="space-between">
              <Group gap="sm">
                {currentError.retryable && (
                  <Button
                    leftSection={<IconRefresh size={14} />}
                    loading={retryInProgress}
                    onClick={retryLastOperation}
                    variant="light"
                  >
                    Retry Operation
                  </Button>
                )}

                <Button
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => window.open('/admin', '_blank')}
                  variant="light"
                >
                  Open New Tab
                </Button>
              </Group>

              <Button onClick={closeErrorModal}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </ErrorContext.Provider>
  );
}
