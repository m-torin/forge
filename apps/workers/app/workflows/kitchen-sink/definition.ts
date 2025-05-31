import { kitchenSinkWorkflow } from '@repo/orchestration/examples';
import type { WorkflowDefinition } from '../types';

const definition: WorkflowDefinition = {
  metadata: {
    id: 'kitchen-sink',
    title: 'Kitchen Sink',
    description: 'Comprehensive workflow showcasing all QStash features and patterns',
    tags: ['demo', 'advanced', 'etl', 'orchestration'],
    difficulty: 'expert',
    estimatedTime: '2-5 minutes',
    color: 'purple',
    features: [
      'ETL Pipeline with transformations',
      'Order processing with inventory',
      'Multi-step orchestration',
      'Parallel coffee brewing simulation',
      'Data aggregation and reporting',
      'Conditional flow control',
      'Event-driven approval steps',
      'Comprehensive error recovery',
    ],
  },
  
  defaultPayload: {
    // ETL Pipeline
    destination: { type: 'database', config: { table: 'processed_data' } },
    pipelineId: `pipeline-${Date.now()}`,
    source: { type: 'api', url: 'https://api.example.com/data' },
    transformations: ['validate', 'sanitize', 'filter', 'enrich'],

    // Order Processing
    customer: { id: 'cust-456', email: 'test@example.com', tier: 'premium' },
    items: [{ price: 75, quantity: 2, sku: 'PREMIUM-ITEM' }],
    orderId: `order-${Date.now()}`,

    // Orchestration
    coffeeOrders: [
      { customerName: 'Alice', style: 'cappuccino' },
      { customerName: 'Bob', style: 'latte' },
    ],
    datasetId: `dataset-${Date.now()}`,
    notificationEmail: 'admin@example.com',
    operations: ['sum', 'average', 'max'],

    // Task Processing
    name: 'Comprehensive Kitchen Sink Demo',
    priority: 9,
    taskId: `task-${Date.now()}`,

    // Comprehensive options
    options: {
      batchSize: 10,
      maxDuration: 600,
      mode: 'full',
      notifyOn: ['complete'],
      notifyOnComplete: true,
      requiresApproval: true,
    },
  },
  
  workflow: kitchenSinkWorkflow,
};

export default definition;