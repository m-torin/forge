/**
 * Environment-neutral timeout and abort utilities
 * Unified timeout management using AbortController pattern
 * Safe for browser, edge, and Node.js environments
 */

export interface TimeoutOptions {
  name?: string;
  onTimeout?: (timeoutMs: number) => void;
}

export interface WithTimeoutOptions extends TimeoutOptions {
  abortSignal?: AbortSignal;
}

/**
 * Create an AbortSignal that triggers after the specified timeout
 * Uses modern AbortSignal.timeout() when available, falls back gracefully
 *
 * @param timeout - Timeout in milliseconds
 * @returns AbortSignal that will be aborted after timeout, or undefined if not supported
 */
export function createTimeoutSignal(timeout: number): AbortSignal | undefined {
  try {
    // Check if AbortSignal.timeout is available (Node.js 16+, modern browsers)
    if (
      typeof AbortSignal !== 'undefined' &&
      Object.hasOwn(AbortSignal, 'timeout') &&
      typeof AbortSignal.timeout === 'function'
    ) {
      return AbortSignal.timeout(timeout);
    }

    // Fallback: create a manual timeout signal
    if (typeof AbortController !== 'undefined') {
      const controller = new AbortController();
      setTimeout(() => controller.abort('Timeout'), timeout);
      return controller.signal;
    }
  } catch (error) {
    // If anything fails, return undefined for graceful degradation
    console.warn('Failed to create timeout signal:', error);
  }

  return undefined;
}

/**
 * Create a promise that rejects after the specified timeout
 *
 * @param timeoutMs - Timeout in milliseconds
 * @param options - Optional configuration
 * @returns Promise that rejects with timeout error
 */
export function createTimeout<T = never>(
  timeoutMs: number,
  options: TimeoutOptions = {},
): Promise<T> {
  const { name = 'operation', onTimeout } = options;

  return new Promise<T>((_, reject) => {
    const timeoutId = setTimeout(() => {
      const error = new Error(`${name} timed out after ${timeoutMs}ms`);
      (error as any).code = 'TIMEOUT';
      (error as any).timeout = timeoutMs;

      if (onTimeout) {
        try {
          onTimeout(timeoutMs);
        } catch (callbackError) {
          console.warn('Timeout callback error:', callbackError);
        }
      }

      reject(error);
    }, timeoutMs);
  });
}

/**
 * Race a promise against a timeout
 * The promise will be rejected if it doesn't resolve within the timeout
 *
 * @param promise - Promise to race against timeout
 * @param timeoutMs - Timeout in milliseconds
 * @param options - Optional configuration including existing abort signal
 * @returns Promise that resolves/rejects based on the race result
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  options: WithTimeoutOptions = {},
): Promise<T> {
  const { name = 'promise', onTimeout, abortSignal } = options;

  // If an abort signal is already provided and aborted, reject immediately
  if (abortSignal?.aborted) {
    return Promise.reject(new Error(`${name} was already aborted`));
  }

  const timeoutPromise = createTimeout<T>(timeoutMs, { name, onTimeout });

  // If we have an abort signal, also listen for its abort event
  if (abortSignal) {
    const abortPromise = new Promise<T>((_, reject) => {
      const abortHandler = () => {
        const error = new Error(`${name} was aborted`);
        (error as any).code = 'ABORT';
        reject(error);
      };

      if (abortSignal.aborted) {
        abortHandler();
      } else {
        abortSignal.addEventListener('abort', abortHandler, { once: true });
      }
    });

    return Promise.race([promise, timeoutPromise, abortPromise]);
  }

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Create a delay promise that resolves after the specified time
 * Can be aborted with an AbortSignal
 *
 * @param ms - Delay in milliseconds
 * @param abortSignal - Optional abort signal to cancel the delay
 * @returns Promise that resolves after delay or rejects if aborted
 */
export function delay(ms: number, abortSignal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new Error('Delay was aborted'));
      return;
    }

    const timeoutId = setTimeout(() => resolve(), ms);

    if (abortSignal) {
      const abortHandler = () => {
        clearTimeout(timeoutId);
        reject(new Error('Delay was aborted'));
      };

      abortSignal.addEventListener('abort', abortHandler, { once: true });
    }
  });
}

/**
 * Retry a function with exponential backoff and timeout
 *
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Promise that resolves with the function result or rejects after max attempts
 */
export async function withRetryTimeout<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    timeout?: number;
    abortSignal?: AbortSignal;
    name?: string;
  } = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    timeout = 30000,
    abortSignal,
    name = 'retryable operation',
  } = options;

  let lastError: Error = new Error(`${name} failed after ${maxAttempts} attempts`);
  let currentDelay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (abortSignal?.aborted) {
        throw new Error(`${name} was aborted`);
      }

      const result =
        timeout > 0
          ? await withTimeout(fn(), timeout, { name: `${name} (attempt ${attempt})`, abortSignal })
          : await fn();

      return result;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if aborted or if it's the last attempt
      if (abortSignal?.aborted || attempt === maxAttempts) {
        break;
      }

      // Don't retry timeout errors on the last few attempts to avoid long waits
      if (lastError.message.includes('timed out') && attempt >= maxAttempts - 1) {
        break;
      }

      // Wait before retrying
      await delay(Math.min(currentDelay, maxDelay), abortSignal);
      currentDelay *= backoffFactor;
    }
  }

  throw lastError;
}

/**
 * Create a debounced version of a function with timeout support
 *
 * @param fn - Function to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @param options - Optional configuration
 * @returns Debounced function with cancel method
 */
export function debounceWithTimeout<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delayMs: number,
  options: { timeout?: number; abortSignal?: AbortSignal } = {},
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let pendingPromise: Promise<any> | undefined;

  const debouncedFn = ((...args: any[]) => {
    return new Promise((resolve, reject) => {
      // Cancel previous timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Check if already aborted
      if (options.abortSignal?.aborted) {
        reject(new Error('Function call was aborted'));
        return;
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = options.timeout
            ? await withTimeout(fn(...args), options.timeout, {
                name: `debounced ${fn.name}`,
                abortSignal: options.abortSignal,
              })
            : await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);

      // Handle abort during debounce wait
      if (options.abortSignal) {
        const abortHandler = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
          reject(new Error('Function call was aborted'));
        };

        if (options.abortSignal.aborted) {
          abortHandler();
        } else {
          options.abortSignal.addEventListener('abort', abortHandler, { once: true });
        }
      }
    });
  }) as T & { cancel: () => void };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  return debouncedFn;
}
