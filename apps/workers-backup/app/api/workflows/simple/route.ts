import { serve } from '@upstash/workflow/nextjs';

// Simple workflow that works with local QStash CLI
export const { POST } = serve(async (context) => {
  // Simple workflow that just returns immediately
  return {
    message: 'Simple workflow completed successfully',
    success: true,
    workflowRunId: context.workflowRunId,
  };
});

export async function GET() {
  return Response.json({
    description: 'Minimal workflow for testing local QStash CLI',
    message: 'Simple workflow endpoint',
  });
}
