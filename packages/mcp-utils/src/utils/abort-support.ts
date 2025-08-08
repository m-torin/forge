/**
 * Node.js 22+ AbortController support utilities
 * Provides common interfaces and helpers for cancellation across MCP tools
 */

export interface AbortableOperation {
  signal?: AbortSignal;
}

export interface AbortableToolArgs extends AbortableOperation {
  [key: string]: any;
}

/**
 * Validates that a value is a valid AbortSignal
 * @param signal - Value to validate
 * @returns true if signal is AbortSignal-like
 */
export function isAbortSignalLike(signal: unknown): signal is AbortSignal {
  return (
    !!signal &&
    typeof (signal as any).aborted === 'boolean' &&
    typeof (signal as any).addEventListener === 'function' &&
    typeof (signal as any).removeEventListener === 'function'
  );
}

/**
 * Creates a timeout AbortSignal using Node.js 22+ native API when available
 * @param timeoutMs - Timeout in milliseconds
 * @returns AbortSignal that aborts after timeout
 */
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  // Use native AbortSignal.timeout if available (Node.js 22+)
  if (typeof (AbortSignal as any).timeout === 'function') {
    return (AbortSignal as any).timeout(timeoutMs);
  }

  // Fallback to custom implementation
  const controller = new AbortController();
  setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort(new Error(`Operation timed out after ${timeoutMs}ms`));
    }
  }, timeoutMs);

  return controller.signal;
}

/**
 * Modern timeout signal helper that uses Node.js 22+ API when available
 * @param ms - Timeout in milliseconds
 * @returns AbortSignal that times out after specified milliseconds
 */
export function toTimeoutSignal(ms: number): AbortSignal {
  return createTimeoutSignal(ms);
}

/**
 * Creates an AbortController with optional timeout
 * @param timeoutMs - Timeout in milliseconds (optional)
 * @returns AbortController instance
 */
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();

  if (timeoutMs && timeoutMs > 0) {
    setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort(new Error(`Operation timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);
  }

  return controller;
}

/**
 * Combines multiple AbortSignals using Node.js 22+ native API when available
 * @param signals - Array of AbortSignals to combine
 * @returns Combined AbortSignal
 */
export function combineAbortSignals(signals: (AbortSignal | undefined)[]): AbortSignal {
  // Filter out undefined signals and validate
  const validSignals = signals.filter((s): s is AbortSignal => isAbortSignalLike(s));

  if (validSignals.length === 0) {
    // Return a never-aborting signal
    return new AbortController().signal;
  }

  if (validSignals.length === 1) {
    return validSignals[0];
  }

  // Use native AbortSignal.any if available (Node.js 22+)
  if (typeof (AbortSignal as any).any === 'function') {
    return (AbortSignal as any).any(validSignals);
  }

  // Fallback to custom implementation
  const controller = new AbortController();

  // Check if any signal is already aborted
  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
  }

  // Listen for any signal to abort
  const handlers: (() => void)[] = [];
  for (const signal of validSignals) {
    const handler = () => {
      if (!controller.signal.aborted) {
        controller.abort(signal.reason);
      }
      // Clean up all handlers
      handlers.forEach((h, i) => {
        validSignals[i].removeEventListener('abort', h);
      });
    };
    handlers.push(handler);
    signal.addEventListener('abort', handler, { once: true });
  }

  return controller.signal;
}

/**
 * Modern signal combination helper that uses Node.js 22+ API when available
 * @param signals - Array of AbortSignals to combine
 * @returns AbortSignal that aborts when any of the input signals abort
 */
export function anySignal(signals: (AbortSignal | undefined)[]): AbortSignal {
  return combineAbortSignals(signals);
}

/**
 * Throws if the signal has been aborted (with validation)
 * @param signal - AbortSignal to check
 * @param message - Optional custom error message
 */
export function throwIfAborted(signal?: AbortSignal, message?: string): void {
  if (signal && isAbortSignalLike(signal) && signal.aborted) {
    // Use native throwIfAborted if available (Node.js 22+)
    if (typeof signal.throwIfAborted === 'function') {
      signal.throwIfAborted();
    } else {
      throw new Error(message || 'Operation was aborted');
    }
  }
}

/**
 * Creates a race between an operation and an abort signal
 * @param operation - Promise to race
 * @param signal - AbortSignal to race against
 * @returns Promise that resolves with operation result or rejects if aborted
 */
export async function raceWithAbort<T>(operation: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal || !isAbortSignalLike(signal)) {
    return operation;
  }

  throwIfAborted(signal, 'Operation was aborted before starting');

  return new Promise<T>((resolve, reject) => {
    const abortHandler = () => {
      reject(new Error('Operation was aborted'));
    };

    signal.addEventListener('abort', abortHandler, { once: true });

    operation
      .then(result => {
        signal.removeEventListener('abort', abortHandler);
        resolve(result);
        return result;
      })
      .catch(error => {
        signal.removeEventListener('abort', abortHandler);
        reject(error);
        throw error;
      });
  });
}

/**
 * Wraps an async generator to respect abort signals
 * @param generator - AsyncGenerator to wrap
 * @param signal - AbortSignal to respect
 * @returns Wrapped AsyncGenerator that checks for abortion
 */
export async function* abortableAsyncGenerator<T>(
  generator: AsyncGenerator<T, void, unknown>,
  signal?: AbortSignal,
): AsyncGenerator<T, void, unknown> {
  if (!signal) {
    yield* generator;
    return;
  }

  try {
    for await (const item of generator) {
      throwIfAborted(signal);
      yield item;
    }
  } catch (error) {
    // If the generator throws, clean up and re-throw
    if (typeof generator.return === 'function') {
      await generator.return();
    }
    throw error;
  }
}
