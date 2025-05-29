import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = createWorkflowClient();

    const result = await client.trigger({
      url: body.url,
      body: body.body,
      delay: body.delay,
      flowControl: body.flowControl,
      headers: body.headers,
      retries: body.retries,
      workflowRunId: body.workflowRunId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger workflow' },
      { status: 500 },
    );
  }
}
