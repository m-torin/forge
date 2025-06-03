'use client';

import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { analytics } from '@repo/analytics';

/**
 * Hook for tracking page views with analytics
 */
export function usePageTracking(pageName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    analytics.capture('page_viewed', {
      page: pageName,
      title: pageName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      ...metadata,
    });
  }, [pageName, metadata]);
}

/**
 * Hook for handling async auth operations with consistent error handling
 */
export function useAsyncAuth<T extends (...args: any[]) => Promise<any>>(
  authFn: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  },
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authFn(...args);

      if (options?.successMessage) {
        notifications.show({
          color: 'green',
          icon: <IconCheck size={16} />,
          message: options.successMessage,
          title: 'Success',
        });
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred');
      setError(err);

      const message = options?.errorMessage || err.message;
      notifications.show({
        color: 'red',
        icon: <IconX size={16} />,
        message,
        title: 'Error',
      });

      options?.onError?.(err);
      console.error('Auth operation failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    error,
    execute,
    isLoading,
  };
}

/**
 * Hook for session checking with redirect
 */
export function useRequireAuth(redirectTo = '/sign-in') {
  useEffect(() => {
    // This would be implemented with actual session checking
    // For now it's a placeholder
  }, [redirectTo]);
}
