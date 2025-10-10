/**
 * Comprehensive error handling for Firestore operations
 */

/**
 * Base Firestore error class
 */
export class FirestoreError extends Error {
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
    this.name = 'FirestoreError';
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.operation = options.operation;
    this.retryable = options.retryable || false;
    this.timestamp = new Date();
    this.context = options.context;

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestoreError);
    }
  }
}

/**
 * Authentication error
 */
export class FirestoreAuthError extends FirestoreError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'AUTH_ERROR',
      statusCode: 401,
      operation: 'authentication',
      retryable: false,
      context,
    });
    this.name = 'FirestoreAuthError';
  }
}

/**
 * Permission denied error
 */
export class FirestorePermissionError extends FirestoreError {
  constructor(message: string, resource: string, context?: Record<string, any>) {
    super({
      message,
      code: 'PERMISSION_DENIED',
      statusCode: 403,
      operation: 'authorization',
      retryable: false,
      context: { resource, ...context },
    });
    this.name = 'FirestorePermissionError';
  }
}

/**
 * Document not found error
 */
export class FirestoreNotFoundError extends FirestoreError {
  constructor(documentPath: string, context?: Record<string, any>) {
    super({
      message: `Document not found: ${documentPath}`,
      code: 'NOT_FOUND',
      statusCode: 404,
      operation: 'read',
      retryable: false,
      context: { documentPath, ...context },
    });
    this.name = 'FirestoreNotFoundError';
  }
}

/**
 * Validation error
 */
export class FirestoreValidationError extends FirestoreError {
  public readonly field: string;
  public readonly value: any;

  constructor(message: string, field: string, value: any, context?: Record<string, any>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      operation: 'validation',
      retryable: false,
      context: { field, value, ...context },
    });
    this.name = 'FirestoreValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Connection error
 */
export class FirestoreConnectionError extends FirestoreError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'CONNECTION_ERROR',
      statusCode: 503,
      operation: 'connection',
      retryable: true,
      context,
    });
    this.name = 'FirestoreConnectionError';
  }
}

/**
 * Rate limit error
 */
export class FirestoreRateLimitError extends FirestoreError {
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
    this.name = 'FirestoreRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Transaction error
 */
export class FirestoreTransactionError extends FirestoreError {
  constructor(message: string, context?: Record<string, any>) {
    super({
      message,
      code: 'TRANSACTION_ERROR',
      statusCode: 409,
      operation: 'transaction',
      retryable: true,
      context,
    });
    this.name = 'FirestoreTransactionError';
  }
}

/**
 * Quota exceeded error
 */
export class FirestoreQuotaError extends FirestoreError {
  public readonly quotaType: string;

  constructor(message: string, quotaType: string, context?: Record<string, any>) {
    super({
      message,
      code: 'QUOTA_EXCEEDED',
      statusCode: 429,
      operation: 'quota_check',
      retryable: false,
      context: { quotaType, ...context },
    });
    this.name = 'FirestoreQuotaError';
    this.quotaType = quotaType;
  }
}

/**
 * Error code mappings
 */
export const FIRESTORE_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHENTICATED: 'AUTH_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Client Errors
  INVALID_ARGUMENT: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FAILED_PRECONDITION: 'PRECONDITION_FAILED',
  OUT_OF_RANGE: 'OUT_OF_RANGE',

  // Server Errors
  INTERNAL: 'INTERNAL_ERROR',
  UNAVAILABLE: 'CONNECTION_ERROR',
  DEADLINE_EXCEEDED: 'TIMEOUT',
  RESOURCE_EXHAUSTED: 'QUOTA_EXCEEDED',

  // Transaction Errors
  ABORTED: 'TRANSACTION_ERROR',
} as const;

/**
 * Create appropriate error from Firestore error
 */
export function createFirestoreError(
  error: any,
  operation: string,
  context?: Record<string, any>,
): FirestoreError {
  const message = error?.message || 'Unknown Firestore error';
  const code = error?.code || 'UNKNOWN';

  // Map common Firestore error codes to custom errors
  switch (code) {
    case 'unauthenticated':
      return new FirestoreAuthError(message, context);

    case 'permission-denied':
      return new FirestorePermissionError(message, context?.resource || 'unknown', context);

    case 'not-found':
      return new FirestoreNotFoundError(context?.documentPath || 'unknown', context);

    case 'invalid-argument':
      return new FirestoreValidationError(
        message,
        context?.field || 'unknown',
        context?.value,
        context,
      );

    case 'unavailable':
    case 'deadline-exceeded':
      return new FirestoreConnectionError(message, context);

    case 'resource-exhausted':
      return new FirestoreRateLimitError(message, context?.retryAfter || 60, context);

    case 'aborted':
      return new FirestoreTransactionError(message, context);

    default:
      return new FirestoreError({
        message,
        code: FIRESTORE_ERROR_CODES[code as keyof typeof FIRESTORE_ERROR_CODES] || code,
        operation,
        retryable: isRetryableError(code),
        context,
        cause: error,
      });
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(code: string): boolean {
  const retryableCodes = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'aborted',
    'internal',
  ];

  return retryableCodes.includes(code.toLowerCase());
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
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
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
  let lastError: Error;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-retryable errors
      if (error instanceof FirestoreError && !error.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      let delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1);
      delay = Math.min(delay, retryConfig.maxDelay);

      // Add jitter to prevent thundering herd
      if (retryConfig.jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      console.warn(
        `Firestore operation failed (attempt ${attempt}/${retryConfig.maxAttempts}), retrying in ${delay}ms:`,
        {
          error: error instanceof Error ? error.message : String(error),
          context,
        },
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker for Firestore operations
 */
export class FirestoreCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private config: {
      failureThreshold: number;
      timeout: number;
      resetTimeout: number;
    } = {
      failureThreshold: 5,
      timeout: 30000,
      resetTimeout: 60000,
    },
  ) {}

  async execute<T>(operation: () => Promise<T>, context?: Record<string, any>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new FirestoreError({
          message: 'Circuit breaker is OPEN',
          code: 'CIRCUIT_BREAKER_OPEN',
          operation: 'circuit_breaker',
          retryable: true,
          context,
        });
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), this.config.timeout),
        ),
      ]);

      // Success - reset failure count
      this.failures = 0;
      this.state = 'CLOSED';

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.config.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

/**
 * Error aggregator for batch operations
 */
export class FirestoreErrorAggregator {
  private errors: Array<{ index: number; error: FirestoreError }> = [];

  addError(index: number, error: any, operation: string, context?: Record<string, any>): void {
    const firestoreError =
      error instanceof FirestoreError
        ? error
        : createFirestoreError(error, operation, { ...context, index });

    this.errors.push({ index, error: firestoreError });
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): Array<{ index: number; error: FirestoreError }> {
    return [...this.errors];
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getRetryableErrors(): Array<{ index: number; error: FirestoreError }> {
    return this.errors.filter(({ error }) => error.retryable);
  }

  createAggregateError(operation: string): FirestoreError {
    if (this.errors.length === 0) {
      throw new Error('No errors to aggregate');
    }

    const errorSummary = this.errors
      .map(({ index, error }) => `[${index}]: ${error.message}`)
      .join('; ');

    return new FirestoreError({
      message: `Batch operation failed with ${this.errors.length} errors: ${errorSummary}`,
      code: 'BATCH_ERROR',
      operation,
      retryable: this.getRetryableErrors().length > 0,
      context: {
        errorCount: this.errors.length,
        retryableCount: this.getRetryableErrors().length,
        errors: this.errors.map(({ index, error }) => ({
          index,
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
 * Error logger with context
 */
export class FirestoreErrorLogger {
  constructor(
    private logger: {
      error: (message: string, meta?: any) => void;
      warn: (message: string, meta?: any) => void;
      info: (message: string, meta?: any) => void;
    } = console,
  ) {}

  logError(error: FirestoreError, context?: Record<string, any>): void {
    const logData = {
      name: error.name,
      code: error.code,
      message: error.message,
      operation: error.operation,
      statusCode: error.statusCode,
      retryable: error.retryable,
      timestamp: error.timestamp,
      context: { ...error.context, ...context },
      stack: error.stack,
    };

    if (error.statusCode >= 500) {
      this.logger.error('Firestore error', logData);
    } else if (error.statusCode >= 400) {
      this.logger.warn('Firestore client error', logData);
    } else {
      this.logger.info('Firestore info', logData);
    }
  }

  logRetry(attempt: number, maxAttempts: number, error: FirestoreError, delay: number): void {
    this.logger.warn('Firestore operation retry', {
      attempt,
      maxAttempts,
      error: error.message,
      code: error.code,
      delay,
      retryable: error.retryable,
    });
  }

  logCircuitBreakerStateChange(
    oldState: string,
    newState: string,
    context?: Record<string, any>,
  ): void {
    this.logger.info('Circuit breaker state change', {
      oldState,
      newState,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }
}

/**
 * Error recovery strategies
 */
export const errorRecoveryStrategies = {
  /**
   * Fallback to cache on read errors
   */
  async fallbackToCache<T>(
    operation: () => Promise<T>,
    cacheKey: string,
    cache: { get: (key: string) => Promise<T | null> },
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof FirestoreError && !error.retryable) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          console.warn('Fallback to cache for key:', cacheKey);
          return cached;
        }
      }
      throw error;
    }
  },

  /**
   * Degrade gracefully by returning partial results
   */
  async degradeGracefully<T>(
    operations: Array<() => Promise<T>>,
    minimumSuccess: number = 1,
  ): Promise<T[]> {
    const results: T[] = [];
    const errors: Error[] = [];

    const settled = await Promise.allSettled(operations.map(op => op()));

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push(result.reason);
      }
    }

    if (results.length >= minimumSuccess) {
      if (errors.length > 0) {
        console.warn(
          `Partial success: ${results.length}/${operations.length} operations succeeded`,
        );
      }
      return results;
    }

    throw new FirestoreError({
      message: `Insufficient successful operations: ${results.length}/${minimumSuccess} required`,
      code: 'INSUFFICIENT_SUCCESS',
      operation: 'graceful_degradation',
      retryable: false,
      context: {
        successCount: results.length,
        errorCount: errors.length,
        minimumRequired: minimumSuccess,
      },
    });
  },

  /**
   * Queue for retry during maintenance
   */
  async queueForRetry<T>(
    operation: () => Promise<T>,
    queue: { add: (fn: () => Promise<T>) => void },
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof FirestoreConnectionError) {
        console.warn('Queueing operation for retry due to connection error');
        queue.add(operation);
        throw new FirestoreError({
          message: 'Operation queued for retry',
          code: 'QUEUED_FOR_RETRY',
          operation: 'queue',
          retryable: true,
        });
      }
      throw error;
    }
  },
};

/**
 * Health check utilities
 */
export const healthCheck = {
  /**
   * Check Firestore connectivity
   */
  async checkConnectivity(
    testOperation: () => Promise<any>,
    timeout = 5000,
  ): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const start = Date.now();

    try {
      await Promise.race([
        testOperation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), timeout),
        ),
      ]);

      const latency = Date.now() - start;
      return { healthy: true, latency };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Monitor error rates
   */
  createErrorRateMonitor(windowMs = 60000, threshold = 0.1) {
    const events: Array<{ timestamp: number; success: boolean }> = [];

    return {
      record(success: boolean) {
        const now = Date.now();
        events.push({ timestamp: now, success });

        // Clean old events
        const cutoff = now - windowMs;
        while (events.length > 0 && events[0].timestamp < cutoff) {
          events.shift();
        }
      },

      getErrorRate(): number {
        if (events.length === 0) return 0;
        const errors = events.filter(e => !e.success).length;
        return errors / events.length;
      },

      isHealthy(): boolean {
        return this.getErrorRate() <= threshold;
      },

      getStats() {
        const total = events.length;
        const errors = events.filter(e => !e.success).length;
        const successes = total - errors;

        return {
          total,
          successes,
          errors,
          errorRate: this.getErrorRate(),
          healthy: this.isHealthy(),
          windowMs,
          threshold,
        };
      },
    };
  },
};
