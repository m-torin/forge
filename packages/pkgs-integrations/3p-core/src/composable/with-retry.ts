/**
 * Composable Retry Utility - Tree-shaking optimized
 * Only imported when retry functionality is needed
 */

import type { MinimalAdapter } from '../adapters/minimal-adapter';
import type { AnalyticsEvent, GroupPayload, IdentifyPayload, PagePayload } from '../types';

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  maxRetryDelay?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold?: number;
  recoveryTimeout?: number;
}

class RetryManager {
  constructor(private config: RetryConfig) {}

  async execute<T>(operation: () => Promise<T>, context?: string): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === (this.config.maxRetries || 3)) {
          throw lastError;
        }

        const delay = Math.min(
          (this.config.retryDelay || 1000) * Math.pow(this.config.backoffMultiplier || 2, attempt),
          this.config.maxRetryDelay || 30000,
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > (this.config.recoveryTimeout || 60000)) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
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
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= (this.config.failureThreshold || 5)) {
      this.state = 'open';
    }
  }
}

export function withRetry(
  adapter: MinimalAdapter,
  retryConfig?: RetryConfig,
  circuitConfig?: CircuitBreakerConfig,
): MinimalAdapter {
  const retryManager = new RetryManager(retryConfig || {});
  const circuitBreaker = new CircuitBreaker(circuitConfig || {});

  return {
    ...adapter,
    async track(event: AnalyticsEvent): Promise<boolean> {
      return circuitBreaker.execute(() => retryManager.execute(() => adapter.track(event)));
    },

    async identify(payload: IdentifyPayload): Promise<boolean> {
      return circuitBreaker.execute(() => retryManager.execute(() => adapter.identify(payload)));
    },

    async group(payload: GroupPayload): Promise<boolean> {
      return circuitBreaker.execute(() => retryManager.execute(() => adapter.group(payload)));
    },

    async page(payload: PagePayload): Promise<boolean> {
      return circuitBreaker.execute(() => retryManager.execute(() => adapter.page(payload)));
    },
  };
}
