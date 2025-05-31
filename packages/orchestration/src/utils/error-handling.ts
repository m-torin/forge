import { createErrorMessage, formatTimestamp } from './helpers';
import { devLog } from './observability';
import { DEFAULT_RETRIES, DEFAULT_TIMEOUTS, type RetryConfig } from './types';

/**
 * Error types for workflows
 */
export enum WorkflowErrorType {
  AUTHENTICATION = 'authentication',
  CONFIGURATION = 'configuration',
  CONFLICT = 'conflict',
  DATA_CORRUPTION = 'data_corruption',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal',
  NETWORK = 'network',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  RESOURCE_EXHAUSTED = 'resource_exhausted',
  TIMEOUT = 'timeout',
  UNAVAILABLE = 'unavailable',
  VALIDATION = 'validation',
}

/**
 * Categorize error types by retry strategy
 */
export const ERROR_RETRY_CATEGORIES = {
  // Errors that should be retried with exponential backoff
  exponentialBackoff: [
    WorkflowErrorType.NETWORK,
    WorkflowErrorType.RATE_LIMIT,
    WorkflowErrorType.UNAVAILABLE,
    WorkflowErrorType.RESOURCE_EXHAUSTED,
  ],

  // Errors that should be retried with constant delay
  constantDelay: [WorkflowErrorType.TIMEOUT, WorkflowErrorType.EXTERNAL_API],

  // Errors that should never be retried
  noRetry: [
    WorkflowErrorType.VALIDATION,
    WorkflowErrorType.NOT_FOUND,
    WorkflowErrorType.PERMISSION,
    WorkflowErrorType.CONFLICT,
    WorkflowErrorType.DATA_CORRUPTION,
    WorkflowErrorType.CONFIGURATION,
    WorkflowErrorType.AUTHENTICATION,
  ],
} as const;

/**
 * Enhanced workflow error class with context and retry information
 */
export class WorkflowError extends Error {
  constructor(
    public readonly type: WorkflowErrorType,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly retryable = false,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'WorkflowError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WorkflowError);
    }
  }

  toJSON() {
    return {
      type: this.type,
      context: this.context,
      message: this.message,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
      stack: this.stack,
    };
  }
}

/**
 * Error handlers for common scenarios
 */
export const errorHandlers = {
  /**
   * Handle API-related errors with intelligent classification
   */
  handleApiError: (
    error: unknown,
    api: string,
    context?: Record<string, unknown>,
  ): WorkflowError => {
    // If already a WorkflowError, return as-is
    if (error instanceof WorkflowError) {
      return error;
    }

    // Handle HTTP status codes
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;

      if (status === 401 || status === 403) {
        return new WorkflowError(
          WorkflowErrorType.PERMISSION,
          `Permission denied for ${api}`,
          { api, status, ...context },
          false,
        );
      }
      if (status === 404) {
        return new WorkflowError(
          WorkflowErrorType.NOT_FOUND,
          `Resource not found in ${api}`,
          { api, status, ...context },
          false,
        );
      }
      if (status === 409) {
        return new WorkflowError(
          WorkflowErrorType.CONFLICT,
          `Conflict in ${api}`,
          { api, status, ...context },
          false,
        );
      }
      if (status === 429) {
        const retryAfter = (error as any).headers?.['retry-after']
          ? parseInt((error as any).headers['retry-after']) * 1000
          : undefined;
        return new WorkflowError(
          WorkflowErrorType.RATE_LIMIT,
          `Rate limit exceeded for ${api}`,
          { api, status, ...context },
          true,
          retryAfter,
        );
      }
      if (status >= 500) {
        return new WorkflowError(
          WorkflowErrorType.EXTERNAL_API,
          `${api} server error`,
          { api, status, ...context },
          true,
        );
      }
      if (status === 408 || status === 504) {
        return new WorkflowError(
          WorkflowErrorType.TIMEOUT,
          `Request to ${api} timed out`,
          { api, status, ...context },
          true,
        );
      }
    }

    // Use consolidated error classification
    const errorType = classifyWorkflowError(error);
    const message = error instanceof Error ? error.message : String(error);

    switch (errorType) {
      case WorkflowErrorType.NETWORK:
        return new WorkflowError(
          WorkflowErrorType.NETWORK,
          `Network error calling ${api}`,
          { api, error: message, ...context },
          true,
        );
      case WorkflowErrorType.TIMEOUT:
        return new WorkflowError(
          WorkflowErrorType.TIMEOUT,
          `Timeout calling ${api}`,
          { api, error: message, ...context },
          true,
        );
      case WorkflowErrorType.RATE_LIMIT:
        return new WorkflowError(
          WorkflowErrorType.RATE_LIMIT,
          `Rate limit exceeded for ${api}`,
          { api, error: message, ...context },
          true,
        );
    }

    return new WorkflowError(
      WorkflowErrorType.EXTERNAL_API,
      `Failed to call ${api}`,
      { api, error: String(error), ...context },
      true,
    );
  },

  /**
   * Handle timeout errors
   */
  handleTimeout: (operation: string, duration: number): WorkflowError => {
    return createWorkflowError.timeout(operation, duration);
  },

  /**
   * Handle validation errors
   */
  handleValidation: (errors: string[] | Record<string, string>): WorkflowError => {
    return createWorkflowError.validation(errors);
  },
};

/**
 * Retry configuration presets - ES2022 modernized with shared constants
 */
export const RETRY_CONFIGS = {
  aggressive: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxAttempts: DEFAULT_RETRIES.aggressive,
    maxDelayMs: 30000,
    retryOn: [
      ...ERROR_RETRY_CATEGORIES.exponentialBackoff,
      ...ERROR_RETRY_CATEGORIES.constantDelay,
    ],
  },

  conservative: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry * 2,
    maxAttempts: DEFAULT_RETRIES.conservative,
    maxDelayMs: 60000,
    retryOn: ERROR_RETRY_CATEGORIES.exponentialBackoff,
  },

  networkOnly: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxAttempts: DEFAULT_RETRIES.network,
    maxDelayMs: 10000,
    retryOn: [WorkflowErrorType.NETWORK, WorkflowErrorType.TIMEOUT],
  },

  api: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxAttempts: DEFAULT_RETRIES.api,
    maxDelayMs: DEFAULT_TIMEOUTS.api,
    retryOn: ERROR_RETRY_CATEGORIES.exponentialBackoff,
  },

  noRetry: {
    baseDelayMs: 0,
    maxAttempts: 0,
    maxDelayMs: 0,
    retryOn: [],
  },
} as const satisfies Record<string, RetryConfig & { retryOn: readonly WorkflowErrorType[] }>;

/**
 * Classify error into WorkflowErrorType - primary error classifier
 */
export function classifyWorkflowError(error: unknown): WorkflowErrorType {
  if (error instanceof WorkflowError) {
    return error.type;
  }

  // Check for HTTP status codes
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as any).status;

    switch (status) {
      case 401:
        return WorkflowErrorType.AUTHENTICATION;
      case 403:
        return WorkflowErrorType.PERMISSION;
      case 404:
        return WorkflowErrorType.NOT_FOUND;
      case 409:
        return WorkflowErrorType.CONFLICT;
      case 429:
        return WorkflowErrorType.RATE_LIMIT;
      case 408:
      case 504:
        return WorkflowErrorType.TIMEOUT;
      default:
        if (status >= 500) {
          return WorkflowErrorType.EXTERNAL_API;
        }
    }
  }

  // Check error message patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (error instanceof TypeError && message.includes('fetch')) {
      return WorkflowErrorType.NETWORK;
    }
    if (message.includes('econnrefused') || message.includes('enotfound')) {
      return WorkflowErrorType.NETWORK;
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('timed out')) {
      return WorkflowErrorType.TIMEOUT;
    }

    // Rate limit errors
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return WorkflowErrorType.RATE_LIMIT;
    }

    // Not found errors
    if (message.includes('not found') || message.includes('404')) {
      return WorkflowErrorType.NOT_FOUND;
    }

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('authentication')
    ) {
      return WorkflowErrorType.AUTHENTICATION;
    }

    // Permission errors
    if (
      message.includes('forbidden') ||
      message.includes('403') ||
      message.includes('permission')
    ) {
      return WorkflowErrorType.PERMISSION;
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return WorkflowErrorType.VALIDATION;
    }

    // Configuration errors
    if (message.includes('configuration') || message.includes('config')) {
      return WorkflowErrorType.CONFIGURATION;
    }
  }

  return WorkflowErrorType.INTERNAL;
}

/**
 * Classify error into simple type (backward compatible)
 */
export function classifyError(error: unknown): {
  type: 'network' | 'timeout' | 'rate_limit' | 'unknown';
  message: string;
} {
  const workflowType = classifyWorkflowError(error);

  // Map WorkflowErrorType to simple types
  const typeMap: Record<WorkflowErrorType, 'network' | 'timeout' | 'rate_limit' | 'unknown'> = {
    [WorkflowErrorType.AUTHENTICATION]: 'unknown',
    [WorkflowErrorType.CONFIGURATION]: 'unknown',
    [WorkflowErrorType.CONFLICT]: 'unknown',
    [WorkflowErrorType.DATA_CORRUPTION]: 'unknown',
    [WorkflowErrorType.EXTERNAL_API]: 'unknown',
    [WorkflowErrorType.INTERNAL]: 'unknown',
    [WorkflowErrorType.NETWORK]: 'network',
    [WorkflowErrorType.NOT_FOUND]: 'unknown',
    [WorkflowErrorType.PERMISSION]: 'unknown',
    [WorkflowErrorType.RATE_LIMIT]: 'rate_limit',
    [WorkflowErrorType.RESOURCE_EXHAUSTED]: 'unknown',
    [WorkflowErrorType.TIMEOUT]: 'timeout',
    [WorkflowErrorType.UNAVAILABLE]: 'unknown',
    [WorkflowErrorType.VALIDATION]: 'unknown',
  };

  const message = error instanceof Error ? error.message : String(error);

  return {
    type: typeMap[workflowType],
    message,
  };
}

/**
 * Determine if an error should be retried
 */
export function isRetryableError(errorType: WorkflowErrorType): boolean {
  return (
    (ERROR_RETRY_CATEGORIES.exponentialBackoff as readonly WorkflowErrorType[]).includes(
      errorType,
    ) || (ERROR_RETRY_CATEGORIES.constantDelay as readonly WorkflowErrorType[]).includes(errorType)
  );
}

/**
 * Error factory functions for consistent error creation
 */
export const createWorkflowError = {
  timeout: (operation: string, duration?: number) =>
    new WorkflowError(
      WorkflowErrorType.TIMEOUT,
      `Operation timed out: ${operation}`,
      { duration, operation },
      true,
    ),

  validation: (errors: string[] | Record<string, string>) => {
    const message = Array.isArray(errors)
      ? errors.join(', ')
      : Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');
    return new WorkflowError(WorkflowErrorType.VALIDATION, message, { errors }, false);
  },

  rateLimit: (resource: string, retryAfter?: number) =>
    new WorkflowError(
      WorkflowErrorType.RATE_LIMIT,
      `Rate limit exceeded for ${resource}`,
      { resource, retryAfter },
      true,
    ),

  notFound: (resource: string) =>
    new WorkflowError(
      WorkflowErrorType.NOT_FOUND,
      `Resource not found: ${resource}`,
      { resource },
      false,
    ),

  network: (operation: string, error?: unknown) =>
    new WorkflowError(
      WorkflowErrorType.NETWORK,
      `Network error during ${operation}`,
      { operation, originalError: String(error) },
      true,
    ),

  internal: (message: string, details?: Record<string, any>) =>
    new WorkflowError(WorkflowErrorType.INTERNAL, message, details, false),

  conflict: (resource: string, reason?: string) =>
    new WorkflowError(
      WorkflowErrorType.CONFLICT,
      `Conflict on ${resource}${reason ? `: ${reason}` : ''}`,
      { reason, resource },
      false,
    ),

  permission: (action: string, resource?: string) =>
    new WorkflowError(
      WorkflowErrorType.PERMISSION,
      `Permission denied for ${action}${resource ? ` on ${resource}` : ''}`,
      { action, resource },
      false,
    ),

  externalApi: (api: string, status?: number, error?: unknown) =>
    new WorkflowError(
      WorkflowErrorType.EXTERNAL_API,
      `External API error from ${api}`,
      { api, originalError: String(error), status },
      true,
    ),

  configuration: (message: string, context?: Record<string, unknown>) =>
    new WorkflowError(WorkflowErrorType.CONFIGURATION, message, context, false),
};

/**
 * Generic error handling wrapper for API operations
 */
export async function withApiErrorHandling<T>(
  operation: () => Promise<T>,
  apiName: string,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw errorHandlers.handleApiError(error, apiName, context);
  }
}

/**
 * Error handling wrapper specifically for workflow execution
 */
export async function withWorkflowErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, unknown>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof WorkflowError) {
      throw error;
    }
    throw new WorkflowError(
      WorkflowErrorType.INTERNAL,
      createErrorMessage(`${operationName} failed`, error),
      { ...context, originalError: String(error) },
    );
  }
}

/**
 * Error handling wrapper with retry logic
 * @deprecated Use retryOperation from utils/retry.ts instead
 */
export async function withRetryErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  retryConfig = RETRY_CONFIGS.conservative,
  context?: Record<string, unknown>,
): Promise<T> {
  let lastError: WorkflowError | undefined;

  for (let attempt = 0; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const workflowError =
        error instanceof WorkflowError
          ? error
          : new WorkflowError(
              classifyWorkflowError(error),
              createErrorMessage(`${operationName} failed`, error),
              { ...context, attempt, originalError: String(error) },
            );

      lastError = workflowError;

      // Don't retry on last attempt
      if (attempt === retryConfig.maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!(retryConfig.retryOn as readonly WorkflowErrorType[]).includes(workflowError.type)) {
        break;
      }

      // Calculate delay
      const delay =
        workflowError.retryAfter ||
        ((ERROR_RETRY_CATEGORIES.exponentialBackoff as readonly WorkflowErrorType[]).includes(
          workflowError.type,
        )
          ? Math.min(retryConfig.baseDelayMs * Math.pow(2, attempt), retryConfig.maxDelayMs)
          : retryConfig.baseDelayMs);

      devLog.info(
        `Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts + 1})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Helper functions for error type checking
 */
export function isNetworkError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.NETWORK;
}

export function isTimeoutError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.TIMEOUT;
}

export function isRateLimitError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.RATE_LIMIT;
}

export function isAuthenticationError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.AUTHENTICATION;
}

export function isPermissionError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.PERMISSION;
}

export function isNotFoundError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.NOT_FOUND;
}

export function isValidationError(error: unknown): boolean {
  return classifyWorkflowError(error) === WorkflowErrorType.VALIDATION;
}

/**
 * HTTP status constants for consistent error handling
 */
export const HTTP_STATUS = {
  // Client errors
  BAD_REQUEST: 400,
  CONFLICT: 409,
  FORBIDDEN: 403,
  METHOD_NOT_ALLOWED: 405,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  UNAUTHORIZED: 401,
  UNPROCESSABLE_ENTITY: 422,

  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
  // Server errors
  INTERNAL_SERVER: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Map HTTP status to WorkflowErrorType
 */
export function classifyHttpStatus(status: number): WorkflowErrorType {
  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      return WorkflowErrorType.AUTHENTICATION;
    case HTTP_STATUS.FORBIDDEN:
      return WorkflowErrorType.PERMISSION;
    case HTTP_STATUS.NOT_FOUND:
      return WorkflowErrorType.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:
      return WorkflowErrorType.CONFLICT;
    case HTTP_STATUS.RATE_LIMIT:
      return WorkflowErrorType.RATE_LIMIT;
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return WorkflowErrorType.TIMEOUT;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
      return WorkflowErrorType.UNAVAILABLE;
    case HTTP_STATUS.BAD_REQUEST:
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return WorkflowErrorType.VALIDATION;
    default:
      if (status >= 500) {
        return WorkflowErrorType.EXTERNAL_API;
      }
      return WorkflowErrorType.INTERNAL;
  }
}

// ===== Response Creation (merged from response.ts) =====

/**
 * Common workflow response types
 */
export interface WorkflowResponse<T = any> {
  data?: T;
  error?: string;
  metadata?: {
    workflowRunId: string;
    duration?: number;
    timestamp: string;
    [key: string]: any;
  };
  status: 'success' | 'skipped' | 'failed';
}

/**
 * Create a standardized workflow response
 */
export function createResponse<T>(
  status: WorkflowResponse['status'],
  data?: T,
  metadata?: Partial<WorkflowResponse['metadata']>,
): WorkflowResponse<T> {
  return {
    status,
    ...(data && { data }),
    metadata: {
      timestamp: formatTimestamp(Date.now()),
      workflowRunId: metadata?.workflowRunId || '',
      ...metadata,
    },
  };
}

/**
 * Create a successful workflow response
 */
export function workflowSuccess<T>(
  data: T,
  metadata?: Partial<WorkflowResponse['metadata']>,
): WorkflowResponse<T> {
  return createResponse('success', data, metadata);
}

/**
 * Workflow error response utilities using centralized error creation
 */
export const workflowError = {
  /**
   * Create a validation error response
   */
  validation: (message: string, field?: string): WorkflowResponse => {
    const error = createWorkflowError.validation([message]);
    return {
      error: error.message,
      metadata: {
        errorType: 'validation',
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
        ...(field && { field }),
      },
      status: 'failed',
    };
  },

  /**
   * Create a not found error response
   */
  notFound: (resource: string, id?: string): WorkflowResponse => {
    const error = createWorkflowError.notFound(resource);
    return {
      error: error.message,
      metadata: {
        errorType: 'not_found',
        resource,
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
        ...(id && { id }),
      },
      status: 'failed',
    };
  },

  /**
   * Create a generic error response
   */
  generic: (error: unknown): WorkflowResponse => {
    const workflowErr = createWorkflowError.internal(String(error));
    return {
      error: workflowErr.message,
      metadata: {
        errorType: 'generic',
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
      },
      status: 'failed',
    };
  },

  /**
   * Create an error response from a WorkflowError
   */
  fromError: (error: WorkflowError): WorkflowResponse => {
    return {
      error: error.message,
      metadata: {
        errorType: error.type,
        timestamp: formatTimestamp(Date.now()),
        workflowRunId: '',
        ...(error.context || {}),
      },
      status: 'failed',
    };
  },
};
