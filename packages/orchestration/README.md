# @repo/orchestration

Upstash Workflow orchestration package for distributed task execution, following the architecture
from the
[implementation guide](../../docs/compass_artifact_wf-7535699d-9437-4e83-9418-859f222a1e38_text_markdown.md).

## Directory Structure

```
src/
├── client/           # Workflow client and builder utilities
│   ├── workflow-client.ts    # Enhanced Upstash client with monitoring
│   └── workflow-builder.ts   # Fluent API for building workflows
│
├── context/          # Context enhancement and deduplication
│   ├── context.ts           # Enhanced workflow context with utilities
│   └── deduplication.ts     # Message and ID deduplication logic
│
├── dev/              # Development and testing utilities
│   ├── development.ts       # Development helpers and logging
│   ├── local-dev.ts        # Local QStash development support
│   └── testing.ts          # Testing utilities and mocks
│
├── errors/           # Error handling utilities
│   └── error-handling.ts   # Error types, handlers, and circuit breakers
│
├── monitoring/       # Workflow monitoring and observability
│   └── index.ts           # Status tracking and real-time monitoring
│
├── types/            # TypeScript type definitions
│   └── index.ts           # Core types and interfaces
│
├── utils/            # General utilities
│   ├── circuit-breaker.ts  # Circuit breaker implementation
│   ├── helpers.ts          # Common helper functions
│   └── rate-limiter.ts     # Rate limiting utilities
│
└── workflows/        # Workflow patterns and implementations
    ├── composition.ts      # Workflow composition patterns
    ├── patterns.ts         # Reusable workflow patterns
    ├── scheduled.ts        # Scheduled workflow utilities
    └── scraping.ts         # Web scraping workflow patterns
```

## Installation

```bash
pnpm add @repo/orchestration
```

## Overview

This package provides:

- **Workflow Management**: Durable, retryable serverless workflows
- **Enhanced Context**: Automatic utilities injection into workflow context
- **Deduplication**: Prevent duplicate message and ID processing
- **Error Handling**: Comprehensive error types and retry strategies
- **Monitoring**: Real-time workflow status tracking
- **Testing**: Mock contexts and test utilities
- **Patterns**: Reusable patterns for common workflow scenarios
- **Development Tools**: Enhanced logging and debugging in development

## Starting Workflows

There are three ways to start a workflow:

### 1. Using `client.trigger` (Recommended)

Returns the workflow run ID immediately and results in one less QStash publish per workflow.

```typescript
import { Client } from "@upstash/workflow";

const client = new Client({ token: "<QSTASH_TOKEN>" });

const { workflowRunId } = await client.trigger({
  url: "https://your-app.com/api/workflow/route",
  body: "hello there!",         // Optional body
  headers: { ... },             // Optional headers
  workflowRunId: "my-workflow", // Optional workflow run ID
  retries: 3                    // Optional retries
});
```

### 2. Publishing with QStash

Standard QStash publish method that returns a message ID.

```typescript
import { Client } from "@upstash/qstash";

const client = new Client({ token: "<QSTASH_TOKEN>" });

const { messageId } = await client.publishJSON({
  url: "https://your-app.com/api/workflow/route",
  body: { hello: "there!" },
  headers: { ... },
  retries: 3
});
```

### 3. Direct HTTP Request

Simple HTTP POST request (only works if endpoint is NOT secured with signing keys).

```bash
curl -X POST https://your-app.com/api/workflow/route \
     -H "Content-Type: application/json" \
     -d '{"foo": "bar"}'
```

**Note**: If you've secured your endpoint with signing keys (recommended for production), only
methods 1 and 2 will work.

### Accessing Payload and Headers

In your workflow, the payload and headers are accessible through the context:

```typescript
export const { POST } = serve(async (context) => {
  // Access the payload
  const payload = context.requestPayload;

  // Access the headers
  const headers = context.headers;

  // Your workflow logic...
});
```

## Basic Usage

### Define a Workflow

```typescript
import { serve } from '@upstash/workflow/nextjs';

export const { POST } = serve<{ name: string }>(async (context) => {
  // Step 1: Run a task
  const result = await context.run('process-data', async () => {
    console.log(`Processing for ${context.requestPayload.name}`);
    return { processed: true, timestamp: Date.now() };
  });

  // Step 2: Sleep for 5 seconds
  await context.sleep('wait', 5);

  // Step 3: Make an HTTP call
  const apiResult = await context.call('fetch-data', {
    url: 'https://api.example.com/data',
    method: 'GET',
  });

  return { result, apiResult };
});
```

### Using the Workflow Builder

```typescript
import { createWorkflowBuilder } from '@repo/orchestration';

export const { POST } = createWorkflowBuilder<{ userId: string }>()
  .withRetries(3)
  .withVerboseLogging()
  .withFailureUrl('https://your-app.com/api/workflow-failed')
  .withFlowControl({
    rateLimit: { key: 'api-calls', rate: 10, period: '1m' },
  })
  .build(async (context) => {
    // Your workflow logic
  });
```

### Using the Workflow Client

```typescript
import { createWorkflowClient } from '@repo/orchestration';

const client = createWorkflowClient();

// Trigger a workflow
const { workflowRunId } = await client.trigger({
  url: 'https://your-app.com/api/workflow',
  body: { data: 'test' },
});

// Get workflow logs
const { runs } = await client.logs({ workflowRunId });

// Cancel a workflow
await client.cancel({ ids: workflowRunId });

// Notify waiting workflows
await client.notify({
  eventId: 'approval-123',
  eventData: { approved: true },
});
```

## Advanced Features

### Circuit Breakers

Protect against cascading failures:

```typescript
import { CircuitBreaker } from '@repo/orchestration';

const breaker = new CircuitBreaker('api-service', {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
});

const result = await breaker.execute(async () => {
  return fetch('https://api.example.com/data');
});
```

### Rate Limiting

Control request rates per domain:

```typescript
import { RateLimiter } from '@repo/orchestration';

const limiter = new RateLimiter();

// Configure rate limits
limiter.setDomainLimits({
  'api.example.com': { requestsPerSecond: 5, burst: 10 },
  'slow-api.com': { requestsPerSecond: 1, burst: 2 },
});

// Check before making request
await limiter.checkLimit('api.example.com');
```

### Event-Driven Workflows

Wait for external events:

```typescript
export const { POST } = serve(async (context) => {
  // Start processing
  await context.run('start', async () => {
    console.log('Starting approval workflow');
  });

  // Wait for approval (max 1 hour)
  const { eventData, timeout } = await context.waitForEvent('wait-for-approval', 'approval-123', {
    timeout: '1h',
  });

  if (timeout) {
    return { status: 'timeout' };
  }

  // Continue based on approval
  if (eventData.approved) {
    await context.run('process-approved', async () => {
      console.log('Request approved!');
    });
  }

  return { status: eventData.approved ? 'approved' : 'rejected' };
});
```

### Parallel Execution

Process tasks concurrently:

```typescript
export const { POST } = serve<{ items: string[] }>(async (context) => {
  const { items } = context.requestPayload;

  // Process items in parallel (batches of 5)
  const results = [];
  for (let i = 0; i < items.length; i += 5) {
    const batch = items.slice(i, i + 5);

    const batchResults = await Promise.all(
      batch.map((item, index) =>
        context.run(`process-${i + index}`, async () => {
          // Process each item
          return { item, processed: true };
        })
      )
    );

    results.push(...batchResults);
  }

  return { totalProcessed: results.length, results };
});
```

## Context Properties

The workflow context provides access to:

```typescript
interface WorkflowContext<T = unknown> {
  // Core methods
  run<R>(name: string, fn: () => Promise<R>): Promise<R>;
  call<R>(name: string, options: CallOptions): Promise<CallResponse<R>>;
  sleep(name: string, duration: number | string): Promise<void>;
  sleepUntil(name: string, timestamp: Date): Promise<void>;
  waitForEvent<E>(name: string, eventId: string, options?: WaitOptions): Promise<EventResult<E>>;
  notify(
    stepName: string,
    eventId: string,
    eventData: unknown
  ): Promise<{ notifyResponse: NotifyResponse[] }>;
  cancel(): Promise<void>;

  // Properties
  qstashClient: Client; // QStash client instance
  workflowRunId: string; // Unique workflow run identifier
  url: string; // Workflow endpoint URL
  failureUrl?: string; // URL called on workflow failure
  requestPayload: T; // Parsed request payload
  rawInitialPayload: string; // Raw request payload string
  headers: Record<string, string | string[] | undefined>; // Request headers
  env?: Record<string, string | undefined>; // Environment variables
}
```

## Local Development

To develop and test workflows locally, use the QStash CLI which emulates the QStash service.

### Quick Start

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Set up environment variables** (`.env.local`):

   ```env
   # Required for local development
   QSTASH_URL=http://localhost:8080
   QSTASH_TOKEN=local_qstash_token

   # Tell Upstash Workflow where your app runs
   UPSTASH_WORKFLOW_URL=http://localhost:3000

   # Optional: Redis for state
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

3. **Start both servers**:

   ```bash
   # Terminal 1: QStash CLI
   npx @upstash/qstash-cli dev

   # Terminal 2: Your Next.js app
   pnpm dev
   ```

4. **Test your workflows**:
   ```bash
   curl -X POST http://localhost:3000/api/your-workflow \
        -H "Content-Type: application/json" \
        -d '{"test": "data"}'
   ```

### Local Development Features

- **Real-time logs**: See each workflow step execute in the terminal
- **Instant updates**: Code changes reflect immediately
- **Full debugging**: Use console.log and debugger statements
- **Network access**: External API calls work normally
- **Event simulation**: Test waitForEvent with the notify API

### Tips

- Set `verbose: true` in workflow config for detailed logging
- Check both QStash CLI and Next.js terminals for logs
- Use `http://localhost:8080` to view the QStash dashboard
- Workflow delays (`sleep`) execute in real-time locally

## Production Deployment

1. Get your QStash credentials from [console.upstash.com](https://console.upstash.com/qstash)

2. Set environment variables:

   ```env
   QSTASH_TOKEN=qstash_xxxxxx
   QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxx
   QSTASH_NEXT_SIGNING_KEY=sig_xxxxxx
   ```

3. Deploy your application (Vercel, AWS, etc.)

4. Monitor workflows in the [QStash Dashboard](https://console.upstash.com/qstash)

## API Reference

### Workflow Builder

- `withRetries(count: number)` - Set retry count
- `withVerboseLogging()` - Enable detailed logging
- `withFailureUrl(url: string)` - Set failure webhook URL
- `withFailureFunction(fn: Function)` - Set failure handler
- `withFlowControl(options)` - Configure rate limiting
- `build(handler: Function)` - Build the workflow

### Workflow Client

- `trigger(options)` - Start a workflow
- `logs(options)` - Get workflow logs
- `cancel(options)` - Cancel workflows
- `notify(options)` - Notify waiting workflows
- `getWaiters(options)` - Get workflows waiting for events

### Circuit Breaker

- `execute(fn)` - Execute function with circuit breaker protection
- `getState()` - Get current breaker state
- `reset()` - Manually reset the breaker

### Rate Limiter

- `checkLimit(domain)` - Check if request is allowed
- `setDomainLimits(limits)` - Configure domain limits
- `reset(domain)` - Reset domain counters

## Reusable Workflow Patterns

The package includes battle-tested patterns for common workflow scenarios:

### Batch Processing

```typescript
import { processBatch } from '@repo/orchestration/workflows';

const results = await processBatch(context, {
  items: largeDataset,
  batchSize: 100,
  delayBetweenBatches: 2,
  processor: async (item) => processItem(item),
});
```

### Parallel Execution

```typescript
import { parallelExecute } from '@repo/orchestration/workflows';

const results = await parallelExecute(context, {
  task1: () => doTask1(),
  task2: () => doTask2(),
  task3: () => doTask3(),
});
```

### Approval Gates

```typescript
import { approvalGate } from '@repo/orchestration/workflows';

await approvalGate(context, {
  approvalId: 'order-123',
  notificationData: orderDetails,
  timeout: '30m',
});
```

### Data Processing Workflows

```typescript
import { createDataProcessingWorkflow } from '@repo/orchestration/workflows';

export const { POST } = createDataProcessingWorkflow({
  extract: async (ctx) => fetchData(),
  transform: [
    { name: 'validate', operation: validateData, parallel: true },
    { name: 'enrich', operation: enrichData, parallel: true },
  ],
  load: async (ctx, data) => saveData(data),
  batchSize: 500,
});
```

For a complete guide on all patterns and composition utilities, see the
[patterns usage guide](src/workflows/patterns-usage.md).

## Best Practices

1. **Use descriptive step names** - Makes debugging easier in the dashboard
2. **Handle failures gracefully** - Use try/catch and the failure URL
3. **Set appropriate timeouts** - Prevent workflows from running forever
4. **Use rate limiting** - Protect external services from overload
5. **Monitor your workflows** - Check the QStash dashboard regularly
6. **Test locally first** - Use the QStash CLI for local development
7. **Secure production endpoints** - Use signing keys in production
8. **Use reusable patterns** - Leverage the built-in patterns for common scenarios
9. **Compose workflows** - Build complex workflows from simple, tested components
