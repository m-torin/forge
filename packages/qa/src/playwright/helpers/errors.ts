/**
 * Standardized error handling for Playwright utilities
 */

/**
 * Base class for all Playwright utility errors
 */
export abstract class PlaywrightUtilityError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Authentication-related errors
 */
export class AuthenticationError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'AUTH_ERROR', context);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', context);
  }
}

/**
 * File upload-related errors
 */
export class FileUploadError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'FILE_UPLOAD_ERROR', context);
  }
}

/**
 * Performance testing errors
 */
export class PerformanceError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'PERFORMANCE_ERROR', context);
  }
}

/**
 * Session management errors
 */
export class SessionError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'SESSION_ERROR', context);
  }
}

/**
 * Configuration errors
 */
export class ConfigurationError extends PlaywrightUtilityError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIG_ERROR', context);
  }
}

/**
 * Timeout-related errors
 */
export class TimeoutError extends PlaywrightUtilityError {
  constructor(message: string, timeout: number, context?: Record<string, any>) {
    super(`${message} (timeout: ${timeout}ms)`, 'TIMEOUT_ERROR', { timeout, ...context });
  }
}

/**
 * Utility functions for error handling
 */
export class ErrorHandler {
  /**
   * Wrap async operations with error context
   */
  static async withContext<T>(
    operation: () => Promise<T>,
    context: {
      operation: string;
      errorType?: typeof PlaywrightUtilityError;
      timeout?: number;
      metadata?: Record<string, any>;
    },
  ): Promise<T> {
    const {
      operation: operationName,
      errorType = PlaywrightUtilityError,
      timeout,
      metadata,
    } = context;

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // Set up timeout if specified
      if (timeout) {
        const timeoutPromise = new Promise<never>((_resolve, reject) => {
          timeoutId = setTimeout(() => {
            reject(new TimeoutError(`Operation '${operationName}' timed out`, timeout, metadata));
          }, timeout);
        });

        return await Promise.race([operation(), timeoutPromise]);
      }

      return await operation();
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorContext = {
        operation: operationName,
        duration,
        ...metadata,
        originalError: error instanceof Error ? error.message : String(error),
      };

      if (error instanceof PlaywrightUtilityError) {
        // Re-throw with additional context
        throw new (errorType as any)(`${error.message} (in ${operationName})`, {
          ...error.context,
          ...errorContext,
        });
      }

      throw new (errorType as any)(
        `Failed to ${operationName}: ${error instanceof Error ? error.message : String(error)}`,
        errorContext,
      );
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Retry an operation with exponential backoff and proper error handling
   */
  static async retry<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      factor?: number;
      operationName?: string;
      shouldRetry?: (error: Error) => boolean;
    } = {},
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      factor = 2,
      operationName = 'operation',
      shouldRetry = () => true,
    } = options;

    let lastError: Error = new Error('No attempts made');
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on the last attempt or if shouldRetry returns false
        if (attempt === maxAttempts || !shouldRetry(lastError)) {
          break;
        }

        console.warn(
          `Attempt ${attempt}/${maxAttempts} failed for ${operationName}: ${lastError.message}. Retrying in ${delay}ms...`,
        );

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }

    // Create a concrete error class instead of the abstract base
    class RetryExhaustedError extends PlaywrightUtilityError {
      constructor(message: string, context: Record<string, any>) {
        super(message, 'RETRY_EXHAUSTED', context);
      }
    }

    throw new RetryExhaustedError(`All ${maxAttempts} attempts failed for ${operationName}`, {
      attempts: maxAttempts,
      lastError: lastError.message,
      operationName,
    });
  }

  /**
   * Create a safe async wrapper that catches and logs errors
   */
  static async safe<T>(
    operation: () => Promise<T>,
    options: {
      fallback?: T;
      logError?: boolean;
      operationName?: string;
    } = {},
  ): Promise<T | undefined> {
    const { fallback, logError = true, operationName = 'operation' } = options;

    try {
      return await operation();
    } catch (error) {
      if (logError) {
        console.error(`Safe ${operationName} failed:`, error);
      }
      return fallback;
    }
  }
}

/**
 * Decorator for adding error handling to class methods
 */
export function handleErrors(
  errorType: typeof PlaywrightUtilityError = PlaywrightUtilityError,
  timeout?: number,
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const method = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      return ErrorHandler.withContext(() => method.apply(this, args), {
        operation: `${target.constructor.name}.${propertyName}`,
        errorType,
        timeout,
        metadata: { args: args.length },
      });
    } as any;

    return descriptor;
  };
}
