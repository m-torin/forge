// errors.ts
import type { Metadata } from './constants-types';

// RetryableError Interface
export interface RetryableError {
  canRetry: boolean;
  retryDelay: number; // in milliseconds
}

// ErrorMetadata Interface
export interface ErrorMetadata extends Readonly<Record<string, unknown>> {
  timestamp: string;
  // Add any common metadata fields here
}

// RetryStrategy Interface
export interface RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry: (error: FactoryError) => boolean;
}

const errorLogCount = new Map<string, number>();
const MAX_DEFAULT_LOGS = 100;
const ERROR_RESET_INTERVAL = 3600000; // 1 hour in ms

export enum ErrorCode {
  // Operation Errors
  TIMEOUT = 'TIMEOUT',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  INVALID_STATE = 'INVALID_STATE',
  ABORTED = 'ABORTED',

  // System Errors
  CONFIG = 'CONFIG',
  INITIALIZATION = 'INITIALIZATION',

  // Runtime Errors
  OPERATION = 'OPERATION',
  MIDDLEWARE = 'MIDDLEWARE',
  ADAPTER = 'ADAPTER',

  // Network Errors
  CONNECTION = 'CONNECTION',
  RATE_LIMIT = 'RATE_LIMIT',

  // Resource Errors
  LOCK_TIMEOUT = 'LOCK_TIMEOUT',
  CIRCUIT_OPEN = 'CIRCUIT_OPEN',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',

  // Middleware Specific
  MIDDLEWARE_EXECUTION = 'MIDDLEWARE_EXECUTION',
  MIDDLEWARE_CLEANUP = 'MIDDLEWARE_CLEANUP',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  AUTHENTICATION = 'AUTHENTICATION',
  INTERNAL = 'INTERNAL',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
  PERMISSION = 'PERMISSION',
  CONFIGURATION = 'CONFIGURATION',
  UNKNOWN = 'UNKNOWN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONCURRENCY_ERROR = 'CONCURRENCY_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  GENERAL_ERROR = 'GENERAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class FactoryError extends Error {
  readonly timestamp: number;
  readonly name = 'FactoryError' as const;

  constructor(
    message: string,
    readonly code: ErrorCode,
    readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    readonly metadata?: Metadata,
    readonly cause?: Error,
  ) {
    super(message);
    this.timestamp = Date.now();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static from(
    error: unknown,
    code: ErrorCode = ErrorCode.OPERATION,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ): FactoryError {
    if (error instanceof FactoryError) return error;

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new FactoryError('Operation aborted', ErrorCode.ABORTED, severity);
    }

    const message = error instanceof Error ? error.message : String(error);
    return new FactoryError(
      message,
      code,
      severity,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
      cause:
        this.cause instanceof Error
          ? {
              name: this.cause.name,
              message: this.cause.message,
              stack: this.cause.stack,
            }
          : undefined,
    });
  }
}

export class OperationError extends FactoryError {
  readonly retryable: boolean;

  constructor(
    message: string,
    code: ErrorCode,
    retryable: boolean = false,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: Metadata,
    cause?: Error,
  ) {
    super(message, code, severity, metadata, cause);
    this.retryable = retryable;
    Object.setPrototypeOf(this, OperationError.prototype);
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      retryable: this.retryable,
    });
  }
}

export const createOperationError = (
  message: string,
  code: ErrorCode,
  retryable = false,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  metadata?: Metadata,
  cause?: Error,
): OperationError => {
  return new OperationError(
    message,
    code,
    retryable,
    severity,
    metadata,
    cause,
  );
};

export const isFactoryError = (error: unknown): error is FactoryError => {
  return error instanceof FactoryError;
};

export const isOperationError = (error: unknown): error is OperationError => {
  return error instanceof OperationError;
};

export const wrapError = async <T>(
  operation: () => Promise<T>,
  code: ErrorCode = ErrorCode.OPERATION,
  metadata?: Metadata,
  signal?: AbortSignal,
  maxLogs = MAX_DEFAULT_LOGS,
): Promise<T> => {
  if (signal?.aborted) {
    throw new FactoryError(
      'Operation aborted',
      ErrorCode.ABORTED,
      ErrorSeverity.MEDIUM,
      metadata,
    );
  }

  const logError = (error: unknown, errorKey: string) => {
    const currentCount = errorLogCount.get(errorKey) ?? 0;

    if (currentCount < maxLogs) {
      const { logError: log } = require('@repo/observability');
      log('Unexpected error', { error });
      errorLogCount.set(errorKey, currentCount + 1);

      // First time seeing this error, setup reset timer
      if (currentCount === 0) {
        setTimeout(() => {
          errorLogCount.delete(errorKey);
        }, ERROR_RESET_INTERVAL);
      }
    }

    if (currentCount === maxLogs) {
      const { logWarn } = require('@repo/observability');
      logWarn(`Max error logs (${maxLogs}) reached for error type: ${errorKey}. Suppressing further logs.`, { errorKey, maxLogs });
    }
  };

  try {
    return await operation();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new FactoryError(
        'Operation aborted',
        ErrorCode.ABORTED,
        ErrorSeverity.MEDIUM,
        metadata,
      );
    }

    const factoryError =
      error instanceof FactoryError ? error : FactoryError.from(error, code);

    // Log unexpected errors with rate limiting
    if (!(error instanceof FactoryError)) {
      const errorKey = `${code}_${factoryError.message}`;
      logError(error, errorKey);
    }

    throw factoryError;
  } finally {
    // Cleanup any listeners if signal was used
    if (signal?.aborted) {
      signal.onabort = null;
    }
  }
};

// Optional: Expose method to reset error counts
export const resetErrorLogCounts = (): void => {
  errorLogCount.clear();
};

// Optional: Expose method to get current error counts
export const getErrorLogCounts = (): Map<string, number> => {
  return new Map(errorLogCount);
};

export class AWSFactoryError extends FactoryError {
  readonly service: string;
  readonly operation: string;
  readonly requestId?: string;

  constructor(
    message: string,
    code: ErrorCode,
    service: string,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    metadata?: Metadata,
    cause?: Error,
  ) {
    super(message, code, severity, metadata, cause);
    this.service = service;
    this.operation = operation;

    // Extract requestId from cause if available
    if (cause && (cause as any).$metadata?.requestId) {
      this.requestId = (cause as any).$metadata.requestId;
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      ...super.toJSON(),
      service: this.service,
      operation: this.operation,
      requestId: this.requestId,
    });
  }
}
