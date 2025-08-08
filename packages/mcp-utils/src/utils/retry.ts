/**
 * Retry Logic Utilities
 * Standardized retry patterns with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Execute an operation with automatic retry and exponential backoff
 * Standardizes retry logic across all agents
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry = () => {},
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt), maxDelay);

      // Notify about retry
      onRetry(attempt + 1, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Execute multiple operations in parallel with individual retry logic
 */
export async function retryParallel<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {},
): Promise<T[]> {
  return Promise.all(operations.map(op => retryOperation(op, options)));
}

/**
 * Execute operations in sequence with retry logic
 * Stops on first failure after retries
 */
export async function retrySequential<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {},
): Promise<T[]> {
  const results: T[] = [];

  for (const operation of operations) {
    const result = await retryOperation(operation, options);
    results.push(result);
  }

  return results;
}

/**
 * Simple sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Common retry predicates for specific error types
 */
export const RetryPredicates = {
  // Retry on network errors
  networkErrors: (error: any) => {
    const message = error?.message || '';
    return (
      message.includes('ECONNREFUSED') ||
      message.includes('ETIMEDOUT') ||
      message.includes('ENOTFOUND') ||
      message.includes('fetch failed')
    );
  },

  // Retry on rate limiting
  rateLimitErrors: (error: any) => {
    const message = error?.message || '';
    const status = error?.status || error?.response?.status;
    return status === 429 || message.includes('rate limit');
  },

  // Retry on temporary failures
  temporaryErrors: (error: any) => {
    const status = error?.status || error?.response?.status;
    return status >= 500 || status === 408;
  },

  // Combine multiple predicates
  combine: (...predicates: Array<(error: any) => boolean>) => {
    return (error: any) => predicates.some(pred => pred(error));
  },
};
