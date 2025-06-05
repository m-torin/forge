import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

import { createWorkflowError } from '../../utils/error-handling';
import { createErrorMessage, validatePayload } from '../../utils/helpers';
import { devLog } from '../../utils/observability';

import type { ScheduledWorkflowPayload, WorkflowContext } from '../../utils/types';

/**
 * QStash Schedules Management
 * Comprehensive API for creating, managing, and monitoring scheduled workflow runs
 *
 * Features:
 * - Create recurring schedules with cron expressions
 * - Per-user/tenant scheduling
 * - Schedule management (pause, resume, delete)
 * - Schedule monitoring and logs
 */

export interface ScheduleConfig {
  body?: unknown;
  cron: string;
  delay?: string;
  destination: string;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
  headers?: Record<string, string>;
  retries?: number;
  scheduleId: string;
  timeout?: string;
}

export interface PerUserScheduleConfig {
  cronExpression: string;
  schedulePrefix?: string; // e.g., "user-summary"
  startDelay?: number; // days to wait before first run
  userData: unknown;
  userIdentifier: string; // email, userId, etc.
  workflowUrl: string;
}

export interface ScheduleUpdateConfig {
  body?: unknown;
  cron?: string;
  destination?: string;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
  headers?: Record<string, string>;
  retries?: number;
  scheduleId: string;
  timeout?: string;
}

export interface ScheduleInfo {
  body?: unknown;
  createdAt: number;
  cron: string;
  destination: string;
  headers?: Record<string, string>;
  isPaused: boolean;
  nextRun: number;
  retries: number;
  scheduleId: string;
  timeout?: string;
}

/**
 * Enhanced QStash Schedules Client
 */
export class WorkflowScheduler {
  private client: Client;

  constructor(options: { token?: string; baseUrl?: string } = {}) {
    this.client = new Client({
      baseUrl: options.baseUrl,
      token: options.token || process.env.QSTASH_TOKEN!,
    });
  }

  /**
   * Create a recurring workflow schedule
   */
  async createSchedule(config: ScheduleConfig): Promise<{ scheduleId: string }> {
    const schedule = await this.client.schedules.create({
      body: config.body ? JSON.stringify(config.body) : undefined,
      cron: config.cron,
      delay: config.delay,
      destination: config.destination,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      retries: config.retries,
      scheduleId: config.scheduleId,
      timeout: config.timeout,
    });

    return { scheduleId: schedule.scheduleId };
  }

  /**
   * Create a per-user schedule (e.g., weekly summaries)
   */
  async createPerUserSchedule(config: PerUserScheduleConfig): Promise<{ scheduleId: string }> {
    const {
      cronExpression,
      schedulePrefix = 'user-workflow',
      startDelay = 0,
      userData,
      userIdentifier,
      workflowUrl,
    } = config;

    // Create unique schedule ID
    const scheduleId = `${schedulePrefix}-${userIdentifier}`;

    // Calculate start time if delay is specified
    let adjustedCron = cronExpression;
    if (startDelay > 0) {
      const startDate = new Date(Date.now() + startDelay * 24 * 60 * 60 * 1000);
      // Adjust cron to start at the calculated date
      const minutes = startDate.getMinutes();
      const hours = startDate.getHours();
      const dayOfWeek = startDate.getDay();

      // For weekly schedules, adjust the day of week
      if (cronExpression.includes('*') && cronExpression.split(' ').length === 5) {
        adjustedCron = `${minutes} ${hours} * * ${dayOfWeek}`;
      }
    }

    return await this.createSchedule({
      body: userData,
      cron: adjustedCron,
      destination: workflowUrl,
      headers: {
        'X-Schedule-Type': 'per-user',
        'X-User-Identifier': userIdentifier,
      },
      scheduleId,
    });
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(config: ScheduleUpdateConfig): Promise<void> {
    // QStash API doesn't have update method - use delete and recreate pattern
    await this.client.schedules.delete(config.scheduleId);
    await this.createSchedule(config as ScheduleConfig);
  }

  /**
   * Pause a schedule
   */
  async pauseSchedule(scheduleId: string): Promise<void> {
    // @ts-expect-error - QStash types may not include pause method
    await this.client.schedules.pause(scheduleId);
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId: string): Promise<void> {
    // @ts-expect-error - QStash types may not include resume method
    await this.client.schedules.resume(scheduleId);
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string): Promise<void> {
    await this.client.schedules.delete(scheduleId);
  }

  /**
   * Get schedule information
   */
  async getSchedule(scheduleId: string): Promise<ScheduleInfo> {
    const schedule = await this.client.schedules.get(scheduleId);

    return {
      body: schedule.body ? JSON.parse(schedule.body as string) : undefined,
      createdAt: schedule.createdAt,
      cron: schedule.cron,
      destination: schedule.destination,
      headers: (schedule as Record<string, unknown>).header as Record<string, string> || (schedule as Record<string, unknown>).headers as Record<string, string> || {},
      isPaused: schedule.isPaused,
      nextRun: ((schedule as Record<string, unknown>).nextDelivery as number) || ((schedule as Record<string, unknown>).nextRun as number) || 0,
      retries: schedule.retries || 0,
      scheduleId: schedule.scheduleId,
      timeout: ((schedule as Record<string, unknown>).timeoutInSeconds as string) || ((schedule as Record<string, unknown>).timeout as string) || '30',
    };
  }

  /**
   * List all schedules
   */
  async listSchedules(): Promise<ScheduleInfo[]> {
    const schedules = await this.client.schedules.list();

    return schedules.map((schedule) => ({
      body: schedule.body ? JSON.parse(schedule.body as string) : undefined,
      createdAt: schedule.createdAt,
      cron: schedule.cron,
      destination: schedule.destination,
      headers: (schedule as Record<string, unknown>).header as Record<string, string> || (schedule as Record<string, unknown>).headers as Record<string, string> || {},
      isPaused: schedule.isPaused,
      nextRun: ((schedule as Record<string, unknown>).nextDelivery as number) || ((schedule as Record<string, unknown>).nextRun as number) || 0,
      retries: schedule.retries || 0,
      scheduleId: schedule.scheduleId,
      timeout: ((schedule as Record<string, unknown>).timeoutInSeconds as string) || ((schedule as Record<string, unknown>).timeout as string) || '30',
    }));
  }

  /**
   * List schedules by prefix (useful for per-user schedules)
   */
  async listSchedulesByPrefix(prefix: string): Promise<ScheduleInfo[]> {
    const allSchedules = await this.listSchedules();
    return allSchedules.filter((schedule) => schedule.scheduleId.startsWith(prefix));
  }

  /**
   * Get schedule logs
   */
  async getScheduleLogs(
    scheduleId: string,
    cursor?: string,
  ): Promise<{
    logs: ScheduleLog[];
    cursor?: string;
  }> {
    // QStash API may not have logs method - use type assertion as fallback
    try {
      // @ts-expect-error - QStash types may not include logs method
      const response = await this.client.schedules.logs?.(scheduleId, { cursor });
      if (!response) {
        return { cursor: undefined, logs: [] };
      }
      return {
        cursor: response.cursor,
        logs: response.logs.map((log: Record<string, unknown>) => ({
          url: log.url,
          body: log.body,
          createdAt: log.createdAt,
          header: log.header,
          messageId: log.messageId,
          method: log.method,
          responseBody: log.responseBody,
          responseHeader: log.responseHeader,
          responseStatus: log.responseStatus,
          scheduleId: log.scheduleId,
          status: log.status,
        })),
      };
    } catch {
      // Fallback if logs method doesn't exist
      return { cursor: undefined, logs: [] };
    }
  }

  /**
   * Helper: Create daily backup schedule
   */
  async createDailyBackup(options: {
    scheduleId: string;
    workflowUrl: string;
    hour?: number;
    minute?: number;
    backupConfig?: unknown;
  }): Promise<{ scheduleId: string }> {
    const { backupConfig, hour = 2, minute = 0, scheduleId, workflowUrl } = options;

    return await this.createSchedule({
      body: {
        type: 'backup',
        config: backupConfig,
        scheduledAt: new Date().toISOString(),
      },
      cron: `${minute} ${hour} * * *`, // Daily at specified time
      destination: workflowUrl,
      scheduleId,
    });
  }

  /**
   * Helper: Create weekly user summary schedule
   */
  async createWeeklyUserSummary(options: {
    userId: string;
    userEmail: string;
    workflowUrl: string;
    dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
    hour?: number;
    startDelayDays?: number;
  }): Promise<{ scheduleId: string }> {
    const {
      dayOfWeek = 1, // Monday
      hour = 9, // 9 AM
      startDelayDays = 7,
      userEmail,
      userId,
      workflowUrl,
    } = options;

    return await this.createPerUserSchedule({
      cronExpression: `0 ${hour} * * ${dayOfWeek}`, // Weekly
      schedulePrefix: 'user-summary',
      startDelay: startDelayDays,
      userData: {
        type: 'weekly-summary',
        email: userEmail,
        userId,
      },
      userIdentifier: userEmail,
      workflowUrl,
    });
  }

  /**
   * Helper: Create monitoring schedule
   */
  async createMonitoringSchedule(options: {
    monitorName: string;
    workflowUrl: string;
    intervalMinutes: number;
    monitorConfig?: unknown;
  }): Promise<{ scheduleId: string }> {
    const { intervalMinutes, monitorConfig, monitorName, workflowUrl } = options;

    // Convert interval to cron expression
    let cron: string;
    if (intervalMinutes >= 60) {
      const hours = Math.floor(intervalMinutes / 60);
      cron = `0 */${hours} * * *`; // Every N hours
    } else {
      cron = `*/${intervalMinutes} * * * *`; // Every N minutes
    }

    return await this.createSchedule({
      body: {
        type: 'monitoring',
        config: monitorConfig,
        monitor: monitorName,
      },
      cron,
      destination: workflowUrl,
      scheduleId: `monitor-${monitorName}`,
    });
  }
}

export interface ScheduleLog {
  body: string;
  createdAt: number;
  header: Record<string, string>;
  messageId: string;
  method: string;
  responseBody?: string;
  responseHeader?: Record<string, string>;
  responseStatus?: number;
  scheduleId: string;
  status: string;
  url: string;
}

/**
 * Context helper for workflow scheduling
 */
export async function scheduleWorkflow(
  context: WorkflowContext<unknown>,
  stepName: string,
  config: ScheduleConfig,
): Promise<{ scheduleId: string }> {
  return await context.run(stepName, async () => {
    const scheduler = new WorkflowScheduler();
    return await scheduler.createSchedule(config);
  });
}

/**
 * Context helper for per-user scheduling
 */
export async function schedulePerUserWorkflow(
  context: WorkflowContext<unknown>,
  stepName: string,
  config: PerUserScheduleConfig,
): Promise<{ scheduleId: string }> {
  return await context.run(stepName, async () => {
    const scheduler = new WorkflowScheduler();
    return await scheduler.createPerUserSchedule(config);
  });
}

/**
 * Factory function to create workflow scheduler
 */
export function createWorkflowScheduler(options?: {
  token?: string;
  baseUrl?: string;
}): WorkflowScheduler {
  return new WorkflowScheduler(options);
}

/**
 * Common cron expressions
 */
export const CronExpressions = {
  DAILY_AT_9AM: '0 9 * * *',
  DAILY_AT_MIDNIGHT: '0 0 * * *',
  EVERY_2_HOURS: '0 */2 * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_12_HOURS: '0 */12 * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_MINUTE: '* * * * *',
  MONTHLY_1ST_9AM: '0 9 1 * *',
  WEEKLY_FRIDAY_5PM: '0 17 * * 5',
  WEEKLY_MONDAY_9AM: '0 9 * * 1',
  YEARLY_JAN_1ST: '0 0 1 1 *',
} as const;

// ============= Additional functions from scheduled.ts =============

export interface CreateScheduleOptions {
  cron: string;
  data: unknown;
  headers?: Record<string, string>;
  retries?: number;
  scheduleId?: string;
  workflowUrl: string;
}

/**
 * Create a scheduled workflow handler with comprehensive error handling
 */
export function createScheduledWorkflow<T = unknown>(
  handler: (context: WorkflowContext<T>, data: T) => Promise<unknown>,
) {
  return serve<ScheduledWorkflowPayload>(
    async (context) => {
      devLog.workflow(context, 'Starting scheduled workflow execution');

      try {
        const payload = context.requestPayload;
        const validation = validatePayload(payload, ['data']);

        if (!validation.valid) {
          devLog.workflow(context, 'Invalid payload received', validation.errors);
          throw createWorkflowError.validation(validation.errors);
        }

        const { data } = payload;
        devLog.workflow(context, 'Processing scheduled workflow data', { dataType: typeof data });

        const result = await handler(context as WorkflowContext<T>, data as T);

        devLog.workflow(context, 'Scheduled workflow completed successfully');
        return result;
      } catch (error) {
        devLog.workflow(context, 'Scheduled workflow failed', error);
        throw error;
      }
    },
    {
      verbose: true,
    },
  );
}

// Pre-configured scheduled workflow patterns
export const scheduledWorkflows = {
  /**
   * Daily backup workflow with enhanced error handling and logging
   */
  dailyBackup: createScheduledWorkflow<{ backupType: string }>(async (context, { backupType }) => {
    devLog.workflow(context, 'Starting daily backup', { backupType });

    const backupId = await context.run('create-backup', async () => {
      devLog.workflow(context, 'Creating backup', { backupType });
      return `backup-${Date.now()}`;
    });

    await context.run('upload-backup', async () => {
      devLog.workflow(context, 'Uploading backup to cloud storage', {
        backupId,
        backupType,
      });
    });

    const result = {
      backupId,
      backupType,
      timestamp: new Date().toISOString(),
    };

    devLog.workflow(context, 'Daily backup completed', result);
    return result;
  }),

  /**
   * Hourly health check workflow with comprehensive error handling
   */
  hourlyHealthCheck: createScheduledWorkflow<{ endpoints: string[] }>(
    async (context, { endpoints }) => {
      devLog.workflow(context, 'Starting health check', {
        endpointCount: endpoints.length,
      });

      const results = await Promise.all(
        endpoints.map((endpoint, index) =>
          context.run(`check-${index}`, async () => {
            try {
              devLog.workflow(context, 'Checking endpoint', { endpoint, index });

              const response = await context.call(`health-check-${endpoint}`, {
                url: endpoint,
                method: 'GET',
                timeout: 5000,
              });

              return { endpoint, status: response.status, success: true };
            } catch (error) {
              devLog.workflow(context, 'Endpoint check failed', {
                endpoint,
                error: createErrorMessage('Health check failed', error),
              });

              return {
                endpoint,
                error: createErrorMessage('Health check failed', error),
                success: false,
              };
            }
          }),
        ),
      );

      const healthyCount = results.filter((r) => r.success).length;
      const result = {
        healthy: results.every((r) => r.success),
        results,
        summary: {
          healthy: healthyCount,
          total: endpoints.length,
          unhealthy: endpoints.length - healthyCount,
        },
        timestamp: new Date().toISOString(),
      };

      devLog.workflow(context, 'Health check completed', {
        healthy: result.healthy,
        summary: result.summary,
      });

      return result;
    },
  ),

  /**
   * Weekly summary workflow with enhanced logging
   */
  weeklySummary: createScheduledWorkflow<{ userId: string; email: string }>(
    async (context, { email, userId }) => {
      devLog.workflow(context, 'Starting weekly summary generation', {
        email,
        userId,
      });

      const summary = await context.run('generate-summary', async () => {
        devLog.workflow(context, 'Generating user summary', { userId });
        return {
          generatedAt: new Date().toISOString(),
          period: 'week',
          userId,
        };
      });

      await context.run('send-email', async () => {
        devLog.workflow(context, 'Sending weekly summary email', {
          email,
          userId,
        });
      });

      devLog.workflow(context, 'Weekly summary workflow completed', {
        generatedAt: summary.generatedAt,
        userId,
      });

      return summary;
    },
  ),
};
