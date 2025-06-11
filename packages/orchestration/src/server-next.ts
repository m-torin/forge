/**
 * Next.js Server Integration
 * API route helpers and middleware for workflow management in Next.js applications
 */

import { type NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { z } from 'zod';

import type {
  AlertRule,
  ExecutionHistory,
  WorkflowAlert,
  WorkflowMetrics,
} from './shared/features/monitoring';
import type { EnhancedScheduleConfig, ScheduleStatus } from './shared/features/scheduler';
import type { WorkflowDefinition, WorkflowProvider } from './shared/types/index';
import { createRateLimiter, createRateLimitHeaders, type RateLimitConfig } from './shared/utils/rate-limit';
import { 
  validateRequestBody, 
  validatePathParams,
  validateQueryParams,
  commonSchemas,
  apiSchemas,
} from './shared/utils/input-validation';
import { createSafeLogger, createMaskedError } from './shared/utils/data-masking';

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
  /** Redis instance for rate limiting */
  redis?: Redis;
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
    } catch (error) {
      console.error('API route error:', error);
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
     * Cancel execution
     */
    async cancelExecution(executionId: string): Promise<void> {
      await provider.cancelExecution(executionId);
    },

    /**
     * Create schedule
     */
    async createSchedule(workflowId: string, config: EnhancedScheduleConfig): Promise<string> {
      // This would call a schedule provider method
      // For now, this is a placeholder
      return 'placeholder_schedule_id'; // await provider.createSchedule(workflowId, config);
    },

    /**
     * Execute workflow (Server Action)
     */
    async executeWorkflow(workflowId: string, input?: unknown): Promise<string> {
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
     * Update schedule
     */
    async updateSchedule(
      scheduleId: string,
      config: Partial<EnhancedScheduleConfig>,
    ): Promise<void> {
      // This would call a schedule provider method
      // await provider.updateSchedule(scheduleId, config);
    },
  };
}

/**
 * Create workflow API route handlers
 */
export function createWorkflowApi(config: WorkflowApiConfig) {
  const { onError, provider, rateLimit, redis } = config;
  
  // Create rate limiter if configured
  const rateLimiter = rateLimit && redis ? createRateLimiter({ ...rateLimit, redis }) : null;
  
  // Create safe logger
  const logger = createSafeLogger('WorkflowAPI');

  /**
   * Error handler wrapper
   */
  async function handleError(error: Error, request: NextRequest): Promise<NextResponse> {
    // Use safe logger to mask sensitive data
    logger.error('Workflow API error', error);

    if (onError) {
      try {
        const maskedError = createMaskedError(error);
        const result = onError(maskedError, request);
        return result instanceof Promise ? await result : result;
      } catch (onErrorError) {
        logger.error('Error in onError handler', onErrorError);
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
      { params }: { params: { alertId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // Apply rate limiting
        if (rateLimiter) {
          const rateLimitResult = await rateLimiter.limit(request);
          if (!rateLimitResult.success) {
            return NextResponse.json(
              { error: 'Too many requests', reason: rateLimitResult.reason },
              { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
            );
          }
        }
        const body = await request.json();
        const note = body.note;

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
      { params }: { params: { executionId: string; workflowId: string } },
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
      { params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const rule: Omit<AlertRule, 'createdAt' | 'id'> = body.rule;

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
      { params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const config: EnhancedScheduleConfig = body.config;

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
      { params }: { params: { scheduleId: string; workflowId: string } },
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
      { params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        // Validate path parameters
        const validatedParams = validatePathParams(
          z.object({ workflowId: commonSchemas.workflowId }),
          params
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
          validatedBody.input || {}
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
      { params }: { params: { workflowId: string } },
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
      { params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const status = url.searchParams.get('status') as ExecutionHistory['status'] | undefined;
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const timeRange =
          startTime && endTime
            ? {
                end: new Date(endTime),
                start: new Date(startTime),
              }
            : undefined;

        // This would call an execution history provider method
        // For now, this is a placeholder
        const executions: ExecutionHistory[] = []; // await provider.getExecutionHistory(params.workflowId, { limit, offset, status, timeRange });

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
      { params }: { params: { executionId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const execution = await provider.getExecution(params.executionId);
        if (!execution) {
          return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
        }

        return NextResponse.json({ execution });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Get schedule status
     * GET /api/workflows/[workflowId]/schedules/[scheduleId]
     */
    async getSchedule(
      request: NextRequest,
      { params }: { params: { scheduleId: string; workflowId: string } },
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
      { params }: { params: { workflowId: string } },
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
      { params }: { params: { workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const url = new URL(request.url);
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const timeRange =
          startTime && endTime
            ? {
                end: new Date(endTime),
                start: new Date(startTime),
              }
            : undefined;

        // This would call a metrics provider method
        // For now, this is a placeholder
        const metrics: null | WorkflowMetrics = null; // await provider.getWorkflowMetrics(params.workflowId, timeRange);

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
        const tags = url.searchParams.get('tags')?.split(',');
        const status = url.searchParams.get('status') || undefined;

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
      { params }: { params: { scheduleId: string; workflowId: string } },
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
      { params }: { params: { alertId: string; workflowId: string } },
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
      { params }: { params: { scheduleId: string; workflowId: string } },
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
      { params }: { params: { scheduleId: string; workflowId: string } },
    ): Promise<NextResponse> {
      try {
        const body = await request.json();
        const config: Partial<EnhancedScheduleConfig> = body.config;

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
export function createWorkflowMiddleware(config: WorkflowApiConfig) {
  const api = createWorkflowApi(config);

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
      if (config.rateLimit && config.redis) {
        const rateLimiter = createRateLimiter({ ...config.rateLimit, redis: config.redis });
        const rateLimitResult = await rateLimiter.limit(request);
        
        if (!rateLimitResult.success) {
          return NextResponse.json(
            { error: 'Too many requests', reason: rateLimitResult.reason },
            { status: 429, headers: createRateLimitHeaders(rateLimitResult) }
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
    } catch (error) {
      const logger = createSafeLogger('WebhookHandler');
      logger.error('Webhook processing error', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  };
}

/**
 * Validation utilities for API requests
 */
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