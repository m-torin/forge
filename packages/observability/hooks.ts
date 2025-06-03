import { captureException, captureMessage } from '@sentry/nextjs';
import { useCallback } from 'react';

import { log } from './log';

/**
 * Custom observability hooks for workflow and user interaction tracking
 */

export interface ObservabilityEvent {
  action: string;
  category: string;
  label?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  value?: number;
}

export interface ErrorContext {
  component?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  workflow?: string;
}

/**
 * Hook for tracking user interactions and workflow events
 */
export function useObservability() {
  const trackEvent = useCallback((event: ObservabilityEvent) => {
    try {
      log.info('Workflow Event', {
        action: event.action,
        category: event.category,
        label: event.label,
        metadata: event.metadata,
        timestamp: new Date().toISOString(),
        userId: event.userId,
        value: event.value,
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }, []);

  const trackError = useCallback((error: Error | string, context?: ErrorContext) => {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;

      log.error('Workflow Error', {
        component: context?.component,
        error: errorMessage,
        metadata: context?.metadata,
        stack: typeof error === 'string' ? undefined : error.stack,
        timestamp: new Date().toISOString(),
        userId: context?.userId,
        workflow: context?.workflow,
      });

      // Also send to Sentry for error tracking
      if (typeof error === 'string') {
        captureMessage(error, 'error');
      } else {
        captureException(error);
      }
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }
  }, []);

  const trackPerformance = useCallback(
    (operation: string, duration: number, metadata?: Record<string, unknown>) => {
      try {
        log.info('Performance Metric', {
          duration,
          metadata,
          operation,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Failed to track performance:', error);
      }
    },
    [],
  );

  return {
    trackError,
    trackEvent,
    trackPerformance,
  };
}

/**
 * Hook for tracking workflow-specific events
 */
export function useWorkflowObservability(workflowType: string) {
  const { trackError, trackEvent, trackPerformance } = useObservability();

  const trackWorkflowEvent = useCallback(
    (action: string, metadata?: Record<string, unknown>) => {
      trackEvent({
        action,
        category: 'workflow',
        label: workflowType,
        metadata: {
          workflowType,
          ...metadata,
        },
      });
    },
    [trackEvent, workflowType],
  );

  const trackWorkflowError = useCallback(
    (error: Error | string, metadata?: Record<string, unknown>) => {
      trackError(error, {
        metadata: {
          workflowType,
          ...metadata,
        },
        workflow: workflowType,
      });
    },
    [trackError, workflowType],
  );

  const trackWorkflowPerformance = useCallback(
    (operation: string, duration: number, metadata?: Record<string, unknown>) => {
      trackPerformance(`${workflowType}.${operation}`, duration, {
        workflowType,
        ...metadata,
      });
    },
    [trackPerformance, workflowType],
  );

  return {
    trackWorkflowError,
    trackWorkflowEvent,
    trackWorkflowPerformance,
  };
}

/**
 * Hook for timing operations with automatic performance tracking
 */
export function usePerformanceTimer() {
  const { trackPerformance } = useObservability();

  const time = useCallback(
    <T>(
      operation: string,
      fn: () => Promise<T>,
      metadata?: Record<string, unknown>,
    ): Promise<T> => {
      const start = performance.now();

      return fn()
        .then((result) => {
          const duration = performance.now() - start;
          trackPerformance(operation, duration, metadata);
          return result;
        })
        .catch((error) => {
          const duration = performance.now() - start;
          trackPerformance(operation, duration, { ...metadata, failed: true });
          throw error;
        });
    },
    [trackPerformance],
  );

  return { time };
}
