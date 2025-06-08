'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { notifications } from '@mantine/notifications';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Alert,
  Code,
  Badge,
  ActionIcon,
  Divider,
  Progress,
  Card,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconRefresh,
  IconWifi,
  IconWifiOff,
  IconBug,
  IconCopy,
  IconExternalLink,
} from '@tabler/icons-react';

interface ErrorDetails {
  id: string;
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  type: 'network' | 'api' | 'validation' | 'permission' | 'unknown';
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

interface ErrorContextType {
  reportError: (error: Error, context?: string, options?: ErrorOptions) => void;
  retryLastOperation: () => Promise<void>;
  clearErrors: () => void;
  isOnline: boolean;
  connectionQuality: 'good' | 'poor' | 'offline';
}

interface ErrorOptions {
  retryable?: boolean;
  maxRetries?: number;
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
  
  const [errorModalOpened, { open: openErrorModal, close: closeErrorModal }] = useDisclosure(false);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
      notifications.show({
        title: 'Connection Restored',
        message: 'Your internet connection has been restored',
        color: 'green',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      notifications.show({
        title: 'Connection Lost',
        message: 'You are currently offline. Some features may not work.',
        color: 'red',
        autoClose: false,
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
          method: 'HEAD',
          cache: 'no-cache',
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
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('permission')) {
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
      return !message.includes('400') && !message.includes('401') && 
             !message.includes('403') && !message.includes('404');
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
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      type,
      retryable,
      retryCount: 0,
      maxRetries: options.maxRetries || (retryable ? 3 : 0),
    };

    setErrors(prev => [...prev, errorDetails]);

    // Show notification unless silent
    if (!options.silent) {
      const severity = type === 'network' ? 'warning' : 'error';
      notifications.show({
        title: 'Error Occurred',
        message: errorDetails.message,
        color: severity === 'error' ? 'red' : 'orange',
        autoClose: severity === 'error' ? false : 5000,
        onClick: () => {
          setCurrentError(errorDetails);
          openErrorModal();
        },
      });
    }

    // Auto-retry for retryable errors
    if (retryable && errorDetails.retryCount < errorDetails.maxRetries) {
      setTimeout(() => {
        attemptRetry(errorDetails);
      }, Math.pow(2, errorDetails.retryCount) * 1000); // Exponential backoff
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
      setErrors(prev => prev.filter(e => e.id !== errorDetails.id));
      notifications.show({
        title: 'Operation Successful',
        message: 'The operation completed successfully after retry',
        color: 'green',
      });
    } catch (error) {
      // Update retry count
      setErrors(prev => prev.map(e => 
        e.id === errorDetails.id 
          ? { ...e, retryCount: e.retryCount + 1 }
          : e
      ));
      
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
        title: 'No Operation to Retry',
        message: 'There is no previous operation to retry',
        color: 'yellow',
      });
      return;
    }

    setRetryInProgress(true);
    
    try {
      await lastOperation();
      notifications.show({
        title: 'Operation Successful',
        message: 'The operation completed successfully',
        color: 'green',
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
      title: 'Errors Cleared',
      message: 'All error records have been cleared',
      color: 'blue',
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
        title: 'Copied',
        message: 'Error details copied to clipboard',
        color: 'green',
      });
    });
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'good':
        return <IconWifi size={16} color="green" />;
      case 'poor':
        return <IconWifi size={16} color="orange" />;
      case 'offline':
        return <IconWifiOff size={16} color="red" />;
    }
  };

  const getRetryProgress = (error: ErrorDetails) => {
    if (error.maxRetries === 0) return 0;
    return (error.retryCount / error.maxRetries) * 100;
  };

  return (
    <ErrorContext.Provider value={{
      reportError,
      retryLastOperation,
      clearErrors,
      isOnline,
      connectionQuality,
    }}>
      {children}

      {/* Connection Status Indicator */}
      <Card 
        style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000,
          minWidth: 200,
        }}
        withBorder
        p="sm"
      >
        <Group gap="xs">
          {getConnectionIcon()}
          <Stack gap={0}>
            <Text size="sm" fw={500}>
              Connection: {connectionQuality}
            </Text>
            {errors.length > 0 && (
              <Badge size="xs" color="red" variant="filled">
                {errors.length} errors
              </Badge>
            )}
          </Stack>
          
          {errors.length > 0 && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                setCurrentError(errors[errors.length - 1]);
                openErrorModal();
              }}
            >
              <IconBug size={14} />
            </ActionIcon>
          )}
        </Group>
      </Card>

      {/* Error Details Modal */}
      <Modal
        opened={errorModalOpened}
        onClose={closeErrorModal}
        title="Error Details"
        size="lg"
      >
        {currentError && (
          <Stack gap="md">
            <Group justify="space-between">
              <Badge color={
                currentError.type === 'network' ? 'orange' :
                currentError.type === 'permission' ? 'red' :
                currentError.type === 'validation' ? 'yellow' : 'red'
              }>
                {currentError.type.toUpperCase()}
              </Badge>
              <ActionIcon
                variant="subtle"
                onClick={() => copyErrorToClipboard(currentError)}
                title="Copy error details"
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Group>

            <Alert 
              color={currentError.type === 'network' ? 'orange' : 'red'}
              icon={<IconAlertTriangle size={16} />}
            >
              <Text fw={500} mb="xs">Error Message:</Text>
              <Text size="sm">{currentError.message}</Text>
            </Alert>

            {currentError.context && (
              <Stack gap="xs">
                <Text fw={500} size="sm">Context:</Text>
                <Code block>{currentError.context}</Code>
              </Stack>
            )}

            {currentError.retryable && (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={500} size="sm">Retry Progress:</Text>
                  <Text size="sm" c="dimmed">
                    {currentError.retryCount}/{currentError.maxRetries}
                  </Text>
                </Group>
                <Progress value={getRetryProgress(currentError)} color="blue" />
              </Stack>
            )}

            <Stack gap="xs">
              <Text fw={500} size="sm">Technical Details:</Text>
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
                    variant="light"
                    leftSection={<IconRefresh size={14} />}
                    onClick={retryLastOperation}
                    loading={retryInProgress}
                  >
                    Retry Operation
                  </Button>
                )}
                
                <Button
                  variant="light"
                  leftSection={<IconExternalLink size={14} />}
                  onClick={() => window.open('/admin', '_blank')}
                >
                  Open New Tab
                </Button>
              </Group>

              <Button onClick={closeErrorModal}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </ErrorContext.Provider>
  );
}