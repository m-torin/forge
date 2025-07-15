/**
 * Error parsing and handling utilities
 * Migrated from the original observability package
 */

import { ObservabilityManager } from '../types/types';

import { Environment } from './environment';

/**
 * Error codes for standardized error handling
 */
export enum ErrorCode {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Extended error interface with code and data
 */
export interface ExtendedError extends Error {
  code?: ErrorCode | string;
  data?: any;
}

/**
 * Create an error with a code and optional data
 */
export function createError(message: string, code: ErrorCode | string, data?: any): ExtendedError {
  const error = new Error(message) as ExtendedError;
  error.code = code;
  if (data !== undefined) {
    error.data = data;
  }
  return error;
}

/**
 * Create an error boundary handler for React components
 * This returns a function that can be used in error boundaries
 */
export function createErrorBoundaryHandler(observability: ObservabilityManager) {
  return (error: Error, errorInfo: { componentStack?: string }) => {
    void observability.captureException(error, {
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
        return result.catch((error: any) => {
          void parseAndCaptureError(error, observability, {
            function: fn.name || 'anonymous',
            safeFunction: true,
          });
          return fallbackValue;
        }) as any;
      }

      return result;
    } catch (error: any) {
      void parseAndCaptureError(error, observability, {
        function: fn.name || 'anonymous',
        safeFunction: true,
      });
      return fallbackValue;
    }
  };
}

/**
 * Get error message from unknown value
 */
export function getErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'number') {
    return error.toString();
  }

  if (error instanceof Error) {
    return (error as Error)?.message || 'Unknown error';
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Error)?.message || 'Unknown error');
  }

  // Handle object types
  try {
    if (error && typeof error === 'object') {
      return JSON.stringify(error);
    }
    return String(error);
  } catch {
    // Handle circular references and other JSON.stringify failures
    return String(error);
  }
}

/**
 * Get error stack trace
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }

  if (error && typeof error === 'object' && 'stack' in error) {
    return String(error.stack);
  }

  return undefined;
}

/**
 * Check if a value is an Error or Error-like object
 */
export function isError(value: unknown): value is Error {
  if (value instanceof Error) {
    return true;
  }

  // Check for Error-like objects
  if (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    'message' in value &&
    'stack' in value
  ) {
    return true;
  }

  return false;
}

/**
 * Normalize an error to a consistent format
 */
export function normalizeError(error: unknown): Record<string, any> {
  if (error === null || error === undefined) {
    return {
      message: 'Unknown error',
      name: 'Error',
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      name: 'Error',
    };
  }

  if (typeof error === 'number') {
    return {
      message: error.toString(),
      name: 'Error',
    };
  }

  if (error instanceof Error) {
    const normalized: Record<string, any> = {
      message: (error as Error)?.message || 'Unknown error',
      name: error.name,
    };

    if (error.stack) {
      normalized.stack = error.stack;
    }

    // Include extended error properties
    if ('code' in error) {
      normalized.code = (error as any).code;
    }

    if ('data' in error) {
      normalized.data = (error as any).data;
    }

    return normalized;
  }

  if (typeof error === 'object') {
    const message = getErrorMessage(error);
    return {
      message,
      name: 'Error',
      ...error,
    };
  }

  return {
    message: String(error),
    name: 'Error',
  };
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
  } catch (error: any) {
    // If observability fails, throw the error instead of logging
    if (Environment.isNonProduction()) {
      throw new Error(`Error parsing error: ${error} - Original error: ${JSON.stringify(error)}`);
    }
  }

  return message;
}

/**
 * Parse an unknown error into a string message
 * This is useful for displaying error messages to users
 * Alias for getErrorMessage for backward compatibility
 */
export function parseError(error: unknown): string {
  return getErrorMessage(error);
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
    } catch (error: any) {
      await parseAndCaptureError(error, observability, {
        function: fn.name || 'anonymous',
        ...context,
      });
      throw error;
    }
  }) as T;
}
