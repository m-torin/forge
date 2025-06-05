import { serve } from '@upstash/workflow/nextjs';

// Simple workflow that works with local development
export const { POST } = serve(
  async (context) => {
    console.log('[TEST-LOCAL] Workflow executing', {
      workflowRunId: context.workflowRunId,
      headers: Object.fromEntries(context.headers.entries()),
    });

    // Return immediately - no steps to avoid authentication issues
    return {
      success: true,
      message: 'Local test workflow completed',
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    };
  },
  {
    // Minimal config for local dev
    receiver: undefined,
  }
);

export async function GET() {
  return Response.json({
    message: 'Test local workflow',
    description: 'Minimal workflow for local development testing',
  });
}