// import { database } from '@repo/database'; // TODO: Enable when database is migrated
import { devLog as logger } from '@repo/orchestration';

import { platformAnalytics } from './platform-analytics';
// import type { Prisma } from '@repo/database';

// Temporary mock database object
const database = {
  workflowConfig: {
    findUnique: async () => null,
    update: async (args: any) => ({ id: 'mock-id', ...args.data }),
    upsert: async (args: any) => ({ id: 'mock-id', ...args.create }),
  },
  workflowExecution: {
    count: async () => 0,
    findMany: async () => [],
    upsert: async (args: any) => ({ id: 'mock-id', ...args.create }),
  },
  workflowSchedule: {
    create: async (args: any) => ({ id: 'mock-id', ...args.data }),
    findMany: async () => [],
    findUnique: async () => null,
    update: async (args: any) => ({ id: 'mock-id', ...args.data }),
  },
} as any;

/**
 * Workflow Configuration Service
 * Manages workflow configurations in PostgreSQL.
 * Workflows are dynamically registered - database records only exist when
 * explicitly enabled/configured by users.
 */

export interface WorkflowConfigInput {
  category?: string;
  customPayload?: Record<string, any>;
  description?: string;
  displayName?: string;
  isEnabled?: boolean;
  maxConcurrent?: number;
  maxRetries?: number;
  metadata?: Record<string, any>;
  notificationEmail?: string;
  notifyOnApproval?: boolean;
  notifyOnComplete?: boolean;
  notifyOnFailure?: boolean;
  notifyOnStart?: boolean;
  organizationId?: string;
  priority?: number;
  rateLimitPerHour?: number;
  tags?: string[];
  timeoutSeconds?: number;
  userId?: string;
  workflowSlug: string;
}

export class WorkflowConfigService {
  /**
   * Get workflow configuration (returns null if not configured)
   */
  static async getConfig(
    workflowSlug: string,
    options: { organizationId?: string; userId?: string },
  ): Promise<any | null> {
    try {
      const { organizationId, userId } = options;

      if (organizationId) {
        return await database.workflowConfig.findUnique({
          include: {
            schedules: {
              where: { isActive: true },
            },
          },
          where: {
            workflowSlug_organizationId: { organizationId, workflowSlug },
          },
        });
      } else if (userId) {
        return await database.workflowConfig.findUnique({
          include: {
            schedules: {
              where: { isActive: true },
            },
          },
          where: {
            workflowSlug_userId: { userId, workflowSlug },
          },
        });
      }

      return null;
    } catch (error) {
      logger.error('Failed to get workflow config:', error);
      return null;
    }
  }

  /**
   * Enable and configure a workflow
   */
  static async enableWorkflow(input: WorkflowConfigInput, createdBy?: string): Promise<any> {
    try {
      const { organizationId, userId, workflowSlug, ...config } = input;

      // Ensure only one of organizationId or userId is provided
      if (organizationId && userId) {
        throw new Error('Cannot set both organizationId and userId for workflow config');
      }

      if (!organizationId && !userId) {
        throw new Error('Must provide either organizationId or userId');
      }

      const uniqueWhere = organizationId
        ? { workflowSlug_organizationId: { organizationId, workflowSlug } }
        : { workflowSlug_userId: { userId: userId!, workflowSlug } };

      const result = await database.workflowConfig.upsert({
        create: {
          isEnabled: true,
          organizationId,
          userId,
          workflowSlug,
          ...config,
          createdBy,
          customPayload: config.customPayload as any,
          metadata: config.metadata as any,
        },
        update: {
          isEnabled: true,
          ...config,
          customPayload: config.customPayload as any,
          metadata: config.metadata as any,
        },
        where: uniqueWhere as any,
      });

      logger.info('Enabled workflow configuration', {
        configId: result.id,
        organizationId,
        userId,
        workflowSlug,
      });

      platformAnalytics.track('workflow.config.enabled', {
        hasCustomSettings: Object.keys(config).length > 0,
        organizationId,
        userId,
        workflowSlug,
      });

      return result;
    } catch (error) {
      logger.error('Failed to enable workflow:', error);
      throw error;
    }
  }

  /**
   * Disable a workflow
   */
  static async disableWorkflow(
    workflowSlug: string,
    options: { organizationId?: string; userId?: string },
  ): Promise<boolean> {
    try {
      const config = await this.getConfig(workflowSlug, options);
      if (!config) return false;

      await database.workflowConfig.update({
        data: { isEnabled: false },
        where: { id: config.id },
      });

      logger.info('Disabled workflow configuration', {
        configId: config.id,
        workflowSlug,
      });

      platformAnalytics.track('workflow.config.disabled', {
        organizationId: options.organizationId,
        userId: options.userId,
        workflowSlug,
      });

      return true;
    } catch (error) {
      logger.error('Failed to disable workflow:', error);
      return false;
    }
  }

  /**
   * Check if a workflow is enabled
   */
  static async isEnabled(
    workflowSlug: string,
    options: { organizationId?: string; userId?: string },
  ): Promise<boolean> {
    const config = await this.getConfig(workflowSlug, options);
    return config?.isEnabled || false;
  }

  /**
   * Get notification settings for a workflow
   */
  static async getNotificationSettings(
    workflowSlug: string,
    options: { organizationId?: string; userId?: string },
  ): Promise<{
    onStart: boolean;
    onComplete: boolean;
    onFailure: boolean;
    onApproval: boolean;
    recipientEmail?: string;
  }> {
    const config = await this.getConfig(workflowSlug, options);

    if (!config) {
      // Return defaults from notification service
      return {
        onApproval: false,
        onComplete: false,
        onFailure: true, // Always notify on failure by default
        onStart: false,
        recipientEmail: undefined,
      };
    }

    return {
      onApproval: config.notifyOnApproval,
      onComplete: config.notifyOnComplete,
      onFailure: config.notifyOnFailure,
      onStart: config.notifyOnStart,
      recipientEmail: config.notificationEmail,
    };
  }

  /**
   * Get execution limits for a workflow
   */
  static async getExecutionLimits(
    workflowSlug: string,
    options: { organizationId?: string; userId?: string },
  ): Promise<{
    maxRetries: number;
    timeoutSeconds: number;
    rateLimitPerHour: number;
    maxConcurrent: number;
    priority: number;
  }> {
    const config = await this.getConfig(workflowSlug, options);

    // Default limits if not configured
    const defaults = {
      maxConcurrent: 5,
      maxRetries: 3,
      priority: 5,
      rateLimitPerHour: 60,
      timeoutSeconds: 300, // 5 minutes
    };

    if (!config) return defaults;

    return {
      maxConcurrent: config.maxConcurrent ?? defaults.maxConcurrent,
      maxRetries: config.maxRetries ?? defaults.maxRetries,
      priority: config.priority ?? defaults.priority,
      rateLimitPerHour: config.rateLimitPerHour ?? defaults.rateLimitPerHour,
      timeoutSeconds: config.timeoutSeconds ?? defaults.timeoutSeconds,
    };
  }

  /**
   * Create a schedule for a workflow
   */
  static async createSchedule(data: {
    workflowSlug: string;
    organizationId?: string;
    userId?: string;
    name: string;
    description?: string;
    cronExpression: string;
    timezone?: string;
    payload: Record<string, any>;
    validUntil?: Date;
    createdBy?: string;
  }): Promise<any> {
    try {
      // First ensure the workflow is enabled
      const config = await this.getConfig(data.workflowSlug, {
        organizationId: data.organizationId,
        userId: data.userId,
      });

      if (!config) {
        // Auto-enable the workflow when creating a schedule
        const enableResult = await this.enableWorkflow(
          {
            isEnabled: true,
            organizationId: data.organizationId,
            userId: data.userId,
            workflowSlug: data.workflowSlug,
          },
          data.createdBy,
        );

        config.id = enableResult.id;
      }

      const schedule = await database.workflowSchedule.create({
        data: {
          validUntil: data.validUntil,
          name: data.name,
          configId: config.id,
          createdBy: data.createdBy,
          cronExpression: data.cronExpression,
          description: data.description,
          nextRunAt: this.calculateNextRun(data.cronExpression),
          payload: data.payload as any,
          timezone: data.timezone || 'UTC',
        },
      });

      logger.info('Created workflow schedule', {
        cronExpression: data.cronExpression,
        scheduleId: schedule.id,
        workflowSlug: data.workflowSlug,
      });

      platformAnalytics.track('workflow.schedule.created', {
        cronExpression: data.cronExpression,
        scheduleId: schedule.id,
        workflowSlug: data.workflowSlug,
      });

      return schedule;
    } catch (error) {
      logger.error('Failed to create workflow schedule:', error);
      throw error;
    }
  }

  /**
   * Get active schedules
   */
  static async getActiveSchedules(options?: {
    organizationId?: string;
    userId?: string;
  }): Promise<any[]> {
    try {
      const where: any = {
        config: {
          isEnabled: true,
        },
        isActive: true,
      };

      if (options?.organizationId) {
        where.config.organizationId = options.organizationId;
      }
      if (options?.userId) {
        where.config.userId = options.userId;
      }

      return await database.workflowSchedule.findMany({
        include: {
          config: true,
        },
        orderBy: { nextRunAt: 'asc' },
        where,
      });
    } catch (error) {
      logger.error('Failed to get active schedules:', error);
      return [];
    }
  }

  /**
   * Get schedules due for execution
   */
  static async getDueSchedules(): Promise<any[]> {
    try {
      return await database.workflowSchedule.findMany({
        include: {
          config: true,
        },
        where: {
          config: {
            isEnabled: true,
          },
          isActive: true,
          nextRunAt: {
            lte: new Date(),
          },
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        },
      });
    } catch (error) {
      logger.error('Failed to get due schedules:', error);
      return [];
    }
  }

  /**
   * Update schedule after run
   */
  static async updateScheduleRun(
    scheduleId: string,
    status: 'completed' | 'failed' | 'skipped',
  ): Promise<void> {
    try {
      const schedule = await database.workflowSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) return;

      await database.workflowSchedule.update({
        data: {
          lastRunAt: new Date(),
          lastRunStatus: status,
          totalRuns: { increment: 1 },
          ...(status === 'completed' && { successfulRuns: { increment: 1 } }),
          ...(status === 'failed' && { failedRuns: { increment: 1 } }),
          nextRunAt: this.calculateNextRun(schedule.cronExpression),
        },
        where: { id: scheduleId },
      });
    } catch (error) {
      logger.error('Failed to update schedule run:', error);
    }
  }

  /**
   * Record workflow execution
   */
  static async recordExecution(data: {
    workflowRunId: string;
    workflowSlug: string;
    userId?: string;
    organizationId?: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    inputPayload?: Record<string, any>;
    error?: string;
    errorType?: string;
    duration?: number;
    stepCount?: number;
    completedSteps?: number;
    triggeredBy: string;
    triggerSource?: string;
    parentExecutionId?: string;
    creditsUsed?: number;
    apiCallCount?: number;
  }): Promise<any> {
    try {
      // Generate payload hash for deduplication (simple hash for now)
      const inputPayloadHash = data.inputPayload
        ? JSON.stringify(data.inputPayload)
            .split('')
            .reduce((acc, char) => {
              return (acc << 5) - acc + char.charCodeAt(0);
            }, 0)
            .toString(36)
        : undefined;

      const execution = await database.workflowExecution.upsert({
        create: {
          apiCallCount: data.apiCallCount || 0,
          completedSteps: data.completedSteps || 0,
          creditsUsed: data.creditsUsed || 0,
          error: data.error,
          errorType: data.errorType,
          inputPayloadHash,
          organizationId: data.organizationId,
          parentExecutionId: data.parentExecutionId,
          status: data.status,
          stepCount: data.stepCount || 0,
          tags: [],
          triggeredBy: data.triggeredBy,
          triggerSource: data.triggerSource,
          userId: data.userId,
          workflowRunId: data.workflowRunId,
          workflowSlug: data.workflowSlug,
        },
        update: {
          apiCallCount: data.apiCallCount,
          completedAt: ['cancelled', 'completed', 'failed'].includes(data.status)
            ? new Date()
            : undefined,
          completedSteps: data.completedSteps,
          creditsUsed: data.creditsUsed,
          duration: data.duration,
          error: data.error,
          errorType: data.errorType,
          hasOutput: data.status === 'completed',
          status: data.status,
        },
        where: { workflowRunId: data.workflowRunId },
      });

      // Track execution
      platformAnalytics.track('workflow.execution.recorded', {
        duration: data.duration,
        organizationId: data.organizationId,
        status: data.status,
        triggeredBy: data.triggeredBy,
        userId: data.userId,
        workflowRunId: data.workflowRunId,
        workflowSlug: data.workflowSlug,
      });

      return execution;
    } catch (error) {
      logger.error('Failed to record workflow execution:', error);
      throw error;
    }
  }

  /**
   * Get execution history
   */
  static async getExecutionHistory(options: {
    workflowSlug?: string;
    userId?: string;
    organizationId?: string;
    status?: string;
    triggeredBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ executions: any[]; total: number }> {
    try {
      const where: any = {};

      if (options.workflowSlug) where.workflowSlug = options.workflowSlug;
      if (options.userId) where.userId = options.userId;
      if (options.organizationId) where.organizationId = options.organizationId;
      if (options.status) where.status = options.status;
      if (options.triggeredBy) where.triggeredBy = options.triggeredBy;

      const [executions, total] = await Promise.all([
        database.workflowExecution.findMany({
          orderBy: { startedAt: 'desc' },
          skip: options.offset || 0,
          take: options.limit || 50,
          where,
        }),
        database.workflowExecution.count({ where }),
      ]);

      return { executions, total };
    } catch (error) {
      logger.error('Failed to get execution history:', error);
      return { executions: [], total: 0 };
    }
  }

  /**
   * Get workflow analytics
   */
  static async getWorkflowAnalytics(
    workflowSlug: string,
    timeRange: { from: Date; to: Date },
    options?: { userId?: string; organizationId?: string },
  ): Promise<{
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    statusBreakdown: Record<string, number>;
    errorTypes: Record<string, number>;
    triggerBreakdown: Record<string, number>;
    totalCreditsUsed: number;
  }> {
    try {
      const where: any = {
        startedAt: {
          gte: timeRange.from,
          lte: timeRange.to,
        },
        workflowSlug,
      };

      if (options?.userId) where.userId = options.userId;
      if (options?.organizationId) where.organizationId = options.organizationId;

      const executions = await database.workflowExecution.findMany({
        select: {
          creditsUsed: true,
          duration: true,
          errorType: true,
          status: true,
          triggeredBy: true,
        },
        where,
      });

      const totalExecutions = executions.length;
      const completedExecutions = executions.filter((e: any) => e.status === 'completed');
      const successRate =
        totalExecutions > 0 ? (completedExecutions.length / totalExecutions) * 100 : 0;

      const durations = executions
        .filter((e: any) => e.duration !== null)
        .map((e: any) => e.duration as number);
      const averageDuration =
        durations.length > 0
          ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length
          : 0;

      const statusBreakdown: Record<string, number> = {};
      const errorTypes: Record<string, number> = {};
      const triggerBreakdown: Record<string, number> = {};
      let totalCreditsUsed = 0;

      executions.forEach((e: any) => {
        statusBreakdown[e.status] = (statusBreakdown[e.status] || 0) + 1;
        triggerBreakdown[e.triggeredBy] = (triggerBreakdown[e.triggeredBy] || 0) + 1;
        totalCreditsUsed += e.creditsUsed;

        if (e.errorType) {
          errorTypes[e.errorType] = (errorTypes[e.errorType] || 0) + 1;
        }
      });

      return {
        averageDuration,
        errorTypes,
        statusBreakdown,
        successRate,
        totalCreditsUsed,
        totalExecutions,
        triggerBreakdown,
      };
    } catch (error) {
      logger.error('Failed to get workflow analytics:', error);
      return {
        averageDuration: 0,
        errorTypes: {},
        statusBreakdown: {},
        successRate: 0,
        totalCreditsUsed: 0,
        totalExecutions: 0,
        triggerBreakdown: {},
      };
    }
  }

  /**
   * Calculate next run time for cron expression
   */
  private static calculateNextRun(_cronExpression: string): Date {
    // TODO: Implement proper cron parsing with cron-parser
    // For now, return next hour
    const next = new Date();
    next.setHours(next.getHours() + 1);
    next.setMinutes(0);
    next.setSeconds(0);
    next.setMilliseconds(0);
    return next;
  }
}
