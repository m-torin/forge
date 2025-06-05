import { serve } from '@upstash/workflow/nextjs';

// Raw workflow test without using orchestration package
export const { POST } = serve(
  async (context) => {
    console.log('[TEST-RAW] Starting raw workflow test');

    // Simple step without any complexity
    const result = await context.run('simple-step', async () => {
      console.log('[TEST-RAW] Executing simple step');
      return { success: true, timestamp: new Date().toISOString() };
    });

    console.log('[TEST-RAW] Step completed:', result);

    return {
      message: 'Raw workflow completed',
      result,
      workflowRunId: context.workflowRunId,
    };
  },
  {
    // Minimal configuration for local development
    receiver: undefined,
    verbose: true,
  },
);

export async function GET() {
  return Response.json({
    message: 'Test raw workflow endpoint',
    description: 'Minimal workflow without orchestration package',
  });
}
