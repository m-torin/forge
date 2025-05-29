import { workflowError } from '../context/context';
import { devLog } from '../dev/development';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Error types for workflows
 */
export enum WorkflowErrorType {
  CONFLICT = 'conflict',
  EXTERNAL_API = 'external_api',
  INTERNAL = 'internal',
  NOT_FOUND = 'not_found',
  PERMISSION = 'permission',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
}

/**
 * Custom workflow error class
 */
export class WorkflowError extends Error {
  constructor(
    public type: WorkflowErrorType,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

/**
 * Error boundary for workflows
 */
export async function withErrorHandling<T>(
  context: WorkflowContext<any>,
  handler: () => Promise<T>,
  options?: {
    retryOn?: WorkflowErrorType[];
    maxRetries?: number;
    onError?: (error: unknown) => void;
  },
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await handler();
    } catch (error) {
      lastError = error;

      // Log the error
      devLog.error(`Workflow error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error);
      }

      // Check if we should retry
      if (error instanceof WorkflowError && options?.retryOn?.includes(error.type)) {
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await context.sleep(`retry-${attempt}`, delay / 1000);
          continue;
        }
      }

      // Don't retry for other errors
      break;
    }
  }

  // All retries exhausted, return error response
  if (lastError instanceof WorkflowError) {
    return workflowError.generic(lastError) as T;
  }

  return workflowError.generic(new Error('Workflow failed after retries')) as T;
}

/**
 * Common error handlers
 */
export const errorHandlers = {
  /**
   * Handle API errors
   */
  handleApiError: (error: unknown, api: string): WorkflowError => {
    if (error instanceof Response) {
      const status = error.status;
      if (status === 429) {
        return new WorkflowError(WorkflowErrorType.RATE_LIMIT, `Rate limit exceeded for ${api}`, {
          api,
          status,
        });
      }
      if (status === 404) {
        return new WorkflowError(WorkflowErrorType.NOT_FOUND, `Resource not found on ${api}`, {
          api,
          status,
        });
      }
      if (status >= 500) {
        return new WorkflowError(WorkflowErrorType.EXTERNAL_API, `${api} server error`, {
          api,
          status,
        });
      }
    }

    return new WorkflowError(WorkflowErrorType.EXTERNAL_API, `Failed to call ${api}`, {
      api,
      error: String(error),
    });
  },

  /**
   * Handle timeout errors
   */
  handleTimeout: (operation: string, duration: number): WorkflowError => {
    return new WorkflowError(WorkflowErrorType.TIMEOUT, `Operation timed out: ${operation}`, {
      duration,
      operation,
    });
  },

  /**
   * Handle validation errors
   */
  handleValidation: (errors: string[] | Record<string, string>): WorkflowError => {
    const message = Array.isArray(errors)
      ? errors.join(', ')
      : Object.entries(errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join(', ');

    return new WorkflowError(WorkflowErrorType.VALIDATION, message, { errors });
  },
};

/**
 * Retry configuration presets
 */
export const retryPresets = {
  /**
   * Retry on rate limits and server errors
   */
  apiCalls: {
    maxRetries: 3,
    retryOn: [WorkflowErrorType.RATE_LIMIT, WorkflowErrorType.EXTERNAL_API],
  },

  /**
   * Retry on timeouts only
   */
  timeouts: {
    maxRetries: 2,
    retryOn: [WorkflowErrorType.TIMEOUT],
  },

  /**
   * No retries
   */
  noRetry: {
    maxRetries: 0,
    retryOn: [],
  },
};

/**
 * Circuit breaker for workflows
 */
export class WorkflowCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private halfOpenRequests = 3,
  ) {}

  async execute<T>(operation: string, handler: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailureTime < this.timeout) {
        throw new WorkflowError(
          WorkflowErrorType.INTERNAL,
          `Circuit breaker is open for ${operation}`,
          { operation, state: this.state },
        );
      }
      // Move to half-open state
      this.state = 'half-open';
      this.failures = 0;
    }

    try {
      const result = await handler();

      // Success - reset failures if in half-open state
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      // Check if we should open the circuit
      if (this.failures >= this.threshold) {
        this.state = 'open';
        devLog.warn(`Circuit breaker opened for ${operation} after ${this.failures} failures`);
      }

      throw error;
    }
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}
