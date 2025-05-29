import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

import { CRON_PATTERNS } from '../types';

import type { ScheduledWorkflowPayload, WorkflowContext } from '../types';

export interface CreateScheduleOptions {
  cron: string;
  data: unknown;
  headers?: Record<string, string>;
  retries?: number;
  scheduleId?: string;
  workflowUrl: string;
}

/**
 * Create a scheduled workflow
 */
export async function createSchedule(options: CreateScheduleOptions) {
  const client = new Client({
    baseUrl: process.env.QSTASH_URL,
    token: process.env.QSTASH_TOKEN!,
  });

  const { cron, data, headers, retries = 3, scheduleId, workflowUrl } = options;

  const schedule = await client.schedules.create({
    body: JSON.stringify(data),
    cron,
    destination: workflowUrl,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    retries,
    scheduleId,
  });

  return schedule;
}

/**
 * List all schedules
 */
export async function listSchedules() {
  const client = new Client({
    baseUrl: process.env.QSTASH_URL,
    token: process.env.QSTASH_TOKEN!,
  });

  return client.schedules.list();
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: string) {
  const client = new Client({
    baseUrl: process.env.QSTASH_URL,
    token: process.env.QSTASH_TOKEN!,
  });

  await client.schedules.delete(scheduleId);
}

/**
 * Create a simple scheduled workflow handler
 */
export function createScheduledWorkflow<T = unknown>(
  handler: (context: WorkflowContext<T>, data: T) => Promise<unknown>,
) {
  return serve<ScheduledWorkflowPayload>(
    async (context) => {
      const { data } = context.requestPayload;
      return handler(context as any, data as T);
    },
    {
      verbose: true,
    },
  );
}

// Pre-configured scheduled workflow patterns
export const scheduledWorkflows = {
  /**
   * Daily backup workflow
   */
  dailyBackup: createScheduledWorkflow<{ backupType: string }>(async (context, { backupType }) => {
    const backupId = await context.run('create-backup', async () => {
      // Implement backup logic
      return `backup-${Date.now()}`;
    });

    await context.run('upload-backup', async () => {
      // Upload to cloud storage
      console.log(`Uploading ${backupType} backup ${backupId}`);
    });

    return { backupId, timestamp: new Date().toISOString() };
  }),

  /**
   * Hourly health check workflow
   */
  hourlyHealthCheck: createScheduledWorkflow<{ endpoints: string[] }>(
    async (context, { endpoints }) => {
      const results = await Promise.all(
        endpoints.map((endpoint, index) =>
          context.run(`check-${index}`, async () => {
            try {
              const response = await context.call(`health-check-${endpoint}`, {
                url: endpoint,
                method: 'GET',
                timeout: 5000,
              });
              return { endpoint, status: response.status, success: true };
            } catch (error) {
              return {
                endpoint,
                error: (error as Error).message || 'Unknown error',
                success: false,
              };
            }
          }),
        ),
      );

      return {
        healthy: results.every((r) => r.success),
        results,
        timestamp: new Date().toISOString(),
      };
    },
  ),

  /**
   * Weekly summary workflow
   */
  weeklySummary: createScheduledWorkflow<{ userId: string; email: string }>(
    async (context, { email, userId }) => {
      const summary = await context.run('generate-summary', async () => {
        // Generate user summary
        return {
          generatedAt: new Date().toISOString(),
          period: 'week',
          userId,
        };
      });

      await context.run('send-email', async () => {
        // Send email
        console.log(`Sending weekly summary to ${email}`);
      });

      return summary;
    },
  ),
};

// Helper to schedule common patterns
export const scheduleHelpers = {
  /**
   * Schedule a daily backup
   */
  async scheduleDailyBackup(backupType: string, hour = 0) {
    const cron = `0 ${hour} * * *`; // Daily at specified hour
    return createSchedule({
      cron,
      data: { backupType },
      scheduleId: `daily-backup-${backupType}`,
      workflowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/backup`,
    });
  },

  /**
   * Schedule hourly health checks
   */
  async scheduleHourlyHealthCheck(endpoints: string[]) {
    return createSchedule({
      cron: CRON_PATTERNS.everyHour,
      data: { endpoints },
      scheduleId: 'hourly-health-check',
      workflowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/health-check`,
    });
  },

  /**
   * Schedule user-specific weekly summary
   */
  async scheduleWeeklySummary(userId: string, email: string, dayOfWeek = 1) {
    const cron = `0 9 * * ${dayOfWeek}`; // Weekly at 9 AM on specified day
    return createSchedule({
      cron,
      data: { email, userId },
      scheduleId: `weekly-summary-${userId}`,
      workflowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/workflow/weekly-summary`,
    });
  },

  /**
   * Enhanced monitoring with comprehensive scheduling
   */
  async scheduleComprehensiveMonitoring(config: {
    monitorName: string;
    endpoints: string[];
    intervalMinutes: number;
    thresholds?: { responseTime: number; errorRate: number };
    alertChannels?: string[];
  }) {
    const scheduler = createWorkflowScheduler();
    return scheduler.createMonitoringSchedule({
      intervalMinutes: config.intervalMinutes,
      monitorConfig: {
        alertChannels: config.alertChannels,
        endpoints: config.endpoints,
        thresholds: config.thresholds,
      },
      monitorName: config.monitorName,
      workflowUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/kitchen-sink-workflow`,
    });
  },
};
