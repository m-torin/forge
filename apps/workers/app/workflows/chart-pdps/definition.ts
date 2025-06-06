export interface ChartPDPsPayload {
  message?: string;
  options?: {
    batchSize?: number;
    maxConcurrency?: number;
    timeout?: number;
  };
  productIds?: string[];
}

interface WorkflowDefinition {
  defaultPayload: ChartPDPsPayload;
  metadata: {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
    features: string[];
    tags: string[];
    color: string;
  };
  workflow: (context: any) => Promise<any>;
}

const chartPDPsDefinition: WorkflowDefinition = {
  defaultPayload: {
    message: 'Hello World from Chart PDPs!',
    options: {
      batchSize: 10,
      maxConcurrency: 3,
      timeout: 30000,
    },
    productIds: ['PROD-001', 'PROD-002', 'PROD-003'],
  },
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
  workflow: async (context: any) => {
    const payload = context.requestPayload || {};
    const message = payload.message || chartPDPsDefinition.defaultPayload.message;
    const productIds = payload.productIds || [];

    // Log start step
    await context.run('log-start', async () => {
      console.log(`Starting chart PDPs workflow: ${message}`);
      console.log(`Processing ${productIds.length} products`);
      console.log(`Processing PDPs for products: ${productIds.join(', ')}`);
      return { started: true };
    });

    // Process PDPs step
    await context.run('process-pdps', async () => {
      return {
        message,
        processedCount: productIds.length,
        productIds,
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      };
    });

    return {
      data: {
        message,
        processedCount: productIds.length,
        productIds,
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        workflowRunId: context.workflowRunId,
      },
      status: 'success',
    };
  },
};

export default chartPDPsDefinition;
