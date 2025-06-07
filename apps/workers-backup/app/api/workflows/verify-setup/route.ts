import { serve } from '@upstash/workflow/nextjs';

// Simple workflow to verify local setup is working correctly
export const { POST } = serve(
  async (context) => {
    console.log('[VERIFY-SETUP] Starting workflow verification');
    console.log('[VERIFY-SETUP] Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY ? 'SET' : 'NOT SET',
      QSTASH_TOKEN: process.env.QSTASH_TOKEN ? 'SET' : 'NOT SET',
      QSTASH_URL: process.env.QSTASH_URL,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    });

    // Step 1: Verify basic execution
    const step1 = await context.run('verify-basic', async () => {
      console.log('[VERIFY-SETUP] Step 1: Basic execution works');
      return { step: 1, success: true, timestamp: Date.now() };
    });

    // Step 2: Verify step data persistence
    const step2 = await context.run('verify-persistence', async () => {
      console.log('[VERIFY-SETUP] Step 2: Previous step data:', step1);
      return { previousData: step1, step: 2, success: true, timestamp: Date.now() };
    });

    // Step 3: Final verification
    const step3 = await context.run('verify-complete', async () => {
      console.log('[VERIFY-SETUP] Step 3: All steps completed successfully');
      return {
        allSteps: [step1, step2],
        message: 'Local QStash setup is working correctly!',
        step: 3,
        success: true,
        timestamp: Date.now(),
      };
    });

    return {
      message: 'Workflow verification completed',
      results: step3,
      success: true,
      workflowRunId: context.workflowRunId,
    };
  },
  {
    // For local development with QStash CLI
    receiver: undefined, // Disable signature verification as per docs
    verbose: true, // Enable detailed logging
  },
);

// GET endpoint for checking the route exists
export async function GET() {
  return Response.json({
    description: 'POST to this endpoint to verify your local QStash setup',
    expectedEnv: {
      QSTASH_TOKEN: 'Should match QStash CLI output',
      QSTASH_URL: 'http://localhost:8080',
      UPSTASH_WORKFLOW_URL: 'http://localhost:3400',
    },
    message: 'Workflow verification endpoint',
  });
}
