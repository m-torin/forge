/**
 * Next.js Client Integration
 * React hooks and utilities for workflow management in Next.js applications
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WorkflowDefinition, WorkflowExecution, WorkflowProvider } from './shared/types/index';
import type {
  WorkflowMetrics,
  ExecutionHistory,
  WorkflowAlert,
} from './shared/features/monitoring';
import type { EnhancedScheduleConfig, ScheduleStatus } from './shared/features/scheduler';

export interface UseWorkflowOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Polling interval for execution status (ms) */
  pollInterval?: number;
  /** Auto-refresh workflow data */
  autoRefresh?: boolean;
}

export interface UseWorkflowResult {
  /** Execute workflow with input data */
  execute: (input?: unknown) => Promise<string>;
  /** Current workflow execution */
  execution: WorkflowExecution | null;
  /** Execution loading state */
  isExecuting: boolean;
  /** Execution error */
  error: Error | null;
  /** Cancel current execution */
  cancel: () => Promise<void>;
  /** Retry failed execution */
  retry: () => Promise<void>;
  /** Clear execution state */
  clear: () => void;
}

/**
 * Hook for managing workflow execution
 */
export function useWorkflow(workflowId: string, options: UseWorkflowOptions): UseWorkflowResult {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);

  const { provider, pollInterval = 1000, autoRefresh = true } = options;

  // Poll execution status
  useEffect(() => {
    if (!currentExecutionId || !autoRefresh) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const status = await provider.getExecution(currentExecutionId);
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
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [currentExecutionId, provider, pollInterval, autoRefresh]);

  const execute = useCallback(
    async (input?: unknown): Promise<string> => {
      setIsExecuting(true);
      setError(null);

      try {
        // Create a basic workflow definition
        const workflowDefinition: WorkflowDefinition = {
          id: workflowId,
          name: workflowId,
          version: '1.0.0',
          steps: [
            {
              id: 'execute',
              name: 'Execute',
              action: 'execute',
            },
          ],
        };

        const execution = await provider.execute(workflowDefinition, input as Record<string, any>);
        setCurrentExecutionId(execution.id);
        return execution.id;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsExecuting(false);
        throw err;
      }
    },
    [workflowId, provider],
  );

  const cancel = useCallback(async (): Promise<void> => {
    if (!currentExecutionId) {
      return;
    }

    try {
      await provider.cancelExecution(currentExecutionId);
      setIsExecuting(false);
      setCurrentExecutionId(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [currentExecutionId, provider]);

  const retry = useCallback(async (): Promise<void> => {
    if (!execution?.input) {
      throw new Error('No execution to retry');
    }

    await execute(execution.input);
  }, [execution, execute]);

  const clear = useCallback(() => {
    setExecution(null);
    setError(null);
    setIsExecuting(false);
    setCurrentExecutionId(null);
  }, []);

  return {
    execute,
    execution,
    isExecuting,
    error,
    cancel,
    retry,
    clear,
  };
}

export interface UseWorkflowListOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Filter workflows */
  filter?: {
    tags?: string[];
    status?: string;
  };
}

export interface UseWorkflowListResult {
  /** List of workflows */
  workflows: WorkflowDefinition[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh workflows */
  refresh: () => Promise<void>;
}

/**
 * Hook for managing workflow list
 */
export function useWorkflowList(options: UseWorkflowListOptions): UseWorkflowListResult {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { provider, refreshInterval = 30000, filter } = options;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Note: listWorkflows is not available in the current WorkflowProvider interface
      // This would need to be implemented or we need a different approach
      const workflowList: WorkflowDefinition[] = [];
      setWorkflows(workflowList);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [provider, filter]);

  // Initial load and auto-refresh
  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    workflows,
    isLoading,
    error,
    refresh,
  };
}

export interface UseWorkflowMetricsOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Time range for metrics */
  timeRange?: { start: Date; end: Date };
}

export interface UseWorkflowMetricsResult {
  /** Workflow metrics */
  metrics: WorkflowMetrics | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh metrics */
  refresh: () => Promise<void>;
}

/**
 * Hook for workflow metrics monitoring
 */
export function useWorkflowMetrics(
  workflowId: string,
  options: UseWorkflowMetricsOptions,
): UseWorkflowMetricsResult {
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { provider, refreshInterval = 10000, timeRange } = options;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would call a metrics provider method
      // For now, this is a placeholder
      const workflowMetrics = null; // await provider.getWorkflowMetrics(workflowId, timeRange);
      setMetrics(workflowMetrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, provider, timeRange]);

  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    metrics,
    isLoading,
    error,
    refresh,
  };
}

export interface UseExecutionHistoryOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Pagination options */
  pagination?: {
    limit: number;
    offset: number;
  };
  /** Filter options */
  filter?: {
    status?: ExecutionHistory['status'];
    timeRange?: { start: Date; end: Date };
  };
}

export interface UseExecutionHistoryResult {
  /** Execution history */
  executions: ExecutionHistory[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refresh history */
  refresh: () => Promise<void>;
  /** Load more executions */
  loadMore: () => Promise<void>;
  /** Has more executions to load */
  hasMore: boolean;
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

  const { provider, refreshInterval = 30000, pagination, filter } = options;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setOffset(0);

    try {
      // This would call an execution history provider method
      // For now, this is a placeholder
      const history: ExecutionHistory[] = []; // await provider.getExecutionHistory(workflowId, { ...pagination, offset: 0, ...filter });
      setExecutions(history);
      setHasMore(history.length === (pagination?.limit || 10));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, provider, pagination, filter]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const newOffset = offset + (pagination?.limit || 10);
      // This would call an execution history provider method
      // For now, this is a placeholder
      const history: ExecutionHistory[] = []; // await provider.getExecutionHistory(workflowId, { ...pagination, offset: newOffset, ...filter });

      setExecutions((prev) => [...prev, ...history]);
      setOffset(newOffset);
      setHasMore(history.length === (pagination?.limit || 10));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, provider, pagination, filter, offset, hasMore, isLoading]);

  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    executions,
    isLoading,
    error,
    refresh,
    loadMore,
    hasMore,
  };
}

export interface UseWorkflowScheduleOptions {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
}

export interface UseWorkflowScheduleResult {
  /** Schedule status */
  schedule: ScheduleStatus | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Create schedule */
  createSchedule: (config: EnhancedScheduleConfig) => Promise<string>;
  /** Update schedule */
  updateSchedule: (config: Partial<EnhancedScheduleConfig>) => Promise<void>;
  /** Pause schedule */
  pauseSchedule: () => Promise<void>;
  /** Resume schedule */
  resumeSchedule: () => Promise<void>;
  /** Delete schedule */
  deleteSchedule: () => Promise<void>;
  /** Refresh schedule */
  refresh: () => Promise<void>;
}

/**
 * Hook for workflow schedule management
 */
export function useWorkflowSchedule(
  workflowId: string,
  scheduleId?: string,
  options: UseWorkflowScheduleOptions = { provider: {} as WorkflowProvider },
): UseWorkflowScheduleResult {
  const [schedule, setSchedule] = useState<ScheduleStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentScheduleId, setCurrentScheduleId] = useState<string | undefined>(scheduleId);

  const { provider, refreshInterval = 30000 } = options;

  const refresh = useCallback(async () => {
    if (!currentScheduleId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // This would call a schedule provider method
      // For now, this is a placeholder
      const scheduleStatus: ScheduleStatus | null = null; // await provider.getSchedule(currentScheduleId);
      setSchedule(scheduleStatus);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentScheduleId, provider]);

  const createSchedule = useCallback(
    async (config: EnhancedScheduleConfig): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        // This would call a schedule provider method
        // For now, this is a placeholder
        const newScheduleId = 'placeholder_schedule_id'; // await provider.createSchedule(workflowId, config);
        setCurrentScheduleId(newScheduleId);
        await refresh();
        return newScheduleId;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        throw err;
      }
    },
    [workflowId, provider, refresh],
  );

  const updateSchedule = useCallback(
    async (config: Partial<EnhancedScheduleConfig>): Promise<void> => {
      if (!currentScheduleId) {
        throw new Error('No schedule to update');
      }

      setIsLoading(true);
      setError(null);

      try {
        // This would call a schedule provider method
        // await provider.updateSchedule(currentScheduleId, config);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
        throw err;
      }
    },
    [currentScheduleId, provider, refresh],
  );

  const pauseSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to pause');
    }

    try {
      // This would call a schedule provider method
      // await provider.pauseSchedule(currentScheduleId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [currentScheduleId, provider, refresh]);

  const resumeSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to resume');
    }

    try {
      // This would call a schedule provider method
      // await provider.resumeSchedule(currentScheduleId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [currentScheduleId, provider, refresh]);

  const deleteSchedule = useCallback(async (): Promise<void> => {
    if (!currentScheduleId) {
      throw new Error('No schedule to delete');
    }

    try {
      // This would call a schedule provider method
      // await provider.deleteSchedule(currentScheduleId);
      setSchedule(null);
      setCurrentScheduleId(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [currentScheduleId, provider]);

  useEffect(() => {
    if (currentScheduleId) {
      refresh();

      if (refreshInterval > 0) {
        const interval = setInterval(refresh, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [refresh, refreshInterval, currentScheduleId]);

  return {
    schedule,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    pauseSchedule,
    resumeSchedule,
    deleteSchedule,
    refresh,
  };
}

/**
 * Hook for workflow alerts monitoring
 */
export function useWorkflowAlerts(
  workflowId: string,
  options: UseWorkflowMetricsOptions,
): {
  alerts: WorkflowAlert[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  acknowledgeAlert: (alertId: string, user: string, note?: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
} {
  const [alerts, setAlerts] = useState<WorkflowAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { provider, refreshInterval = 10000 } = options;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would call an alerts provider method
      // For now, this is a placeholder
      const workflowAlerts: WorkflowAlert[] = []; // await provider.getWorkflowAlerts(workflowId);
      setAlerts(workflowAlerts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [workflowId, provider]);

  const acknowledgeAlert = useCallback(
    async (alertId: string, user: string, note?: string): Promise<void> => {
      try {
        // This would call an alert provider method
        // await provider.acknowledgeAlert(alertId, user, note);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [provider, refresh],
  );

  const resolveAlert = useCallback(
    async (alertId: string): Promise<void> => {
      try {
        // This would call an alert provider method
        // await provider.resolveAlert(alertId);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [provider, refresh],
  );

  useEffect(() => {
    refresh();

    if (refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refresh, refreshInterval]);

  return {
    alerts,
    isLoading,
    error,
    refresh,
    acknowledgeAlert,
    resolveAlert,
  };
}

/**
 * Utility function to create a workflow client for use in React components
 */
export function createReactWorkflowClient(provider: WorkflowProvider) {
  return {
    provider,
    useWorkflow: (workflowId: string, options?: Omit<UseWorkflowOptions, 'provider'>) =>
      useWorkflow(workflowId, { provider, ...options }),
    useWorkflowList: (options?: Omit<UseWorkflowListOptions, 'provider'>) =>
      useWorkflowList({ provider, ...options }),
    useWorkflowMetrics: (
      workflowId: string,
      options?: Omit<UseWorkflowMetricsOptions, 'provider'>,
    ) => useWorkflowMetrics(workflowId, { provider, ...options }),
    useExecutionHistory: (
      workflowId: string,
      options?: Omit<UseExecutionHistoryOptions, 'provider'>,
    ) => useExecutionHistory(workflowId, { provider, ...options }),
    useWorkflowSchedule: (
      workflowId: string,
      scheduleId?: string,
      options?: Omit<UseWorkflowScheduleOptions, 'provider'>,
    ) => useWorkflowSchedule(workflowId, scheduleId, { provider, ...options }),
    useWorkflowAlerts: (
      workflowId: string,
      options?: Omit<UseWorkflowMetricsOptions, 'provider'>,
    ) => useWorkflowAlerts(workflowId, { provider, ...options }),
  };
}
