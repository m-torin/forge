import type { WorkflowContext } from '@upstash/workflow';
import type { WorkflowDefinition } from '../types';

export interface ChartSitemapsPayload {
  message?: string;
  url?: string;
}

const chartSitemapsWorkflow = async (context: WorkflowContext<ChartSitemapsPayload>) => {
  const { message = 'Hello World from Chart Sitemaps!', url } = context.requestPayload || {};

  // Step 1: Log the start
  await context.run('log-start', async () => {
    console.log(`Starting chart sitemaps workflow: ${message}`);
    return { started: true };
  });

  // Step 2: Process (placeholder)
  const result = await context.run('process-sitemap', async () => {
    console.log(`Processing sitemap: ${url || 'no URL provided'}`);
    return {
      message,
      url,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

  // Return the result
  return {
    status: 'success' as const,
    data: result,
    metadata: {
      workflowRunId: context.workflowRunId,
      timestamp: new Date().toISOString(),
    },
  };
};

const definition: WorkflowDefinition = {
  metadata: {
    id: 'chart-sitemaps',
    title: 'Chart Sitemaps',
    description: 'Process and analyze chart sitemaps for data extraction',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'cyan',
    features: [
      'Chart sitemap processing',
      'Data extraction',
      'URL analysis',
      'Structured data parsing',
    ],
  },
  
  defaultPayload: {
    message: 'Hello World from Chart Sitemaps!',
    url: 'https://example.com/sitemap.xml',
  },
  
  workflow: chartSitemapsWorkflow,
};

export default definition;