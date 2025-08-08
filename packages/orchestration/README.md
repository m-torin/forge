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
    background job processing
  - **Step Factory**: Utilities for creating and composing workflow steps with
    retry logic
  - **Error Handling**: Basic error classification with OrchestrationErrorCodes
    and typed errors
  - **Rate Limiting**: Built-in rate limiting and circuit breaker patterns for
    resilient workflows
  - **Batch Processing**: Batch manager for efficient processing of large
    datasets
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

- _Documentation:_
  **[Orchestration Package](../../apps/docs/packages/orchestration/overview.mdx)**
