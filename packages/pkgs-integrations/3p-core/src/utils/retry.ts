/**
 * Retry utilities for 3rd party analytics integrations
 */

import type { RetryConfig } from '../types';

export class RetryManager {
  constructor(private config: RetryConfig) {}

  async execute<T>(operation: () => Promise<T>, operationName = 'unknown'): Promise<T> {
    let lastError: Error;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt > this.config.maxRetries) {
          throw new RetryError(
            `Operation '${operationName}' failed after ${this.config.maxRetries} retries`,
            lastError,
            attempt - 1,
          );
        }

        if (!this.shouldRetry(lastError)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  async executeWithResult<T>(
    operation: () => Promise<T>,
    operationName = 'unknown',
  ): Promise<{ success: boolean; data?: T; error?: Error; attempts: number }> {
    try {
      const data = await this.execute(operation, operationName);
      return { success: true, data, attempts: 1 };
    } catch (error) {
      const retryError = error as RetryError;
      return {
        success: false,
        error: retryError.originalError || retryError,
        attempts: retryError.attempts || 1,
      };
    }
  }

  private shouldRetry(error: Error): boolean {
    // Don't retry client errors (400-499)
    if (
      error.message.includes('400') ||
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('404')
    ) {
      return false;
    }

    // Retry server errors (500-599) and network errors
    if (
      error.message.includes('500') ||
      error.message.includes('502') ||
      error.message.includes('503') ||
      error.message.includes('504') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ENOTFOUND')
    ) {
      return true;
    }

    // Retry rate limit errors with backoff
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return true;
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.retryDelay;
    const exponentialDelay = baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5); // Add jitter

    return Math.min(jitteredDelay, this.config.maxRetryDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class RetryError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public attempts: number,
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  operationName?: string,
): Promise<T> {
  const retryManager = new RetryManager(config);
  return retryManager.execute(operation, operationName);
}

export function createRetryManager(config: RetryConfig): RetryManager {
  return new RetryManager(config);
}

export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold = 5,
    private resetTimeoutMs = 60000,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}

export function createCircuitBreaker(failureThreshold = 5, resetTimeoutMs = 60000): CircuitBreaker {
  return new CircuitBreaker(failureThreshold, resetTimeoutMs);
}

export class BulkRetryManager {
  constructor(private config: RetryConfig) {}

  async executeAll<T>(
    operations: Array<() => Promise<T>>,
    maxConcurrency = 5,
  ): Promise<Array<{ success: boolean; data?: T; error?: Error; index: number }>> {
    const results: Array<{ success: boolean; data?: T; error?: Error; index: number }> = [];
    const retryManager = new RetryManager(this.config);

    // Process operations in batches to limit concurrency
    for (let i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency);
      const batchPromises = batch.map(async (operation, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          const data = await retryManager.execute(operation, `operation-${globalIndex}`);
          return { success: true, data, index: globalIndex };
        } catch (error) {
          return { success: false, error: error as Error, index: globalIndex };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results.sort((a, b) => a.index - b.index);
  }
}
