import { Client } from '@upstash/workflow';

import { devLog } from '../dev/development';

import type { WorkflowState, WorkflowStatus } from '../types';

export interface WorkflowMonitor {
  cancelWorkflow(workflowRunId: string): Promise<void>;
  getStatus(workflowRunId: string): Promise<WorkflowStatus | null>;
  getWorkflowLogs(workflowRunId: string, count?: number): Promise<unknown>;
  listActiveWorkflows(count?: number): Promise<WorkflowStatus[]>;
}

/**
 * Create a workflow monitor instance
 */
export function createWorkflowMonitor(options?: {
  qstashToken?: string;
  qstashUrl?: string;
}): WorkflowMonitor {
  const client = new Client({
    baseUrl: options?.qstashUrl || process.env.QSTASH_URL,
    token: options?.qstashToken || process.env.QSTASH_TOKEN!,
  });

  return {
    async getStatus(workflowRunId: string): Promise<WorkflowStatus | null> {
      try {
        const { runs } = await client.logs({
          count: 1,
          workflowRunId,
        });

        if (runs.length === 0) {
          return null;
        }

        // Map the run log to our WorkflowStatus type
        const run = runs[0] as any;
        return {
          completedAt: undefined,
          createdAt: Date.now(),
          state: (run.status || 'RUN_STARTED') as WorkflowState,
          steps: [],
        } as WorkflowStatus;
      } catch (error) {
        devLog.error('Failed to get workflow status:', error);
        return null;
      }
    },

    async listActiveWorkflows(count = 10): Promise<WorkflowStatus[]> {
      try {
        const { runs } = await client.logs({ count });
        return runs
          .filter(
            (run: any) => !['RUN_CANCELED', 'RUN_FAILED', 'RUN_SUCCESS'].includes(run.status || ''),
          )
          .map(
            (run: any) =>
              ({
                completedAt: undefined,
                createdAt: Date.now(),
                state: (run.status || 'RUN_STARTED') as WorkflowState,
                steps: [],
              }) as WorkflowStatus,
          );
      } catch (error) {
        devLog.error('Failed to list active workflows:', error);
        return [];
      }
    },

    async cancelWorkflow(workflowRunId: string): Promise<void> {
      await client.cancel({ ids: workflowRunId });
    },

    async getWorkflowLogs(workflowRunId: string, count = 100): Promise<unknown> {
      return client.logs({ count, workflowRunId });
    },
  };
}

/**
 * React hook for monitoring workflow status (to be used in Next.js)
 */
export function createWorkflowStatusHook() {
  return `
import { useEffect, useState } from 'react';
import { createWorkflowMonitor } from '@repo/orchestration/monitoring';
import type { WorkflowStatus } from '@repo/orchestration/types';

export function useWorkflowStatus(workflowRunId: string | null) {
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workflowRunId) {
      setLoading(false);
      return;
    }

    const monitor = createWorkflowMonitor();
    let cancelled = false;

    const pollStatus = async () => {
      try {
        const currentStatus = await monitor.getStatus(workflowRunId);
        
        if (!cancelled) {
          setStatus(currentStatus);
          setError(null);
          
          // Stop polling if workflow is complete
          if (
            currentStatus &&
            ['RUN_SUCCESS', 'RUN_FAILED', 'RUN_CANCELED'].includes(currentStatus.state)
          ) {
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
        }
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [workflowRunId]);

  return { status, loading, error };
}
`;
}

/**
 * Server-sent events endpoint for real-time workflow monitoring
 */
export function createWorkflowStatusStream() {
  return `
import { createWorkflowMonitor } from '@repo/orchestration/monitoring';

export async function GET(
  request: Request,
  { params }: { params: { workflowRunId: string } }
) {
  const encoder = new TextEncoder();
  const monitor = createWorkflowMonitor();

  const stream = new ReadableStream({
    async start(controller) {
      let isComplete = false;

      const sendUpdate = async () => {
        try {
          const status = await monitor.getStatus(params.workflowRunId);
          
          if (status) {
            const data = JSON.stringify(status);
            controller.enqueue(encoder.encode(\`data: \${data}\\n\\n\`));
            
            // Check if workflow is complete
            if (['RUN_SUCCESS', 'RUN_FAILED', 'RUN_CANCELED'].includes(status.state)) {
              isComplete = true;
              controller.close();
            }
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(\`event: error\\ndata: \${JSON.stringify({ error: error.message })}\\n\\n\`)
          );
        }
      };

      // Send initial status
      await sendUpdate();

      // Poll for updates
      const interval = setInterval(async () => {
        if (!isComplete) {
          await sendUpdate();
        } else {
          clearInterval(interval);
        }
      }, 2000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
`;
}
