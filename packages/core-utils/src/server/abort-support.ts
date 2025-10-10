/**
 * Node.js 22+ AbortController support utilities
 * Provides common interfaces and helpers for cancellation across MCP tools
 */

/**
 * Import timeout utilities from shared
 */
import { createTimeoutSignal as coreCreateTimeoutSignal } from '../shared/timeout.js';

export interface AbortableOperation {
  signal?: AbortSignal;
}

export interface AbortableToolArgs extends AbortableOperation {
  [key: string]: any;
}

/**
 * Check if a value is an AbortSignal-like object
 */
export function isAbortSignalLike(signal: any): signal is AbortSignal {
  return (
    signal &&
    typeof signal === 'object' &&
    'aborted' in signal &&
    typeof signal.aborted === 'boolean' &&
    'addEventListener' in signal
  );
}

/**
 * Throw an error if the signal is aborted
 */
export function throwIfAborted(signal: AbortSignal, message = 'Operation aborted'): void {
  if (signal.aborted) {
    const error = new Error(message);
    (error as any).code = 'ABORT_ERR';
    throw error;
  }
}

/**
 * Combine multiple abort signals into one
 */
export function combineAbortSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  const validSignals = signals.filter((s): s is AbortSignal => s !== undefined);

  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  return controller.signal;
}

/**
 * Create a signal that aborts when any of the provided signals abort
 */
export function anySignal(...signals: (AbortSignal | undefined)[]): AbortSignal {
  return combineAbortSignals(...signals);
}

// Re-export with original name
export const createTimeoutSignal = coreCreateTimeoutSignal;

/**
 * Safe wrapper for throwIfAborted that handles undefined signals
 * @param signal - AbortSignal that might be undefined
 */
export function safeThrowIfAborted(signal?: AbortSignal): void {
  if (signal) {
    throwIfAborted(signal);
  }
}

/**
 * Creates a no-op AbortSignal that never aborts
 * Used as a fallback when no signal is provided
 */
export function createNoOpSignal(): AbortSignal {
  return new AbortController().signal;
}

/**
 * Ensures we always have a valid AbortSignal
 * @param signal - Optional AbortSignal
 * @returns Valid AbortSignal (creates no-op if undefined)
 */
export function ensureAbortSignal(signal?: AbortSignal): AbortSignal {
  return signal || createNoOpSignal();
}

/**
 * Modern timeout signal helper - alias for createTimeoutSignal
 * @param ms - Timeout in milliseconds
 * @returns AbortSignal that times out after specified milliseconds, or no-op signal if not supported
 */
export function toTimeoutSignal(ms: number): AbortSignal {
  const signal = coreCreateTimeoutSignal(ms);
  return signal || createNoOpSignal();
}

/**
 * Creates an AbortController with optional timeout using core-utils
 * @param timeoutMs - Timeout in milliseconds (optional)
 * @returns AbortController instance
 */
export function createAbortController(timeoutMs?: number): AbortController {
  if (timeoutMs && timeoutMs > 0) {
    // Use createTimeoutSignal and extract the controller
    const signal = coreCreateTimeoutSignal(timeoutMs);
    const controller = new AbortController();

    // Only forward if signal was successfully created
    if (signal) {
      // Forward the timeout signal's abort to our controller
      signal.addEventListener('abort', () => {
        controller.abort(signal.reason);
      });
    }

    return controller;
  }

  return new AbortController();
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

    void (async () => {
      try {
        const result = await operation;
        signal.removeEventListener('abort', abortHandler);
        resolve(result);
      } catch (error) {
        signal.removeEventListener('abort', abortHandler);
        reject(error);
      }
    })();
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
