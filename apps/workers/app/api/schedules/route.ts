import {
  createWorkflowScheduler,
  CronExpressions,
  type PerUserScheduleConfig,
  type ScheduleConfig,
} from '@repo/orchestration';

/**
 * Workflow Schedules API
 * Comprehensive management of recurring workflow schedules
 *
 * Features demonstrated:
 * - Create recurring schedules with cron expressions
 * - Per-user scheduling (weekly summaries, etc.)
 * - Schedule management (pause, resume, delete)
 * - Pre-built schedule templates
 * - Schedule monitoring and logs
 */

const scheduler = createWorkflowScheduler();

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'create':
        return handleCreateSchedule(params);
      case 'createPerUser':
        return handleCreatePerUserSchedule(params);
      case 'createTemplate':
        return handleCreateTemplate(params);
      case 'update':
        return handleUpdateSchedule(params);
      case 'pause':
        return handlePauseSchedule(params);
      case 'resume':
        return handleResumeSchedule(params);
      case 'delete':
        return handleDeleteSchedule(params);
      case 'get':
        return handleGetSchedule(params);
      case 'list':
        return handleListSchedules(params);
      case 'logs':
        return handleGetScheduleLogs(params);
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Schedules API error:', error);
    return Response.json(
      { details: (error as Error).message, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function handleCreateSchedule(params: {
  scheduleId: string;
  workflowType?: 'kitchen-sink' | 'basic';
  cron: string;
  payload?: any;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: string;
}) {
  const {
    cron,
    headers,
    payload = {},
    retries,
    scheduleId,
    timeout,
    workflowType = 'kitchen-sink',
  } = params;

  if (!scheduleId || !cron) {
    return Response.json({ error: 'scheduleId and cron are required' }, { status: 400 });
  }

  // Determine the workflow URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3400';

  const workflowUrls = {
    basic: `${baseUrl}/api/basic-workflow`,
    'kitchen-sink': `${baseUrl}/api/kitchen-sink-workflow`,
  };

  const config: ScheduleConfig = {
    body: payload,
    cron,
    destination: workflowUrls[workflowType],
    headers,
    retries,
    scheduleId,
    timeout,
  };

  const result = await scheduler.createSchedule(config);

  return Response.json({
    cron,
    destination: workflowUrls[workflowType],
    scheduleId: result.scheduleId,
    success: true,
  });
}

async function handleCreatePerUserSchedule(params: {
  userIdentifier: string;
  workflowType?: 'kitchen-sink' | 'basic';
  cronExpression: string;
  userData: any;
  startDelay?: number;
  schedulePrefix?: string;
}) {
  const {
    cronExpression,
    schedulePrefix,
    startDelay,
    userData,
    userIdentifier,
    workflowType = 'kitchen-sink',
  } = params;

  if (!userIdentifier || !cronExpression || !userData) {
    return Response.json(
      {
        error: 'userIdentifier, cronExpression, and userData are required',
      },
      { status: 400 },
    );
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3400';

  const workflowUrls = {
    basic: `${baseUrl}/api/basic-workflow`,
    'kitchen-sink': `${baseUrl}/api/kitchen-sink-workflow`,
  };

  const config: PerUserScheduleConfig = {
    cronExpression,
    schedulePrefix,
    startDelay,
    userData,
    userIdentifier,
    workflowUrl: workflowUrls[workflowType],
  };

  const result = await scheduler.createPerUserSchedule(config);

  return Response.json({
    cronExpression,
    scheduleId: result.scheduleId,
    startDelay,
    success: true,
    userIdentifier,
    workflowUrl: workflowUrls[workflowType],
  });
}

async function handleCreateTemplate(params: {
  template: 'daily-backup' | 'weekly-summary' | 'monitoring' | 'monthly-report';
  templateConfig: any;
}) {
  const { template, templateConfig } = params;

  if (!template || !templateConfig) {
    return Response.json({ error: 'template and templateConfig are required' }, { status: 400 });
  }

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3400';

  let result;

  switch (template) {
    case 'daily-backup':
      result = await scheduler.createDailyBackup({
        backupConfig: templateConfig.backupConfig,
        hour: templateConfig.hour || 2,
        minute: templateConfig.minute || 0,
        scheduleId: templateConfig.scheduleId || `daily-backup-${Date.now()}`,
        workflowUrl: `${baseUrl}/api/kitchen-sink-workflow`,
      });
      break;

    case 'weekly-summary':
      result = await scheduler.createWeeklyUserSummary({
        dayOfWeek: templateConfig.dayOfWeek || 1, // Monday
        hour: templateConfig.hour || 9,
        startDelayDays: templateConfig.startDelayDays || 7,
        userEmail: templateConfig.userEmail,
        userId: templateConfig.userId,
        workflowUrl: `${baseUrl}/api/kitchen-sink-workflow`,
      });
      break;

    case 'monitoring':
      result = await scheduler.createMonitoringSchedule({
        intervalMinutes: templateConfig.intervalMinutes || 15,
        monitorConfig: templateConfig.monitorConfig,
        monitorName: templateConfig.monitorName,
        workflowUrl: `${baseUrl}/api/kitchen-sink-workflow`,
      });
      break;

    case 'monthly-report':
      result = await scheduler.createSchedule({
        body: {
          type: 'monthly-report',
          config: templateConfig.reportConfig,
        },
        cron: templateConfig.cron || CronExpressions.MONTHLY_1ST_9AM,
        destination: `${baseUrl}/api/kitchen-sink-workflow`,
        scheduleId: templateConfig.scheduleId || `monthly-report-${Date.now()}`,
      });
      break;

    default:
      return Response.json({ error: 'Unknown template type' }, { status: 400 });
  }

  return Response.json({
    scheduleId: result.scheduleId,
    success: true,
    template,
  });
}

async function handleUpdateSchedule(params: {
  scheduleId: string;
  cron?: string;
  destination?: string;
  body?: any;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: string;
}) {
  const { scheduleId, ...updateConfig } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.updateSchedule({
    scheduleId,
    ...updateConfig,
  });

  return Response.json({
    message: `Schedule ${scheduleId} updated`,
    success: true,
  });
}

async function handlePauseSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.pauseSchedule(scheduleId);

  return Response.json({
    message: `Schedule ${scheduleId} paused`,
    success: true,
  });
}

async function handleResumeSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.resumeSchedule(scheduleId);

  return Response.json({
    message: `Schedule ${scheduleId} resumed`,
    success: true,
  });
}

async function handleDeleteSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.deleteSchedule(scheduleId);

  return Response.json({
    message: `Schedule ${scheduleId} deleted`,
    success: true,
  });
}

async function handleGetSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  const schedule = await scheduler.getSchedule(scheduleId);

  return Response.json({
    schedule: {
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    },
    success: true,
  });
}

async function handleListSchedules(params: { prefix?: string }) {
  const { prefix } = params;

  const schedules = prefix
    ? await scheduler.listSchedulesByPrefix(prefix)
    : await scheduler.listSchedules();

  return Response.json({
    count: schedules.length,
    schedules: schedules.map((schedule) => ({
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    })),
    success: true,
  });
}

async function handleGetScheduleLogs(params: { scheduleId: string; cursor?: string }) {
  const { cursor, scheduleId } = params;

  if (!scheduleId) {
    return Response.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  const result = await scheduler.getScheduleLogs(scheduleId, cursor);

  return Response.json({
    cursor: result.cursor,
    logCount: result.logs.length,
    logs: result.logs.map((log) => ({
      ...log,
      createdAt: new Date(log.createdAt * 1000).toISOString(),
    })),
    scheduleId,
    success: true,
  });
}

// Health check and info endpoint
export async function GET() {
  return Response.json({
    actions: {
      create: 'Create a new recurring schedule',
      createPerUser: 'Create a per-user schedule (e.g., weekly summaries)',
      createTemplate: 'Create from pre-built templates',
      delete: 'Delete a schedule',
      get: 'Get schedule information',
      list: 'List all schedules or by prefix',
      logs: 'Get schedule execution logs',
      pause: 'Pause a schedule',
      resume: 'Resume a paused schedule',
      update: 'Update an existing schedule',
    },
    commonCronExpressions: {
      'Daily at 9 AM': CronExpressions.DAILY_AT_9AM,
      'Every 5 minutes': CronExpressions.EVERY_5_MINUTES,
      'Every 15 minutes': CronExpressions.EVERY_15_MINUTES,
      'Every hour': CronExpressions.EVERY_HOUR,
      'Every minute': CronExpressions.EVERY_MINUTE,
      'Monthly 1st at 9 AM': CronExpressions.MONTHLY_1ST_9AM,
      'Weekly Monday 9 AM': CronExpressions.WEEKLY_MONDAY_9AM,
    },
    message: 'Workflow Schedules API is running',
    success: true,
    templates: ['daily-backup', 'weekly-summary', 'monitoring', 'monthly-report'],
  });
}
