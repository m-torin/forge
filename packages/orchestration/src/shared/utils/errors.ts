/**
 * Custom Error Classes for Orchestration
 * Provides detailed error information for workflow execution
 */

/**
 * Base orchestration error
 */
export class OrchestrationError extends Error {
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'OrchestrationError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Provider-related errors
 */
export class ProviderError extends OrchestrationError {
  public readonly provider: string;

  constructor(provider: string, message: string, code: string, details?: any) {
    super(message, code, details);
    this.name = 'ProviderError';
    this.provider = provider;
  }
}

/**
 * Provider not found error
 */
export class ProviderNotFoundError extends ProviderError {
  constructor(provider: string) {
    super(provider, `Provider "${provider}" not found`, 'PROVIDER_NOT_FOUND');
    this.name = 'ProviderNotFoundError';
  }
}

/**
 * Provider initialization error
 */
export class ProviderInitializationError extends ProviderError {
  constructor(provider: string, reason: string, details?: any) {
    super(
      provider,
      `Failed to initialize provider "${provider}": ${reason}`,
      'PROVIDER_INIT_FAILED',
      details,
    );
    this.name = 'ProviderInitializationError';
  }
}

/**
 * Provider not available error
 */
export class ProviderNotAvailableError extends ProviderError {
  constructor(provider: string, reason?: string) {
    super(
      provider,
      `Provider "${provider}" is not available${reason ? `: ${reason}` : ''}`,
      'PROVIDER_NOT_AVAILABLE',
    );
    this.name = 'ProviderNotAvailableError';
  }
}

/**
 * Workflow-related errors
 */
export class WorkflowError extends OrchestrationError {
  public readonly workflowId: string;
  public readonly runId?: string;

  constructor(workflowId: string, message: string, code: string, details?: any, runId?: string) {
    super(message, code, details);
    this.name = 'WorkflowError';
    this.workflowId = workflowId;
    this.runId = runId;
  }
}

/**
 * Workflow validation error
 */
export class WorkflowValidationError extends WorkflowError {
  public readonly validationErrors: Array<{
    path: string;
    message: string;
  }>;

  constructor(workflowId: string, validationErrors: Array<{ path: string; message: string }>) {
    super(
      workflowId,
      `Workflow validation failed: ${validationErrors.map((e) => e.message).join(', ')}`,
      'WORKFLOW_VALIDATION_FAILED',
      { validationErrors },
    );
    this.name = 'WorkflowValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Workflow execution error
 */
export class WorkflowExecutionError extends WorkflowError {
  public readonly stepName?: string;
  public readonly attemptNumber?: number;

  constructor(
    workflowId: string,
    runId: string,
    message: string,
    details?: any,
    stepName?: string,
    attemptNumber?: number,
  ) {
    super(
      workflowId,
      message,
      'WORKFLOW_EXECUTION_FAILED',
      { ...details, stepName, attemptNumber },
      runId,
    );
    this.name = 'WorkflowExecutionError';
    this.stepName = stepName;
    this.attemptNumber = attemptNumber;
  }
}

/**
 * Workflow timeout error
 */
export class WorkflowTimeoutError extends WorkflowError {
  public readonly timeoutMs: number;

  constructor(workflowId: string, runId: string, timeoutMs: number) {
    super(
      workflowId,
      `Workflow execution timed out after ${timeoutMs}ms`,
      'WORKFLOW_TIMEOUT',
      { timeoutMs },
      runId,
    );
    this.name = 'WorkflowTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Workflow not found error
 */
export class WorkflowNotFoundError extends WorkflowError {
  constructor(workflowId: string) {
    super(workflowId, `Workflow "${workflowId}" not found`, 'WORKFLOW_NOT_FOUND');
    this.name = 'WorkflowNotFoundError';
  }
}

/**
 * Step-related errors
 */
export class StepError extends OrchestrationError {
  public readonly stepName: string;
  public readonly workflowId?: string;
  public readonly runId?: string;

  constructor(
    stepName: string,
    message: string,
    code: string,
    details?: any,
    workflowId?: string,
    runId?: string,
  ) {
    super(message, code, details);
    this.name = 'StepError';
    this.stepName = stepName;
    this.workflowId = workflowId;
    this.runId = runId;
  }
}

/**
 * Step validation error
 */
export class StepValidationError extends StepError {
  public readonly validationType: 'input' | 'output';

  constructor(
    stepName: string,
    validationType: 'input' | 'output',
    message: string,
    details?: any,
  ) {
    super(
      stepName,
      `Step ${validationType} validation failed: ${message}`,
      'STEP_VALIDATION_FAILED',
      { ...details, validationType },
    );
    this.name = 'StepValidationError';
    this.validationType = validationType;
  }
}

/**
 * Step execution error
 */
export class StepExecutionError extends StepError {
  public readonly originalError?: Error;

  constructor(
    stepName: string,
    message: string,
    originalError?: Error,
    workflowId?: string,
    runId?: string,
  ) {
    super(
      stepName,
      message,
      'STEP_EXECUTION_FAILED',
      { originalError: originalError?.message },
      workflowId,
      runId,
    );
    this.name = 'StepExecutionError';
    this.originalError = originalError;
  }
}

/**
 * Step timeout error
 */
export class StepTimeoutError extends StepError {
  public readonly timeoutMs: number;

  constructor(stepName: string, timeoutMs: number, workflowId?: string, runId?: string) {
    super(
      stepName,
      `Step execution timed out after ${timeoutMs}ms`,
      'STEP_TIMEOUT',
      { timeoutMs },
      workflowId,
      runId,
    );
    this.name = 'StepTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Rate limiting error
 */
export class RateLimitError extends OrchestrationError {
  public readonly limit: number;
  public readonly window: number;
  public readonly retryAfter?: number;

  constructor(limit: number, window: number, retryAfter?: number) {
    super(`Rate limit exceeded: ${limit} requests per ${window}ms`, 'RATE_LIMIT_EXCEEDED', {
      limit,
      window,
      retryAfter,
    });
    this.name = 'RateLimitError';
    this.limit = limit;
    this.window = window;
    this.retryAfter = retryAfter;
  }
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends OrchestrationError {
  public readonly state: 'open' | 'half-open';
  public readonly resetTimeout: number;

  constructor(state: 'open' | 'half-open', resetTimeout: number) {
    super(`Circuit breaker is ${state}`, 'CIRCUIT_BREAKER_OPEN', { state, resetTimeout });
    this.name = 'CircuitBreakerError';
    this.state = state;
    this.resetTimeout = resetTimeout;
  }
}

/**
 * Deduplication error
 */
export class DeduplicationError extends OrchestrationError {
  public readonly duplicateKey: string;
  public readonly originalRunId?: string;

  constructor(duplicateKey: string, originalRunId?: string) {
    super(`Duplicate execution detected for key: ${duplicateKey}`, 'DUPLICATE_EXECUTION', {
      duplicateKey,
      originalRunId,
    });
    this.name = 'DeduplicationError';
    this.duplicateKey = duplicateKey;
    this.originalRunId = originalRunId;
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends OrchestrationError {
  public readonly configKey: string;

  constructor(configKey: string, message: string, details?: any) {
    super(`Configuration error for "${configKey}": ${message}`, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends OrchestrationError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_FAILED', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends OrchestrationError {
  public readonly requiredPermissions?: string[];

  constructor(message: string, requiredPermissions?: string[]) {
    super(message, 'AUTHORIZATION_FAILED', { requiredPermissions });
    this.name = 'AuthorizationError';
    this.requiredPermissions = requiredPermissions;
  }
}

/**
 * Error utility functions
 */
export const ErrorUtils = {
  /**
   * Check if error is retryable
   */
  isRetryable(error: Error): boolean {
    if (error instanceof RateLimitError) return true;
    if (error instanceof CircuitBreakerError) return false;
    if (error instanceof AuthenticationError) return false;
    if (error instanceof AuthorizationError) return false;
    if (error instanceof WorkflowValidationError) return false;
    if (error instanceof StepValidationError) return false;
    if (error instanceof DeduplicationError) return false;
    if (error instanceof ConfigurationError) return false;

    // Network errors are usually retryable
    if (error.message.includes('ECONNREFUSED')) return true;
    if (error.message.includes('ETIMEDOUT')) return true;
    if (error.message.includes('ENOTFOUND')) return true;

    return false;
  },

  /**
   * Extract error code
   */
  getErrorCode(error: Error): string {
    if (error instanceof OrchestrationError) {
      return error.code;
    }
    return 'UNKNOWN_ERROR';
  },

  /**
   * Create user-friendly error message
   */
  getUserMessage(error: Error): string {
    if (error instanceof ProviderNotFoundError) {
      return 'The requested service is not available.';
    }
    if (error instanceof WorkflowNotFoundError) {
      return 'The requested workflow does not exist.';
    }
    if (error instanceof RateLimitError) {
      return 'Too many requests. Please try again later.';
    }
    if (error instanceof AuthenticationError) {
      return 'Authentication required.';
    }
    if (error instanceof AuthorizationError) {
      return 'You do not have permission to perform this action.';
    }
    if (error instanceof WorkflowTimeoutError) {
      return 'The operation took too long to complete.';
    }

    return 'An error occurred while processing your request.';
  },

  /**
   * Wrap error with context
   */
  wrapError(
    error: Error,
    context: { workflowId?: string; stepName?: string; runId?: string },
  ): Error {
    if (error instanceof OrchestrationError) {
      return error;
    }

    if (context.stepName) {
      return new StepExecutionError(
        context.stepName,
        error.message,
        error,
        context.workflowId,
        context.runId,
      );
    }

    if (context.workflowId) {
      return new WorkflowExecutionError(
        context.workflowId,
        context.runId || 'unknown',
        error.message,
        { originalError: error.message },
      );
    }

    return new OrchestrationError(error.message, 'UNKNOWN_ERROR', { originalError: error.message });
  },
};
