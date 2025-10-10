# @repo/db-upstash-redis

Upstash Redis client with rate limiting and edge runtime support.

## Features

- 🚀 Upstash Redis REST API integration
- 🌐 Multi-runtime support (Node.js, Edge, Browser, Worker)
- ⚡ Built-in rate limiting with multiple algorithms
- 📦 TypeScript-first with complete type safety
- 🛡️ Connection pooling and retry logic
- 📊 Session storage and distributed locking
- 🔄 Pipeline and batch operations
- 📈 Performance monitoring and metrics

## Installation

```bash
pnpm add @repo/db-upstash-redis
```

## Quick Start

### Basic Redis Operations

```typescript
import { Redis } from "@upstash/redis";
import { createOptimizedConfig } from "@repo/db-upstash-redis/config";

// Create optimized client for current runtime
const config = createOptimizedConfig("nodejs", {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const redis = new Redis(config);

// Basic operations
await redis.set("key", "value", { ex: 3600 }); // Expire in 1 hour
const value = await redis.get("key");
await redis.del("key");
```

### Rate Limiting

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { commonRateLimits } from "@repo/db-upstash-redis/config";

// Create rate limiter for API endpoints
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    commonRateLimits.moderate.requests,
    commonRateLimits.moderate.window
  )
});

// Check rate limit
const { success, limit, remaining, reset } = await ratelimit.limit("user-123");

if (!success) {
  throw new Error("Rate limit exceeded");
}
```

## Configuration

### Environment Variables

```bash
# Upstash Redis configuration
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Optional settings
UPSTASH_DISABLE_TELEMETRY=false
UPSTASH_DISABLE_AUTO_PIPELINING=false
UPSTASH_DISABLE_READ_YOUR_WRITES=false
```

### Runtime-Optimized Configurations

```typescript
import {
  createOptimizedConfig,
  detectRuntime
} from "@repo/db-upstash-redis/config";

// Automatically detect and optimize for current runtime
const runtime = detectRuntime();
const config = createOptimizedConfig(runtime, {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

// Different runtimes get different optimizations:
// - Node.js: Full features, connection pooling
// - Edge: Reduced retries, no pipelining for speed
// - Browser: Privacy-focused, moderate retries
// - Worker: Minimal features for performance
```

## Advanced Features

### Session Storage

```typescript
import type { SessionStore } from "@repo/db-upstash-redis";

class RedisSessionStore implements SessionStore {
  constructor(
    private redis: Redis,
    private ttl = 3600
  ) {}

  async get(sessionId: string) {
    return await this.redis.get(`session:${sessionId}`);
  }

  async set(sessionId: string, data: any, ttl = this.ttl) {
    await this.redis.set(`session:${sessionId}`, data, { ex: ttl });
  }

  async destroy(sessionId: string) {
    await this.redis.del(`session:${sessionId}`);
  }

  async touch(sessionId: string, ttl = this.ttl) {
    await this.redis.expire(`session:${sessionId}`, ttl);
  }

  async exists(sessionId: string) {
    return (await this.redis.exists(`session:${sessionId}`)) === 1;
  }
}
```

### Distributed Locking

```typescript
import type { LockOptions, LockResult } from "@repo/db-upstash-redis";

async function acquireLock(
  redis: Redis,
  resource: string,
  options: LockOptions = {}
): Promise<LockResult> {
  const lockKey = `lock:${resource}`;
  const lockId = crypto.randomUUID();
  const ttl = options.ttl || 30;

  // Try to acquire lock
  const acquired = await redis.set(lockKey, lockId, {
    ex: ttl,
    nx: true
  });

  if (acquired === "OK") {
    return {
      acquired: true,
      lockId,
      ttl,
      extend: async (additionalTtl: number) => {
        const current = await redis.get(lockKey);
        if (current === lockId) {
          await redis.expire(lockKey, ttl + additionalTtl);
          return true;
        }
        return false;
      },
      release: async () => {
        const script = `
          if redis.call("get", KEYS[1]) == ARGV[1] then
            return redis.call("del", KEYS[1])
          else
            return 0
          end
        `;
        const result = await redis.eval(script, [lockKey], [lockId]);
        return result === 1;
      }
    };
  }

  return { acquired: false };
}
```

### Pipeline Operations

```typescript
import type { RedisPipelineResult } from "@repo/db-upstash-redis";

async function executePipeline(
  redis: Redis,
  operations: Array<() => Promise<any>>
): Promise<RedisPipelineResult> {
  const pipeline = redis.pipeline();

  // Add operations to pipeline
  operations.forEach((op) => pipeline.exec());

  try {
    const results = await pipeline.exec();
    return {
      results,
      errors: results.map(() => null),
      success: true
    };
  } catch (error) {
    return {
      results: [],
      errors: [error as Error],
      success: false
    };
  }
}
```

## Common Rate Limit Configurations

```typescript
import { commonRateLimits } from "@repo/db-upstash-redis/config";

// Pre-configured rate limits for common scenarios
const limits = {
  // API endpoints
  strict: commonRateLimits.strict, // 10 req/min
  moderate: commonRateLimits.moderate, // 100 req/min
  lenient: commonRateLimits.lenient, // 1000 req/min

  // User actions
  login: commonRateLimits.login, // 5 req/15min
  signup: commonRateLimits.signup, // 3 req/hour
  passwordReset: commonRateLimits.passwordReset, // 3 req/hour

  // Content creation
  posts: commonRateLimits.posts, // 10 req/hour
  comments: commonRateLimits.comments, // 30 req/hour
  uploads: commonRateLimits.uploads // 20 req/hour
};
```

## Runtime Support

### Node.js

Full feature support with connection pooling and auto-pipelining.

### Edge Runtime

Optimized for Vercel Edge Functions with reduced retries and disabled pipelining
for minimal latency.

### Browser

Privacy-conscious configuration with telemetry disabled.

### Web Workers

Minimal configuration optimized for performance.

## TypeScript Support

Complete TypeScript support with all Upstash Redis types:

```typescript
import type {
  UpstashRedisConfig,
  RateLimitConfig,
  LockResult,
  SessionStore
} from "@repo/db-upstash-redis";
```

## Best Practices

1. **Use rate limiting** - Protect your APIs with appropriate limits
2. **Configure per runtime** - Use optimized settings for each environment
3. **Handle failures gracefully** - Implement retry logic and fallbacks
4. **Monitor performance** - Track connection health and latency
5. **Secure tokens** - Never expose Redis tokens in client-side code

## Contributing

This package follows the monorepo conventions. See the main README for
development guidelines.
