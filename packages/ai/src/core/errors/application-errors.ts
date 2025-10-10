/**
 * Application-level AI error handling system
 * Provides structured error handling for AI applications with surface-based visibility
 */

import { logError } from '@repo/observability/server';
import type { ErrorRecoveryStrategy } from '../../tools/server/validated-tools';

/**
 * AI Error Codes - Surface:Type format
 */
type AIErrorCode = string;

/**
 * Error Surfaces - Different parts of the application
 */
type ErrorSurface = 'chat' | 'api' | 'auth' | 'database' | 'external' | 'generation';

/**
 * Error Visibility Levels
 */
type ErrorVisibility = 'full' | 'log' | 'none';

/**
 * Default visibility settings by surface
 */
const defaultVisibilityBySurface: Record<ErrorSurface, ErrorVisibility> = {
  chat: 'full',
  api: 'log',
  auth: 'none',
  database: 'log',
  external: 'log',
  generation: 'full',
};

/**
 * Base Application AI Error with surface-based categorization
 */
class ApplicationAIError extends Error {
  public readonly type: string;
  public readonly surface: ErrorSurface;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, any>;

  constructor(
    message: string,
    type: string,
    surface: ErrorSurface,
    statusCode: number = 500,
    metadata?: Record<string, any>,
    cause?: Error,
  ) {
    super(message);
    this.name = 'ApplicationAIError';
    this.type = type;
    this.surface = surface;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.cause = cause;
  }
}

/**
 * Server-side Application AI error with Response handling
 * Extends the shared base class with server-specific features
 */
export class ServerApplicationAIError extends ApplicationAIError {
  /**
   * Convert error to response based on visibility settings
   */
  public toResponse(visibilityOverride?: Record<ErrorSurface, ErrorVisibility>): Response {
    const code: AIErrorCode = `${this.type}:${this.surface}`;
    const visibilitySettings = { ...defaultVisibilityBySurface, ...visibilityOverride };
    const visibility = visibilitySettings[this.surface];

    const { message, cause, statusCode, metadata } = this;

    if (visibility === 'log') {
      logError(`Application error: ${message}`, {
        code,
        cause,
        metadata,
        operation: 'application_error',
        error: this,
      });

      return Response.json(
        {
          code: '',
          message: 'Something went wrong. Please try again later.',
          error: true,
        },
        { status: statusCode },
      );
    }

    if (visibility === 'none') {
      return Response.json({ error: true }, { status: statusCode });
    }

    return Response.json(
      {
        code,
        message,
        cause,
        metadata: this.includeMetadataInResponse() ? metadata : undefined,
        error: true,
      },
      { status: statusCode },
    );
  }

  /**
   * Determine if metadata should be included in response
   */
  private includeMetadataInResponse(): boolean {
    // Don't include metadata for auth/security surfaces
    if (['auth', 'database'].includes(this.surface)) {
      return false;
    }
    return true;
  }
}

/**
 * Handle AI provider errors with consistent error surface mapping
 */
export function handleAIProviderError(
  error: Error,
  surface: ErrorSurface = 'generation',
): ServerApplicationAIError {
  // Handle known AI SDK errors
  if (error.name === 'APICallError') {
    return new ServerApplicationAIError(
      error.message,
      'api_call_error',
      surface,
      500,
      { originalError: error.name },
      error,
    );
  }

  if (error.name === 'InvalidArgumentError') {
    return new ServerApplicationAIError(
      error.message,
      'invalid_argument',
      surface,
      400,
      { originalError: error.name },
      error,
    );
  }

  if (error.name === 'NoSuchModelError') {
    return new ServerApplicationAIError(
      'The requested model is not available',
      'model_not_found',
      surface,
      404,
      { originalError: error.name },
      error,
    );
  }

  // Generic error fallback
  return new ServerApplicationAIError(
    error.message || 'Unknown error occurred',
    'unknown_error',
    surface,
    500,
    { originalError: error.name },
    error,
  );
}

/**
 * Create error recovery strategy
 */
function createErrorRecovery(strategy: ErrorRecoveryStrategy) {
  return {
    strategy,
    execute: async (error: Error, _context?: any) => {
      switch (strategy) {
        case 'retry':
        case 'retry-with-backoff':
          // Implement retry logic
          throw new Error('Retry strategy not implemented');
        case 'circuit-breaker':
          // Implement circuit breaker logic
          throw new Error('Circuit breaker strategy not implemented');
        case 'graceful-degradation':
          // Return degraded service
          return null;
        case 'fail-fast':
        default:
          throw error;
      }
    },
  };
}

/**
 * Default error recovery strategy
 */
const defaultErrorRecovery = createErrorRecovery('fail-fast');

// Re-export types;
