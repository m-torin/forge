import type { WorkflowDefinition } from '../types';
import type { WorkflowContext } from '@upstash/workflow';

export interface ChartPDPsPayload {
  message?: string;
  productIds?: string[];
}

const chartPDPsWorkflow = async (context: WorkflowContext<ChartPDPsPayload>) => {
  const { message = 'Hello World from Chart PDPs!', productIds = [] } =
    context.requestPayload || {};

  // Step 1: Log the start
  await context.run('log-start', async () => {
    console.log(`Starting chart PDPs workflow: ${message}`);
    console.log(`Processing ${productIds.length} products`);
    return { started: true };
  });

  // Step 2: Process products (placeholder)
  const result = await context.run('process-pdps', async () => {
    console.log(`Processing PDPs for products: ${productIds.join(', ')}`);
    return {
      message,
      processedCount: productIds.length,
      productIds,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

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
    id: 'chart-pdps',
    color: 'teal',
    description: 'Process and analyze chart product detail pages',
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    features: [
      'Product detail page processing',
      'Chart data extraction',
      'Batch processing support',
      'Product metadata analysis',
    ],
    tags: ['jollyRoger', 'etl'],
    title: 'Chart PDPs',
  },

  defaultPayload: {
    message: 'Hello World from Chart PDPs!',
    productIds: ['PROD-001', 'PROD-002', 'PROD-003'],
  },

  workflow: chartPDPsWorkflow,
};

export default definition;
