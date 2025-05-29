# Workers - Workflow Orchestration

This app implements the Upstash Workflow orchestration system for web scraping and scheduled tasks,
following the architecture described in the
[implementation guide](../../docs/compass_artifact_wf-7535699d-9437-4e83-9418-859f222a1e38_text_markdown.md).

## Overview

The Workers app provides:

- **Scraping Workflows**: Distributed web scraping with rate limiting and retries
- **Scheduled Workflows**: Cron-based task scheduling
- **Event-Driven Workflows**: Approval flows and external event handling
- **Monitoring**: Real-time workflow status tracking

## Local Development

### Deduplication in Development

The event workflow includes deduplication to prevent processing the same order multiple times. In
local development, this can sometimes interfere with testing. Here's how to handle it:

1. **Automatic Expiry**: Orders expire from the deduplication cache after 1 minute in development
   mode
2. **Disable Deduplication**: Set `SKIP_WORKFLOW_DEDUPLICATION=true` in your `.env.local` file
3. **Unique IDs**: The UI automatically generates unique IDs using Mantine's `useId()` hook +
   timestamps - refreshing the page generates new IDs
4. **Server Restart**: Restarting the Next.js dev server clears the deduplication cache

#### Why Deduplication Happens

QStash may deliver the same message multiple times in certain scenarios:

- Network timeouts causing retries
- Local development environment quirks
- Workflow failures triggering automatic retries

The deduplication ensures each order is only processed once, even if QStash delivers it multiple
times.

#### Troubleshooting

If you see "Order already processed" messages during testing:

1. **Quick Fix**: Set `SKIP_WORKFLOW_DEDUPLICATION=true` in `.env.local`
2. **Wait**: Orders expire from cache after 1 minute
3. **Refresh**: Refresh the browser page to generate new unique IDs
4. **Restart**: Restart the Next.js dev server to clear the cache

The console logs will show:

- When orders are added to the cache
- Current cache size and contents
- When orders expire from the cache

## Architecture

Built on:

- **Upstash Workflow**: Durable serverless function orchestration
- **QStash**: Message queuing and scheduling
- **Redis**: State storage and caching
- **Next.js 15**: API routes and UI
- **@repo/orchestration**: Reusable workflow patterns and utilities

### Separation of Concerns

The workers app uses patterns and utilities from the `@repo/orchestration` package:

**In the Package** (`packages/orchestration`):

- Reusable workflow patterns (batch processing, parallel execution, approval gates)
- Workflow composition utilities (pipeline, saga, event-driven patterns)
- Workflow client and builder abstractions
- Common types and interfaces

**In the App** (`apps/workers`):

- Specific workflow implementations using the patterns
- API endpoints for workflow triggers
- UI for monitoring and testing
- Business-specific logic

Example using patterns from the package:

```typescript
import {
  parallelExecute,
  processBatch,
  approvalGate,
} from '@repo/orchestration/workflows/patterns';

export const { POST } = serve(async (context) => {
  // Use reusable patterns for common operations
  const results = await parallelExecute(context, {
    operations: items.map((item) => ({
      name: `process-${item.id}`,
      operation: async () => processItem(item),
    })),
  });

  // Process in batches with the pattern
  const processed = await processBatch(context, {
    items: results.successful,
    batchSize: 10,
    processor: async (item) => transform(item),
  });
});
```

## Local Development

To develop workflows locally, you'll use the QStash CLI which emulates the QStash service on your
machine.

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- A free Upstash account for Redis (optional, for state management)

### Setup

1. **Install the QStash CLI** (automatically installed with dev dependencies):

   ```bash
   pnpm install
   ```

2. **Configure environment variables** in `.env.local`:

   ```env
   # QStash local development
   QSTASH_URL=http://localhost:8080
   QSTASH_TOKEN=local_qstash_token

   # Tell Upstash Workflow to use local QStash
   UPSTASH_WORKFLOW_URL=http://localhost:3800

   # Required: Redis for state management
   UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-redis-token

   # Required: Auth and Database (copy from another app or use test values)
   BETTER_AUTH_SECRET=your-secret-key-at-least-32-chars
   DATABASE_URL=postgresql://postgres:password@localhost:5432/forge

   # Required: App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3800
   ```

   **Note**: You need a free Upstash Redis instance. Sign up at https://console.upstash.com and
   create a Redis database to get your URL and token.

3. **Verify your setup** (optional):

   ```bash
   pnpm test:setup
   ```

4. **Start the development servers**:

   The `pnpm dev` command automatically starts both servers in parallel:

   ```bash
   pnpm dev
   # This runs:
   # - Next.js dev server on http://localhost:3800
   # - QStash CLI on http://localhost:8080
   ```

   Or run them separately:

   ```bash
   # Terminal 1: Start QStash CLI
   npx @upstash/qstash-cli dev

   # Terminal 2: Start Next.js
   pnpm next dev -p 3800
   ```

5. **Access your application**:
   - Workflows: http://localhost:3800
   - QStash Dashboard: http://localhost:8080 (shows workflow executions)

### Testing Workflows Locally

With the local setup, you can:

1. **Trigger workflows** using any of the three methods (client.trigger, QStash publish, or HTTP)
2. **View execution logs** in the QStash CLI terminal output
3. **Debug step-by-step** - each workflow step is logged with details
4. **Test failure scenarios** - workflows retry automatically on errors
5. **Simulate delays** - `context.sleep()` works in real-time locally

### Example Local Workflow Test

```bash
# Trigger a workflow
curl -X POST http://localhost:3800/api/workflow/examples/simple \
     -H "Content-Type: application/json" \
     -d '{"name": "Local Test", "count": 3}'

# Watch the QStash CLI output for execution details
```

### Local Development Tips

1. **Verbose Logging**: Set `verbose: true` in your workflow config for detailed logs
2. **Fast Iteration**: Changes to workflow code are reflected immediately (no rebuild needed)
3. **Network Requests**: External HTTP calls work normally in local development
4. **Event Simulation**: Use the `/api/client/notify` endpoint to simulate external events
5. **Error Handling**: Errors are logged to both Next.js and QStash CLI consoles

### Troubleshooting

- **Port conflicts**: Ensure ports 3800 and 8080 are available
- **Environment variables**: Double-check `.env.local` is properly configured
- **QStash CLI issues**: Try stopping and restarting the CLI
- **Workflow not triggering**: Check both terminal outputs for error messages

## API Endpoints

### Core Workflow Endpoints

#### 1. Basic Workflow - `/api/basic-workflow`

Task queue and batch processing with parallel execution

```bash
curl -X POST http://localhost:3800/api/basic-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {"id": "1", "priority": 10, "data": {"type": "urgent"}},
      {"id": "2", "priority": 5, "data": {"type": "normal"}}
    ],
    "batchSize": 5,
    "delayBetweenBatches": 2
  }'
```

#### 2. Event-Driven Workflow - `/api/event-workflow`

Order processing with approval gates and external API calls

```bash
curl -X POST http://localhost:3800/api/event-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "items": [{"sku": "ITEM-1", "quantity": 2, "price": 50}],
    "customer": {"id": "cust-456", "email": "test@example.com", "tier": "premium"},
    "requiresApproval": true
  }'
```

#### 3. Kitchen Sink Workflow - `/api/kitchen-sink-workflow`

Demonstrates ALL Upstash Workflow features in an ETL pipeline

```bash
curl -X POST http://localhost:3800/api/kitchen-sink-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineId": "pipeline-789",
    "source": {"type": "api", "url": "https://api.example.com/data"},
    "transformations": ["filter", "enrich", "aggregate"],
    "destination": {"type": "database", "config": {"table": "processed_data"}},
    "options": {
      "batchSize": 100,
      "requiresApproval": true,
      "scheduleAt": "2024-01-01T10:00:00Z"
    }
  }'
```

### Workflow Management API

- `POST /api/client/trigger` - Trigger any workflow programmatically
- `GET /api/client/logs` - Get workflow execution logs and status
- `POST /api/client/cancel` - Cancel running workflows
- `POST /api/client/notify` - Send events to waiting workflows
- `GET /api/client/waiters` - List workflows waiting for events
- `GET /api/health` - Health check endpoint

### Monitoring & Event Management

- `/monitoring` - Interactive dashboard to:
  - View all workflow runs with detailed execution steps
  - Monitor workflows waiting for events
  - Send events to waiting workflows
  - Cancel running workflows
  - Switch between grouped and flat view modes
  - Auto-refresh for real-time updates

### Starting Workflows

There are three ways to start a workflow:

#### 1. Using `client.trigger` (Recommended)

```typescript
import { Client } from '@upstash/workflow';

const client = new Client({ token: process.env.QSTASH_TOKEN });

const { workflowRunId } = await client.trigger({
  url: 'https://your-app.com/api/workflow/scraping',
  body: {
    urls: ['https://example.com'],
    selectors: { title: 'h1', content: '.main' },
  },
  headers: { 'x-custom': 'header' },
  workflowRunId: 'scrape-123', // Optional custom ID
  retries: 3, // Optional retries
});
```

#### 2. Publishing with QStash

```typescript
import { Client } from '@upstash/qstash';

const client = new Client({ token: process.env.QSTASH_TOKEN });

const { messageId } = await client.publishJSON({
  url: 'https://your-app.com/api/workflow/scraping',
  body: {
    urls: ['https://example.com'],
    selectors: { title: 'h1', content: '.main' },
  },
  headers: { 'x-custom': 'header' },
  retries: 3,
});
```

#### 3. Direct HTTP Request

```bash
# Only works if endpoint is NOT secured with signing keys
curl -X POST https://your-app.com/api/workflow/scraping \
     -H "Content-Type: application/json" \
     -H "x-custom: header" \
     -d '{"urls": ["https://example.com"], "selectors": {"title": "h1"}}'
```

**Note**: If you've secured your endpoint with signing keys (recommended for production), only
methods 1 and 2 will work. Direct HTTP calls will be rejected.

### Accessing Payload and Headers

In your workflow, access the sent data through the context:

```typescript
export const { POST } = serve(async (context) => {
  // Access the payload
  const payload = context.requestPayload;
  console.log('Received:', payload);

  // Access the headers
  const headers = context.headers;
  console.log('Headers:', headers);

  // Your workflow logic...
});
```

## Key Features

### Step-Based Execution

Each workflow step is individually retryable and tracked:

```typescript
await context.run('step-name', async () => {
  // Step logic
  return result;
});
```

### Waiting for Events

Pause workflow execution until external events occur:

```typescript
// In your workflow
const { eventData, timeout } = await context.waitForEvent(
  'waiting-for-approval',
  'approval-123',
  { timeout: '1h' } // Max wait time
);

if (timeout) {
  // Handle timeout
  throw new Error('Approval timeout');
}

// Process the event data
console.log('Approved by:', eventData.approver);
```

Send events to waiting workflows:

```typescript
// Via API
await fetch('/api/client/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventId: 'approval-123',
    eventData: { approved: true, approver: 'manager@company.com' },
  }),
});

// Or via Workflow Client
await client.notify({
  eventId: 'approval-123',
  eventData: { approved: true, approver: 'manager@company.com' },
});
```

### Long-Running Operations

HTTP calls can run up to 2 hours:

```typescript
await context.call('api-call', {
  url: 'https://api.example.com',
  method: 'POST',
  timeout: 7200000, // 2 hours
  retries: 3,
  flowControl: {
    key: 'api-limit',
    rate: 10,
    period: '1m',
  },
});
```

### Event-Driven Workflows

Wait for external events:

```typescript
const { eventData, timeout } = await context.waitForEvent(
  'approval',
  'approval-123',
  { timeout: '1h' } // Supports duration strings
);
```

### Workflow Client

Programmatically control workflows:

```typescript
import { createWorkflowClient } from '@repo/orchestration';

const client = createWorkflowClient();

// Trigger workflow
const { workflowRunId } = await client.trigger({
  url: 'https://your-app.com/api/workflow',
  body: { data: 'test' },
});

// Get logs
const { runs } = await client.logs({ workflowRunId });

// Cancel workflow
await client.cancel({ ids: workflowRunId });

// Notify waiting workflows
await client.notify({
  eventId: 'my-event',
  eventData: { approved: true },
});
```

## Production Deployment

### Step 1: Environment Variables

Set the following environment variables in your production environment (Vercel, AWS, etc.):

```env
# Required
QSTASH_TOKEN=qstash_xxxxxx

# Optional - for enhanced security
QSTASH_CURRENT_SIGNING_KEY=sig_xxxxxx
QSTASH_NEXT_SIGNING_KEY=sig_xxxxxx

# Redis for state management
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXASQgxxxxx

# Remove any local development URLs
# DELETE: QSTASH_URL (not needed in production)
# DELETE: UPSTASH_WORKFLOW_URL (not needed in production)
```

### Step 2: Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Or use the CLI:

```bash
vercel --prod
```

### Step 3: Verify Deployment

Test your production workflow:

```bash
curl -X POST https://your-app.vercel.app/api/workflow
# Response: {"workflowRunId":"wfr_xxxxxx"}
```

### Step 4: Monitor Workflows

1. Visit [QStash Dashboard](https://console.upstash.com/qstash) to monitor workflows
2. View detailed logs for each step
3. Set up alerts for failures

### Security Best Practices

1. **Signature Verification**: Production workflows automatically verify QStash signatures
2. **Rate Limiting**: Implement rate limiting for workflow triggers
3. **Access Control**: Use authentication for sensitive workflows
4. **Environment Isolation**: Never commit production tokens to git

### Debugging Production Issues

- Check Vercel function logs: `vercel logs`
- View QStash dashboard for workflow execution details
- Ensure function timeout is sufficient (max 300s for Vercel)
- Verify environment variables are correctly set

## Workflow Examples

The workers app includes three comprehensive workflow examples:

### 1. **Basic Workflow** (`/api/basic-workflow`)

- **Use Case**: Task queues, background jobs, batch processing
- **Features**: Sequential steps, parallel processing, priority sorting, configurable delays
- **Perfect for**: Processing large datasets, sending bulk emails, generating reports

### 2. **Event-Driven Workflow** (`/api/event-workflow`)

- **Use Case**: Order processing with parallel validations and approval systems
- **Features**:
  - **Parallel checks**: Inventory, fraud detection, and customer verification run simultaneously
  - Approval workflows with `waitForEvent`
  - External API integrations
  - Comprehensive error handling
- **Parallel Pattern**:
  ```typescript
  const [inventoryResults, fraudCheckResult, customerVerification] = await Promise.all([
    context.run('check-inventory', async () => {
      /* ... */
    }),
    context.run('fraud-check', async () => {
      /* ... */
    }),
    context.run('verify-customer', async () => {
      /* ... */
    }),
  ]);
  ```
- **Perfect for**: E-commerce orders, document approvals, multi-step validations

### 3. **Kitchen Sink Workflow** (`/api/kitchen-sink-workflow`)

- **Use Case**: Complex ETL pipelines with parallel and sequential transformations
- **Features**:
  - **Parallel transformations**: Validate, sanitize, and normalize data simultaneously
  - **Sequential transformations**: Filter, enrich, and aggregate in order
  - All context methods: `run`, `call`, `sleep`, `sleepUntil`, `waitForEvent`, `notify`, `cancel`
  - Flow control & rate limiting
  - Progress notifications and batch processing
- **Parallel Pattern**:
  ```typescript
  // Run validation, sanitization, and normalization in parallel
  const parallelResults = await Promise.all([
    context.run('validate', async () => {
      /* validation logic */
    }),
    context.run('sanitize', async () => {
      /* sanitization logic */
    }),
    context.run('normalize', async () => {
      /* normalization logic */
    }),
  ]);
  ```
- **Perfect for**: Data pipelines, ETL processes, complex data transformations

### 4. **Workflow Orchestration** (`/api/orchestration/main`)

- **Use Case**: Coordinating multiple workflows with type-safe invocation using `createWorkflow` and
  `serveMany`
- **Features**:
  - **Workflow invocation**: Call other workflows and await their results
  - **Type-safe composition**: Full TypeScript support across workflow boundaries
  - **Parallel workflow execution**: Run multiple workflows simultaneously
  - **Coffee shop example**: Demonstrates the exact parallel pattern from Upstash docs
- **Available Sub-Workflows**:
  - **Coffee Shop** (`/api/orchestration/coffee-shop`): Parallel inventory checks like the docs
    example
  - **Data Processing** (`/api/orchestration/process-data`): Reusable data operations
  - **Notifications** (`/api/orchestration/notify`): Send alerts via different channels
- **Invocation Pattern**:

  ```typescript
  // Define workflows with createWorkflow for type safety
  const coffeeShopWorkflow = createWorkflow<{ style: string; customerName: string }>(
    async (context) => {
      // Parallel inventory checks
      const [coffeeBeansAvailable, cupsAvailable, milkAvailable] = await Promise.all([
        context.run('check-coffee-beans', () => checkInventory('coffee-beans')),
        context.run('check-cups', () => checkInventory('cups')),
        context.run('check-milk', () => checkInventory('milk')),
      ]);
      // ... brew coffee if all available
    }
  );

  // Invoke from another workflow
  const { body, isFailed, isCanceled } = await context.invoke('coffee-order-1', {
    workflow: coffeeShopWorkflow,
    body: { style: 'cappuccino', customerName: 'Alice' },
  });

  // Export with serveMany
  export const { POST } = serveMany({
    main: orchestratorWorkflow,
    'coffee-shop': coffeeShopWorkflow,
    'process-data': dataProcessingWorkflow,
    notify: notificationWorkflow,
  });
  ```

- **Perfect for**: Microservice orchestration, complex business processes, workflow composition

Each workflow is production-ready and includes comprehensive error handling, logging, and best
practices.

## Testing Workflows Locally

### Quick Test: Basic Workflow

```bash
# This will run immediately and complete in ~10 seconds
curl -X POST http://localhost:3800/api/basic-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {"id": "1", "priority": 10, "data": {"type": "urgent"}},
      {"id": "2", "priority": 5, "data": {"type": "normal"}}
    ],
    "batchSize": 2
  }'
```

### Interactive Test: Event-Driven Workflow with Approval

1. **Start the workflow** (it will pause waiting for approval):

```bash
curl -X POST http://localhost:3800/api/event-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-12345",
    "items": [{"sku": "ITEM-1", "quantity": 2, "price": 50}],
    "customer": {"id": "cust-456", "email": "test@example.com", "tier": "premium"},
    "requiresApproval": true
  }'
```

2. **Check the console output** for the approval instructions and event ID

3. **Send approval** (within 5 minutes):

```bash
curl -X POST http://localhost:3800/api/client/notify \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "order-approval-order-12345",
    "eventData": {
      "approved": true,
      "approver": "manager@company.com",
      "notes": "Approved for premium customer"
    }
  }'
```

4. **Or use the Monitoring UI**:
   - Visit http://localhost:3800/monitoring
   - Find your running workflow
   - Click "Send Event" to approve/reject

### Advanced Test: Kitchen Sink Workflow

```bash
# This demonstrates all features including scheduling and flow control
curl -X POST http://localhost:3800/api/kitchen-sink-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "pipelineId": "pipeline-test-1",
    "source": {"type": "api", "url": "https://api.example.com/data"},
    "transformations": ["filter", "enrich"],
    "destination": {"type": "database", "config": {"table": "test_data"}},
    "options": {
      "batchSize": 5,
      "requiresApproval": false
    }
  }'
```
