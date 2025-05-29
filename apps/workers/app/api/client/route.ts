import { createWorkflowClient } from '@repo/orchestration';

/**
 * Workflow Client API Route
 * Demonstrates ALL client capabilities for cancellation, notification, and management
 *
 * Features demonstrated:
 * - trigger: Start workflows with flow control
 * - cancel: Cancel workflows by ID, URL pattern, or all
 * - notify: Send events to waiting workflows
 * - getWaiters: Get workflows waiting for events
 * - logs: Get workflow run information and status
 * - waitForCompletion: Poll for workflow completion
 */

const client = createWorkflowClient();

export async function POST(request: Request) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'trigger':
        return handleTrigger(params);
      case 'cancel':
        return handleCancel(params);
      case 'notify':
        return handleNotify(params);
      case 'getWaiters':
        return handleGetWaiters(params);
      case 'logs':
        return handleLogs(params);
      case 'waitForCompletion':
        return handleWaitForCompletion(params);
      case 'demo':
        return handleDemo(params);
      default:
        return Response.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Client API error:', error);
    return Response.json(
      { details: (error as Error).message, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

async function handleTrigger(params: {
  workflowType?: 'kitchen-sink' | 'basic' | 'image-processing';
  payload?: any;
  workflowRunId?: string;
  flowControl?: {
    key: string;
    rate?: number;
    parallelism?: number;
    period?: string;
  };
}) {
  const { flowControl, payload = {}, workflowRunId, workflowType = 'kitchen-sink' } = params;

  // Determine the workflow URL
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3400';

  const workflowUrls = {
    basic: `${baseUrl}/api/workflows/basic`,
    'image-processing': `${baseUrl}/api/workflows/image-processing`,
    'kitchen-sink': `${baseUrl}/api/workflows/kitchen-sink`,
  };

  const result = await client.trigger({
    url: workflowUrls[workflowType],
    body: payload,
    delay: '1s',
    flowControl,
    retries: 3,
    workflowRunId,
  });

  return Response.json({
    success: true,
    triggeredUrl: workflowUrls[workflowType],
    workflowRunId: result.workflowRunId,
  });
}

async function handleCancel(params: {
  type: 'single' | 'multiple' | 'url' | 'all';
  workflowRunIds?: string | string[];
  urlStartingWith?: string;
}) {
  const { type, urlStartingWith, workflowRunIds } = params;

  switch (type) {
    case 'single':
      if (!workflowRunIds || typeof workflowRunIds !== 'string') {
        return Response.json(
          { error: 'Single cancel requires workflowRunId string' },
          { status: 400 },
        );
      }
      await client.cancel({ ids: workflowRunIds });
      return Response.json({
        message: `Cancelled workflow: ${workflowRunIds}`,
        success: true,
      });

    case 'multiple':
      if (!workflowRunIds || !Array.isArray(workflowRunIds)) {
        return Response.json(
          { error: 'Multiple cancel requires workflowRunIds array' },
          { status: 400 },
        );
      }
      await client.cancel({ ids: workflowRunIds });
      return Response.json({
        message: `Cancelled ${workflowRunIds.length} workflows`,
        success: true,
      });

    case 'url':
      if (!urlStartingWith) {
        return Response.json({ error: 'URL cancel requires urlStartingWith' }, { status: 400 });
      }
      await client.cancel({ urlStartingWith });
      return Response.json({
        message: `Cancelled all workflows starting with: ${urlStartingWith}`,
        success: true,
      });

    case 'all':
      await client.cancel({ all: true });
      return Response.json({
        message: 'Cancelled all pending and running workflows',
        success: true,
      });

    default:
      return Response.json({ error: 'Invalid cancel type' }, { status: 400 });
  }
}

async function handleNotify(params: { eventId: string; eventData?: any }) {
  const { eventData, eventId } = params;

  if (!eventId) {
    return Response.json({ error: 'eventId is required' }, { status: 400 });
  }

  const results = await client.notify({
    eventData: eventData || { notifiedAt: new Date().toISOString() },
    eventId,
  });

  return Response.json({
    eventId,
    notifiedCount: results.length,
    results: results.map((r) => ({
      error: r.error,
      messageId: r.messageId,
      success: !r.error,
      waiter: r.waiter,
    })),
    success: true,
  });
}

async function handleGetWaiters(params: { eventId: string }) {
  const { eventId } = params;

  if (!eventId) {
    return Response.json({ error: 'eventId is required' }, { status: 400 });
  }

  const waiters = await client.getWaiters({ eventId });

  return Response.json({
    eventId,
    success: true,
    waiterCount: waiters.length,
    waiters: waiters.map((w) => ({
      url: w.url,
      deadline: w.deadline,
      deadlineISO: new Date(w.deadline * 1000).toISOString(),
      headers: Object.keys(w.headers || {}),
      timeoutUrl: w.timeoutUrl,
    })),
  });
}

async function handleLogs(params: {
  workflowRunId?: string;
  count?: number;
  state?: 'RUN_STARTED' | 'RUN_SUCCESS' | 'RUN_FAILED' | 'RUN_CANCELED';
  workflowUrl?: string;
  cursor?: string;
}) {
  const result = await client.logs(params);

  return Response.json({
    cursor: result.cursor,
    runs: result.runs.map((run) => ({
      completedAt: run.workflowRunCompletedAt
        ? new Date(run.workflowRunCompletedAt * 1000).toISOString()
        : null,
      createdAt: new Date(run.workflowRunCreatedAt * 1000).toISOString(),
      dlqId: run.dlqId,
      duration: run.workflowRunCompletedAt
        ? run.workflowRunCompletedAt - run.workflowRunCreatedAt
        : null,
      hasFailure: !!run.failureFunction,
      invokedBy: run.invoker?.runId,
      state: run.workflowState,
      stepCount: run.steps?.length || 0,
      workflowRunId: run.workflowRunId,
      workflowUrl: run.workflowUrl,
    })),
    success: true,
    totalRuns: result.runs.length,
  });
}

async function handleWaitForCompletion(params: {
  workflowRunId: string;
  pollingInterval?: number;
  timeout?: number;
}) {
  const { pollingInterval = 2000, timeout = 60000, workflowRunId } = params;

  if (!workflowRunId) {
    return Response.json({ error: 'workflowRunId is required' }, { status: 400 });
  }

  try {
    const result = await client.waitForCompletion(workflowRunId, {
      pollingInterval,
      timeout,
    });

    if (!result) {
      return Response.json({
        error: 'Workflow not found',
        success: false,
        workflowRunId,
      });
    }

    return Response.json({
      completedAt: result.workflowRunCompletedAt
        ? new Date(result.workflowRunCompletedAt * 1000).toISOString()
        : null,
      createdAt: new Date(result.workflowRunCreatedAt * 1000).toISOString(),
      duration: result.workflowRunCompletedAt
        ? result.workflowRunCompletedAt - result.workflowRunCreatedAt
        : null,
      finalState: result.workflowState,
      response: result.workflowRunResponse,
      success: true,
      workflowRunId,
    });
  } catch (error) {
    return Response.json({
      error: (error as Error).message,
      success: false,
      workflowRunId,
    });
  }
}

async function handleDemo(params: {
  scenario?: 'approval-flow' | 'cancellation-demo' | 'event-notification' | 'full-lifecycle';
}) {
  const { scenario = 'full-lifecycle' } = params;

  switch (scenario) {
    case 'approval-flow':
      return await demoApprovalFlow();
    case 'cancellation-demo':
      return await demoCancellation();
    case 'event-notification':
      return await demoEventNotification();
    case 'full-lifecycle':
      return await demoFullLifecycle();
    default:
      return Response.json({ error: 'Unknown demo scenario' }, { status: 400 });
  }
}

// Demo: Approval Flow with Events
async function demoApprovalFlow() {
  const steps: string[] = [];

  // Step 1: Trigger workflow that requires approval
  steps.push('1. Triggering workflow that requires approval...');
  const triggerResult = await client.trigger({
    url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3400'}/api/workflows/kitchen-sink`,
    body: {
      destination: { type: 'database', config: { table: 'demo' } },
      options: {
        mode: 'etl',
        requiresApproval: true,
      },
      pipelineId: `demo-approval-${Date.now()}`,
      source: { type: 'api', url: 'https://api.example.com/data' },
      transformations: ['validate', 'sanitize'],
    },
    workflowRunId: `approval-demo-${Date.now()}`,
  });

  const workflowRunId = triggerResult.workflowRunId;
  steps.push(`2. Workflow started: ${workflowRunId}`);

  // Step 2: Wait a bit for the workflow to reach waitForEvent
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Step 3: Check waiters
  const eventId = `approve-pipeline-${workflowRunId.replace('wfr_approval-demo-', '')}`;
  const waiters = await client.getWaiters({ eventId });
  steps.push(`3. Found ${waiters.length} workflows waiting for approval event: ${eventId}`);

  // Step 4: Send approval
  if (waiters.length > 0) {
    const notifyResults = await client.notify({
      eventData: {
        approved: true,
        approvedAt: new Date().toISOString(),
        approver: 'demo-client',
      },
      eventId,
    });
    steps.push(`4. Sent approval notification, notified ${notifyResults.length} waiters`);
  } else {
    steps.push('4. No waiters found (workflow may have auto-approved in dev mode)');
  }

  // Step 5: Wait for completion
  try {
    const completion = await client.waitForCompletion(workflowRunId, { timeout: 30000 });
    steps.push(`5. Workflow completed with state: ${completion?.workflowState}`);
  } catch (error) {
    steps.push(`5. Timeout waiting for completion: ${(error as Error).message}`);
  }

  return Response.json({
    scenario: 'approval-flow',
    steps,
    success: true,
    workflowRunId,
  });
}

// Demo: Cancellation Scenarios
async function demoCancellation() {
  const steps: string[] = [];

  // Step 1: Start multiple workflows
  steps.push('1. Starting multiple demo workflows...');
  const workflowIds: string[] = [];

  for (let i = 0; i < 3; i++) {
    const result = await client.trigger({
      url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3400'}/api/workflows/kitchen-sink`,
      body: {
        name: `Demo Workflow ${i + 1}`,
        options: { mode: 'full' },
        priority: 5,
        taskId: `cancel-demo-${i + 1}`,
      },
      workflowRunId: `cancel-demo-${i + 1}-${Date.now()}`,
    });
    workflowIds.push(result.workflowRunId);
  }

  steps.push(`2. Started workflows: ${workflowIds.join(', ')}`);

  // Step 2: Wait a bit
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Step 3: Cancel single workflow
  await client.cancel({ ids: workflowIds[0] });
  steps.push(`3. Cancelled single workflow: ${workflowIds[0]}`);

  // Step 4: Cancel multiple workflows
  await client.cancel({ ids: workflowIds.slice(1) });
  steps.push(`4. Cancelled remaining workflows: ${workflowIds.slice(1).join(', ')}`);

  // Step 5: Check final states
  const logs = await client.logs({ count: 10 });
  const demoRuns = logs.runs.filter((run) => workflowIds.includes(run.workflowRunId));

  steps.push(
    `5. Final states: ${demoRuns.map((r) => `${r.workflowRunId}: ${r.workflowState}`).join(', ')}`,
  );

  return Response.json({
    scenario: 'cancellation-demo',
    steps,
    success: true,
    workflowIds,
  });
}

// Demo: Event Notification
async function demoEventNotification() {
  const steps: string[] = [];
  const eventId = `demo-event-${Date.now()}`;

  steps.push(`1. Demo event ID: ${eventId}`);

  // Step 1: Check if any workflows are waiting for this event
  const initialWaiters = await client.getWaiters({ eventId });
  steps.push(`2. Initial waiters for event: ${initialWaiters.length}`);

  // Step 2: Send notification to event (may have no waiters initially)
  const notifyResult = await client.notify({
    eventData: {
      data: { value: 42 },
      message: 'Demo event notification',
      timestamp: new Date().toISOString(),
    },
    eventId,
  });

  steps.push(`3. Notification sent, reached ${notifyResult.length} waiters`);

  // Step 3: Start a workflow that will wait for this event (for future notifications)
  const triggerResult = await client.trigger({
    url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3400'}/api/workflows/kitchen-sink`,
    body: {
      name: 'Event Waiting Workflow',
      options: {
        mode: 'full',
        requiresApproval: true,
      },
      taskId: `event-demo-${Date.now()}`,
    },
    workflowRunId: `event-demo-${Date.now()}`,
  });

  steps.push(`4. Started workflow that will wait for events: ${triggerResult.workflowRunId}`);

  return Response.json({
    eventId,
    scenario: 'event-notification',
    steps,
    success: true,
    workflowRunId: triggerResult.workflowRunId,
  });
}

// Demo: Full Lifecycle Management
async function demoFullLifecycle() {
  const steps: string[] = [];

  // Step 1: Start workflow
  const triggerResult = await client.trigger({
    url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3400'}/api/workflows/kitchen-sink`,
    body: {
      name: 'Full Lifecycle Demo',
      options: { mode: 'full' },
      taskId: `lifecycle-${Date.now()}`,
    },
    flowControl: {
      key: 'demo-lifecycle',
      parallelism: 2,
      rate: 5,
    },
    workflowRunId: `lifecycle-${Date.now()}`,
  });

  const workflowRunId = triggerResult.workflowRunId;
  steps.push(`1. Started workflow: ${workflowRunId}`);

  // Step 2: Monitor progress
  await new Promise((resolve) => setTimeout(resolve, 1000));
  let logs = await client.logs({ count: 1, workflowRunId });
  if (logs.runs.length > 0) {
    steps.push(
      `2. Current state: ${logs.runs[0].workflowState}, Steps: ${logs.runs[0].steps?.length || 0}`,
    );
  }

  // Step 3: Get active workflows
  const activeWorkflows = await client.getActiveWorkflows({ count: 5 });
  const ourWorkflow = activeWorkflows.find((w) => w.workflowRunId === workflowRunId);
  steps.push(
    `3. Active workflows: ${activeWorkflows.length}, Our workflow active: ${!!ourWorkflow}`,
  );

  // Step 4: Wait for completion or timeout
  try {
    const completion = await client.waitForCompletion(workflowRunId, {
      pollingInterval: 1000,
      timeout: 15000,
    });
    steps.push(`4. Workflow completed: ${completion?.workflowState}`);
    steps.push(
      `5. Duration: ${completion?.workflowRunCompletedAt ? completion.workflowRunCompletedAt - completion.workflowRunCreatedAt : 'unknown'}s`,
    );
  } catch (error) {
    steps.push(`4. Timeout or error: ${(error as Error).message}`);

    // If timeout, cancel the workflow
    await client.cancel({ ids: workflowRunId });
    steps.push('5. Cancelled workflow due to timeout');
  }

  // Step 6: Final status
  logs = await client.logs({ count: 1, workflowRunId });
  if (logs.runs.length > 0) {
    steps.push(`6. Final state: ${logs.runs[0].workflowState}`);
  }

  return Response.json({
    scenario: 'full-lifecycle',
    steps,
    success: true,
    workflowRunId,
  });
}

// Health check endpoint
export async function GET() {
  return Response.json({
    demoScenarios: ['approval-flow', 'cancellation-demo', 'event-notification', 'full-lifecycle'],
    endpoints: {
      POST: {
        cancel: 'Cancel workflow runs (single, multiple, by URL, or all)',
        demo: 'Run demonstration scenarios',
        getWaiters: 'Get workflows waiting for an event',
        logs: 'Get workflow run logs and status',
        notify: 'Send event notifications to waiting workflows',
        trigger: 'Start a new workflow',
        waitForCompletion: 'Poll for workflow completion',
      },
    },
    message: 'Workflow Client API is running',
    success: true,
  });
}
