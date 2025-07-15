'use client';

/**
 * React hooks for observability
 * React 19 and Next.js 15 optimized for concurrent rendering
 */

import {
  createContext,
  ErrorInfo,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ObservabilityContext as ObsContext, ObservabilityManager } from '../shared/types/types';
import { Environment } from '../shared/utils/environment';

// Sentinel value to detect usage outside provider
const OUTSIDE_PROVIDER = Symbol('outside-provider');

// Context for observability manager
export const ObservabilityContext = createContext<
  null | ObservabilityManager | typeof OUTSIDE_PROVIDER
>(OUTSIDE_PROVIDER);

/**
 * Error context interface
 * Enhanced for React 19 error boundary compatibility
 */
export interface ErrorContext {
  component?: string;
  componentStack?: string;
  errorBoundary?: string;
  // React 19: Error boundary integration
  errorInfo?: ErrorInfo;
  // React 19: Concurrent rendering context
  isPending?: boolean;
  metadata?: Record<string, unknown>;
  userId?: string;
  wasDeferred?: boolean;
  workflow?: string;
}

/**
 * Event tracking interface
 * Enhanced with React 19 concurrent rendering metadata
 */
export interface ObservabilityEvent {
  action: string;
  category: string;
  label?: string;
  metadata?: Record<string, unknown>;
  // React 19: Performance context
  performanceContext?: {
    componentCount?: number;
    renderTime?: number;
    suspenseBoundary?: string;
  };
  // React 19: Concurrent rendering context
  renderingContext?: {
    isPending?: boolean;
    priority?: 'background' | 'normal' | 'user-blocking';
    startTransition?: boolean;
    wasDeferred?: boolean;
  };
  userId?: string;
  value?: number;
}

/**
 * Hook for tracking user interactions and workflow events
 * React 19 optimized with concurrent features and error resilience
 */
export function useObservability() {
  const manager = useContext(ObservabilityContext);
  const [isTracking, setIsTracking] = useState(false);

  // React 19: All hooks must be called before any conditional logic
  // Throw error if used outside provider (sentinel value)
  // Allow null manager (still initializing within provider)
  if (manager === OUTSIDE_PROVIDER) {
    throw new Error('useObservability must be used within an ObservabilityProvider');
  }

  // React 19: Optimize event tracking with concurrent rendering
  const trackEvent = useCallback(
    (event: ObservabilityEvent) => {
      if (!manager || isTracking) return;

      // React 19: Use startTransition for non-blocking state updates
      startTransition(() => {
        setIsTracking(true);
      });

      // React 19: Schedule async work properly using queueMicrotask
      queueMicrotask(async () => {
        try {
          // Log the event
          await manager.log('info', 'Workflow Event', {
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
        } catch (error: any) {
          // React 19: Error boundary friendly error handling
          if (Environment.isDevelopment()) {
            throw new Error(`Failed to track event: ${error}`);
          }
        } finally {
          // Use startTransition for state updates
          startTransition(() => {
            setIsTracking(false);
          });
        }
      });
    },
    [manager, isTracking],
  );

  // React 19: Concurrent error tracking with improved error resilience
  const trackError = useCallback(
    (error: Error | string, context?: ErrorContext) => {
      if (!manager) return;

      // React 19: Handle error tracking with queueMicrotask for proper scheduling
      queueMicrotask(async () => {
        try {
          const errorMessage =
            typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error';
          const errorObject = typeof error === 'string' ? new Error(error) : error;

          // Log the error
          await manager.log('error', 'Workflow Error', {
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

          await manager.captureException(errorObject, obsContext);
        } catch (error: any) {
          // React 19: Improved error boundary compatibility
          if (Environment.isDevelopment()) {
            throw new Error(`Failed to track error: ${error}`);
          }
        }
      });
    },
    [manager],
  );

  // React 19: Performance tracking with concurrent updates
  const trackPerformance = useCallback(
    (operation: string, duration: number, metadata?: Record<string, unknown>) => {
      if (!manager) return;

      // React 19: Handle performance tracking with queueMicrotask for accurate timing
      queueMicrotask(async () => {
        try {
          await manager.log('info', 'Performance Metric', {
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
        } catch (error: any) {
          // React 19: Error boundary friendly error handling
          if (Environment.isDevelopment()) {
            throw new Error(`Failed to track performance: ${error}`);
          }
        }
      });
    },
    [manager],
  );

  // React 19: Memoized direct access methods with optimized performance
  const observabilityMethods = useMemo(() => {
    if (!manager) return null;

    return {
      // Exception capture method with error handling
      captureException: (error: Error, context?: ObsContext) => {
        try {
          if (!error) {
            console.warn('[useObservability] captureException called with null/undefined error');
            return Promise.resolve();
          }
          return manager.captureException(error, context);
        } catch (error: any) {
          throw new Error(`[useObservability] Failed to capture exception: ${error}`);
        }
      },

      // Debug logging method with validation
      debug: (message: string, metadata?: any) => {
        try {
          if (!message || typeof message !== 'string') {
            console.warn('[useObservability] debug called with invalid message');
            return Promise.resolve();
          }
          return manager.log('debug', message, metadata);
        } catch (error: any) {
          throw new Error(`[useObservability] Failed to log debug message: ${error}`);
        }
      },

      // User identification method with validation
      identify: (userId: string, traits?: any) => {
        try {
          if (!userId || typeof userId !== 'string') {
            console.warn('[useObservability] identify called with invalid userId');
            return;
          }
          manager.setUser({ id: userId, ...traits });
        } catch (error: any) {
          throw new Error(`[useObservability] Failed to identify user: ${error}`);
        }
      },

      // Direct logging method with validation
      log: (level: string, message: string, metadata?: any) => {
        try {
          if (!level || !message || typeof level !== 'string' || typeof message !== 'string') {
            console.warn('[useObservability] log called with invalid parameters');
            return Promise.resolve();
          }
          return manager.log(level, message, metadata);
        } catch (error: any) {
          throw new Error(`[useObservability] Failed to log message: ${error}`);
        }
      },

      // Context setting method with validation
      setContext: (context: Record<string, any>) => {
        try {
          if (!context || typeof context !== 'object') {
            console.warn('[useObservability] setContext called with invalid context');
            return;
          }
          for (const [key, value] of Object.entries(context)) {
            if (key && typeof key === 'string') {
              manager.setContext(key, value);
            }
          }
        } catch (error: any) {
          throw new Error(`[useObservability] Failed to set context: ${error}`);
        }
      },
    };
  }, [manager]);

  // Extract methods with null fallbacks for backwards compatibility
  const log = useCallback(
    (level: string, message: string, metadata?: any) => {
      return observabilityMethods?.log(level, message, metadata);
    },
    [observabilityMethods],
  );

  const captureException = useCallback(
    (error: Error, context?: ObsContext) => {
      return observabilityMethods?.captureException(error, context);
    },
    [observabilityMethods],
  );

  const identify = useCallback(
    (userId: string, traits?: any) => {
      observabilityMethods?.identify(userId, traits);
    },
    [observabilityMethods],
  );

  const setContext = useCallback(
    (context: Record<string, any>) => {
      observabilityMethods?.setContext(context);
    },
    [observabilityMethods],
  );

  const debug = useCallback(
    (message: string, metadata?: any) => {
      return observabilityMethods?.debug(message, metadata);
    },
    [observabilityMethods],
  );

  // React 19: Memoize return object to prevent unnecessary re-renders
  const observabilityAPI = useMemo(() => {
    // Return an object that gracefully handles null manager (for async initialization)
    return {
      captureException,
      debug,
      identify,
      // Direct manager method access
      log,
      manager, // Expose manager for direct access (may be null during initialization)
      setContext,
      trackError,
      trackEvent,
      trackPerformance,
    };
  }, [
    manager,
    captureException,
    debug,
    identify,
    log,
    setContext,
    trackError,
    trackEvent,
    trackPerformance,
  ]);

  return observabilityAPI;
}

/**
 * Hook to access the observability manager
 */
export function useObservabilityManager(): null | ObservabilityManager {
  const manager = useContext(ObservabilityContext);

  // In React 19, we need to check if we're within a provider context
  // This validates that the hook is used correctly
  if (manager === OUTSIDE_PROVIDER) {
    throw new Error('useObservabilityManager must be used within an ObservabilityProvider');
  }

  return manager;
}

/**
 * Hook for timing operations with automatic performance tracking
 * React 19 optimized with concurrent features and improved cleanup
 */
export function usePerformanceTimer() {
  const { manager, trackPerformance } = useObservability();
  const transactions = useRef<Map<string, any>>(new Map());
  const [activeTimers, setActiveTimers] = useState(0);

  // React 19: Optimized timer methods with concurrent rendering
  const timerMethods = useMemo(() => {
    if (!manager) return null;

    return {
      endTimer: (operation: string, metadata?: Record<string, unknown>) => {
        const entry = transactions.current.get(operation);
        if (!entry) return;

        const duration = performance.now() - entry.startTime;

        // React 19: Use startTransition for non-blocking cleanup
        startTransition(() => {
          setActiveTimers((prev: any) => Math.max(0, prev - 1));
        });

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

      startTimer: (operation: string, metadata?: Record<string, unknown>) => {
        const transaction = manager.startTransaction(operation, {
          tags: metadata as any,
        });

        if (transaction) {
          // React 19: Use startTransition for non-blocking state updates
          startTransition(() => {
            setActiveTimers((prev: any) => prev + 1);
          });

          transactions.current.set(operation, {
            startTime: performance.now(),
            transaction,
          });
        }

        return transaction;
      },
    };
  }, [manager, trackPerformance]);

  const startTimer = useCallback(
    (operation: string, metadata?: Record<string, unknown>) => {
      return timerMethods?.startTimer(operation, metadata) || null;
    },
    [timerMethods],
  );

  const endTimer = useCallback(
    (operation: string, metadata?: Record<string, unknown>) => {
      return timerMethods?.endTimer(operation, metadata);
    },
    [timerMethods],
  );

  // React 19: Optimized async timing with error boundary support
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
      } catch (error: any) {
        endTimer(operation, { ...metadata, error: String(error), status: 'error' });
        throw error;
      }
    },
    [startTimer, endTimer],
  );

  // React 19: Enhanced cleanup with concurrent rendering safety
  useEffect(() => {
    return () => {
      // React 19: Use startTransition for cleanup operations
      startTransition(() => {
        transactions.current.forEach((entry, _operation: any) => {
          if (entry.transaction?.finish) {
            entry.transaction.finish();
          }
        });
        transactions.current.clear();
        setActiveTimers(0);
      });
    };
  }, []);

  // React 19: Return optimized methods with active timer count
  return useMemo(
    () => ({
      activeTimers, // Expose active timer count for debugging
      endTimer,
      startTimer,
      time,
    }),
    [endTimer, startTimer, time, activeTimers],
  );
}

/**
 * Hook for tracking workflow-specific events
 * React 19 optimized with memoized workflow context and concurrent updates
 */
export function useWorkflowObservability(workflowType: string) {
  const { trackError, trackEvent, trackPerformance } = useObservability();

  // React 19: Memoize workflow context for better performance
  const workflowContext = useMemo(
    () => ({
      category: 'workflow',
      label: workflowType,
      workflowType,
    }),
    [workflowType],
  );

  // React 19: Optimized workflow tracking methods
  const workflowMethods = useMemo(
    () => ({
      trackWorkflowError: (error: Error | string, metadata?: Record<string, unknown>) => {
        trackError(error, {
          metadata: {
            workflowType: workflowContext.workflowType,
            ...metadata,
          },
          workflow: workflowContext.workflowType,
        });
      },

      trackWorkflowEvent: (action: string, metadata?: Record<string, unknown>) => {
        trackEvent({
          action,
          category: workflowContext.category,
          label: workflowContext.label,
          metadata: {
            workflowType: workflowContext.workflowType,
            ...metadata,
          },
        });
      },

      trackWorkflowPerformance: (
        operation: string,
        duration: number,
        metadata?: Record<string, unknown>,
      ) => {
        trackPerformance(`${workflowContext.workflowType}.${operation}`, duration, {
          workflowType: workflowContext.workflowType,
          ...metadata,
        });
      },
    }),
    [workflowContext, trackError, trackEvent, trackPerformance],
  );

  // React 19: Return stable methods reference
  return workflowMethods;
}
