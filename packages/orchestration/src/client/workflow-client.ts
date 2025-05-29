import { Client } from '@upstash/workflow';

import type { Waiter } from '../types';

/**
 * Enhanced workflow client with all methods from documentation
 */
export class WorkflowClient {
  private client: Client;

  constructor(options: { token?: string; baseUrl?: string } = {}) {
    this.client = new Client({
      baseUrl: options.baseUrl || process.env.QSTASH_URL,
      token: options.token || process.env.QSTASH_TOKEN!,
    });
  }

  /**
   * Trigger a workflow and get its run ID
   */
  async trigger(options: {
    url: string;
    body?: unknown;
    headers?: Record<string, string>;
    workflowRunId?: string;
    retries?: number;
    delay?: string;
    flowControl?: {
      key: string;
      rate?: number;
      parallelism?: number;
      period?: string;
    };
  }): Promise<{ workflowRunId: string }> {
    return this.client.trigger(options as any);
  }

  /**
   * Get workflow logs with filtering options
   */
  async logs(options?: {
    workflowRunId?: string;
    count?: number;
    state?: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';
    workflowUrl?: string;
    workflowCreatedAt?: number;
    cursor?: string;
  }): Promise<{
    runs: WorkflowRun[];
    cursor?: string;
  }> {
    return this.client.logs(options || {}) as any;
  }

  /**
   * Cancel workflow runs
   */
  async cancel(
    options: { ids: string | string[] } | { urlStartingWith: string } | { all: true },
  ): Promise<void> {
    await this.client.cancel(options);
  }

  /**
   * Notify a workflow waiting for an event
   */
  async notify(options: { eventId: string; eventData?: unknown }): Promise<NotifyResult[]> {
    return this.client.notify(options);
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
    return this.cancel({ urlStartingWith: url });
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
    options: {
      pollingInterval?: number;
      timeout?: number;
    } = {},
  ): Promise<WorkflowRun | null> {
    const {
      pollingInterval = 2000,
      timeout = 300000, // 5 minutes
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const { runs } = await this.logs({ count: 1, workflowRunId });

      if (runs.length === 0) {
        return null;
      }

      const run = runs[0];
      if (['RUN_CANCELED', 'RUN_FAILED', 'RUN_SUCCESS'].includes(run.workflowState)) {
        return run;
      }

      await new Promise((resolve) => setTimeout(resolve, pollingInterval));
    }

    throw new Error(`Timeout waiting for workflow ${workflowRunId} to complete`);
  }
}

// Type definitions for workflow runs
interface WorkflowRun {
  dlqId?: string;
  failureFunction?: unknown;
  invoker?: {
    runId: string;
    url: string;
    createdAt: number;
  };
  steps: WorkflowStep[];
  workflowRunCompletedAt?: number;
  workflowRunCreatedAt: number;
  workflowRunId: string;
  workflowRunResponse?: unknown;
  workflowState: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';
  workflowUrl: string;
}

interface WorkflowStep {
  steps: {
    stepName: string;
    stepType: string;
    startedAt: number;
    completedAt?: number;
    status: string;
  }[];
  type: 'single' | 'parallel' | 'batch';
}

interface NotifyResult {
  error?: string;
  messageId: string;
  waiter: Waiter;
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
