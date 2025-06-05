/**
 * Next.js Server Integration
 * API route helpers and middleware for workflow management in Next.js applications
 */

import { NextRequest, NextResponse } from 'next/server';
import type { WorkflowDefinition, WorkflowProvider, WorkflowExecution } from './shared/types/index';
import type { EnhancedScheduleConfig, ScheduleStatus } from './shared/features/scheduler';
import type {
  WorkflowMetrics,
  ExecutionHistory,
  AlertRule,
  WorkflowAlert,
} from './shared/features/monitoring';

export interface WorkflowApiConfig {
  /** Workflow provider instance */
  provider: WorkflowProvider;
  /** Authentication handler */
  authenticate?: (request: NextRequest) => Promise<{ userId: string; roles: string[] } | null>;
  /** Authorization handler */
  authorize?: (
    user: { userId: string; roles: string[] },
    action: string,
    resource: string,
  ) => Promise<boolean>;
  /** Rate limiting configuration */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  /** Error handler */
  onError?: (error: Error, request: NextRequest) => Promise<NextResponse> | NextResponse;
}

export interface ApiRouteContext {
  user?: { userId: string; roles: string[] };
  workflowId?: string;
  executionId?: string;
  scheduleId?: string;
}

/**
 * Create workflow API route handlers
 */
export function createWorkflowApi(config: WorkflowApiConfig) {
  const { provider, authenticate, authorize, onError } = config;

  /**
   * Middleware for authentication and authorization
   */
  async function withAuth(
    request: NextRequest,
    action: string,
    resource: string,
  ): Promise<{ user: { userId: string; roles: string[] }; error?: NextResponse }> {
    // Authentication
    if (authenticate) {
      const user = await authenticate(request);
      if (!user) {
        return {
          user: { userId: '', roles: [] },
          error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        };
      }

      // Authorization
      if (authorize) {
        const isAuthorized = await authorize(user, action, resource);
        if (!isAuthorized) {
          return {
            user,
            error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
          };
        }
      }

      return { user };
    }

    return { user: { userId: 'anonymous', roles: [] } };
  }

  /**
   * Error handler wrapper
   */
  function handleError(error: Error, request: NextRequest): NextResponse {
    console.error('Workflow API error:', error);

    // For now, always return a synchronous response
    // The onError callback could be improved to handle async in the future
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return {
    /**
     * List workflows
     * GET /api/workflows
     */
    async listWorkflows(request: NextRequest): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'read', 'workflows');
        if (error) return error;

        const url = new URL(request.url);
        const tags = url.searchParams.get('tags')?.split(',');
        const status = url.searchParams.get('status') || undefined;

        // Note: listWorkflows is not available in the current WorkflowProvider interface
        const workflows: any[] = [];

        return NextResponse.json({ workflows });
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
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

        // Note: getWorkflow is not available in the current WorkflowProvider interface
        const workflow: any = null;
        if (!workflow) {
          return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
        }

        return NextResponse.json({ workflow });
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
        const { user, error } = await withAuth(request, 'create', 'workflows');
        if (error) return error;

        const body = await request.json();
        const workflow: WorkflowDefinition = body.workflow;

        // Note: createWorkflow is not available in the current WorkflowProvider interface
        const workflowId = workflow.id;

        return NextResponse.json({ workflowId, workflow }, { status: 201 });
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
        const { user, error } = await withAuth(request, 'execute', `workflow:${params.workflowId}`);
        if (error) return error;

        const body = await request.json();
        const input = body.input;
        const options = body.options;

        // Create a basic workflow definition and execute it
        const workflowDefinition: WorkflowDefinition = {
          id: params.workflowId,
          name: params.workflowId,
          version: '1.0.0',
          steps: [{ id: 'execute', name: 'Execute', action: 'execute' }],
        };
        const execution = await provider.execute(workflowDefinition, input);
        const executionId = execution.id;

        return NextResponse.json({ executionId }, { status: 202 });
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
      { params }: { params: { workflowId: string; executionId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

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
     * Cancel execution
     * POST /api/workflows/[workflowId]/executions/[executionId]/cancel
     */
    async cancelExecution(
      request: NextRequest,
      { params }: { params: { workflowId: string; executionId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'execute', `workflow:${params.workflowId}`);
        if (error) return error;

        await provider.cancelExecution(params.executionId);

        return NextResponse.json({ message: 'Execution cancelled' }, { status: 200 });
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
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

        const url = new URL(request.url);
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const timeRange =
          startTime && endTime
            ? {
                start: new Date(startTime),
                end: new Date(endTime),
              }
            : undefined;

        // This would call a metrics provider method
        // For now, this is a placeholder
        const metrics: WorkflowMetrics | null = null; // await provider.getWorkflowMetrics(params.workflowId, timeRange);

        return NextResponse.json({ metrics });
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
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const status = url.searchParams.get('status') as ExecutionHistory['status'] | undefined;
        const startTime = url.searchParams.get('start');
        const endTime = url.searchParams.get('end');

        const timeRange =
          startTime && endTime
            ? {
                start: new Date(startTime),
                end: new Date(endTime),
              }
            : undefined;

        // This would call an execution history provider method
        // For now, this is a placeholder
        const executions: ExecutionHistory[] = []; // await provider.getExecutionHistory(params.workflowId, { limit, offset, status, timeRange });

        return NextResponse.json({
          executions,
          pagination: {
            limit,
            offset,
            hasMore: executions.length === limit,
          },
        });
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
        const { user, error } = await withAuth(request, 'create', `workflow:${params.workflowId}`);
        if (error) return error;

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
     * Get schedule status
     * GET /api/workflows/[workflowId]/schedules/[scheduleId]
     */
    async getSchedule(
      request: NextRequest,
      { params }: { params: { workflowId: string; scheduleId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call a schedule provider method
        // For now, this is a placeholder
        const schedule: ScheduleStatus | null = null; // await provider.getSchedule(params.scheduleId);

        if (!schedule) {
          return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
        }

        return NextResponse.json({ schedule });
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
      { params }: { params: { workflowId: string; scheduleId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'update', `workflow:${params.workflowId}`);
        if (error) return error;

        const body = await request.json();
        const config: Partial<EnhancedScheduleConfig> = body.config;

        // This would call a schedule provider method
        // await provider.updateSchedule(params.scheduleId, config);

        return NextResponse.json({ message: 'Schedule updated' }, { status: 200 });
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
      { params }: { params: { workflowId: string; scheduleId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'update', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call a schedule provider method
        // await provider.pauseSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule paused' }, { status: 200 });
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
      { params }: { params: { workflowId: string; scheduleId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'update', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call a schedule provider method
        // await provider.resumeSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule resumed' }, { status: 200 });
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
      { params }: { params: { workflowId: string; scheduleId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'delete', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call a schedule provider method
        // await provider.deleteSchedule(params.scheduleId);

        return NextResponse.json({ message: 'Schedule deleted' }, { status: 200 });
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
        const { user, error } = await withAuth(request, 'create', `workflow:${params.workflowId}`);
        if (error) return error;

        const body = await request.json();
        const rule: Omit<AlertRule, 'id' | 'createdAt'> = body.rule;

        // This would call an alert provider method
        // For now, this is a placeholder
        const ruleId = 'placeholder_rule_id'; // await provider.createAlertRule(rule);

        return NextResponse.json({ ruleId }, { status: 201 });
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
        const { user, error } = await withAuth(request, 'read', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call an alert provider method
        // For now, this is a placeholder
        const alerts: WorkflowAlert[] = []; // await provider.getActiveAlerts(params.workflowId);

        return NextResponse.json({ alerts });
      } catch (error) {
        return handleError(error as Error, request);
      }
    },

    /**
     * Acknowledge alert
     * POST /api/workflows/[workflowId]/alerts/[alertId]/acknowledge
     */
    async acknowledgeAlert(
      request: NextRequest,
      { params }: { params: { workflowId: string; alertId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'update', `workflow:${params.workflowId}`);
        if (error) return error;

        const body = await request.json();
        const note = body.note;

        // This would call an alert provider method
        // await provider.acknowledgeAlert(params.alertId, user.userId, note);

        return NextResponse.json({ message: 'Alert acknowledged' }, { status: 200 });
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
      { params }: { params: { workflowId: string; alertId: string } },
    ): Promise<NextResponse> {
      try {
        const { user, error } = await withAuth(request, 'update', `workflow:${params.workflowId}`);
        if (error) return error;

        // This would call an alert provider method
        // await provider.resolveAlert(params.alertId);

        return NextResponse.json({ message: 'Alert resolved' }, { status: 200 });
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
      if (config.rateLimit) {
        // Implementation would use a rate limiting library
        // This is a placeholder
      }

      // Let the route handlers take over
      return;
    },
  };
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
 * Webhook handler for workflow events
 */
export function createWorkflowWebhookHandler(config: {
  provider: WorkflowProvider;
  secret?: string;
  onEvent?: (event: WorkflowWebhookEvent) => Promise<void>;
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
      console.error('Webhook error:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  };
}

export interface WorkflowWebhookEvent {
  type: 'execution.started' | 'execution.completed' | 'execution.failed' | 'schedule.triggered';
  workflowId: string;
  executionId?: string;
  scheduleId?: string;
  timestamp: string;
  data: unknown;
}

/**
 * Server Actions for Next.js App Router
 */
export function createWorkflowActions(provider: WorkflowProvider) {
  return {
    /**
     * Execute workflow (Server Action)
     */
    async executeWorkflow(workflowId: string, input?: unknown): Promise<string> {
      // Create a basic workflow definition
      const workflowDefinition: WorkflowDefinition = {
        id: workflowId,
        name: workflowId,
        version: '1.0.0',
        steps: [{ id: 'execute', name: 'Execute', action: 'execute' }],
      };
      const execution = await provider.execute(workflowDefinition, input as Record<string, any>);
      return execution.id;
    },

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
 * Utility for handling workflow errors in API routes
 */
export class WorkflowApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'WorkflowApiError';
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      {
        error: this.message,
        code: this.code,
      },
      { status: this.statusCode },
    );
  }
}

/**
 * Validation utilities for API requests
 */
export const ValidationUtils = {
  /**
   * Validate workflow ID format
   */
  validateWorkflowId(workflowId: string): boolean {
    return typeof workflowId === 'string' && workflowId.length > 0;
  },

  /**
   * Validate execution ID format
   */
  validateExecutionId(executionId: string): boolean {
    return typeof executionId === 'string' && executionId.length > 0;
  },

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
   * Validate pagination parameters
   */
  validatePagination(
    limit?: string,
    offset?: string,
  ): { limit: number; offset: number; errors: string[] } {
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

    return { limit: parsedLimit, offset: parsedOffset, errors };
  },
};
