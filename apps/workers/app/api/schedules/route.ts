import { getAvailableWorkflows } from '@/workflows/loader';
import { createWorkflowScheduler, CronExpressions } from '@repo/orchestration';
import { NextRequest, NextResponse } from 'next/server';

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
        error: 'Schedule operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function handleListSchedules(params: { cursor?: string; limit?: number }) {
  const schedules = await scheduler.listSchedules();

  return NextResponse.json({
    success: true,
    count: schedules.length,
    schedules: schedules.map((schedule) => ({
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    })),
  });
}

async function handleListByPrefix(params: { prefix: string }) {
  const { prefix } = params;

  if (!prefix) {
    return NextResponse.json({ error: 'prefix is required' }, { status: 400 });
  }

  const schedules = await scheduler.listSchedulesByPrefix(prefix);

  return NextResponse.json({
    success: true,
    prefix,
    count: schedules.length,
    schedules: schedules.map((schedule) => ({
      ...schedule,
      createdAt: new Date(schedule.createdAt * 1000).toISOString(),
      nextRun: new Date(schedule.nextRun * 1000).toISOString(),
    })),
  });
}

export async function GET() {
  const workflows = getAvailableWorkflows();

  return NextResponse.json({
    message: 'Workflow Schedules API',
    description:
      'Use this endpoint to list all schedules. For workflow-specific operations, use /api/schedules/[workflow]',
    availableWorkflows: workflows.map((w) => ({
      slug: w,
      scheduleEndpoint: `/api/schedules/${w}`,
    })),
    generalActions: {
      list: 'List all schedules',
      listByPrefix: 'List schedules by prefix filter',
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
