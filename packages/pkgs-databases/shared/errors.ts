/**
 * Shared error handling utilities for all database packages
 * Provides consistent error patterns and utilities across Firestore, Redis, and Vector
 */

/**
 * Base database error class
 */
export abstract class DatabaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly operation: string;
  public readonly retryable: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;
  public readonly service: string;
  public readonly cause?: Error;

  constructor(options: {
    message: string;
    code: string;
    statusCode?: number;
    operation: string;
    service: string;
    retryable?: boolean;
    context?: Record<string, any>;
    cause?: Error;
  }) {
    super(options.message);
    this.code = options.code;
    this.statusCode = options.statusCode || 500;
    this.operation = options.operation;
    this.service = options.service;
    this.retryable = options.retryable || false;
    this.timestamp = new Date();
    this.context = options.context;

    if (options.cause) {
      this.cause = options.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      operation: this.operation,
      service: this.service,
      retryable: this.retryable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * Check if error should be retried
   */
  shouldRetry(): boolean {
    return this.retryable;
  }

  /**
   * Get error category for monitoring
   */
  getCategory():
    | 'connection'
    | 'authentication'
    | 'permission'
    | 'validation'
    | 'rate_limit'
    | 'quota'
    | 'timeout'
    | 'unknown' {
    const codePatterns = {
      connection: /connection|network|unreachable|timeout|ENOTFOUND|ECONNREFUSED/i,
      authentication: /auth|unauthorized|invalid.*credentials|UNAUTHENTICATED/i,
      permission: /permission|forbidden|access.*denied|PERMISSION_DENIED/i,
      validation: /validation|invalid.*input|bad.*request|malformed/i,
      rate_limit: /rate.*limit|too.*many.*requests|throttled/i,
      quota: /quota|limit.*exceeded|usage.*exceeded/i,
      timeout: /timeout|deadline.*exceeded/i,
    };

    for (const [category, pattern] of Object.entries(codePatterns)) {
      if (pattern.test(this.code) || pattern.test(this.message)) {
        return category as any;
      }
    }

    return 'unknown';
  }
}

/**
 * Connection-related errors
 */
export class ConnectionError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'CONNECTION_ERROR',
      statusCode: 503,
      operation,
      service,
      retryable: true,
      context,
    });
    this.name = 'ConnectionError';
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      operation,
      service,
      retryable: false,
      context,
    });
    this.name = 'AuthenticationError';
  }
}

/**
 * Permission/authorization errors
 */
export class PermissionError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'PERMISSION_ERROR',
      statusCode: 403,
      operation,
      service,
      retryable: false,
      context,
    });
    this.name = 'PermissionError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      operation,
      service,
      retryable: false,
      context,
    });
    this.name = 'ValidationError';
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends DatabaseError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    service: string,
    operation: string,
    retryAfter?: number,
    context?: Record<string, any>,
  ) {
    super({
      message,
      code: 'RATE_LIMIT_ERROR',
      statusCode: 429,
      operation,
      service,
      retryable: true,
      context: { ...context, retryAfter },
    });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Quota exceeded errors
 */
export class QuotaExceededError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'QUOTA_EXCEEDED',
      statusCode: 402,
      operation,
      service,
      retryable: false,
      context,
    });
    this.name = 'QuotaExceededError';
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends DatabaseError {
  constructor(message: string, service: string, operation: string, context?: Record<string, any>) {
    super({
      message,
      code: 'TIMEOUT_ERROR',
      statusCode: 408,
      operation,
      service,
      retryable: true,
      context,
    });
    this.name = 'TimeoutError';
  }
}

/**
 * Circuit breaker for database operations
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000,
    private resetTimeout = 30000,
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    service: string,
  ): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new ConnectionError(
          `Circuit breaker is open for ${service}`,
          service,
          operationName,
          { circuitBreakerState: this.state },
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
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }

  getState(): { state: string; failures: number } {
    return {
      state: this.state,
      failures: this.failures,
    };
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export class RetryHandler {
  constructor(
    private maxRetries = 3,
    private baseDelay = 1000,
    private maxDelay = 10000,
    private backoffMultiplier = 2,
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    service: string,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on final attempt
        if (attempt === this.maxRetries) {
          break;
        }

        // Check if error is retryable
        const isRetryable =
          error instanceof DatabaseError
            ? error.shouldRetry()
            : this.isRetryableError(error as Error);

        if (!isRetryable) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.baseDelay * Math.pow(this.backoffMultiplier, attempt),
          this.maxDelay,
        );

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;

        await this.sleep(delay + jitter);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /rate.*limit/i,
      /503/,
      /502/,
      /500/,
    ];

    return retryablePatterns.some(
      pattern => pattern.test(error.message) || pattern.test(error.name),
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Error factory for creating standardized errors
 */
export class ErrorFactory {
  static create(
    type:
      | 'connection'
      | 'authentication'
      | 'permission'
      | 'validation'
      | 'rate_limit'
      | 'quota'
      | 'timeout',
    message: string,
    service: string,
    operation: string,
    context?: Record<string, any>,
  ): DatabaseError {
    switch (type) {
      case 'connection':
        return new ConnectionError(message, service, operation, context);
      case 'authentication':
        return new AuthenticationError(message, service, operation, context);
      case 'permission':
        return new PermissionError(message, service, operation, context);
      case 'validation':
        return new ValidationError(message, service, operation, context);
      case 'rate_limit':
        return new RateLimitError(message, service, operation, undefined, context);
      case 'quota':
        return new QuotaExceededError(message, service, operation, context);
      case 'timeout':
        return new TimeoutError(message, service, operation, context);
      default:
        throw new Error(`Unknown error type: ${type}`);
    }
  }

  /**
   * Create error from unknown error
   */
  static fromUnknownError(error: unknown, service: string, operation: string): DatabaseError {
    if (error instanceof DatabaseError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error ? error : undefined;

    // Try to categorize the error
    const category = this.categorizeError(message);

    // Use the typed factory to normalize constructor params across error classes
    return ErrorFactory.create(
      category as
        | 'connection'
        | 'authentication'
        | 'permission'
        | 'validation'
        | 'rate_limit'
        | 'quota'
        | 'timeout',
      message,
      service,
      operation,
      cause ? { cause } : {},
    );
  }

  private static categorizeError(message: string): string {
    const patterns = {
      connection: /connection|network|unreachable|timeout|ENOTFOUND|ECONNREFUSED/i,
      authentication: /auth|unauthorized|invalid.*credentials|UNAUTHENTICATED/i,
      permission: /permission|forbidden|access.*denied|PERMISSION_DENIED/i,
      validation: /validation|invalid.*input|bad.*request|malformed/i,
      rate_limit: /rate.*limit|too.*many.*requests|throttled/i,
      quota: /quota|limit.*exceeded|usage.*exceeded/i,
      timeout: /timeout|deadline.*exceeded/i,
    };

    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(message)) {
        return category;
      }
    }

    return 'connection'; // Default fallback
  }

  private static getErrorClass(category: string) {
    const classMap = {
      connection: ConnectionError,
      authentication: AuthenticationError,
      permission: PermissionError,
      validation: ValidationError,
      rate_limit: RateLimitError,
      quota: QuotaExceededError,
      timeout: TimeoutError,
    };

    return classMap[category as keyof typeof classMap] || ConnectionError;
  }
}

/**
 * Result type for safe operations
 */
export type DatabaseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      errorCode?: string;
      isRetryable?: boolean;
      context?: Record<string, any>;
    };

/**
 * Safe operation wrapper
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  service: string,
): Promise<DatabaseResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const dbError = ErrorFactory.fromUnknownError(error, service, operationName);

    return {
      success: false,
      error: dbError.message,
      errorCode: dbError.code,
      isRetryable: dbError.retryable,
      context: dbError.context,
    };
  }
}
