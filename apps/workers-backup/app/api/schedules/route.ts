import { getAvailableWorkflows } from '@/workflows/loader';
import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowScheduler, CronExpressions } from '@repo/orchestration';

/**
 * Workflow Schedules API
 * Lists all schedules and provides general schedule management
 *
 * For workflow-specific schedule operations, use:
 * /api/schedules/[workflow-slug]
 */

const scheduler = createWorkflowScheduler();

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'list':
        return handleListSchedules(params);
      case 'listByPrefix':
        return handleListByPrefix(params);
      default:
        return NextResponse.json(
          {
            error: 'Unknown action. Use workflow-specific endpoints at /api/schedules/[workflow]',
            hint: 'Valid actions for this endpoint: list, listByPrefix',
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Schedules API error:', error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Schedule operation failed',
      },
      { status: 500 },
    );
  }
}

async function handleListSchedules(params: { cursor?: string; limit?: number }) {
  const schedules = await scheduler.listSchedules();

  return NextResponse.json({
    count: schedules.length,
    schedules: schedules.map((schedule) => ({
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    })),
    success: true,
  });
}

async function handleListByPrefix(params: { prefix: string }) {
  const { prefix } = params;

  if (!prefix) {
    return NextResponse.json({ error: 'prefix is required' }, { status: 400 });
  }

  const schedules = await scheduler.listSchedulesByPrefix(prefix);

  return NextResponse.json({
    count: schedules.length,
    prefix,
    schedules: schedules.map((schedule) => ({
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    })),
    success: true,
  });
}

export async function GET() {
  const workflows = getAvailableWorkflows();

  return NextResponse.json({
    availableWorkflows: workflows.map((w) => ({
      scheduleEndpoint: `/api/schedules/${w}`,
      slug: w,
    })),
    commonCronExpressions: {
      'Daily at 9 AM': CronExpressions.DAILY_AT_9AM,
      'Every 5 minutes': CronExpressions.EVERY_5_MINUTES,
      'Every 15 minutes': CronExpressions.EVERY_15_MINUTES,
      'Every hour': CronExpressions.EVERY_HOUR,
      'Every minute': CronExpressions.EVERY_MINUTE,
      'Monthly 1st at 9 AM': CronExpressions.MONTHLY_1ST_9AM,
      'Weekly Monday 9 AM': CronExpressions.WEEKLY_MONDAY_9AM,
    },
    description:
      'Use this endpoint to list all schedules. For workflow-specific operations, use /api/schedules/[workflow]',
    generalActions: {
      list: 'List all schedules',
      listByPrefix: 'List schedules by prefix filter',
    },
    message: 'Workflow Schedules API',
  });
}
