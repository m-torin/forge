import { serve } from '@upstash/workflow/nextjs';

// Pure Upstash Workflow test - no orchestration package
export const { POST } = serve(
  async (context) => {
    // Log everything inside context.run for determinism
    const result = await context.run('pure-test-step', async () => {
      console.log('[PURE-TEST] Pure workflow executing');
      console.log('[PURE-TEST] Workflow ID:', context.workflowRunId);
      
      return {
        success: true,
        message: 'Pure Upstash Workflow test completed',
        workflowRunId: context.workflowRunId,
      };
    });

    return result;
  },
  {
    // Absolute minimal configuration
    receiver: undefined,
  }
);

export async function GET() {
  return Response.json({
    message: 'Pure Upstash Workflow test',
    description: 'Direct @upstash/workflow usage without orchestration package',
    environment: {
      QSTASH_URL: process.env.QSTASH_URL,
      UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}