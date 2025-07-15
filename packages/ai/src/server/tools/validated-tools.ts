/**
 * Tool Execution Validation and Error Recovery - AI SDK v5
 *
 * Provides comprehensive validation, error recovery, and resilience patterns
 * for production-ready tool execution.
 */

import { logWarn } from '@repo/observability';
import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod/v4';

/**
 * Validation levels
 */
export type ValidationLevel = 'none' | 'basic' | 'strict' | 'comprehensive';

/**
 * Error recovery strategies
 */
export type ErrorRecoveryStrategy =
  | 'fail-fast'
  | 'retry'
  | 'retry-with-backoff'
  | 'circuit-breaker'
  | 'graceful-degradation'
  | 'fallback';

/**
 * Tool validation configuration
 */
export interface ToolValidationConfig {
  /** Input validation level */
  inputValidation: ValidationLevel;
  /** Output validation level */
  outputValidation: ValidationLevel;
  /** Input schema for validation */
  inputSchema?: z.ZodSchema;
  /** Output schema for validation */
  outputSchema?: z.ZodSchema;
  /** Custom input validators */
  customInputValidators?: Array<(input: any) => Promise<ValidationResult> | ValidationResult>;
  /** Custom output validators */
  customOutputValidators?: Array<(output: any) => Promise<ValidationResult> | ValidationResult>;
  /** Sanitize input before execution */
  sanitizeInput?: boolean;
  /** Sanitize output after execution */
  sanitizeOutput?: boolean;
}

/**
 * Error recovery configuration
 */
export interface ErrorRecoveryConfig {
  /** Recovery strategy */
  strategy: ErrorRecoveryStrategy;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Base delay for backoff (ms) */
  baseDelay?: number;
  /** Maximum delay for backoff (ms) */
  maxDelay?: number;
  /** Circuit breaker failure threshold */
  circuitBreakerThreshold?: number;
  /** Circuit breaker reset timeout (ms) */
  circuitBreakerTimeout?: number;
  /** Fallback function */
  fallbackFn?: (input: any, error: any) => Promise<any> | any;
  /** Custom error classifier */
  errorClassifier?: (error: any) => 'retryable' | 'non-retryable' | 'circuit-break';
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  sanitized?: any;
}

/**
 * Tool execution metrics
 */
export interface ToolExecutionMetrics {
  toolName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  errorRate: number;
  lastError?: string;
  circuitBreakerOpen?: boolean;
}

/**
 * Circuit breaker state
 */
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

/**
 * Global circuit breaker registry
 */
const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Global execution metrics registry
 */
const executionMetrics = new Map<string, ToolExecutionMetrics>();

/**
 * Input sanitizers
 */
export const inputSanitizers = {
  /**
   * Remove potentially dangerous HTML/script tags
   */
  removeScripts: (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = inputSanitizers.removeScripts(value);
      }
      return sanitized;
    }
    return input;
  },

  /**
   * Trim whitespace from strings
   */
  trimStrings: (input: any): any => {
    if (typeof input === 'string') {
      return input.trim();
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = inputSanitizers.trimStrings(value);
      }
      return sanitized;
    }
    return input;
  },

  /**
   * Limit string lengths
   */
  limitStringLength:
    (maxLength: number) =>
    (input: any): any => {
      if (typeof input === 'string' && input.length > maxLength) {
        return input.slice(0, maxLength);
      }
      if (typeof input === 'object' && input !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
          sanitized[key] = inputSanitizers.limitStringLength(maxLength)(value);
        }
        return sanitized;
      }
      return input;
    },

  /**
   * Remove null/undefined values
   */
  removeNulls: (input: any): any => {
    if (Array.isArray(input)) {
      return input.filter(item => item != null).map(inputSanitizers.removeNulls);
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (value != null) {
          sanitized[key] = inputSanitizers.removeNulls(value);
        }
      }
      return sanitized;
    }
    return input;
  },
};

/**
 * Built-in validators
 */
export const validators = {
  /**
   * Validate required fields
   */
  requiredFields:
    (fields: string[]) =>
    (input: any): ValidationResult => {
      const errors: string[] = [];

      for (const field of fields) {
        if (!(field in input) || input[field] == null) {
          errors.push(`Required field '${field}' is missing`);
        }
      }

      return { valid: errors.length === 0, errors };
    },

  /**
   * Validate string lengths
   */
  stringLengths:
    (limits: Record<string, { min?: number; max?: number }>) =>
    (input: any): ValidationResult => {
      const errors: string[] = [];

      for (const [field, { min, max }] of Object.entries(limits)) {
        const value = input[field];
        if (typeof value === 'string') {
          if (min !== undefined && value.length < min) {
            errors.push(`Field '${field}' must be at least ${min} characters`);
          }
          if (max !== undefined && value.length > max) {
            errors.push(`Field '${field}' must be at most ${max} characters`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },

  /**
   * Validate numeric ranges
   */
  numericRanges:
    (ranges: Record<string, { min?: number; max?: number }>) =>
    (input: any): ValidationResult => {
      const errors: string[] = [];

      for (const [field, { min, max }] of Object.entries(ranges)) {
        const value = input[field];
        if (typeof value === 'number') {
          if (min !== undefined && value < min) {
            errors.push(`Field '${field}' must be at least ${min}`);
          }
          if (max !== undefined && value > max) {
            errors.push(`Field '${field}' must be at most ${max}`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },

  /**
   * Validate URL format
   */
  urlFormat:
    (fields: string[]) =>
    (input: any): ValidationResult => {
      const errors: string[] = [];

      for (const field of fields) {
        const value = input[field];
        if (typeof value === 'string') {
          try {
            new URL(value);
          } catch {
            errors.push(`Field '${field}' must be a valid URL`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    },

  /**
   * Validate email format
   */
  emailFormat:
    (fields: string[]) =>
    (input: any): ValidationResult => {
      const errors: string[] = [];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (const field of fields) {
        const value = input[field];
        if (typeof value === 'string' && !emailRegex.test(value)) {
          errors.push(`Field '${field}' must be a valid email address`);
        }
      }

      return { valid: errors.length === 0, errors };
    },
};

/**
 * Error classifiers
 */
export const errorClassifiers = {
  /**
   * HTTP error classifier
   */
  http: (error: any): 'retryable' | 'non-retryable' | 'circuit-break' => {
    if (error.response?.status) {
      const status = error.response.status;
      if (status >= 500) return 'retryable'; // Server errors
      if (status >= 400 && status < 500) return 'non-retryable'; // Client errors
    }
    return 'retryable';
  },

  /**
   * Network error classifier
   */
  network: (error: any): 'retryable' | 'non-retryable' | 'circuit-break' => {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('timeout') || message.includes('econnreset')) {
      return 'retryable';
    }
    if (message.includes('enotfound') || message.includes('econnrefused')) {
      return 'circuit-break';
    }
    return 'non-retryable';
  },

  /**
   * Validation error classifier
   */
  validation: (_error: any): 'retryable' | 'non-retryable' | 'circuit-break' => {
    return 'non-retryable'; // Validation errors should not be retried
  },
};

/**
 * Validate input or output
 */
async function validateData(
  data: any,
  config: ToolValidationConfig,
  type: 'input' | 'output',
): Promise<ValidationResult> {
  const level = type === 'input' ? config.inputValidation : config.outputValidation;
  const schema = type === 'input' ? config.inputSchema : config.outputSchema;
  const customValidators =
    type === 'input' ? config.customInputValidators : config.customOutputValidators;

  if (level === 'none') {
    return { valid: true };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  let sanitized = data;

  // Schema validation
  if (schema) {
    try {
      sanitized = schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(`Schema validation failed: ${error}`);
      }
    }
  }

  // Custom validators
  if (customValidators) {
    for (const validator of customValidators) {
      const result = await validator(sanitized);
      if (!result.valid) {
        errors.push(...(result.errors || []));
        warnings.push(...(result.warnings || []));
      }
      if (result.sanitized !== undefined) {
        sanitized = result.sanitized;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    sanitized,
  };
}

/**
 * Execute with error recovery
 */
async function executeWithRecovery<T>(
  toolName: string,
  executeFn: () => Promise<T>,
  config: ErrorRecoveryConfig,
): Promise<T> {
  const { strategy, maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = config;

  let lastError: any;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      // Check circuit breaker
      if (strategy === 'circuit-breaker') {
        const cb = circuitBreakers.get(toolName);
        if (cb?.state === 'open') {
          const timeSinceLastFailure = Date.now() - cb.lastFailureTime;
          if (timeSinceLastFailure < (config.circuitBreakerTimeout || 60000)) {
            throw new Error('Circuit breaker is open');
          }
          // Try half-open
          cb.state = 'half-open';
        }
      }

      const result = await executeFn();

      // Reset circuit breaker on success
      if (strategy === 'circuit-breaker') {
        const cb = circuitBreakers.get(toolName);
        if (cb) {
          cb.failures = 0;
          cb.state = 'closed';
        }
      }

      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // Classify error
      const errorType = config.errorClassifier?.(error) || 'retryable';

      // Handle circuit breaker
      if (strategy === 'circuit-breaker') {
        let cb = circuitBreakers.get(toolName);
        if (!cb) {
          cb = { failures: 0, lastFailureTime: Date.now(), state: 'closed' };
          circuitBreakers.set(toolName, cb);
        }

        cb.failures++;
        cb.lastFailureTime = Date.now();

        if (cb.failures >= (config.circuitBreakerThreshold || 5)) {
          cb.state = 'open';
        }

        if (errorType === 'circuit-break' && cb.state === 'open') {
          break;
        }
      }

      // Handle non-retryable errors
      if (errorType === 'non-retryable' || strategy === 'fail-fast') {
        break;
      }

      // Check if we should retry
      if (attempt > maxRetries) {
        break;
      }

      // Calculate delay for backoff
      if (strategy === 'retry-with-backoff') {
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (strategy === 'retry') {
        await new Promise(resolve => setTimeout(resolve, baseDelay));
      }
    }
  }

  // Try fallback if available
  if (config.fallbackFn) {
    try {
      return await config.fallbackFn(null, lastError);
    } catch (fallbackError) {
      throw new Error(`Execution failed and fallback failed: ${fallbackError}`);
    }
  }

  throw lastError;
}

/**
 * Update execution metrics
 */
function updateMetrics(
  toolName: string,
  success: boolean,
  executionTime: number,
  error?: any,
): void {
  let metrics = executionMetrics.get(toolName);

  if (!metrics) {
    metrics = {
      toolName,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      averageExecutionTime: 0,
      lastExecutionTime: executionTime,
      errorRate: 0,
    };
    executionMetrics.set(toolName, metrics);
  }

  metrics.totalExecutions++;
  metrics.lastExecutionTime = executionTime;

  if (success) {
    metrics.successfulExecutions++;
  } else {
    metrics.failedExecutions++;
    metrics.lastError = error?.message || String(error);
  }

  metrics.errorRate = metrics.failedExecutions / metrics.totalExecutions;
  metrics.averageExecutionTime =
    (metrics.averageExecutionTime * (metrics.totalExecutions - 1) + executionTime) /
    metrics.totalExecutions;

  // Update circuit breaker status
  const cb = circuitBreakers.get(toolName);
  metrics.circuitBreakerOpen = cb?.state === 'open';
}

/**
 * Create a validated tool with comprehensive error recovery
 */
export function createValidatedTool<_TParams, _TResult>(
  baseTool: Tool,
  validationConfig: ToolValidationConfig,
  recoveryConfig: ErrorRecoveryConfig,
): Tool {
  const toolName = baseTool.description || 'Validated Tool';

  return aiTool({
    description: `${toolName} (validated)`,
    parameters: validationConfig.inputSchema || (baseTool as any).parameters,
    execute: async (input: any, options: any) => {
      const startTime = Date.now();
      let success = false;
      let error: any;

      try {
        // Input validation
        let validatedInput = input;

        if (validationConfig.inputValidation !== 'none') {
          const inputValidation = await validateData(input, validationConfig, 'input');

          if (!inputValidation.valid) {
            throw new Error(`Input validation failed: ${inputValidation.errors?.join(', ')}`);
          }

          if (inputValidation.warnings?.length) {
            logWarn(`Input validation warnings: ${inputValidation.warnings.join(', ')}`);
          }

          validatedInput = inputValidation.sanitized || input;
        }

        // Input sanitization
        if (validationConfig.sanitizeInput) {
          validatedInput = inputSanitizers.trimStrings(validatedInput);
          validatedInput = inputSanitizers.removeNulls(validatedInput);
        }

        // Execute with recovery
        const result = await executeWithRecovery(
          toolName,
          () => (baseTool as any).execute(validatedInput, options),
          recoveryConfig,
        );

        // Output validation
        let validatedOutput = result;

        if (validationConfig.outputValidation !== 'none') {
          const outputValidation = await validateData(result, validationConfig, 'output');

          if (!outputValidation.valid) {
            throw new Error(`Output validation failed: ${outputValidation.errors?.join(', ')}`);
          }

          if (outputValidation.warnings?.length) {
            logWarn(`Output validation warnings: ${outputValidation.warnings.join(', ')}`);
          }

          validatedOutput = outputValidation.sanitized || result;
        }

        // Output sanitization
        if (validationConfig.sanitizeOutput) {
          validatedOutput = inputSanitizers.removeNulls(validatedOutput);
        }

        success = true;
        return validatedOutput;
      } catch (err) {
        error = err;
        throw err;
      } finally {
        const executionTime = Date.now() - startTime;
        updateMetrics(toolName, success, executionTime, error);
      }
    },
  });
}

/**
 * Get execution metrics for all tools
 */
export function getExecutionMetrics(): Record<string, ToolExecutionMetrics> {
  return Object.fromEntries(executionMetrics);
}

/**
 * Get execution metrics for a specific tool
 */
export function getToolMetrics(toolName: string): ToolExecutionMetrics | undefined {
  return executionMetrics.get(toolName);
}

/**
 * Reset metrics for all tools
 */
export function resetMetrics(): void {
  executionMetrics.clear();
  circuitBreakers.clear();
}

/**
 * Validation presets for common scenarios
 */
export const validationPresets = {
  /**
   * Basic validation with schema checking
   */
  basic: {
    inputValidation: 'basic' as ValidationLevel,
    outputValidation: 'basic' as ValidationLevel,
    sanitizeInput: true,
    sanitizeOutput: false,
  },

  /**
   * Strict validation with comprehensive checking
   */
  strict: {
    inputValidation: 'strict' as ValidationLevel,
    outputValidation: 'strict' as ValidationLevel,
    sanitizeInput: true,
    sanitizeOutput: true,
    customInputValidators: [
      validators.requiredFields(['id', 'name']),
      validators.stringLengths({ name: { min: 1, max: 255 } }),
    ],
  },

  /**
   * API-focused validation
   */
  api: {
    inputValidation: 'comprehensive' as ValidationLevel,
    outputValidation: 'basic' as ValidationLevel,
    sanitizeInput: true,
    sanitizeOutput: false,
    customInputValidators: [
      validators.urlFormat(['url', 'endpoint']),
      validators.stringLengths({ query: { max: 1000 } }),
    ],
  },
};

/**
 * Error recovery presets for common scenarios
 */
export const recoveryPresets = {
  /**
   * Simple retry strategy
   */
  retry: {
    strategy: 'retry' as ErrorRecoveryStrategy,
    maxRetries: 3,
    baseDelay: 1000,
  },

  /**
   * Exponential backoff strategy
   */
  backoff: {
    strategy: 'retry-with-backoff' as ErrorRecoveryStrategy,
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 30000,
  },

  /**
   * Circuit breaker pattern
   */
  circuitBreaker: {
    strategy: 'circuit-breaker' as ErrorRecoveryStrategy,
    maxRetries: 3,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000,
    errorClassifier: errorClassifiers.network,
  },

  /**
   * Graceful degradation with fallback
   */
  gracefulDegradation: {
    strategy: 'graceful-degradation' as ErrorRecoveryStrategy,
    maxRetries: 2,
    baseDelay: 500,
    fallbackFn: async (input: any, error: any) => ({
      success: false,
      error: error?.message || 'Tool execution failed',
      fallback: true,
      timestamp: new Date().toISOString(),
    }),
  },
};

/**
 * Helper functions to create validated tools with presets
 */
export const validatedTools = {
  /**
   * Create tool with basic validation and retry
   */
  withBasicValidation: (tool: Tool) =>
    createValidatedTool(tool, validationPresets.basic, recoveryPresets.retry),

  /**
   * Create tool with strict validation and circuit breaker
   */
  withStrictValidation: (tool: Tool) =>
    createValidatedTool(tool, validationPresets.strict, recoveryPresets.circuitBreaker),

  /**
   * Create tool with API validation and backoff
   */
  withApiValidation: (tool: Tool) =>
    createValidatedTool(tool, validationPresets.api, recoveryPresets.backoff),

  /**
   * Create tool with graceful degradation
   */
  withGracefulDegradation: (tool: Tool) =>
    createValidatedTool(tool, validationPresets.basic, recoveryPresets.gracefulDegradation),
};
