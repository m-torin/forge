/**
 * Retry pattern implementation using p-retry
 */

import pRetry from 'p-retry';

import { isRetryableError } from '../utils/errors.js';

import type { PatternContext, PatternResult, RetryPattern } from '../types/patterns.js';

export interface RetryOptions extends Partial<RetryPattern> {
  /** Context for the operation */
  context?: Partial<PatternContext>;
  /** Function to determine if error should be retried (overrides pattern) */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<PatternResult<T>> {
  const pattern: RetryPattern = {
    baseDelay: 1000,
    jitter: true,
    maxAttempts: 3,
    maxDelay: 30000,
    strategy: 'exponential',
    ...options,
  };

  const context: PatternContext = {
    attempt: 0,
    operationId: `retry_${Date.now()}`,
    previousErrors: [],
    startTime: new Date(),
    ...options.context,
  };

  const startTime = Date.now();
  let lastError: Error;

  try {
    const result = await pRetry(
      async (attemptNumber) => {
        context.attempt = attemptNumber;
        
        try {
          const data = await fn();
          return data;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          context.previousErrors.push(err);
          lastError = err;

          // Call onRetry callback if provided
          if (pattern.onRetry) {
            pattern.onRetry(err, attemptNumber);
          }

          // Check if we should retry this error
          const shouldRetry = options.shouldRetry || pattern.shouldRetry || isRetryableError;
          if (!shouldRetry(err, attemptNumber)) {
            throw new (pRetry as any).AbortError(err);
          }

          throw err;
        }
      },
      {
        factor: pattern.strategy === 'exponential' ? 2 : 1,
        maxTimeout: pattern.maxDelay || pattern.baseDelay * 10,
        minTimeout: pattern.baseDelay,
        onFailedAttempt: (error: any) => {
          if (pattern.onRetry) {
            pattern.onRetry(error.originalError || error, error.attemptNumber || 1);
          }
        },
        randomize: pattern.jitter,
        retries: pattern.maxAttempts - 1,
      }
    );

    return {
      attempts: context.attempt,
      data: result,
      duration: Date.now() - startTime,
      metadata: {
        context,
        strategy: pattern.strategy,
        totalAttempts: context.attempt,
      },
      pattern: 'retry',
      success: true,
    };
  } catch (error) {
    const err = (error as any)?.originalError || error as Error;
    
    return {
      attempts: context.attempt,
      duration: Date.now() - startTime,
      error: err || lastError!,
      metadata: {
        context,
        previousErrors: context.previousErrors,
        strategy: pattern.strategy,
        totalAttempts: context.attempt,
      },
      pattern: 'retry',
      success: false,
    };
  }
}

/**
 * Create a retry decorator for class methods
 */
export function Retry(options: RetryOptions = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await withRetry(() => method.apply(this, args), options);
      
      if (result.success) {
        return result.data;
      } else {
        throw result.error;
      }
    };

    return descriptor;
  };
}

/**
 * Calculate delay for a specific attempt using different strategies
 */
export function calculateDelay(
  attempt: number,
  pattern: Pick<RetryPattern, 'strategy' | 'baseDelay' | 'maxDelay' | 'jitter'>
): number {
  let delay: number;

  switch (pattern.strategy) {
    case 'fixed':
      delay = pattern.baseDelay;
      break;
    
    case 'linear':
      delay = pattern.baseDelay * attempt;
      break;
    
    case 'exponential':
    default:
      delay = pattern.baseDelay * Math.pow(2, attempt - 1);
      break;
  }

  // Apply maximum delay cap
  if (pattern.maxDelay && delay > pattern.maxDelay) {
    delay = pattern.maxDelay;
  }

  // Apply jitter if enabled
  if (pattern.jitter) {
    // Add ±25% jitter
    const jitterRange = delay * 0.25;
    const jitterOffset = (Math.random() - 0.5) * 2 * jitterRange;
    delay += jitterOffset;
  }

  return Math.max(0, Math.floor(delay));
}

/**
 * Default retry strategies for common scenarios
 */
export const RetryStrategies = {
  /** Quick retry with exponential backoff */
  fast: {
    baseDelay: 100,
    jitter: true,
    maxAttempts: 3,
    maxDelay: 1000,
    strategy: 'exponential' as const,
  },

  /** Standard retry with moderate delays */
  standard: {
    baseDelay: 1000,
    jitter: true,
    maxAttempts: 3,
    maxDelay: 10000,
    strategy: 'exponential' as const,
  },

  /** Patient retry for long-running operations */
  patient: {
    baseDelay: 2000,
    jitter: true,
    maxAttempts: 5,
    maxDelay: 30000,
    strategy: 'exponential' as const,
  },

  /** Network-specific retry for API calls */
  network: {
    baseDelay: 500,
    jitter: true,
    maxAttempts: 4,
    maxDelay: 8000,
    shouldRetry: (error: Error) => {
      // Retry on network errors, timeouts, and 5xx status codes
      const message = error.message?.toLowerCase() || '';
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('5') ||
        message.includes('econnreset') ||
        message.includes('enotfound')
      );
    },
    strategy: 'exponential' as const,
  },

  /** Database-specific retry */
  database: {
    baseDelay: 1000,
    jitter: true,
    maxAttempts: 3,
    maxDelay: 5000,
    shouldRetry: (error: Error) => {
      const message = error.message?.toLowerCase() || '';
      return (
        message.includes('connection') ||
        message.includes('timeout') ||
        message.includes('lock') ||
        message.includes('deadlock')
      );
    },
    strategy: 'exponential' as const,
  },

  /** No retry - just execute once */
  none: {
    baseDelay: 0,
    jitter: false,
    maxAttempts: 1,
    strategy: 'fixed' as const,
  },
} as const;

/**
 * Create a retry function with predefined strategy
 */
export function createRetryFn<T>(strategy: keyof typeof RetryStrategies) {
  const options = RetryStrategies[strategy];
  
  return (fn: () => Promise<T>, overrides?: Partial<RetryOptions>) => {
    return withRetry(fn, { ...options, ...overrides });
  };
}

// Export commonly used retry functions
export const retryFast = createRetryFn('fast');
export const retryStandard = createRetryFn('standard');
export const retryPatient = createRetryFn('patient');
export const retryNetwork = createRetryFn('network');
export const retryDatabase = createRetryFn('database');