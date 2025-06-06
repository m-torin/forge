import { serve } from '@upstash/workflow/nextjs';

// Pure Upstash Workflow test - no orchestration package
export const { POST } = serve(
  async (context) => {
    // Log everything inside context.run for determinism
    const result = await context.run('pure-test-step', async () => {
      console.log('[PURE-TEST] Pure workflow executing');
      console.log('[PURE-TEST] Workflow ID:', context.workflowRunId);

      return {
        message: 'Pure Upstash Workflow test completed',
        success: true,
        workflowRunId: context.workflowRunId,
      };
    });

    return result;
  },
  {
    // Absolute minimal configuration
    receiver: undefined,
  },
);

export async function GET() {
  return Response.json({
    description: 'Direct @upstash/workflow usage without orchestration package',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      QSTASH_URL: process.env.QSTASH_URL,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    },
    message: 'Pure Upstash Workflow test',
  });
}
