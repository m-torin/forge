import { serve } from '@upstash/workflow/nextjs';

// Simple workflow that works with local development
export const { POST } = serve(
  async (context) => {
    console.log('[TEST-LOCAL] Workflow executing', {
      headers: Object.fromEntries(context.headers.entries()),
      workflowRunId: context.workflowRunId,
    });

    // Return immediately - no steps to avoid authentication issues
    return {
      message: 'Local test workflow completed',
      success: true,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  },
  {
    // Minimal config for local dev
    receiver: undefined,
  },
);

export async function GET() {
  return Response.json({
    description: 'Minimal workflow for local development testing',
    message: 'Test local workflow',
  });
}
