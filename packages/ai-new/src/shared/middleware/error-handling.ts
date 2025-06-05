export class AIError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly operation: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIRateLimitError extends AIError {
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

export class AIQuotaExceededError extends AIError {
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

export class AIAuthenticationError extends AIError {
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

export class AIServiceUnavailableError extends AIError {
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

export function normalizeAIError(error: unknown, provider: string, operation: string): AIError {
  if (error instanceof AIError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();

    if (message.includes('rate limit') || message.includes('429')) {
      const retryAfter = extractRetryAfter(error.message);
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
    return new AIError(error.message, provider, operation, 'UNKNOWN_ERROR', undefined, false);
  }

  // Unknown error type
  return new AIError(
    'An unknown error occurred',
    provider,
    operation,
    'UNKNOWN_ERROR',
    undefined,
    false,
  );
}

function extractRetryAfter(message: string): number {
  const match = message.match(/retry after (\d+)/i);
  return match ? parseInt(match[1], 10) : 60;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on last attempt or non-retryable errors
      if (attempt === maxRetries || (error instanceof AIError && !error.retryable)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      const totalDelay = delay + jitter;

      console.warn(
        `Retrying operation in ${totalDelay}ms (attempt ${attempt + 1}/${maxRetries + 1}):`,
        lastError.message,
      );

      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError!;
}
