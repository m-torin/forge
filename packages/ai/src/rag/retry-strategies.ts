/**
 * Enhanced Retry Logic with Exponential Backoff
 * Comprehensive retry patterns for RAG operations with circuit breaker integration
 */

import { logError, logInfo, logWarn } from "@repo/observability/server/next";
import {
  executeWithCircuitBreaker,
  type CircuitBreakerConfig,
} from "./circuit-breaker";

/**
 * Retry strategy types
 */
export enum RetryStrategy {
  EXPONENTIAL_BACKOFF = "exponential_backoff",
  LINEAR_BACKOFF = "linear_backoff",
  FIXED_DELAY = "fixed_delay",
  FIBONACCI = "fibonacci",
  CUSTOM = "custom",
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  strategy: RetryStrategy;
  jitterMax?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
  timeoutPerAttempt?: number;
  customDelayFunction?: (attempt: number, baseDelay: number) => number;
}

/**
 * Retry result with metadata
 */
export interface RetryResult<T> {
  result: T;
  attempts: number;
  totalTime: number;
  errors: Error[];
  success: boolean;
}

/**
 * Error types that should/shouldn't be retried
 */
export enum ErrorType {
  RETRIABLE = "retriable",
  NON_RETRIABLE = "non_retriable",
  CIRCUIT_BREAKER = "circuit_breaker",
  TIMEOUT = "timeout",
  RATE_LIMIT = "rate_limit",
  NETWORK = "network",
  AUTH = "auth",
  VALIDATION = "validation",
}

/**
 * Configurable retry class with multiple strategies
 */
export class ConfigurableRetry {
  public config: Required<RetryConfig>;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      baseDelay: config.baseDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      strategy: config.strategy || RetryStrategy.EXPONENTIAL_BACKOFF,
      jitterMax: config.jitterMax || 1000,
      backoffMultiplier: config.backoffMultiplier || 2,
      retryCondition: config.retryCondition || this.defaultRetryCondition,
      onRetry: config.onRetry || (() => {}),
      timeoutPerAttempt: config.timeoutPerAttempt || 30000,
      customDelayFunction: config.customDelayFunction || (() => 0),
    };
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    overrideConfig?: Partial<RetryConfig>,
  ): Promise<RetryResult<T>> {
    const config = overrideConfig
      ? { ...this.config, ...overrideConfig }
      : this.config;
    const startTime = Date.now();
    const errors: Error[] = [];
    let lastError: Error = new Error("No attempts made");

    logInfo("Starting enhanced retry operation", {
      operation: "enhanced_retry_start",
      operationName,
      maxRetries: config.maxRetries,
      strategy: config.strategy,
    });

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Execute with timeout if specified
        const result = config.timeoutPerAttempt
          ? await this.executeWithTimeout(operation, config.timeoutPerAttempt)
          : await operation();

        const totalTime = Date.now() - startTime;

        logInfo("Enhanced retry operation succeeded", {
          operation: "enhanced_retry_success",
          operationName,
          attempts: attempt + 1,
          totalTime,
        });

        return {
          result,
          attempts: attempt + 1,
          totalTime,
          errors,
          success: true,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        errors.push(lastError);

        const errorType = this.categorizeError(lastError);

        logWarn("Enhanced retry attempt failed", {
          operation: "enhanced_retry_attempt_failed",
          operationName,
          attempt: attempt + 1,
          error: lastError.message,
          errorType,
        });

        // Check if we should retry this error
        if (
          !config.retryCondition(lastError, attempt) ||
          attempt === config.maxRetries
        ) {
          break;
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt, config);

        config.onRetry(lastError, attempt, delay);

        logInfo("Retrying operation after delay", {
          operation: "enhanced_retry_delaying",
          operationName,
          attempt: attempt + 1,
          delay,
          nextAttempt: attempt + 2,
        });

        await this.sleep(delay);
      }
    }

    const totalTime = Date.now() - startTime;

    logError("Enhanced retry operation failed completely", {
      error: lastError || new Error("Unknown error"),
      operation: "enhanced_retry_failed",
      operationName,
      attempts: config.maxRetries + 1,
      totalTime,
      errorCount: errors.length,
    });

    return {
      result: undefined as any,
      attempts: config.maxRetries + 1,
      totalTime,
      errors,
      success: false,
    };
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number,
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  /**
   * Calculate delay based on strategy
   */
  private calculateDelay(
    attempt: number,
    config: Required<RetryConfig>,
  ): number {
    let delay: number;

    switch (config.strategy) {
      case RetryStrategy.EXPONENTIAL_BACKOFF:
        delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
        break;

      case RetryStrategy.LINEAR_BACKOFF:
        delay = config.baseDelay * (attempt + 1);
        break;

      case RetryStrategy.FIXED_DELAY:
        delay = config.baseDelay;
        break;

      case RetryStrategy.FIBONACCI:
        delay = config.baseDelay * this.fibonacci(attempt + 1);
        break;

      case RetryStrategy.CUSTOM:
        delay = config.customDelayFunction(attempt, config.baseDelay);
        break;

      default:
        delay = config.baseDelay;
    }

    // Apply jitter to prevent thundering herd
    if (config.jitterMax > 0) {
      const jitter = Math.random() * config.jitterMax;
      delay += jitter;
    }

    // Cap at maximum delay
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Calculate fibonacci number
   */
  private fibonacci(n: number): number {
    if (n <= 1) return n;
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  /**
   * Categorize error type for retry decision
   */
  categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (
      name.includes("circuitbreaker") ||
      message.includes("circuit breaker")
    ) {
      return ErrorType.CIRCUIT_BREAKER;
    }

    if (name.includes("timeout") || message.includes("timeout")) {
      return ErrorType.TIMEOUT;
    }

    if (
      message.includes("rate limit") ||
      message.includes("too many requests")
    ) {
      return ErrorType.RATE_LIMIT;
    }

    if (
      message.includes("network") ||
      message.includes("connection") ||
      message.includes("econnrefused") ||
      message.includes("enotfound")
    ) {
      return ErrorType.NETWORK;
    }

    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("authentication")
    ) {
      return ErrorType.AUTH;
    }

    if (
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("bad request")
    ) {
      return ErrorType.VALIDATION;
    }

    return ErrorType.RETRIABLE;
  }

  /**
   * Default retry condition
   */
  private defaultRetryCondition(error: Error, _attempt: number): boolean {
    const errorType = this.categorizeError(error);

    // Don't retry validation errors or auth errors
    if (errorType === ErrorType.VALIDATION || errorType === ErrorType.AUTH) {
      return false;
    }

    // Don't retry circuit breaker errors (circuit breaker handles its own recovery)
    if (errorType === ErrorType.CIRCUIT_BREAKER) {
      return false;
    }

    // Retry network, timeout, and rate limit errors
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.RATE_LIMIT,
      ErrorType.RETRIABLE,
    ].includes(errorType);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * RAG-specific retry patterns
 */
export class RAGRetryPatterns {
  /**
   * Retry pattern for embedding operations
   */
  static embedding(): ConfigurableRetry {
    return new ConfigurableRetry({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      jitterMax: 500,
      timeoutPerAttempt: 15000,
      retryCondition: (error, attempt) => {
        // Retry on network/timeout errors, but not on model errors
        const message = error.message.toLowerCase();
        if (message.includes("model") || message.includes("invalid")) {
          return false;
        }
        return attempt < 3;
      },
    });
  }

  /**
   * Retry pattern for vector operations
   */
  static vectorOperations(): ConfigurableRetry {
    return new ConfigurableRetry({
      maxRetries: 5,
      baseDelay: 2000,
      maxDelay: 20000,
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      jitterMax: 1000,
      timeoutPerAttempt: 30000,
      onRetry: (error, attempt, delay) => {
        logWarn("Retrying vector operation", {
          operation: "rag_vector_retry",
          attempt,
          delay,
          error: error.message,
        });
      },
    });
  }

  /**
   * Retry pattern for batch operations
   */
  static batchOperations(): ConfigurableRetry {
    return new ConfigurableRetry({
      maxRetries: 2,
      baseDelay: 5000,
      maxDelay: 30000,
      strategy: RetryStrategy.LINEAR_BACKOFF,
      jitterMax: 2000,
      timeoutPerAttempt: 120000, // 2 minutes
      retryCondition: (error, _attempt) => {
        // Be more conservative with batch operations
        const errorType = new ConfigurableRetry().categorizeError(error);
        return (
          errorType === ErrorType.NETWORK || errorType === ErrorType.TIMEOUT
        );
      },
    });
  }

  /**
   * Retry pattern for rate-limited operations
   */
  static rateLimited(): ConfigurableRetry {
    return new ConfigurableRetry({
      maxRetries: 5,
      baseDelay: 10000, // Start with 10 seconds
      maxDelay: 300000, // Max 5 minutes
      strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
      backoffMultiplier: 2.5,
      jitterMax: 5000,
      retryCondition: (error) => {
        return (
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("too many requests")
        );
      },
    });
  }
}

/**
 * Retry with circuit breaker integration
 */
export async function retryWithCircuitBreaker<T>(
  operationName: string,
  operation: () => Promise<T>,
  retryConfig?: Partial<RetryConfig>,
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
): Promise<T> {
  const retry = new ConfigurableRetry(retryConfig);

  const result = await retry.execute(
    () =>
      executeWithCircuitBreaker(operationName, operation, circuitBreakerConfig),
    operationName,
  );

  if (!result.success) {
    // Throw the last error if all retries failed
    throw (
      result.errors[result.errors.length - 1] ||
      new Error("All retry attempts failed")
    );
  }

  return result.result;
}

/**
 * Convenient retry functions for common RAG operations
 */
export const ragRetry = {
  /**
   * Retry embedding generation
   */
  embedding: async <T>(operation: () => Promise<T>): Promise<T> => {
    const retryInstance = RAGRetryPatterns.embedding();
    return retryWithCircuitBreaker(
      "embedding",
      operation,
      retryInstance.config as any,
      {
        failureThreshold: 3,
        recoveryTimeout: 30000,
      },
    );
  },

  /**
   * Retry vector operations
   */
  vector: async <T>(operation: () => Promise<T>): Promise<T> => {
    const retryInstance = RAGRetryPatterns.vectorOperations();
    return retryWithCircuitBreaker(
      "vector_operations",
      operation,
      retryInstance.config as any,
      {
        failureThreshold: 5,
        recoveryTimeout: 60000,
      },
    );
  },

  /**
   * Retry batch operations
   */
  batch: async <T>(operation: () => Promise<T>): Promise<T> => {
    const retryInstance = RAGRetryPatterns.batchOperations();
    return retryWithCircuitBreaker(
      "batch_operations",
      operation,
      retryInstance.config as any,
      {
        failureThreshold: 2,
        recoveryTimeout: 120000,
      },
    );
  },

  /**
   * Retry rate limited operations
   */
  rateLimited: async <T>(operation: () => Promise<T>): Promise<T> => {
    const retryInstance = RAGRetryPatterns.rateLimited();
    return retryWithCircuitBreaker(
      "rate_limited_operations",
      operation,
      retryInstance.config as any,
      { failureThreshold: 3, recoveryTimeout: 180000 },
    );
  },
};

/**
 * Decorator for adding retry logic to methods
 */
export function withRetry(
  retryConfig?: Partial<RetryConfig>,
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const method = descriptor.value;
    if (!method) throw new Error("Method descriptor value is undefined");
    const operationName = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (this: any, ...args: any[]) {
      return retryWithCircuitBreaker(
        operationName,
        () => method.apply(this, args),
        retryConfig,
        circuitBreakerConfig,
      );
    } as T;
  };
}

/**
 * Global retry instance with default RAG configuration
 */
export const defaultRAGRetry = new ConfigurableRetry({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 15000,
  strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
  jitterMax: 500,
  timeoutPerAttempt: 30000,
});
