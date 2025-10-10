/**
 * Client-side orchestration exports for Next.js
 * React hooks and utilities for workflow management in Next.js applications
 *
 * This file provides client-side orchestration functionality specifically for Next.js applications.
 * Use this in client components, React hooks, and Next.js browser environments.
 *
 * For non-Next.js applications, use '@repo/orchestration/client' instead.
 */

'use client';

// Re-export logging functions for use in Next.js client environments
import { logError, logInfo, logWarn } from '@repo/observability/client/next';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ExecutionHistory, WorkflowAlert, WorkflowMetrics } from './shared/features/monitoring';
import { EnhancedScheduleConfig, ScheduleStatus } from './shared/features/scheduler';
import {
  WorkflowData,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowProvider,
} from './shared/types/index';

export { logError, logInfo, logWarn };

export interface UseExecutionHistoryOptions {
  /** Enable/disable the hook */
  enabled?: boolean;
  /** Filter options */
  filter?: {
    status?: ExecutionHistory['status'];
    timeRange?: { end: Date; start: Date };
  };
  /** Pagination options */
  pagination?: {
    limit: number;
    offset: number;
  };
  /** Workflow provider instance */
  provider: null | WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
}

export interface UseExecutionHistoryResult {
  /** Error state */
  error: Error | null;
  /** Execution history */
  executions: ExecutionHistory[];
  /** Has more executions to load */
  hasMore: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Load more executions */
  loadMore: () => Promise<void>;
  /** Refresh history */
  refresh: () => Promise<void>;
}

export interface UseWorkflowListOptions {
  /** Filter workflows */
  filter?: {
    status?: string;
    tags?: string[];
  };
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
}

export interface UseWorkflowListResult {
  /** Error state */
  error: Error | null;
  /** Loading state */
  isLoading: boolean;
  /** Refresh workflows */
  refresh: () => Promise<void>;
  /** List of workflows */
  workflows: WorkflowDefinition[];
}

export interface UseWorkflowMetricsOptions {
  /** Enable/disable the hook */
  enabled?: boolean;
  /** Workflow provider instance */
  provider: null | WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Time range for metrics */
  timeRange?: { end: Date; start: Date };
}

export interface UseWorkflowMetricsResult {
  /** Error state */
  error: Error | null;
  /** Loading state */
  isLoading: boolean;
  /** Workflow metrics */
  metrics: null | WorkflowMetrics;
  /** Refresh metrics */
  refresh: () => Promise<void>;
}

export interface UseWorkflowOptions {
  /** Auto-refresh workflow data */
  autoRefresh?: boolean;
  /** Enable/disable the hook */
  enabled?: boolean;
  /** Polling interval for execution status (ms) */
  pollInterval?: number;
  /** Workflow provider instance */
  provider: null | WorkflowProvider;
}

export interface UseWorkflowResult {
  /** Cancel current execution */
  cancel: () => Promise<void>;
  /** Clear execution state */
  clear: () => void;
  /** Execution error */
  error: Error | null;
  /** Execute workflow with input data */
  execute: (input?: unknown) => Promise<string>;
  /** Current workflow execution */
  execution: null | WorkflowExecution;
  /** Execution loading state */
  isExecuting: boolean;
  /** Retry failed execution */
  retry: () => Promise<void>;
}

export interface UseWorkflowScheduleOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
}

export interface UseWorkflowScheduleResult {
  /** Create schedule */
  createSchedule: (config: EnhancedScheduleConfig) => Promise<string>;
  /** Delete schedule */
  deleteSchedule: () => Promise<void>;
  /** Error state */
  error: Error | null;
  /** Loading state */
  isLoading: boolean;
  /** Pause schedule */
  pauseSchedule: () => Promise<void>;
  /** Refresh schedule */
  refresh: () => Promise<void>;
  /** Resume schedule */
  resumeSchedule: () => Promise<void>;
  /** Schedule status */
  schedule: null | ScheduleStatus;
  /** Update schedule */
  updateSchedule: (config: Partial<EnhancedScheduleConfig>) => Promise<void>;
}

/**
 * Utility function to create a workflow client for use in React components
 */
export function createReactWorkflowClient(provider: WorkflowProvider) {
  return {
    provider,
    useExecutionHistory: (
      workflowId: string,
      options?: Omit<UseExecutionHistoryOptions, 'provider'>,
    ) => useExecutionHistory(workflowId, { provider, ...options }),
    useWorkflow: (workflowId: string, options?: Omit<UseWorkflowOptions, 'provider'>) =>
      useWorkflow(workflowId, { provider, ...options }),
    useWorkflowAlerts: (
      workflowId: string,
      options?: Omit<UseWorkflowMetricsOptions, 'provider'>,
    ) => useWorkflowAlerts(workflowId, { provider, ...options }),
    useWorkflowList: (options?: Omit<UseWorkflowListOptions, 'provider'>) =>
      useWorkflowList({ provider, ...options }),
    useWorkflowMetrics: (
      workflowId: string,
      options?: Omit<UseWorkflowMetricsOptions, 'provider'>,
    ) => useWorkflowMetrics(workflowId, { provider, ...options }),
    useWorkflowSchedule: (
      workflowId: string,
      scheduleId?: string,
      options?: Omit<UseWorkflowScheduleOptions, 'provider'>,
    ) => useWorkflowSchedule(workflowId, scheduleId, { provider, ...options }),
  };
}

/**
 * Hook for workflow execution history
 */
export function useExecutionHistory(
  workflowId: string,
  options: UseExecutionHistoryOptions,
): UseExecutionHistoryResult {
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { enabled = true, filter, pagination, provider, refreshInterval = 30000 } = options;

  // Memoize filter and pagination to prevent unnecessary re-renders
  const memoizedFilter = useMemo(
    () => filter,
    [filter?.status, filter?.timeRange?.start, filter?.timeRange?.end],
  );
  const memoizedPagination = useMemo(() => pagination, [pagination?.limit, pagination?.offset]);

  const refresh = useCallback(async () => {
    if (!enabled || !provider || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);
    setOffset(0);

    try {
      // This would call an execution history provider method
      // For now, this is a placeholder
      const history: ExecutionHistory[] = []; // await provider.getExecutionHistory(workflowId, { ...memoizedPagination, offset: 0, ...memoizedFilter, signal });

      if (signal.aborted || !isMountedRef.current) return;

      setExecutions(history);
      setHasMore(history.length === (memoizedPagination?.limit || 10));
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [workflowId, provider, memoizedPagination, memoizedFilter, enabled]);

  const loadMore = useCallback(async () => {
    if (!enabled || !provider || !hasMore || isLoading || !isMountedRef.current) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);

    try {
      const newOffset = offset + (memoizedPagination?.limit || 10);
      // This would call an execution history provider method
      // For now, this is a placeholder
      const history: ExecutionHistory[] = []; // await provider.getExecutionHistory(workflowId, { ...memoizedPagination, offset: newOffset, ...memoizedFilter, signal });

      if (signal.aborted || !isMountedRef.current) return;

      setExecutions((prev: any) => [...prev, ...history]);
      setOffset(newOffset);
      setHasMore(history.length === (memoizedPagination?.limit || 10));
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    workflowId,
    provider,
    memoizedPagination,
    memoizedFilter,
    offset,
    hasMore,
    isLoading,
    enabled,
  ]);

  useEffect(() => {
    if (!enabled || !provider) {
      setIsLoading(false);
      return;
    }

    refresh();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, refreshInterval, enabled, provider]);

  // Cleanup on unmount - only run once
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    error,
    executions,
    hasMore,
    isLoading,
    loadMore,
    refresh,
  };
}

/**
 * Hook for managing workflow execution
 */
export function useWorkflow(workflowId: string, options: UseWorkflowOptions): UseWorkflowResult {
  const [execution, setExecution] = useState<null | WorkflowExecution>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentExecutionId, setCurrentExecutionId] = useState<null | string>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { autoRefresh = true, enabled = true, pollInterval = 1000, provider } = options;

  // Stable function to clear polling interval
  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Poll execution status with proper cleanup
  useEffect(() => {
    if (!enabled || !provider || !currentExecutionId || !autoRefresh || !isMountedRef.current) {
      clearPolling();
      return;
    }

    const pollStatus = async () => {
      if (!isMountedRef.current) return;

      try {
        const status = await provider.getExecution(currentExecutionId);

        if (!isMountedRef.current) return;

        setExecution(status);

        // Stop polling if execution is complete
        if (
          status &&
          (status.status === 'completed' ||
            status.status === 'failed' ||
            status.status === 'cancelled')
        ) {
          setIsExecuting(false);
          setCurrentExecutionId(null);
          clearPolling();
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        clearPolling();
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval
    pollIntervalRef.current = setInterval(pollStatus, pollInterval);

    return () => {
      clearPolling();
    };
  }, [currentExecutionId, provider, pollInterval, autoRefresh, enabled, clearPolling]);

  const execute = useCallback(
    async (input?: unknown): Promise<string> => {
      if (!enabled || !provider) {
        throw new Error('Workflow provider not available');
      }

      if (!isMountedRef.current) {
        throw new Error('Component unmounted');
      }

      // Cancel any pending operations
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsExecuting(true);
      setError(null);

      try {
        // Create a basic workflow definition
        const workflowDefinition: WorkflowDefinition = {
          id: workflowId,
          name: workflowId,
          steps: [
            {
              action: 'execute',
              id: 'execute',
              name: 'Execute',
            },
          ],
          version: '1.0.0',
        };

        const execution = await provider.execute(workflowDefinition, input as WorkflowData);

        if (signal.aborted || !isMountedRef.current) {
          throw new Error('Operation cancelled');
        }

        setCurrentExecutionId(execution.id);
        return execution.id;
      } catch (err) {
        if (signal.aborted || !isMountedRef.current) {
          throw new Error('Operation cancelled');
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsExecuting(false);
        throw error;
      }
    },
    [workflowId, provider, enabled],
  );

  const cancel = useCallback(async (): Promise<void> => {
    if (!enabled || !provider || !currentExecutionId || !isMountedRef.current) {
      return;
    }

    try {
      await provider.cancelExecution(currentExecutionId);

      if (isMountedRef.current) {
        setIsExecuting(false);
        setCurrentExecutionId(null);
        clearPolling();
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  }, [currentExecutionId, provider, enabled, clearPolling]);

  const retry = useCallback(async (): Promise<void> => {
    if (!execution?.input) {
      throw new Error('No execution to retry');
    }

    await execute(execution.input);
  }, [execution?.input, execute]);

  const clear = useCallback(() => {
    if (!isMountedRef.current) return;

    setExecution(null);
    setError(null);
    setIsExecuting(false);
    setCurrentExecutionId(null);
    clearPolling();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clearPolling]);

  return {
    cancel,
    clear,
    error,
    execute,
    execution,
    isExecuting,
    retry,
  };
}

/**
 * Hook for workflow alerts monitoring
 */
export function useWorkflowAlerts(
  workflowId: string,
  options: UseWorkflowMetricsOptions,
): {
  acknowledgeAlert: (alertId: string, user: string, note?: string) => Promise<void>;
  alerts: WorkflowAlert[];
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
} {
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { provider, refreshInterval = 10000 } = options;

  const refresh = useCallback(async () => {
    if (!provider || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      // This would call an alerts provider method
      // For now, this is a placeholder
      const workflowAlerts: WorkflowAlert[] = []; // await provider.getWorkflowAlerts(workflowId, { signal });

      if (signal.aborted || !isMountedRef.current) return;

      setAlerts(workflowAlerts);
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [workflowId, provider]);

  const acknowledgeAlert = useCallback(
    async (_alertId: string, _user: string, _note?: string): Promise<void> => {
      if (!provider || !isMountedRef.current) {
        throw new Error('Provider not available or component unmounted');
      }

      try {
        // This would call an alert provider method
        // await provider.acknowledgeAlert(alertId, user, note);
        await refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(error);
        }
        throw error;
      }
    },
    [provider, refresh],
  );

  const resolveAlert = useCallback(
    async (_alertId: string): Promise<void> => {
      if (!provider || !isMountedRef.current) {
        throw new Error('Provider not available or component unmounted');
      }

      try {
        // This would call an alert provider method
        // await provider.resolveAlert(alertId);
        await refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(error);
        }
        throw error;
      }
    },
    [provider, refresh],
  );

  useEffect(() => {
    refresh();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, refreshInterval]);

  // Cleanup on unmount - only run once
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    acknowledgeAlert,
    alerts,
    error,
    isLoading,
    refresh,
    resolveAlert,
  };
}

/**
 * Hook for managing workflow list
 */
export function useWorkflowList(options: UseWorkflowListOptions): UseWorkflowListResult {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { filter, provider, refreshInterval = 30000 } = options;

  // Memoize filter to prevent unnecessary re-renders
  const memoizedFilter = useMemo(() => filter, [filter?.status, filter?.tags]);

  const refresh = useCallback(async () => {
    if (!provider || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      // Note: listWorkflows is not available in the current WorkflowProvider interface
      // This would need to be implemented or we need a different approach
      const workflowList: WorkflowDefinition[] = []; // await provider.listWorkflows(memoizedFilter, { signal });

      if (signal.aborted || !isMountedRef.current) return;

      setWorkflows(workflowList);
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [provider, memoizedFilter]);

  // Initial load and auto-refresh
  useEffect(() => {
    refresh();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, refreshInterval]);

  // Cleanup on unmount - only run once
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    error,
    isLoading,
    refresh,
    workflows,
  };
}

/**
 * Hook for workflow metrics monitoring
 */
export function useWorkflowMetrics(
  workflowId: string,
  options: UseWorkflowMetricsOptions,
): UseWorkflowMetricsResult {
  const [metrics, setMetrics] = useState<null | WorkflowMetrics>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { enabled = true, provider, refreshInterval = 10000, timeRange } = options;

  // Memoize timeRange to prevent unnecessary re-renders
  const memoizedTimeRange = useMemo(() => timeRange, [timeRange?.start, timeRange?.end]);

  const refresh = useCallback(async () => {
    if (!enabled || !provider || !isMountedRef.current) {
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      // This would call a metrics provider method
      // For now, this is a placeholder
      const workflowMetrics = null; // await provider.getWorkflowMetrics(workflowId, memoizedTimeRange, { signal });

      if (signal.aborted || !isMountedRef.current) return;

      setMetrics(workflowMetrics);
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [workflowId, provider, memoizedTimeRange, enabled]);

  useEffect(() => {
    if (!enabled || !provider) {
      setIsLoading(false);
      return;
    }

    refresh();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (refreshInterval > 0) {
      intervalId = setInterval(() => {
        if (isMountedRef.current) {
          refresh();
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh, refreshInterval, enabled, provider]);

  // Cleanup on unmount - only run once
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    error,
    isLoading,
    metrics,
    refresh,
  };
}

/**
 * Hook for workflow schedule management
 */
export function useWorkflowSchedule(
  workflowId: string,
  scheduleId?: string,
  options: UseWorkflowScheduleOptions = { provider: {} as WorkflowProvider },
): UseWorkflowScheduleResult {
  const [schedule, setSchedule] = useState<null | ScheduleStatus>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | undefined>(scheduleId);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const { provider, refreshInterval = 30000 } = options;

  const refresh = useCallback(async () => {
    if (!currentScheduleId || !provider || !isMountedRef.current) {
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      // This would call a schedule provider method
      // For now, this is a placeholder
      const scheduleStatus: null | ScheduleStatus = null; // await provider.getSchedule(currentScheduleId, { signal });

      if (signal.aborted || !isMountedRef.current) return;

      setSchedule(scheduleStatus);
    } catch (err: any) {
      if (signal.aborted || !isMountedRef.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentScheduleId, provider]);

  const createSchedule = useCallback(
    async (_config: EnhancedScheduleConfig): Promise<string> => {
      if (!provider || !isMountedRef.current) {
        throw new Error('Provider not available or component unmounted');
      }

      setIsLoading(true);
      setError(null);

      try {
        // This would call a schedule provider method
        // For now, this is a placeholder
        const newScheduleId = 'placeholder_schedule_id'; // await provider.createSchedule(workflowId, config);

        if (!isMountedRef.current) {
          throw new Error('Component unmounted');
        }

        setCurrentScheduleId(newScheduleId);
        await refresh();
        return newScheduleId;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(error);
          setIsLoading(false);
        }
        throw error;
      }
    },
    [workflowId, provider, refresh],
  );

  const updateSchedule = useCallback(
    async (_config: Partial<EnhancedScheduleConfig>): Promise<void> => {
      if (!currentScheduleId) {
        throw new Error('No schedule to update');
      }

      if (!provider || !isMountedRef.current) {
        throw new Error('Provider not available or component unmounted');
      }

      setIsLoading(true);
      setError(null);

      try {
        // This would call a schedule provider method
        // await provider.updateSchedule(currentScheduleId, config);
        await refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (isMountedRef.current) {
          setError(error);
          setIsLoading(false);
        }
        throw error;
      }
    },
    [currentScheduleId, provider, refresh],
  );

  const pauseSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to pause');
    }

    if (!provider || !isMountedRef.current) {
      throw new Error('Provider not available or component unmounted');
    }

    try {
      // This would call a schedule provider method
      // await provider.pauseSchedule(currentScheduleId);
      await refresh();
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(error);
      }
      throw error;
    }
  }, [currentScheduleId, provider, refresh]);

  const resumeSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to resume');
    }

    if (!provider || !isMountedRef.current) {
      throw new Error('Provider not available or component unmounted');
    }

    try {
      // This would call a schedule provider method
      // await provider.resumeSchedule(currentScheduleId);
      await refresh();
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(error);
      }
      throw error;
    }
  }, [currentScheduleId, provider, refresh]);

  const deleteSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to delete');
    }

    if (!provider || !isMountedRef.current) {
      throw new Error('Provider not available or component unmounted');
    }

    try {
      // This would call a schedule provider method
      // await provider.deleteSchedule(currentScheduleId);

      if (isMountedRef.current) {
        setSchedule(null);
        setCurrentScheduleId(undefined);
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(error);
      }
      throw error;
    }
  }, [currentScheduleId, provider]);

  useEffect(() => {
    if (currentScheduleId) {
      refresh();

      let intervalId: ReturnType<typeof setInterval> | null = null;
      if (refreshInterval > 0) {
        intervalId = setInterval(() => {
          if (isMountedRef.current) {
            refresh();
          }
        }, refreshInterval);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }
  }, [refresh, refreshInterval, currentScheduleId]);

  // Cleanup on unmount - only run once
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    createSchedule,
    deleteSchedule,
    error,
    isLoading,
    pauseSchedule,
    refresh,
    resumeSchedule,
    schedule,
    updateSchedule,
  };
}

/**
 * Hook for managing workflow execution (alias for useWorkflow)
 */
export function useWorkflowExecution(
  executionId: string,
  options: UseWorkflowOptions,
): UseWorkflowResult {
  return useWorkflow(executionId, options);
}

/**
 * Hook for managing workflow provider
 */
export function useWorkflowProvider(_providerId?: string): {
  provider: WorkflowProvider | null;
  error: Error | null;
  isLoading: boolean;
  setProvider: (provider: WorkflowProvider | null) => void;
} {
  const [provider, setProvider] = useState<WorkflowProvider | null>(null);
  const [error, _setError] = useState<Error | null>(null);
  const [isLoading, _setIsLoading] = useState(false);

  return {
    provider,
    error,
    isLoading,
    setProvider,
  };
}

// Export aliases for test compatibility
export const useWorkflowScheduler = useWorkflowSchedule;
export const useWorkflowMonitoring = useWorkflowMetrics;
