/**
 * AI SDK v5 Retry Middleware
 * Provides intelligent retry logic for AI model requests with exponential backoff
 */

import { logError, logInfo, logWarn } from '@repo/observability';

// Define middleware types locally since they may not be exported in current AI SDK v5 build
interface LanguageModelMiddleware {
  wrapGenerate?: (args: { doGenerate: any; params: any }) => Promise<any>;
  wrapStream?: (args: { doStream: any; params: any }) => Promise<any>;
}

export interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, nextDelay: number) => Promise<void> | void;
  onMaxRetriesExceeded?: (error: Error, totalAttempts: number) => Promise<void> | void;
  retryableErrors?: string[];
  nonRetryableErrors?: string[];
}

export interface RetryInfo {
  attempt: number;
  totalAttempts: number;
  error: Error;
  nextDelay: number;
  elapsedTime: number;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public attempts: number,
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry middleware for AI SDK v5
 */
export class RetryMiddleware {
  private config: Required<RetryConfig>;

  constructor(config: RetryConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      backoffFactor: config.backoffFactor ?? 2,
      jitter: config.jitter ?? true,
      retryCondition: config.retryCondition ?? this.defaultRetryCondition,
      onRetry: config.onRetry ?? (() => {}),
      onMaxRetriesExceeded: config.onMaxRetriesExceeded ?? (() => {}),
      retryableErrors: config.retryableErrors ?? [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'EPIPE',
        'NetworkError',
        'TimeoutError',
        'AbortError',
        'InternalServerError',
        'BadGatewayError',
        'ServiceUnavailableError',
        'GatewayTimeoutError',
        'TooManyRequestsError',
      ],
      nonRetryableErrors: config.nonRetryableErrors ?? [
        'InvalidArgumentError',
        'UnauthorizedError',
        'ForbiddenError',
        'NotFoundError',
        'ConflictError',
        'UnprocessableEntityError',
        'PaymentRequiredError',
      ],
    };
  }

  /**
   * Create middleware function
   */
  create(): LanguageModelMiddleware {
    return {
      wrapGenerate: async ({ doGenerate, params }) => {
        return this.retryOperation(doGenerate, params);
      },

      wrapStream: async ({ doStream, params }) => {
        return this.retryOperation(doStream, params);
      },
    };
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(operation: () => Promise<T>, _params: any): Promise<T> {
    const startTime = Date.now();
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const _elapsedTime = Date.now() - startTime;

        // Check if we should retry this error
        if (!this.config.retryCondition(lastError, attempt)) {
          throw lastError;
        }

        // If this was the last attempt, don't retry
        if (attempt === this.config.maxRetries) {
          await this.config.onMaxRetriesExceeded(lastError, attempt + 1);
          throw new RetryError(
            `Operation failed after ${attempt + 1} attempts: ${lastError.message}`,
            lastError,
            attempt + 1,
          );
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt);

        // Execute retry callback
        await this.config.onRetry(lastError, attempt + 1, delay);

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw lastError || new Error('Unknown error occurred during retries');
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    let delay = this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt);

    // Apply maximum delay limit
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  /**
   * Default retry condition
   */
  private defaultRetryCondition = (error: Error, _attempt: number): boolean => {
    // Check for non-retryable errors first
    for (const nonRetryable of this.config.nonRetryableErrors) {
      if (this.errorMatches(error, nonRetryable)) {
        return false;
      }
    }

    // Check for explicitly retryable errors
    for (const retryable of this.config.retryableErrors) {
      if (this.errorMatches(error, retryable)) {
        return true;
      }
    }

    // Check for common HTTP status codes
    if ('status' in error || 'statusCode' in error) {
      const status = (error as any).status || (error as any).statusCode;

      // Retry on server errors (5xx) and rate limiting (429)
      if (status >= 500 || status === 429) {
        return true;
      }

      // Don't retry on client errors (4xx, except 429)
      if (status >= 400 && status < 500) {
        return false;
      }
    }

    // Check for network-related errors
    if (error.message) {
      const message = error.message.toLowerCase();
      const networkErrors = [
        'network',
        'connection',
        'timeout',
        'socket',
        'reset',
        'refused',
        'unreachable',
        'dns',
      ];

      for (const networkError of networkErrors) {
        if (message.includes(networkError)) {
          return true;
        }
      }
    }

    // Default to not retrying unknown errors
    return false;
  };

  /**
   * Check if error matches a pattern
   */
  private errorMatches(error: Error, pattern: string): boolean {
    return (
      error.name.includes(pattern) ||
      error.message.includes(pattern) ||
      error.constructor.name.includes(pattern)
    );
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create retry middleware
 */
export function createRetryMiddleware(config?: RetryConfig): LanguageModelMiddleware {
  const middleware = new RetryMiddleware(config);
  return middleware.create();
}

/**
 * Retry presets for common scenarios
 */
export const retryPresets = {
  /**
   * Conservative retry for production
   */
  production: (): RetryConfig => ({
    maxRetries: 2,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true,
    onRetry: async (error, attempt, nextDelay) => {
      logWarn(
        `Retrying request (attempt ${attempt}) after ${nextDelay}ms due to: ${error.message}`,
      );
    },
  }),

  /**
   * Aggressive retry for development
   */
  development: (): RetryConfig => ({
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 30000,
    backoffFactor: 1.5,
    jitter: true,
    onRetry: async (error, attempt, nextDelay) => {
      logInfo(`🔄 Retry ${attempt}: ${error.message} (waiting ${nextDelay}ms)`);
    },
    onMaxRetriesExceeded: async (error, totalAttempts) => {
      logError(`❌ Max retries exceeded after ${totalAttempts} attempts: ${error.message}`);
    },
  }),

  /**
   * Fast retry for real-time applications
   */
  realtime: (): RetryConfig => ({
    maxRetries: 1,
    initialDelay: 200,
    maxDelay: 1000,
    backoffFactor: 2,
    jitter: false,
  }),

  /**
   * Patient retry for batch processing
   */
  batch: (): RetryConfig => ({
    maxRetries: 10,
    initialDelay: 2000,
    maxDelay: 60000,
    backoffFactor: 1.5,
    jitter: true,
    onRetry: async (error, attempt, nextDelay) => {
      logInfo(`Batch retry ${attempt}/10: ${error.name} (waiting ${nextDelay}ms)`);
    },
  }),

  /**
   * Network-focused retry
   */
  network: (): RetryConfig => ({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 15000,
    backoffFactor: 2,
    jitter: true,
    retryableErrors: [
      'NetworkError',
      'TimeoutError',
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EPIPE',
      'AbortError',
    ],
    nonRetryableErrors: [
      'InvalidArgumentError',
      'UnauthorizedError',
      'ForbiddenError',
      'PaymentRequiredError',
    ],
  }),

  /**
   * API-focused retry
   */
  api: (): RetryConfig => ({
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error: Error, _attempt: number) => {
      // Retry on specific HTTP status codes
      if ('status' in error || 'statusCode' in error) {
        const status = (error as any).status || (error as any).statusCode;
        return (
          status === 429 || status === 500 || status === 502 || status === 503 || status === 504
        );
      }

      // Retry on network errors
      const networkErrors = ['network', 'timeout', 'connection'];
      return networkErrors.some(networkError => error.message.toLowerCase().includes(networkError));
    },
  }),
} as const;

/**
 * Utility functions for common retry patterns
 */
export const retryUtils = {
  /**
   * Create a retry wrapper for any async function
   */
  async withRetry<T>(operation: () => Promise<T>, config?: RetryConfig): Promise<T> {
    const middleware = new RetryMiddleware(config);
    return middleware['retryOperation'](operation, {});
  },

  /**
   * Create exponential backoff delay calculator
   */
  createBackoffCalculator(
    initialDelay: number = 1000,
    maxDelay: number = 30000,
    backoffFactor: number = 2,
    jitter: boolean = true,
  ) {
    return (attempt: number): number => {
      let delay = initialDelay * Math.pow(backoffFactor, attempt);
      delay = Math.min(delay, maxDelay);

      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      return Math.floor(delay);
    };
  },

  /**
   * Check if an error is retryable based on common patterns
   */
  isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /socket/i,
      /reset/i,
      /refused/i,
      /unreachable/i,
      /dns/i,
    ];

    return retryablePatterns.some(
      pattern => pattern.test(error.message) || pattern.test(error.name),
    );
  },

  /**
   * Extract retry-after header from response
   */
  getRetryAfterDelay(error: any): number | null {
    if (error.response?.headers) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        const delay = parseInt(retryAfter, 10);
        return !isNaN(delay) ? delay * 1000 : null; // Convert to milliseconds
      }
    }
    return null;
  },
} as const;
