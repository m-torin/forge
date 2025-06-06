import { wsServer } from '@/lib/realtime/websocket-server';
import { memoryStore } from '@/lib/storage/memory-store';
import { type WorkflowExecution } from '@/types';
import { Client } from '@upstash/qstash';

interface QStashWorkflowOptions {
  cron?: string;
  delay?: number;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: number;
}

interface QStashResponse {
  body: string;
  headers: Record<string, string>;
  messageId: string;
  url: string;
}

export class QStashClient {
  private client: Client;
  private baseUrl: string;

  constructor() {
    if (!process.env.QSTASH_TOKEN) {
      throw new Error('QSTASH_TOKEN environment variable is required');
    }

    this.client = new Client({
      token: process.env.QSTASH_TOKEN!,
    });

    this.baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3100';
  }

  async executeWorkflow(
    workflowId: string,
    input: Record<string, any>,
    options: QStashWorkflowOptions = {},
  ): Promise<{ executionId: string; messageId: string }> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create execution record
    const execution: WorkflowExecution = {
      id: executionId,
      environment: process.env.NODE_ENV || 'development',
      input,
      metrics: {},
      startedAt: new Date(),
      status: 'pending',
      steps: [],
      triggeredBy: 'manual',
      version: '1.0.0',
      workflowId,
    };

    // Store execution
    memoryStore.setExecution(execution);

    try {
      // Prepare QStash message
      const url = `${this.baseUrl}/api/workflows/${workflowId}/execute`;
      const headers = {
        'Content-Type': 'application/json',
        'X-Execution-ID': executionId,
        'X-Workflow-ID': workflowId,
        ...options.headers,
      };

      const body = JSON.stringify({
        executionId,
        input,
        metadata: {
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          triggeredBy: 'qstash',
        },
        workflowId,
      });

      // Send to QStash
      const response = await this.client.publishJSON({
        url,
        body: JSON.parse(body),
        cron: options.cron,
        delay: options.delay,
        headers,
        retries: options.retries || 3,
      });

      // Update execution with QStash message ID
      execution.status = 'running';
      execution.startedAt = new Date();
      memoryStore.setExecution(execution);

      // Broadcast workflow started event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-started',
        data: {
          input,
          messageId: response.messageId,
          options,
        },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.log(`Workflow ${workflowId} queued with execution ID: ${executionId}`);

      return {
        executionId,
        messageId: response.messageId,
      };
    } catch (error) {
      // Update execution with error
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();

      memoryStore.setExecution(execution);

      // Broadcast workflow failed event
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
    cron: string,
    options: Omit<QStashWorkflowOptions, 'cron'> = {},
  ): Promise<{ scheduleId: string }> {
    const url = `${this.baseUrl}/api/workflows/${workflowId}/execute`;
    const headers = {
      'Content-Type': 'application/json',
      'X-Scheduled': 'true',
      'X-Workflow-ID': workflowId,
      ...options.headers,
    };

    const body = {
      input,
      metadata: {
        cron,
        environment: process.env.NODE_ENV,
        triggeredBy: 'schedule',
      },
      workflowId,
    };

    try {
      const response = await this.client.publishJSON({
        url,
        body,
        cron,
        delay: options.delay,
        headers,
        retries: options.retries || 3,
      });

      console.log(`Workflow ${workflowId} scheduled with cron: ${cron}`);

      return {
        scheduleId: response.messageId,
      };
    } catch (error) {
      console.error(`Failed to schedule workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    const execution = memoryStore.getExecution(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (
      execution.status === 'completed' ||
      execution.status === 'failed' ||
      execution.status === 'cancelled'
    ) {
      throw new Error(`Cannot cancel execution in status: ${execution.status}`);
    }

    try {
      // Note: QStash doesn't have a direct cancel API for individual messages
      // In a real implementation, you'd need to track message IDs and use QStash's cancel endpoint
      // For now, we'll mark it as cancelled in our store

      execution.status = 'cancelled';
      execution.completedAt = new Date();
      execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();

      memoryStore.setExecution(execution);

      // Broadcast workflow cancelled event
      wsServer.broadcastWorkflowEvent({
        type: 'workflow-failed', // Using failed type with cancelled status
        data: {
          reason: 'Manual cancellation',
          status: 'cancelled',
        },
        executionId,
        timestamp: new Date(),
        workflowId: execution.workflowId,
      });

      console.log(`Workflow execution ${executionId} cancelled`);
    } catch (error) {
      console.error(`Failed to cancel workflow execution ${executionId}:`, error);
      throw error;
    }
  }

  async getQueueStats(): Promise<{
    pendingMessages: number;
    dlqMessages: number;
    totalProcessed: number;
  }> {
    try {
      // Note: This would require QStash admin API access
      // For now, we'll return stats from our memory store
      const executions = memoryStore.getAllExecutions();

      return {
        dlqMessages: executions.filter((e) => e.status === 'failed').length,
        pendingMessages: executions.filter((e) => e.status === 'pending' || e.status === 'running')
          .length,
        totalProcessed: executions.filter((e) => e.status === 'completed').length,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return {
        dlqMessages: 0,
        pendingMessages: 0,
        totalProcessed: 0,
      };
    }
  }

  // Webhook handling for QStash callbacks
  async handleWebhook(headers: Record<string, string>, body: any): Promise<void> {
    try {
      // Verify QStash signature (implement proper verification in production)
      const signature = headers['upstash-signature'];
      if (!signature) {
        throw new Error('Missing QStash signature');
      }

      const executionId = headers['x-execution-id'];
      const workflowId = headers['x-workflow-id'];

      if (!executionId || !workflowId) {
        console.warn('Webhook missing execution or workflow ID');
        return;
      }

      const execution = memoryStore.getExecution(executionId);
      if (!execution) {
        console.warn(`Execution not found for webhook: ${executionId}`);
        return;
      }

      // Update execution based on webhook payload
      if (body.status) {
        execution.status = body.status;
      }

      if (body.output) {
        execution.output = body.output;
      }

      if (body.error) {
        execution.error = body.error;
        execution.status = 'failed';
      }

      if (body.completed) {
        execution.status = 'completed';
        execution.completedAt = new Date();
        execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
      }

      if (body.steps) {
        execution.steps = body.steps;
      }

      // Update store
      memoryStore.setExecution(execution);

      // Broadcast appropriate event
      const eventType =
        execution.status === 'completed'
          ? 'workflow-completed'
          : execution.status === 'failed'
            ? 'workflow-failed'
            : 'workflow-started';

      wsServer.broadcastWorkflowEvent({
        type: eventType,
        data: {
          error: execution.error,
          output: execution.output,
          status: execution.status,
          steps: execution.steps,
        },
        executionId,
        timestamp: new Date(),
        workflowId,
      });

      console.log(`Webhook processed for execution ${executionId}: ${execution.status}`);
    } catch (error) {
      console.error('Failed to handle QStash webhook:', error);
      throw error;
    }
  }

  // Utility method to build webhook URL
  getWebhookUrl(path = '/api/webhooks/qstash'): string {
    return `${this.baseUrl}${path}`;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      // Simple test message to verify QStash connectivity
      const testUrl = `${this.baseUrl}/api/health`;
      await this.client.publishJSON({
        url: testUrl,
        body: { test: true },
        delay: 1000, // 1 second delay for testing
      });
      return true;
    } catch (error) {
      console.error('QStash health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const qstashClient = new QStashClient();
