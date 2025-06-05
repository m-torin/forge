import { serve } from '@upstash/workflow/nextjs';

// Deterministic workflow that follows Upstash guidelines
export const { POST } = serve(
  async (context) => {
    // All work must be inside context.run for determinism
    const result = await context.run('test-step', async () => {
      console.log('[TEST-DETERMINISTIC] Step executing');
      return {
        success: true,
        message: 'Deterministic test completed',
        // Don't use Date.now() or Math.random() here
        data: 'static-result',
      };
    });

    return {
      workflowRunId: context.workflowRunId,
      result,
    };
  },
  {
    receiver: undefined, // Disable signature verification for local dev
  },
);

export async function GET() {
  return Response.json({
    message: 'Test deterministic workflow',
    description: 'Workflow that follows determinism guidelines',
  });
}
