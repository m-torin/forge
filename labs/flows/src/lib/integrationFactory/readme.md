# Flowbuilder integrationFactory

## Overview

Flowbuilder integrationFactory is a sophisticated middleware-based system designed to standardize external integrations in distributed ETL (Extract, Transform, Load) systems. It provides automated handling of cross-cutting concerns including event logging, caching, rate limiting, and telemetry across integration points.

## Type Safety

- All operations enforce strict typing with generic input/output types
- Factory configuration uses satisfies operators for type validation
- Middleware contexts are properly typed with readonly properties
- Error handling maintains type information through the chain

## Core Architecture

### Configuration System

The factory's behavior is driven by a comprehensive configuration system that allows for fine-grained control over all aspects of operation.

## Core Concepts

### Operation Factory

The operation factory is the central piece that:

- Creates standardized operations
- Manages middleware pipeline
- Provides consistent error handling
- Handles retry logic and timeouts
- Manages telemetry and logging

### Middleware Pipeline

Middleware executes in registration order, not by priority numbers:

```typescript
const factory = createOperationFactory({
  middleware: [
    createLoggingMiddleware(), // Executes first
    createTimeoutMiddleware(), // Executes second
    createCircuitBreakerMiddleware(), // Executes third
    createRetryMiddleware(), // Executes fourth
  ],
});
```

### Built-in Providers

Default implementations for development:

- `MemoryCacheProvider` for caching
- `DefaultTelemetryProvider` for telemetry
- `MemoryRateLimiter` for rate limiting
- `ConsoleLogger` for logging

## Middleware Reference

| Middleware   | Description                    | Default Provider           | Key Features                                                                                                                                                                       |
| ------------ | ------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logging      | Operation logging & monitoring | `ConsoleLogger`            | - Structured logging with levels (DEBUG, INFO, WARN, ERROR)<br>- Sensitive data redaction<br>- Custom formatters<br>- Automatic timing tracking<br>- Operation metadata enrichment |
| Timeout      | Operation timeout control      | Built-in                   | - AbortController integration<br>- Custom timeout handlers<br>- Automatic cleanup<br>- Default 30s timeout<br>- Timeout metadata tracking                                          |
| Lock         | Distributed locking            | Requires external          | - Automatic retry & release<br>- Configurable TTL<br>- Multiple lock acquisition strategies<br>- Resource key prefixing<br>- Lock extension support                                |
| Telemetry    | Operation tracing              | `DefaultTelemetryProvider` | - Automatic span creation<br>- Attribute collection<br>- Error tracking<br>- Custom sampling<br>- Service/version tracking                                                         |
| Circuit      | Circuit breaker pattern        | Built-in                   | - Three states (CLOSED, OPEN, HALF_OPEN)<br>- Error thresholds<br>- Degradation detection<br>- Custom state change handlers<br>- Rolling window metrics                            |
| Retry        | Operation retry handling       | Built-in                   | - Multiple strategies (linear/exponential/decorrelated)<br>- Configurable attempts & delays<br>- Jitter support<br>- Custom retry conditions<br>- Retry metadata tracking          |
| Cache        | Result caching                 | `MemoryCacheProvider`      | - TTL support<br>- Custom key generation<br>- Serialization hooks<br>- Cache metadata<br>- Hit/miss tracking                                                                       |
| RateLimit    | Request rate control           | `MemoryRateLimiter`        | - Fixed/sliding windows<br>- Custom key generation<br>- Multiple strategies<br>- Limit overflow handling<br>- Rate tracking                                                        |
| Backpressure | Load management                | Built-in                   | - Concurrent operation limits<br>- Queue management<br>- Multiple shed strategies<br>- Operation weighting<br>- Queue metrics                                                      |
| Batch        | Batch processing               | Built-in                   | - Size/count based batching<br>- Concurrent processing<br>- Failed item retry<br>- Batch metrics<br>- Custom item sizing                                                           |

### Priority & Execution Order

> **Important**: Middleware executes in registration order, not by priority numbers. Priority numbers are recommendations for optimal ordering when using multiple middleware.

### Default Configuration

```typescript
import { createOperationFactory } from '@fed-etl/integration-factory';

const factory = createOperationFactory()
  // Higher priority middleware first
  .use(createLoggingMiddleware())
  .use(createTimeoutMiddleware({ timeout: 30000 }))
  .use(createTelemetryMiddleware())
  .use(createCircuitBreakerMiddleware())
  .use(createRetryMiddleware())
  .use(createCacheMiddleware(new MemoryCacheProvider()))
  .use(createRateLimitMiddleware({ limit: 100, window: 1000 }))
  .use(createBackpressureMiddleware({ maxConcurrent: 10 }))
  .use(createBatchMiddleware({ maxBatchSize: 100 }));
```

### Middleware Interactions

- **Backpressure + Batch**: Backpressure controls concurrent batch operations
- **Circuit + Retry**: Circuit state affects retry behavior
- **Cache + Timeout**: Cache operations have independent timeouts
- **RateLimit + Backpressure**: Complementary request control at different levels

## Advanced Usage Patterns

### Pattern 0: MVP

A basic example of using the default wrapper.

```typescript
// Define typed inputs for better type safety
interface PublishMessageInput {
  topicArn: string;
  message: string;
  subject?: string;
}

// Create a wrapped operation
const snsPublish = flowbuilderOperation<PublishMessageInput, string>(
  'sns/publish',
  async (input, context) => {
    try {
      const client = new SNSClient({});
      const result = await client.send(
        new PublishCommand({
          TopicArn: input.topicArn,
          Message: input.message,
          Subject: input.subject,
        }),
        { abortSignal: context.signal },
      );

      if (!result.MessageId) {
        throw new Error('Message ID was not returned');
      }

      return result.MessageId;
    } catch (error) {
      if (context.signal?.aborted) {
        throw new Error('Operation timed out', { cause: error });
      }
      throw error;
    }
  },
  {
    timeout: 5000,
    cache: {
      enabled: true,
      ttl: 60,
      key: 'sns-publish',
    },
  },
);

// Demonstrate usage with proper error handling
async function main() {
  try {
    // Use default configuration
    const result1 = await snsPublish.execute({
      topicArn: 'arn:aws:sns:region:account:topic',
      message: 'Hello with default config',
    });
    console.log('Published with default config:', result1);

    // Use custom configuration
    const result2 = await snsPublish.withConfig(
      {
        topicArn: 'arn:aws:sns:region:account:topic',
        message: 'Hello with custom config',
      },
      {
        timeout: 10000,
        retries: 5,
      },
    );
    console.log('Published with custom config:', result2);
  } catch (error) {
    if (error instanceof FactoryError) {
      console.error('Operation failed:', {
        message: error.message,
        code: error.code,
        severity: error.severity,
      });
    } else {
      console.error('Unexpected error:', error);
    }
  } finally {
    // Always cleanup resources
    await snsPublish.dispose();
  }
}
```

### Pattern 1: Default Operation Factory

Simplest approach for one-off operations with full middleware configuration.

```typescript
import {
  createDefaultOperation,
  MemoryCacheProvider,
  createCircuitBreakerMiddleware,
  createRetryMiddleware,
  createBackpressureMiddleware,
  createBatchMiddleware,
  OPERATION_DEFAULTS,
} from '@fed-etl/integration-factory';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Configure middleware
const factory = createOperationFactory()
  // Logging & Monitoring
  .use(
    createLoggingMiddleware({
      level: 'info',
      redactKeys: ['credentials', 'password'],
    }),
  )
  .use(
    createTelemetryMiddleware({
      serviceName: 'etl-processor',
      environment: 'production',
    }),
  )

  // Operation Control
  .use(
    createTimeoutMiddleware({
      timeout: 30000,
      onTimeout: async (ctx) =>
        console.error(`Operation timed out: ${ctx.operation}`),
    }),
  )
  .use(
    createLockMiddleware({
      ttl: 60000,
      retries: 3,
    }),
  )

  // Reliability
  .use(
    createCircuitBreakerMiddleware({
      errorThresholdPercentage: 50,
      resetTimeout: 30000,
      onStateChange: (from, to) =>
        console.log(`Circuit state changed: ${from} -> ${to}`),
    }),
  )
  .use(
    createRetryMiddleware({
      maxAttempts: 3,
      strategy: 'exponential',
      shouldRetry: (error) => error.name !== 'ValidationError',
    }),
  )

  // Performance
  .use(
    createCacheMiddleware(new MemoryCacheProvider(), {
      ttl: 300,
      keyPrefix: 's3:objects:',
    }),
  )
  .use(
    createRateLimitMiddleware({
      limit: 100,
      window: 1000,
      strategy: 'sliding',
    }),
  )
  .use(
    createBackpressureMiddleware({
      maxConcurrent: 10,
      maxQueueSize: 100,
      shedStrategy: 'reject',
    }),
  )
  .use(
    createBatchMiddleware({
      maxBatchSize: 100,
      maxBatchBytes: 5 * 1024 * 1024, // 5MB
      concurrency: 3,
    }),
  );

// Example operation with all middleware features
export const getS3Objects = async (bucket: string, keys: string[]) => {
  const operation = createDefaultOperation(
    'GetObjects',
    'S3',
    async (context: OperationContext) => {
      const client = new S3Client({});

      // Batch processing will handle array of keys
      context.metadata.items = keys.map((key) => ({
        Bucket: bucket,
        Key: key,
      }));

      // Lock operation by bucket
      context.metadata.lockKey = `s3:${bucket}`;

      // Custom cache key
      context.metadata.cacheKey = `s3:${bucket}:${keys.join(',')}`;

      return client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: keys[0], // Batch middleware will handle multiple keys
        }),
      );
    },
  );

  const result = await operation.execute();

  if (!result.success) {
    // Type-safe error handling
    const error = result.error;
    switch (error.code) {
      case 'TIMEOUT':
        throw new Error(
          `S3 operation timed out after ${result.metadata.timeoutMs}ms`,
        );
      case 'CIRCUIT_OPEN':
        throw new Error(`Circuit breaker open: ${error.message}`);
      case 'RATE_LIMIT':
        throw new Error(`Rate limit exceeded: ${error.message}`);
      default:
        throw error;
    }
  }

  // Access middleware-specific metadata
  console.log({
    cacheHit: result.metadata.cache?.hit,
    batchMetrics: result.metadata.batch?.metrics,
    circuitState: result.metadata.circuit?.state,
    retryAttempts: result.metadata.retry?.attempts,
    queueTime: result.metadata.backpressure?.queueTime,
  });

  return result.data;
};
```

### Pattern 2: Builder Pattern

Best for operations needing custom configuration with fine-grained middleware control.

```typescript
import {
  defaultFactory,
  MemoryCacheProvider,
  CircuitState,
  OPERATION_DEFAULTS,
} from '@fed-etl/integration-factory';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

export class DynamoDBService {
  private readonly client: DynamoDBClient;

  constructor() {
    this.client = new DynamoDBClient({});

    // Configure factory with all middleware
    defaultFactory
      .use(
        createLoggingMiddleware({
          level: 'info',
          redactKeys: ['password', 'token'],
        }),
      )
      .use(
        createTelemetryMiddleware({
          serviceName: 'dynamo-service',
          environment: process.env.NODE_ENV,
        }),
      )
      .use(
        createTimeoutMiddleware({
          timeout: 5000,
          onTimeout: async (ctx) => {
            // Custom timeout handling
            await this.handleTimeout(ctx);
          },
        }),
      )
      .use(
        createLockMiddleware({
          ttl: 30000,
          prefix: 'dynamo:lock:',
        }),
      )
      .use(
        createCircuitBreakerMiddleware({
          errorThresholdPercentage: 50,
          resetTimeout: 30000,
          onStateChange: (from, to) => {
            if (to === CircuitState.OPEN) {
              this.notifyOperationsTeam('Circuit opened', { from, to });
            }
          },
        }),
      )
      .use(createCacheMiddleware(new MemoryCacheProvider()))
      .use(
        createRateLimitMiddleware({
          limit: 40000, // DynamoDB default RCU
          window: 1000,
        }),
      )
      .use(
        createBackpressureMiddleware({
          maxConcurrent: 100,
          shedStrategy: 'drop-oldest',
        }),
      )
      .use(
        createBatchMiddleware({
          maxBatchSize: 25, // DynamoDB batch limit
          concurrency: 4,
        }),
      );
  }

  async queryItems(table: string, keys: Record<string, any>[]) {
    const operation = defaultFactory
      .createOperation(
        'BatchQuery',
        'DynamoDB',
        async (context: OperationContext) => {
          // Add items for batch processing
          context.metadata.items = keys;

          // Set lock key based on table
          context.metadata.lockKey = `table:${table}`;

          // Custom cache key per query
          context.metadata.cacheKey = `query:${table}:${JSON.stringify(keys)}`;

          // Add custom telemetry attributes
          context.metadata.telemetry = {
            tableArn: `arn:aws:dynamodb:${this.region}:${this.accountId}:table/${table}`,
            itemCount: keys.length,
          };

          const command = new QueryCommand({
            TableName: table,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: { ':pk': keys[0] },
          });

          return this.client.send(command);
        },
      )
      .withTimeout(OPERATION_DEFAULTS.TIMEOUT)
      .withRetries({
        maxAttempts: 3,
        strategy: 'exponential',
        shouldRetry: (error) => {
          return error.name === 'ProvisionedThroughputExceededException';
        },
      })
      .withCache(`dynamo:${table}`, 300)
      .withMetadata({
        importance: 'high',
        costCenter: 'etl-platform',
      });

    const result = await operation.execute();

    if (!result.success) {
      this.handleOperationError(result.error, table, keys);
      throw result.error;
    }

    // Log middleware metrics
    this.logger.info('Operation completed', {
      table,
      cacheHit: result.metadata.cache?.hit,
      retryCount: result.metadata.retry?.attempts,
      batchMetrics: result.metadata.batch?.metrics,
      backpressureQueueTime: result.metadata.backpressure?.queueTime,
      circuitState: result.metadata.circuit?.state,
    });

    return result.data;
  }

  private handleOperationError(
    error: OperationError,
    table: string,
    keys: any[],
  ) {
    switch (error.code) {
      case 'CIRCUIT_OPEN':
        this.notifyOperationsTeam('DynamoDB circuit opened', { table });
        break;
      case 'RATE_LIMIT':
        this.scaleUpCapacity(table);
        break;
      case 'LOCK_TIMEOUT':
        this.handleLockTimeout(table);
        break;
      default:
        this.logError('Unhandled operation error', error);
    }
  }
}
```

### Pattern 3: Decorator Pattern

Best for service-oriented architectures with declarative middleware configuration.

```typescript
import {
  CloudOperation,
  WithTimeout,
  WithRetries,
  WithCache,
  WithCircuitBreaker,
  WithRateLimit,
  WithBackpressure,
  WithBatch,
  WithLock,
  composeDecorators,
  OPERATION_DEFAULTS,
} from '@fed-etl/integration-factory';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@CloudOperation({
  service: 'SQS',
  telemetry: {
    serviceName: 'message-processor',
    environment: process.env.NODE_ENV,
  },
  logging: {
    level: 'info',
    redactKeys: ['messageContent'],
  },
})
export class SQSService {
  private readonly client: SQSClient;

  constructor() {
    this.client = new SQSClient({});
  }

  // Example with individual decorators
  @WithTimeout(5000)
  @WithRetries({
    maxAttempts: 3,
    strategy: 'exponential',
  })
  @WithCache('sqs:messages', 300)
  @WithCircuitBreaker({
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  })
  async sendMessage(
    queueUrl: string,
    message: string,
    context: OperationContext,
  ) {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: message,
    });

    return this.client.send(command);
  }

  // Example with composed decorators for batch operations
  @composeDecorators(
    WithTimeout(OPERATION_DEFAULTS.TIMEOUT),
    WithRetries({
      maxAttempts: 3,
      strategy: 'decorrelated',
      shouldRetry: (error) => {
        return error.name !== 'MessageSizeTooLarge';
      },
    }),
    WithLock({
      ttl: 60000,
      prefix: 'sqs:batch:',
    }),
    WithCircuitBreaker({
      errorThresholdPercentage: 50,
      degradationThreshold: 5000,
      onStateChange: (from, to, metrics) => {
        if (to === 'OPEN') {
          console.error('Circuit opened', metrics);
        }
      },
    }),
    WithRateLimit({
      limit: 100,
      window: 1000,
      strategy: 'sliding',
    }),
    WithBackpressure({
      maxConcurrent: 10,
      maxQueueSize: 1000,
      shedStrategy: 'reject',
    }),
    WithBatch({
      maxBatchSize: 10,
      maxBatchBytes: 256 * 1024, // 256KB SQS limit
      concurrency: 3,
      retryFailedItems: true,
    }),
    WithCache('sqs:batch:messages', 300),
  )
  async sendBatchMessages(
    queueUrl: string,
    messages: string[],
    context: OperationContext,
  ) {
    // Batch middleware will handle message batching
    context.metadata.items = messages.map((message) => ({
      QueueUrl: queueUrl,
      MessageBody: message,
    }));

    // Lock based on queue URL
    context.metadata.lockKey = `queue:${queueUrl}`;

    // Custom cache key including queue
    context.metadata.cacheKey = `batch:${queueUrl}:${Date.now()}`;

    const command = new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: messages.map((msg, idx) => ({
        Id: `msg-${idx}`,
        MessageBody: msg,
      })),
    });

    const result = await this.client.send(command);

    // Enhanced error handling with middleware context
    if (result.Failed?.length) {
      this.handleFailedMessages(result.Failed, context);
    }

    return result;
  }

  // Example using class-level decorator with method-specific overrides
  @CloudOperation({
    name: 'ReceiveMessages',
    timeout: 20000,
    cache: {
      ttl: 60, // 1 minute cache for received messages
    },
  })
  async receiveMessages(
    queueUrl: string,
    maxMessages: number = 10,
    context: OperationContext,
  ) {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20,
    });

    return this.client.send(command);
  }

  // Utility methods for error handling
  private handleFailedMessages(
    failedMessages: BatchResultErrorEntry[],
    context: OperationContext,
  ) {
    const retryMetadata = context.metadata.retry;
    const circuitState = context.metadata.circuit?.state;
    const queueMetrics = context.metadata.backpressure;

    this.logger.error('Failed to process messages', {
      failedCount: failedMessages.length,
      retryAttempt: retryMetadata?.attempts,
      circuitState,
      queueDepth: queueMetrics?.queueSize,
      errors: failedMessages.map((f) => ({
        id: f.Id,
        code: f.Code,
        message: f.Message,
      })),
    });

    // Handle specific failure cases
    failedMessages.forEach((failure) => {
      switch (failure.Code) {
        case 'MessageTooLarge':
          this.handleOversizedMessage(failure);
          break;
        case 'BatchEntryIdsNotDistinct':
          this.handleDuplicateId(failure);
          break;
        default:
          this.queueForRetry(failure);
      }
    });
  }
}

// Example usage of the service
async function processingExample() {
  const sqsService = new SQSService();

  try {
    // Single message send
    const result = await sqsService.sendMessage(
      'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
      JSON.stringify({ data: 'test' }),
    );

    // Batch message send
    const batchResult = await sqsService.sendBatchMessages(
      'https://sqs.us-east-1.amazonaws.com/123456789012/MyQueue',
      Array(100).fill('test message'),
    );

    // Access middleware metadata
    console.log({
      singleMessageMetrics: {
        cached: result.metadata.cache?.hit,
        retries: result.metadata.retry?.attempts,
        circuitState: result.metadata.circuit?.state,
        rateLimit: result.metadata.rateLimit?.remaining,
      },
      batchMetrics: {
        processedItems: batchResult.metadata.batch?.metrics.totalItems,
        queueTime: batchResult.metadata.backpressure?.queueTime,
        circuitState: batchResult.metadata.circuit?.state,
      },
    });
  } catch (error) {
    if (error instanceof OperationError) {
      switch (error.code) {
        case 'CIRCUIT_OPEN':
          await handleCircuitOpen(error);
          break;
        case 'RATE_LIMIT':
          await handleRateLimit(error);
          break;
        case 'BATCH_FAILED':
          await handleBatchFailure(error);
          break;
        default:
          throw error;
      }
    }
  }
}
```

## Design Principles

1. **Separation of Concerns**: Each middleware component handles a specific cross-cutting concern.
2. **Extensibility**: The system is designed to be easily extended with new middleware components.
3. **Type Safety**: Comprehensive TypeScript types ensure type safety throughout the system.
4. **Error Handling**: Structured error handling with severity levels and specific error codes.
5. **Configuration**: Flexible configuration system allowing for fine-grained control.

## Performance Considerations

- Middleware execution order is optimized based on priority
- Caching is implemented with configurable TTL
- Circuit breaker prevents cascade failures
- Distributed locking ensures resource exclusivity
- Operation context maintains minimal necessary state

## File index

Sure, here's a mapping table of all the files you've provided. This will help reference specific code snippets and their corresponding files in future discussions.

| **File Path**                           | **File Name**        | **Description**                            |
| --------------------------------------- | -------------------- | ------------------------------------------ |
| `core/errors.ts`                        | `errors.ts`          | Defines custom error classes and enums     |
| `core/index.ts`                         | `index.ts`           | Re-exports core modules                    |
| `core/config.ts`                        | `config.ts`          | Configuration loader                       |
| `core/constants-types.ts`               | `constants-types.ts` | Core types and constants                   |
| `core/awsErrorMapper.ts`                | `awsErrorMapper.ts`  | Maps AWS errors to `FactoryError`          |
| `operations/index.ts`                   | `index.ts`           | Re-exports operations modules              |
| `operations/types.ts`                   | `types.ts`           | Types for operations                       |
| `operations/builder.ts`                 | `builder.ts`         | Operation builder implementation           |
| `operations/decorators.ts`              | `decorators.ts`      | Decorator functions for operations         |
| `operations/factory.ts`                 | `factory.ts`         | Operation factory implementation           |
| `readme.md`                             | `readme.md`          | Documentation for the factory system       |
| `aws/aws.ts`                            | `aws.ts`             | AWS command wrapper utilities              |
| `aws/index.ts`                          | `index.ts`           | Exports AWS wrappers                       |
| `flowbuilder/flowbuilder.ts`            | `flowbuilder.ts`     | IntegrationFactory utilities               |
| `middleware/base.ts`                    | `base.ts`            | Base middleware interfaces and utilities   |
| `middleware/cache/middleware.ts`        | `middleware.ts`      | Cache middleware implementation            |
| `middleware/cache/types.ts`             | `types.ts`           | Cache middleware types                     |
| `middleware/cache/index.ts`             | `index.ts`           | Cache middleware exports                   |
| `middleware/retry/middleware.ts`        | `middleware.ts`      | Retry middleware implementation            |
| `middleware/retry/types.ts`             | `types.ts`           | Retry middleware types                     |
| `middleware/retry/index.ts`             | `index.ts`           | Retry middleware exports                   |
| `middleware/circuit/middleware.ts`      | `middleware.ts`      | Circuit breaker middleware implementation  |
| `middleware/circuit/types.ts`           | `types.ts`           | Circuit middleware types                   |
| `middleware/circuit/index.ts`           | `index.ts`           | Circuit middleware exports                 |
| `middleware/timeout/middleware.ts`      | `middleware.ts`      | Timeout middleware implementation          |
| `middleware/timeout/types.ts`           | `types.ts`           | Timeout middleware types                   |
| `middleware/timeout/index.ts`           | `index.ts`           | Timeout middleware exports                 |
| `middleware/lock/middleware.ts`         | `middleware.ts`      | Lock middleware implementation             |
| `middleware/lock/types.ts`              | `types.ts`           | Lock middleware types                      |
| `middleware/lock/index.ts`              | `index.ts`           | Lock middleware exports                    |
| `middleware/backpressure/middleware.ts` | `middleware.ts`      | Backpressure middleware implementation     |
| `middleware/backpressure/types.ts`      | `types.ts`           | Backpressure middleware types              |
| `middleware/backpressure/index.ts`      | `index.ts`           | Backpressure middleware exports            |
| `middleware/ratelimit/middleware.ts`    | `middleware.ts`      | Rate limit middleware implementation       |
| `middleware/ratelimit/types.ts`         | `types.ts`           | Rate limit middleware types                |
| `middleware/ratelimit/index.ts`         | `index.ts`           | Rate limit middleware exports              |
| `middleware/batch/middleware.ts`        | `middleware.ts`      | Batch processing middleware implementation |
| `middleware/batch/types.ts`             | `types.ts`           | Batch processing types                     |
| `middleware/batch/index.ts`             | `index.ts`           | Batch processing middleware exports        |
| `middleware/telemetry/middleware.ts`    | `middleware.ts`      | Telemetry middleware implementation        |
| `middleware/telemetry/types.ts`         | `types.ts`           | Telemetry middleware types                 |
| `middleware/telemetry/index.ts`         | `index.ts`           | Telemetry middleware exports               |
| `middleware/logging/middleware.ts`      | `middleware.ts`      | Logging middleware implementation          |
| `middleware/logging/types.ts`           | `types.ts`           | Logging middleware types                   |
| `middleware/logging/index.ts`           | `index.ts`           | Logging middleware exports                 |
| `middleware/index.ts`                   | `index.ts`           | Re-exports all middleware modules          |

**Notes:**

- Multiple `index.ts` and `middleware.ts` files exist within different subdirectories (`cache`, `retry`, `circuit`, etc.). Each is scoped within its respective folder.
- Common patterns such as middleware creation, type definitions, and exports are consistently organized across different middleware functionalities.
