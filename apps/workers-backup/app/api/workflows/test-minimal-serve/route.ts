import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

// Set up QStash client for local development
const qstashClient = new Client({
  baseUrl: 'http://localhost:8080',
  token: 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
});

// Minimal workflow with explicit client configuration
export const { POST } = serve(
  async (context) => {
    console.log('[MINIMAL-SERVE] Workflow started with ID:', context.workflowRunId);

    // Just return immediately without any steps
    return {
      message: 'Minimal workflow completed',
      success: true,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  },
  {
    url: 'http://localhost:3400/api/workflows/test-minimal-serve',
    qstashClient,
    receiver: undefined,
    verbose: true,
  },
);

export async function GET() {
  return Response.json({
    config: {
      qstashUrl: 'http://localhost:8080',
      workflowUrl: 'http://localhost:3400/api/workflows/test-minimal-serve',
    },
    description: 'Test with explicit QStash client configuration',
    message: 'Minimal serve workflow',
  });
}
