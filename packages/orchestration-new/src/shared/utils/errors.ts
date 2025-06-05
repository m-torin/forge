/**
 * Custom error classes for orchestration
 */

export class OrchestrationError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code = 'ORCHESTRATION_ERROR',
    retryable = false,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'OrchestrationError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OrchestrationError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      context: this.context,
      message: this.message,
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

export class WorkflowExecutionError extends OrchestrationError {
  public readonly workflowId: string;
  public readonly executionId?: string;
  public readonly stepId?: string;

  constructor(
    message: string,
    workflowId: string,
    code = 'WORKFLOW_EXECUTION_ERROR',
    retryable = true,
    context?: {
      executionId?: string;
      stepId?: string;
      [key: string]: any;
    }
  ) {
    super(message, code, retryable, context);
    this.name = 'WorkflowExecutionError';
    this.workflowId = workflowId;
    this.executionId = context?.executionId;
    this.stepId = context?.stepId;
  }
}

export class WorkflowValidationError extends OrchestrationError {
  public readonly validationErrors: ValidationError[];

  constructor(
    message: string,
    validationErrors: ValidationError[],
    context?: Record<string, any>
  ) {
    super(message, 'WORKFLOW_VALIDATION_ERROR', false, context);
    this.name = 'WorkflowValidationError';
    this.validationErrors = validationErrors;
  }
}

export class ProviderError extends OrchestrationError {
  public readonly providerName: string;
  public readonly providerType: string;

  constructor(
    message: string,
    providerName: string,
    providerType: string,
    code = 'PROVIDER_ERROR',
    retryable = true,
    context?: Record<string, any>
  ) {
    super(message, code, retryable, context);
    this.name = 'ProviderError';
    this.providerName = providerName;
    this.providerType = providerType;
  }
}

export class RateLimitError extends OrchestrationError {
  public readonly limit: number;
  public readonly window: number;
  public readonly retryAfter?: number;

  constructor(
    message: string,
    limit: number,
    window: number,
    retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', true, context);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.window = window;
    this.retryAfter = retryAfter;
  }
}

export class CircuitBreakerError extends OrchestrationError {
  public readonly circuitName: string;
  public readonly state: 'open' | 'half-open';

  constructor(
    message: string,
    circuitName: string,
    state: 'open' | 'half-open',
    context?: Record<string, any>
  ) {
    super(message, 'CIRCUIT_BREAKER_OPEN', true, context);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.state = state;
  }
}

export class TimeoutError extends OrchestrationError {
  public readonly timeoutMs: number;

  constructor(
    message: string,
    timeoutMs: number,
    context?: Record<string, any>
  ) {
    super(message, 'OPERATION_TIMEOUT', false, context);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ConfigurationError extends OrchestrationError {
  public readonly configPath?: string;

  constructor(
    message: string,
    configPath?: string,
    context?: Record<string, any>
  ) {
    super(message, 'CONFIGURATION_ERROR', false, context);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
  }
}

export interface ValidationError {
  /** Error message */
  message: string;
  /** Field path where error occurred */
  path: string;
  /** Validation rule that failed */
  rule?: string;
  /** Invalid value */
  value?: any;
}

/**
 * Creates a workflow execution error with consistent formatting
 */
export function createWorkflowExecutionError(
  message: string,
  workflowId: string,
  options?: {
    executionId?: string;
    stepId?: string;
    originalError?: Error;
    retryable?: boolean;
    code?: string;
  }
): WorkflowExecutionError {
  const context: any = {};
  
  if (options?.executionId) context.executionId = options.executionId;
  if (options?.stepId) context.stepId = options.stepId;
  if (options?.originalError) {
    context.originalError = {
      name: options.originalError.name,
      message: options.originalError.message,
      stack: options.originalError.stack,
    };
  }

  return new WorkflowExecutionError(
    message,
    workflowId,
    options?.code || 'WORKFLOW_EXECUTION_ERROR',
    options?.retryable ?? true,
    context
  );
}

/**
 * Creates a provider error with consistent formatting
 */
export function createProviderError(
  message: string,
  providerName: string,
  providerType: string,
  options?: {
    originalError?: Error;
    retryable?: boolean;
    code?: string;
  }
): ProviderError {
  const context: any = {};
  
  if (options?.originalError) {
    context.originalError = {
      name: options.originalError.name,
      message: options.originalError.message,
      stack: options.originalError.stack,
    };
  }

  return new ProviderError(
    message,
    providerName,
    providerType,
    options?.code || 'PROVIDER_ERROR',
    options?.retryable ?? true,
    context
  );
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
  if (error instanceof OrchestrationError) {
    return error.retryable;
  }

  // Common retryable error patterns
  const retryablePatterns = [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
  ];

  const errorString = error.message?.toUpperCase() || '';
  return retryablePatterns.some(pattern => errorString.includes(pattern));
}

/**
 * Extracts error details for logging/monitoring
 */
export function extractErrorDetails(error: Error): Record<string, any> {
  const details: Record<string, any> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof OrchestrationError) {
    details.code = error.code;
    details.retryable = error.retryable;
    details.context = error.context;
  }

  if (error instanceof WorkflowExecutionError) {
    details.workflowId = error.workflowId;
    details.executionId = error.executionId;
    details.stepId = error.stepId;
  }

  if (error instanceof ProviderError) {
    details.providerName = error.providerName;
    details.providerType = error.providerType;
  }

  return details;
}