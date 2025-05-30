import { classifyError as classifyErrorHelper, createErrorMessage } from './helpers';
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

    // Use enhanced error classification
    const classification = classifyErrorHelper(error);

    switch (classification.type) {
      case 'network':
        return new WorkflowError(
          WorkflowErrorType.NETWORK,
          `Network error calling ${api}`,
          { api, error: classification.message, ...context },
          true,
        );
      case 'timeout':
        return new WorkflowError(
          WorkflowErrorType.TIMEOUT,
          `Timeout calling ${api}`,
          { api, error: classification.message, ...context },
          true,
        );
      case 'rate_limit':
        return new WorkflowError(
          WorkflowErrorType.RATE_LIMIT,
          `Rate limit exceeded for ${api}`,
          { api, error: classification.message, ...context },
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
    maxDelayMs: 30000,
    maxRetries: DEFAULT_RETRIES.aggressive,
    retryOn: [
      ...ERROR_RETRY_CATEGORIES.exponentialBackoff,
      ...ERROR_RETRY_CATEGORIES.constantDelay,
    ],
  },

  conservative: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry * 2,
    maxDelayMs: 60000,
    maxRetries: DEFAULT_RETRIES.conservative,
    retryOn: ERROR_RETRY_CATEGORIES.exponentialBackoff,
  },

  networkOnly: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxDelayMs: 10000,
    maxRetries: DEFAULT_RETRIES.network,
    retryOn: [WorkflowErrorType.NETWORK, WorkflowErrorType.TIMEOUT],
  },

  api: {
    baseDelayMs: DEFAULT_TIMEOUTS.retry,
    maxDelayMs: DEFAULT_TIMEOUTS.api,
    maxRetries: DEFAULT_RETRIES.api,
    retryOn: ERROR_RETRY_CATEGORIES.exponentialBackoff,
  },

  noRetry: {
    baseDelayMs: 0,
    maxDelayMs: 0,
    maxRetries: 0,
    retryOn: [],
  },
} as const satisfies Record<string, RetryConfig & { retryOn: readonly WorkflowErrorType[] }>;

/**
 * Classify error into WorkflowErrorType - ES2022 modernized
 * This wraps the helper function to return WorkflowErrorType instead of the helper's return type
 */
export function classifyWorkflowError(error: unknown): WorkflowErrorType {
  if (error instanceof WorkflowError) {
    return error.type;
  }

  // Use the enhanced helper function
  const classification = classifyErrorHelper(error);

  // Map helper classifications to WorkflowErrorType
  const typeMap = {
    network: WorkflowErrorType.NETWORK,
    rate_limit: WorkflowErrorType.RATE_LIMIT,
    timeout: WorkflowErrorType.TIMEOUT,
    unknown: WorkflowErrorType.INTERNAL,
  } as const;

  const mappedType = typeMap[classification.type];
  if (mappedType) {
    return mappedType;
  }

  // Additional checks for specific error patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('not found') || message.includes('404')) {
      return WorkflowErrorType.NOT_FOUND;
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return WorkflowErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return WorkflowErrorType.PERMISSION;
    }
  }

  return WorkflowErrorType.INTERNAL;
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
 */
export async function withRetryErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string,
  retryConfig = RETRY_CONFIGS.conservative,
  context?: Record<string, unknown>,
): Promise<T> {
  let lastError: WorkflowError | undefined;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
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
      if (attempt === retryConfig.maxRetries) {
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
        `Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries + 1})`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
