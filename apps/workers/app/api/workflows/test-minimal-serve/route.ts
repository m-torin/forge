import { serve } from '@upstash/workflow/nextjs';
import { Client } from '@upstash/qstash';

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
      success: true,
      message: 'Minimal workflow completed',
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    };
  },
  {
    qstashClient,
    receiver: undefined,
    verbose: true,
    url: 'http://localhost:3400/api/workflows/test-minimal-serve',
  }
);

export async function GET() {
  return Response.json({
    message: 'Minimal serve workflow',
    description: 'Test with explicit QStash client configuration',
    config: {
      qstashUrl: 'http://localhost:8080',
      workflowUrl: 'http://localhost:3400/api/workflows/test-minimal-serve',
    },
  });
}