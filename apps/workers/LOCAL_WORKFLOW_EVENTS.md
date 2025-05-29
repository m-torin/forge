# Local Development with Upstash Workflow Events

This document explains how to handle the `waitForEvent` messageId issue in local development and
outlines the solutions implemented in this codebase.

## The Problem

When running Upstash Workflow in local development with the QStash CLI, you may encounter this
error:

```
Error: Cannot read properties of undefined (reading 'messageId')
```

This error occurs because the local QStash CLI development server has limitations compared to the
production QStash service, particularly around event notification handling.

## Root Cause

The local QStash CLI server:

1. Uses in-memory storage instead of persistent storage
2. Has simplified event tracking
3. Doesn't properly generate or include `messageId` in event notifications
4. May have race conditions or concurrency issues

When a workflow calls `context.waitForEvent()`, it expects the event data to include a `messageId`
property, which is missing in the local environment.

## Solutions Implemented

We've implemented robust error handling in our workflow files:

1. **Development Environment Detection**: We check if we're running in a local development
   environment
2. **Bypass waitForEvent**: In local development, we skip the actual `waitForEvent` call and provide
   auto-approval
3. **Informative Logging**: We log clear messages about the workaround and how to fix the issue
4. **Production Protection**: We maintain proper error handling in production

### Example Implementation

```typescript
// Check if we're in local development environment
const isLocalDev =
  process.env.NODE_ENV === 'development' ||
  process.env.QSTASH_URL?.includes('localhost') ||
  process.env.QSTASH_URL?.includes('127.0.0.1');

if (isLocalDev) {
  // In local development, bypass waitForEvent entirely
  console.log(`
  LOCAL DEVELOPMENT: Auto-approving to bypass waitForEvent messageId issue.
  To fix this issue at the source, you can:
  1. Upgrade to QStash CLI v3.0+ with: npm install @upstash/qstash-cli@latest
  2. Run with: npx @upstash/qstash-cli dev --full-metadata --persist
  3. Or set environment variable: QSTASH_EVENT_METADATA=full
  `);

  // Provide auto-approval
  approvalResult = {
    approved: true,
    approver: 'auto-approved-local',
    notes: 'Local development auto-approval (messageId workaround)',
  };
} else {
  // Production behavior - use normal waitForEvent
  try {
    const { eventData, timeout } = await context.waitForEvent(
      'approval-wait',
      `order-approval-${id}`,
      { timeout: '5m' }
    );
    // Normal handling...
  } catch (error) {
    // Production error handling...
    throw error;
  }
}
```

## Fixing the Issue at the Source

Instead of just working around the issue, you can fix it at the source by properly configuring the
QStash CLI:

1. **Set the QSTASH_EVENT_METADATA environment variable (Recommended)**:

   ```bash
   QSTASH_EVENT_METADATA=full npx @upstash/qstash-cli dev
   ```

   This is the most reliable method and can be added to your package.json:

   ```json
   "scripts": {
     "qstash:local": "QSTASH_EVENT_METADATA=full npx @upstash/qstash-cli dev"
   }
   ```

2. **Upgrade QStash CLI if needed**:

   ```bash
   npm install @upstash/qstash-cli@latest --save-dev
   ```

3. **Important Note on QStash CLI Flags**: As of version 2.22.3, flags like `--persist` and
   `--debug` are not supported by the QStash CLI dev command. Using these flags will cause errors
   like:

   ```
   flag provided but not defined: -persist
   ```

   Stick with the environment variable approach above for best results.

4. **Verify Configuration**: The QStash CLI should start on port 8080 by default. You should see
   output similar to:

   ```
   QStash Dev Server running on http://localhost:8080
   ```

5. **Configure Persistent Storage**: Create a `qstash.config.js` file:
   ```javascript
   module.exports = {
     persistence: {
       enabled: true,
       path: './.qstash/msgstore',
     },
   };
   ```

## Affected Files

We've implemented the workaround in these files:

1. `apps/workers/app/api/event-workflow/route.ts`
2. `apps/workers/app/api/kitchen-sink-workflow/route.ts`

## Best Practices for Local Development

1. **Use `isLocalDev` Check**: Always check if running in local development before executing
   event-based code
2. **Provide Fallbacks**: Have sensible defaults for event data in local development
3. **Log Clearly**: Make it obvious when you're using a local development workaround
4. **Maintain Production Path**: Keep production code paths intact and only bypass in development
5. **Isolate Environment Specifics**: Keep environment-specific logic isolated for easier
   maintenance
6. **Avoid Wrapping Context Methods in try/catch**: Do not wrap `context.run`, `context.sleep`,
   `context.sleepUntil`, or `context.call` methods in try/catch blocks, as this can cause workflow
   aborts
7. **Implement Thorough Validation**: Always validate context.requestPayload and all required fields
   to prevent null reference errors

### Preventing Null Reference Errors

When working with Upstash Workflow, one common issue is
`TypeError: Cannot read properties of undefined` errors when accessing fields from the request
payload. To prevent these errors, implement thorough validation:

```typescript
// Always validate the request payload itself
if (!context.requestPayload) {
  throw new Error('Missing request payload');
}

const { orderId, items, customer } = context.requestPayload;

// Validate required fields before using them
if (!orderId) {
  throw new Error('Missing required field: orderId');
}
if (!items || !Array.isArray(items)) {
  throw new Error('Missing or invalid field: items');
}
if (!customer) {
  throw new Error('Missing required field: customer');
}

// Now it's safe to use these fields
const normalizedOrderId = orderId.startsWith('order-') ? orderId : `order-${orderId}`;
```

This approach ensures your workflow fails gracefully with clear error messages instead of cryptic
null reference errors. It's especially important in local development where payloads might not be
fully formed.

### Important: Do Not Wrap Context Methods in try/catch

Upstash Workflow has a specific error when you wrap context methods in try/catch blocks:

```
WorkflowAbort: This is an Upstash Workflow error thrown after a step executes.
It is expected to be raised. Make sure that you await for each step. Also,
if you are using try/catch blocks, you should not wrap context.run/sleep/sleepUntil/call
methods with try/catch. Aborting workflow after executing step...
```

Incorrect:

```typescript
try {
  // DON'T DO THIS - will cause a WorkflowAbort error
  await context.run('step-name', async () => {
    // step logic
  });
} catch (error) {
  // error handling
}
```

Correct:

```typescript
// Direct execution without try/catch
await context.run('step-name', async () => {
  // step logic
});

// You can still use try/catch INSIDE the step function
await context.run('step-name', async () => {
  try {
    // Try some code that might fail
  } catch (innerError) {
    // Handle error within step
  }
  return result;
});
```

## Understanding the Workflow Event Architecture

For a better understanding of how event notifications work in Upstash Workflow:

- Events are registered with `context.waitForEvent(name, eventId, options)`
- External systems send notifications with `client.notify({eventId, eventData})`
- QStash routes these notifications to the waiting workflows
- In production, messageId is properly generated and included
- In local development, messageId may be missing without proper configuration

### Important: Using Unique IDs for Testing

QStash performs deduplication of messages to prevent the same message from being processed multiple
times. This is a critical feature in production, but it means that **you must use unique IDs when
testing any workflow**.

If you attempt to process multiple workflows with the same ID (e.g., orderId, pipelineId, taskId),
QStash will consider subsequent requests as duplicates and skip processing them. For example, if you
process an order with ID "order-123" and then try to process another order with the same ID
"order-123", the second one will be detected as a duplicate.

We've implemented a robust solution in the UI that:

1. Uses Mantine's `useId` hook to generate component-instance-unique IDs
2. Combines this with a timestamp to ensure temporal uniqueness
3. Makes a deep copy of the example payload to avoid modifying the original
4. Applies unique IDs to different workflow types based on their structure

Here's the implementation:

```javascript
// Use Mantine's useId hook to generate unique IDs
const uniqueId = useId();

const triggerWorkflow = async (workflow, payload) => {
  // Create a copy of the example payload
  let actualPayload = payload || JSON.parse(JSON.stringify(workflow.example));

  // Generate unique IDs based on workflow type
  const timestamp = Date.now();
  const workflowUniqueId = `${uniqueId}-${timestamp}`;

  // Apply unique IDs based on workflow type
  if (workflow.id === 'event' && actualPayload.orderId) {
    actualPayload.orderId = `order-${workflowUniqueId}`;
  } else if (workflow.id === 'kitchen-sink' && actualPayload.pipelineId) {
    actualPayload.pipelineId = `pipeline-${workflowUniqueId}`;
  }
  // etc. for other workflow types

  // Rest of the function...
};
```

You should follow a similar pattern in your own test code, ensuring that:

1. Each entity has a unique ID
2. IDs combine both instance uniqueness and temporal uniqueness
3. Different workflow types get appropriate ID types

This ensures that each test run is treated as a new, unique workflow by QStash, preventing
deduplication issues.

## Additional Resources

- [Upstash Workflow Documentation](https://upstash.com/docs/workflow/howto/events)
- [QStash CLI GitHub Repository](https://github.com/upstash/qstash-cli)
- [Local Development Guide](https://upstash.com/docs/workflow/howto/local-development)
