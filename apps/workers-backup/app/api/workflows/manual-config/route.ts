import { Client } from '@upstash/qstash';
import { serve } from '@upstash/workflow/nextjs';

// Manually configure QStash client for local development
const qstashClient = new Client({
  baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
  token:
    process.env.QSTASH_TOKEN ||
    'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
});

export const { POST } = serve(
  async (context) => {
    const result = await context.run('manual-config-step', async () => {
      console.log('[MANUAL-CONFIG] Workflow with manual QStash client config');

      return {
        message: 'Manual config workflow completed',
        qstashConfig: {
          baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
          hasToken: !!process.env.QSTASH_TOKEN,
        },
        success: true,
        workflowRunId: context.workflowRunId,
      };
    });

    return result;
  },
  {
    url: 'http://localhost:3400/api/workflows/manual-config',
    qstashClient,
    receiver: undefined,
    verbose: true,
  },
);

export async function GET() {
  return Response.json({
    config: {
      baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
      workflowUrl: 'http://localhost:3400/api/workflows/manual-config',
    },
    description: 'Workflow with explicitly configured QStash client',
    message: 'Manual config workflow test',
  });
}
