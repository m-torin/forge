import { serve } from '@upstash/workflow/nextjs';

// Deterministic workflow that follows Upstash guidelines
export const { POST } = serve(
  async (context) => {
    // All work must be inside context.run for determinism
    const result = await context.run('test-step', async () => {
      console.log('[TEST-DETERMINISTIC] Step executing');
      return {
        // Don't use Date.now() or Math.random() here
        data: 'static-result',
        message: 'Deterministic test completed',
        success: true,
      };
    });

    return {
      result,
      workflowRunId: context.workflowRunId,
    };
  },
  {
    receiver: undefined, // Disable signature verification for local dev
  },
);

export async function GET() {
  return Response.json({
    description: 'Workflow that follows determinism guidelines',
    message: 'Test deterministic workflow',
  });
}
