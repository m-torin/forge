import type { WorkflowContext } from '@upstash/workflow';
import type { WorkflowDefinition } from '../types';

export interface ChartPDPsPayload {
  message?: string;
  productIds?: string[];
}

const chartPDPsWorkflow = async (context: WorkflowContext<ChartPDPsPayload>) => {
  const { message = 'Hello World from Chart PDPs!', productIds = [] } = context.requestPayload || {};

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
      productIds,
      processedCount: productIds.length,
      timestamp: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    };
  });

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
    id: 'chart-pdps',
    title: 'Chart PDPs',
    description: 'Process and analyze chart product detail pages',
    tags: ['jollyRoger', 'etl'],
    difficulty: 'beginner',
    estimatedTime: '5-10 seconds',
    color: 'teal',
    features: [
      'Product detail page processing',
      'Chart data extraction',
      'Batch processing support',
      'Product metadata analysis',
    ],
  },
  
  defaultPayload: {
    message: 'Hello World from Chart PDPs!',
    productIds: ['PROD-001', 'PROD-002', 'PROD-003'],
  },
  
  workflow: chartPDPsWorkflow,
};

export default definition;