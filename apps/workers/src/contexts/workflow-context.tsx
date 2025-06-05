'use client';

import { useId, useToggle, usePrevious, useShallowEffect, useDebouncedValue } from '@mantine/hooks';
import { createContext, useContext, useEffect, useMemo, useOptimistic, useState, startTransition, useRef } from 'react';

import { notify } from '@repo/notifications/mantine-notifications';
// import { auth } from '@repo/auth/client'; // TODO: Add auth when needed

interface WorkflowStep {
  completedAt?: number;
  error?: string;
  messageId?: string;
  startedAt: number;
  status: 'completed' | 'failed' | 'running';
  stepName: string;
  stepType: string;
}

export interface WorkflowRun {
  steps: { steps: WorkflowStep[] }[];
  workflowRunCompletedAt?: number;
  workflowRunCreatedAt: number;
  workflowRunId: string;
  workflowState: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';
  workflowUrl: string;
}

interface WorkflowStatus {
  completedSteps: number;
  progress: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  totalSteps: number;
  workflowRunId: string;
}

export interface Waiter {
  createdAt: number;
  eventId: string;
  stepName: string;
  timeout: number;
  workflowRunId: string;
}

interface WorkflowFilters {
  runId: string;
  workflowUrl: string;
}

interface WorkflowContextValue {
  filters: WorkflowFilters;
  loading: Map<string, boolean>;
  // State
  runs: WorkflowRun[];
  sseConnected: boolean;
  triggeredWorkflows: Record<string, WorkflowStatus>;

  // Derived state
  filteredRuns: WorkflowRun[];
  waiters: Waiter[];

  cancelWorkflow: (workflowRunId: string) => Promise<void>;
  notifyWorkflow: (eventId: string, eventData: any) => Promise<void>;
  setFilters: (filters: Partial<WorkflowFilters>) => void;
  setLoading: (endpoint: string, loading: boolean) => void;
  // Actions
  triggerWorkflow: (endpoint: string, payload: any) => Promise<void>;
  triggerWorkflowWithExample: (workflow: any, customPayload?: any) => Promise<void>;

  addOptimisticWorkflow: (action: { endpoint: string; status: Partial<WorkflowStatus> }) => void;
  // Optimistic updates
  optimisticWorkflows: Record<string, WorkflowStatus>;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [triggeredWorkflows, setTriggeredWorkflows] = useState<Record<string, WorkflowStatus>>({});
  const [loading, setLoadingState] = useState(new Map<string, boolean>());
  const [sseConnected, toggleSSE] = useToggle([false, true] as const);
  const [filters, setFiltersState] = useState<WorkflowFilters>({ runId: '', workflowUrl: '' });
  const uniqueId = useId();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [optimisticWorkflows, addOptimisticWorkflow] = useOptimistic(
    triggeredWorkflows,
    (state, { endpoint, status }: { endpoint: string; status: Partial<WorkflowStatus> }) => ({
      ...state,
      [endpoint]: { ...state[endpoint], ...status },
    }),
  );

  // Derived state
  const filteredRuns = useMemo(
    () =>
      runs.filter((run) => {
        if (filters.workflowUrl && !run.workflowUrl.includes(filters.workflowUrl)) return false;
        if (filters.runId && !run.workflowRunId.includes(filters.runId)) return false;
        return true;
      }),
    [runs, filters],
  );

  const waiters = useMemo(() => {
    const mockWaiters: Waiter[] = [];

    filteredRuns.forEach((run) => {
      if (run.workflowState === 'RUN_STARTED') {
        // Basic workflow approval steps
        if (run.workflowUrl.includes('workflows/basic')) {
          const hasTaskApprovalStep = run.steps.some((stepGroup) =>
            stepGroup.steps.some((step) => step.stepName === 'task-approval' && !step.completedAt),
          );

          if (hasTaskApprovalStep) {
            mockWaiters.push({
              createdAt: Date.now(),
              eventId: `approve-task-${Date.now()}`,
              stepName: 'task-approval',
              timeout: 300,
              workflowRunId: run.workflowRunId,
            });
          }
        }

        // Kitchen Sink workflow approval steps (multiple types)
        if (run.workflowUrl.includes('workflows/kitchen-sink')) {
          // Pipeline approval
          const hasPipelineApprovalStep = run.steps.some((stepGroup) =>
            stepGroup.steps.some(
              (step) => step.stepName === 'pipeline-approval' && !step.completedAt,
            ),
          );

          if (hasPipelineApprovalStep) {
            mockWaiters.push({
              createdAt: Date.now(),
              eventId: `approve-pipeline-${Date.now()}`,
              stepName: 'pipeline-approval',
              timeout: 600,
              workflowRunId: run.workflowRunId,
            });
          }

          // Order approval
          const hasOrderApprovalStep = run.steps.some((stepGroup) =>
            stepGroup.steps.some(
              (step) => step.stepName === 'order-approval-wait' && !step.completedAt,
            ),
          );

          if (hasOrderApprovalStep) {
            mockWaiters.push({
              createdAt: Date.now(),
              eventId: `order-approval-${Date.now()}`,
              stepName: 'order-approval-wait',
              timeout: 300,
              workflowRunId: run.workflowRunId,
            });
          }

          // Final approval (for comprehensive mode)
          const hasFinalApprovalStep = run.steps.some((stepGroup) =>
            stepGroup.steps.some((step) => step.stepName === 'final-approval' && !step.completedAt),
          );

          if (hasFinalApprovalStep) {
            mockWaiters.push({
              createdAt: Date.now(),
              eventId: `approve-comprehensive-${Date.now()}`,
              stepName: 'final-approval',
              timeout: 600,
              workflowRunId: run.workflowRunId,
            });
          }
        }

        // Image Processing workflow (no approval steps by default)
        if (run.workflowUrl.includes('workflows/image-processing')) {
          // Image processing workflows typically don't have approval steps
          // but we could add optional quality review steps if needed
        }
      }
    });

    return mockWaiters;
  }, [filteredRuns]);

  // Use Mantine's usePrevious to track previous runs
  const previousRuns = usePrevious(runs);
  
  // Debounce runs for logging to avoid spam
  const [debouncedRuns] = useDebouncedValue(runs, 1000);
  const previousDebouncedRuns = usePrevious(debouncedRuns);
  
  // Track last empty state log time
  const lastEmptyLogRef = useRef<number>(0);

  // SSE Connection
  useEffect(() => {
    console.log('Setting up SSE connection to /api/events');
    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      toggleSSE(true);
    };
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      toggleSSE(false);
    };

    eventSource.onmessage = ({ data }) => {
      const parsed = JSON.parse(data);
      const { type, runs: newRuns } = parsed;

      if (type === 'workflow-update' && newRuns) {
        setRuns(newRuns);

        // Update triggered workflows with real progress
        const updates: Record<string, WorkflowStatus> = {};

        newRuns.forEach((run: WorkflowRun) => {
          const endpoint = extractEndpointFromUrl(run.workflowUrl);
          if (!endpoint) return;

          const allSteps = run.steps.flatMap((g) => g.steps);
          const completedSteps = allSteps.filter((s) => 
            s.status === 'completed' || 
            s.state === 'STEP_SUCCESS' || 
            s.completedAt
          ).length;
          const totalSteps = allSteps.length;
          const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

          const status =
            run.workflowState === 'RUN_SUCCESS'
              ? 'completed'
              : run.workflowState === 'RUN_FAILED'
                ? 'failed'
                : run.workflowState === 'RUN_CANCELED'
                  ? 'cancelled'
                  : 'running';

          updates[endpoint] = {
            completedSteps,
            progress,
            status,
            totalSteps,
            workflowRunId: run.workflowRunId,
          };
        });

        if (Object.keys(updates).length > 0) {
          setTriggeredWorkflows((prev) => {
            const newState = { ...prev };
            
            Object.entries(updates).forEach(([endpoint, newStatus]) => {
              const prevStatus = prev[endpoint]?.status;
              
              // Show completion notification
              if (prevStatus === 'running' && newStatus.status !== 'running') {
                if (newStatus.status === 'completed') {
                  notify.success(`${endpoint.split('/').pop()} has completed successfully`, {
                    title: 'Workflow Completed',
                  });
                } else if (newStatus.status === 'failed') {
                  notify.error(`${endpoint.split('/').pop()} has failed`, {
                    title: 'Workflow Failed',
                  });
                } else if (newStatus.status === 'cancelled') {
                  notify.warning(`${endpoint.split('/').pop()} was cancelled`, {
                    title: 'Workflow Cancelled',
                  });
                }
              }
              
              newState[endpoint] = newStatus;
            });
            
            return newState;
          });
        }
      }
    };

    return () => {
      eventSource.close();
      toggleSSE(false);
    };
  }, [uniqueId, toggleSSE]);

  // Use Mantine's useShallowEffect to log changes only when runs actually change
  useShallowEffect(() => {
    if (!previousDebouncedRuns) return; // Skip initial render
    
    const hasChanged = debouncedRuns.length !== previousDebouncedRuns.length ||
      debouncedRuns.some((run, index) => {
        const prevRun = previousDebouncedRuns[index];
        return !prevRun || 
          run.workflowRunId !== prevRun.workflowRunId ||
          run.workflowState !== prevRun.workflowState ||
          run.steps.length !== prevRun.steps.length;
      });

    if (hasChanged) {
      console.log('SSE: Workflow update detected', {
        previousCount: previousDebouncedRuns.length,
        newCount: debouncedRuns.length,
        changes: {
          added: debouncedRuns.filter(r => !previousDebouncedRuns.find(pr => pr.workflowRunId === r.workflowRunId)),
          removed: previousDebouncedRuns.filter(pr => !debouncedRuns.find(r => r.workflowRunId === pr.workflowRunId)),
          updated: debouncedRuns.filter(r => {
            const prev = previousDebouncedRuns.find(pr => pr.workflowRunId === r.workflowRunId);
            return prev && prev.workflowState !== r.workflowState;
          })
        }
      });
      
      if (debouncedRuns.length > 0) {
        console.log('Active workflows:', debouncedRuns.map(r => ({
          id: r.workflowRunId,
          state: r.workflowState,
          url: r.workflowUrl.split('/').pop()
        })));
      }
    } else if (debouncedRuns.length === 0) {
      // Only log empty state every 30 seconds
      const now = Date.now();
      if (now - lastEmptyLogRef.current > 30000) {
        console.log('SSE: No active workflows');
        lastEmptyLogRef.current = now;
      }
    }
  }, [debouncedRuns]);

  const triggerWorkflow = async (endpoint: string, payload: any) => {
    setLoading(endpoint, true);

    // Extract workflow type from endpoint
    const workflowType = endpoint.split('/').pop() || 'unknown';

    // Workflow trigger tracking removed

    // Optimistic update wrapped in startTransition
    startTransition(() => {
      addOptimisticWorkflow({
        endpoint,
        status: { completedSteps: 0, progress: 0, status: 'running', totalSteps: 0 },
      });
    });

    try {
      const response = await fetch('/api/client/trigger', {
        body: JSON.stringify({
          url: `${window.location.origin}${endpoint}`,
          body: payload,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      const { workflowRunId } = await response.json();

      if (workflowRunId) {
        setTriggeredWorkflows((prev) => ({
          ...prev,
          [endpoint]: {
            completedSteps: 0,
            progress: 0,
            status: 'running',
            totalSteps: 0,
            workflowRunId,
          },
        }));

        notify.info(`${endpoint.split('/').pop()} is now running`, {
          title: 'Workflow Started',
        });
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Unknown error', {
        title: 'Failed to trigger workflow',
      });
    } finally {
      setLoading(endpoint, false);
    }
  };

  const triggerWorkflowWithExample = async (workflow: any, customPayload?: any) => {
    const actualPayload = customPayload || JSON.parse(JSON.stringify(workflow.example));

    // Generate unique IDs based on workflow type
    const timestamp = Date.now();
    const workflowUniqueId = `${uniqueId}-${timestamp}`;

    // Apply unique IDs based on workflow type
    if (workflow.id === 'basic') {
      // Enhanced Basic workflow
      if (actualPayload.taskId) {
        actualPayload.taskId = `task-${workflowUniqueId}`;
      }
      // Add explicit dedupId for clear deduplication
      actualPayload.dedupId = `basic-${workflowUniqueId}`;

      if (actualPayload.tasks && Array.isArray(actualPayload.tasks)) {
        actualPayload.tasks = actualPayload.tasks.map((task: any, index: number) => ({
          ...task,
          id: `task-${workflowUniqueId}-${index}`,
        }));
      }
    } else if (workflow.id === 'kitchen-sink') {
      // Comprehensive Kitchen Sink workflow
      if (actualPayload.pipelineId) {
        actualPayload.pipelineId = `pipeline-${workflowUniqueId}`;
      }
      if (actualPayload.orderId) {
        actualPayload.orderId = `order-${workflowUniqueId}`;
      }
      if (actualPayload.datasetId) {
        actualPayload.datasetId = `dataset-${workflowUniqueId}`;
      }
      if (actualPayload.taskId) {
        actualPayload.taskId = `task-${workflowUniqueId}`;
      }
      // Add explicit dedupId for clear deduplication
      actualPayload.dedupId = `kitchen-sink-${workflowUniqueId}`;

      // Also ensure tasks have unique IDs if present
      if (actualPayload.tasks && Array.isArray(actualPayload.tasks)) {
        actualPayload.tasks = actualPayload.tasks.map((task: any, index: number) => ({
          ...task,
          id: `task-${workflowUniqueId}-${index}`,
        }));
      }
    } else if (workflow.id === 'image-processing') {
      // Image processing workflow
      if (actualPayload.imageId) {
        actualPayload.imageId = `img-${workflowUniqueId}`;
      }
      // Add explicit dedupId for clear deduplication
      actualPayload.dedupId = `image-${workflowUniqueId}`;
    }

    await triggerWorkflow(workflow.endpoint, actualPayload);
  };

  const setLoading = (endpoint: string, isLoading: boolean) => {
    setLoadingState((prev) => new Map(prev).set(endpoint, isLoading));
  };

  const setFilters = (newFilters: Partial<WorkflowFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const cancelWorkflow = async (workflowRunId: string) => {
    try {
      const response = await fetch('/api/client/cancel', {
        body: JSON.stringify({ ids: workflowRunId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (response.ok) {
        notify.success(`Successfully cancelled workflow ${workflowRunId}`, {
          title: 'Workflow Cancelled',
        });
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Unknown error', {
        title: 'Failed to cancel workflow',
      });
    }
  };

  const notifyWorkflow = async (eventId: string, eventData: any) => {
    try {
      const response = await fetch('/api/client/notify', {
        body: JSON.stringify({ eventData, eventId }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (response.ok) {
        notify.success(`Successfully notified workflows waiting for ${eventId}`, {
          title: 'Event Sent',
        });
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Invalid JSON payload', {
        title: 'Failed to send event',
      });
    }
  };

  return (
    <WorkflowContext.Provider
      value={{
        addOptimisticWorkflow,
        cancelWorkflow,
        filteredRuns,
        filters,
        loading,
        notifyWorkflow,
        optimisticWorkflows,
        runs,
        setFilters,
        setLoading,
        sseConnected,
        triggeredWorkflows,
        triggerWorkflow,
        triggerWorkflowWithExample,
        waiters,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within WorkflowProvider');
  return context;
};

const extractEndpointFromUrl = (url: string) => {
  const match = url.match(/\/api\/.+/);
  return match?.[0] || null;
};
