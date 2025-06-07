import { serve } from '@upstash/workflow/nextjs';
import { type NextRequest, NextResponse } from 'next/server';

console.log('[NO-STEPS] Module loaded');

// Add global error handlers for debugging
process.on('uncaughtException', (error) => {
  console.error('[NO-STEPS] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[NO-STEPS] Unhandled Rejection at:', promise, 'reason:', reason);
});

// Add manual POST handler with detailed logging
export async function POST(request: NextRequest) {
  console.log('[NO-STEPS] POST handler called directly');
  console.log('[NO-STEPS] Request method:', request.method);
  console.log('[NO-STEPS] Request URL:', request.url);
  console.log('[NO-STEPS] Headers:', Object.fromEntries(request.headers.entries()));

  // Log environment variables for debugging
  console.log('[NO-STEPS] Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? 'SET' : 'NOT SET',
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? 'SET' : 'NOT SET',
    QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
    QSTASH_URL: process.env.QSTASH_URL,
    UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
  });

  try {
    const body = await request.text();
    console.log('[NO-STEPS] Request body:', body);

    // Try to create the serve handler
    console.log('[NO-STEPS] Creating serve handler...');
    const { POST: workflowHandler } = serve(async (context) => {
      console.log('[NO-STEPS] Workflow function executing');
      console.log('[NO-STEPS] Context:', {
        url: context.url,
        workflowRunId: context.workflowRunId,
      });

      return {
        message: 'No-steps workflow completed',
        success: true,
        timestamp: Date.now(),
        workflowRunId: context.workflowRunId,
      };
    });

    console.log('[NO-STEPS] Serve handler created, calling...');
    const result = await workflowHandler(request);
    console.log('[NO-STEPS] Workflow handler result status:', result.status);
    console.log(
      '[NO-STEPS] Workflow handler result headers:',
      Object.fromEntries(result.headers.entries()),
    );

    // If it's an error response, log the body
    if (!result.ok) {
      const errorText = await result.clone().text();
      console.error('[NO-STEPS] Workflow handler error response body:', errorText);
      console.error('[NO-STEPS] Workflow handler error response status:', result.status);

      // Return the error response as-is
      return result;
    }

    console.log('[NO-STEPS] Workflow handler succeeded');
    return result;
  } catch (error) {
    console.error('[NO-STEPS] Exception in POST handler:', error);
    console.error('[NO-STEPS] Exception type:', error?.constructor?.name);
    console.error(
      '[NO-STEPS] Exception message:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.error('[NO-STEPS] Exception stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      {
        type: error?.constructor?.name || 'Unknown',
        error: 'Workflow failed with exception',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  console.log('[NO-STEPS] GET handler called');
  return Response.json({
    description: 'Workflow that returns immediately without any context.run() calls',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_URL: process.env.QSTASH_URL,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    },
    message: 'No-steps workflow test',
  });
}
