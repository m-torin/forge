# @repo/orchestration

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `./client`, `./server`, `./client/next`, `./server/next`
  - **Workflows**: `./workflows`, `./triggers`, `./actions`

- _AI Hints:_

  ```typescript
  // Primary: Upstash Workflow + QStash orchestration - durable background jobs
  import {
    createWorkflowEngine,
    createStep
  } from "@repo/orchestration/server/next";
  // Utilities: import { withStepRetry, compose } from "@repo/orchestration"
  // ❌ NEVER: Run long-running jobs in request handlers or without error handling
  ```

- _Key Features:_
  - **Upstash Integration**: Built on Upstash Workflow and QStash for durable
    background job processing with webhook signature verification
  - **Step Factory**: Utilities for creating and composing workflow steps with
    retry logic and AbortSignal.timeout support
  - **Error Handling**: Basic error classification with OrchestrationErrorCodes
    and typed errors, plus sensitive data masking
  - **Rate Limiting**: Built-in rate limiting with LRU cache and circuit breaker
    patterns for resilient workflows
  - **Memory Management**: BoundedCache with TTL and analytics for preventing
    unbounded growth
  - **ES2023 Support**: Modern JavaScript features including immutable sorting
    (.toSorted())
  - **Security**: QStash signature verification, data masking, and crypto-secure
    ID generation
  - **Monitoring**: Basic workflow execution status tracking and health checks

- _Environment Variables:_

  ```bash
  # QStash Configuration (required)
  QSTASH_URL=https://qstash.upstash.io
  QSTASH_TOKEN=your_qstash_token
  QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key
  QSTASH_NEXT_SIGNING_KEY=your_next_signing_key
  
  # Upstash Redis (optional)
  UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
  UPSTASH_REDIS_REST_TOKEN=your_redis_token
  ```

- _Quick Setup:_

  ```typescript
  // Create workflow engine
  import {
    createWorkflowEngine,
    createStep
  } from "@repo/orchestration/server/next";

  const engine = createWorkflowEngine({
    providers: [
      {
        name: "upstash",
        type: "upstash-workflow",
        config: {
          baseUrl: process.env.QSTASH_URL,
          qstashToken: process.env.QSTASH_TOKEN
        }
      }
    ]
  });

  // Create steps with retry logic
  import { withStepRetry } from "@repo/orchestration";
  const robustStep = withStepRetry(createStep("download", downloadFile), {
    maxAttempts: 3,
    backoffMs: 1000
  });
  ```

- _Workflow Patterns:_
  - Step creation: `createStep()`, composition: `compose()`, retry:
    `withStepRetry()`
  - Error handling: `createOrchestrationError()`, `OrchestrationErrorCodes`
  - Rate limiting: `withRateLimit()`, circuit breaker: `withCircuitBreaker()`
  - Batch processing: `BatchManager`, monitoring: `engine.getStatus()`

- _Node 22/ES2023 Features:_

  ```typescript
  // Modern AbortSignal with timeout and proper cleanup
  import { createTimeoutSignal } from "@repo/orchestration/shared/factories/step-templates";

  const signal = createTimeoutSignal(5000); // 5 second timeout
  signal.addEventListener(
    "abort",
    () => {
      console.log("Operation timed out");
    },
    { once: true }
  ); // Proper cleanup

  // BoundedCache with TTL and analytics
  import { BoundedCache } from "@repo/orchestration";

  const cache = new BoundedCache({
    maxSize: 1000, // LRU eviction at 1000 entries
    ttl: 300000, // 5 minute TTL
    enableAnalytics: true // Track hits/misses
  });

  // Secure ID generation
  import { randomUUID } from "crypto";
  const secureId = randomUUID(); // Crypto-secure, not Math.random()

  // Immutable operations (ES2023)
  const sortedArray = data.toSorted((a, b) => a.timestamp - b.timestamp);

  // Webhook signature verification
  import { createWorkflowWebhookHandler } from "@repo/orchestration/server/next";

  const handler = createWorkflowWebhookHandler({
    provider: workflowProvider,
    secret: process.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSecret: process.env.QSTASH_NEXT_SIGNING_KEY, // Key rotation support
    onEvent: async (event) => {
      // Handle verified webhook event
    }
  });

  // Data masking for sensitive logs
  import { maskSensitiveData } from "@repo/orchestration/shared/utils/data-masking";

  console.log("User data:", maskSensitiveData(userData)); // Masks API keys, tokens, etc.
  ```

- _Documentation:_
  **[Orchestration Package](../../apps/docs/packages/orchestration/overview.mdx)**
