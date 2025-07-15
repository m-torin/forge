/**
 * Timeout utilities for async operations
 * Prevents hanging operations and ensures predictable behavior
 */

export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeout: number,
    public readonly operation?: string,
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Execute a promise with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation?: string,
): Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new TimeoutError(
          `Operation ${operation || 'unknown'} timed out after ${timeoutMs}ms`,
          timeoutMs,
          operation,
        ),
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return result;
  } catch (error: any) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    throw error;
  }
}

/**
 * Create a timeout wrapper for async functions
 */
export function createTimeoutWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultTimeout: number,
  operationName?: string,
): T {
  return (async (...args: Parameters<T>) => {
    return withTimeout(fn(...args), defaultTimeout, operationName || fn.name || 'wrapped function');
  }) as T;
}

/**
 * Timeout configuration for different operation types
 */
export const DEFAULT_TIMEOUTS = {
  /** Timeout for provider initialization */
  PROVIDER_INIT: 30000, // 30 seconds
  /** Timeout for capturing exceptions */
  CAPTURE_EXCEPTION: 5000, // 5 seconds
  /** Timeout for capturing messages */
  CAPTURE_MESSAGE: 5000, // 5 seconds
  /** Timeout for logging operations */
  LOG_OPERATION: 3000, // 3 seconds
  /** Timeout for transaction operations */
  TRANSACTION: 60000, // 1 minute
  /** Default timeout for unspecified operations */
  DEFAULT: 10000, // 10 seconds
} as const;

/**
 * Create timeout configuration from environment or defaults
 */
export function createTimeoutConfig(
  overrides?: Partial<typeof DEFAULT_TIMEOUTS>,
): typeof DEFAULT_TIMEOUTS {
  return {
    ...DEFAULT_TIMEOUTS,
    ...overrides,
  };
}

/**
 * Race multiple promises with individual timeouts
 */
export async function raceWithTimeouts<T>(
  operations: Array<{
    promise: Promise<T>;
    timeout: number;
    name: string;
  }>,
): Promise<{ result: T; winner: string } | { error: Error; failed: string }> {
  const wrappedOperations = operations.map(({ promise, timeout, name }) =>
    withTimeout(promise, timeout, name)
      .then(result => ({ result, winner: name }))
      .catch(error => ({ error, failed: name })),
  );

  return Promise.race(wrappedOperations);
}

/**
 * Execute promises in parallel with timeout for the entire batch
 */
export async function allWithTimeout<T>(
  promises: Promise<T>[],
  timeoutMs: number,
  operation?: string,
): Promise<T[]> {
  return withTimeout(Promise.all(promises), timeoutMs, operation);
}

/**
 * Execute promises in parallel, settling all with individual timeouts
 */
export async function allSettledWithTimeouts<T>(
  operations: Array<{
    promise: Promise<T>;
    timeout: number;
    name: string;
  }>,
): Promise<Array<PromiseSettledResult<T> & { name: string }>> {
  const results = await Promise.allSettled(
    operations.map(async ({ promise, timeout, name }) => {
      try {
        const result = await withTimeout(promise, timeout, name);
        return { status: 'fulfilled' as const, value: result, name };
      } catch (error: any) {
        return { status: 'rejected' as const, reason: error, name };
      }
    }),
  );

  return results as Array<PromiseSettledResult<T> & { name: string }>;
}
