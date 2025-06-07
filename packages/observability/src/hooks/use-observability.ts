/**
 * React hooks for observability
 * Migrated and improved from the original observability package
 */

import { createContext, useCallback, useContext, useEffect, useRef } from 'react';

import type {
  ObservabilityContext as ObsContext,
  ObservabilityManager,
} from '../shared/types/types';

// Context for observability manager
export const ObservabilityContext = createContext<ObservabilityManager | null>(null);

/**
 * Hook to access the observability manager
 */
export function useObservabilityManager(): ObservabilityManager | null {
  return useContext(ObservabilityContext);
}

/**
 * Event tracking interface
 */
export interface ObservabilityEvent {
  action: string;
  category: string;
  label?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  value?: number;
}

/**
 * Error context interface
 */
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
  const manager = useObservabilityManager();

  const trackEvent = useCallback(
    (event: ObservabilityEvent) => {
      if (!manager) return;

      try {
        // Log the event
        manager.log('info', 'Workflow Event', {
          action: event.action,
          category: event.category,
          label: event.label,
          metadata: event.metadata,
          timestamp: new Date().toISOString(),
          userId: event.userId,
          value: event.value,
        });

        // Add breadcrumb for debugging
        manager.addBreadcrumb({
          category: event.category,
          data: {
            label: event.label,
            value: event.value,
            ...event.metadata,
          },
          level: 'info',
          message: event.action,
        });
      } catch (error) {
        console.error('Failed to track event:', error);
      }
    },
    [manager],
  );

  const trackError = useCallback(
    (error: Error | string, context?: ErrorContext) => {
      if (!manager) return;

      try {
        const errorMessage = typeof error === 'string' ? error : error.message;
        const errorObject = typeof error === 'string' ? new Error(error) : error;

        // Log the error
        manager.log('error', 'Workflow Error', {
          component: context?.component,
          error: errorMessage,
          metadata: context?.metadata,
          stack: errorObject.stack,
          timestamp: new Date().toISOString(),
          userId: context?.userId,
          workflow: context?.workflow,
        });

        // Capture the exception
        const obsContext: ObsContext = {
          extra: context?.metadata,
          tags: {
            component: context?.component || 'unknown',
            workflow: context?.workflow || 'unknown',
          },
          userId: context?.userId,
        };

        manager.captureException(errorObject, obsContext);
      } catch (trackingError) {
        console.error('Failed to track error:', trackingError);
      }
    },
    [manager],
  );

  const trackPerformance = useCallback(
    (operation: string, duration: number, metadata?: Record<string, unknown>) => {
      if (!manager) return;

      try {
        manager.log('info', 'Performance Metric', {
          duration,
          metadata,
          operation,
          timestamp: new Date().toISOString(),
        });

        // Add performance breadcrumb
        manager.addBreadcrumb({
          category: 'performance',
          data: {
            duration,
            ...metadata,
          },
          level: 'info',
          message: `${operation} completed in ${duration}ms`,
        });
      } catch (error) {
        console.error('Failed to track performance:', error);
      }
    },
    [manager],
  );

  // Direct access methods for compatibility with tests
  const log = useCallback(
    (level: string, message: string, metadata?: any) => {
      return manager?.log(level, message, metadata);
    },
    [manager],
  );

  const captureException = useCallback(
    (error: Error, context?: ObsContext) => {
      return manager?.captureException(error, context);
    },
    [manager],
  );

  const identify = useCallback(
    (userId: string, traits?: any) => {
      if (!manager) return;
      manager.setUser({ id: userId, ...traits });
    },
    [manager],
  );

  const setContext = useCallback(
    (context: Record<string, any>) => {
      if (!manager) return;
      for (const [key, value] of Object.entries(context)) {
        manager.setContext(key, value);
      }
    },
    [manager],
  );

  const debug = useCallback(
    (message: string, metadata?: any) => {
      return log('debug', message, metadata);
    },
    [log],
  );

  // Throw error if used outside provider
  if (manager === null) {
    throw new Error('useObservability must be used within an ObservabilityProvider');
  }

  return {
    identify,
    captureException,
    debug,
    // Direct manager method access
    log,
    manager, // Expose manager for direct access
    setContext,
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
  const { manager, trackPerformance } = useObservability();
  const transactions = useRef<Map<string, any>>(new Map());

  const startTimer = useCallback(
    (operation: string, metadata?: Record<string, unknown>) => {
      if (!manager) return null;

      const transaction = manager.startTransaction(operation, {
        tags: metadata as any,
      });

      if (transaction) {
        transactions.current.set(operation, {
          startTime: performance.now(),
          transaction,
        });
      }

      return transaction;
    },
    [manager],
  );

  const endTimer = useCallback(
    (operation: string, metadata?: Record<string, unknown>) => {
      const entry = transactions.current.get(operation);
      if (!entry) return;

      const duration = performance.now() - entry.startTime;

      // End the transaction
      if (entry.transaction?.finish) {
        entry.transaction.finish();
      }

      // Track the performance
      trackPerformance(operation, duration, metadata);

      // Clean up
      transactions.current.delete(operation);

      return duration;
    },
    [trackPerformance],
  );

  const time = useCallback(
    async <T>(
      operation: string,
      fn: () => Promise<T>,
      metadata?: Record<string, unknown>,
    ): Promise<T> => {
      const _transaction = startTimer(operation, metadata);

      try {
        const result = await fn();
        endTimer(operation, { ...metadata, status: 'success' });
        return result;
      } catch (error) {
        endTimer(operation, { ...metadata, error: String(error), status: 'error' });
        throw error;
      }
    },
    [startTimer, endTimer],
  );

  // Clean up any lingering transactions on unmount
  useEffect(() => {
    return () => {
      transactions.current.forEach((entry, _operation) => {
        if (entry.transaction?.finish) {
          entry.transaction.finish();
        }
      });
      transactions.current.clear();
    };
  }, []);

  return { endTimer, startTimer, time };
}
