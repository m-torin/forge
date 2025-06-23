import { NextResponse } from 'next/server';

import { getAllWorkflows, getWorkflowStats } from '../registry';

export async function GET(request: any) {
  const abortController = new AbortController();

  // Handle request abortion
  request.signal?.addEventListener('abort', (_: any) => {
    abortController.abort();
  });

  try {
    const workflows = getAllWorkflows();
    const stats = getWorkflowStats();

    // Check if request was aborted
    if (abortController.signal.aborted) {
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 });
    }

    return NextResponse.json({
      workflows,
      stats,
    });
  } catch (error: any) {
    console.error('Failed to get workflows:', error);

    if (abortController.signal.aborted) {
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch workflows',
        details:
          error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
