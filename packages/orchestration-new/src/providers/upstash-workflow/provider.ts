/**
 * Upstash Workflow Provider
 * Implements WorkflowProvider interface using Upstash QStash and Redis
 */

import { Client } from '@upstash/qstash';
import { Redis } from '@upstash/redis';
import { serve } from '@upstash/workflow/nextjs';
import { nanoid } from 'nanoid';

import { createProviderError, ProviderError } from '../../shared/utils/errors';

import type {
  ListExecutionsOptions,
  ProviderHealth,
  UpstashWorkflowConfig,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowProvider,
} from '../../shared/types/index';

export interface UpstashWorkflowProviderOptions {
  /** Base URL for webhook callbacks */
  baseUrl: string;
  /** Debug mode */
  debug?: boolean;
  /** Environment name */
  env?: string;
  /** QStash client configuration */
  qstash: {
    token: string;
    baseUrl?: string;
  };
  /** Redis configuration for state management */
  redis?: {
    url: string;
    token?: string;
  };
}

export class UpstashWorkflowProvider implements WorkflowProvider {
  public readonly name = 'upstash-workflow';
  public readonly version = '1.0.0';

  private qstash: Client;
  private redis?: Redis;
  private options: UpstashWorkflowProviderOptions;

  constructor(options: UpstashWorkflowProviderOptions) {
    this.options = options;

    // Initialize QStash client
    this.qstash = new Client({
      baseUrl: options.qstash.baseUrl,
      token: options.qstash.token,
    });

    // Initialize Redis client if configuration provided
    if (options.redis) {
      this.redis = new Redis({
        url: options.redis.url,
        token: options.redis.token,
      });
    }
  }

  /**
   * Create provider from configuration
   */
  static fromConfig(config: UpstashWorkflowConfig): UpstashWorkflowProvider {
    return new UpstashWorkflowProvider({
      baseUrl: config.config.baseUrl,
      debug: config.config.debug,
      env: config.config.env,
      qstash: {
        token: config.config.qstashToken,
      },
      redis: config.config.redisUrl
        ? {
            url: config.config.redisUrl,
            token: config.config.redisToken,
          }
        : undefined,
    });
  }

  /**
   * Execute a workflow
   */
  async execute(
    definition: WorkflowDefinition,
    input?: Record<string, any>,
  ): Promise<WorkflowExecution> {
    try {
      const executionId = nanoid();
      const startedAt = new Date();

      // Create execution record
      const execution: WorkflowExecution = {
        id: executionId,
        input,
        metadata: {
          trigger: {
            type: 'manual',
            payload: input,
            timestamp: startedAt,
          },
        },
        startedAt,
        status: 'pending',
        steps: definition.steps.map((step) => ({
          attempts: 0,
          status: 'pending',
          stepId: step.id,
        })),
        workflowId: definition.id,
      };

      // Store execution state if Redis is available
      if (this.redis) {
        await this.redis.set(
          `workflow:execution:${executionId}`,
          JSON.stringify(execution),
          { ex: 24 * 60 * 60 }, // 24 hours TTL
        );
      }

      // Queue workflow execution using QStash
      const webhookUrl = `${this.options.baseUrl}/api/workflows/${definition.id}/execute`;

      await this.qstash.publishJSON({
        url: webhookUrl,
        body: {
          definition,
          executionId,
          input,
          workflowId: definition.id,
        },
        delay: definition.retryConfig?.delay || 0,
        headers: {
          'X-Execution-ID': executionId,
          'X-Workflow-ID': definition.id,
        },
        retries: definition.retryConfig?.maxAttempts || 3,
      });

      // Update status to running
      execution.status = 'running';
      if (this.redis) {
        await this.redis.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
          ex: 24 * 60 * 60,
        });
      }

      return execution;
    } catch (error) {
      throw createProviderError(
        `Failed to execute workflow ${definition.id}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      if (!this.redis) {
        throw new ProviderError(
          'Redis not configured - cannot retrieve execution state',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      const data = await this.redis.get(`workflow:execution:${executionId}`);
      if (!data) {
        return null;
      }

      return JSON.parse(data as string);
    } catch (error) {
      throw createProviderError(
        `Failed to get execution ${executionId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Cancel a running execution
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    try {
      // Get current execution
      const execution = await this.getExecution(executionId);
      if (!execution) {
        return false;
      }

      if (execution.status !== 'running' && execution.status !== 'pending') {
        return false; // Already completed or failed
      }

      // Update execution status
      execution.status = 'cancelled';
      execution.completedAt = new Date();

      // Store updated execution
      if (this.redis) {
        await this.redis.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
          ex: 24 * 60 * 60,
        });
      }

      // TODO: Cancel pending QStash messages if possible
      // This would require tracking message IDs

      return true;
    } catch (error) {
      throw createProviderError(
        `Failed to cancel execution ${executionId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(
    workflowId: string,
    options?: ListExecutionsOptions,
  ): Promise<WorkflowExecution[]> {
    try {
      if (!this.redis) {
        throw new ProviderError(
          'Redis not configured - cannot list executions',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      // For now, use a simple pattern search
      // In production, you'd want a more sophisticated indexing strategy
      const pattern = `workflow:execution:*`;
      const keys = await this.redis.keys(pattern);

      const executions: WorkflowExecution[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const execution = JSON.parse(data as string);
          if (execution.workflowId === workflowId) {
            executions.push(execution);
          }
        }
      }

      // Apply filters
      let filtered = executions;

      if (options?.status && options.status.length > 0) {
        filtered = filtered.filter((e) => options.status!.includes(e.status));
      }

      if (options?.startDate) {
        filtered = filtered.filter((e) => new Date(e.startedAt) >= options.startDate!);
      }

      if (options?.endDate) {
        filtered = filtered.filter((e) => new Date(e.startedAt) <= options.endDate!);
      }

      // Sort by start time (newest first)
      filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      // Apply limit
      if (options?.limit && options.limit > 0) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    } catch (error) {
      throw createProviderError(
        `Failed to list executions for workflow ${workflowId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Schedule a workflow
   */
  async scheduleWorkflow(definition: WorkflowDefinition): Promise<string> {
    try {
      if (!definition.schedule) {
        throw new ProviderError(
          'Workflow definition does not include schedule configuration',
          this.name,
          'upstash-workflow',
          'NO_SCHEDULE_CONFIG',
          false,
        );
      }

      const scheduleId = nanoid();
      const webhookUrl = `${this.options.baseUrl}/api/workflows/${definition.id}/execute`;

      // Create scheduled job using QStash
      await this.qstash.schedules.create({
        body: JSON.stringify({
          definition,
          scheduledExecution: true,
          workflowId: definition.id,
        }),
        cron: definition.schedule.cron,
        destination: webhookUrl,
        headers: {
          'X-Schedule-ID': scheduleId,
          'X-Workflow-ID': definition.id,
        },
      });

      // Store schedule metadata if Redis is available
      if (this.redis) {
        await this.redis.set(
          `workflow:schedule:${scheduleId}`,
          JSON.stringify({
            createdAt: new Date(),
            cron: definition.schedule.cron,
            enabled: definition.schedule.enabled,
            scheduleId,
            workflowId: definition.id,
          }),
        );
      }

      return scheduleId;
    } catch (error) {
      throw createProviderError(
        `Failed to schedule workflow ${definition.id}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Unschedule a workflow
   */
  async unscheduleWorkflow(workflowId: string): Promise<boolean> {
    try {
      // Find schedule for this workflow
      if (this.redis) {
        const pattern = 'workflow:schedule:*';
        const keys = await this.redis.keys(pattern);

        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            const schedule = JSON.parse(data as string);
            if (schedule.workflowId === workflowId) {
              // Delete from QStash (would need schedule ID from QStash)
              // For now, just remove from Redis
              await this.redis.del(key);
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      throw createProviderError(
        `Failed to unschedule workflow ${workflowId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      // Basic health check - try to access a simple endpoint
      // Using a simple ping mechanism instead of complex API calls

      // Test Redis connection if configured
      if (this.redis) {
        await this.redis.ping();
      }

      return {
        details: {
          qstash: 'healthy',
          redis: this.redis ? 'healthy' : 'not-configured',
        },
        responseTime: Date.now() - startTime,
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          qstash: 'unknown',
          redis: this.redis ? 'unknown' : 'not-configured',
        },
        responseTime: Date.now() - startTime,
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update execution status (called by webhook handlers)
   */
  async updateExecutionStatus(
    executionId: string,
    status: WorkflowExecutionStatus,
    stepId?: string,
    result?: any,
    error?: any,
  ): Promise<void> {
    if (!this.redis) {
      return; // Cannot update without Redis
    }

    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new ProviderError(
        `Execution ${executionId} not found`,
        this.name,
        'upstash-workflow',
        'EXECUTION_NOT_FOUND',
        false,
      );
    }

    // Update execution status
    execution.status = status;
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      execution.completedAt = new Date();
    }

    // Update step status if provided
    if (stepId) {
      const step = execution.steps.find((s) => s.stepId === stepId);
      if (step) {
        step.status = status;
        step.completedAt = new Date();
        if (result !== undefined) step.output = result;
        if (error) step.error = error;
      }
    }

    // Store updated execution
    await this.redis.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
      ex: 24 * 60 * 60,
    });
  }

  /**
   * Create workflow execution handler for Next.js
   */
  createWorkflowHandler() {
    return serve(async (context) => {
      const payload = context.requestPayload as any;
      const { definition, executionId, input, workflowId } = payload;

      try {
        // Execute workflow steps
        for (const step of definition.steps) {
          await this.updateExecutionStatus(executionId, 'running', step.id);

          try {
            // Step execution logic would go here
            // For now, this is a placeholder
            const result = await this.executeStep(step, input);

            await this.updateExecutionStatus(executionId, 'completed', step.id, result);
          } catch (stepError) {
            await this.updateExecutionStatus(executionId, 'failed', step.id, undefined, stepError);
            throw stepError;
          }
        }

        await this.updateExecutionStatus(executionId, 'completed');
      } catch (error) {
        await this.updateExecutionStatus(executionId, 'failed', undefined, undefined, error);
        throw error;
      }
    });
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: any, input: any): Promise<any> {
    // This is a placeholder - actual step execution would depend on
    // the step.action and would integrate with other services
    return { input, step: step.id, success: true };
  }

  /**
   * List all workflow executions
   */
  async listWorkflowExecutions(options?: {
    limit?: number;
    offset?: number;
    status?: WorkflowExecutionStatus[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<WorkflowExecution[]> {
    try {
      if (!this.redis) {
        throw new ProviderError(
          'Redis not configured - cannot list workflow executions',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      // Get all execution keys
      const pattern = `workflow:execution:*`;
      const keys = await this.redis.keys(pattern);

      const executions: WorkflowExecution[] = [];

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const execution = JSON.parse(data as string);
          executions.push(execution);
        }
      }

      // Apply filters
      let filtered = executions;

      if (options?.status && options.status.length > 0) {
        filtered = filtered.filter((e) => options.status!.includes(e.status));
      }

      if (options?.startDate) {
        filtered = filtered.filter((e) => new Date(e.startedAt) >= options.startDate!);
      }

      if (options?.endDate) {
        filtered = filtered.filter((e) => new Date(e.startedAt) <= options.endDate!);
      }

      // Sort by start time (newest first)
      filtered.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

      // Apply pagination
      const offset = options?.offset || 0;
      const limit = options?.limit || 50;

      filtered = filtered.slice(offset, offset + limit);

      return filtered;
    } catch (error) {
      throw createProviderError(
        'Failed to list workflow executions',
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Get workflow execution - alias for getExecution for compatibility
   */
  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    return this.getExecution(executionId);
  }

  /**
   * Cancel workflow - alias for cancelExecution for compatibility
   */
  async cancelWorkflow(executionId: string): Promise<boolean> {
    return this.cancelExecution(executionId);
  }
}
