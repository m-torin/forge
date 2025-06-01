import { useCallback, useState } from 'react';

import { AnalyticsService } from '../services/analyticsService';

export interface AppError {
  context?: Record<string, any>;
  id: string;
  message: string;
  retryable?: boolean;
  timestamp: Date;
  title: string;
  type: 'network' | 'permission' | 'validation' | 'api' | 'unknown';
}

export const useErrorHandling = () => {
  const [errors, setErrors] = useState<AppError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const appError: AppError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setErrors(prev => [...prev, appError]);

    // Track error with analytics
    AnalyticsService.trackError(new Error(error.message), {
      context: error.context,
      errorType: error.type,
      retryable: error.retryable,
      title: error.title,
      userFacing: true,
    });

    return appError.id;
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleNetworkError = useCallback((context?: Record<string, any>) => {
    return addError({
      type: 'network',
      context,
      message: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true,
      title: 'Connection Problem',
    });
  }, [addError]);

  const handlePermissionError = useCallback((permission: string, context?: Record<string, any>) => {
    return addError({
      type: 'permission',
      context: { permission, ...context },
      message: `This app needs ${permission} permission to function properly.`,
      retryable: true,
      title: 'Permission Required',
    });
  }, [addError]);

  const handleValidationError = useCallback((field: string, context?: Record<string, any>) => {
    return addError({
      type: 'validation',
      context: { field, ...context },
      message: `Please check the ${field} field and try again.`,
      retryable: false,
      title: 'Invalid Input',
    });
  }, [addError]);

  const handleApiError = useCallback((endpoint: string, status?: number, context?: Record<string, any>) => {
    return addError({
      type: 'api',
      context: { endpoint, status, ...context },
      message: status 
        ? `Server error (${status}). Please try again in a moment.`
        : 'Unable to complete the request. Please try again.',
      retryable: true,
      title: 'Service Error',
    });
  }, [addError]);

  const handleUnknownError = useCallback((error: Error, context?: Record<string, any>) => {
    return addError({
      type: 'unknown',
      context: { 
        originalMessage: error.message,
        stack: error.stack,
        ...context 
      },
      message: 'Something went wrong. Please try again.',
      retryable: true,
      title: 'Unexpected Error',
    });
  }, [addError]);

  // Helper function to execute async operations with error handling
  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      const result = await operation();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          handleNetworkError(context);
        } else if (error.message.includes('permission')) {
          handlePermissionError('camera', context);
        } else if (error.message.includes('validation')) {
          handleValidationError('input', context);
        } else {
          handleUnknownError(error, context);
        }
      } else {
        handleUnknownError(new Error('Unknown error occurred'), context);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleNetworkError, handlePermissionError, handleValidationError, handleUnknownError]);

  return {
    handleValidationError,
    addError,
    clearErrors,
    errors,
    handleApiError,
    handleNetworkError,
    handlePermissionError,
    handleUnknownError,
    isLoading,
    removeError,
    withErrorHandling,
  };
};