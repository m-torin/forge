import { serve } from '@upstash/workflow/nextjs';
import { Client } from '@upstash/qstash';

// Create QStash client for local development
const qstashClient = new Client({
  baseUrl: 'http://localhost:8080',
  token: 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
});

export const { POST } = serve(
  async (context) => {
    console.log('[TEST-MINIMAL] Workflow started', {
      workflowRunId: context.workflowRunId,
      url: context.url,
    });
    
    // Try a simple step
    const result = await context.run('simple-step', async () => {
      console.log('[TEST-MINIMAL] Running simple step');
      return { step: 'completed', time: Date.now() };
    });
    
    console.log('[TEST-MINIMAL] Step result:', result);
    
    // Just return immediately without any more steps
    return {
      success: true,
      message: 'Minimal workflow completed',
      result,
      timestamp: new Date().toISOString(),
    };
  },
  {
    receiver: undefined, // Disable signature verification
    qstashClient: process.env.NODE_ENV === 'development' ? qstashClient : undefined,
    url: 'http://localhost:3400/api/workflows/test-minimal',
    verbose: true,
  }
);