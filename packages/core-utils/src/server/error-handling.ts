/**
 * Enhanced Error Handling Utilities for Node.js 22+ MCP Utils
 * Provides consistent error handling with Error.cause chaining and advanced diagnostics
 */

export interface StandardizedError {
  message: string;
  type: string;
  context?: string;
  timestamp: string;
  stack?: string;
  cause?: unknown;
  // Node.js 22+ enhanced error information
  errorChain?: ErrorChainLink[];
  aggregateError?: boolean;
  aggregatedErrors?: StandardizedError[];
}

export interface ErrorChainLink {
  message: string;
  name: string;
  stack?: string;
  cause?: ErrorChainLink;
}

export interface ErrorHandlingOptions {
  includeStack?: boolean;
  maxMessageLength?: number;
  contextInfo?: string;
  logToConsole?: boolean;
  sanitize?: boolean;
}

/**
 * Safely extract error message with standardized format
 * Prevents sensitive data exposure and provides consistent messaging
 */
export function getSafeErrorMessage(error: unknown, options: ErrorHandlingOptions = {}): string {
  const { maxMessageLength = 500, sanitize = true, contextInfo } = options;

  let message: string;

  if (error instanceof Error) {
    message = error.message || 'Unknown error occurred';
  } else if (typeof error === 'string') {
    message = error;
  } else if (error === null || error === undefined) {
    message = 'Error was null or undefined';
  } else if (typeof error === 'object' && error !== null) {
    // Try to extract meaningful info from objects
    const errorObj = error as Record<string, unknown>;
    message =
      errorObj.message?.toString() || errorObj.error?.toString() || `Error of type ${typeof error}`;
  } else {
    message = `Error of type ${typeof error}`;
  }

  // Sanitize message if requested
  if (sanitize) {
    // Remove potential sensitive patterns (tokens, passwords, etc.)
    message = message
      .replace(/([a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,})/gi, '[email]')
      .replace(/(token|key|password|secret)[=:]\s*['"]?[^'"\s]+['"]?/gi, '$1=[redacted]')
      .replace(/\/[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+\.git/g, '[git-url]');
  }

  // Limit message length
  if (message.length > maxMessageLength) {
    message = message.substring(0, maxMessageLength) + '...';
  }

  // Add context if provided
  if (contextInfo) {
    message = `[${contextInfo}] ${message}`;
  }

  return message;
}

/**
 * Create a standardized error object with consistent structure
 */
export function createStandardizedError(
  error: unknown,
  options: ErrorHandlingOptions = {},
): StandardizedError {
  const { includeStack = false, contextInfo } = options;
  const message = getSafeErrorMessage(error, options);

  const standardError: StandardizedError = {
    message,
    type: error instanceof Error ? error.constructor.name : typeof error,
    timestamp: new Date().toISOString(),
  };

  if (contextInfo) {
    standardError.context = contextInfo;
  }

  if (includeStack && error instanceof Error && error.stack) {
    standardError.stack = error.stack;
  }

  if (error instanceof Error && error.cause) {
    standardError.cause = error.cause;
  }

  return standardError;
}

/**
 * Standard error response for MCP tools
 */
export function createMCPErrorResponse(
  error: unknown,
  action?: string,
  options: ErrorHandlingOptions = {},
): {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError: boolean;
} {
  const standardError = createStandardizedError(error, {
    ...options,
    contextInfo: action ? `Action: ${action}` : options.contextInfo,
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(standardError, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Standardized try-catch wrapper for MCP tool actions
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  actionName: string,
  options: ErrorHandlingOptions = {},
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const { logToConsole = false } = options;

    if (logToConsole) {
      const standardError = createStandardizedError(error, {
        ...options,
        contextInfo: actionName,
        includeStack: true,
      });
      console.error('MCP Tool Error:', standardError);
    }

    throw error;
  }
}

/**
 * Safe async error logging to prevent blocking
 */
export function logErrorAsync(
  error: unknown,
  context?: string,
  options: ErrorHandlingOptions = {},
): void {
  queueMicrotask(() => {
    const message = getSafeErrorMessage(error, {
      ...options,
      contextInfo: context,
    });
    process.stderr.write(`[ERROR] ${message}\n`);
  });
}

/**
 * Create error with cause chain for better debugging
 */
export function createErrorWithCause(
  message: string,
  cause: unknown,
  errorType: new (message: string) => Error = Error,
): Error {
  const error = new errorType(message);

  // Add cause if supported (Node.js 16+)
  if ('cause' in Error.prototype) {
    (error as any).cause = cause;
  }

  return error;
}

/**
 * Standardized validation error
 */
export class ValidationError extends Error {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Standardized timeout error
 */
export class TimeoutError extends Error {
  public readonly timeout: number;

  constructor(message: string, timeout: number) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
  }
}

/**
 * Standardized configuration error
 */
export class ConfigurationError extends Error {
  public readonly configKey?: string;

  constructor(message: string, configKey?: string) {
    super(message);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Common error handling patterns
 */
export const ErrorPatterns = {
  /**
   * Handle unknown action errors
   */
  unknownAction: (action: string, validActions?: string[]): never => {
    const validActionsText = validActions ? `. Valid actions: ${validActions.join(', ')}` : '';
    throw new ValidationError(`Unknown action: ${action}${validActionsText}`, 'action', action);
  },

  /**
   * Handle missing required parameter errors
   */
  missingParameter: (paramName: string, actionName?: string): never => {
    const context = actionName ? ` for action '${actionName}'` : '';
    throw new ValidationError(`Missing required parameter: ${paramName}${context}`, paramName);
  },

  /**
   * Handle invalid parameter type errors
   */
  invalidParameterType: (paramName: string, expectedType: string, actualValue: unknown): never => {
    throw new ValidationError(
      `Invalid parameter type for '${paramName}': expected ${expectedType}, got ${typeof actualValue}`,
      paramName,
      actualValue,
    );
  },

  /**
   * Handle file not found errors
   */
  fileNotFound: (filePath: string): never => {
    throw new Error(`File not found: ${filePath}`);
  },

  /**
   * Handle timeout errors
   */
  operationTimeout: (operation: string, timeout: number): never => {
    throw new TimeoutError(`Operation '${operation}' timed out after ${timeout}ms`, timeout);
  },
};

/**
 * Node.js 22+ Enhanced Error Handling Functions
 */

/**
 * Extract complete error chain with Node.js 22+ Error.cause support
 */
export function extractErrorChain(error: unknown): ErrorChainLink[] {
  const chain: ErrorChainLink[] = [];
  let current = error;

  while (current) {
    if (current instanceof Error) {
      const link: ErrorChainLink = {
        message: current.message,
        name: current.name,
        stack: current.stack,
      };

      // Check for cause property (Node.js 16.9.0+)
      if (current.cause) {
        // Add cause to link for reference
        if (current.cause instanceof Error) {
          link.cause = {
            message: current.cause.message,
            name: current.cause.name,
            stack: current.cause.stack,
          };
        }
        current = current.cause;
      } else {
        current = null;
      }

      chain.push(link);
    } else {
      // Non-Error cause
      chain.push({
        message: String(current),
        name: 'Unknown',
      });
      current = null;
    }

    // Prevent infinite loops
    if (chain.length > 20) {
      chain.push({
        message: '[Error chain truncated - too deep]',
        name: 'TruncationNotice',
      });
      break;
    }
  }

  return chain;
}

/**
 * Enhanced createStandardizedError with full error chain support
 */
export function createEnhancedStandardizedError(
  error: unknown,
  options: ErrorHandlingOptions = {},
): StandardizedError {
  const standardError = createStandardizedError(error, options);

  // Add enhanced Node.js 22+ features
  if (error instanceof Error) {
    // Extract complete error chain
    standardError.errorChain = extractErrorChain(error);

    // Handle AggregateError (Node.js 15+)
    if (error.name === 'AggregateError' && 'errors' in error) {
      standardError.aggregateError = true;
      standardError.aggregatedErrors = (error as any).errors.map((err: unknown) =>
        createStandardizedError(err, options),
      );
    }
  }

  return standardError;
}

/**
 * Create chained error with proper Node.js 22+ Error.cause
 */
export function createChainedError(
  message: string,
  cause: unknown,
  errorClass: new (message: string, options?: ErrorOptions) => Error = Error,
): Error {
  // Use Error constructor with options (Node.js 16.9.0+)
  try {
    return new errorClass(message, { cause });
  } catch {
    // Fallback for older Node.js versions
    const error = new errorClass(message);
    (error as any).cause = cause;
    return error;
  }
}

/**
 * Enhanced MCP error response with full error chain
 */
export function createEnhancedMCPErrorResponse(
  error: unknown,
  action?: string,
  options: ErrorHandlingOptions = {},
): {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
  metadata?: {
    errorChainDepth?: number;
    isAggregateError?: boolean;
    errorTypes?: string[];
  };
} {
  const enhancedError = createEnhancedStandardizedError(error, {
    ...options,
    contextInfo: action ? `Action: ${action}` : options.contextInfo,
  });

  // Create metadata about the error
  const metadata: any = {};

  if (enhancedError.errorChain) {
    metadata.errorChainDepth = enhancedError.errorChain.length;
    metadata.errorTypes = enhancedError.errorChain.map(link => link.name);
  }

  if (enhancedError.aggregateError) {
    metadata.isAggregateError = true;
    metadata.aggregatedErrorCount = enhancedError.aggregatedErrors?.length || 0;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(enhancedError, null, 2),
      },
    ],
    isError: true,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

/**
 * Error aggregation helper for collecting multiple errors
 */
export class ErrorCollector {
  private errors: unknown[] = [];
  private context: string;

  constructor(context: string = 'ErrorCollection') {
    this.context = context;
  }

  add(error: unknown): void {
    this.errors.push(error);
  }

  addWithContext(error: unknown, context: string): void {
    const contextualError = createChainedError(`Error in ${context}`, error);
    this.errors.push(contextualError);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getCount(): number {
    return this.errors.length;
  }

  getErrors(): unknown[] {
    return [...this.errors];
  }

  /**
   * Create AggregateError from collected errors (Node.js 15+)
   */
  createAggregateError(message?: string): Error {
    if (this.errors.length === 0) {
      return new Error('No errors to aggregate');
    }

    const finalMessage = message || `${this.context}: ${this.errors.length} errors occurred`;

    // Try to use AggregateError if available (Node.js 15+)
    if (typeof AggregateError !== 'undefined') {
      return new AggregateError(this.errors, finalMessage);
    }

    // Fallback: create regular error with cause chain
    const primaryError = createChainedError(finalMessage, this.errors[0]);

    // Add other errors as additional info
    (primaryError as any).additionalErrors = this.errors.slice(1);

    return primaryError;
  }

  /**
   * Throw if any errors were collected
   */
  throwIfHasErrors(message?: string): void {
    if (this.hasErrors()) {
      throw this.createAggregateError(message);
    }
  }

  clear(): void {
    this.errors.length = 0;
  }
}

/**
 * Safe async operation with enhanced error handling
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorContext: string,
  options: ErrorHandlingOptions & {
    retries?: number;
    retryDelay?: number;
    timeoutMs?: number;
  } = {},
): Promise<{ result?: T; error?: StandardizedError }> {
  const { retries = 0, retryDelay = 1000, timeoutMs } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      let operationPromise = operation();

      // Add timeout if specified
      if (timeoutMs) {
        const { withTimeout } = await import('../shared/timeout.js');
        operationPromise = withTimeout(operationPromise, timeoutMs, {
          name: errorContext,
          onTimeout: () => new TimeoutError(`Operation timed out after ${timeoutMs}ms`, timeoutMs),
        });
      }

      const result = await operationPromise;
      return { result };
    } catch (error) {
      lastError = error;

      // Don't retry on certain error types
      if (
        error instanceof ValidationError ||
        error instanceof ConfigurationError ||
        (error instanceof Error && error.message.includes('aborted'))
      ) {
        break;
      }

      // Wait before retry (except on last attempt)
      if (attempt < retries) {
        const { delay } = await import('../shared/timeout.js');
        await delay(retryDelay);
      }
    }
  }

  // All attempts failed
  const chainedError = createChainedError(
    `Failed after ${retries + 1} attempts: ${errorContext}`,
    lastError,
  );

  return {
    error: createEnhancedStandardizedError(chainedError, options),
  };
}

/**
 * Context-aware error wrapper
 */
export function withErrorContext<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw createChainedError(`Error in ${context}`, error);
    }
  };
}

/**
 * Error analysis and debugging utilities
 */
export const ErrorAnalysis = {
  /**
   * Analyze error chain for patterns
   */
  analyzeChain(error: unknown): {
    chainDepth: number;
    errorTypes: string[];
    hasTimeouts: boolean;
    hasValidationErrors: boolean;
    rootCauseType: string;
    summary: string;
  } {
    const chain = extractErrorChain(error);
    const errorTypes = chain.map(link => link.name);

    const hasTimeouts = errorTypes.some(
      type =>
        type === 'TimeoutError' ||
        chain.some(link => link.message.toLowerCase().includes('timeout')),
    );

    const hasValidationErrors = errorTypes.some(
      type =>
        type === 'ValidationError' ||
        chain.some(link => link.message.toLowerCase().includes('validation')),
    );

    const rootCause = chain[chain.length - 1];
    const rootCauseType = rootCause?.name || 'Unknown';

    return {
      chainDepth: chain.length,
      errorTypes,
      hasTimeouts,
      hasValidationErrors,
      rootCauseType,
      summary: `${errorTypes.length > 1 ? 'Chained error' : 'Simple error'} with root cause: ${rootCauseType}`,
    };
  },

  /**
   * Get error fingerprint for deduplication
   */
  getFingerprint(error: unknown): string {
    const chain = extractErrorChain(error);
    const signature = chain.map(link => `${link.name}:${link.message}`).join('|');

    // Create hash-like fingerprint
    let hash = 0;
    for (let i = 0; i < signature.length; i++) {
      const char = signature.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  },

  /**
   * Format error chain for logging
   */
  formatChain(error: unknown, maxDepth: number = 5): string {
    const chain = extractErrorChain(error).slice(0, maxDepth);

    return chain
      .map((link, index) => {
        const indent = '  '.repeat(index);
        return `${indent}${index + 1}. ${link.name}: ${link.message}`;
      })
      .join('\n');
  },
};
