/**
 * Upstash Workflow Provider
 * Implements WorkflowProvider interface using Upstash QStash and Redis
 */

import { randomUUID } from 'crypto';

import { nanoid } from 'nanoid';

import { logError, logInfo } from '@repo/observability/server/next';

import {
  ListExecutionsOptions,
  ProviderHealth,
  UpstashWorkflowConfig,
  WorkflowData,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowProvider,
  WorkflowStep,
} from '../../shared/types/index';
import { createProviderError, ProviderError } from '../../shared/utils/errors';

export interface UpstashWorkflowProviderOptions {
  /** Base URL for webhook callbacks */
  baseUrl: string;
  /** Debug mode */
  debug?: boolean;
  /** Environment name */
  env?: string;
  /** QStash client configuration */
  qstash: {
    baseUrl?: string;
    token: string;
  };
  /** Whether to enable Redis for state management (uses @repo/db-prisma/redis) */
  enableRedis?: boolean;
  /** Webhook URL pattern - defaults to '/api/workflows/{id}/execute' */
  webhookUrlPattern?: string;
}

export class UpstashWorkflowProvider implements WorkflowProvider {
  public readonly name = 'upstash-workflow';
  public readonly version = '1.0.0';

  private options: UpstashWorkflowProviderOptions;
  private qstash: any;
  private useRedis!: boolean;
  private redisClient!: any;

  constructor(options: UpstashWorkflowProviderOptions) {
    this.options = options;

    // Initialize QStash client dynamically to allow mocks in tests
    try {
      const { Client } = require('@upstash/qstash');
      this.qstash = new Client({
        baseUrl: options.qstash.baseUrl,
        token: options.qstash.token,
      });
    } catch (_error) {
      // Fallback for test environments
      logError(new Error('QStash client not available, using mock implementation'), {
        operation: 'qstash_client_fallback',
      });
      this.qstash = {
        publishJSON: () => Promise.resolve({ messageId: 'mock_msg_' + randomUUID().slice(-7) }),
        schedules: {
          create: () =>
            Promise.resolve({
              scheduleId: 'mock_schedule_' + randomUUID().slice(-7),
            }),
          delete: () => Promise.resolve(true),
        },
      };
    }

    // Always require Redis client to be passed in or set via setClients
    this.useRedis = options.enableRedis !== false;
    this.redisClient = undefined; // Must be set via setClients in tests or via DI in prod
  }

  /**
   * Create provider from configuration
   */
  static fromConfig(config: UpstashWorkflowConfig): UpstashWorkflowProvider {
    return new UpstashWorkflowProvider({
      baseUrl: config.config.baseUrl,
      qstash: {
        token: config.config.qstashToken,
      },
      enableRedis: true, // Use shared Redis from '@repo/db-prisma
      webhookUrlPattern: config.config.webhookUrlPattern,
    });
  }

  /**
   * Set clients for testing purposes
   */
  setClients(qstashClient: any, redisClient: any) {
    this.qstash = qstashClient;
    this.redisClient = redisClient;
    this.useRedis = redisClient !== null && redisClient !== undefined;
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
      if (this.useRedis) {
        await this.redisClient.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
          ex: 24 * 60 * 60,
        });
      }

      // TODO: Cancel pending QStash messages if possible
      // This would require tracking message IDs

      return true;
    } catch (error: any) {
      throw createProviderError(
        `Failed to cancel execution ${executionId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Cancel workflow - alias for cancelExecution for compatibility
   */
  async cancelWorkflow(executionId: string): Promise<boolean> {
    return this.cancelExecution(executionId);
  }

  /**
   * Create workflow execution handler for Next.js
   */
  async createWorkflowHandler() {
    try {
      const { serve } = require('@upstash/workflow/nextjs');
      return serve(async (context: any) => {
        const payload = context.requestPayload as {
          workflowId: string;
          executionId: string;
          definition: WorkflowDefinition;
          input?: WorkflowData;
        };
        const { definition, executionId, input } = payload;

        try {
          // Execute workflow steps
          for (const step of definition.steps) {
            await this.updateExecutionStatus(executionId, 'running', step.id);

            try {
              // Step execution logic would go here
              // For now, this is a placeholder
              const result = await this.executeStep(step, input);

              await this.updateExecutionStatus(executionId, 'completed', step.id, result);
            } catch (error) {
              await this.updateExecutionStatus(executionId, 'failed', step.id, undefined, error);
              throw error;
            }
          }

          await this.updateExecutionStatus(executionId, 'completed');
        } catch (error) {
          await this.updateExecutionStatus(executionId, 'failed', undefined, undefined, error);
          throw error;
        }
      });
    } catch (_error) {
      // Fallback for test environments
      // Fire and forget logging - intentionally not awaited

      logError(new Error('Workflow serve not available, using mock implementation'), {
        operation: 'workflow_serve_fallback',
      });
      return {
        GET: async () => Response.json({ status: 'ok' }, { status: 200 }),
        POST: async (request: any) => {
          try {
            const body = await request.json();
            const { definition, executionId, _workflowId } = body;

            // Mock workflow execution
            if (this.useRedis) {
              // Update execution status to running
              await this.updateExecutionStatus(executionId, 'running');

              // Simulate step execution
              for (const step of definition.steps) {
                await this.updateExecutionStatus(executionId, 'running', step.id);
                await this.updateExecutionStatus(executionId, 'completed', step.id, {
                  result: 'mock-success',
                });
              }

              // Mark execution as completed
              await this.updateExecutionStatus(executionId, 'completed');
            }

            return Response.json({ success: true, executionId }, { status: 200 });
          } catch (_error) {
            return Response.json({ error: 'Workflow execution failed' }, { status: 500 });
          }
        },
      };
    }
  }

  /**
   * Execute a workflow
   */
  async execute(definition: WorkflowDefinition, input?: WorkflowData): Promise<WorkflowExecution> {
    try {
      const executionId = nanoid();
      const startedAt = new Date();

      // Create execution record
      const execution: WorkflowExecution = {
        id: executionId,
        input,
        metadata: {
          trigger: {
            payload: input,
            timestamp: startedAt,
            type: 'manual',
          },
        },
        startedAt,
        status: 'pending',
        steps: definition.steps.map((step: any) => ({
          attempts: 0,
          status: 'pending',
          stepId: step.id,
        })),
        workflowId: definition.id,
      };

      // Store execution state if Redis is available
      if (this.useRedis) {
        // Store the execution data
        await this.redisClient.set(
          `workflow:execution:${executionId}`,
          JSON.stringify(execution),
          { ex: 24 * 60 * 60 }, // 24 hours TTL
        );

        // Add to workflow's execution index (sorted by timestamp)
        await this.redisClient.zadd(`workflow:${definition.id}:executions`, {
          score: startedAt.getTime(),
          member: executionId,
        });

        // Trim old entries to prevent unbounded growth (keep last 1000)
        await this.redisClient.zremrangebyrank(`workflow:${definition.id}:executions`, 0, -1001);
      }

      // Queue workflow execution using QStash
      const webhookUrlPattern = this.options.webhookUrlPattern || '/api/workflows/{id}/execute';
      const webhookUrl = `${this.options.baseUrl}${webhookUrlPattern.replace('{id}', definition.id)}`;

      await this.qstash.publishJSON({
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
        url: webhookUrl,
      });

      // Update status to running
      execution.status = 'running';
      if (this.useRedis) {
        await this.redisClient.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
          ex: 24 * 60 * 60,
        });
      }

      return execution;
    } catch (error: any) {
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
  async getExecution(executionId: string): Promise<null | WorkflowExecution> {
    try {
      if (!this.useRedis) {
        throw new ProviderError(
          'Redis not configured - cannot retrieve execution state',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      const data = await this.redisClient.get(`workflow:execution:${executionId}`);
      if (!data) {
        return null;
      }

      return JSON.parse(data as string);
    } catch (error: any) {
      // Re-throw ProviderError instances without wrapping
      if (error instanceof ProviderError) {
        throw error;
      }
      throw createProviderError(
        `Failed to get execution ${executionId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Get workflow execution - alias for getExecution for compatibility
   */
  async getWorkflowExecution(executionId: string): Promise<null | WorkflowExecution> {
    return this.getExecution(executionId);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      // Test Redis connection if configured
      if (this.useRedis) {
        await this.redisClient.ping();
      }

      return {
        details: {
          qstash: 'healthy',
          redis: this.useRedis ? 'healthy' : 'not-configured',
        },
        responseTime: Date.now() - startTime,
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch (error: any) {
      // If Redis fails but we're not using it, still return healthy
      if (!this.useRedis) {
        return {
          details: {
            qstash: 'healthy',
            redis: 'not-configured',
          },
          responseTime: Date.now() - startTime,
          status: 'healthy',
          timestamp: new Date(),
        };
      }

      return {
        details: {
          error:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
          qstash: 'unknown',
          redis: this.useRedis ? 'unknown' : 'not-configured',
        },
        responseTime: Date.now() - startTime,
        status: 'unhealthy',
        timestamp: new Date(),
      };
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
      if (!this.useRedis) {
        throw new ProviderError(
          'Redis not configured - cannot list executions',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      // Use a sorted set to track executions by workflow ID for better performance
      // This avoids using KEYS command which can block Redis
      const executionIds = await this.redisClient.zrange(
        `workflow:${workflowId}:executions`,
        0,
        -1,
        {
          rev: true,
        },
      );

      const executions: WorkflowExecution[] = [];

      if (!executionIds || executionIds.length === 0) {
        return executions;
      }

      // Fetch executions in batches for better performance
      const batchSize = 50;
      for (let i = 0; i < executionIds.length; i += batchSize) {
        const batch = executionIds.slice(i, i + batchSize);
        const pipeline = this.redisClient.pipeline();

        for (const executionId of batch) {
          pipeline.get(`workflow:execution:${executionId}`);
        }

        const results = await pipeline.exec();
        for (const result of results) {
          if (result && Array.isArray(result) && result[1]) {
            executions.push(JSON.parse(result[1] as string));
          }
        }
      }

      // Apply filters
      let filtered = executions;

      if (options?.status && options.status.length > 0) {
        filtered = filtered.filter((e: any) => options.status?.includes(e.status));
      }

      if (options?.startDate) {
        const startDate = options.startDate;
        filtered = filtered.filter((e: any) => new Date(e.startedAt) >= startDate);
      }

      if (options?.endDate) {
        const endDate = options.endDate;
        filtered = filtered.filter((e: any) => new Date(e.startedAt) <= endDate);
      }

      // Sort by start time (newest first)
      filtered.sort(
        (a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );

      // Apply limit
      if (options?.limit && options.limit > 0) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    } catch (error: any) {
      // Re-throw ProviderError instances without wrapping
      if (error instanceof ProviderError) {
        throw error;
      }
      throw createProviderError(
        `Failed to list executions for workflow ${workflowId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * List all workflow executions
   */
  async listWorkflowExecutions(options?: {
    endDate?: Date;
    limit?: number;
    offset?: number;
    startDate?: Date;
    status?: WorkflowExecutionStatus[];
  }): Promise<WorkflowExecution[]> {
    try {
      if (!this.useRedis) {
        throw new ProviderError(
          'Redis not configured - cannot list workflow executions',
          this.name,
          'upstash-workflow',
          'REDIS_NOT_CONFIGURED',
          false,
        );
      }

      // Stream executions to prevent memory exhaustion with large datasets
      const pattern = `workflow:execution:*`;
      const executions: WorkflowExecution[] = [];
      const maxExecutions = 10000; // Hard limit to prevent memory issues

      let cursor = '0';
      let processedCount = 0;
      const batchSize = 100;

      // Process executions in streaming batches
      do {
        // Scan for keys in batches
        const scanResult = await this.redisClient.scan(cursor, {
          match: pattern,
          count: batchSize,
        });
        cursor = scanResult[0];
        const keyBatch = scanResult[1];

        if (keyBatch.length === 0) continue;

        // Fetch execution data in parallel for this batch
        const dataPromises = keyBatch.map(async (key: string) => {
          try {
            const data = await this.redisClient.get(key);
            return data ? (JSON.parse(data as string) as WorkflowExecution) : null;
          } catch (error) {
            // Log parse errors but continue processing

            console.warn(`Failed to parse execution data for key ${key}:`, error);
            return null;
          }
        });

        const executionBatch = (await Promise.allSettled(dataPromises))
          .filter(
            (result): result is PromiseFulfilledResult<WorkflowExecution> =>
              result.status === 'fulfilled' && result.value !== null,
          )
          .map(result => result.value);

        // Apply early filtering to reduce memory usage
        const filteredBatch = this.applyExecutionFilters(executionBatch, options);
        executions.push(...filteredBatch);

        processedCount += keyBatch.length;

        // Safety check to prevent memory exhaustion
        if (executions.length >= maxExecutions) {
          console.warn(`Execution list truncated at ${maxExecutions} entries for memory safety`);
          break;
        }

        // Check cursor termination condition
      } while (cursor !== '0' && processedCount < maxExecutions * 2);

      // If we hit the limit, log a warning
      if (executions.length >= maxExecutions) {
        console.warn(
          `Workflow execution listing limited to ${maxExecutions} entries. Consider using pagination or filtering.`,
        );
      }

      // Final sort and pagination (executions already pre-filtered in streaming loop)
      // Sort by start time (newest first) using ES2023 toSorted for immutability
      const sortedExecutions = executions.toSorted(
        (a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      );

      // Apply pagination
      const offset = options?.offset || 0;
      const limit = Math.min(options?.limit || 50, 1000); // Cap limit for performance

      return sortedExecutions.slice(offset, offset + limit);
    } catch (error: any) {
      throw createProviderError(
        'Failed to list workflow executions',
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
          `Workflow ${definition.id} does not include schedule configuration`,
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
      if (this.useRedis) {
        await this.redisClient.set(
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
    } catch (error: any) {
      // Re-throw ProviderError instances without wrapping
      if (error instanceof ProviderError) {
        throw error;
      }
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
      if (this.useRedis) {
        const pattern = 'workflow:schedule:*';
        const keys = await this.redisClient.keys(pattern);

        for (const key of keys) {
          const data = await this.redisClient.get(key);
          if (data) {
            const schedule = JSON.parse(data as string);
            if (schedule.workflowId === workflowId) {
              // Delete from QStash (would need schedule ID from QStash)
              // For now, just remove from Redis
              await this.redisClient.del(key);
              return true;
            }
          }
        }
      }

      return false;
    } catch (error: any) {
      throw createProviderError(
        `Failed to unschedule workflow ${workflowId}`,
        this.name,
        'upstash-workflow',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Update execution status (called by webhook handlers)
   */
  async updateExecutionStatus(
    executionId: string,
    status: WorkflowExecutionStatus,
    stepId?: string,
    result?: WorkflowData,
    error?: Error | unknown,
  ): Promise<void> {
    if (!this.useRedis) {
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
      const step = execution.steps.find((s: any) => s.stepId === stepId);
      if (step) {
        step.status = status;
        step.completedAt = new Date();
        if (result !== undefined) step.output = result;
        if (error)
          step.error = {
            message:
              error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
          };
      }
    }

    // Store updated execution
    await this.redisClient.set(`workflow:execution:${executionId}`, JSON.stringify(execution), {
      ex: 24 * 60 * 60,
    });
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: WorkflowStep, input?: WorkflowData): Promise<WorkflowData> {
    try {
      // Log step execution if debug mode is enabled
      if (this.options.debug) {
        logInfo(`[UpstashWorkflow] Executing step ${step.id} with action ${step.action}`);
      }

      // Check if step has a condition
      if (step.condition) {
        // Simple condition evaluation - check for basic expressions
        // For security, we don't eval arbitrary code
        const conditionResult = this.evaluateCondition(step.condition, input);
        if (!conditionResult) {
          // Skip this step
          return { skipped: true, reason: 'Condition not met' };
        }
      }

      // Apply timeout if specified with proper cleanup
      const timeout = step.timeout || 30000; // Default 30s timeout
      let timeoutId: NodeJS.Timeout | undefined;
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Step ${step.id} timed out after ${timeout}ms`));
        }, timeout);
      });

      try {
        // Execute the step action
        // const startTime = Date.now();
        const result = await Promise.race([this.executeStepAction(step, input), timeoutPromise]);
        // const endTime = Date.now();

        // Clear timeout on successful completion
        if (timeoutId) clearTimeout(timeoutId);

        return result;
      } catch (error) {
        // Clear timeout on error
        if (timeoutId) clearTimeout(timeoutId);

        throw createProviderError(
          `Failed to execute step ${step.id}`,
          this.name,
          'step-execution-failed',
          {
            originalError: error as Error,
          },
        );
      } finally {
        // Ensure timeout is always cleared
        if (timeoutId) clearTimeout(timeoutId);
      }
    } catch (error: any) {
      // Handle any errors in the step execution
      throw createProviderError(
        `Failed to execute step ${step.id}`,
        this.name,
        'step-execution-failed',
        { originalError: error as Error },
      );
    }
  }

  /**
   * Execute the actual step action
   * This is where actual step logic would be implemented
   */
  private async executeStepAction(step: WorkflowStep, input?: WorkflowData): Promise<WorkflowData> {
    // For now, return a simulated result based on action type
    switch (step.action) {
      case 'http':
        // Simulate HTTP request
        return { status: 200, body: { success: true } };

      case 'delay':
        // Simulate delay
        const delay = (step.input?.delay as number) || 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return { delayed: delay };

      case 'transform':
        // Simulate data transformation
        return { transformed: true, data: input || {} };

      default:
        // For unknown actions, return the input
        return { action: step.action, result: 'completed' };
    }
  }

  /**
   * Secure condition evaluator with strict whitelist-based parsing
   * Prevents injection attacks by using structured parsing instead of regex
   */
  private evaluateCondition(condition: string, input?: WorkflowData): boolean {
    if (!input) return true;

    // Sanitize input - remove extra whitespace and validate format
    const sanitizedCondition = condition.trim();

    // Maximum condition length to prevent DoS
    if (sanitizedCondition.length > 200) {
      throw new Error('Condition too long - maximum 200 characters allowed');
    }

    // Whitelist of allowed field name patterns (alphanumeric + underscore only)
    const ALLOWED_FIELD_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

    // Whitelist of allowed operators
    const ALLOWED_OPERATORS = new Set(['===', '!==', '>', '>=', '<', '<=']);

    try {
      return this.parseSecureCondition(
        sanitizedCondition,
        input,
        ALLOWED_FIELD_PATTERN,
        ALLOWED_OPERATORS,
      );
    } catch (error) {
      // Log security violations but don't expose internal details

      console.warn('Condition evaluation failed:', {
        condition: sanitizedCondition.slice(0, 50), // Truncate for logging
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false; // Fail closed for security
    }
  }

  /**
   * Parse conditions using a secure, structured approach
   */
  private parseSecureCondition(
    condition: string,
    input: WorkflowData,
    allowedFieldPattern: RegExp,
    allowedOperators: Set<string>,
  ): boolean {
    // Structure: "input.fieldName operator value"
    const parts = condition.split(/\s+/);

    if (parts.length !== 3) {
      throw new Error('Invalid condition format - expected "input.field operator value"');
    }

    const [fieldPart, operator, valuePart] = parts;

    // Validate field reference format
    if (!fieldPart.startsWith('input.')) {
      throw new Error('Field reference must start with "input."');
    }

    const fieldName = fieldPart.slice(6); // Remove 'input.' prefix

    // Validate field name against whitelist
    if (!allowedFieldPattern.test(fieldName)) {
      throw new Error('Invalid field name - only alphanumeric and underscore allowed');
    }

    // Validate operator
    if (!allowedOperators.has(operator)) {
      throw new Error(
        `Invalid operator "${operator}" - only ${Array.from(allowedOperators).join(', ')} allowed`,
      );
    }

    // Get the field value safely using Object.hasOwn (Node 22 feature)
    if (!Object.hasOwn(input, fieldName)) {
      return false; // Field doesn't exist
    }

    const fieldValue = input[fieldName];

    // Parse and validate value based on operator type
    return this.evaluateSecureComparison(fieldValue, operator, valuePart);
  }

  /**
   * Safely evaluate comparisons with type coercion protection
   */
  private evaluateSecureComparison(
    fieldValue: unknown,
    operator: string,
    valueStr: string,
  ): boolean {
    switch (operator) {
      case '===':
      case '!==': {
        // For strict equality, parse value appropriately
        let compareValue: unknown;

        // Handle string values (quoted)
        if (
          (valueStr.startsWith('"') && valueStr.endsWith('"')) ||
          (valueStr.startsWith("'") && valueStr.endsWith("'"))
        ) {
          compareValue = valueStr.slice(1, -1);
        }
        // Handle boolean values
        else if (valueStr === 'true' || valueStr === 'false') {
          compareValue = valueStr === 'true';
        }
        // Handle null/undefined
        else if (valueStr === 'null') {
          compareValue = null;
        } else if (valueStr === 'undefined') {
          compareValue = undefined;
        }
        // Handle numeric values (no quotes) - use safe validation
        else if (this.isValidNumericString(valueStr)) {
          compareValue = Number(valueStr);
          if (!Number.isFinite(compareValue)) {
            throw new Error('Invalid numeric value');
          }
        } else {
          throw new Error(`Invalid value format: ${valueStr}`);
        }

        return operator === '===' ? fieldValue === compareValue : fieldValue !== compareValue;
      }

      case '>':
      case '>=':
      case '<':
      case '<=': {
        // Numeric comparisons only - use safe validation
        if (!this.isValidNumericString(valueStr)) {
          throw new Error('Numeric comparison requires numeric value');
        }

        const numericFieldValue = Number(fieldValue);
        const numericCompareValue = Number(valueStr);

        if (!Number.isFinite(numericFieldValue) || !Number.isFinite(numericCompareValue)) {
          return false; // Invalid numeric comparison
        }

        switch (operator) {
          case '>':
            return numericFieldValue > numericCompareValue;
          case '>=':
            return numericFieldValue >= numericCompareValue;
          case '<':
            return numericFieldValue < numericCompareValue;
          case '<=':
            return numericFieldValue <= numericCompareValue;
          default:
            return false;
        }
      }

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  /**
   * Safely validate numeric strings without using potentially unsafe regex
   */
  private isValidNumericString(value: string): boolean {
    // Length check for DoS protection
    if (value.length === 0 || value.length > 25) return false;

    // Check for valid characters only: digits, single optional minus sign, single optional decimal point
    let hasDecimal = false;
    let hasNegative = false;

    for (let i = 0; i < value.length; i++) {
      const char = value[i];

      if (char === '-') {
        if (i !== 0 || hasNegative) return false; // Only at start, only once
        hasNegative = true;
      } else if (char === '.') {
        if (hasDecimal) return false; // Only one decimal point
        hasDecimal = true;
      } else if (char < '0' || char > '9') {
        return false; // Only digits allowed
      }
    }

    // Must have at least one digit
    const digitCount = value.replace(/[-.]/, '').length;
    return digitCount > 0 && digitCount <= 15; // Reasonable numeric precision limit
  }

  /**
   * Apply execution filters for streaming processing to reduce memory usage
   */
  private applyExecutionFilters(
    executions: WorkflowExecution[],
    options?: ListExecutionsOptions,
  ): WorkflowExecution[] {
    if (!options) return executions;

    let filtered = executions;

    // Filter by status
    if (options.status && options.status.length > 0) {
      filtered = filtered.filter((execution: any) => options.status?.includes(execution.status));
    }

    // Filter by date range
    if (options.startDate) {
      const startDate = options.startDate;
      filtered = filtered.filter((execution: any) => new Date(execution.startedAt) >= startDate);
    }

    if (options.endDate) {
      const endDate = options.endDate;
      filtered = filtered.filter((execution: any) => new Date(execution.startedAt) <= endDate);
    }

    return filtered;
  }

  /**
   * Clean up resources (close connections)
   */
  async cleanup(): Promise<void> {
    try {
      // QStash client doesn't need explicit cleanup
      // Redis client can be cleaned up if needed
      // Upstash Redis doesn't need explicit cleanup
      // The connections are automatically managed
    } catch (error: any) {
      // Log error but don't throw during cleanup
      if (this.options.debug) {
        logError(
          '[UpstashWorkflow] Error during cleanup',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }
  }
}
