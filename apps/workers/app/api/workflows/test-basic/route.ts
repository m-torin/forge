import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

// Simple test workflow for debugging
export const { POST } = serve(
  async (context) => {
    console.log('[TEST-BASIC] Workflow started');
    console.log('[TEST-BASIC] Context:', {
      url: context.url,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
        QSTASH_URL: process.env.QSTASH_URL,
      },
      workflowRunId: context.workflowRunId,
    });

    // Step 1: Simple log
    const step1Result = await context.run('simple-log', async () => {
      console.log('[TEST-BASIC] Running simple-log step');
      return {
        message: 'Step 1 completed',
        timestamp: new Date().toISOString(),
      };
    });

    console.log('[TEST-BASIC] Step 1 result:', step1Result);

    // Step 2: Another simple step
    const step2Result = await context.run('another-step', async () => {
      console.log('[TEST-BASIC] Running another-step');
      return {
        message: 'Step 2 completed',
        previousStep: step1Result,
        timestamp: new Date().toISOString(),
      };
    });

    console.log('[TEST-BASIC] Step 2 result:', step2Result);

    return {
      completedAt: new Date().toISOString(),
      steps: [step1Result, step2Result],
      success: true,
    };
  },
  {
    qstashClient: new Client({
      baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
      token:
        process.env.QSTASH_TOKEN ||
        'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
    }),
    // Explicitly configure for local development
    receiver: undefined, // Skip signature verification
    verbose: true,
  },
);

// GET endpoint for testing
export async function GET() {
  return Response.json({
    env: {
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_URL: process.env.QSTASH_URL || 'Not set',
    },
    message: 'Test basic workflow endpoint',
  });
}
