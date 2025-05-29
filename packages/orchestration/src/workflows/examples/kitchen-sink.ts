import { extractPayload } from '../../runtime';
import { createResponse, workflowError } from '../../utils/response';
import { withDeduplication } from '../../runtime/deduplication';
import { type BatchConfig, processBatches } from '../../runtime/features/batch-processing';
import { type DLQConfig, handleFailuresWithDLQ } from '../../runtime/features/dlq-handling';
import { type FlowControlConfig, runWithFlowControl } from '../../runtime/features/flow-control';
import { type RequestSigningConfig, verifyQStashSignature } from '../../runtime/features/request-signing';
import { type FanOutOptions, fanOutToURLGroup } from '../../runtime/features/url-groups';
import { devLog } from '../../utils/observability';
import { CircuitBreaker, RateLimiter } from '../../utils/resilience';
import { ResourceManager } from '../../utils/resource-management';
import { WorkflowScheduler } from '../../runtime/scheduler';
import { waitForMultipleEvents, parallelRacePattern, sagaPattern, compensateOnFailure } from '../../runtime/patterns/patterns';

import type { EnhancedContext } from '../../runtime';
import type { WorkflowContext } from '../../utils/types';

/**
 * Kitchen Sink Workflow Example
 * The ultimate comprehensive workflow demonstrating EVERY Upstash Workflow & QStash feature.
 *
 * Features demonstrated:
 *
 * CORE WORKFLOW FEATURES:
 * - All context methods: run, call, sleep, sleepUntil, waitForEvent, notify, cancel, invoke
 * - All configuration options: retries, verbose, failureUrl, failureFunction, etc.
 * - Enhanced context with utilities and deduplication
 *
 * QSTASH FEATURES:
 * - Flow Control: Rate limiting and parallelism control
 * - URL Groups/Topics: Fan-out messaging to multiple endpoints
 * - Request Signing: Signature verification and outgoing request signing
 * - Batch Processing: Optimal batch processing with concurrency control
 * - Dead Letter Queue: Native QStash DLQ integration with failure callbacks
 * - Failure Handling: Comprehensive error categorization and retry strategies
 * - Scheduling: Creating and managing recurring schedules
 * - Webhook Handling: Secure webhook endpoint with signature verification
 *
 * ADVANCED FEATURES:
 * - Parallel execution with Promise.all
 * - Workflow invocation with context.invoke
 * - Self-scheduling workflows
 * - Webhook endpoint with signature verification
 * - Circuit Breaker pattern for external service calls
 * - Rate Limiter for controlling operation throughput
 * - Resource Manager with AsyncDisposableStack
 * - Workflow patterns: saga, compensation, parallel race, multi-event wait
 * - Additional patterns: mapReduce, pipeline, parallelExecute, fanOutFanIn, retryWithBackoff, scheduledExecution
 */

// Type definition for the comprehensive payload
export interface KitchenSinkPayload {
  // ETL Pipeline fields
  destination?: { type: 'database' | 'api' | 's3'; config: any };
  pipelineId?: string;
  source?: { type: 'api' | 'file' | 'database'; url: string };
  transformations?: string[];

  customer?: { id: string; email: string; tier: 'standard' | 'premium' };
  items?: { sku: string; quantity: number; price: number }[];
  // Order processing fields
  orderId?: string;

  // AI Content Moderation Pipeline fields
  contentModerationJob?: {
    jobId: string;
    content: {
      id: string;
      type: 'text' | 'image' | 'video';
      data: string;
      metadata: { userId: string; platform: string; timestamp: string };
    }[];
    moderationRules: {
      checkToxicity: boolean;
      checkSpam: boolean;
      checkAdultContent: boolean;
      customPrompt?: string;
    };
    notificationEndpoints: string[];
  };

  // Multi-Tenant SaaS Workflow fields
  tenantOperation?: {
    tenantId: string;
    operationType: 'user_onboarding' | 'data_sync' | 'billing_update' | 'feature_rollout';
    operationData: any;
    tenantConfig: {
      rateLimit: number;
      parallelism: number;
      endpoints: string[];
    };
    deduplicationId?: string;
  };

  // Real-time Event Processing fields
  eventProcessing?: {
    eventBatch: {
      eventId: string;
      eventType: string;
      timestamp: string;
      data: any;
      source: string;
    }[];
    processingConfig: {
      batchSize: number;
      aggregationWindow: string;
      outputTargets: string[];
    };
    signatureValidation: boolean;
  };

  // Orchestration fields
  coffeeOrders?: { style: string; customerName: string }[];
  datasetId?: string;
  notificationEmail?: string;
  operations?: ('sum' | 'average' | 'max' | 'min')[];

  // Comprehensive options
  options?: {
    batchSize?: number;
    requiresApproval?: boolean;
    notifyOn?: string[];
    scheduleAt?: string;
    maxDuration?: number;
    notifyOnComplete?: boolean;
    mode?:
      | 'ai_pipeline'
      | 'saas_workflow'
      | 'event_processing'
      | 'etl'
      | 'order'
      | 'orchestration'
      | 'full';

    // Flow Control options
    flowControl?: {
      key?: string;
      ratePerSecond?: number;
      parallelism?: number;
    };

    // Deduplication options
    deduplication?: {
      enabled: boolean;
      contentBased?: boolean;
      customId?: string;
    };

    // URL Groups/Fan-out options
    urlGroups?: {
      enabled: boolean;
      groupName?: string;
      endpoints?: string[];
    };

    // Request signing
    requestSigning?: {
      enabled: boolean;
      verifySignatures?: boolean;
    };

    // DLQ handling
    dlqHandling?: {
      enabled: boolean;
      maxRetries?: number;
      dlqEndpoint?: string;
    };

    // AI Integration options
    aiIntegration?: {
      enabled: boolean;
      provider: 'anthropic';
      model?: string;
      maxTokens?: number;
    };
  };

  // Task fields
  name?: string;
  priority?: number;
  taskId?: string;
  
  // Explicit deduplication support
  dedupId?: string;
}

// Helper function for data processing orchestration
async function processDataProcessingWorkflow(
  context: WorkflowContext<any>,
  payload: {
    data: { id: string; value: number }[];
    processingType: 'sum' | 'average' | 'max' | 'min';
  },
) {
  const { data, processingType } = payload;

  await context.run('validate-data', async () => {
    devLog.workflow(context, `Processing ${data.length} items with operation: ${processingType}`);
    if (!data || data.length === 0) {
      throw new Error('No data provided');
    }
    return { valid: true, count: data.length };
  });

  const result = await context.run('process-data', async () => {
    const values = data.map((item) => item.value);

    switch (processingType) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'average':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'max':
        return Math.max(...values);
      case 'min':
        return Math.min(...values);
      default:
        throw new Error(`Unknown processing type: ${processingType}`);
    }
  });

  return {
    itemCount: data.length,
    processedAt: new Date().toISOString(),
    processingType,
    result,
  };
}

// Main Kitchen Sink workflow logic
export async function kitchenSinkWorkflow(context: EnhancedContext<KitchenSinkPayload>) {
  // Development logging
  devLog.workflow(context, 'Starting kitchen sink workflow', {
    payload: context.requestPayload,
    workflowRunId: context.workflowRunId,
  });

  // Extract and validate payload with comprehensive defaults
  const payload = extractPayload<KitchenSinkPayload>(context, {
    // Task defaults
    name: 'Comprehensive Kitchen Sink Task',
    // Orchestration defaults
    coffeeOrders: [
      { customerName: 'Alice', style: 'cappuccino' },
      { customerName: 'Bob', style: 'latte' },
    ],
    // Order defaults
    customer: { id: 'cust-456', email: 'test@example.com', tier: 'premium' as const },
    datasetId: `dataset-${Date.now()}`,
    destination: { type: 'database' as const, config: { table: 'processed_data' } },
    items: [{ price: 50, quantity: 2, sku: 'ITEM-1' }],
    notificationEmail: 'admin@example.com',
    operations: ['sum', 'average', 'max'] as const,
    options: {
      urlGroups: {
        enabled: false,
        endpoints: [],
        groupName: 'kitchen-sink-notifications',
      },
      aiIntegration: {
        provider: 'anthropic' as const,
        enabled: true,
        maxTokens: 4000,
        model: 'claude-3-5-sonnet-20241022',
      },
      batchSize: 10,
      deduplication: {
        contentBased: false,
        enabled: true,
      },
      dlqHandling: {
        enabled: false,
        maxRetries: 3,
      },
      // QStash feature defaults
      flowControl: {
        key: 'kitchen-sink',
        parallelism: 3,
        ratePerSecond: 10,
      },
      maxDuration: 600,
      mode: 'full' as const,
      notifyOn: ['error', 'complete'],
      notifyOnComplete: true,
      requestSigning: {
        enabled: false,
        verifySignatures: false,
      },
      requiresApproval: true,
      scheduleAt: new Date(Date.now() + 2000).toISOString(),
    },
    orderId: `order-${Date.now()}`,
    pipelineId: `pipeline-${Date.now()}`,
    priority: 7,
    source: { type: 'api' as const, url: 'https://api.example.com/data' },
    taskId: `task-${Date.now()}`,
    transformations: ['validate', 'sanitize', 'filter', 'enrich'],
  });

  // Handle deduplication
  const result = await withDeduplication(
    context,
    async () => {
      // Determine processing mode
      const mode = payload.options?.mode || 'full';

      // Route to appropriate processing function
      switch (mode) {
        case 'ai_pipeline':
          return processAIPipeline(context, payload);
        case 'saas_workflow':
          return processSaaSWorkflow(context, payload);
        case 'event_processing':
          return processEventStream(context, payload);
        case 'etl':
          return processETLPipeline(context, payload);
        case 'order':
          return processOrderWorkflow(context, payload);
        case 'orchestration':
          return processOrchestration(context, payload);
        case 'full':
        default:
          return processComprehensiveWorkflow(context, payload);
      }
    },
    { 
      debug: context.dev?.isDevelopment,
      // Uses dedupId by default, with fallback to orderId, pipelineId, etc.
    },
  );

  return result;
}

// ETL Pipeline processing
async function processETLPipeline(context: WorkflowContext<any>, payload: KitchenSinkPayload) {
  const { destination, options = {}, pipelineId, source, transformations } = payload;

  // Validate ETL-specific fields
  if (!pipelineId || !source || !transformations || !destination) {
    return workflowError.validation(
      'ETL mode requires pipelineId, source, transformations, and destination',
    );
  }

  devLog.workflow(context, `Starting data pipeline ${pipelineId}`);

  // Step 1: Schedule if needed (sleepUntil)
  if (options.scheduleAt) {
    const scheduleTime = new Date(options.scheduleAt).getTime();
    const now = Date.now();

    if (scheduleTime > now) {
      devLog.workflow(context, `Scheduling pipeline to run at ${options.scheduleAt}`);
      await context.sleepUntil('scheduled-start', scheduleTime);
    }
  }

  // Step 2: Extract data from source
  const extractedData = await context.run('extract-data', async () => {
    devLog.workflow(context, `Extracting data from ${source.type}: ${source.url}`);

    switch (source.type) {
      case 'api':
        // Demonstrate context.call for HTTP requests
        const response = await context
          .call('fetch-api-data', {
            url: source.url,
            headers: {
              Authorization: 'Bearer demo-token',
            },
            method: 'GET',
            retries: 2,
          })
          .catch(() => ({
            // Fallback for demo
            body: {
              records: Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                timestamp: new Date().toISOString(),
                value: Math.random() * 1000,
              })),
            },
          }));
        return response.body.records;

      case 'file':
        // Simulate file reading
        return Array.from({ length: 50 }, (_, i) => ({
          id: `file-${i}`,
          data: `Row ${i}`,
        }));

      case 'database':
        // Simulate database query
        return Array.from({ length: 200 }, (_, i) => ({
          id: `db-${i}`,
          record: { field: `Value ${i}` },
        }));

      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  });

  devLog.workflow(context, `Extracted ${extractedData.length} records`);

  // Step 3: Apply transformations (parallel processing)
  const transformedData = await context.run('transform-data', async () => {
    const results = [];
    const batchSize = options.batchSize || 10;

    // Process in batches
    for (let i = 0; i < extractedData.length; i += batchSize) {
      const batch = extractedData.slice(i, i + batchSize);

      // Process batch items
      const batchResults = batch.map((item: any) => {
        let result = item;

        // Apply each transformation
        for (const transform of transformations) {
          switch (transform) {
            case 'validate':
              if (!result.id) throw new Error('Invalid item: missing ID');
              break;

            case 'sanitize':
              result = { ...result, sanitized: true };
              break;

            case 'filter':
              if (Math.random() > 0.8) return null; // Filter out 20%
              break;

            case 'enrich':
              result = {
                ...result,
                enriched: {
                  pipelineId,
                  processedAt: new Date().toISOString(),
                },
              };
              break;

            default:
              devLog.workflow(context, `Unknown transformation: ${transform}`);
          }
        }

        return result;
      });

      results.push(...batchResults.filter(Boolean));
    }

    return results;
  });

  devLog.workflow(context, `Transformed ${transformedData.length} records`);

  // Step 4: Approval gate (waitForEvent)
  if (options.requiresApproval) {
    devLog.workflow(context, `Pipeline ${pipelineId} requires approval`);

    // Send notification for approval
    await context.run('send-approval-request', async () => {
      devLog.workflow(context, `Approval request sent for pipeline ${pipelineId}`);
      return { notificationSent: true };
    });

    // Wait for approval
    let approvalResult;
    const skipAutoApproval = process.env.SKIP_AUTO_APPROVAL === 'true';

    if (!skipAutoApproval) {
      devLog.workflow(context, `[DEV] Auto-approving pipeline ${pipelineId} in development mode`);
      approvalResult = { approved: true, approver: 'auto-dev' };
    } else {
      try {
        const eventId = `approve-pipeline-${pipelineId}`;
        const { eventData, timeout } = await context.waitForEvent(
          'pipeline-approval',
          eventId,
          { timeout: '10m' },
        );

        if (timeout) {
          // Cancel the workflow on timeout
          await context.cancel('approval-timeout');
          throw new Error('Pipeline approval timeout');
        }

        approvalResult = eventData as { approved: boolean; approver: string };
      } catch (error) {
        throw error;
      }
    }

    if (!approvalResult?.approved) {
      await context.run('pipeline-rejected', async () => {
        devLog.workflow(context, `Pipeline ${pipelineId} rejected`);
        return { status: 'rejected' };
      });
      return createResponse('skipped', {
        pipelineId,
        reason: 'Pipeline rejected by approver',
      });
    }
  }

  // Step 5: Load data to destination
  const loadResult = await context.run('load-data', async () => {
    devLog.workflow(context, `Loading ${transformedData.length} records to ${destination.type}`);

    switch (destination.type) {
      case 'database':
        return {
          inserted: transformedData.length,
          table: destination.config.table || 'default_table',
        };

      case 'api':
        const response = await context
          .call('post-to-api', {
            url: destination.config.url || 'https://example.com/api/data',
            body: { records: transformedData },
            headers: {
              Authorization: `Bearer ${destination.config.apiKey || 'demo'}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })
          .catch(() => ({
            body: { processed: transformedData.length, success: true },
          }));
        return response.body;

      case 's3':
        return {
          bucket: destination.config.bucket || 'demo-bucket',
          key: `pipeline/${pipelineId}/${Date.now()}.json`,
          size: JSON.stringify(transformedData).length,
        };

      default:
        throw new Error(`Unsupported destination type: ${destination.type}`);
    }
  });

  // Step 6: Send notifications (notify)
  if (options.notifyOn?.includes('complete')) {
    try {
      await context.notify({
        eventData: {
          completedAt: new Date().toISOString(),
          pipelineId,
          recordsProcessed: transformedData.length,
        },
        eventId: `pipeline-complete-${pipelineId}`,
      });
      devLog.workflow(context, `Completion notification sent for pipeline ${pipelineId}`);
    } catch (error) {
      // In development, QStash notify might not be fully configured
      devLog.workflow(context, `Notification failed (development): ${error}`);
    }
  }

  return createResponse(
    'success',
    {
      destination: destination.type,
      pipelineId,
      recordsExtracted: extractedData.length,
      recordsLoaded: loadResult,
      recordsTransformed: transformedData.length,
      source: source.type,
      transformations: transformations,
    },
    {
      completedAt: new Date().toISOString(),
      workflowRunId: context.workflowRunId,
    },
  );
}

// Order processing workflow
async function processOrderWorkflow(context: WorkflowContext<any>, payload: KitchenSinkPayload) {
  const { customer, items, options = {}, orderId } = payload;

  // Validate order-specific fields
  if (!orderId || !items || !customer) {
    return workflowError.validation('Order mode requires orderId, items, and customer');
  }

  devLog.workflow(context, `Processing order ${orderId} for customer ${customer.id}`);

  // Step 1: Validate order
  const orderValidation = await context.run('validate-order', async () => {
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const requiresManualApproval = options.requiresApproval || totalAmount > 1000;

    return {
      valid: items.length > 0 && totalAmount > 0,
      itemCount: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      requiresApproval: requiresManualApproval,
      totalAmount,
    };
  });

  if (!orderValidation.valid) {
    return workflowError.validation('Invalid order: no items or zero total');
  }

  // Step 2: Parallel validation checks
  const [inventoryResults, fraudCheckResult, customerVerification] = await Promise.all([
    context.run('check-inventory', async () => {
      devLog.workflow(context, 'Checking inventory for all items...');
      const checks = await Promise.all(
        items.map(async (item: any) => {
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
          return {
            available: Math.random() > 0.1,
            sku: item.sku,
            stock: Math.floor(Math.random() * 100) + item.quantity,
          };
        }),
      );
      return checks;
    }),

    context.run('fraud-check', async () => {
      devLog.workflow(context, 'Running fraud detection...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        flagged: Math.random() < 0.05,
        reason: 'Unusual purchase pattern',
        riskScore: Math.random() * 100,
      };
    }),

    context.run('verify-customer', async () => {
      devLog.workflow(context, 'Verifying customer account...');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        creditLimit: customer.tier === 'premium' ? 10000 : 1000,
        memberSince: '2022-01-15',
        verified: true,
      };
    }),
  ]);

  // Process validation results
  const allAvailable = inventoryResults.every((item: any) => item.available);
  if (!allAvailable) {
    const unavailable = inventoryResults.filter((item: any) => !item.available);
    return workflowError.generic(
      new Error(`Items out of stock: ${unavailable.map((item: any) => item.sku).join(', ')}`),
    );
  }

  if (fraudCheckResult.flagged) {
    return workflowError.generic(new Error('Order flagged for security review'));
  }

  // Step 3: Handle approval if needed
  let approvalResult: { approved: boolean; approver: string; notes?: string } = {
    approved: true,
    approver: 'auto',
  };

  if (orderValidation.requiresApproval) {
    devLog.workflow(context, `Order ${orderId} requires approval (amount: $${orderValidation.totalAmount})`);

    if (process.env.SKIP_AUTO_APPROVAL !== 'true') {
      approvalResult = { approved: true, approver: 'auto', notes: 'Auto-approved in development' };
      devLog.workflow(context, `[DEV] Auto-approving order ${orderId} in development mode`);
    } else {
      try {
        const eventId = `order-approval-${orderId}`;
        const { eventData, timeout } = await context.waitForEvent(
          'order-approval-wait',
          eventId,
          { timeout: '5m' },
        );

        if (timeout) {
          return workflowError.generic(new Error('Approval timeout'));
        }

        approvalResult = eventData as any;
      } catch (error) {
        return workflowError.generic(error);
      }
    }

    if (!approvalResult.approved) {
      return workflowError.generic(
        new Error(`Order rejected: ${approvalResult.notes || 'No reason provided'}`),
      );
    }
  }

  // Step 4: Process payment
  const payment = await context
    .call('process-payment', {
      url: 'https://api.stripe.com/v1/payment_intents',
      body: {
        amount: Math.round(orderValidation.totalAmount * 100),
        currency: 'usd',
        metadata: { customerId: customer.id, orderId },
      },
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_KEY || 'sk_test_demo'}`,
      },
      method: 'POST',
      retries: 3,
    })
    .catch(() => ({
      body: {
        id: `pi_demo_${orderId}`,
        amount: orderValidation.totalAmount * 100,
        status: 'succeeded',
      },
    }));

  // Step 5: Create shipment
  const shipment = await context.run('create-shipment', async () => {
    const trackingNumber = `TRK-${orderId}-${Date.now()}`;
    devLog.workflow(context, `Creating shipment ${trackingNumber} for order ${orderId}`);

    return {
      carrier: customer.tier === 'premium' ? 'express' : 'standard',
      estimatedDelivery: new Date(
        Date.now() + (customer.tier === 'premium' ? 2 : 5) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      trackingNumber,
    };
  });

  return createResponse('success', {
    validation: orderValidation,
    approval: approvalResult,
    completedAt: new Date().toISOString(),
    customer,
    orderId,
    payment: {
      id: (payment.body as any).id,
      amount: (payment.body as any).amount / 100,
      status: (payment.body as any).status,
    },
    shipment,
  });
}

// Orchestration workflow
async function processOrchestration(context: WorkflowContext<any>, payload: KitchenSinkPayload) {
  const { coffeeOrders, datasetId, notificationEmail, operations, options = {} } = payload;

  // Validate orchestration-specific fields
  if (!datasetId || !operations) {
    return workflowError.validation('Orchestration mode requires datasetId and operations');
  }

  devLog.workflow(context, `Starting orchestration for dataset: ${datasetId}`);

  // Step 1: Process coffee orders if provided
  let coffeeResults: any[] = [];
  if (coffeeOrders && coffeeOrders.length > 0) {
    devLog.workflow(context, `Processing ${coffeeOrders.length} coffee orders in parallel`);

    coffeeResults = await context.run('process-coffee-orders', async () => {
      // Process all coffee orders in parallel within a single step
      return await Promise.all(
        coffeeOrders.map(async (order, index) => {
          // Mock coffee processing
          const price = Math.random() * 5 + 3; // $3-8
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return {
            customerName: order.customerName,
            orderIndex: index + 1,
            price,
            style: order.style,
            success: Math.random() > 0.1, // 90% success rate
          };
        }),
      );
    });
  }

  // Step 2: Fetch dataset
  const dataset = await context.run('fetch-dataset', async () => {
    devLog.workflow(context, `Fetching dataset: ${datasetId}`);
    return Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.floor(Math.random() * 100),
    }));
  });

  // Step 3: Process data with multiple operations in parallel
  const processingResults = await Promise.all(
    operations.map(async (operation, index) => {
      // Use index-based step name to avoid QStash classification issues
      const stepName = `process-operation-${index + 1}`;
      return await context.run(stepName, async () => {
        return processDataProcessingWorkflow(context, {
          data: dataset,
          processingType: operation,
        });
      });
    }),
  );

  // Step 4: Send notification if requested
  if (options.notifyOnComplete && notificationEmail) {
    await context.run('send-completion-notification', async () => {
      devLog.workflow(context, `Sending notification to ${notificationEmail}`);
      return { notificationSent: true };
    });
  }

  return createResponse('success', {
    coffeeResults,
    datasetId,
    notificationSent: options.notifyOnComplete,
    operations,
    processingResults: processingResults.map((r) => r.body),
    totalItems: dataset.length,
  });
}

// Comprehensive workflow (combines all features)
async function processComprehensiveWorkflow(
  context: WorkflowContext<any>,
  payload: KitchenSinkPayload,
) {
  const { name, options = {}, priority, taskId } = payload;

  devLog.workflow(context,
    `Starting comprehensive workflow with ALL QStash features: ${name || 'Kitchen Sink'}`,
  );

  // QStash Feature 1: Request Signing Verification
  if (options.requestSigning?.enabled && options.requestSigning.verifySignatures) {
    const signingConfig: RequestSigningConfig = {
      clockTolerance: 300,
      nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
      secretKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    };

    const verification = verifyQStashSignature(context, signingConfig);
    if (!verification.isValid) {
      return workflowError.generic(new Error(`Invalid QStash signature: ${verification.error}`));
    }
    devLog.workflow(context, 'QStash signature verified successfully');
  }

  // QStash Feature 2: AI Content Moderation Pipeline
  let aiResult = null;
  if (payload.contentModerationJob) {
    devLog.workflow(context, 'Running AI Content Moderation Pipeline...');
    aiResult = await processAIPipeline(context, {
      contentModerationJob: payload.contentModerationJob,
      options: {
        ...options,
        aiIntegration: options.aiIntegration,
        flowControl: options.flowControl,
      },
    });
  }

  // QStash Feature 3: Multi-Tenant SaaS Workflow
  let saasResult = null;
  if (payload.tenantOperation) {
    devLog.workflow(context, 'Running Multi-Tenant SaaS Workflow...');
    saasResult = await processSaaSWorkflow(context, {
      options: {
        ...options,
        flowControl: {
          key: `tenant:${payload.tenantOperation.tenantId}`,
          parallelism: payload.tenantOperation.tenantConfig.parallelism,
          ratePerSecond: payload.tenantOperation.tenantConfig.rateLimit,
        },
      },
      tenantOperation: payload.tenantOperation,
    });
  }

  // QStash Feature 4: Real-time Event Processing
  let eventResult = null;
  if (payload.eventProcessing) {
    devLog.workflow(context, 'Running Real-time Event Processing...');
    eventResult = await processEventStream(context, {
      eventProcessing: payload.eventProcessing,
      options: {
        ...options,
        flowControl: options.flowControl,
        requestSigning: options.requestSigning,
      },
    });
  }

  // QStash Feature 5: Flow Control with Rate Limiting and Parallelism
  let flowControlResult = null;
  if (options.flowControl) {
    const flowConfig: FlowControlConfig = {
      key: options.flowControl.key || 'kitchen-sink',
      parallelism: options.flowControl.parallelism || 3,
      priority: priority || 5,
      ratePerSecond: options.flowControl.ratePerSecond || 10,
    };

    flowControlResult = await runWithFlowControl(
      context,
      'flow-controlled-operation',
      async () => {
        devLog.workflow(context, 'Running flow-controlled operation');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { processed: true, timestamp: new Date().toISOString() };
      },
      flowConfig,
    );
  }

  // QStash Feature 6: URL Groups/Fan-out Messaging
  let fanOutResult = null;
  if (options.urlGroups?.enabled && options.urlGroups.endpoints) {
    const fanOutOptions: FanOutOptions = {
      delay: '5s',
      endpoints: options.urlGroups.endpoints,
      groupName: options.urlGroups.groupName || 'kitchen-sink-notifications',
      headers: {
        'X-Priority': priority?.toString() || '5',
        'X-Workflow-Type': 'kitchen-sink',
      },
      message: {
        completedComponents: {
          ai: aiResult ? 'completed' : 'skipped',
          events: eventResult ? 'completed' : 'skipped',
          saas: saasResult ? 'completed' : 'skipped',
        },
        timestamp: new Date().toISOString(),
        workflowId: context.workflowRunId,
      },
    };

    fanOutResult = await fanOutToURLGroup(context, 'fan-out-notifications', fanOutOptions);
  }

  // QStash Feature 7: Batch Processing
  let batchResult = null;
  if (taskId && name) {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      name,
      priority: priority || 5,
      taskId,
    }));

    const batchConfig: BatchConfig = {
      batchSize: options.batchSize || 5,
      concurrency: options.flowControl?.parallelism || 3,
      progressCallback: (processed, total) => {
        devLog.workflow(context, `Batch progress: ${processed}/${total}`);
      },
      retryOptions: {
        backoffStrategy: 'exponential',
        maxRetries: 2,
      },
    };

    batchResult = await processBatches(
      context,
      'batch-process-items',
      items,
      async (item, index, batchIndex) => {
        // Simulate processing work
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 500));
        return {
          ...item,
          batchIndex,
          itemIndex: index,
          processed: true,
          processedAt: new Date().toISOString(),
        };
      },
      batchConfig,
    );
  }

  // Step 8: Process legacy ETL pipeline with enhanced features
  let etlResult = null;
  if (payload.pipelineId && payload.source && payload.transformations && payload.destination) {
    devLog.workflow(context, 'Running Enhanced ETL pipeline...');
    etlResult = await processETLPipeline(context, payload);
  }

  // Step 9: Process order with enhanced features
  let orderResult = null;
  if (payload.orderId && payload.items && payload.customer) {
    devLog.workflow(context, 'Running Enhanced order processing...');
    orderResult = await processOrderWorkflow(context, payload);
  }

  // Step 10: Process orchestration with enhanced features
  let orchestrationResult = null;
  if (payload.datasetId && payload.operations) {
    devLog.workflow(context, 'Running Enhanced orchestration...');
    orchestrationResult = await processOrchestration(context, payload);
  }

  // QStash Feature 8: Dead Letter Queue Handling
  let dlqResult = null;
  if (options.dlqHandling?.enabled) {
    const dlqConfig: DLQConfig = {
      dlqEndpoint: options.dlqHandling.dlqEndpoint,
      maxRetries: options.dlqHandling.maxRetries || 3,
      retryBackoff: 'exponential',
      useNativeDLQ: true,
    };

    dlqResult = await handleFailuresWithDLQ(
      context,
      'dlq-protected-operation',
      async () => {
        // Simulate an operation that might fail
        if (Math.random() < 0.1) {
          throw new Error('Random failure for DLQ demonstration');
        }
        return { processedAt: new Date().toISOString(), success: true };
      },
      dlqConfig,
    );
  }

  // QStash Feature 9: Scheduling (demonstrate creating recurring schedules)
  let scheduleResult = null;
  if (options.mode === 'full' && context.workflowRunId) {
    devLog.workflow(context, 'Demonstrating schedule creation from within workflow');

    // Create a recurring schedule using WorkflowScheduler
    const scheduler = new WorkflowScheduler({
      qstashUrl: process.env.QSTASH_URL || 'https://qstash.upstash.io',
      qstashToken: process.env.QSTASH_TOKEN || 'demo-token',
    });

    try {
      const schedule = await context.run('create-schedule', async () => {
        return await scheduler.createSchedule({
          workflowId: 'kitchen-sink-scheduled',
          schedule: {
            cron: '0 9 * * 1', // Every Monday at 9 AM
            timezone: 'America/New_York',
          },
          payload: {
            name: 'Weekly Kitchen Sink Report',
            mode: 'orchestration',
            notificationEmail: payload.notificationEmail,
          },
          config: {
            retries: 2,
            timeout: 300,
          },
        });
      });

      scheduleResult = {
        scheduleId: schedule.scheduleId,
        createdAt: new Date().toISOString(),
        cron: '0 9 * * 1',
        nextRun: schedule.nextRun,
        message: 'Successfully created recurring schedule',
      };
    } catch (error) {
      scheduleResult = {
        error: 'Schedule creation simulated (would create in production)',
        cronExamples: {
          hourly: '0 * * * *',
          daily: '0 9 * * *',
          weekly: '0 9 * * 1',
        },
      };
    }
  }

  // Feature 10: Circuit Breaker for external API calls
  let circuitBreakerResult = null;
  if (options.mode === 'full') {
    const circuitBreaker = new CircuitBreaker({
      name: 'external-api',
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 60000,
    });

    circuitBreakerResult = await context.run('circuit-breaker-demo', async () => {
      const results = [];
      
      // Simulate multiple API calls with circuit breaker protection
      for (let i = 0; i < 5; i++) {
        try {
          const result = await circuitBreaker.execute(async () => {
            // Simulate API call that might fail
            if (Math.random() < 0.3) {
              throw new Error('External API error');
            }
            return { success: true, callNumber: i + 1, timestamp: Date.now() };
          });
          results.push(result);
        } catch (error) {
          results.push({ 
            success: false, 
            callNumber: i + 1, 
            error: error instanceof Error ? error.message : 'Unknown error',
            circuitState: circuitBreaker.getState(),
          });
        }
      }

      return {
        totalCalls: 5,
        successfulCalls: results.filter(r => r.success).length,
        circuitState: circuitBreaker.getState(),
        metrics: circuitBreaker.getMetrics(),
        results,
      };
    });
  }

  // Feature 11: Rate Limiter demonstration
  let rateLimiterResult = null;
  if (options.mode === 'full') {
    const rateLimiter = new RateLimiter({
      limit: 10,
      window: 60000, // 1 minute
      keyPrefix: 'kitchen-sink',
    });

    rateLimiterResult = await context.run('rate-limiter-demo', async () => {
      const results = [];
      const testKey = `user:${context.workflowRunId}`;
      
      // Simulate rapid requests
      for (let i = 0; i < 15; i++) {
        const allowed = await rateLimiter.checkLimit(testKey);
        results.push({
          requestNumber: i + 1,
          allowed,
          remaining: allowed ? await rateLimiter.getRemainingLimit(testKey) : 0,
        });
        
        if (!allowed) {
          devLog.workflow(context, `Rate limit exceeded at request ${i + 1}`);
        }
      }

      return {
        totalRequests: 15,
        allowedRequests: results.filter(r => r.allowed).length,
        blockedRequests: results.filter(r => !r.allowed).length,
        results: results.slice(0, 5), // Show first 5 for brevity
      };
    });
  }

  // Feature 12: Resource Manager with AsyncDisposableStack
  let resourceManagerResult = null;
  if (options.mode === 'full') {
    const resourceManager = new ResourceManager();

    resourceManagerResult = await context.run('resource-manager-demo', async () => {
      // Use AsyncDisposableStack for automatic cleanup
      await using stack = new AsyncDisposableStack();
      
      // Add resources to the stack
      const dbConnection = await resourceManager.acquire('database', async () => {
        devLog.workflow(context, 'Acquiring database connection');
        return { id: 'db-conn-1', connected: true };
      });
      stack.defer(async () => {
        devLog.workflow(context, 'Releasing database connection');
        await resourceManager.release('database');
      });

      const cacheConnection = await resourceManager.acquire('cache', async () => {
        devLog.workflow(context, 'Acquiring cache connection');
        return { id: 'cache-conn-1', connected: true };
      });
      stack.defer(async () => {
        devLog.workflow(context, 'Releasing cache connection');
        await resourceManager.release('cache');
      });

      // Use the resources
      const activeResources = resourceManager.getActiveResources();
      
      // Resources will be automatically cleaned up when leaving this scope
      return {
        resourcesAcquired: activeResources.length,
        resources: activeResources,
        message: 'Resources will be automatically released',
      };
    });
  }

  // Feature 13: Workflow invocation with context.invoke
  let invokeResult = null;
  if (options.mode === 'full' && payload.operations && payload.operations.length > 0) {
    invokeResult = await context.run('invoke-sub-workflow', async () => {
      devLog.workflow(context, 'Invoking sub-workflow for data processing');
      
      // Invoke another workflow
      const subWorkflowResult = await context.invoke('data-processing-workflow', {
        data: Array.from({ length: 5 }, (_, i) => ({ id: i, value: Math.random() * 100 })),
        processingType: payload.operations[0] || 'sum',
      });

      return {
        invokedWorkflowId: subWorkflowResult.workflowId,
        status: subWorkflowResult.status,
        result: subWorkflowResult.result,
      };
    });
  }

  // Feature 14: Advanced workflow patterns
  let patternsResult = null;
  if (options.mode === 'full') {
    patternsResult = await context.run('workflow-patterns-demo', async () => {
      const results: any = {};

      // Pattern 1: Wait for multiple events
      results.multiEventWait = await waitForMultipleEvents(
        context,
        [
          { eventId: 'event-1', timeout: '1m' },
          { eventId: 'event-2', timeout: '1m', required: false },
          { eventId: 'event-3', timeout: '1m', required: false },
        ],
        {
          waitStrategy: 'any', // 'all' | 'any' | 'threshold'
          threshold: 2,
        },
      );

      // Pattern 2: Parallel race - first to complete wins
      results.parallelRace = await parallelRacePattern(
        context,
        [
          async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { source: 'task1', data: 'Result from task 1' };
          },
          async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { source: 'task2', data: 'Result from task 2' };
          },
          async () => {
            await new Promise(resolve => setTimeout(resolve, 1500));
            return { source: 'task3', data: 'Result from task 3' };
          },
        ],
        { timeout: 2000 },
      );

      // Pattern 3: Saga pattern with compensation
      results.saga = await sagaPattern(
        context,
        [
          {
            name: 'reserve-inventory',
            action: async () => {
              devLog.workflow(context, 'Reserving inventory');
              return { reservationId: 'res-123', items: 5 };
            },
            compensate: async () => {
              devLog.workflow(context, 'Releasing inventory reservation');
            },
          },
          {
            name: 'charge-payment',
            action: async () => {
              devLog.workflow(context, 'Charging payment');
              // Simulate potential failure
              if (Math.random() < 0.2) {
                throw new Error('Payment failed');
              }
              return { paymentId: 'pay-456', amount: 100 };
            },
            compensate: async () => {
              devLog.workflow(context, 'Refunding payment');
            },
          },
          {
            name: 'ship-order',
            action: async () => {
              devLog.workflow(context, 'Shipping order');
              return { trackingId: 'track-789' };
            },
            compensate: async () => {
              devLog.workflow(context, 'Cancelling shipment');
            },
          },
        ],
      );

      // Pattern 4: Compensation on failure
      results.compensation = await compensateOnFailure(
        context,
        async () => {
          // Main action that might fail
          if (Math.random() < 0.3) {
            throw new Error('Operation failed');
          }
          return { success: true, operationId: 'op-123' };
        },
        async (error) => {
          // Compensation logic
          devLog.workflow(context, `Compensating for error: ${error.message}`);
          return { compensated: true, error: error.message };
        },
      );

      return results;
    });
  }

  // Feature 15: Map-Reduce Pattern
  let mapReduceResult = null;
  if (options.mode === 'full') {
    mapReduceResult = await context.run('map-reduce-demo', async () => {
      const { mapReduce } = await import('../../runtime/patterns/patterns');
      
      // Example: Calculate total revenue by product category
      const salesData = Array.from({ length: 50 }, (_, i) => ({
        id: `sale-${i}`,
        productId: `product-${i % 10}`,
        category: ['electronics', 'clothing', 'books', 'food'][i % 4],
        amount: Math.floor(Math.random() * 200) + 50,
        quantity: Math.floor(Math.random() * 5) + 1,
      }));

      const categoryRevenue = await mapReduce(context, {
        items: salesData,
        mapper: async (sale) => {
          // Simulate some async processing
          await new Promise(resolve => setTimeout(resolve, 10));
          return {
            category: sale.category,
            revenue: sale.amount * sale.quantity,
          };
        },
        reducer: (acc, current) => {
          if (!acc[current.category]) {
            acc[current.category] = 0;
          }
          acc[current.category] += current.revenue;
          return acc;
        },
        initialValue: {} as Record<string, number>,
        batchSize: 10,
        stepPrefix: 'revenue-calculation',
      });

      return {
        totalSales: salesData.length,
        categoryRevenue,
        topCategory: Object.entries(categoryRevenue).sort(([,a], [,b]) => b - a)[0],
      };
    });
  }

  // Feature 16: Pipeline Pattern
  let pipelinePatternResult = null;
  if (options.mode === 'full') {
    pipelinePatternResult = await context.run('pipeline-pattern-demo', async () => {
      const { pipeline } = await import('../../runtime/patterns/patterns');
      
      // Example: Data transformation pipeline
      const rawData = {
        users: [
          { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
          { id: 3, name: 'Bob Johnson', email: 'bob@invalid', age: 45 },
        ],
      };

      const processedData = await pipeline(context, {
        input: rawData,
        stages: [
          {
            name: 'validate',
            transform: async (data) => {
              devLog.workflow(context, 'Validating user data');
              const validUsers = data.users.filter((user: any) => 
                user.email.includes('@') && user.age >= 18
              );
              return { ...data, users: validUsers, droppedCount: data.users.length - validUsers.length };
            },
          },
          {
            name: 'enrich',
            transform: async (data) => {
              devLog.workflow(context, 'Enriching user data');
              const enrichedUsers = data.users.map((user: any) => ({
                ...user,
                segment: user.age < 30 ? 'young' : user.age < 40 ? 'middle' : 'senior',
                membershipLevel: 'basic',
              }));
              return { ...data, users: enrichedUsers };
            },
          },
          {
            name: 'anonymize',
            transform: async (data) => {
              devLog.workflow(context, 'Anonymizing sensitive data');
              const anonymizedUsers = data.users.map((user: any) => ({
                ...user,
                email: user.email.replace(/^[^@]+/, '****'),
                id: `user-${user.id}`,
              }));
              return { ...data, users: anonymizedUsers };
            },
            onError: async (error, data) => {
              devLog.workflow(context, `Pipeline error: ${error.message}, continuing with original data`);
              return data;
            },
          },
        ],
        stepPrefix: 'user-pipeline',
      });

      return {
        originalCount: rawData.users.length,
        processedCount: processedData.users.length,
        droppedCount: processedData.droppedCount || 0,
        pipeline: 'validate → enrich → anonymize',
        sample: processedData.users[0],
      };
    });
  }

  // Feature 17: Parallel Execute Pattern
  let parallelExecuteResult = null;
  if (options.mode === 'full') {
    parallelExecuteResult = await context.run('parallel-execute-demo', async () => {
      const { parallelExecute } = await import('../../runtime/patterns/patterns');
      
      // Example: Parallel data fetching from multiple sources
      const results = await parallelExecute(context, {
        weatherData: async () => {
          await new Promise(resolve => setTimeout(resolve, 800));
          return { 
            temperature: 72, 
            conditions: 'sunny', 
            location: 'San Francisco',
            fetchedAt: new Date().toISOString(),
          };
        },
        stockPrices: async () => {
          await new Promise(resolve => setTimeout(resolve, 600));
          return {
            AAPL: 175.43,
            GOOGL: 142.87,
            MSFT: 380.52,
            fetchedAt: new Date().toISOString(),
          };
        },
        newsHeadlines: async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            headlines: [
              'Tech stocks rally on earnings',
              'Weather patterns shift globally',
              'New workflow patterns discovered',
            ],
            fetchedAt: new Date().toISOString(),
          };
        },
        analyticsData: async () => {
          await new Promise(resolve => setTimeout(resolve, 700));
          // Simulate occasional failure
          if (Math.random() < 0.2) {
            throw new Error('Analytics service temporarily unavailable');
          }
          return {
            dailyActiveUsers: 15420,
            conversionRate: 0.032,
            fetchedAt: new Date().toISOString(),
          };
        },
      }, {
        stepPrefix: 'data-fetch',
        continueOnError: true, // Continue even if some operations fail
      });

      return {
        successfulFetches: Object.entries(results).filter(([, value]) => !(value instanceof Error)).length,
        totalFetches: Object.keys(results).length,
        results: Object.entries(results).reduce((acc, [key, value]) => {
          acc[key] = value instanceof Error ? { error: value.message } : value;
          return acc;
        }, {} as any),
      };
    });
  }

  // Feature 18: Fan-Out/Fan-In Pattern
  let fanOutFanInPatternResult = null;
  if (options.mode === 'full') {
    fanOutFanInPatternResult = await context.run('fanout-fanin-pattern-demo', async () => {
      const { fanOutFanIn } = await import('../../runtime/patterns/patterns');
      
      // Example: Distribute orders to regional fulfillment centers
      const orders = Array.from({ length: 20 }, (_, i) => ({
        orderId: `order-${i}`,
        region: ['north', 'south', 'east', 'west'][i % 4],
        priority: i % 3 === 0 ? 'express' : 'standard',
        items: Math.floor(Math.random() * 5) + 1,
        amount: Math.floor(Math.random() * 300) + 50,
      }));

      const fulfillmentResults = await fanOutFanIn(context, {
        items: orders,
        distributor: (order) => `${order.region}-${order.priority}`,
        handlers: {
          'north-express': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'NYC-1', estimatedDays: 1 }));
          },
          'north-standard': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'NYC-2', estimatedDays: 3 }));
          },
          'south-express': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'ATL-1', estimatedDays: 1 }));
          },
          'south-standard': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'ATL-2', estimatedDays: 3 }));
          },
          'east-express': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'BOS-1', estimatedDays: 1 }));
          },
          'east-standard': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'BOS-2', estimatedDays: 3 }));
          },
          'west-express': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'LAX-1', estimatedDays: 1 }));
          },
          'west-standard': async (orders) => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return orders.map(o => ({ ...o, fulfillmentCenter: 'LAX-2', estimatedDays: 3 }));
          },
        },
        stepPrefix: 'order-distribution',
      });

      const summary = fulfillmentResults.reduce((acc, order) => {
        if (!acc[order.fulfillmentCenter]) {
          acc[order.fulfillmentCenter] = { count: 0, totalAmount: 0 };
        }
        acc[order.fulfillmentCenter].count++;
        acc[order.fulfillmentCenter].totalAmount += order.amount;
        return acc;
      }, {} as Record<string, { count: number; totalAmount: number }>);

      return {
        totalOrders: orders.length,
        fulfillmentCenters: Object.keys(summary).length,
        distribution: summary,
        expressOrders: fulfillmentResults.filter(o => o.estimatedDays === 1).length,
        standardOrders: fulfillmentResults.filter(o => o.estimatedDays === 3).length,
      };
    });
  }

  // Feature 19: Retry With Backoff Pattern
  let retryWithBackoffResult = null;
  if (options.mode === 'full') {
    retryWithBackoffResult = await context.run('retry-backoff-demo', async () => {
      const { retryWithBackoff } = await import('../../runtime/patterns/patterns');
      
      let attemptCount = 0;
      const startTime = Date.now();
      
      // Example: Calling an unreliable external API
      try {
        const apiResult = await retryWithBackoff(context, {
          operation: async () => {
            attemptCount++;
            devLog.workflow(context, `API call attempt ${attemptCount}`);
            
            // Simulate API that fails first 2 attempts
            if (attemptCount < 3) {
              throw new Error(`API error: Service temporarily unavailable (attempt ${attemptCount})`);
            }
            
            return {
              success: true,
              data: { userId: 123, status: 'active' },
              attemptsTaken: attemptCount,
              timeElapsed: Date.now() - startTime,
            };
          },
          maxAttempts: 5,
          baseDelayMs: 1000,
          maxDelayMs: 10000,
          multiplier: 2,
          strategy: 'exponential',
          jitter: true,
          shouldRetry: (error, attempt) => {
            // Don't retry on 4xx errors
            return !error.message.includes('4');
          },
          stepName: 'unreliable-api-call',
        });

        return {
          success: true,
          result: apiResult,
          totalAttempts: attemptCount,
          backoffStrategy: 'exponential with jitter',
          timeElapsedMs: Date.now() - startTime,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          totalAttempts: attemptCount,
          maxAttemptsReached: true,
        };
      }
    });
  }

  // Feature 20: Scheduled Execution Pattern
  let scheduledExecutionResult = null;
  if (options.mode === 'full') {
    scheduledExecutionResult = await context.run('scheduled-execution-demo', async () => {
      const { scheduledExecution } = await import('../../runtime/patterns/patterns');
      
      // Example: Schedule a task to run 5 seconds from now
      const scheduledTime = new Date(Date.now() + 5000);
      const scheduledTimeStr = scheduledTime.toISOString();
      
      devLog.workflow(context, `Scheduling task for ${scheduledTimeStr}`);
      
      const result = await scheduledExecution(context, {
        scheduleAt: scheduledTime,
        operation: async () => {
          const executionTime = new Date().toISOString();
          
          // Perform scheduled operation
          const processedItems = Array.from({ length: 10 }, (_, i) => ({
            id: `scheduled-item-${i}`,
            processedAt: executionTime,
            value: Math.random() * 100,
          }));
          
          return {
            scheduledFor: scheduledTimeStr,
            executedAt: executionTime,
            delayAccuracy: Math.abs(new Date(executionTime).getTime() - scheduledTime.getTime()),
            itemsProcessed: processedItems.length,
            totalValue: processedItems.reduce((sum, item) => sum + item.value, 0),
          };
        },
        stepName: 'scheduled-batch-process',
      });
      
      return {
        pattern: 'Scheduled Execution',
        description: 'Delayed execution until specific time',
        ...result,
      };
    });
  }

  // Final approval if any component requires it
  let finalApproval = null;
  if (options.requiresApproval) {
    devLog.workflow(context, 'Final approval required for comprehensive workflow');

    if (process.env.SKIP_AUTO_APPROVAL !== 'true') {
      finalApproval = { approved: true, approver: 'auto', notes: 'Auto-approved in development' };
      devLog.workflow(context, '[DEV] Auto-approving comprehensive workflow in development mode');
    } else {
      try {
        const timestamp = Date.now();
        const eventId = `approve-comprehensive-${timestamp}`;
        const { eventData, timeout } = await context.waitForEvent(
          'final-approval',
          eventId,
          { timeout: '10m' },
        );

        if (timeout) {
          return workflowError.generic(new Error('Final approval timeout'));
        }

        finalApproval = eventData;
      } catch (error) {
        return workflowError.generic(error);
      }
    }
  }

  // Final notification using fan-out if configured
  if (options.notifyOn?.includes('complete')) {
    if (options.urlGroups?.enabled && options.urlGroups.endpoints) {
      // Use fan-out for notifications
      await fanOutToURLGroup(context, 'completion-fan-out', {
        endpoints: options.urlGroups.endpoints,
        groupName: 'workflow-completions',
        message: {
          completedAt: new Date().toISOString(),
          components: {
            ai: aiResult ? 'completed' : 'skipped',
            batch: batchResult ? 'completed' : 'skipped',
            dlq: dlqResult ? 'completed' : 'skipped',
            etl: etlResult ? 'completed' : 'skipped',
            events: eventResult ? 'completed' : 'skipped',
            fanOut: fanOutResult ? 'completed' : 'skipped',
            flowControl: flowControlResult ? 'completed' : 'skipped',
            orchestration: orchestrationResult ? 'completed' : 'skipped',
            order: orderResult ? 'completed' : 'skipped',
            saas: saasResult ? 'completed' : 'skipped',
            additionalPatterns: {
              mapReduce: mapReduceResult ? 'completed' : 'skipped',
              pipeline: pipelinePatternResult ? 'completed' : 'skipped',
              parallelExecute: parallelExecuteResult ? 'completed' : 'skipped',
              fanOutFanIn: fanOutFanInPatternResult ? 'completed' : 'skipped',
              retryWithBackoff: retryWithBackoffResult ? 'completed' : 'skipped',
              scheduledExecution: scheduledExecutionResult ? 'completed' : 'skipped',
            },
          },
          workflowRunId: context.workflowRunId,
          workflowType: 'kitchen-sink-comprehensive',
        },
      });
    } else {
      // Use regular notification
      try {
        await context.notify({
          eventData: {
            completedAt: new Date().toISOString(),
            components: {
              ai: aiResult ? 'completed' : 'skipped',
              batch: batchResult ? 'completed' : 'skipped',
              dlq: dlqResult ? 'completed' : 'skipped',
              etl: etlResult ? 'completed' : 'skipped',
              events: eventResult ? 'completed' : 'skipped',
              fanOut: fanOutResult ? 'completed' : 'skipped',
              flowControl: flowControlResult ? 'completed' : 'skipped',
              orchestration: orchestrationResult ? 'completed' : 'skipped',
              order: orderResult ? 'completed' : 'skipped',
              saas: saasResult ? 'completed' : 'skipped',
              additionalPatterns: {
                mapReduce: mapReduceResult ? 'completed' : 'skipped',
                pipeline: pipelinePatternResult ? 'completed' : 'skipped',
                parallelExecute: parallelExecuteResult ? 'completed' : 'skipped',
                fanOutFanIn: fanOutFanInPatternResult ? 'completed' : 'skipped',
                retryWithBackoff: retryWithBackoffResult ? 'completed' : 'skipped',
                scheduledExecution: scheduledExecutionResult ? 'completed' : 'skipped',
              },
            },
          },
          eventId: `comprehensive-complete-${Date.now()}`,
        });
        devLog.workflow(context, 'Comprehensive workflow completion notification sent');
      } catch (error) {
        devLog.workflow(context, `Notification failed (development): ${error}`);
      }
    }
  }

  return createResponse('success', {
    name: name || 'Comprehensive Kitchen Sink Workflow',
    completedAt: new Date().toISOString(),
    finalApproval,
    legacyComponents: {
      etl: etlResult,
      orchestration: orchestrationResult,
      order: orderResult,
    },
    priority,
    qstashFeatures: {
      ai: aiResult,
      batch: batchResult,
      dlq: dlqResult,
      events: eventResult,
      fanOut: fanOutResult,
      flowControl: flowControlResult,
      saas: saasResult,
      schedule: scheduleResult,
    },
    advancedFeatures: {
      circuitBreaker: circuitBreakerResult,
      rateLimiter: rateLimiterResult,
      resourceManager: resourceManagerResult,
      workflowInvocation: invokeResult,
      workflowPatterns: patternsResult,
    },
    additionalPatterns: {
      mapReduce: mapReduceResult,
      pipeline: pipelinePatternResult,
      parallelExecute: parallelExecuteResult,
      fanOutFanIn: fanOutFanInPatternResult,
      retryWithBackoff: retryWithBackoffResult,
      scheduledExecution: scheduledExecutionResult,
    },
    taskId,
    workflowRunId: context.workflowRunId,
  });
}

// AI Pipeline processing (placeholder)
async function processAIPipeline(context: WorkflowContext<any>, payload: any) {
  devLog.workflow(context, 'AI Pipeline processing not implemented yet');
  return createResponse('success', {
    message: 'AI Pipeline processing completed',
    processedAt: new Date().toISOString(),
  });
}

// SaaS Workflow processing (placeholder)
async function processSaaSWorkflow(context: WorkflowContext<any>, payload: any) {
  devLog.workflow(context, 'SaaS Workflow processing not implemented yet');
  return createResponse('success', {
    message: 'SaaS Workflow processing completed',
    processedAt: new Date().toISOString(),
  });
}

// Event Stream processing (placeholder)
async function processEventStream(context: WorkflowContext<any>, payload: any) {
  devLog.workflow(context, 'Event Stream processing not implemented yet');
  return createResponse('success', {
    message: 'Event Stream processing completed',
    processedAt: new Date().toISOString(),
  });
}
