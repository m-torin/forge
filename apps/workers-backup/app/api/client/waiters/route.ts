import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId is required' }, { status: 400 });
    }

    const client = createWorkflowClient();
    const result = await client.getWaiters({ eventId });

    return NextResponse.json({ waiters: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get waiters' },
      { status: 500 },
    );
  }
}
