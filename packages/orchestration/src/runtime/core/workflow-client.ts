import { Client } from '@upstash/workflow';

import { createErrorMessage, normalizeUrl, pollUntilCondition } from '../../utils';
import { errorHandlers, WorkflowError, WorkflowErrorType } from '../../utils/error-handling';
import { devLog } from '../../utils/observability';

import type {
  CancelOptions,
  LogsOptions,
  NotifyOptions,
  NotifyResult,
  TriggerOptions,
  Waiter,
  WaitForCompletionOptions,
  WorkflowRun,
} from '../../utils/types';

/**
 * Enhanced workflow client with all methods from documentation
 */
export class WorkflowClient {
  private client: Client;

  constructor(options: { token?: string; baseUrl?: string } = {}) {
    // Use local QStash in development
    const isDev = process.env.NODE_ENV === 'development';
    const defaultBaseUrl = isDev ? 'http://localhost:8080' : process.env.QSTASH_URL;

    const baseUrl = options.baseUrl || defaultBaseUrl;
    const token = options.token || process.env.QSTASH_TOKEN;

    // Handle missing environment variables gracefully during build
    if (!token && !isDev) {
      console.warn('QSTASH_TOKEN not provided - workflow client will not function properly');
    }

    this.client = new Client({
      baseUrl: baseUrl ? normalizeUrl(baseUrl) : undefined,
      token:
        token ||
        (isDev
          ? 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0='
          : 'missing-token'),
    });
  }

  /**
   * Trigger a workflow and get its run ID
   */
  async trigger(options: TriggerOptions): Promise<{ workflowRunId: string }> {
    try {
      return await this.client.trigger(options as any);
    } catch (error) {
      throw errorHandlers.handleApiError(error, 'QStash Workflow');
    }
  }

  /**
   * Get workflow logs with filtering options
   */
  async logs(options?: LogsOptions): Promise<{
    runs: WorkflowRun[];
    cursor?: string;
  }> {
    try {
      return (await this.client.logs(options || {})) as any;
    } catch (error) {
      throw errorHandlers.handleApiError(error, 'QStash Workflow Logs');
    }
  }

  /**
   * Cancel workflow runs
   */
  async cancel(options: CancelOptions): Promise<void> {
    try {
      await this.client.cancel(options);
    } catch (error) {
      throw errorHandlers.handleApiError(error, 'QStash Workflow Cancel');
    }
  }

  /**
   * Notify a workflow waiting for an event
   */
  async notify(options: NotifyOptions): Promise<NotifyResult[]> {
    try {
      return await this.client.notify(options);
    } catch (error) {
      throw errorHandlers.handleApiError(error, 'QStash Workflow Notify');
    }
  }

  /**
   * Get waiters for an event
   */
  async getWaiters(options: { eventId: string }): Promise<Waiter[]> {
    return this.client.getWaiters(options);
  }

  /**
   * Helper: Cancel all workflows for a specific endpoint
   */
  async cancelEndpoint(url: string): Promise<void> {
    return this.cancel({ urlStartingWith: normalizeUrl(url) });
  }

  /**
   * Helper: Get active workflows
   */
  async getActiveWorkflows(options?: {
    count?: number;
    workflowUrl?: string;
  }): Promise<WorkflowRun[]> {
    const { runs } = await this.logs({
      ...options,
      state: 'RUN_STARTED',
    });
    return runs.filter((run) => run.workflowState === 'RUN_STARTED');
  }

  /**
   * Helper: Wait for workflow completion
   */
  async waitForCompletion(
    workflowRunId: string,
    options: WaitForCompletionOptions = {},
  ): Promise<WorkflowRun | null> {
    const {
      pollingInterval = 2000,
      timeout = 300000, // 5 minutes
    } = options;

    try {
      return await pollUntilCondition(
        async () => {
          try {
            const { runs } = await this.logs({ count: 1, workflowRunId });
            return runs.length > 0 ? runs[0] : null;
          } catch (error) {
            // Log error but return null to continue polling
            devLog.error(createErrorMessage(`Error polling workflow ${workflowRunId}`, error));
            return null;
          }
        },
        (run) => {
          if (run === null) return false;
          return ['RUN_CANCELED', 'RUN_FAILED', 'RUN_SUCCESS'].includes(run.workflowState);
        },
        {
          intervalMs: pollingInterval,
          onPoll: (run, attempt) => {
            if (run && attempt > 0 && attempt % 5 === 0) {
              devLog.info(
                `Still waiting for workflow ${workflowRunId}, state: ${run.workflowState}`,
              );
            }
          },
          timeoutMs: timeout,
        },
      );
    } catch (error) {
      // If it's a timeout from pollUntilCondition, wrap it in WorkflowError
      if (error instanceof Error && error.message.includes('Polling timeout')) {
        throw new WorkflowError(
          WorkflowErrorType.TIMEOUT,
          `Timeout waiting for workflow ${workflowRunId} to complete`,
          { timeout, workflowRunId },
        );
      }
      throw error;
    }
  }
}

/**
 * Factory function to create workflow client
 */
export function createWorkflowClient(options?: {
  token?: string;
  baseUrl?: string;
}): WorkflowClient {
  return new WorkflowClient(options);
}
