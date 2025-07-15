/**
 * Shared error types and utilities for AI applications
 * These are environment-agnostic and can be used in both client and server contexts
 */

/**
 * Standard error types for AI applications
 */
export type AIErrorType =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limit'
  | 'quota_exceeded'
  | 'offline'
  | 'model_error'
  | 'tool_error'
  | 'stream_error'
  | 'provider_error';

/**
 * Application surfaces where errors can occur
 */
export type ErrorSurface =
  | 'chat'
  | 'auth'
  | 'api'
  | 'stream'
  | 'database'
  | 'model'
  | 'tool'
  | 'provider'
  | 'document'
  | 'vector'
  | 'rag';

/**
 * Error code format for precise error identification
 */
export type AIErrorCode = `${AIErrorType}:${ErrorSurface}`;

/**
 * Error visibility determines how errors are exposed
 */
export type ErrorVisibility = 'response' | 'log' | 'none';

/**
 * Default visibility settings by surface
 */
export const defaultVisibilityBySurface: Record<ErrorSurface, ErrorVisibility> = {
  database: 'log',
  chat: 'response',
  auth: 'response',
  stream: 'response',
  api: 'response',
  model: 'response',
  tool: 'response',
  provider: 'response',
  document: 'response',
  vector: 'log',
  rag: 'log',
};

/**
 * Get human-readable message for error code
 * This is a pure function that can be used in any environment
 */
export function getMessageByErrorCode(errorCode: AIErrorCode): string {
  // Database errors
  if (errorCode.includes('database')) {
    return 'An error occurred while executing a database query.';
  }

  // Vector/RAG errors
  if (errorCode.includes('vector')) {
    return 'An error occurred with the vector database operation.';
  }
  if (errorCode.includes('rag')) {
    return 'An error occurred during the RAG (Retrieval Augmented Generation) process.';
  }

  // Specific error messages
  const errorMessages: Partial<Record<AIErrorCode, string>> = {
    'bad_request:api': "The request couldn't be processed. Please check your input and try again.",
    'unauthorized:auth': 'You need to sign in before continuing.',
    'forbidden:auth': 'Your account does not have access to this feature.',
    'rate_limit:chat': 'You have exceeded your maximum number of messages. Please try again later.',
    'quota_exceeded:chat': 'The AI provider has run out of credits or reached its quota limit.',
    'quota_exceeded:provider':
      'The AI provider quota has been exceeded. Please try a different provider.',
    'not_found:chat': 'The requested chat was not found.',
    'forbidden:chat': 'This chat belongs to another user.',
    'unauthorized:chat': 'You need to sign in to view this chat.',
    'offline:chat':
      "We're having trouble sending your message. Please check your internet connection.",
    'model_error:model': 'The AI model encountered an error. Please try again or switch models.',
    'tool_error:tool': 'The tool execution failed. Please check the parameters and try again.',
    'stream_error:stream': 'An error occurred while streaming the response.',
    'provider_error:provider': 'The AI provider encountered an error. Please try again later.',
    'not_found:document': 'The requested document was not found.',
    'forbidden:document': 'This document belongs to another user.',
    'unauthorized:document': 'You need to sign in to view this document.',
    'bad_request:document': 'The document request was invalid.',
  };

  return errorMessages[errorCode] || 'Something went wrong. Please try again later.';
}

/**
 * Get HTTP status code for error type
 */
export function getStatusCodeByType(type: AIErrorType): number {
  const statusCodes: Record<AIErrorType, number> = {
    bad_request: 400,
    unauthorized: 401,
    forbidden: 403,
    not_found: 404,
    rate_limit: 429,
    quota_exceeded: 429,
    offline: 503,
    model_error: 500,
    tool_error: 500,
    stream_error: 500,
    provider_error: 502,
  };

  return statusCodes[type] || 500;
}

/**
 * Error recovery strategies interface
 */
export interface ErrorRecoveryStrategy {
  shouldRetry: (error: { type: AIErrorType; statusCode: number; metadata?: any }) => boolean;
  getRetryDelay: (error: { type: AIErrorType; metadata?: any }, attempt: number) => number;
  getMaxRetries: (error: { type: AIErrorType }) => number;
  getFallbackResponse?: (error: { type: AIErrorType }) => any;
}

/**
 * Default error recovery strategy
 */
export const defaultErrorRecovery: ErrorRecoveryStrategy = {
  shouldRetry: error => {
    // Retry on rate limits, service unavailable, and network errors
    return (
      ['rate_limit', 'offline'].includes(error.type) ||
      (error.type === 'provider_error' && error.statusCode >= 500)
    );
  },
  getRetryDelay: (error, attempt) => {
    // Use retry-after header if available
    if (error.metadata?.retryAfter) {
      return error.metadata.retryAfter * 1000;
    }
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  },
  getMaxRetries: error => {
    // More retries for transient errors
    if (error.type === 'offline') return 5;
    if (error.type === 'rate_limit') return 3;
    return 2;
  },
};

/**
 * Create a custom error recovery strategy
 */
export function createErrorRecovery(
  overrides: Partial<ErrorRecoveryStrategy>,
): ErrorRecoveryStrategy {
  return {
    ...defaultErrorRecovery,
    ...overrides,
  };
}

/**
 * Base Application-level AI error (client and server compatible)
 * This is a simplified version that can be used in any environment
 */
export class ApplicationAIError extends Error {
  public type: AIErrorType;
  public surface: ErrorSurface;
  public statusCode: number;
  public metadata?: Record<string, any>;
  public originalError?: Error;

  constructor(
    errorCode: AIErrorCode,
    cause?: string,
    metadata?: Record<string, any>,
    originalError?: Error,
  ) {
    super();

    const [type, surface] = errorCode.split(':') as [AIErrorType, ErrorSurface];

    this.type = type;
    this.cause = cause;
    this.surface = surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(type);
    this.metadata = metadata;
    this.originalError = originalError;
    this.name = 'ApplicationAIError';
  }

  /**
   * Create a new error with additional context
   */
  public withContext(additionalMetadata: Record<string, any>): ApplicationAIError {
    return new ApplicationAIError(
      `${this.type}:${this.surface}` as AIErrorCode,
      this.cause as string,
      { ...this.metadata, ...additionalMetadata },
      this.originalError,
    );
  }
}

/**
 * AI Provider error handler (simplified for shared use)
 * Converts provider-specific errors to application errors
 */
export function handleAIProviderError(
  error: unknown,
  surface: ErrorSurface = 'provider',
): ApplicationAIError {
  // Handle errors with status codes (common AI provider pattern)
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as any).statusCode;
    const errorMessage = (error as any).responseBody || (error as any).message || '';

    // Handle 429 errors (rate limit/quota exceeded)
    if (statusCode === 429) {
      // Check if it's specifically about credits/quota
      if (
        errorMessage.includes('credit') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('spending limit') ||
        errorMessage.includes('insufficient_quota')
      ) {
        return new ApplicationAIError(
          `quota_exceeded:${surface}`,
          errorMessage,
          { provider: (error as any).provider },
          error instanceof Error ? error : (error as unknown as Error),
        );
      }
      // Generic rate limit
      return new ApplicationAIError(
        `rate_limit:${surface}`,
        errorMessage,
        {
          provider: (error as any).provider,
          retryAfter: (error as any).retryAfter,
        },
        error instanceof Error ? error : (error as unknown as Error),
      );
    }

    // Handle other status codes
    const typeMap: Record<number, AIErrorType> = {
      400: 'bad_request',
      401: 'unauthorized',
      403: 'forbidden',
      404: 'not_found',
    };

    const type = typeMap[statusCode];
    if (type) {
      return new ApplicationAIError(
        `${type}:${surface}`,
        errorMessage,
        { provider: (error as any).provider },
        error instanceof Error ? error : (error as unknown as Error),
      );
    }
  }

  // Check for specific AI SDK error patterns
  if (error && typeof error === 'object' && 'name' in error) {
    const errorName = (error as any).name;

    // AI SDK specific error types
    if (errorName === 'AI_APICallError' || errorName === 'APICallError') {
      const statusCode = (error as any).statusCode;
      if (statusCode === 429) {
        return new ApplicationAIError(
          `quota_exceeded:${surface}`,
          (error as any).message,
          { provider: (error as any).provider },
          error as Error,
        );
      }
      return new ApplicationAIError(
        `provider_error:${surface}`,
        (error as any).message,
        { provider: (error as any).provider },
        error as Error,
      );
    }

    // Tool execution errors
    if (errorName === 'ToolExecutionError' || errorName === 'AIToolExecutionError') {
      return new ApplicationAIError(
        'tool_error:tool',
        (error as any).message,
        {
          toolName: (error as any).toolName,
          toolError: (error as any).details,
        },
        error as Error,
      );
    }

    // Stream errors
    if (errorName === 'StreamError') {
      return new ApplicationAIError(
        'stream_error:stream',
        (error as any).message,
        { chunk: (error as any).chunk },
        error as Error,
      );
    }
  }

  // Network errors
  if (error instanceof Error && error.message.includes('ENOTFOUND')) {
    return new ApplicationAIError('offline:api', 'Network connection error', undefined, error);
  }

  // Generic fallback
  return new ApplicationAIError(
    `provider_error:${surface}`,
    error instanceof Error ? error.message : 'Unknown error',
    undefined,
    error instanceof Error ? error : undefined,
  );
}
