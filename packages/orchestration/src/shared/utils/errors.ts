/**
 * Custom error classes for orchestration
 */

/**
 * Centralized error codes for consistent error handling across the orchestration package
 */
export enum OrchestrationErrorCodes {
  CANCEL_EXECUTION_ERROR = 'CANCEL_EXECUTION_ERROR',

  DUPLICATE_STEP = 'DUPLICATE_STEP',

  GET_EXECUTION_ERROR = 'GET_EXECUTION_ERROR',
  // Initialization and lifecycle errors
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  INVALID_STEP_DEFINITION = 'INVALID_STEP_DEFINITION',
  INVALID_STEP_REGISTRATION = 'INVALID_STEP_REGISTRATION',
  LIST_EXECUTIONS_ERROR = 'LIST_EXECUTIONS_ERROR',

  NO_PROVIDER_AVAILABLE = 'NO_PROVIDER_AVAILABLE',
  // Generic orchestration errors
  ORCHESTRATION_ERROR = 'ORCHESTRATION_ERROR',
  // Provider errors
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_REGISTRATION_ERROR = 'PROVIDER_REGISTRATION_ERROR',
  PROVIDER_UNHEALTHY = 'PROVIDER_UNHEALTHY',

  // Pattern-specific errors
  SCHEDULE_WORKFLOW_ERROR = 'SCHEDULE_WORKFLOW_ERROR',
  SHUTDOWN_ERROR = 'SHUTDOWN_ERROR',
  STEP_CUSTOM_VALIDATION_ERROR = 'STEP_CUSTOM_VALIDATION_ERROR',
  // Step factory errors
  STEP_FACTORY_DISABLED = 'STEP_FACTORY_DISABLED',
  STEP_INPUT_VALIDATION_ERROR = 'STEP_INPUT_VALIDATION_ERROR',
  STEP_NOT_FOUND = 'STEP_NOT_FOUND',
  STEP_OUTPUT_VALIDATION_ERROR = 'STEP_OUTPUT_VALIDATION_ERROR',
  STEP_TIMEOUT_ERROR = 'STEP_TIMEOUT_ERROR',

  UNSCHEDULE_WORKFLOW_ERROR = 'UNSCHEDULE_WORKFLOW_ERROR',
  // Workflow execution errors
  WORKFLOW_EXECUTION_ERROR = 'WORKFLOW_EXECUTION_ERROR',
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

export class OrchestrationError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;
  public readonly retryable: boolean;

  constructor(
    message: string,
    code = 'ORCHESTRATION_ERROR',
    retryable = false,
    context?: Record<string, any>,
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
      code: this.code,
      context: this.context,
      message: this.message,
      name: this.name,
      retryable: this.retryable,
      stack: this.stack,
    };
  }
}

export class CircuitBreakerError extends OrchestrationError {
  public readonly circuitName: string;
  public readonly state: 'half-open' | 'open';

  constructor(
    message: string,
    circuitName: string,
    state: 'half-open' | 'open',
    context?: Record<string, any>,
  ) {
    super(message, 'CIRCUIT_BREAKER_OPEN', true, context);
    this.name = 'CircuitBreakerError';
    this.circuitName = circuitName;
    this.state = state;
  }
}

export class ConfigurationError extends OrchestrationError {
  public readonly configPath?: string;

  constructor(message: string, configPath?: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', false, context);
    this.name = 'ConfigurationError';
    this.configPath = configPath;
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
    context?: Record<string, any>,
  ) {
    super(message, code, retryable, context);
    this.name = 'ProviderError';
    this.providerName = providerName;
    this.providerType = providerType;
  }
}

export class RateLimitError extends OrchestrationError {
  public readonly limit: number;
  public readonly retryAfter?: number;
  public readonly window: number;

  constructor(
    message: string,
    limit: number,
    window: number,
    retryAfter?: number,
    context?: Record<string, any>,
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', true, context);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.window = window;
    this.retryAfter = retryAfter;
  }
}

class TimeoutError extends OrchestrationError {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, context?: Record<string, any>) {
    super(message, 'OPERATION_TIMEOUT', false, context);
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class WorkflowExecutionError extends OrchestrationError {
  public readonly executionId?: string;
  public readonly stepId?: string;
  public readonly workflowId: string;

  constructor(
    message: string,
    workflowId: string,
    code = 'WORKFLOW_EXECUTION_ERROR',
    retryable = true,
    context?: {
      [key: string]: any;
      executionId?: string;
      stepId?: string;
    },
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

  constructor(message: string, validationErrors: ValidationError[], context?: Record<string, any>) {
    super(message, 'WORKFLOW_VALIDATION_ERROR', false, context);
    this.name = 'WorkflowValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Creates a standardized OrchestrationError with centralized error codes
 */
export function createOrchestrationError(
  message: string,
  options?: {
    code?: OrchestrationErrorCodes;
    context?: Record<string, any>;
    originalError?: Error;
    retryable?: boolean;
  },
): OrchestrationError {
  const context: any = { ...options?.context };

  if (options?.originalError) {
    context.originalError = {
      message: options.originalError.message,
      name: options.originalError.name,
      stack: options.originalError.stack,
    };
  }

  return new OrchestrationError(
    message,
    options?.code || OrchestrationErrorCodes.ORCHESTRATION_ERROR,
    options?.retryable ?? false,
    context,
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
    code?: string;
    originalError?: Error;
    retryable?: boolean;
  },
): ProviderError {
  const context: any = {};

  if (options?.originalError) {
    context.originalError = {
      message: options.originalError.message,
      name: options.originalError.name,
      stack: options.originalError.stack,
    };
  }

  return new ProviderError(
    message,
    providerName,
    providerType,
    options?.code || 'PROVIDER_ERROR',
    options?.retryable ?? true,
    context,
  );
}

/**
 * Creates a standardized ProviderError with centralized error codes
 */
export function createProviderErrorWithCode(
  message: string,
  providerName: string,
  providerType: string,
  options?: {
    code?: OrchestrationErrorCodes;
    context?: Record<string, any>;
    originalError?: Error;
    retryable?: boolean;
  },
): ProviderError {
  const context: any = { ...options?.context };

  if (options?.originalError) {
    context.originalError = {
      message: options.originalError.message,
      name: options.originalError.name,
      stack: options.originalError.stack,
    };
  }

  return new ProviderError(
    message,
    providerName,
    providerType,
    options?.code || OrchestrationErrorCodes.PROVIDER_ERROR,
    options?.retryable ?? true,
    context,
  );
}

/**
 * Creates a validation error with centralized error codes
 */
export function createValidationError(
  message: string,
  options?: {
    code?: OrchestrationErrorCodes;
    context?: Record<string, any>;
    validationErrors?: any[];
    validationResult?: any;
  },
): OrchestrationError {
  const context: any = { ...options?.context };

  if (options?.validationErrors) {
    context.validationErrors = options.validationErrors;
  }

  if (options?.validationResult) {
    context.validationResult = options.validationResult;
  }

  return new OrchestrationError(
    message,
    options?.code || OrchestrationErrorCodes.STEP_INPUT_VALIDATION_ERROR,
    false, // Validation errors are typically not retryable
    context,
  );
}

/**
 * Creates a workflow execution error with consistent formatting
 */
export function createWorkflowExecutionError(
  message: string,
  workflowId: string,
  options?: {
    code?: string;
    executionId?: string;
    originalError?: Error;
    retryable?: boolean;
    stepId?: string;
  },
): WorkflowExecutionError {
  const context: any = {};

  if (options?.executionId) context.executionId = options.executionId;
  if (options?.stepId) context.stepId = options.stepId;
  if (options?.originalError) {
    context.originalError = {
      message: options.originalError.message,
      name: options.originalError.name,
      stack: options.originalError.stack,
    };
  }

  return new WorkflowExecutionError(
    message,
    workflowId,
    options?.code || 'WORKFLOW_EXECUTION_ERROR',
    options?.retryable ?? true,
    context,
  );
}

/**
 * Creates a standardized WorkflowExecutionError with centralized error codes
 */
function createWorkflowExecutionErrorWithCode(
  message: string,
  workflowId: string,
  options?: {
    code?: OrchestrationErrorCodes;
    executionId?: string;
    originalError?: Error;
    retryable?: boolean;
    stepId?: string;
  },
): WorkflowExecutionError {
  const context: any = {};

  if (options?.executionId) context.executionId = options.executionId;
  if (options?.stepId) context.stepId = options.stepId;
  if (options?.originalError) {
    context.originalError = {
      message: options.originalError.message,
      name: options.originalError.name,
      stack: options.originalError.stack,
    };
  }

  return new WorkflowExecutionError(
    message,
    workflowId,
    options?.code || OrchestrationErrorCodes.WORKFLOW_EXECUTION_ERROR,
    options?.retryable ?? true,
    context,
  );
}

/**
 * Extracts error details for logging/monitoring
 */
function extractErrorDetails(error: Error): Record<string, any> {
  const details: Record<string, any> = {
    message: (error as Error)?.message || 'Unknown error',
    name: error.name,
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

  const errorString = (error as Error)?.message || 'Unknown error'?.toUpperCase() || '';
  return retryablePatterns.some((pattern: any) => errorString.includes(pattern));
}
