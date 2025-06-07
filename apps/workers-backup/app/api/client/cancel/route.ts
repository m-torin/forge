import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = createWorkflowClient();

    if (body.workflowRunId) {
      await client.cancel({ ids: body.workflowRunId });
    } else if (body.urlStartingWith) {
      await client.cancel({ urlStartingWith: body.urlStartingWith });
    } else if (body.all) {
      await client.cancel({ all: true });
    } else {
      throw new Error('Must provide workflowRunId, urlStartingWith, or all: true');
    }

    return NextResponse.json({ message: 'Workflow(s) cancelled', success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel workflow' },
      { status: 500 },
    );
  }
}
