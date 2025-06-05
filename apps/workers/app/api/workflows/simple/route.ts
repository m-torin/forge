import { serve } from '@upstash/workflow/nextjs';

// Simple workflow that works with local QStash CLI
export const { POST } = serve(async (context) => {
  // Simple workflow that just returns immediately
  return {
    success: true,
    workflowRunId: context.workflowRunId,
    message: 'Simple workflow completed successfully',
  };
});

export async function GET() {
  return Response.json({
    message: 'Simple workflow endpoint',
    description: 'Minimal workflow for testing local QStash CLI',
  });
}
