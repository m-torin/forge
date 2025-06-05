# @repo/orchestration-new

Modern orchestration package with enhanced workflow patterns, rate limiting, and provider system.

## Overview

This package provides a next-generation orchestration system built on top of Upstash QStash and Workflow, with additional features:

- **Rate Limiting** - Upstash Redis-based rate limiting with multiple algorithms
- **Workflow Patterns** - Reusable patterns (batch, retry, circuit breaker, saga)
- **Provider System** - Extensible provider architecture
- **Enhanced Monitoring** - Built-in observability and tracking
- **Type Safety** - Full TypeScript support with Zod validation

## Architecture

```
/src
  /providers          - Provider implementations
    /upstash         - Upstash Workflow provider
    /rate-limit      - Rate limiting provider
  /shared            
    /patterns        - Reusable workflow patterns
    /types           - Shared type definitions
    /utils           - Utility functions
  /client            - Client-side exports
  /server            - Server-side exports
```

## Features

### Rate Limiting

Multiple rate limiting strategies powered by Upstash Redis:

- **Sliding Window** - Smooth rate limiting
- **Token Bucket** - Burst capacity support
- **Fixed Window** - Simple time-based limits
- **Leaky Bucket** - Constant rate processing

### Workflow Patterns

Built-in patterns for common scenarios:

- **Batch Processing** - Process large datasets efficiently
- **Retry Logic** - Configurable retry strategies
- **Circuit Breaker** - Prevent cascading failures
- **Saga Pattern** - Distributed transaction management
- **Parallel Execution** - Concurrent task processing
- **Sequential Pipeline** - Step-by-step processing

### Provider System

Extensible provider architecture:

- **Upstash Provider** - QStash workflow integration
- **Rate Limit Provider** - Redis-based rate limiting
- **Custom Providers** - Extend with your own providers

## Quick Start

### Basic Workflow

```typescript
import { createOrchestration } from '@repo/orchestration-new/server';

const orchestration = await createOrchestration({
  providers: {
    upstash: {
      token: process.env.QSTASH_TOKEN,
      url: process.env.UPSTASH_WORKFLOW_URL
    },
    rateLimit: {
      redis: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      }
    }
  }
});

// Create a workflow
const workflow = orchestration.createWorkflow('process-orders', async (ctx) => {
  // Your workflow logic
  await ctx.run('fetch-orders', async () => {
    return await fetchOrders();
  });
  
  await ctx.sleep('wait', 5);
  
  await ctx.run('process', async () => {
    // Process orders
  });
});
```

### With Rate Limiting

```typescript
import { withRateLimit } from '@repo/orchestration-new/patterns';

const workflow = orchestration.createWorkflow('api-calls', 
  withRateLimit({
    key: 'external-api',
    limit: 100,
    window: '1m',
    algorithm: 'sliding'
  }, async (ctx) => {
    // Rate-limited workflow
    await ctx.call('api', {
      url: 'https://api.example.com/data'
    });
  })
);
```

### Using Patterns

```typescript
import { batch, retry, circuitBreaker } from '@repo/orchestration-new/patterns';

// Batch processing
const processBatch = batch({
  batchSize: 100,
  delay: '2s',
  maxConcurrency: 5
});

// Retry with exponential backoff
const resilientCall = retry({
  attempts: 3,
  backoff: 'exponential',
  onRetry: (error, attempt) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  }
});

// Circuit breaker
const protectedCall = circuitBreaker({
  threshold: 5,
  timeout: 60000,
  resetTimeout: 30000
});
```

## Installation

```bash
pnpm add @repo/orchestration-new
```

## Configuration

### Environment Variables

```env
# Upstash QStash
QSTASH_TOKEN=your-token
QSTASH_URL=https://qstash.upstash.io
UPSTASH_WORKFLOW_URL=https://your-app.com

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Optional
QSTASH_CURRENT_SIGNING_KEY=your-signing-key
QSTASH_NEXT_SIGNING_KEY=your-next-signing-key
```

## API Reference

### Core APIs

- `createOrchestration(config)` - Create orchestration instance
- `createWorkflow(name, handler)` - Define a workflow
- `withRateLimit(options, handler)` - Apply rate limiting
- `withRetry(options, handler)` - Apply retry logic
- `withCircuitBreaker(options, handler)` - Apply circuit breaker

### Patterns

- `batch(options)` - Batch processing pattern
- `retry(options)` - Retry pattern
- `circuitBreaker(options)` - Circuit breaker pattern
- `saga(options)` - Saga pattern for distributed transactions
- `parallel(tasks)` - Parallel execution
- `pipeline(steps)` - Sequential pipeline

### Providers

- `UpstashProvider` - QStash workflow provider
- `RateLimitProvider` - Redis rate limiting provider

## Best Practices

1. **Use descriptive workflow names** - Helps with debugging and monitoring
2. **Apply rate limiting** - Protect external services
3. **Handle errors gracefully** - Use retry and circuit breaker patterns
4. **Monitor workflows** - Track execution and performance
5. **Test locally** - Use QStash CLI for local development
6. **Secure endpoints** - Use signing keys in production

## Migration from @repo/orchestration

This package is designed to coexist with the existing orchestration package. Key differences:

1. **Provider-based architecture** - More extensible
2. **Built-in rate limiting** - No external dependencies
3. **Enhanced patterns** - More workflow patterns out of the box
4. **Better TypeScript support** - Improved type inference
5. **Simplified API** - Easier to use

To migrate:
1. Update imports to `@repo/orchestration-new`
2. Update configuration to use provider system
3. Apply new patterns where applicable