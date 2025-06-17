'use client';

import { useObservability } from '@repo/observability/client/next';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function PerformanceMonitor() {
  const { manager } = useObservability();
  const pathname = usePathname();

  useEffect(() => {
    if (!manager || !manager.startTransaction) return;

    // Start a navigation transaction
    const transaction = manager.startTransaction('navigation', {
      name: pathname,
      op: 'navigation',
      tags: {
        'route.path': pathname,
      },
    });

    // Mark when the component mounts (page becomes interactive)
    transaction?.setMeasurement('time_to_interactive', performance.now());

    return () => {
      // Finish the transaction when the component unmounts
      transaction?.finish();
    };
  }, [pathname, manager]);

  return null;
}

// Hook for tracking specific user interactions
export function usePerformanceTracking(operationName: string) {
  const { manager, captureException } = useObservability();

  const trackOperation = async <T,>(
    operation: () => Promise<T> | T,
    options?: {
      description?: string;
      tags?: Record<string, string>;
      data?: Record<string, any>;
    },
  ): Promise<T> => {
    if (!manager || !manager.startTransaction) {
      return operation();
    }

    const transaction = manager.startTransaction('user_interaction', {
      name: operationName,
      op: 'user_interaction',
      description: options?.description,
      tags: options?.tags,
      data: options?.data,
    });

    try {
      const result = await operation();
      transaction?.setStatus('ok');
      return result;
    } catch (error) {
      transaction?.setStatus('internal_error');
      captureException(error as Error, {
        tags: {
          operation: operationName,
          ...options?.tags,
        },
        extra: options?.data,
      });
      throw error;
    } finally {
      transaction?.finish();
    }
  };

  return { trackOperation };
}

// Hook for tracking API calls
export function useApiTracking() {
  const { manager, captureException } = useObservability();

  const trackApiCall = async <T,>(
    apiCall: () => Promise<T>,
    options: {
      endpoint: string;
      method: string;
      tags?: Record<string, string>;
    },
  ): Promise<T> => {
    if (!manager || !manager.startSpan) {
      return apiCall();
    }

    const span = manager.startSpan('http.client', {
      description: `${options.method} ${options.endpoint}`,
      tags: {
        'http.method': options.method,
        'http.url': options.endpoint,
        ...options.tags,
      },
    });

    try {
      const result = await apiCall();
      span?.setStatus('ok');
      return result;
    } catch (error) {
      span?.setStatus('internal_error');
      captureException(error as Error, {
        tags: {
          endpoint: options.endpoint,
          method: options.method,
          ...options.tags,
        },
      });
      throw error;
    } finally {
      span?.finish();
    }
  };

  return { trackApiCall };
}
