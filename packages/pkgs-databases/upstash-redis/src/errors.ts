/**
 * Comprehensive error handling for Upstash Redis operations
 */

/**
 * Base Redis error class
 */
export class RedisError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly operation: string;
  public readonly retryable: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(options: {
    message: string;
    code: string;
    statusCode?: number;
    operation: string;
    retryable?: boolean;
    context?: Record<string, any>;
    cause?: Error;
  }) {
    super(options.message);
    this.name = 'RedisError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.operation = options.operation;
    this.retryable = options.retryable || false;
    this.timestamp = new Date();
    this.context = options.context;

    if (options.cause) {
      this.cause = options.cause;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RedisError);
    }
  }
}

/**
 * Connection error
 */
export class RedisConnectionError extends RedisError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'CONNECTION_ERROR',
      statusCode: 503,
      operation: 'connection',
      retryable: true,
      context,
    });
    this.name = 'RedisConnectionError';
  }
}

/**
 * Authentication error
 */
export class RedisAuthError extends RedisError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'AUTH_ERROR',
      statusCode: 401,
      operation: 'authentication',
      retryable: false,
      context,
    });
    this.name = 'RedisAuthError';
  }
}

/**
 * Rate limit error
 */
export class RedisRateLimitError extends RedisError {
  public readonly retryAfter: number;

  constructor(message: string, retryAfter: number, context?: Record<string, any>) {
    super({
      message,
      code: 'RATE_LIMITED',
      statusCode: 429,
      operation: 'rate_limit',
      retryable: true,
      context: { retryAfter, ...context },
    });
    this.name = 'RedisRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Memory error
 */
export class RedisMemoryError extends RedisError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'MEMORY_ERROR',
      statusCode: 507,
      operation: 'memory',
      retryable: false,
      context,
    });
    this.name = 'RedisMemoryError';
  }
}

/**
 * Serialization error
 */
export class RedisSerializationError extends RedisError {
  public readonly data: any;

  constructor(message: string, data: any, context?: Record<string, any>) {
    super({
      message,
      code: 'SERIALIZATION_ERROR',
      statusCode: 400,
      operation: 'serialization',
      retryable: false,
      context: { dataType: typeof data, ...context },
    });
    this.name = 'RedisSerializationError';
    this.data = data;
  }
}

/**
 * Lock error
 */
export class RedisLockError extends RedisError {
  public readonly resource: string;

  constructor(message: string, resource: string, context?: Record<string, any>) {
    super({
      message,
      code: 'LOCK_ERROR',
      statusCode: 409,
      operation: 'locking',
      retryable: true,
      context: { resource, ...context },
    });
    this.name = 'RedisLockError';
    this.resource = resource;
  }
}

/**
 * Queue error
 */
export class RedisQueueError extends RedisError {
  public readonly queue: string;

  constructor(message: string, queue: string, context?: Record<string, any>) {
    super({
      message,
      code: 'QUEUE_ERROR',
      statusCode: 500,
      operation: 'queue',
      retryable: true,
      context: { queue, ...context },
    });
    this.name = 'RedisQueueError';
    this.queue = queue;
  }
}

/**
 * Session error
 */
export class RedisSessionError extends RedisError {
  public readonly sessionId: string;

  constructor(message: string, sessionId: string, context?: Record<string, any>) {
    super({
      message,
      code: 'SESSION_ERROR',
      statusCode: 401,
      operation: 'session',
      retryable: false,
      context: { sessionId, ...context },
    });
    this.name = 'RedisSessionError';
    this.sessionId = sessionId;
  }
}

/**
 * Timeout error
 */
export class RedisTimeoutError extends RedisError {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, context?: Record<string, any>) {
    super({
      message,
      code: 'TIMEOUT_ERROR',
      statusCode: 408,
      operation: 'timeout',
      retryable: true,
      context: { timeoutMs, ...context },
    });
    this.name = 'RedisTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Pipeline error
 */
export class RedisPipelineError extends RedisError {
  public readonly failedCommands: Array<{ command: string; error: string }>;

  constructor(
    message: string,
    failedCommands: Array<{ command: string; error: string }>,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'PIPELINE_ERROR',
      statusCode: 500,
      operation: 'pipeline',
      retryable: false,
      context: { commandCount: failedCommands.length, ...context },
    });
    this.name = 'RedisPipelineError';
    this.failedCommands = failedCommands;
  }
}

/**
 * Create appropriate error from Redis error
 */
export function createRedisError(
  error: any,
  operation: string,
  context?: Record<string, any>,
): RedisError {
  const message = error?.message || 'Unknown Redis error';
  const code = error?.code || error?.type || 'UNKNOWN';

  // Map common Redis errors to custom error types
  if (
    message.toLowerCase().includes('connection') ||
    message.toLowerCase().includes('econnrefused') ||
    message.toLowerCase().includes('timeout')
  ) {
    return new RedisConnectionError(message, context);
  }

  if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('unauthorized')) {
    return new RedisAuthError(message, context);
  }

  if (message.toLowerCase().includes('memory') || message.toLowerCase().includes('oom')) {
    return new RedisMemoryError(message, context);
  }

  if (message.toLowerCase().includes('serializ') || message.toLowerCase().includes('parse')) {
    return new RedisSerializationError(message, context?.data, context);
  }

  if (message.toLowerCase().includes('lock')) {
    return new RedisLockError(message, context?.resource || 'unknown', context);
  }

  if (message.toLowerCase().includes('queue')) {
    return new RedisQueueError(message, context?.queue || 'unknown', context);
  }

  if (message.toLowerCase().includes('session')) {
    return new RedisSessionError(message, context?.sessionId || 'unknown', context);
  }

  if (message.toLowerCase().includes('timeout') || code === 'ETIMEDOUT') {
    return new RedisTimeoutError(message, context?.timeoutMs || 0, context);
  }

  if (message.toLowerCase().includes('rate') || message.toLowerCase().includes('limit')) {
    return new RedisRateLimitError(message, context?.retryAfter || 60, context);
  }

  // Default error
  return new RedisError({
    message,
    code: code.toUpperCase(),
    operation,
    retryable: isRetryableError(error),
    context,
    cause: error,
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  const code = error.code?.toLowerCase() || '';

  const retryablePatterns = [
    'timeout',
    'connection',
    'econnrefused',
    'enotfound',
    'network',
    'temporary',
    'busy',
    'loading',
    'readonly',
  ];

  return retryablePatterns.some(pattern => message.includes(pattern) || code.includes(pattern));
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
  retryCondition?: (error: RedisError) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  jitter: true,
};

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: Record<string, any>,
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: RedisError;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const redisError =
        error instanceof RedisError ? error : createRedisError(error, 'retry', context);

      lastError = redisError;

      // Check retry condition
      if (retryConfig.retryCondition && !retryConfig.retryCondition(redisError)) {
        throw redisError;
      }

      // Don't retry non-retryable errors
      if (!redisError.retryable) {
        throw redisError;
      }

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        throw redisError;
      }

      // Calculate delay with exponential backoff
      let delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1);
      delay = Math.min(delay, retryConfig.maxDelay);

      // Add jitter to prevent thundering herd
      if (retryConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      console.warn(
        `Redis operation failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms:`,
        {
          error: redisError.message,
          code: redisError.code,
          context,
        },
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker for Redis operations
 */
export class RedisCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttempt = 0;

  constructor(
    private config: {
      failureThreshold: number;
      timeout: number;
      resetTimeout: number;
      monitoringPeriod: number;
    } = {
      failureThreshold: 5,
      timeout: 30000,
      resetTimeout: 60000,
      monitoringPeriod: 10000,
    },
  ) {}

  async execute<T>(operation: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    const now = Date.now();

    if (this.state === 'OPEN') {
      if (now >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new RedisError({
          message: 'Circuit breaker is OPEN',
          code: 'CIRCUIT_BREAKER_OPEN',
          operation: 'circuit_breaker',
          retryable: true,
          context: {
            state: this.state,
            failures: this.failures,
            nextAttempt: this.nextAttempt,
            ...context,
          },
        });
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new RedisTimeoutError('Circuit breaker timeout', this.config.timeout)),
            this.config.timeout,
          ),
        ),
      ]);

      // Success - reset failure count
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
    }
  }

  getState(): {
    state: string;
    failures: number;
    nextAttempt: number;
    healthy: boolean;
  } {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.nextAttempt,
      healthy: this.state === 'CLOSED',
    };
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    this.nextAttempt = 0;
  }

  forceOpen(): void {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.config.resetTimeout;
  }

  forceClose(): void {
    this.reset();
  }
}

/**
 * Error aggregator for batch operations
 */
export class RedisErrorAggregator {
  private errors: Array<{
    operation: string;
    error: RedisError;
    context?: Record<string, any>;
  }> = [];

  addError(operation: string, error: any, context?: Record<string, any>): void {
    const redisError =
      error instanceof RedisError ? error : createRedisError(error, operation, context);

    this.errors.push({ operation, error: redisError, context });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): Array<{ operation: string; error: RedisError; context?: Record<string, any> }> {
    return [...this.errors];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getRetryableErrors(): Array<{
    operation: string;
    error: RedisError;
    context?: Record<string, any>;
  }> {
    return this.errors.filter(({ error }) => error.retryable);
  }

  createAggregateError(): RedisError {
    if (this.errors.length === 0) {
      throw new Error('No errors to aggregate');
    }

    const errorSummary = this.errors
      .map(({ operation, error }) => `${operation}: ${error.message}`)
      .join('; ');

    return new RedisError({
      message: `Batch operation failed with ${this.errors.length} errors: ${errorSummary}`,
      code: 'BATCH_ERROR',
      operation: 'batch',
      retryable: this.getRetryableErrors().length > 0,
      context: {
        errorCount: this.errors.length,
        retryableCount: this.getRetryableErrors().length,
        operations: this.errors.map(({ operation, error }) => ({
          operation,
          code: error.code,
          message: error.message,
        })),
      },
    });
  }

  clear(): void {
    this.errors = [];
  }
}

/**
 * Error recovery strategies
 */
export const errorRecoveryStrategies = {
  /**
   * Fallback to local cache
   */
  async fallbackToLocalCache<T>(
    operation: () => Promise<T>,
    cacheKey: string,
    localCache: Map<string, { value: T; expires: number }>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const cached = localCache.get(cacheKey);
      if (cached && Date.now() < cached.expires) {
        console.warn('Fallback to local cache for key:', cacheKey);
        return cached.value;
      }
      throw error;
    }
  },

  /**
   * Degraded mode operation
   */
  async degradedMode<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    shouldUseFallback: (error: RedisError) => boolean = () => true,
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      const redisError =
        error instanceof RedisError ? error : createRedisError(error, 'degraded_mode');

      if (shouldUseFallback(redisError)) {
        console.warn('Switching to degraded mode due to:', redisError.message);
        return await fallbackOperation();
      }

      throw error;
    }
  },

  /**
   * Queue for retry
   */
  async queueForRetry<T>(operation: () => Promise<T>, queue: Array<() => Promise<T>>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const redisError =
        error instanceof RedisError ? error : createRedisError(error, 'queue_retry');

      if (redisError.retryable) {
        console.warn('Queueing operation for retry:', redisError.message);
        queue.push(operation);

        throw new RedisError({
          message: 'Operation queued for retry',
          code: 'QUEUED_FOR_RETRY',
          operation: 'queue',
          retryable: true,
        });
      }

      throw error;
    }
  },

  /**
   * Partial success handling
   */
  async handlePartialSuccess<T>(
    operations: Array<() => Promise<T>>,
    minimumSuccessRate = 0.5,
  ): Promise<{ results: T[]; errors: RedisError[]; successRate: number }> {
    const settled = await Promise.allSettled(operations.map(op => op()));

    const results: T[] = [];
    const errors: RedisError[] = [];

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const error =
          result.reason instanceof RedisError
            ? result.reason
            : createRedisError(result.reason, 'partial_success');
        errors.push(error);
      }
    }

    const successRate = results.length / operations.length;

    if (successRate < minimumSuccessRate) {
      throw new RedisError({
        message: `Insufficient success rate: ${successRate} < ${minimumSuccessRate}`,
        code: 'INSUFFICIENT_SUCCESS_RATE',
        operation: 'partial_success',
        retryable: false,
        context: {
          successRate,
          minimumSuccessRate,
          successCount: results.length,
          errorCount: errors.length,
          totalOperations: operations.length,
        },
      });
    }

    return { results, errors, successRate };
  },
};

/**
 * Health monitoring utilities
 */
export const healthMonitoring = {
  /**
   * Create health checker
   */
  createHealthChecker(
    healthCheck: () => Promise<boolean>,
    config: {
      interval: number;
      timeout: number;
      unhealthyThreshold: number;
      healthyThreshold: number;
    } = {
      interval: 30000,
      timeout: 5000,
      unhealthyThreshold: 3,
      healthyThreshold: 2,
    },
  ) {
    let isHealthy = true;
    let consecutiveFailures = 0;
    let consecutiveSuccesses = 0;
    let intervalId: NodeJS.Timeout | null = null;

    const listeners: Array<(healthy: boolean) => void> = [];

    const check = async (): Promise<void> => {
      try {
        const result = await Promise.race([
          healthCheck(),
          new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), config.timeout),
          ),
        ]);

        if (result) {
          consecutiveSuccesses++;
          consecutiveFailures = 0;

          if (!isHealthy && consecutiveSuccesses >= config.healthyThreshold) {
            isHealthy = true;
            listeners.forEach(listener => listener(true));
          }
        } else {
          throw new Error('Health check returned false');
        }
      } catch (error) {
        consecutiveFailures++;
        consecutiveSuccesses = 0;

        if (isHealthy && consecutiveFailures >= config.unhealthyThreshold) {
          isHealthy = false;
          listeners.forEach(listener => listener(false));
        }
      }
    };

    return {
      start(): void {
        if (intervalId) return;
        intervalId = setInterval(check, config.interval);
        check(); // Run immediate check
      },

      stop(): void {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },

      isHealthy(): boolean {
        return isHealthy;
      },

      getStats() {
        return {
          healthy: isHealthy,
          consecutiveFailures,
          consecutiveSuccesses,
          config,
        };
      },

      onHealthChange(listener: (healthy: boolean) => void): void {
        listeners.push(listener);
      },

      forceHealthy(): void {
        isHealthy = true;
        consecutiveFailures = 0;
        consecutiveSuccesses = config.healthyThreshold;
      },

      forceUnhealthy(): void {
        isHealthy = false;
        consecutiveFailures = config.unhealthyThreshold;
        consecutiveSuccesses = 0;
      },
    };
  },

  /**
   * Create performance monitor
   */
  createPerformanceMonitor(windowSize = 100) {
    const metrics: Array<{
      operation: string;
      duration: number;
      success: boolean;
      timestamp: number;
    }> = [];

    return {
      record(operation: string, duration: number, success: boolean): void {
        metrics.push({
          operation,
          duration,
          success,
          timestamp: Date.now(),
        });

        if (metrics.length > windowSize) {
          metrics.shift();
        }
      },

      getStats(operation?: string) {
        const filtered = operation ? metrics.filter(m => m.operation === operation) : metrics;

        if (filtered.length === 0) {
          return {
            count: 0,
            successRate: 0,
            averageDuration: 0,
            errorRate: 0,
          };
        }

        const successes = filtered.filter(m => m.success).length;
        const totalDuration = filtered.reduce((sum, m) => sum + m.duration, 0);

        return {
          count: filtered.length,
          successRate: successes / filtered.length,
          errorRate: (filtered.length - successes) / filtered.length,
          averageDuration: totalDuration / filtered.length,
        };
      },

      clear(): void {
        metrics.length = 0;
      },
    };
  },
};
