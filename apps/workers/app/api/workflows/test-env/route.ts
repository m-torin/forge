import { type NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify environment setup
export async function GET() {
  const config = {
    checks: {
      hasSigningKeys: !!(
        process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY
      ),
      hasToken: !!process.env.QSTASH_TOKEN,
      hasWorkflowUrl: !!process.env.UPSTASH_WORKFLOW_URL,
      isLocalQStash: process.env.QSTASH_URL?.includes('localhost') || false,
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
      QSTASH_URL: process.env.QSTASH_URL,
      SKIP_WORKFLOW_DEDUPLICATION: process.env.SKIP_WORKFLOW_DEDUPLICATION,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
      WORKFLOW_DEV_MODE: process.env.WORKFLOW_DEV_MODE,
    },
    recommendations: [],
  };

  // Add recommendations based on checks
  if (!config.checks.isLocalQStash) {
    config.recommendations.push('Set QSTASH_URL=http://localhost:8080 for local development');
  }
  if (!config.checks.hasToken) {
    config.recommendations.push('Set QSTASH_TOKEN with the token from QStash CLI output');
  }
  if (!config.checks.hasSigningKeys) {
    config.recommendations.push(
      'Set signing keys from QStash CLI output (even though receiver is disabled)',
    );
  }
  if (!config.checks.hasWorkflowUrl) {
    config.recommendations.push('Set UPSTASH_WORKFLOW_URL=http://localhost:3400');
  }

  return NextResponse.json(config, {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Try to create a workflow manually and see what happens
    const { serve } = await import('@upstash/workflow/nextjs');

    const testWorkflow = serve(
      async (context) => {
        return {
          message: 'Manual workflow test',
          workflowRunId: context.workflowRunId,
        };
      },
      {
        receiver: undefined,
        verbose: true,
      },
    );

    return testWorkflow.POST(request);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to create workflow',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
