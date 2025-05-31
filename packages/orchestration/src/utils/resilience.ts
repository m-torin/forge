import { type Redis } from '@upstash/redis';

import { classifyWorkflowError, isRetryableError, WorkflowErrorType } from './error-handling';
import { calculateBackoff, formatTimestamp, generateKey, getDomain, sleep } from './helpers';
import { devLog } from './observability';
import { DEFAULT_RETRIES, DEFAULT_TIMEOUTS } from './types';

import type { CircuitBreakerConfig, CircuitBreakerState, RateLimiterConfig } from './types';

// ===== Circuit Breaker =====

export class CircuitBreaker {
  private failures = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: CircuitBreakerState = 'CLOSED';

  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly successThreshold: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.recoveryTimeout = config.recoveryTimeout ?? 60000; // 1 minute
    this.successThreshold = config.successThreshold ?? 2;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Will retry after ${formatTimestamp(this.lastFailureTime + this.recoveryTimeout)}`,
        );
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats() {
    return {
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime:
        this.state === 'OPEN' ? formatTimestamp(this.lastFailureTime + this.recoveryTimeout) : null,
      state: this.state,
    };
  }

  reset(): void {
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// ===== Rate Limiter =====

export class RateLimiter {
  private redis: Redis;
  private config: Required<RateLimiterConfig>;

  constructor(redis: Redis, config: RateLimiterConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: config.keyPrefix ?? 'rate-limit',
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
    };
  }

  async checkLimit(
    identifier: string,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = generateKey(this.config.keyPrefix, identifier);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Remove old entries
    await this.redis.zremrangebyscore(key, '-inf' as any, windowStart);

    // Count current requests in window
    const count = await this.redis.zcard(key);

    if (count >= this.config.maxRequests) {
      // Get oldest entry to determine reset time
      const oldestEntry = await this.redis.zrange(key, 0, 0, { withScores: true });
      const resetAt =
        oldestEntry.length > 0 && oldestEntry[0]
          ? new Date(Number((oldestEntry[0] as any).score || oldestEntry[0]) + this.config.windowMs)
          : new Date(now + this.config.windowMs);

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await this.redis.zadd(key, { member: `${now}-${Math.random()}`, score: now });
    await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

    return {
      allowed: true,
      remaining: this.config.maxRequests - count - 1,
      resetAt: new Date(now + this.config.windowMs),
    };
  }

  async reset(identifier: string): Promise<void> {
    const key = generateKey(this.config.keyPrefix, identifier);
    await this.redis.del(key);
  }

  async waitForSlot(identifier: string): Promise<void> {
    let result = await this.checkLimit(identifier);

    while (!result.allowed) {
      const waitTime = result.resetAt.getTime() - Date.now();
      if (waitTime > 0) {
        await sleep(Math.min(waitTime, 1000));
      }
      result = await this.checkLimit(identifier);
    }
  }
}

// ===== Domain-based Rate Limiter =====

export class DomainRateLimiter {
  private limiters = new Map<string, RateLimiter>();
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async checkDomainLimit(
    url: string,
    maxRequestsPerMinute = 60,
  ): Promise<{ allowed: boolean; domain: string; remaining: number; resetAt: Date }> {
    const domain = getDomain(url);

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: generateKey('domain-rate-limit', domain),
          maxRequests: maxRequestsPerMinute,
          windowMs: 60000, // 1 minute
        }),
      );
    }

    const limiter = this.limiters.get(domain)!;
    const result = await limiter.checkLimit(domain);

    return {
      ...result,
      domain,
    };
  }

  async waitForDomainSlot(url: string, maxRequestsPerMinute = 60): Promise<void> {
    const domain = getDomain(url);

    if (!this.limiters.has(domain)) {
      this.limiters.set(
        domain,
        new RateLimiter(this.redis, {
          keyPrefix: generateKey('domain-rate-limit', domain),
          maxRequests: maxRequestsPerMinute,
          windowMs: 60000,
        }),
      );
    }

    const limiter = this.limiters.get(domain)!;
    await limiter.waitForSlot(domain);
  }
}

// ===== Retry Logic (merged from retry.ts) =====

/**
 * Unified retry configuration with all retry options
 */
export interface UnifiedRetryConfig {
  /** Base delay in milliseconds between retries */
  baseDelayMs: number;
  /** Function to classify errors for retry logic */
  errorClassifier?: (error: unknown) => WorkflowErrorType;
  /** Whether to use jitter in backoff calculation */
  jitter?: boolean | number;
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  multiplier?: number;
  /** Callback when retry happens */
  onRetry?: (error: unknown, attempt: number, nextDelay: number) => void;
  /** Specific error types to retry (overrides shouldRetry) */
  retryOn?: WorkflowErrorType[];
  /** Custom function to determine if error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Retry strategy */
  strategy?: 'exponential' | 'linear' | 'constant';
}

/**
 * Default retry configurations for common scenarios
 */
export const RETRY_PRESETS = {
  /** Aggressive retry for critical operations */
  aggressive: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    jitter: true,
    maxAttempts: DEFAULT_RETRIES.aggressive,
    maxDelayMs: 30000,
    strategy: 'exponential' as const,
  },

  /** Conservative retry for less critical operations */
  conservative: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry * 2,
    jitter: true,
    maxAttempts: DEFAULT_RETRIES.conservative,
    maxDelayMs: 60000,
    strategy: 'exponential' as const,
  },

  /** Network-only retry */
  network: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxAttempts: DEFAULT_RETRIES.network,
    maxDelayMs: 10000,
    retryOn: [WorkflowErrorType.NETWORK, WorkflowErrorType.TIMEOUT],
    strategy: 'exponential' as const,
  },

  /** API retry with rate limit handling */
  api: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxAttempts: DEFAULT_RETRIES.api,
    maxDelayMs: DEFAULT_TIMEOUTS.api,
    retryOn: [
      WorkflowErrorType.NETWORK,
      WorkflowErrorType.TIMEOUT,
      WorkflowErrorType.RATE_LIMIT,
      WorkflowErrorType.UNAVAILABLE,
    ],
    strategy: 'exponential' as const,
  },

  /** No retry */
  none: {
    baseDelayMs: 0,
    maxAttempts: 0,
    maxDelayMs: 0,
  },
} as const;

/**
 * Core retry operation function
 *
 * @example
 * ```typescript
 * // Basic retry with exponential backoff
 * const result = await retryOperation(
 *   async () => fetch('/api/data'),
 *   { maxAttempts: 3, baseDelayMs: 1000 }
 * );
 *
 * // Using preset configuration
 * const result = await retryOperation(
 *   async () => apiCall(),
 *   RETRY_PRESETS.api
 * );
 *
 * // Custom retry logic
 * const result = await retryOperation(
 *   async () => unreliableOperation(),
 *   {
 *     maxAttempts: 5,
 *     shouldRetry: (error, attempt) => {
 *       return attempt < 3 || error.message.includes('temporary');
 *     },
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry ${attempt} in ${delay}ms: ${error.message}`);
 *     }
 *   }
 * );
 * ```
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: UnifiedRetryConfig,
): Promise<T> {
  const {
    baseDelayMs = DEFAULT_TIMEOUTS.retry,
    errorClassifier = classifyWorkflowError,
    jitter = false,
    maxAttempts = DEFAULT_RETRIES.api,
    maxDelayMs = 60000,
    multiplier = 2,
    onRetry,
    retryOn,
    shouldRetry,
    strategy = 'exponential',
  } = config;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt > maxAttempts) {
        break;
      }

      // Determine if we should retry
      let shouldRetryError = true;

      if (shouldRetry) {
        shouldRetryError = shouldRetry(error, attempt);
      } else if (retryOn && retryOn.length > 0) {
        const errorType = errorClassifier(error);
        shouldRetryError = retryOn.includes(errorType);
      } else {
        const errorType = errorClassifier(error);
        shouldRetryError = isRetryableError(errorType);
      }

      if (!shouldRetryError) {
        break;
      }

      // Calculate delay
      const delay = calculateBackoff(attempt - 1, {
        baseDelayMs,
        jitter,
        maxDelayMs,
        multiplier,
        strategy,
      });

      // Call retry callback if provided
      if (onRetry) {
        onRetry(error, attempt, delay);
      } else {
        devLog.info(`Retrying operation (attempt ${attempt}/${maxAttempts}), delay: ${delay}ms`);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Enhance error with retry context
  if (lastError instanceof Error) {
    throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`, {
      cause: lastError,
    });
  }

  throw lastError;
}

/**
 * Retry with exponential backoff (backward compatible)
 * @deprecated Use retryOperation() with exponential strategy
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    jitter?: boolean | number;
    shouldRetry?: (error: Error, attempt: number) => boolean;
  } = {},
): Promise<T> {
  return retryOperation(operation, {
    baseDelayMs: options.baseDelayMs || DEFAULT_TIMEOUTS.retry,
    maxAttempts: options.maxAttempts || DEFAULT_RETRIES.api,
    maxDelayMs: options.maxDelayMs || 60000,
    ...options,
    shouldRetry: options.shouldRetry
      ? (error, attempt) => options.shouldRetry!(error as Error, attempt)
      : undefined,
    strategy: 'exponential',
  });
}

/**
 * Retry with error handling (backward compatible)
 * @deprecated Use retryOperation() with error handling options
 */
export async function withRetryErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  retryConfig?: Partial<UnifiedRetryConfig>,
  context?: Record<string, unknown>,
): Promise<T> {
  return retryOperation(operation, {
    ...RETRY_PRESETS.conservative,
    ...retryConfig,
    onRetry: (error, attempt, delay) => {
      devLog.info(`Retrying ${operationName} in ${delay}ms (attempt ${attempt})`, {
        context,
        error: String(error),
      });
    },
  });
}

/**
 * Create a retry wrapper with preset configuration
 * Useful for creating consistent retry behavior across multiple operations
 */
export function createRetryWrapper(defaultConfig: UnifiedRetryConfig) {
  return <T>(operation: () => Promise<T>, overrides?: Partial<UnifiedRetryConfig>): Promise<T> => {
    return retryOperation(operation, {
      ...defaultConfig,
      ...overrides,
    });
  };
}

/**
 * Retry with rate limit awareness
 * Extracts retry-after header and waits accordingly
 */
export async function retryWithRateLimit<T>(
  operation: () => Promise<T>,
  config?: Partial<UnifiedRetryConfig>,
): Promise<T> {
  const apiPreset = { ...RETRY_PRESETS.api };

  return retryOperation(operation, {
    ...apiPreset,
    // Ensure retryOn is a mutable array
    retryOn: apiPreset.retryOn ? [...apiPreset.retryOn] : undefined,
    ...config,
    onRetry: (error, attempt, delay) => {
      // Check for retry-after header
      if (error && typeof error === 'object' && 'headers' in error) {
        const retryAfter = (error as any).headers?.['retry-after'];
        if (retryAfter) {
          const retryDelay = parseInt(retryAfter) * 1000;
          devLog.info(`Rate limited, retrying after ${retryDelay}ms`);
          return sleep(retryDelay);
        }
      }

      if (config?.onRetry) {
        config.onRetry(error, attempt, delay);
      }
    },
    shouldRetry: (error, _attempt) => {
      // Check for rate limit error
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 429) {
          return true;
        }
      }

      // Use default retry logic for other errors
      const errorType = classifyWorkflowError(error);
      return isRetryableError(errorType);
    },
  });
}
