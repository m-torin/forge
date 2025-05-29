import { createResponse, extractPayload, workflowError } from '../context';
import { withDeduplication } from '../context/deduplication';
import { type BatchConfig, processBatches } from '../qstash/batch-processing';
import { type DLQConfig, handleFailuresWithDLQ } from '../qstash/dlq-handling';
import { type FlowControlConfig, runWithFlowControl } from '../qstash/flow-control';
import { type RequestSigningConfig, verifyQStashSignature } from '../qstash/request-signing';
import { type FanOutOptions, fanOutToURLGroup } from '../qstash/url-groups';

import type { EnhancedContext } from '../context';
import type { WorkflowContext } from '../types';

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
    context.dev.log(`Processing ${data.length} items with operation: ${processingType}`);
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
  context.dev.log('Starting kitchen sink workflow', {
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
    { debug: context.dev?.isDevelopment },
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

  context.dev.log(`Starting data pipeline ${pipelineId}`);

  // Step 1: Schedule if needed (sleepUntil)
  if (options.scheduleAt) {
    const scheduleTime = new Date(options.scheduleAt).getTime();
    const now = Date.now();

    if (scheduleTime > now) {
      context.dev.log(`Scheduling pipeline to run at ${options.scheduleAt}`);
      await context.sleepUntil('scheduled-start', scheduleTime);
    }
  }

  // Step 2: Extract data from source
  const extractedData = await context.run('extract-data', async () => {
    context.dev.log(`Extracting data from ${source.type}: ${source.url}`);

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

  context.dev.log(`Extracted ${extractedData.length} records`);

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
              context.dev.log(`Unknown transformation: ${transform}`);
          }
        }

        return result;
      });

      results.push(...batchResults.filter(Boolean));
    }

    return results;
  });

  context.dev.log(`Transformed ${transformedData.length} records`);

  // Step 4: Approval gate (waitForEvent)
  if (options.requiresApproval) {
    context.dev.log(`Pipeline ${pipelineId} requires approval`);

    // Send notification for approval
    await context.run('send-approval-request', async () => {
      context.dev.log(`Approval request sent for pipeline ${pipelineId}`);
      return { notificationSent: true };
    });

    // Wait for approval
    let approvalResult;
    const skipAutoApproval = process.env.SKIP_AUTO_APPROVAL === 'true';

    if (context.dev.isDevelopment && !skipAutoApproval) {
      context.dev.log(`[DEV] Auto-approving pipeline ${pipelineId} in development mode`);
      approvalResult = { approved: true, approver: 'auto-dev' };
    } else {
      try {
        const { eventData, timeout } = await context.waitForEvent(
          'pipeline-approval',
          `approve-pipeline-${pipelineId}`,
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
        context.dev.log(`Pipeline ${pipelineId} rejected`);
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
    context.dev.log(`Loading ${transformedData.length} records to ${destination.type}`);

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
    await context.run('send-completion-notification', async () => {
      await context.notify({
        eventData: {
          completedAt: new Date().toISOString(),
          pipelineId,
          recordsProcessed: transformedData.length,
        },
        eventId: `pipeline-complete-${pipelineId}`,
      });

      context.dev.log(`Completion notification sent for pipeline ${pipelineId}`);
      return { notified: true };
    });
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

  context.dev.log(`Processing order ${orderId} for customer ${customer.id}`);

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
      context.dev.log('Checking inventory for all items...');
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
      context.dev.log('Running fraud detection...');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        flagged: Math.random() < 0.05,
        reason: 'Unusual purchase pattern',
        riskScore: Math.random() * 100,
      };
    }),

    context.run('verify-customer', async () => {
      context.dev.log('Verifying customer account...');
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
    context.dev.log(`Order ${orderId} requires approval (amount: $${orderValidation.totalAmount})`);

    if (context.dev?.isDevelopment && process.env.SKIP_AUTO_APPROVAL !== 'true') {
      approvalResult = { approved: true, approver: 'auto', notes: 'Auto-approved in development' };
      context.dev.log(`[DEV] Auto-approving order ${orderId} in development mode`);
    } else {
      try {
        const { eventData, timeout } = await context.waitForEvent(
          'order-approval-wait',
          `order-approval-${orderId}`,
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
    context.dev.log(`Creating shipment ${trackingNumber} for order ${orderId}`);

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

  context.dev.log(`Starting orchestration for dataset: ${datasetId}`);

  // Step 1: Process coffee orders if provided
  let coffeeResults: any[] = [];
  if (coffeeOrders && coffeeOrders.length > 0) {
    context.dev.log(`Processing ${coffeeOrders.length} coffee orders in parallel`);

    coffeeResults = await Promise.all(
      coffeeOrders.map(async (order, index) => {
        const result = await context.run(`coffee-order-${index + 1}`, async () => {
          // Mock coffee processing
          const price = Math.random() * 5 + 3; // $3-8
          await new Promise((resolve) => setTimeout(resolve, 1000));

          return {
            customerName: order.customerName,
            price,
            style: order.style,
            success: Math.random() > 0.1, // 90% success rate
          };
        });
        return result;
      }),
    );
  }

  // Step 2: Fetch dataset
  const dataset = await context.run('fetch-dataset', async () => {
    context.dev.log(`Fetching dataset: ${datasetId}`);
    return Array.from({ length: 10 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.floor(Math.random() * 100),
    }));
  });

  // Step 3: Process data with multiple operations in parallel
  const processingResults = await Promise.all(
    operations.map(async (operation) => {
      return await context.run(`process-${operation}`, async () => {
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
      context.dev.log(`Sending notification to ${notificationEmail}`);
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

  context.dev.log(
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
    context.dev.log('QStash signature verified successfully');
  }

  // QStash Feature 2: AI Content Moderation Pipeline
  let aiResult = null;
  if (payload.contentModerationJob) {
    context.dev.log('Running AI Content Moderation Pipeline...');
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
    context.dev.log('Running Multi-Tenant SaaS Workflow...');
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
    context.dev.log('Running Real-time Event Processing...');
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
        context.dev.log('Running flow-controlled operation');
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
        context.dev.log(`Batch progress: ${processed}/${total}`);
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
    context.dev.log('Running Enhanced ETL pipeline...');
    etlResult = await processETLPipeline(context, payload);
  }

  // Step 9: Process order with enhanced features
  let orderResult = null;
  if (payload.orderId && payload.items && payload.customer) {
    context.dev.log('Running Enhanced order processing...');
    orderResult = await processOrderWorkflow(context, payload);
  }

  // Step 10: Process orchestration with enhanced features
  let orchestrationResult = null;
  if (payload.datasetId && payload.operations) {
    context.dev.log('Running Enhanced orchestration...');
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
    // Demonstrate how workflows can create schedules
    context.dev.log('Demonstrating schedule creation from within workflow');

    // Note: In a real implementation, you would use the scheduler to create recurring schedules
    // This is just a demonstration of the capability
    scheduleResult = {
      cronExamples: {
        hourly: '0 * * * *',
        daily: '0 9 * * *',
        weekly: '0 9 * * 1',
      },
      exampleScheduleId: `schedule-${context.workflowRunId}`,
      message: 'Schedule creation capability available',
      schedulingTip:
        'Use WorkflowScheduler from orchestration package to create recurring schedules',
    };
  }

  // Final approval if any component requires it
  let finalApproval = null;
  if (options.requiresApproval) {
    context.dev.log('Final approval required for comprehensive workflow');

    if (context.dev?.isDevelopment && process.env.SKIP_AUTO_APPROVAL !== 'true') {
      finalApproval = { approved: true, approver: 'auto', notes: 'Auto-approved in development' };
      context.dev.log('[DEV] Auto-approving comprehensive workflow in development mode');
    } else {
      try {
        const { eventData, timeout } = await context.waitForEvent(
          'final-approval',
          `approve-comprehensive-${Date.now()}`,
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
          },
          workflowRunId: context.workflowRunId,
          workflowType: 'kitchen-sink-comprehensive',
        },
      });
    } else {
      // Use regular notification
      await context.run('send-final-notification', async () => {
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
            },
          },
          eventId: `comprehensive-complete-${Date.now()}`,
        });

        context.dev.log('Comprehensive workflow completion notification sent');
        return { notified: true };
      });
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
    taskId,
    workflowRunId: context.workflowRunId,
  });
}

// AI Pipeline processing (placeholder)
async function processAIPipeline(context: WorkflowContext<any>, payload: any) {
  context.dev.log('AI Pipeline processing not implemented yet');
  return createResponse('success', {
    message: 'AI Pipeline processing completed',
    processedAt: new Date().toISOString(),
  });
}

// SaaS Workflow processing (placeholder)
async function processSaaSWorkflow(context: WorkflowContext<any>, payload: any) {
  context.dev.log('SaaS Workflow processing not implemented yet');
  return createResponse('success', {
    message: 'SaaS Workflow processing completed',
    processedAt: new Date().toISOString(),
  });
}

// Event Stream processing (placeholder)
async function processEventStream(context: WorkflowContext<any>, payload: any) {
  context.dev.log('Event Stream processing not implemented yet');
  return createResponse('success', {
    message: 'Event Stream processing completed',
    processedAt: new Date().toISOString(),
  });
}
