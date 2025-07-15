/**
 * Server-side orchestration exports for Next.js
 * API route helpers and middleware for workflow management in Next.js applications
 *
 * This file provides server-side orchestration functionality specifically for Next.js applications.
 * Use this in server components, API routes, middleware, and Next.js server environments.
 *
 * For non-Next.js applications, use '@repo/orchestration/server' instead.
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';

import {
  AlertRule,
  createWorkflowMonitor,
  ExecutionHistory,
  WorkflowAlert,
  WorkflowMetrics,
} from './shared/features/monitoring';
import { EnhancedScheduleConfig, ScheduleStatus } from './shared/features/scheduler';
import { WorkflowData, WorkflowDefinition, WorkflowProvider } from './shared/types/index';
import { createMaskedError } from './shared/utils/data-masking';
import {
  apiSchemas,
  commonSchemas,
  validatePathParams,
  validateRequestBody,
} from './shared/utils/input-validation';
import {
  createRateLimiter as baseCreateRateLimiter,
  createRateLimitHeaders,
  type RateLimitConfig,
} from './shared/utils/rate-limit';

// Export singleton instance using the shared StepRegistry
import { StepRegistry as SharedStepRegistry } from './shared/factories/step-registry';

export interface ApiRouteContext {
  executionId?: string;
  scheduleId?: string;
  workflowId?: string;
}

export interface WorkflowApiConfig {
  /** Error handler */
  onError?: (error: Error, request: NextRequest) => NextResponse | Promise<NextResponse>;
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Rate limiting configuration */
  rateLimit?: RateLimitConfig;
}

export interface WorkflowWebhookEvent {
  data: unknown;
  executionId?: string;
  scheduleId?: string;
  timestamp: string;
  type: 'execution.completed' | 'execution.failed' | 'execution.started' | 'schedule.triggered';
  workflowId: string;
}

/**
 * Utility for handling workflow errors in API routes
 */
export class WorkflowApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'WorkflowApiError';
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      {
        code: this.code,
        error: this.message,
      },
      { status: this.statusCode },
    );
  }
}

/**
 * Utility to create typed API route handlers
 */
export function createApiRoute<T extends Record<string, unknown>>(
  handler: (request: NextRequest, context: { params: T }) => Promise<NextResponse>,
) {
  return async (request: NextRequest, context: { params: T }): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      logError('API route error', error instanceof Error ? error : new Error(String(error)));
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/**
 * Server Actions for Next.js App Router
 */
export function createWorkflowActions(provider: WorkflowProvider) {
  return {
    /**
     * Cancel execution action
     */
    async cancelExecutionAction(executionId: string): Promise<void> {
      'use server';
      await provider.cancelExecution(executionId);
    },

    /**
     * Create schedule action
     */
    async createScheduleAction(
      _workflowId: string,
      _config: EnhancedScheduleConfig,
    ): Promise<string> {
      'use server';
      // This would call a schedule provider method
      // For now, this is a placeholder
      return 'placeholder_schedule_id'; // await provider.createSchedule(workflowId, config);
    },

    /**
     * Execute workflow action
     */
    async executeWorkflowAction(workflowId: string, input?: unknown): Promise<string> {
      'use server';
      // Create a basic workflow definition
      const workflowDefinition: WorkflowDefinition = {
        id: workflowId,
        name: workflowId,
        steps: [{ action: 'execute', id: 'execute', name: 'Execute' }],
        version: '1.0.0',
      };
      const execution = await provider.execute(workflowDefinition, input as WorkflowData);
      return execution.id;
    },

    /**
     * Update schedule action
     */
    async updateScheduleAction(
      _scheduleId: string,
      _config: Partial<EnhancedScheduleConfig>,
    ): Promise<void> {
      'use server';
      // This would call a schedule provider method
      // await provider.updateSchedule(scheduleId, config);
    },
  };
}

/**
 * Create workflow API route handlers
 */
export async function createWorkflowApi(config: WorkflowApiConfig) {
  const { onError, provider, rateLimit } = config;

  // Create rate limiter if configured
  const rateLimiter = rateLimit ? createRateLimiter(rateLimit) : null;

  // Create logger instance

  /**
   * Error handler wrapper
   */
  async function handleError(error: Error, request: NextRequest): Promise<NextResponse> {
    // Log error with observability logger
    logError('Workflow API error', error);

    if (onError) {
      try {
        const maskedError = createMaskedError(error);
        const result = onError(maskedError, request);
        return result instanceof Promise ? await result : result;
      } catch (error) {
        logError(
          'Error in onError handler',
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return {
    /**
     * Acknowledge alert
     * POST /api/workflows/[workflowId]/alerts/[alertId]/acknowledge
     */
    async acknowledgeAlert(
      request: NextRequest,
      { params: _params }: { params: { alertId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // Apply rate limiting if configured
        if (rateLimit && rateLimiter) {
          try {
            const rateLimitResult = await rateLimiter.limit(request);
            if (!rateLimitResult.success) {
              return NextResponse.json(
                { error: 'Too many requests', reason: rateLimitResult.reason },
                { status: 429, headers: createRateLimitHeaders(rateLimitResult) },
              );
            }
          } catch (rateLimitError) {
            // Log rate limiting error but don't block the request
            logWarn('Rate limiting error', {
              error:
                rateLimitError instanceof Error ? rateLimitError.message : String(rateLimitError),
            });
          }
        }
        // Validate request body
        const body = await request.json();
        const validatedBody = validateRequestBody(apiSchemas.acknowledgeAlert, body);
        const _note = validatedBody.note;

        // This would call an alert provider method
        // await provider.acknowledgeAlert(params.alertId, note);

        return NextResponse.json({ message: 'Alert acknowledged' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Cancel execution
     * POST /api/workflows/[workflowId]/executions/[executionId]/cancel
     */
    async cancelExecution(
      request: NextRequest,
      { params: params }: { params: { executionId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        await provider.cancelExecution(params.executionId);

        return NextResponse.json({ message: 'Execution cancelled' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Create alert rule
     * POST /api/workflows/[workflowId]/alerts
     */
    async createAlertRule(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const _rule: Omit<AlertRule, 'createdAt' | 'id'> = body.rule;

        // This would call an alert provider method
        // For now, this is a placeholder
        const ruleId = 'placeholder_rule_id'; // await provider.createAlertRule(rule);

        return NextResponse.json({ ruleId }, { status: 201 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Create schedule
     * POST /api/workflows/[workflowId]/schedules
     */
    async createSchedule(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const _config: EnhancedScheduleConfig = body.config;

        // This would call a schedule provider method
        // For now, this is a placeholder
        const scheduleId = 'placeholder_schedule_id'; // await provider.createSchedule(params.workflowId, config);

        return NextResponse.json({ scheduleId }, { status: 201 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Create workflow
     * POST /api/workflows
     */
    async createWorkflow(request: NextRequest): Promise<NextResponse> {
      try {
        const body = await request.json();
        const workflow: WorkflowDefinition = body.workflow;

        // Note: createWorkflow is not available in the current WorkflowProvider interface
        const workflowId = workflow.id;

        return NextResponse.json({ workflow, workflowId }, { status: 201 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Delete schedule
     * DELETE /api/workflows/[workflowId]/schedules/[scheduleId]
     */
    async deleteSchedule(
      request: NextRequest,
      { params: _params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call a schedule provider method
        // await provider.deleteSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule deleted' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Execute workflow
     * POST /api/workflows/[workflowId]/execute
     */
    async executeWorkflow(
      request: NextRequest,
      { params: params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // Validate path parameters
        const validatedParams = validatePathParams(
          z.object({ workflowId: commonSchemas.workflowId }),
          params,
        );

        // Validate request body
        const body = await request.json();
        const validatedBody = validateRequestBody(apiSchemas.executeWorkflow, body);

        // Create a basic workflow definition and execute it
        const workflowDefinition: WorkflowDefinition = {
          id: validatedParams.workflowId,
          name: validatedParams.workflowId,
          steps: [{ action: 'execute', id: 'execute', name: 'Execute' }],
          version: '1.0.0',
        };
        const execution = await provider.execute(
          workflowDefinition,
          (validatedBody.input || {}) as WorkflowData,
        );
        const executionId = execution.id;

        return NextResponse.json({ executionId }, { status: 202 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get active alerts
     * GET /api/workflows/[workflowId]/alerts
     */
    async getActiveAlerts(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call an alert provider method
        // For now, this is a placeholder
        const alerts: WorkflowAlert[] = []; // await provider.getActiveAlerts(params.workflowId);

        return NextResponse.json({ alerts });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get execution history
     * GET /api/workflows/[workflowId]/history
     */
    async getExecutionHistory(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const _status = url.searchParams.get('status') as ExecutionHistory['status'] | undefined;
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const _timeRange =
          startTime && endTime
            ? {
                end: new Date(endTime),
                start: new Date(startTime),
              }
            : undefined;

        // This would call an execution history provider method
        // For now, this is a placeholder
        const executions: ExecutionHistory[] = []; // await provider.getExecutionHistory(params.workflowId, { limit, offset, status: _status, timeRange: _timeRange });

        return NextResponse.json({
          executions,
          pagination: {
            hasMore: executions.length === limit,
            limit,
            offset,
          },
        });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get execution status
     * GET /api/workflows/[workflowId]/executions/[executionId]
     */
    async getExecutionStatus(
      request: NextRequest,
      { params: params }: { params: { executionId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const execution = await provider.getExecution(params.executionId);
        if (!execution) {
          return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
        }

        return NextResponse.json({ execution });
      } catch {
        return handleError(new Error('Unknown error'), request);
      }
    },

    /**
     * Get schedule status
     * GET /api/workflows/[workflowId]/schedules/[scheduleId]
     */
    async getSchedule(
      request: NextRequest,
      { params: _params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call a schedule provider method
        // For now, this is a placeholder
        const schedule: null | ScheduleStatus = null; // await provider.getSchedule(params.scheduleId);

        if (!schedule) {
          return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        return NextResponse.json({ schedule });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get workflow details
     * GET /api/workflows/[workflowId]
     */
    async getWorkflow(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // Note: getWorkflow is not available in the current WorkflowProvider interface
        const workflow: WorkflowDefinition | null = null;
        if (!workflow) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        return NextResponse.json({ workflow });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get workflow metrics
     * GET /api/workflows/[workflowId]/metrics
     */
    async getWorkflowMetrics(
      request: NextRequest,
      { params: _params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const url = new URL(request.url);
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const _timeRange =
          startTime && endTime
            ? {
                end: new Date(endTime),
                start: new Date(startTime),
              }
            : undefined;

        // This would call a metrics provider method
        // For now, this is a placeholder
        const metrics: null | WorkflowMetrics = null; // await provider.getWorkflowMetrics(params.workflowId, _timeRange);

        return NextResponse.json({ metrics });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * List workflows
     * GET /api/workflows
     */
    async listWorkflows(request: NextRequest): Promise<NextResponse> {
      try {
        const url = new URL(request.url);
        const _tags = url.searchParams.get('tags')?.split(',');
        const _status = url.searchParams.get('status') || undefined;

        // Note: listWorkflows is not available in the current WorkflowProvider interface
        const workflows: WorkflowDefinition[] = [];

        return NextResponse.json({ workflows });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Pause schedule
     * POST /api/workflows/[workflowId]/schedules/[scheduleId]/pause
     */
    async pauseSchedule(
      request: NextRequest,
      { params: _params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call a schedule provider method
        // await provider.pauseSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule paused' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Resolve alert
     * POST /api/workflows/[workflowId]/alerts/[alertId]/resolve
     */
    async resolveAlert(
      request: NextRequest,
      { params: _params }: { params: { alertId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call an alert provider method
        // await provider.resolveAlert(params.alertId);

        return NextResponse.json({ message: 'Alert resolved' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Resume schedule
     * POST /api/workflows/[workflowId]/schedules/[scheduleId]/resume
     */
    async resumeSchedule(
      request: NextRequest,
      { params: _params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // This would call a schedule provider method
        // await provider.resumeSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule resumed' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Update schedule
     * PUT /api/workflows/[workflowId]/schedules/[scheduleId]
     */
    async updateSchedule(
      request: NextRequest,
      { params: _params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const _config: Partial<EnhancedScheduleConfig> = body.config;

        // This would call a schedule provider method
        // await provider.updateSchedule(params.scheduleId, config);

        return NextResponse.json({ message: 'Schedule updated' }, { status: 200 });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },
  };
}

/**
 * Workflow middleware for Next.js
 */
export async function createWorkflowMiddleware(config: WorkflowApiConfig) {
  const api = await createWorkflowApi(config);

  return {
    api,
    /**
     * Middleware function for Next.js
     */
    async middleware(request: NextRequest): Promise<NextResponse | undefined> {
      const { pathname } = request.nextUrl;

      // Skip non-workflow API routes
      if (!pathname.startsWith('/api/workflows')) {
        return;
      }

      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateLimiter = createRateLimiter(config.rateLimit);
        const rateLimitResult = await rateLimiter.limit(request);

        if (!rateLimitResult.success) {
          return NextResponse.json(
            { error: 'Too many requests', reason: rateLimitResult.reason },
            { status: 429, headers: createRateLimitHeaders(rateLimitResult) },
          );
        }

        // Add rate limit headers to successful responses
        const headers = new Headers(createRateLimitHeaders(rateLimitResult));
        return new NextResponse(null, { headers });
      }

      // Let the route handlers take over
      return;
    },
  };
}

/**
 * Webhook handler for workflow events
 */
export function createWorkflowWebhookHandler(config: {
  onEvent?: (event: WorkflowWebhookEvent) => Promise<void>;
  provider: WorkflowProvider;
  secret?: string;
}) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Verify webhook signature if secret is provided
      if (config.secret) {
        // Implementation would verify webhook signature
        // This is a placeholder
      }

      const event: WorkflowWebhookEvent = await request.json();

      // Handle the event
      if (config.onEvent) {
        await config.onEvent(event);
      }

      return NextResponse.json({ message: 'Event processed' }, { status: 200 });
    } catch (error: any) {
      logError(
        'Webhook processing error',
        error instanceof Error ? error : new Error(String(error)),
      );
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  };
}

/**
 * Validation utilities for API requests
 */
// Re-export for workflow compatibility
export const createRateLimiter = baseCreateRateLimiter;

/**
 * Core workflow composition and step creation utilities
 */
export function compose(...steps: Array<any>) {
  return {
    execute: async (input: any) => {
      let result = input;
      for (const step of steps) {
        if (typeof step === 'function') {
          result = await step(result);
        } else if (step && typeof step.execute === 'function') {
          result = await step.execute(result);
        } else {
          throw new Error(`Invalid step in compose: ${step}`);
        }
      }
      return result;
    },
    id: `composed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'composed-workflow',
  };
}

// Overload for backward compatibility
export function createStep(stepFn: (input: any) => Promise<any> | any): any;
export function createStep(
  name: string,
  stepFn: (input: any, context?: any) => Promise<any> | any,
): any;
export function createStep(
  nameOrFn: string | ((input: any) => Promise<any> | any),
  stepFn?: (input: any, context?: any) => Promise<any> | any,
) {
  if (typeof nameOrFn === 'function') {
    return {
      execute: nameOrFn,
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameOrFn.name || 'unnamed-step',
    };
  }
  if (!stepFn) {
    throw new Error('stepFn is required when nameOrFn is a string');
  }
  return {
    execute: stepFn,
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: nameOrFn,
  };
}

export function createStepWithValidation(
  name: string,
  stepFn: (input: any) => Promise<any> | any,
  inputValidator?: (input: any) => boolean,
  outputValidator?: (output: any) => boolean,
  schema?: any,
) {
  return {
    execute: async (input: any) => {
      if (inputValidator && !inputValidator(input)) {
        throw new Error(`Input validation failed for step: ${name}`);
      }

      if (schema) {
        // Use Zod schema validation if provided
        const validated = schema.parse(input);
        const result = await stepFn(validated);

        if (outputValidator && !outputValidator(result)) {
          throw new Error(`Output validation failed for step: ${name}`);
        }

        return result;
      }

      const result = await stepFn(input);

      if (outputValidator && !outputValidator(result)) {
        throw new Error(`Output validation failed for step: ${name}`);
      }

      return result;
    },
    id: `validated-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    schema,
  };
}

export function createWorkflowStep(
  metadata: { name: string; category?: string; tags?: string[]; version?: string },
  stepFn: (context: { input: any }) => Promise<any> | any,
  options: { timeout?: number; retries?: number; circuitBreaker?: boolean } = {},
) {
  return {
    handler: stepFn,
    execute: stepFn,
    id: `workflow-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    metadata,
    name: metadata.name,
    options,
  };
}

export function toSimpleStep(complexStep: any) {
  return {
    execute: complexStep.execute || complexStep,
    id: complexStep.id || `simple-${Date.now()}`,
    name: complexStep.name || 'simple-step',
  };
}

/**
 * Step enhancement decorators
 */
export function withStepCircuitBreaker(
  step: any,
  config: { threshold?: number; resetTimeout?: number } = {},
) {
  const { threshold = 5, resetTimeout = 60000 } = config;
  let failures = 0;
  let lastFailureTime = 0;
  let isOpen = false;

  return {
    ...step,
    execute: async (input: any) => {
      const now = Date.now();

      // Reset circuit breaker if timeout has passed
      if (isOpen && now - lastFailureTime > resetTimeout) {
        isOpen = false;
        failures = 0;
      }

      if (isOpen) {
        throw new Error('Circuit breaker is open');
      }

      try {
        const result = await step.execute(input);
        failures = 0; // Reset on success
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        if (failures >= threshold) {
          isOpen = true;
        }

        throw error;
      }
    },
  };
}

export function withStepMonitoring(
  step: any,
  monitor?: (stepName: string, duration: number, success: boolean) => void,
) {
  return {
    ...step,
    execute: async (input: any) => {
      const startTime = Date.now();
      let success = false;

      try {
        const result = await step.execute(input);
        success = true;
        return result;
      } catch (error) {
        success = false;
        throw error;
      } finally {
        const duration = Date.now() - startTime;
        if (monitor) {
          monitor(step.name, duration, success);
        }
      }
    },
  };
}

export function withStepRetry(
  step: any,
  config: { maxRetries?: number; delay?: number; backoff?: boolean } = {},
) {
  const { maxRetries = 3, delay = 1000, backoff = true } = config;

  return {
    ...step,
    execute: async (input: any) => {
      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await step.execute(input);
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries) {
            const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
            await new Promise((resolve: any) => setTimeout(resolve, waitTime));
          }
        }
      }

      throw lastError;
    },
  };
}

export function withStepTimeout(step: any, timeoutMs: number = 30000) {
  return {
    ...step,
    execute: async (input: any) => {
      return Promise.race([
        step.execute(input),
        new Promise((_resolve, reject) => {
          setTimeout(
            () => reject(new Error(`Step ${step.name} timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    },
  };
}

export function withStepCallback(
  step: any,
  callbacks: {
    onStart?: (input: any) => void;
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
  } = {},
) {
  return {
    ...step,
    execute: async (input: any) => {
      if (callbacks.onStart) {
        callbacks.onStart(input);
      }

      try {
        const result = await step.execute(input);
        if (callbacks.onSuccess) {
          callbacks.onSuccess(result);
        }
        return result;
      } catch (error) {
        if (callbacks.onError) {
          callbacks.onError(error);
        }
        throw error;
      }
    },
  };
}

export function withFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  options?: { logError?: boolean },
): Promise<T>;
export function withFallback(
  step: any,
  fallbackFn: (error: any, input: any) => Promise<any> | any,
): any;
export function withFallback<T>(
  primaryFnOrStep: (() => Promise<T>) | any,
  fallbackFnOrErrorHandler: (() => Promise<T>) | ((error: any, input: any) => Promise<any> | any),
  options?: { logError?: boolean },
): Promise<T> | any {
  if (typeof primaryFnOrStep === 'function' && typeof fallbackFnOrErrorHandler === 'function') {
    // Function overload case
    return (async () => {
      try {
        return await primaryFnOrStep();
      } catch (error) {
        if (options?.logError) {
          logError(
            'Primary function failed, using fallback',
            error instanceof Error ? error : new Error(String(error)),
          );
        }
        return await (fallbackFnOrErrorHandler as () => Promise<T>)();
      }
    })();
  }

  // Step decorator case
  return {
    ...primaryFnOrStep,
    execute: async (input: any) => {
      try {
        return await primaryFnOrStep.execute(input);
      } catch (error) {
        return await (fallbackFnOrErrorHandler as (error: any, input: any) => Promise<any>)(
          error,
          input,
        );
      }
    },
  };
}

/**
 * Workflow-specific rate limiter
 */
export function createWorkflowRateLimiter(config: RateLimitConfig & { workflowId?: string }) {
  return baseCreateRateLimiter(config);
}

/**
 * Batch processing utilities
 */
// Overload for batch processor
export async function processBatch<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  options: {
    concurrency?: number;
    batchSize?: number;
    onProgress?: (processed: number, total: number) => Promise<void>;
    continueOnError?: boolean;
  },
): Promise<{ results: R[]; errors: Array<{ item: T; error: any }> }>;

// Overload for single item processor (backward compatibility)
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options?: { concurrency?: number; batchSize?: number },
): Promise<{ results: R[]; errors: Array<{ item: T; error: any }> }>;

// Implementation
export async function processBatch<T, R>(
  items: T[],
  processor: ((batch: T[]) => Promise<R[]>) | ((item: T) => Promise<R>),
  options: {
    concurrency?: number;
    batchSize?: number;
    onProgress?: (processed: number, total: number) => Promise<void>;
    continueOnError?: boolean;
  } = {},
): Promise<{ results: R[]; errors: Array<{ item: T; error: any }> }> {
  const {
    concurrency: _concurrency = 5,
    batchSize = 10,
    onProgress,
    continueOnError = true,
  } = options;
  const results: R[] = [];
  const errors: Array<{ item: T; error: any }> = [];
  let processed = 0;

  // Determine if processor handles batches or single items
  const isBatchProcessor = processor.length === 1 && typeof processor === 'function';

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    try {
      let batchResults: R[];

      if (isBatchProcessor && batch.length > 1) {
        // Use as batch processor
        batchResults = await (processor as (batch: T[]) => Promise<R[]>)(batch);
      } else {
        // Use as single item processor
        batchResults = await Promise.all(
          batch.map(item => (processor as (item: T) => Promise<R>)(item)),
        );
      }

      results.push(...batchResults);
      processed += batch.length;

      if (onProgress) {
        await onProgress(processed, items.length);
      }
    } catch (error: any) {
      if (continueOnError) {
        batch.forEach((item: any) => errors.push({ item, error }));
        processed += batch.length;

        if (onProgress) {
          await onProgress(processed, items.length);
        }
      } else {
        throw error;
      }
    }
  }

  return { results, errors };
}

export async function processStream<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  onProgress?: (completed: number, total: number, result?: R) => void,
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    const result = await processor(items[i], i);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, items.length, result);
    }
  }

  return results;
}

/**
 * Error handling utilities
 */
export class ErrorAccumulator {
  private errors: Array<{ step: string; error: any; timestamp: Date }> = [];
  private successCount = 0;
  private totalCount = 0;

  addError(step: string, error: any) {
    this.errors.push({ step, error, timestamp: new Date() });
    this.totalCount++;
  }

  addSuccess() {
    this.successCount++;
    this.totalCount++;
  }

  getErrors() {
    return this.errors;
  }

  getSuccessRate() {
    return this.totalCount > 0 ? this.successCount / this.totalCount : 0;
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  clear() {
    this.errors = [];
    this.successCount = 0;
    this.totalCount = 0;
  }
}

export function createErrorAccumulator() {
  return new ErrorAccumulator();
}

export function addError(accumulator: ErrorAccumulator, step: string, error: any) {
  accumulator.addError(step, error);
}

export async function addWarning(_accumulator: ErrorAccumulator, step: string, warning: any) {
  // Add warning to accumulator (implementation depends on ErrorAccumulator interface)
  logWarn(`Warning in step ${step}`, {
    operation: 'workflow_step_warning',
    metadata: { step, warning: warning instanceof Error ? warning.message : String(warning) },
  });
}

export function hasErrors(accumulator: ErrorAccumulator): boolean {
  return accumulator.hasErrors();
}

export function hasCriticalErrors(_accumulator: ErrorAccumulator): boolean {
  // Check if there are critical errors (implementation depends on ErrorAccumulator interface)
  return false; // Default implementation
}

export function getErrorSummary(accumulator: ErrorAccumulator): string {
  const errors = accumulator.getErrors();
  return `Found ${errors.length} errors`;
}

export function addSuccessfulResult(accumulator: ErrorAccumulator) {
  accumulator.addSuccess();
}

export async function addFailedResult(_accumulator: ErrorAccumulator) {
  // Add failed result to accumulator
  logError(new Error('Failed result added to accumulator'), {
    operation: 'workflow_failed_result',
  });
}

export function createPartialSuccessResult(
  data: any,
  errors: any[],
  successCount: number,
  totalCount: number,
) {
  return {
    success: errors.length === 0,
    partial: errors.length > 0 && successCount > 0,
    data,
    errors,
    successCount,
    totalCount,
    successRate: totalCount > 0 ? successCount / totalCount : 0,
  };
}

export function updateSuccessRate(current: number, newSuccesses: number, newTotal: number) {
  return newTotal > 0 ? newSuccesses / newTotal : current;
}

/**
 * Progress reporting - using shared implementation with advanced features
 */
export { ProgressReporter } from './shared/utils/workflow-utilities';

/**
 * Templates and factories
 */
export const StepTemplates = {
  delay: (ms: number) =>
    createStep(async () => {
      await new Promise((resolve: any) => setTimeout(resolve, ms));
    }),

  log: (message: string) =>
    createStep(async (input: any) => {
      logInfo(message, input);
      return input;
    }),

  transform: (fn: (input: any) => any) => createStep(fn),

  validate: (schema: any) =>
    createStepWithValidation('validation-step', (input: any) => input, schema),

  database: (name: string, description?: string) =>
    createStep(async (input: any) => {
      // Mock database operation
      logInfo(`Database operation: ${name}${description ? ` - ${description}` : ''}`, input);
      return input;
    }),

  notification: (message: string, _type: 'info' | 'success' | 'warning' | 'error' = 'info') =>
    createStep(async (input: any) => {
      logInfo(`${message}`, input);
      return input;
    }),

  conditional: (
    stepName: string,
    condition: (input: any) => boolean,
    config: { trueStep?: any; falseStep?: any } = {},
  ) =>
    createStep(stepName, async (input: any) => {
      const { trueStep, falseStep } = config;
      if (condition(input)) {
        if (trueStep) {
          return trueStep.execute ? await trueStep.execute(input) : await trueStep(input);
        }
      } else if (falseStep) {
        return falseStep.execute ? await falseStep.execute(input) : await falseStep(input);
      }
      return input;
    }),

  api: (url: string, options?: any) =>
    createStep(async (input: any) => {
      // Mock API call
      logInfo(`API call to ${url}`, { input, options });
      return { ...input, apiResponse: { status: 'success', url } };
    }),

  cache: (key: string, ttl?: number) =>
    createStep(async (input: any) => {
      // Mock cache operation
      logInfo(`Cache operation with key: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`, input);
      return input;
    }),
};

export const StepFactory = {
  create: createStep,
  createWithValidation: createStepWithValidation,
  createWorkflow: createWorkflowStep,
  toSimple: toSimpleStep,
};

/**
 * Step registry for managing reusable steps
 */
// Use the comprehensive StepRegistry from shared/factories
export { StepRegistry } from './shared/factories/step-registry';
export const stepRegistry = new SharedStepRegistry();

/**
 * Configuration constants
 */
export const CIRCUIT_BREAKER_CONFIGS = {
  DEFAULT: { threshold: 5, resetTimeout: 60000 },
  EXTERNAL_API: { threshold: 5, resetTimeout: 60000 },
  DATABASE: { threshold: 10, resetTimeout: 120000 },
  default: { threshold: 5, resetTimeout: 60000 },
  aggressive: { threshold: 3, resetTimeout: 30000 },
  lenient: { threshold: 10, resetTimeout: 120000 },
};

export const RATE_LIMITER_CONFIGS = {
  low: { maxRequests: 10, windowMs: 60000 },
  medium: { maxRequests: 100, windowMs: 60000 },
  high: { maxRequests: 1000, windowMs: 60000 },
  EXTERNAL_API_MODERATE: { maxRequests: 50, windowMs: 60000 },
  EXTERNAL_API_STRICT: { maxRequests: 20, windowMs: 60000 },
  DATABASE_WRITE: { maxRequests: 100, windowMs: 60000 },
  DATABASE_OPERATIONS: { maxRequests: 200, windowMs: 60000 },
  BULK_OPERATIONS: { maxRequests: 20, windowMs: 60000 },
};

export const RETRY_STRATEGIES = {
  FAIL_FAST: { maxAttempts: 1, delay: 0, backoff: false },
  API_CALL: { maxAttempts: 3, delay: 1000, backoff: true },
  DATABASE_WRITE: { maxAttempts: 3, delay: 500, backoff: true },
  DATABASE: { maxAttempts: 3, delay: 1000, backoff: true },
  linear: { maxRetries: 3, delay: 1000, backoff: false },
  exponential: { maxRetries: 3, delay: 1000, backoff: true },
  aggressive: { maxRetries: 5, delay: 500, backoff: true },
};

// Re-export utilities for external packages
// Note: createSafeLogger has been removed - use @repo/observability instead

export const ValidationUtils = {
  /**
   * Validate schedule configuration
   */
  validateEnhancedScheduleConfig(config: Partial<EnhancedScheduleConfig>): string[] {
    const errors: string[] = [];

    if (config.cron && typeof config.cron !== 'string') {
      errors.push('cron must be a string');
    }

    if (config.timezone && typeof config.timezone !== 'string') {
      errors.push('timezone must be a string');
    }

    if (
      config.maxExecutions &&
      (typeof config.maxExecutions !== 'number' || config.maxExecutions < 1)
    ) {
      errors.push('maxExecutions must be a positive number');
    }

    return errors;
  },

  /**
   * Validate execution ID format
   */
  validateExecutionId(executionId: string): boolean {
    return typeof executionId === 'string' && executionId.length > 0;
  },

  /**
   * Validate pagination parameters
   */
  validatePagination(
    limit?: string,
    offset?: string,
  ): { errors: string[]; limit: number; offset: number } {
    const errors: string[] = [];
    let parsedLimit = 10;
    let parsedOffset = 0;

    if (limit) {
      parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        errors.push('limit must be a number between 1 and 100');
        parsedLimit = 10;
      }
    }

    if (offset) {
      parsedOffset = parseInt(offset);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        errors.push('offset must be a non-negative number');
        parsedOffset = 0;
      }
    }

    return { errors, limit: parsedLimit, offset: parsedOffset };
  },

  /**
   * Validate workflow ID format
   */
  validateWorkflowId(workflowId: string): boolean {
    return typeof workflowId === 'string' && workflowId.length > 0;
  },
};

// Re-export orchestration types and utilities from server.ts
export {
  // Patterns
  BatchManager,
  CircuitBreakerConfigs,
  circuitBreakerManager,
  createOrchestrationError,
  createProviderError,
  createWorkflowEngine,
  createWorkflowExecutionError,
  // Errors
  OrchestrationError,
  OrchestrationErrorCodes,
  // Utils
  OrchestrationManager,
  ProviderError,
  RateLimitProvider,
  RetryStrategies,
  // Providers
  UpstashWorkflowProvider,
  validateProviderConfig,
  validateWorkflowDefinition,
  withBatch,
  withCircuitBreaker,
  withRateLimit,
  withRetry,
  // Re-export from server
  workflowEngine,
  WorkflowExecutionError,
} from './server';

// Re-export types
export type {
  BatchOptions,
  CircuitBreakerOptions,
  OrchestrationManagerConfig,
  RateLimitProviderOptions,
  RetryOptions,
  UpstashWorkflowProviderOptions,
  ValidationError,
} from './server';

// Re-export monitoring utilities
export { createWorkflowMonitor };

// Re-export all shared types
export type * from './shared/types/index';

// Re-export Upstash packages
export { Client as QStashClient, QStashWorkflowAbort } from '@upstash/qstash';

// Export commonSchemas as CommonSchemas for backward compatibility
export { commonSchemas as CommonSchemas } from './shared/utils/input-validation';
