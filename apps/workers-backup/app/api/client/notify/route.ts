import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const client = createWorkflowClient();

    const result = await client.notify({
      eventData: body.eventData,
      eventId: body.eventId,
    });

    return NextResponse.json({ result, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to notify event' },
      { status: 500 },
    );
  }
}
