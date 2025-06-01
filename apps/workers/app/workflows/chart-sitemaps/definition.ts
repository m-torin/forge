import type { WorkflowDefinition } from '../types';
import type { WorkflowContext } from '@upstash/workflow';

export interface ChartSitemapsPayload {
  message?: string;
  url?: string;
}

const chartSitemapsWorkflow = async (context: WorkflowContext<ChartSitemapsPayload>) => {
  const { url, message = 'Hello World from Chart Sitemaps!' } = context.requestPayload || {};

  // Step 1: Log the start
  await context.run('log-start', async () => {
    console.log(`Starting chart sitemaps workflow: ${message}`);
    return { started: true };
  });

  // Step 2: Process (placeholder)
  const result = await context.run('process-sitemap', async () => {
    console.log(`Processing sitemap: ${url || 'no URL provided'}`);
    return {
      url,
      message,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

  // Return the result
  return {
    data: result,
    metadata: {
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    },
    status: 'success' as const,
  };
};

const definition: WorkflowDefinition = {
  metadata: {
    id: 'chart-sitemaps',
    color: 'cyan',
    description: 'Process and analyze chart sitemaps for data extraction',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Chart sitemap processing',
      'Data extraction',
      'URL analysis',
      'Structured data parsing',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Chart Sitemaps',
  },

  defaultPayload: {
    url: 'https://example.com/sitemap.xml',
    message: 'Hello World from Chart Sitemaps!',
  },

  workflow: chartSitemapsWorkflow,
};

export default definition;
