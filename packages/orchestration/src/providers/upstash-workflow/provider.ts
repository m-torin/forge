/**
 * Upstash Workflow Provider
 * Implementation of WorkflowProvider interface for Upstash Workflow
 */

import { serve, WorkflowContext } from '@upstash/workflow';
import { Client as QStashClient } from '@upstash/qstash';
import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';
import type {
  WorkflowProvider,
  WorkflowDefinition,
  WorkflowExecutionOptions,
  WorkflowExecutionResult,
  WorkflowStep,
} from '../../shared/types/workflow';
import type { UpstashWorkflowConfig } from '../../shared/types/provider';
import type {
  UpstashWorkflowContext,
  UpstashWorkflowState,
  UpstashStepResult,
  UpstashHealthCheck,
} from './types';
import {
  ProviderInitializationError,
  WorkflowExecutionError,
  WorkflowValidationError,
  StepExecutionError,
  StepValidationError,
  AuthenticationError,
  ErrorUtils,
} from '../../shared/utils/errors';

export class UpstashWorkflowProvider implements WorkflowProvider {
  public readonly name = 'upstash-workflow';
  public readonly version = '1.0.0';

  private qstash?: QStashClient;
  private redis?: Redis;
  private config?: UpstashWorkflowConfig;
  private isInitialized = false;

  async initialize(config: UpstashWorkflowConfig): Promise<void> {
    try {
      this.config = config;

      // Initialize QStash client
      if (!config.qstash?.token) {
        throw new ProviderInitializationError(this.name, 'QStash token is required');
      }

      this.qstash = new QStashClient({
        token: config.qstash.token,
        baseUrl: config.qstash.baseUrl,
      });

      // Initialize Redis client if configured
      if (config.redis?.url && config.redis?.token) {
        this.redis = new Redis({
          url: config.redis.url,
          token: config.redis.token,
        });
      }

      // Verify connections
      await this.healthCheck();

      this.isInitialized = true;

      if (config.debug && config.logger) {
        config.logger.info('Upstash Workflow provider initialized', {
          hasRedis: !!this.redis,
          baseUrl: config.serving?.baseUrl,
        });
      }
    } catch (error) {
      throw new ProviderInitializationError(
        this.name,
        error instanceof Error ? error.message : String(error),
        { originalError: error },
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      const health = await this.healthCheck();
      return health.status !== 'unhealthy';
    } catch {
      return false;
    }
  }

  async run<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>,
    params: TParams,
    options?: WorkflowExecutionOptions,
  ): Promise<WorkflowExecutionResult<TResult>> {
    if (!this.isInitialized || !this.qstash) {
      throw new WorkflowExecutionError(workflow.id, 'unknown', 'Provider not initialized');
    }

    // Validate input if schema provided
    if (workflow.inputSchema) {
      const result = workflow.inputSchema.safeParse(params);
      if (!result.success) {
        throw new WorkflowValidationError(
          workflow.id,
          result.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        );
      }
    }

    const runId = options?.runId || nanoid();

    try {
      // Create workflow state
      const state: UpstashWorkflowState<TParams> = {
        status: 'pending',
        input: params,
        currentStep: 0,
        completedSteps: [],
        stepResults: {},
        state: {},
        runtime: {
          runId,
          attempt: 1,
          environment: this.config?.options?.environment || 'production',
          startedAt: new Date(),
        },
      };

      // Save initial state if persistence enabled
      if (this.redis && this.config?.options?.persistence?.enabled) {
        await this.saveState(runId, state);
      }

      // Prepare workflow endpoint URL
      const baseUrl = this.config?.serving?.baseUrl;
      if (!baseUrl) {
        throw new WorkflowExecutionError(
          workflow.id,
          runId,
          'Base URL not configured for workflow serving',
        );
      }

      const workflowUrl = `${baseUrl}/api/workflows/${workflow.id}`;

      // Schedule workflow execution via QStash
      const message = await this.qstash.publishJSON({
        url: workflowUrl,
        body: {
          runId,
          workflowId: workflow.id,
          params,
          options,
        },
        headers: {
          'X-Workflow-Run-ID': runId,
          'X-Workflow-ID': workflow.id,
        },
        delay: options?.delay
          ? typeof options.delay === 'string'
            ? (options.delay as `${bigint}s` | `${bigint}m` | `${bigint}h` | `${bigint}d`)
            : options.delay
          : undefined,
        retries: workflow.config?.maxRetries || this.config?.qstash.retries?.maxRetries,
        callback: options?.callbacks?.onSuccess,
        failureCallback: options?.callbacks?.onFailure,
      });

      // Update state with message ID
      state.runtime.messageId = 'messageId' in message ? message.messageId : undefined;
      state.status = 'running';

      if (this.redis && this.config?.options?.persistence?.enabled) {
        await this.saveState(runId, state);
      }

      // Return initial execution result
      return {
        runId,
        workflowId: workflow.id,
        status: 'running',
        timing: {
          startedAt: state.runtime.startedAt,
        },
      };
    } catch (error) {
      const wrappedError = ErrorUtils.wrapError(
        error instanceof Error ? error : new Error(String(error)),
        {
          workflowId: workflow.id,
          runId,
        },
      );

      if (this.config?.logger) {
        this.config.logger.error('Failed to run workflow', wrappedError);
      }

      throw wrappedError;
    }
  }

  serve<TParams = any, TResult = any>(
    workflow: WorkflowDefinition<TParams, TResult>,
  ): (req: Request) => Promise<Response> {
    // Create the Upstash workflow handler
    const { handler } = serve<{
      params: TParams;
      runId: string;
      options?: WorkflowExecutionOptions;
    }>(
      async (context) => {
        const { params, runId, options } = context.requestPayload;

        // Create enhanced context
        const enhancedContext: UpstashWorkflowContext = {
          ...context,
          qstash: this.qstash,
          redis: this.redis,
          metadata: {
            workflowId: workflow.id,
            runId,
            ...options?.metadata,
          },
        };

        // Load workflow state if persistence enabled
        let state: UpstashWorkflowState<TParams> | null = null;
        if (this.redis && this.config?.options?.persistence?.enabled) {
          state = await this.loadState(runId);
        }

        try {
          // Execute workflow steps
          let result: any = params;
          const stepResults: Record<string, UpstashStepResult> = state?.stepResults || {};

          for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            const stepStartTime = Date.now();

            // Skip already completed steps
            if (state?.completedSteps.includes(step.name)) {
              result = stepResults[step.name]?.data;
              continue;
            }

            try {
              // Validate step input if schema provided
              if (step.schema?.input) {
                const validation = step.schema.input.safeParse(result);
                if (!validation.success) {
                  throw new StepValidationError(step.name, 'input', validation.error.message, {
                    errors: validation.error.errors,
                  });
                }
              }

              // Execute step with Upstash context.run
              const stepResult = await context.run(step.name, async () => {
                return step.handler(result, {
                  runId,
                  env: enhancedContext.metadata?.environment || 'production',
                  params,
                  metadata: {
                    attemptNumber: context.headers.get('Upstash-Retried')
                      ? parseInt(context.headers.get('Upstash-Retried') || '0') + 1
                      : 1,
                    startedAt: new Date(),
                    triggeredBy: 'qstash',
                    source: context.headers.get('Upstash-Topic') || 'direct',
                  },
                });
              });

              // Validate step output if schema provided
              if (step.schema?.output) {
                const validation = step.schema.output.safeParse(stepResult);
                if (!validation.success) {
                  throw new StepValidationError(step.name, 'output', validation.error.message, {
                    errors: validation.error.errors,
                  });
                }
              }

              // Record step result
              stepResults[step.name] = {
                name: step.name,
                status: 'success',
                data: stepResult,
                duration: Date.now() - stepStartTime,
                retryCount: parseInt(context.headers.get('Upstash-Retried') || '0'),
                timestamp: new Date(),
              };

              // Update state if persistence enabled
              if (this.redis && this.config?.options?.persistence?.enabled) {
                await this.updateState(runId, {
                  currentStep: i + 1,
                  completedSteps: [...(state?.completedSteps || []), step.name],
                  stepResults,
                });
              }

              result = stepResult;
            } catch (error) {
              // Record step failure
              const errorObj = error instanceof Error ? error : new Error(String(error));
              stepResults[step.name] = {
                name: step.name,
                status: 'failure',
                error: {
                  message: errorObj.message,
                  code: (errorObj as any).code || 'STEP_FAILED',
                  stack: errorObj.stack,
                },
                duration: Date.now() - stepStartTime,
                retryCount: parseInt(context.headers.get('Upstash-Retried') || '0'),
                timestamp: new Date(),
              };

              throw new StepExecutionError(
                step.name,
                errorObj.message,
                errorObj,
                workflow.id,
                runId,
              );
            }
          }

          // Validate final output if schema provided
          if (workflow.outputSchema) {
            const validation = workflow.outputSchema.safeParse(result);
            if (!validation.success) {
              throw new WorkflowValidationError(
                workflow.id,
                validation.error.errors.map((e) => ({
                  path: e.path.join('.'),
                  message: e.message,
                })),
              );
            }
          }

          // Update final state
          if (this.redis && this.config?.options?.persistence?.enabled) {
            await this.updateState(runId, {
              status: 'completed',
              stepResults,
            });
          }

          return result as TResult;
        } catch (error) {
          // Update state with error
          const errorObj = error instanceof Error ? error : new Error(String(error));
          if (this.redis && this.config?.options?.persistence?.enabled) {
            await this.updateState(runId, {
              status: 'failed',
              error: {
                message: errorObj.message,
                code: (errorObj as any).code || 'WORKFLOW_FAILED',
                stepName: (errorObj as any).stepName,
                timestamp: new Date(),
              },
            });
          }

          throw errorObj;
        }
      },
      {
        baseUrl: this.config?.serving?.baseUrl || '',
        retries: workflow.config?.maxRetries || this.config?.qstash.retries?.maxRetries,
      },
    );

    // Add authentication if configured
    if (this.config?.serving?.auth) {
      return async (req: Request) => {
        // Validate authentication
        const isAuthenticated = await this.validateAuth(req);
        if (!isAuthenticated) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return handler(req);
      };
    }

    return handler;
  }

  async getStatus(runId: string): Promise<WorkflowExecutionResult> {
    if (!this.isInitialized) {
      throw new WorkflowExecutionError('unknown', runId, 'Provider not initialized');
    }

    // Try to load from persistence
    if (this.redis && this.config?.options?.persistence?.enabled) {
      const state = await this.loadState(runId);
      if (state) {
        return this.stateToExecutionResult(state);
      }
    }

    // If no persistence or state not found, try QStash
    if (this.qstash) {
      try {
        // Note: QStash doesn't provide direct message status API
        // This is a limitation of the current implementation
        // Would need to implement custom tracking via events/webhooks
        return {
          runId,
          workflowId: 'unknown',
          status: 'pending',
          timing: {},
        };
      } catch (error) {
        throw new WorkflowExecutionError(
          'unknown',
          runId,
          `Failed to get workflow status: ${error.message}`,
        );
      }
    }

    throw new WorkflowExecutionError('unknown', runId, 'Workflow status not found');
  }

  async cancel(runId: string): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      // Update state if persistence enabled
      if (this.redis && this.config?.options?.persistence?.enabled) {
        await this.updateState(runId, { status: 'cancelled' });
      }

      // Note: QStash doesn't provide direct message cancellation
      // Would need to implement via dead letter queue or custom logic
      return true;
    } catch {
      return false;
    }
  }

  async list(options?: {
    workflowId?: string;
    status?: WorkflowExecutionResult['status'];
    limit?: number;
    offset?: number;
  }): Promise<WorkflowExecutionResult[]> {
    if (!this.isInitialized) {
      return [];
    }

    const results: WorkflowExecutionResult[] = [];

    // Load from persistence if available
    if (this.redis && this.config?.options?.persistence?.enabled) {
      try {
        const keyPrefix = this.config.redis?.keyPrefix || 'workflow';
        const pattern = `${keyPrefix}:state:*`;

        // Scan for workflow states
        let cursor = 0;
        const limit = options?.limit || 100;

        do {
          const [newCursor, keys] = await this.redis.scan(cursor, {
            match: pattern,
            count: 100,
          });

          cursor = parseInt(newCursor);

          // Load states for found keys
          for (const key of keys) {
            if (results.length >= limit) break;

            const state = await this.redis.get<UpstashWorkflowState>(key);
            if (state) {
              const result = this.stateToExecutionResult(state);

              // Apply filters
              if (options?.workflowId && result.workflowId !== options.workflowId) {
                continue;
              }
              if (options?.status && result.status !== options.status) {
                continue;
              }

              results.push(result);
            }
          }
        } while (cursor !== 0 && results.length < limit);
      } catch (error) {
        if (this.config?.logger) {
          this.config.logger.error('Failed to list workflows', error);
        }
      }
    }

    // Apply offset
    const start = options?.offset || 0;
    return results.slice(start, start + (options?.limit || results.length));
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false;
    this.qstash = undefined;
    this.redis = undefined;
    this.config = undefined;
  }

  /**
   * Private helper methods
   */

  private async healthCheck(): Promise<UpstashHealthCheck> {
    const health: UpstashHealthCheck = {
      status: 'healthy',
      components: {
        qstash: { status: 'unhealthy' },
      },
      timestamp: new Date(),
    };

    // Check QStash
    if (this.qstash) {
      try {
        const start = Date.now();
        // QStash doesn't have a direct health endpoint
        // We'll use a lightweight operation as a proxy
        await this.qstash.publishJSON({
          url: 'https://httpstat.us/200',
          body: { test: true },
          headers: {
            'Upstash-Forward-Upstash-Delay': '0s',
          },
        });

        health.components.qstash = {
          status: 'healthy',
          latency: Date.now() - start,
        };
      } catch (error) {
        health.components.qstash = {
          status: 'unhealthy',
          error: error.message,
        };
        health.status = 'unhealthy';
      }
    }

    // Check Redis if configured
    if (this.redis) {
      try {
        const start = Date.now();
        await this.redis.ping();

        health.components.redis = {
          status: 'healthy',
          latency: Date.now() - start,
        };
      } catch (error) {
        health.components.redis = {
          status: 'unhealthy',
          error: error.message,
        };
        health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      }
    }

    return health;
  }

  private async validateAuth(req: Request): Promise<boolean> {
    const auth = this.config?.serving?.auth;
    if (!auth) return true;

    switch (auth.type) {
      case 'bearer':
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return false;
        }
        const token = authHeader.substring(7);
        return token === auth.token;

      case 'qstash':
        // QStash signature verification
        // This would require implementing QStash webhook verification
        return true;

      case 'custom':
        if (auth.customValidator) {
          return auth.customValidator(req);
        }
        return false;

      default:
        return false;
    }
  }

  private async saveState(runId: string, state: UpstashWorkflowState): Promise<void> {
    if (!this.redis) return;

    const keyPrefix = this.config?.redis?.keyPrefix || 'workflow';
    const key = `${keyPrefix}:state:${runId}`;
    const ttl = this.config?.options?.persistence?.ttl || 86400; // 24 hours default

    await this.redis.setex(key, ttl, JSON.stringify(state));
  }

  private async loadState(runId: string): Promise<UpstashWorkflowState | null> {
    if (!this.redis) return null;

    const keyPrefix = this.config?.redis?.keyPrefix || 'workflow';
    const key = `${keyPrefix}:state:${runId}`;

    const data = await this.redis.get(key);
    if (!data) return null;

    return JSON.parse(data as string);
  }

  private async updateState(runId: string, updates: Partial<UpstashWorkflowState>): Promise<void> {
    if (!this.redis) return;

    const current = await this.loadState(runId);
    if (!current) return;

    const updated = {
      ...current,
      ...updates,
    };

    await this.saveState(runId, updated);
  }

  private stateToExecutionResult(state: UpstashWorkflowState): WorkflowExecutionResult {
    // Convert UpstashStepResult to StepResult
    const steps: Record<string, StepResult> = {};
    for (const [name, upstashResult] of Object.entries(state.stepResults)) {
      steps[name] = {
        success: upstashResult.status === 'success',
        data: upstashResult.data,
        error: upstashResult.error ? new Error(upstashResult.error.message) : undefined,
        duration: upstashResult.duration,
        retryCount: upstashResult.retryCount,
      };
    }

    return {
      runId: state.runtime.runId,
      workflowId: state.runtime.messageId || 'unknown',
      status: state.status,
      result:
        state.status === 'completed' ? Object.values(state.stepResults).pop()?.data : undefined,
      error: state.error,
      steps,
      timing: {
        startedAt: state.runtime.startedAt,
        completedAt:
          state.status === 'completed' || state.status === 'failed' ? new Date() : undefined,
      },
    };
  }
}

/**
 * Factory function to create Upstash Workflow provider
 */
export function createUpstashWorkflowProvider(
  config: UpstashWorkflowConfig,
): Promise<WorkflowProvider> {
  const provider = new UpstashWorkflowProvider();
  return provider.initialize(config).then(() => provider);
}
