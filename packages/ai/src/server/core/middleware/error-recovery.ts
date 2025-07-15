/**
 * Error recovery patterns for AI SDK v5
 * Provides retry logic and fallback strategies for AI operations
 */

import { logError, logInfo } from '@repo/observability';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
}

export interface ErrorRecoveryOptions {
  strategies: {
    [errorType: string]: RetryStrategy;
  };
  defaultStrategy?: RetryStrategy;
}

export interface RetryStrategy {
  type: 'exponential-backoff' | 'fixed-delay' | 'immediate' | 'fallback-model';
  maxRetries: number;
  delay?: number;
  maxDelay?: number;
  fallbackModels?: string[];
}

/**
 * Simple error recovery implementation
 */
export class ErrorRecovery {
  private options: ErrorRecoveryOptions;

  constructor(options: ErrorRecoveryOptions) {
    this.options = options;
  }

  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: { modelId?: string; attempt?: number } = {},
  ): Promise<T> {
    const { attempt = 1 } = context;

    try {
      return await operation();
    } catch (error: any) {
      const errorType = this.classifyError(error);
      const strategy = this.options.strategies[errorType] || this.options.defaultStrategy;

      if (!strategy || attempt > strategy.maxRetries) {
        logError('AI operation failed after all retries', {
          error,
          attempt,
          errorType,
        });
        throw error;
      }

      logInfo('AI operation failed - attempting recovery', {
        errorType,
        attempt,
        strategy: strategy.type,
      });

      await this.applyStrategy(strategy, attempt);

      return this.executeWithRecovery(operation, { ...context, attempt: attempt + 1 });
    }
  }

  private classifyError(error: any): string {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limit';
    }
    if (message.includes('context length') || message.includes('token limit')) {
      return 'context_length_exceeded';
    }
    if (message.includes('model not found') || message.includes('model unavailable')) {
      return 'model_not_available';
    }
    if (message.includes('invalid tool') || message.includes('tool execution')) {
      return 'invalid_tool_arguments';
    }
    if (message.includes('timeout') || message.includes('network')) {
      return 'network_error';
    }

    return 'unknown';
  }

  private async applyStrategy(strategy: RetryStrategy, attempt: number): Promise<void> {
    switch (strategy.type) {
      case 'exponential-backoff':
        const delay = Math.min(
          (strategy.delay || 1000) * Math.pow(2, attempt - 1),
          strategy.maxDelay || 30000,
        );
        await this.sleep(delay);
        break;

      case 'fixed-delay':
        await this.sleep(strategy.delay || 1000);
        break;

      case 'immediate':
        // No delay
        break;

      case 'fallback-model':
        // This would need to be handled by the calling code
        logInfo('Fallback model strategy triggered', {
          fallbackModels: strategy.fallbackModels,
        });
        break;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Pre-configured error recovery strategies
 */
export const defaultErrorRecovery = {
  exponentialBackoff: (options: Partial<RetryStrategy> = {}): RetryStrategy => ({
    type: 'exponential-backoff',
    maxRetries: 3,
    delay: 1000,
    maxDelay: 30000,
    ...options,
  }),

  fixedDelay: (options: Partial<RetryStrategy> = {}): RetryStrategy => ({
    type: 'fixed-delay',
    maxRetries: 3,
    delay: 2000,
    ...options,
  }),

  immediate: (options: Partial<RetryStrategy> = {}): RetryStrategy => ({
    type: 'immediate',
    maxRetries: 2,
    ...options,
  }),

  fallbackModel: (options: Partial<RetryStrategy> = {}): RetryStrategy => ({
    type: 'fallback-model',
    maxRetries: 1,
    fallbackModels: ['gpt-3.5-turbo'],
    ...options,
  }),
};

/**
 * Create an error recovery instance with common patterns
 */
export function createErrorRecovery(options: Partial<ErrorRecoveryOptions> = {}): ErrorRecovery {
  const defaultStrategies = {
    rate_limit: defaultErrorRecovery.exponentialBackoff({
      maxRetries: 5,
      delay: 2000,
      maxDelay: 60000,
    }),
    network_error: defaultErrorRecovery.exponentialBackoff({
      maxRetries: 3,
      delay: 1000,
      maxDelay: 10000,
    }),
    context_length_exceeded: defaultErrorRecovery.immediate({
      maxRetries: 1,
    }),
    model_not_available: defaultErrorRecovery.fallbackModel({
      maxRetries: 2,
      fallbackModels: ['gpt-4o-mini', 'gpt-3.5-turbo'],
    }),
    invalid_tool_arguments: defaultErrorRecovery.fixedDelay({
      maxRetries: 2,
      delay: 500,
    }),
  };

  return new ErrorRecovery({
    strategies: { ...defaultStrategies, ...options.strategies },
    defaultStrategy: options.defaultStrategy || defaultErrorRecovery.exponentialBackoff(),
  });
}
