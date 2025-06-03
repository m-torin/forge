import { requireAuth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

import { createWorkflowClient } from '@repo/orchestration';

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Origin':
        process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
    },
    status: 200,
  });
}

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

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

    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Origin':
          process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to trigger workflow' },
      {
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Origin':
            process.env.NODE_ENV === 'development' ? '*' : process.env.NEXT_PUBLIC_URL || '',
        },
        status: 500,
      },
    );
  }
}
