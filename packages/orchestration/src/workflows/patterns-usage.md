# Workflow Patterns Usage Guide

This guide demonstrates how to use the reusable workflow patterns and composition utilities from the
`@repo/orchestration` package.

## Table of Contents

1. [Basic Patterns](#basic-patterns)
2. [Composition Utilities](#composition-utilities)
3. [Real-World Examples](#real-world-examples)
4. [Best Practices](#best-practices)

## Basic Patterns

### Batch Processing Pattern

Process large datasets in manageable chunks with optional delays between batches.

```typescript
import { serve } from '@upstash/workflow/nextjs';
import { processBatch } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const items = await fetchLargeDataset(); // e.g., 10,000 items

  const results = await processBatch(context, {
    items,
    batchSize: 100,
    delayBetweenBatches: 2, // 2 seconds between batches
    processor: async (item, index) => {
      // Process individual item
      return await processItem(item);
    },
    onBatchComplete: async (batchNumber, results) => {
      console.log(`Batch ${batchNumber} completed with ${results.length} items`);
    },
    stepPrefix: 'process-items',
  });

  return { processed: results.length };
});
```

### Parallel Execution Pattern

Execute multiple independent operations simultaneously.

```typescript
import { parallelExecute } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const results = await parallelExecute(
    context,
    {
      inventoryCheck: async () => {
        return await checkInventory();
      },
      fraudDetection: async () => {
        return await detectFraud();
      },
      customerVerification: async () => {
        return await verifyCustomer();
      },
    },
    {
      stepPrefix: 'order-checks',
      continueOnError: false, // Fail if any check fails
    }
  );

  return results; // { inventoryCheck: ..., fraudDetection: ..., customerVerification: ... }
});
```

### Retry with Backoff Pattern

Retry failed operations with exponential backoff.

```typescript
import { retryWithBackoff } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const result = await retryWithBackoff(context, {
    operation: async () => {
      // Call external API that might fail
      return await callUnreliableAPI();
    },
    maxAttempts: 5,
    initialDelay: 1, // Start with 1 second
    maxDelay: 30, // Cap at 30 seconds
    backoffMultiplier: 2, // Double delay each time
    shouldRetry: (error, attempt) => {
      // Don't retry on 4xx errors
      return !error.message.includes('400');
    },
    stepName: 'api-call',
  });

  return result;
});
```

### Approval Gate Pattern

Implement workflows that require human approval.

```typescript
import { approvalGate } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const { orderId, totalAmount } = context.requestPayload;

  if (totalAmount > 1000) {
    const approval = await approvalGate(context, {
      approvalId: `order-approval-${orderId}`,
      notificationData: {
        orderId,
        totalAmount,
        items: orderItems,
      },
      timeout: '30m',
      onApproved: async (data) => {
        console.log(`Order approved by ${data.approver}`);
      },
      onRejected: async (data) => {
        console.log(`Order rejected: ${data.reason}`);
      },
    });
  }

  // Continue with order processing...
});
```

### Map-Reduce Pattern

Process and aggregate large datasets efficiently.

```typescript
import { mapReduce } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const salesData = await fetchSalesData();

  const totalsByCategory = await mapReduce(context, {
    items: salesData,
    mapper: async (sale) => {
      // Transform each sale
      return {
        category: sale.category,
        amount: sale.amount * (1 + sale.tax),
      };
    },
    reducer: (totals, sale) => {
      // Aggregate by category
      totals[sale.category] = (totals[sale.category] || 0) + sale.amount;
      return totals;
    },
    initialValue: {} as Record<string, number>,
    batchSize: 50,
  });

  return totalsByCategory;
});
```

### Pipeline Pattern

Chain operations together with error handling.

```typescript
import { pipeline } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const result = await pipeline(context, {
    input: rawData,
    stages: [
      {
        name: 'validate',
        transform: async (data) => {
          if (!isValid(data)) throw new Error('Invalid data');
          return data;
        },
      },
      {
        name: 'enrich',
        transform: async (data) => {
          return await enrichWithMetadata(data);
        },
        onError: async (error, data) => {
          console.error('Enrichment failed, using defaults');
          return { ...data, metadata: getDefaultMetadata() };
        },
      },
      {
        name: 'transform',
        transform: async (data) => {
          return transformToOutputFormat(data);
        },
      },
    ],
  });

  return result;
});
```

### Fan-Out/Fan-In Pattern

Distribute work across multiple handlers based on criteria.

```typescript
import { fanOutFanIn } from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const orders = await fetchPendingOrders();

  const results = await fanOutFanIn(context, {
    items: orders,
    distributor: (order) => {
      // Route based on order type
      if (order.type === 'digital') return 'digital-handler';
      if (order.type === 'physical') return 'physical-handler';
      return 'default-handler';
    },
    handlers: {
      'digital-handler': async (orders) => {
        return await processDigitalOrders(orders);
      },
      'physical-handler': async (orders) => {
        return await processPhysicalOrders(orders);
      },
      'default-handler': async (orders) => {
        return await processStandardOrders(orders);
      },
    },
  });

  return results;
});
```

## Composition Utilities

### Data Processing Workflow

Create ETL workflows with built-in patterns.

```typescript
import { createDataProcessingWorkflow } from '@repo/orchestration/workflows';

export const { POST } = createDataProcessingWorkflow({
  extract: async (context) => {
    // Extract data from source
    return await fetchFromDatabase();
  },
  transform: [
    {
      name: 'validate',
      operation: async (data) => data.filter(isValid),
      parallel: true,
    },
    {
      name: 'enrich',
      operation: async (data) => enrichData(data),
      parallel: true,
    },
    {
      name: 'aggregate',
      operation: async (data) => aggregateByCategory(data),
      parallel: false, // Sequential
    },
  ],
  validate: async (data) => {
    const errors = [];
    if (data.length === 0) errors.push('No data');
    return { valid: errors.length === 0, errors };
  },
  requiresApproval: (data) => data.length > 10000,
  load: async (context, data) => {
    return await saveToWarehouse(data);
  },
  batchSize: 500,
});
```

### Event-Driven Workflow

Build state machines with event handling.

```typescript
import { createEventDrivenWorkflow } from '@repo/orchestration/workflows';

export const { POST } = createEventDrivenWorkflow({
  initialState: {
    status: 'pending',
    items: [],
    total: 0,
  },
  events: {
    'order-created': {
      handler: async (context, state, eventData) => {
        return {
          ...state,
          status: 'processing',
          items: eventData.items,
          total: eventData.total,
        };
      },
      nextEvent: 'payment-processed',
      timeout: '10m',
    },
    'payment-processed': {
      handler: async (context, state, eventData) => {
        return {
          ...state,
          status: 'paid',
          paymentId: eventData.paymentId,
        };
      },
      nextEvent: 'order-shipped',
    },
    'order-shipped': {
      handler: async (context, state, eventData) => {
        return {
          ...state,
          status: 'shipped',
          trackingNumber: eventData.trackingNumber,
        };
      },
    },
  },
  finalizer: async (context, state) => {
    await notifyCustomer(state);
    return state;
  },
});
```

### Saga Pattern Workflow

Implement distributed transactions with compensations.

```typescript
import { createSagaWorkflow } from '@repo/orchestration/workflows';

export const { POST } = createSagaWorkflow({
  steps: [
    {
      name: 'reserve-inventory',
      execute: async (context, data) => {
        const reservation = await reserveInventory(data.items);
        return { ...data, reservationId: reservation.id };
      },
      compensate: async (context, data) => {
        await cancelReservation(data.reservationId);
      },
    },
    {
      name: 'charge-payment',
      execute: async (context, data) => {
        const payment = await chargeCard(data.customerId, data.total);
        return { ...data, paymentId: payment.id };
      },
      compensate: async (context, data) => {
        await refundPayment(data.paymentId);
      },
    },
    {
      name: 'create-shipment',
      execute: async (context, data) => {
        const shipment = await createShipment(data);
        return { ...data, shipmentId: shipment.id };
      },
      compensate: async (context, data) => {
        await cancelShipment(data.shipmentId);
      },
    },
  ],
});
```

### Monitored Workflow

Add built-in metrics and monitoring.

```typescript
import { createMonitoredWorkflow } from '@repo/orchestration/workflows';

export const { POST } = createMonitoredWorkflow({
  name: 'user-onboarding',
  handler: async (context) => {
    const { userId } = context.requestPayload;

    // Your workflow logic here
    await createUserProfile(userId);
    await sendWelcomeEmail(userId);
    await setupDefaultSettings(userId);

    return { userId, status: 'completed' };
  },
  metrics: {
    onStart: async (context) => {
      await trackEvent('workflow.started', {
        workflow: 'user-onboarding',
        userId: context.requestPayload.userId,
      });
    },
    onComplete: async (context, result, duration) => {
      await trackEvent('workflow.completed', {
        workflow: 'user-onboarding',
        duration,
        result,
      });
    },
    onError: async (context, error, duration) => {
      await trackEvent('workflow.failed', {
        workflow: 'user-onboarding',
        error: error.message,
        duration,
      });
    },
  },
});
```

## Real-World Examples

### E-commerce Order Processing

Combining multiple patterns for a complete order workflow.

```typescript
import { serve } from '@upstash/workflow/nextjs';
import {
  parallelExecute,
  approvalGate,
  processBatch,
  pipeline,
} from '@repo/orchestration/workflows';

export const { POST } = serve(async (context) => {
  const { orderId, items, customer } = context.requestPayload;

  // Step 1: Parallel validation checks
  const validations = await parallelExecute(context, {
    inventory: () => checkInventory(items),
    fraud: () => checkFraud(customer, totalAmount),
    credit: () => checkCredit(customer.id, totalAmount),
  });

  // Step 2: Process order through pipeline
  const processedOrder = await pipeline(context, {
    input: { orderId, items, customer, validations },
    stages: [
      {
        name: 'calculate-totals',
        transform: async (order) => ({
          ...order,
          subtotal: calculateSubtotal(order.items),
          tax: calculateTax(order.items, customer.address),
          shipping: calculateShipping(order.items, customer.tier),
        }),
      },
      {
        name: 'apply-discounts',
        transform: async (order) => ({
          ...order,
          discounts: await getApplicableDiscounts(order),
          finalTotal: calculateFinalTotal(order),
        }),
      },
    ],
  });

  // Step 3: Approval gate for high-value orders
  if (processedOrder.finalTotal > 5000) {
    await approvalGate(context, {
      approvalId: `high-value-order-${orderId}`,
      notificationData: processedOrder,
      timeout: '1h',
    });
  }

  // Step 4: Process items in batches
  const fulfillmentResults = await processBatch(context, {
    items: processedOrder.items,
    batchSize: 10,
    processor: async (item) => {
      return await createFulfillmentOrder(item);
    },
    stepPrefix: 'fulfill',
  });

  return {
    orderId,
    status: 'processed',
    fulfillmentOrders: fulfillmentResults,
  };
});
```

### Data Migration Workflow

Using composition utilities for complex data migration.

```typescript
import {
  createDataProcessingWorkflow,
  createMonitoredWorkflow,
} from '@repo/orchestration/workflows';

// Wrap data processing in monitoring
export const { POST } = createMonitoredWorkflow({
  name: 'data-migration',
  handler: async (context) => {
    const workflow = createDataProcessingWorkflow({
      extract: async (ctx) => {
        const data = await readFromLegacySystem();
        return data;
      },
      transform: [
        {
          name: 'clean',
          operation: async (data) => cleanLegacyData(data),
          parallel: true,
        },
        {
          name: 'normalize',
          operation: async (data) => normalizeToNewSchema(data),
          parallel: true,
        },
        {
          name: 'validate',
          operation: async (data) => validateMigratedData(data),
          parallel: false,
        },
      ],
      validate: async (data) => {
        const validation = await runDataValidation(data);
        return validation;
      },
      requiresApproval: (data) => {
        // Require approval for large migrations
        return data.length > 50000;
      },
      load: async (ctx, data) => {
        return await writeToNewSystem(data);
      },
      batchSize: 1000,
    });

    // Execute the workflow
    return await workflow.POST(context);
  },
  metrics: {
    onStart: async () => {
      await notifyOps('Migration started');
    },
    onComplete: async (ctx, result, duration) => {
      await notifyOps(`Migration completed in ${duration}ms`);
    },
    onError: async (ctx, error) => {
      await alertOps('Migration failed', error);
    },
  },
});
```

## Best Practices

### 1. Error Handling

Always provide error handlers for critical operations:

```typescript
const result = await pipeline(context, {
  input: data,
  stages: [
    {
      name: 'critical-operation',
      transform: async (data) => performCriticalOperation(data),
      onError: async (error, data) => {
        // Log error
        await logError(error);
        // Return safe default or partial result
        return { ...data, status: 'partial' };
      },
    },
  ],
});
```

### 2. Timeout Configuration

Set appropriate timeouts for operations that wait for external events:

```typescript
await approvalGate(context, {
  approvalId: 'approval-123',
  notificationData: data,
  timeout: '30m', // Reasonable timeout
  onTimeout: async () => {
    // Handle timeout gracefully
    await notifyTimeout();
  },
});
```

### 3. Batch Size Optimization

Choose batch sizes based on:

- Memory constraints
- API rate limits
- Processing time per item

```typescript
// For API calls with rate limits
await processBatch(context, {
  items,
  batchSize: 10, // Small batches for rate-limited APIs
  delayBetweenBatches: 1, // 1 second delay
  processor: callRateLimitedAPI,
});

// For database operations
await processBatch(context, {
  items,
  batchSize: 1000, // Larger batches for DB operations
  processor: insertIntoDatabase,
});
```

### 4. State Management

For complex workflows, maintain clear state:

```typescript
const workflow = createEventDrivenWorkflow({
  initialState: {
    // Clear initial state
    status: 'initialized',
    processedCount: 0,
    errors: [],
  },
  events: {
    'process-item': {
      handler: async (ctx, state, item) => {
        try {
          await processItem(item);
          return {
            ...state,
            processedCount: state.processedCount + 1,
          };
        } catch (error) {
          return {
            ...state,
            errors: [...state.errors, error.message],
          };
        }
      },
    },
  },
});
```

### 5. Composition Over Inheritance

Compose workflows from smaller, reusable patterns:

```typescript
// Reusable order validation workflow
const validateOrder = async (context, order) => {
  return await parallelExecute(context, {
    inventory: () => checkInventory(order.items),
    customer: () => validateCustomer(order.customerId),
    payment: () => verifyPaymentMethod(order.paymentId),
  });
};

// Reusable order processing workflow
const processOrder = async (context, order) => {
  const validation = await validateOrder(context, order);

  if (!validation.inventory.available) {
    throw new Error('Items out of stock');
  }

  // Continue processing...
};
```

### 6. Monitoring and Observability

Always add monitoring to production workflows:

```typescript
export const { POST } = createMonitoredWorkflow({
  name: 'critical-workflow',
  handler: async (context) => {
    // Add breadcrumbs throughout the workflow
    await context.run('step-1', async () => {
      console.log('Starting step 1');
      const result = await performStep1();
      console.log('Step 1 completed', { result });
      return result;
    });
  },
  metrics: {
    onStart: async (ctx) => {
      await metrics.increment('workflow.started');
    },
    onComplete: async (ctx, result, duration) => {
      await metrics.histogram('workflow.duration', duration);
      await metrics.increment('workflow.completed');
    },
    onError: async (ctx, error, duration) => {
      await metrics.increment('workflow.failed');
      await sentry.captureException(error);
    },
  },
});
```

### 7. Testing Patterns

Structure your workflows to be testable:

```typescript
// Separate business logic from workflow orchestration
export const processItemLogic = async (item) => {
  // Business logic here
  return processedItem;
};

// Workflow uses the separated logic
export const { POST } = serve(async (context) => {
  const items = context.requestPayload.items;

  const results = await processBatch(context, {
    items,
    batchSize: 10,
    processor: processItemLogic, // Easy to test separately
  });

  return results;
});
```
