# Integrations Extended Guide

Comprehensive patterns, best practices, and examples for external service integration specialist.

## Table of Contents

1. [Detailed API Client Patterns](#detailed-api-client-patterns)
2. [Webhook Handling Patterns](#webhook-handling-patterns)
3. [Rate Limiting and Retry Strategies](#rate-limiting-and-retry-strategies)
4. [Error Handling and Circuit Breakers](#error-handling-and-circuit-breakers)
5. [Credential Management](#credential-management)
6. [Common Integration Workflows](#common-integration-workflows)
7. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed API Client Patterns

### Pattern 1: Typed Stripe Client

```typescript
// packages/pkgs-integrations/3p-stripe/src/client.ts
import Stripe from 'stripe';
import { z } from 'zod';
import { env } from './env';

const StripeCustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  created: z.number(),
  metadata: z.record(z.string()).optional()
});

const StripePaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum([
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
    'succeeded',
    'canceled'
  ]),
  client_secret: z.string().optional()
});

export class StripeClient {
  private client: Stripe;

  constructor() {
    this.client = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-01-01',
      timeout: 30000,
      maxNetworkRetries: 3
    });
  }

  async createCustomer(params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const customer = await this.client.customers.create(params);
      return StripeCustomerSchema.parse(customer);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new IntegrationError('Stripe', error.message, error.statusCode);
      }
      throw error;
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }) {
    const idempotencyKey = `pi_${Date.now()}_${params.customerId || 'guest'}`;

    try {
      const paymentIntent = await this.client.paymentIntents.create(
        {
          amount: params.amount,
          currency: params.currency,
          customer: params.customerId,
          metadata: params.metadata,
          automatic_payment_methods: { enabled: true }
        },
        { idempotencyKey }
      );

      return StripePaymentIntentSchema.parse(paymentIntent);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new IntegrationError('Stripe', error.message, error.statusCode);
      }
      throw error;
    }
  }

  async getCustomer(id: string) {
    try {
      const customer = await this.client.customers.retrieve(id);
      return StripeCustomerSchema.parse(customer);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        if (error.statusCode === 404) {
          return null;
        }
        throw new IntegrationError('Stripe', error.message, error.statusCode);
      }
      throw error;
    }
  }
}

// Singleton instance
export const stripe = new StripeClient();
```

### Pattern 2: Upstash Redis Client

```typescript
// packages/pkgs-integrations/3p-upstash/src/redis.ts
import { Redis } from '@upstash/redis';
import { env } from './env';

export class UpstashRedis {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get<T>(key);
      return value;
    } catch (error) {
      console.error(`[Redis] GET error for key "${key}":`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ex?: number; nx?: boolean }
  ): Promise<boolean> {
    try {
      if (options?.nx) {
        const result = await this.client.set(key, value, {
          nx: true,
          ex: options.ex
        });
        return result === 'OK';
      }

      await this.client.set(key, value, options?.ex ? { ex: options.ex } : {});
      return true;
    } catch (error) {
      console.error(`[Redis] SET error for key "${key}":`, error);
      return false;
    }
  }

  async del(...keys: string[]): Promise<number> {
    try {
      return await this.client.del(...keys);
    } catch (error) {
      console.error(`[Redis] DEL error for keys:`, keys, error);
      return 0;
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`[Redis] INCR error for key "${key}":`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result === 1;
    } catch (error) {
      console.error(`[Redis] EXPIRE error for key "${key}":`, error);
      return false;
    }
  }
}

export const redis = new UpstashRedis();
```

### Pattern 3: Hotelbeds API Client

```typescript
// packages/pkgs-integrations/3p-hotelbeds/src/client.ts
import { z } from 'zod';
import { createHmac } from 'crypto';
import { env } from './env';
import { withRetry } from '@repo/3p-core/composable/with-retry';

const HotelbedsHotelSchema = z.object({
  code: z.number(),
  name: z.string(),
  destinationCode: z.string(),
  zoneCode: z.number(),
  latitude: z.string(),
  longitude: z.string(),
  categoryCode: z.string(),
  accommodationTypeCode: z.string()
});

const HotelbedsSearchResponseSchema = z.object({
  hotels: z.array(HotelbedsHotelSchema),
  total: z.number()
});

export class HotelbedsClient {
  private readonly apiUrl = 'https://api.test.hotelbeds.com/hotel-api/1.0';
  private readonly apiKey = env.HOTELBEDS_API_KEY;
  private readonly secret = env.HOTELBEDS_SECRET;

  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${this.apiKey}${this.secret}${timestamp}`;
    return createHmac('sha256', this.secret)
      .update(message)
      .digest('hex');
  }

  async searchHotels(params: {
    destination: string;
    checkIn: string;
    checkOut: string;
    occupancies: Array<{ adults: number; children?: number }>;
  }) {
    return withRetry(
      async () => {
        const signature = this.generateSignature();

        const response = await fetch(`${this.apiUrl}/hotels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': this.apiKey,
            'X-Signature': signature,
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip'
          },
          body: JSON.stringify({
            stay: {
              checkIn: params.checkIn,
              checkOut: params.checkOut
            },
            occupancies: params.occupancies,
            destination: {
              code: params.destination
            }
          }),
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new IntegrationError(
            'Hotelbeds',
            `API error: ${response.status} - ${errorText}`,
            response.status
          );
        }

        const data = await response.json();
        return HotelbedsSearchResponseSchema.parse(data);
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        shouldRetry: (error) => {
          // Retry on 429 (rate limit) or 5xx errors
          return error.statusCode === 429 || (error.statusCode >= 500 && error.statusCode < 600);
        }
      }
    );
  }
}

export const hotelbeds = new HotelbedsClient();
```

---

## Webhook Handling Patterns

### Pattern 1: Stripe Webhook with Signature Verification

```typescript
// packages/pkgs-integrations/3p-stripe/src/webhooks.ts
import Stripe from 'stripe';
import { env } from './env';
import { z } from 'zod';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-01-01'
});

const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  created: z.number()
});

export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Validate event structure
    const validatedEvent = StripeWebhookEventSchema.parse(event);

    console.info(`[Stripe Webhook] Received: ${validatedEvent.type}`);

    // Handle different event types
    switch (validatedEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(validatedEvent.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(validatedEvent.data.object);
        break;

      case 'customer.created':
        await handleCustomerCreated(validatedEvent.data.object);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(validatedEvent.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(validatedEvent.data.object);
        break;

      default:
        console.warn(`[Stripe Webhook] Unhandled event type: ${validatedEvent.type}`);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('[Stripe Webhook] Signature verification failed:', error.message);
      return { success: false, error: 'Invalid signature' };
    }

    console.error('[Stripe Webhook] Processing error:', error);
    return { success: false, error: 'Processing failed' };
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.info(`[Stripe] Payment succeeded: ${paymentIntent.id}`);

  // Update order status in database
  // Send confirmation email
  // Log to analytics
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  console.error(`[Stripe] Payment failed: ${paymentIntent.id}`);

  // Update order status
  // Notify customer
  // Alert support team
}

async function handleCustomerCreated(customer: any) {
  console.info(`[Stripe] Customer created: ${customer.id}`);

  // Sync customer to database
  // Send welcome email
}

async function handleCustomerUpdated(customer: any) {
  console.info(`[Stripe] Customer updated: ${customer.id}`);

  // Update customer in database
}

async function handleChargeRefunded(charge: any) {
  console.info(`[Stripe] Charge refunded: ${charge.id}`);

  // Update order status
  // Process refund
  // Notify customer
}
```

### Pattern 2: Webhook Replay Protection

```typescript
// packages/pkgs-integrations/3p-core/src/webhook-replay-protection.ts
import { redis } from '@repo/3p-upstash';

const WEBHOOK_TTL = 60 * 60; // 1 hour

export async function isWebhookProcessed(
  webhookId: string
): Promise<boolean> {
  const key = `webhook:processed:${webhookId}`;
  const exists = await redis.get<boolean>(key);
  return exists === true;
}

export async function markWebhookProcessed(
  webhookId: string
): Promise<void> {
  const key = `webhook:processed:${webhookId}`;
  await redis.set(key, true, { ex: WEBHOOK_TTL });
}

export async function processWebhookOnce<T>(
  webhookId: string,
  handler: () => Promise<T>
): Promise<T | null> {
  // Check if already processed
  if (await isWebhookProcessed(webhookId)) {
    console.info(`[Webhook] Already processed: ${webhookId}`);
    return null;
  }

  // Mark as processed first (prevents double processing)
  await markWebhookProcessed(webhookId);

  try {
    // Process webhook
    return await handler();
  } catch (error) {
    // Remove processed mark on error (allow retry)
    const key = `webhook:processed:${webhookId}`;
    await redis.del(key);
    throw error;
  }
}

// Usage
export async function handleWebhook(event: WebhookEvent) {
  return processWebhookOnce(event.id, async () => {
    // Actual webhook processing logic
    await processEvent(event);
    return { success: true };
  });
}
```

---

## Rate Limiting and Retry Strategies

### Pattern 1: Exponential Backoff with Jitter

```typescript
// packages/pkgs-integrations/3p-core/src/composable/with-retry.ts
export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: 2^attempt * baseDelay
  const exponentialDelay = Math.pow(2, attempt) * baseDelay;

  // Add jitter (random 0-100ms) to prevent thundering herd
  const jitter = Math.random() * 100;

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!shouldRetry(error)) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, baseDelay, maxDelay);
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`,
        error.message
      );

      await sleep(delay);
    }
  }

  throw lastError;
}
```

### Pattern 2: Rate Limiter with Token Bucket

```typescript
// packages/pkgs-integrations/3p-core/src/rate-limiter.ts
import { redis } from '@repo/3p-upstash';

export class RateLimiter {
  constructor(
    private identifier: string,
    private maxRequests: number,
    private windowSeconds: number
  ) {}

  async checkLimit(): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = `ratelimit:${this.identifier}`;

    try {
      // Increment counter
      const count = await redis.incr(key);

      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, this.windowSeconds);
      }

      const allowed = count <= this.maxRequests;
      const remaining = Math.max(0, this.maxRequests - count);
      const resetAt = new Date(Date.now() + this.windowSeconds * 1000);

      return { allowed, remaining, resetAt };
    } catch (error) {
      console.error('[RateLimiter] Error checking limit:', error);
      // Fail open on Redis errors
      return { allowed: true, remaining: this.maxRequests, resetAt: new Date() };
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const { allowed, remaining, resetAt } = await this.checkLimit();

    if (!allowed) {
      throw new RateLimitError(
        `Rate limit exceeded. Resets at ${resetAt.toISOString()}`,
        { remaining, resetAt }
      );
    }

    console.info(`[RateLimiter] ${this.identifier}: ${remaining} requests remaining`);

    return fn();
  }
}

// Usage
const stripeRateLimiter = new RateLimiter('stripe-api', 100, 60); // 100 req/min

await stripeRateLimiter.execute(async () => {
  return stripe.customers.create({ email: 'user@example.com' });
});
```

### Pattern 3: Circuit Breaker

```typescript
// packages/pkgs-integrations/3p-core/src/circuit-breaker.ts
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime: number | null = null;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private name: string = 'circuit'
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition to HALF_OPEN
    if (
      this.state === CircuitState.OPEN &&
      this.lastFailureTime &&
      Date.now() - this.lastFailureTime >= this.timeout
    ) {
      console.info(`[CircuitBreaker] ${this.name}: Transitioning to HALF_OPEN`);
      this.state = CircuitState.HALF_OPEN;
    }

    // Reject if circuit is OPEN
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker ${this.name} is OPEN`);
    }

    try {
      const result = await fn();

      // Success: reset on HALF_OPEN or CLOSED
      if (this.state === CircuitState.HALF_OPEN) {
        console.info(`[CircuitBreaker] ${this.name}: Transitioning to CLOSED`);
        this.reset();
      }

      return result;
    } catch (error) {
      this.recordFailure();

      // Open circuit if threshold exceeded
      if (this.failureCount >= this.threshold) {
        console.error(
          `[CircuitBreaker] ${this.name}: Threshold exceeded, opening circuit`
        );
        this.state = CircuitState.OPEN;
        this.lastFailureTime = Date.now();
      }

      throw error;
    }
  }

  private recordFailure(): void {
    this.failureCount++;
    console.warn(`[CircuitBreaker] ${this.name}: Failure count = ${this.failureCount}`);
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
const hotelbedsCircuit = new CircuitBreaker(5, 60000, 'hotelbeds-api');

await hotelbedsCircuit.execute(async () => {
  return hotelbeds.searchHotels(params);
});
```

---

## Error Handling and Circuit Breakers

### Pattern 1: Custom Integration Error

```typescript
// packages/pkgs-integrations/3p-core/src/errors.ts
export class IntegrationError extends Error {
  constructor(
    public service: string,
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(`[${service}] ${message}`);
    this.name = 'IntegrationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public metadata: { remaining: number; resetAt: Date }
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class WebhookError extends Error {
  constructor(
    message: string,
    public webhookId?: string
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

// Error handler utility
export function handleIntegrationError(error: any, context: string): never {
  if (error instanceof IntegrationError) {
    console.error(`[Integration Error] ${context}:`, {
      service: error.service,
      message: error.message,
      statusCode: error.statusCode
    });
  } else if (error instanceof RateLimitError) {
    console.error(`[Rate Limit] ${context}:`, {
      message: error.message,
      remaining: error.metadata.remaining,
      resetAt: error.metadata.resetAt
    });
  } else {
    console.error(`[Unknown Error] ${context}:`, error);
  }

  throw error;
}
```

---

## Credential Management

### Pattern 1: SafeEnv for Integration Credentials

```typescript
// packages/pkgs-integrations/3p-stripe/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
    STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional()
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_')
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  },
  onValidationError: (error) => {
    console.warn('[Stripe Env] Validation failed:', error.flatten().fieldErrors);
    return undefined as never;
  }
});

export function safeEnv() {
  return env || {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  };
}
```

---

## Common Integration Workflows

### Workflow 1: Integrate New External Service

**Step-by-step:**

1. **Create package structure**
```bash
mkdir -p packages/pkgs-integrations/3p-newservice/src
cd packages/pkgs-integrations/3p-newservice
```

2. **Initialize package.json**
```json
{
  "name": "@repo/3p-newservice",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts"
  },
  "dependencies": {
    "zod": "catalog:",
    "@repo/3p-core": "workspace:*"
  }
}
```

3. **Create SafeEnv configuration**
```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NEWSERVICE_API_KEY: z.string().min(1),
    NEWSERVICE_API_URL: z.string().url()
  },
  runtimeEnv: {
    NEWSERVICE_API_KEY: process.env.NEWSERVICE_API_KEY,
    NEWSERVICE_API_URL: process.env.NEWSERVICE_API_URL
  }
});
```

4. **Implement API client**
```typescript
// src/client.ts
import { z } from 'zod';
import { withRetry } from '@repo/3p-core/composable/with-retry';
import { env } from './env';

const ResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number()
});

export class NewServiceClient {
  async fetchData(params: any) {
    return withRetry(
      async () => {
        const response = await fetch(`${env.NEWSERVICE_API_URL}/data`, {
          headers: {
            'Authorization': `Bearer ${env.NEWSERVICE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        return ResponseSchema.parse(await response.json());
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  }
}

export const newService = new NewServiceClient();
```

5. **Add tests**
```typescript
// src/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { newService } from './client';

describe('NewServiceClient', () => {
  it('should fetch data successfully', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [], total: 0 })
    });

    const result = await newService.fetchData({});
    expect(result).toEqual({ data: [], total: 0 });
  });
});
```

6. **Document in apps/docs**
```markdown
# packages/integrations/newservice.mdx

# NewService Integration

## Setup

\`\`\`bash
pnpm add @repo/3p-newservice
\`\`\`

## Usage

\`\`\`typescript
import { newService } from '@repo/3p-newservice/client';

const data = await newService.fetchData(params);
\`\`\`
```

---

## Anti-Patterns and Solutions

### Anti-Pattern 1: Hardcoded Credentials

❌ **BAD:**
```typescript
const stripe = new Stripe('sk_live_hardcoded123');
```

✅ **GOOD:**
```typescript
import { env } from './env';
const stripe = new Stripe(env.STRIPE_SECRET_KEY);
```

### Anti-Pattern 2: No Timeout

❌ **BAD:**
```typescript
const response = await fetch(url);  // Can hang forever
```

✅ **GOOD:**
```typescript
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000)
});
```

### Anti-Pattern 3: No Retry Logic

❌ **BAD:**
```typescript
const data = await externalAPI.call();  // Fails on transient errors
```

✅ **GOOD:**
```typescript
const data = await withRetry(() => externalAPI.call(), {
  maxRetries: 3,
  baseDelay: 1000
});
```

### Anti-Pattern 4: Unverified Webhooks

❌ **BAD:**
```typescript
export async function handleWebhook(payload: any) {
  // Anyone can send fake webhooks!
  await processPayment(payload);
}
```

✅ **GOOD:**
```typescript
export async function handleWebhook(payload: string, signature: string) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
  await processPayment(event.data.object);
}
```

### Anti-Pattern 5: No Rate Limiting

❌ **BAD:**
```typescript
for (const id of customerIds) {
  await stripe.customers.retrieve(id);  // Will hit rate limit!
}
```

✅ **GOOD:**
```typescript
import pLimit from 'p-limit';

const limit = pLimit(10);  // Max 10 concurrent requests

const customers = await Promise.all(
  customerIds.map(id => limit(() => stripe.customers.retrieve(id)))
);
```

---

## Troubleshooting Guide

### Issue 1: Webhook Signature Verification Failing

**Symptoms:**
- Webhooks return 400/401
- Logs show "Invalid signature"

**Diagnosis:**
```bash
# Check webhook secret is correct
echo $STRIPE_WEBHOOK_SECRET

# Verify signature in logs
grep "Stripe Webhook" logs/*.log
```

**Solutions:**
1. Verify webhook secret matches Stripe dashboard
2. Ensure raw body is used (not parsed JSON)
3. Check signature header name is correct

```typescript
// Correct: use raw body
const event = stripe.webhooks.constructEvent(
  rawBody,  // String, not parsed object
  signature,
  env.STRIPE_WEBHOOK_SECRET
);
```

### Issue 2: Rate Limiting Errors

**Symptoms:**
- 429 responses from API
- "Rate limit exceeded" errors

**Diagnosis:**
```bash
# Check for 429 errors in logs
grep "429" logs/*.log | wc -l

# Identify which endpoint is rate limited
grep "429" logs/*.log | grep -oE '/[^/]+/[^/]+' | sort | uniq -c
```

**Solutions:**
1. Implement exponential backoff
2. Use rate limiter wrapper
3. Batch requests where possible
4. Request rate limit increase from provider

### Issue 3: Timeout Errors

**Symptoms:**
- Requests hanging
- "AbortError" or timeout exceptions

**Diagnosis:**
```bash
# Check for timeout errors
grep -i "timeout\|abort" logs/*.log

# Measure actual response times
# (requires instrumentation)
```

**Solutions:**
1. Increase timeout for slow endpoints
2. Add retry logic with backoff
3. Implement circuit breaker
4. Contact provider about slow responses

### Issue 4: Invalid API Response

**Symptoms:**
- Zod validation errors
- Unexpected response format

**Diagnosis:**
```typescript
// Log raw response for debugging
const response = await fetch(url);
const raw = await response.text();
console.log('[Debug] Raw response:', raw);

try {
  const parsed = JSON.parse(raw);
  const validated = Schema.parse(parsed);
} catch (error) {
  console.error('[Validation Error]', error);
}
```

**Solutions:**
1. Update Zod schema to match API changes
2. Add optional fields for backward compatibility
3. Contact provider about API changes
4. Implement schema versioning

---

**End of Extended Guide**

For quick reference, see `.claude/agents/integrations.md`
