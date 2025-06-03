import { type KitchenSinkPayload, kitchenSinkWorkflow } from '@repo/orchestration';

/**
 * Kitchen Sink Workflow Definition
 *
 * The ultimate comprehensive workflow demonstrating EVERY Upstash Workflow & QStash feature.
 * This local definition wraps the kitchen-sink workflow from @repo/orchestration
 * and provides app-specific metadata and default payload configuration.
 *
 * Features demonstrated:
 * - All context methods: run, call, sleep, sleepUntil, waitForEvent, notify, cancel, invoke
 * - Flow Control: Rate limiting and parallelism control
 * - URL Groups/Topics: Fan-out messaging to multiple endpoints
 * - Request Signing: Signature verification
 * - Batch Processing: Optimal batch processing with concurrency
 * - Dead Letter Queue: Native QStash DLQ integration
 * - Scheduling: Creating and managing recurring schedules
 * - Circuit Breaker pattern for external service calls
 * - Workflow patterns: saga, compensation, parallel race, multi-event wait
 */

export const workflowDefinition = {
  id: 'kitchen-sink-workflow',
  name: 'Kitchen Sink - Complete Feature Demo',
  description: 'Comprehensive workflow demonstrating all QStash and Upstash Workflow features',
  version: '2.0.0',

  // Import the workflow function from @repo/orchestration
  handler: kitchenSinkWorkflow,

  // Metadata for UI/documentation
  metadata: {
    category: 'examples',
    color: '#8B5CF6', // purple
    estimatedDuration: '2-5 minutes',
    features: [
      'All workflow context methods',
      'QStash flow control',
      'URL groups and fan-out',
      'Request signing',
      'Batch processing',
      'Dead letter queue',
      'Scheduling',
      'Circuit breaker',
      'Rate limiting',
      'Resource management',
      'Workflow patterns',
      'AI integration',
      'Multi-mode processing',
    ],
    icon: '🚀',
    tags: ['comprehensive', 'all-features', 'demo', 'advanced'],
    warning: 'This workflow demonstrates all features and may take longer to complete',
  },

  // Default payload for testing/examples
  defaultPayload: {
    // Basic fields
    name: 'Kitchen Sink Demo Run',
    priority: 7,
    taskId: `demo-${Date.now()}`,

    destination: { type: 'database' as const, config: { table: 'processed_data' } },
    // ETL Pipeline demo
    pipelineId: `pipeline-demo-${Date.now()}`,
    source: { type: 'api' as const, url: 'https://api.example.com/data' },
    transformations: ['validate', 'sanitize', 'filter', 'enrich'],

    customer: { id: 'cust-demo', email: 'demo@example.com', tier: 'premium' as const },
    items: [
      { price: 49.99, quantity: 2, sku: 'WIDGET-001' },
      { price: 99.99, quantity: 1, sku: 'GADGET-002' },
    ],
    // Order processing demo
    orderId: `order-demo-${Date.now()}`,

    coffeeOrders: [
      { customerName: 'Alice', style: 'cappuccino' },
      { customerName: 'Bob', style: 'latte' },
    ],
    // Orchestration demo
    datasetId: `dataset-demo-${Date.now()}`,
    notificationEmail: 'admin@example.com',
    operations: ['sum', 'average', 'max'] as ('sum' | 'average' | 'max')[],

    // Comprehensive options
    options: {
      batchSize: 5,
      maxDuration: 300,
      mode: 'full' as const,
      notifyOn: ['error', 'complete'],
      notifyOnComplete: true,
      requiresApproval: false,

      urlGroups: {
        enabled: false,
        endpoints: [],
        groupName: 'demo-notifications',
      },
      aiIntegration: {
        provider: 'anthropic' as const,
        enabled: false,
        maxTokens: 4000,
        model: 'claude-3-5-sonnet-20241022',
      },
      deduplication: {
        contentBased: false,
        enabled: true,
      },
      dlqHandling: {
        enabled: false,
        maxRetries: 3,
      },
      // QStash features
      flowControl: {
        key: 'kitchen-sink-demo',
        parallelism: 3,
        ratePerSecond: 10,
      },
      requestSigning: {
        enabled: false,
        verifySignatures: false,
      },
    },
  } satisfies KitchenSinkPayload,

  // Configuration for the workflow runtime
  config: {
    enableDeduplication: true,
    queueConcurrency: 20,
    retries: 3,
    timeout: 600, // 10 minutes
    verbose: true,
  },

  // Processing modes for different demo scenarios
  modes: {
    ai_pipeline: {
      name: 'AI Content Pipeline',
      description: 'AI-powered content moderation workflow',
      estimatedDuration: '1-2 minutes',
    },
    etl: {
      name: 'ETL Pipeline',
      description: 'Data extraction, transformation, and loading',
      estimatedDuration: '1-2 minutes',
    },
    event_processing: {
      name: 'Event Stream Processing',
      description: 'Real-time event batch processing',
      estimatedDuration: '30-60 seconds',
    },
    full: {
      name: 'Full Demo',
      description: 'Runs all features and patterns',
      estimatedDuration: '3-5 minutes',
    },
    orchestration: {
      name: 'Task Orchestration',
      description: 'Parallel task coordination and data processing',
      estimatedDuration: '30-60 seconds',
    },
    order: {
      name: 'Order Processing',
      description: 'E-commerce order workflow with validations',
      estimatedDuration: '30-60 seconds',
    },
    saas_workflow: {
      name: 'Multi-tenant SaaS',
      description: 'Tenant-specific operations with rate limiting',
      estimatedDuration: '1-2 minutes',
    },
  },

  // Input validation schema (simplified for UI)
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        default: 'Kitchen Sink Demo',
        description: 'Name for this workflow run',
      },
      options: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            default: 'full',
            description: 'Processing mode to run',
            enum: [
              'full',
              'etl',
              'order',
              'orchestration',
              'ai_pipeline',
              'saas_workflow',
              'event_processing',
            ],
          },
          requiresApproval: {
            type: 'boolean',
            default: false,
            description: 'Enable approval gates',
          },
          simulateFailure: {
            type: 'boolean',
            default: false,
            description: 'Simulate failures for testing error handling',
          },
        },
      },
    },
  },
};

// Export the type for use in other parts of the app
export type KitchenSinkWorkflowDefinition = typeof workflowDefinition;

// Default export for the workflow definition
export default workflowDefinition;
