import { logError, logInfo } from '@repo/observability/server/next';
import { APICallError, InvalidPromptError, InvalidResponseDataError } from 'ai';

/**
 * Standard AI error types following Vercel AI SDK patterns
 */

/**
 * Base AI error class
 */
export abstract class AIError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  readonly timestamp: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * Provider not found error
 */
export class ProviderNotFoundError extends AIError {
  readonly code = 'PROVIDER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(providerName: string) {
    super(`Provider '${providerName}' not found`, { providerName });
  }
}

/**
 * Provider capability error
 */
export class ProviderCapabilityError extends AIError {
  readonly code = 'PROVIDER_CAPABILITY_ERROR';
  readonly statusCode = 400;

  constructor(providerName: string, capability: string) {
    super(`Provider '${providerName}' does not support capability '${capability}'`, {
      providerName,
      capability,
    });
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends AIError {
  readonly code = 'CONFIGURATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string, config?: Record<string, unknown>) {
    super(message, { config });
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AIError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;
  readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, { retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AIError {
  readonly code = 'AUTHENTICATION_ERROR';
  readonly statusCode = 401;

  constructor(message: string, provider?: string) {
    super(message, { provider });
  }
}

/**
 * AI Tool execution error
 */
export class AIToolExecutionError extends AIError {
  readonly code = 'TOOL_EXECUTION_ERROR';
  readonly statusCode = 500;
  readonly toolName: string;

  constructor(toolName: string, message: string, originalError?: Error) {
    super(message, { toolName, originalError: originalError?.message });
    this.toolName = toolName;
  }
}

/**
 * Stream error
 */
export class StreamError extends AIError {
  readonly code = 'STREAM_ERROR';
  readonly statusCode = 500;

  constructor(message: string, chunk?: unknown) {
    super(message, { chunk });
  }
}

/**
 * Error handler utility
 */
export class AIErrorHandler {
  /**
   * Convert any error to a standardized AI error
   */
  static normalize(error: unknown): AIError {
    // Already an AI error
    if (error instanceof AIError) {
      return error;
    }

    // Vercel AI SDK errors
    if (APICallError.isInstance(error)) {
      return new AIError.APICallError(error.message, {
        url: (error as unknown as { url?: string }).url,
        statusCode: (error as unknown as { statusCode?: number }).statusCode,
        responseBody: (error as unknown as { responseBody?: unknown }).responseBody,
      });
    }

    if (InvalidPromptError.isInstance(error)) {
      return new ConfigurationError(error.message, {
        prompt: (error as unknown as { prompt?: unknown }).prompt,
      });
    }

    if (InvalidResponseDataError.isInstance(error)) {
      return new AIError.InvalidResponseError(error.message, {
        responseData: (error as unknown as { responseData?: unknown }).responseData,
      });
    }

    // Generic errors
    if (error instanceof Error) {
      // Check for common error patterns
      if (error.message.includes('rate limit')) {
        return new RateLimitError(error.message);
      }

      if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
        return new AuthenticationError(error.message);
      }

      if (error.message.includes('not found')) {
        return new ProviderNotFoundError(error.message);
      }

      // Default to generic AI error
      return new AIError.GenericError(error.message, {
        originalError: error.name,
        stack: error.stack,
      });
    }

    // Unknown error type
    return new AIError.UnknownError(String(error));
  }

  /**
   * Create error response
   */
  static toResponse(error: AIError): Response {
    return new Response(
      JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
        },
      }),
      {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  /**
   * Log error with context
   */
  static log(error: AIError, customLogger?: (message: string, context?: unknown) => void) {
    if (customLogger) {
      customLogger(`[${error.code}] ${error.message}`, {
        ...error.context,
        timestamp: error.timestamp,
        stack: error.stack,
      });
    } else {
      logError(`[${error.code}] ${error.message}`, {
        ...error.context,
        error,
        timestamp: error.timestamp,
      });
    }
  }
}

/**
 * Additional AI SDK compatible errors
 */
export namespace AIError {
  export class APICallError extends AIError {
    readonly code = 'API_CALL_ERROR';
    readonly statusCode = 500;

    constructor(message: string, context?: Record<string, unknown>) {
      super(message, context);
    }
  }

  export class InvalidResponseError extends AIError {
    readonly code = 'INVALID_RESPONSE_ERROR';
    readonly statusCode = 500;

    constructor(message: string, context?: Record<string, unknown>) {
      super(message, context);
    }
  }

  export class GenericError extends AIError {
    readonly code = 'AI_ERROR';
    readonly statusCode = 500;

    constructor(message: string, context?: Record<string, unknown>) {
      super(message, context);
    }
  }

  export class UnknownError extends AIError {
    readonly code = 'UNKNOWN_ERROR';
    readonly statusCode = 500;

    constructor(value: string) {
      super('An unknown error occurred', { value });
    }
  }
}

/**
 * Error recovery strategies
 */
export const ErrorRecoveryStrategies = {
  /**
   * Exponential backoff retry
   */
  exponentialBackoff(maxRetries = 3, baseDelay = 1000) {
    return {
      maxRetries,
      retryDelay: baseDelay,
      handleError: (error: Error, attempt: number) => {
        if (attempt < maxRetries) {
          // Double the delay for each retry
          const delay = baseDelay * Math.pow(2, attempt - 1);
          logInfo(`Retrying after ${delay}ms (attempt ${attempt}/${maxRetries})`, {
            attempt,
            maxRetries,
            delay,
            operation: 'ai_error_retry',
          });
          return null; // Continue with retry
        }
        return `Error after ${maxRetries} attempts: ${error.message}`;
      },
    };
  },

  /**
   * Fallback to cached response
   */
  cachedFallback(cache: Map<string, string>) {
    return (error: AIError) => {
      const cacheKey = `${error.code}:${error.message}`;
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        return new Response(cachedResponse, { status: error.statusCode });
      }
      return AIErrorHandler.toResponse(error);
    };
  },

  /**
   * Graceful degradation
   */
  gracefulDegradation(_fallbackProvider?: unknown) {
    return (_error: AIError) => {
      // Return a graceful degradation response
      return new Response(
        JSON.stringify({
          error: 'Service temporarily unavailable',
          message: 'Please try again later',
          fallback: true,
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    };
  },
};
