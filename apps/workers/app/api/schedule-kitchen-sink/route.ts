import { NextResponse } from 'next/server';

import {
  createWorkflowScheduler,
  type ScheduleConfig,
} from '@repo/orchestration';

/**
 * Schedule Management API for Kitchen Sink Workflow
 *
 * This route provides endpoints to manage the daily scheduling of the Kitchen Sink workflow.
 *
 * GET: List all schedules for the Kitchen Sink workflow
 * POST: Create a new daily schedule for the Kitchen Sink workflow
 * DELETE: Remove a schedule by ID
 */

const scheduler = createWorkflowScheduler({
  token: process.env.QSTASH_TOKEN!,
  baseUrl: process.env.QSTASH_URL,
});

// Create or update the daily schedule for Kitchen Sink workflow
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Default configuration for daily Kitchen Sink execution
    const scheduleConfig: ScheduleConfig = {
      cron: body.cron || '0 9 * * *', // Default: 9 AM daily
      scheduleId: `kitchen-sink-daily-${Date.now()}`,
      destination: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3400'}/api/workflows/kitchen-sink`,
      retries: body.retries || 3,
      body: {
        name: 'Scheduled Daily Kitchen Sink Run',
        // Default payload for scheduled execution
        options: {
          deduplication: {
            contentBased: false,
            enabled: true,
          },
          flowControl: {
            key: 'kitchen-sink-scheduled',
            parallelism: 3,
            ratePerSecond: 5,
          },
          mode: 'full',
          notifyOnComplete: true,
        },
        priority: 5,
        taskId: `scheduled-${new Date().toISOString().split('T')[0]}`,
        metadata: {
          environment: process.env.NODE_ENV || 'development',
          scheduledBy: 'api',
          workflowType: 'kitchen-sink',
        },
        // You can add more default payload properties here
        ...body.payload,
      },
      headers: {
        'Content-Type': 'application/json',
        'X-Schedule-Type': 'kitchen-sink',
      },
      flowControl: body.flowControl || {
        key: 'kitchen-sink-scheduled',
        parallelism: 3,
        rate: 5,
      },
    };

    const result = await scheduler.createSchedule(scheduleConfig);

    return NextResponse.json({
      cron: scheduleConfig.cron,
      message: 'Daily Kitchen Sink workflow schedule created successfully',
      nextRun: calculateNextRun(scheduleConfig.cron),
      scheduleId: result.scheduleId,
      success: true,
    });
  } catch (error) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create schedule',
        success: false,
      },
      { status: 500 },
    );
  }
}

// List all Kitchen Sink schedules
export async function GET() {
  try {
    const schedules = await scheduler.listSchedules();

    // Filter for Kitchen Sink workflow schedules
    const kitchenSinkSchedules = schedules.filter(
      (schedule) => {
        // Check if it's a kitchen sink schedule by ID pattern or destination
        return schedule.scheduleId.includes('kitchen-sink') || 
               schedule.destination.includes('/api/workflows/kitchen-sink');
      }
    );

    return NextResponse.json({
      count: kitchenSinkSchedules.length,
      schedules: kitchenSinkSchedules,
      success: true,
    });
  } catch (error) {
    console.error('Failed to list schedules:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to list schedules',
        success: false,
      },
      { status: 500 },
    );
  }
}

// Delete a schedule
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required', success: false },
        { status: 400 },
      );
    }

    await scheduler.deleteSchedule(scheduleId);

    return NextResponse.json({
      message: `Schedule ${scheduleId} deleted successfully`,
      success: true,
    });
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete schedule',
        success: false,
      },
      { status: 500 },
    );
  }
}

// Helper function to calculate next run time
function calculateNextRun(cron: string): string {
  // This is a simplified implementation
  // In production, you'd use a proper cron parser library
  const now = new Date();
  const [minute, hour] = cron.split(' ');

  const nextRun = new Date(now);
  nextRun.setUTCHours(parseInt(hour) || 9, parseInt(minute) || 0, 0, 0);

  // If the time has already passed today, set it for tomorrow
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.toISOString();
}
