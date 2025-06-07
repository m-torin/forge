import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const client = createWorkflowClient();

    const result = await client.logs({
      count: searchParams.get('count') ? parseInt(searchParams.get('count')!) : undefined,
      cursor: searchParams.get('cursor') || undefined,
      state: searchParams.get('state') as any,
      workflowRunId: searchParams.get('workflowRunId') || undefined,
      workflowUrl: searchParams.get('workflowUrl') || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get logs' },
      { status: 500 },
    );
  }
}
