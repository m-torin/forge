import { kitchenSinkWorkflow, type KitchenSinkPayload } from '@repo/orchestration';

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
    tags: ['comprehensive', 'all-features', 'demo', 'advanced'],
    icon: '🚀',
    color: '#8B5CF6', // purple
    estimatedDuration: '2-5 minutes',
    warning: 'This workflow demonstrates all features and may take longer to complete',
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
      'Multi-mode processing'
    ]
  },
  
  // Default payload for testing/examples
  defaultPayload: {
    // Basic fields
    name: 'Kitchen Sink Demo Run',
    priority: 7,
    taskId: `demo-${Date.now()}`,
    
    // ETL Pipeline demo
    pipelineId: `pipeline-demo-${Date.now()}`,
    source: { type: 'api' as const, url: 'https://api.example.com/data' },
    transformations: ['validate', 'sanitize', 'filter', 'enrich'],
    destination: { type: 'database' as const, config: { table: 'processed_data' } },
    
    // Order processing demo
    orderId: `order-demo-${Date.now()}`,
    customer: { id: 'cust-demo', email: 'demo@example.com', tier: 'premium' as const },
    items: [
      { sku: 'WIDGET-001', quantity: 2, price: 49.99 },
      { sku: 'GADGET-002', quantity: 1, price: 99.99 }
    ],
    
    // Orchestration demo
    datasetId: `dataset-demo-${Date.now()}`,
    operations: ['sum', 'average', 'max'] as ('sum' | 'average' | 'max')[],
    coffeeOrders: [
      { customerName: 'Alice', style: 'cappuccino' },
      { customerName: 'Bob', style: 'latte' }
    ],
    notificationEmail: 'admin@example.com',
    
    // Comprehensive options
    options: {
      mode: 'full' as const,
      batchSize: 5,
      requiresApproval: false,
      notifyOnComplete: true,
      notifyOn: ['error', 'complete'],
      maxDuration: 300,
      
      // QStash features
      flowControl: {
        key: 'kitchen-sink-demo',
        ratePerSecond: 10,
        parallelism: 3
      },
      deduplication: {
        enabled: true,
        contentBased: false
      },
      urlGroups: {
        enabled: false,
        groupName: 'demo-notifications',
        endpoints: []
      },
      requestSigning: {
        enabled: false,
        verifySignatures: false
      },
      dlqHandling: {
        enabled: false,
        maxRetries: 3
      },
      aiIntegration: {
        enabled: false,
        provider: 'anthropic' as const,
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000
      }
    }
  } satisfies KitchenSinkPayload,
  
  // Configuration for the workflow runtime
  config: {
    retries: 3,
    timeout: 600, // 10 minutes
    queueConcurrency: 20,
    enableDeduplication: true,
    verbose: true
  },
  
  // Processing modes for different demo scenarios
  modes: {
    full: {
      name: 'Full Demo',
      description: 'Runs all features and patterns',
      estimatedDuration: '3-5 minutes'
    },
    etl: {
      name: 'ETL Pipeline',
      description: 'Data extraction, transformation, and loading',
      estimatedDuration: '1-2 minutes'
    },
    order: {
      name: 'Order Processing',
      description: 'E-commerce order workflow with validations',
      estimatedDuration: '30-60 seconds'
    },
    orchestration: {
      name: 'Task Orchestration',
      description: 'Parallel task coordination and data processing',
      estimatedDuration: '30-60 seconds'
    },
    ai_pipeline: {
      name: 'AI Content Pipeline',
      description: 'AI-powered content moderation workflow',
      estimatedDuration: '1-2 minutes'
    },
    saas_workflow: {
      name: 'Multi-tenant SaaS',
      description: 'Tenant-specific operations with rate limiting',
      estimatedDuration: '1-2 minutes'
    },
    event_processing: {
      name: 'Event Stream Processing',
      description: 'Real-time event batch processing',
      estimatedDuration: '30-60 seconds'
    }
  },
  
  // Input validation schema (simplified for UI)
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name for this workflow run',
        default: 'Kitchen Sink Demo'
      },
      options: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['full', 'etl', 'order', 'orchestration', 'ai_pipeline', 'saas_workflow', 'event_processing'],
            description: 'Processing mode to run',
            default: 'full'
          },
          requiresApproval: {
            type: 'boolean',
            description: 'Enable approval gates',
            default: false
          },
          simulateFailure: {
            type: 'boolean',
            description: 'Simulate failures for testing error handling',
            default: false
          }
        }
      }
    }
  }
};

// Export the type for use in other parts of the app
export type KitchenSinkWorkflowDefinition = typeof workflowDefinition;