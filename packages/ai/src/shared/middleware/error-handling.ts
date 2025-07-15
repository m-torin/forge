import { logWarn } from '@repo/observability/shared-env';

export class AIMiddlewareError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly operation: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'AIMiddlewareError';
  }
}

export class AIAuthenticationError extends AIMiddlewareError {
  constructor(provider: string, operation: string) {
    super(
      `Authentication failed for ${provider}. Please check your API key.`,
      provider,
      operation,
      'AUTHENTICATION_ERROR',
      401,
      false,
    );
    this.name = 'AIAuthenticationError';
  }
}

export class AIQuotaExceededError extends AIMiddlewareError {
  constructor(provider: string, operation: string) {
    super(
      `Quota exceeded for ${provider}. Please check your billing.`,
      provider,
      operation,
      'QUOTA_EXCEEDED',
      429,
      false,
    );
    this.name = 'AIQuotaExceededError';
  }
}

export class AIRateLimitError extends AIMiddlewareError {
  constructor(
    provider: string,
    operation: string,
    public readonly retryAfter: number,
  ) {
    super(
      `Rate limit exceeded for ${provider}. Retry after ${retryAfter} seconds.`,
      provider,
      operation,
      'RATE_LIMIT',
      429,
      true,
    );
    this.name = 'AIRateLimitError';
  }
}

export class AIServiceUnavailableError extends AIMiddlewareError {
  constructor(provider: string, operation: string) {
    super(
      `${provider} service is temporarily unavailable.`,
      provider,
      operation,
      'SERVICE_UNAVAILABLE',
      503,
      true,
    );
    this.name = 'AIServiceUnavailableError';
  }
}

export function normalizeAIError(
  error: unknown,
  provider: string,
  operation: string,
): AIMiddlewareError {
  if (error instanceof AIMiddlewareError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = (error as Error)?.message || 'Unknown error'.toLowerCase();

    if (message.includes('rate limit') || message.includes('429')) {
      const retryAfter = extractRetryAfter((error as Error)?.message || 'Unknown error');
      return new AIRateLimitError(provider, operation, retryAfter);
    }

    if (message.includes('quota') || message.includes('billing')) {
      return new AIQuotaExceededError(provider, operation);
    }

    if (
      message.includes('unauthorized') ||
      message.includes('401') ||
      message.includes('api key')
    ) {
      return new AIAuthenticationError(provider, operation);
    }

    if (message.includes('503') || message.includes('unavailable') || message.includes('timeout')) {
      return new AIServiceUnavailableError(provider, operation);
    }

    // Generic error
    return new AIMiddlewareError(
      (error as Error)?.message || 'Unknown error',
      provider,
      operation,
      'UNKNOWN_ERROR',
      undefined,
      false,
    );
  }

  // Unknown error type
  return new AIMiddlewareError(
    'An unknown error occurred',
    provider,
    operation,
    'UNKNOWN_ERROR',
    undefined,
    false,
  );
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on last attempt or non-retryable errors
      if (attempt === maxRetries || (error instanceof AIMiddlewareError && !error.retryable)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      logWarn(`Retrying operation in ${totalDelay}ms`, {
        operation: 'ai_middleware_retry',
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
        totalDelay,
        error: lastError.message,
      });

      await new Promise((resolve: any) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError || new Error('Retry operation failed');
}

function extractRetryAfter(message: string): number {
  const match = message.match(/retry after (\d+)/i);
  return match ? parseInt(match[1], 10) : 60;
}
