import { wsServer } from '@/lib/realtime/websocket-server';
import { memoryStore } from '@/lib/storage/memory-store';
import { type WorkflowExecution } from '@/types';
import { Client } from '@upstash/qstash';

import {
  BaseWorkflowProvider,
  type ExecutionOptions,
  type ProviderCapabilities,
  type QueueStats,
  type ScheduleOptions,
} from './base-provider';

export class QStashProvider extends BaseWorkflowProvider {
  readonly name = 'qstash';
  readonly capabilities: ProviderCapabilities = {
    supportsCancellation: true,
    supportsDelay: true,
    supportsMetrics: true,
    supportsPriority: false,
    supportsRetries: true,
    supportsScheduling: true,
  };

  private client: Client;
  private baseUrl: string;

  constructor() {
    super();

    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      throw new Error('QSTASH_TOKEN environment variable is required');
    }

    this.client = new Client({ token });

    // Determine base URL for webhook callbacks
    this.baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3100';
  }

  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ExecutionOptions = {},
  ): Promise<{ executionId: string; messageId: string }> {
    this.validateOptions(options);

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Create execution record
    const execution: WorkflowExecution = {
      id: executionId,
      environment: process.env.NODE_ENV || 'development',
      input,
      metrics: {},
      startedAt: new Date(),
      status: 'running',
      steps: [],
      triggeredBy: 'qstash',
      version: '1.0.0',
      workflowId,
    };

    try {
      memoryStore.setExecution(execution);

      // Publish to QStash
      const result = await this.client.publishJSON({
        url: `${this.baseUrl}/api/workflows/${workflowId}/execute`,
        body: {
          executionId,
          input,
          metadata: {
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            triggeredBy: 'qstash',
          },
          workflowId,
        },
        cron: undefined,
        delay: options.delay,
        headers: {
          'Content-Type': 'application/json',
          'X-Execution-ID': executionId,
          'X-Workflow-ID': workflowId,
        },
        retries: options.retries,
      });

      // Broadcast workflow started event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-started',
        data: {
          input,
          messageId: result.messageId,
          options,
        },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.log(`Workflow ${workflowId} queued via QStash: ${executionId}`);
      return { executionId, messageId: result.messageId };
    } catch (error) {
      // Update execution with error
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.duration = Date.now() - startTime;

      memoryStore.setExecution(execution);

      // Broadcast failure event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-failed',
        data: {
          error: execution.error,
          input,
        },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.error(`Failed to queue workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async scheduleWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: ScheduleOptions,
  ): Promise<{ scheduleId: string }> {
    this.validateOptions(options);

    const result = await this.client.publishJSON({
      url: `${this.baseUrl}/api/workflows/${workflowId}/execute`,
      body: {
        input,
        metadata: {
          cron: options.cron,
          timestamp: new Date().toISOString(),
          timezone: options.timezone,
          triggeredBy: 'schedule',
        },
        workflowId,
      },
      cron: options.cron,
      headers: {
        'Content-Type': 'application/json',
        'X-Workflow-ID': workflowId,
      },
      retries: options.retries,
    });

    console.log(`Workflow ${workflowId} scheduled with cron: ${options.cron}`);
    return { scheduleId: result.messageId };
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = memoryStore.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    // Update execution status
    execution.status = 'cancelled';
    execution.completedAt = new Date();
    execution.duration = execution.startedAt ? Date.now() - execution.startedAt.getTime() : 0;

    memoryStore.setExecution(execution);

    // Broadcast cancellation event
    wsServer.broadcastWorkflowEvent({
      type: 'workflow-failed',
      data: {
        reason: 'Manual cancellation',
        status: 'cancelled',
      },
      executionId,
      timestamp: new Date(),
      workflowId: execution.workflowId,
    });

    console.log(`Execution ${executionId} cancelled`);
  }

  async getQueueStats(): Promise<QueueStats> {
    // Calculate stats from memory store
    const allExecutions = memoryStore.getAllExecutions();

    const pendingCount = allExecutions.filter(
      (e) => e.status === 'pending' || e.status === 'running',
    ).length;

    const failedCount = allExecutions.filter((e) => e.status === 'failed').length;

    const completedCount = allExecutions.filter((e) => e.status === 'completed').length;

    return {
      dlqMessages: failedCount,
      pendingMessages: pendingCount,
      totalProcessed: completedCount,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test QStash connectivity with a delayed health check message
      await this.client.publishJSON({
        url: `${this.baseUrl}/api/health`,
        body: { test: true },
        delay: 1000, // 1 second delay
      });
      return true;
    } catch (error) {
      console.error('QStash health check failed:', error);
      return false;
    }
  }
}
