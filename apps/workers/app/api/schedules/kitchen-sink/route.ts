import { NextResponse } from 'next/server';

import { WorkflowScheduler } from '@repo/orchestration';

/**
 * Kitchen Sink Schedule Management API
 *
 * This route manages the daily scheduling for the Kitchen Sink workflow.
 * It supports creating, updating, pausing, resuming, and deleting the schedule.
 *
 * The Kitchen Sink workflow runs once daily at 9:00 AM UTC by default.
 */

const KITCHEN_SINK_SCHEDULE_ID = 'kitchen-sink-daily';
const KITCHEN_SINK_WORKFLOW_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/workflows/kitchen-sink`
  : 'http://localhost:3400/api/workflows/kitchen-sink';

const scheduler = new WorkflowScheduler({
  baseUrl: process.env.QSTASH_URL,
  token: process.env.QSTASH_TOKEN!,
});

// GET: Check schedule status
export async function GET() {
  try {
    const schedule = await scheduler.getSchedule(KITCHEN_SINK_SCHEDULE_ID);
    return NextResponse.json({
      schedule,
      status: 'active',
    });
  } catch {
    // Schedule might not exist yet
    return NextResponse.json(
      {
        message: 'Kitchen Sink daily schedule not found',
        status: 'not_found',
      },
      { status: 404 },
    );
  }
}

// POST: Create or update the daily schedule
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Default to 9:00 AM UTC daily
    const cron = body.cron || '0 9 * * *';
    const timezone = body.timezone || 'UTC';

    // Payload for the Kitchen Sink workflow
    const payload = {
      name: 'Daily Kitchen Sink Comprehensive Run',
      destination: { type: 'database' as const, config: { table: 'daily_processed' } },
      options: {
        aiIntegration: {
          provider: 'anthropic' as const,
          enabled: true,
          maxTokens: 4000,
          model: 'claude-3-5-sonnet-20241022',
        },
        batchSize: 20,
        deduplication: {
          contentBased: false,
          enabled: true,
        },
        dlqHandling: {
          enabled: true,
          maxRetries: 3,
        },
        flowControl: {
          key: 'kitchen-sink-daily',
          parallelism: 3,
          ratePerSecond: 5,
        },
        maxDuration: 3600, // 1 hour
        mode: 'full',
        notifyOn: ['error', 'complete'],
        notifyOnComplete: true,
      },
      // Include sample data for all features
      pipelineId: `daily-pipeline-${new Date().toISOString().split('T')[0]}`,
      priority: 10,
      source: { type: 'api' as const, url: 'https://api.example.com/daily-data' },
      taskId: `daily-kitchen-sink-${new Date().toISOString().split('T')[0]}`,
      transformations: ['validate', 'sanitize', 'filter', 'enrich'],
    };

    // Try to update existing schedule first
    try {
      await scheduler.updateSchedule({
        body: payload,
        cron,
        destination: KITCHEN_SINK_WORKFLOW_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        retries: 3,
        scheduleId: KITCHEN_SINK_SCHEDULE_ID,
      });

      // Get updated schedule info
      const updatedSchedule = await scheduler.getSchedule(KITCHEN_SINK_SCHEDULE_ID);

      return NextResponse.json({
        cron,
        message: 'Kitchen Sink daily schedule updated',
        nextRun: new Date(updatedSchedule.nextRun).toISOString(),
        scheduleId: KITCHEN_SINK_SCHEDULE_ID,
        timezone,
      });
    } catch {
      // Schedule doesn't exist, create it
      const result = await scheduler.createSchedule({
        body: payload,
        cron,
        destination: KITCHEN_SINK_WORKFLOW_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        retries: 3,
        scheduleId: KITCHEN_SINK_SCHEDULE_ID,
      });

      return NextResponse.json(
        {
          cron,
          message: 'Kitchen Sink daily schedule created',
          scheduleId: result.scheduleId,
          timezone,
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error('Failed to create/update Kitchen Sink schedule:', error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to create/update schedule',
      },
      { status: 500 },
    );
  }
}

// PUT: Pause or resume the schedule
export async function PUT(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'pause') {
      await scheduler.pauseSchedule(KITCHEN_SINK_SCHEDULE_ID);
      return NextResponse.json({
        message: 'Kitchen Sink daily schedule paused',
        status: 'paused',
      });
    } else if (action === 'resume') {
      await scheduler.resumeSchedule(KITCHEN_SINK_SCHEDULE_ID);
      return NextResponse.json({
        message: 'Kitchen Sink daily schedule resumed',
        status: 'active',
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid action. Use "pause" or "resume"',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('Failed to update Kitchen Sink schedule:', error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to update schedule',
      },
      { status: 500 },
    );
  }
}

// DELETE: Remove the schedule
export async function DELETE() {
  try {
    await scheduler.deleteSchedule(KITCHEN_SINK_SCHEDULE_ID);
    return NextResponse.json({
      message: 'Kitchen Sink daily schedule deleted',
    });
  } catch (error) {
    console.error('Failed to delete Kitchen Sink schedule:', error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to delete schedule',
      },
      { status: 500 },
    );
  }
}
