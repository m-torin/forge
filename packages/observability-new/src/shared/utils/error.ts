/**
 * Error parsing and handling utilities
 * Migrated from the original observability package
 */

import type { ObservabilityManager } from '../types/types';

/**
 * Parse an unknown error into a string message
 * This is useful for displaying error messages to users
 */
export function parseError(error: unknown): string {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = error.message as string;
  } else {
    message = String(error);
  }

  return message;
}

/**
 * Parse and capture an error using the observability manager
 * This combines error parsing with automatic error tracking
 */
export async function parseAndCaptureError(
  error: unknown,
  observability: ObservabilityManager,
  context?: Record<string, any>,
): Promise<string> {
  const message = parseError(error);

  try {
    // Convert unknown error to Error object for better tracking
    const errorObject = error instanceof Error ? error : new Error(message);

    // Capture the error
    await observability.captureException(errorObject, context);

    // Also log it
    await observability.log('error', `Parsing error: ${message}`, {
      originalError: error,
      ...context,
    });
  } catch (newError) {
    // If observability fails, at least log to console
    console.error('Error parsing error:', newError);
    console.error('Original error:', error);
  }

  return message;
}

/**
 * Create an error boundary handler for React components
 * This returns a function that can be used in error boundaries
 */
export function createErrorBoundaryHandler(observability: ObservabilityManager) {
  return (error: Error, errorInfo: { componentStack?: string }) => {
    observability.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      tags: {
        source: 'error_boundary',
      },
    });
  };
}

/**
 * Wrap an async function with error handling
 * Automatically captures any errors that occur
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  observability: ObservabilityManager,
  context?: Record<string, any>,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      await parseAndCaptureError(error, observability, {
        function: fn.name || 'anonymous',
        ...context,
      });
      throw error;
    }
  }) as T;
}

/**
 * Create a safe version of a function that won't throw
 * Returns undefined on error and captures the error
 */
export function createSafeFunction<T extends (...args: any[]) => any>(
  fn: T,
  observability: ObservabilityManager,
  fallbackValue?: ReturnType<T>,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          parseAndCaptureError(error, observability, {
            function: fn.name || 'anonymous',
            safeFunction: true,
          });
          return fallbackValue;
        }) as any;
      }

      return result;
    } catch (error) {
      parseAndCaptureError(error, observability, {
        function: fn.name || 'anonymous',
        safeFunction: true,
      });
      return fallbackValue;
    }
  };
}
