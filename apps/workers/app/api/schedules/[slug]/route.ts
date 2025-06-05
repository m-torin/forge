import { loadWorkflow } from '@/workflows/loader';
import { createWorkflowScheduler, CronExpressions, type ScheduleConfig } from '@repo/orchestration';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const scheduler = createWorkflowScheduler();

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { slug } = params;

    // Verify workflow exists
    const definition = await loadWorkflow(slug);
    if (!definition) {
      notFound();
    }

    const body = await request.json();
    const { action, ...actionParams } = body;

    // Determine the workflow URL dynamically
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3400';

    const workflowUrl = `${baseUrl}/api/workflows/${slug}`;

    switch (action) {
      case 'create':
        return handleCreateSchedule({ ...actionParams, workflowUrl });
      case 'update':
        return handleUpdateSchedule(actionParams);
      case 'pause':
        return handlePauseSchedule(actionParams);
      case 'resume':
        return handleResumeSchedule(actionParams);
      case 'delete':
        return handleDeleteSchedule(actionParams);
      case 'get':
        return handleGetSchedule(actionParams);
      case 'logs':
        return handleGetScheduleLogs(actionParams);
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Schedule API error:', error);
    return NextResponse.json(
      {
        error: 'Schedule operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function handleCreateSchedule(params: {
  scheduleId: string;
  workflowUrl: string;
  cron: string;
  payload?: any;
  headers?: Record<string, string>;
  retries?: number;
  timeout?: string;
}) {
  const { scheduleId, workflowUrl, cron, payload = {}, headers, retries, timeout } = params;

  if (!scheduleId || !cron) {
    return NextResponse.json({ error: 'scheduleId and cron are required' }, { status: 400 });
  }

  const config: ScheduleConfig = {
    scheduleId,
    destination: workflowUrl,
    cron,
    body: payload,
    headers,
    retries,
    timeout,
  };

  const result = await scheduler.createSchedule(config);

  return NextResponse.json({
    success: true,
    scheduleId: result.scheduleId,
    destination: workflowUrl,
    cron,
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
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.updateSchedule({ scheduleId, ...updateConfig });

  return NextResponse.json({
    success: true,
    message: `Schedule ${scheduleId} updated`,
  });
}

async function handlePauseSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.pauseSchedule(scheduleId);

  return NextResponse.json({
    success: true,
    message: `Schedule ${scheduleId} paused`,
  });
}

async function handleResumeSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.resumeSchedule(scheduleId);

  return NextResponse.json({
    success: true,
    message: `Schedule ${scheduleId} resumed`,
  });
}

async function handleDeleteSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  await scheduler.deleteSchedule(scheduleId);

  return NextResponse.json({
    success: true,
    message: `Schedule ${scheduleId} deleted`,
  });
}

async function handleGetSchedule(params: { scheduleId: string }) {
  const { scheduleId } = params;

  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  const schedule = await scheduler.getSchedule(scheduleId);

  return NextResponse.json({
    success: true,
    schedule: {
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    },
  });
}

async function handleGetScheduleLogs(params: { scheduleId: string; cursor?: string }) {
  const { scheduleId, cursor } = params;

  if (!scheduleId) {
    return NextResponse.json({ error: 'scheduleId is required' }, { status: 400 });
  }

  const result = await scheduler.getScheduleLogs(scheduleId, cursor);

  return NextResponse.json({
    success: true,
    scheduleId,
    cursor: result.cursor,
    logCount: result.logs.length,
    logs: result.logs.map((log) => ({
      ...log,
      createdAt: new Date(log.createdAt * 1000).toISOString(),
    })),
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const { slug } = params;

  // Verify workflow exists
  const definition = await loadWorkflow(slug);
  if (!definition) {
    notFound();
  }

  return NextResponse.json({
    workflow: slug,
    metadata: definition.metadata,
    scheduleActions: {
      create: 'Create a new recurring schedule for this workflow',
      update: 'Update an existing schedule',
      pause: 'Pause a schedule',
      resume: 'Resume a paused schedule',
      delete: 'Delete a schedule',
      get: 'Get schedule information',
      logs: 'Get schedule execution logs',
    },
    commonCronExpressions: {
      'Every minute': CronExpressions.EVERY_MINUTE,
      'Every 5 minutes': CronExpressions.EVERY_5_MINUTES,
      'Every 15 minutes': CronExpressions.EVERY_15_MINUTES,
      'Every hour': CronExpressions.EVERY_HOUR,
      'Daily at 9 AM': CronExpressions.DAILY_AT_9AM,
      'Weekly Monday 9 AM': CronExpressions.WEEKLY_MONDAY_9AM,
      'Monthly 1st at 9 AM': CronExpressions.MONTHLY_1ST_9AM,
    },
  });
}
