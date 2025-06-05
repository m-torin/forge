import { serve } from '@upstash/workflow/nextjs';
import { Client } from '@upstash/qstash';

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
        success: true,
        message: 'Manual config workflow completed',
        workflowRunId: context.workflowRunId,
        qstashConfig: {
          baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
          hasToken: !!process.env.QSTASH_TOKEN,
        },
      };
    });

    return result;
  },
  {
    qstashClient,
    receiver: undefined,
    verbose: true,
    url: 'http://localhost:3400/api/workflows/manual-config',
  },
);

export async function GET() {
  return Response.json({
    message: 'Manual config workflow test',
    description: 'Workflow with explicitly configured QStash client',
    config: {
      baseUrl: process.env.QSTASH_URL || 'http://localhost:8080',
      workflowUrl: 'http://localhost:3400/api/workflows/manual-config',
    },
  });
}
