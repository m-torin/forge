import type { CircuitBreakerConfig, CircuitBreakerState } from '../types';

export class CircuitBreaker {
  private failures = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private state: CircuitBreakerState = 'CLOSED';

  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;
  private readonly successThreshold: number;

  constructor(config: CircuitBreakerConfig = {}) {
    this.failureThreshold = config.failureThreshold ?? 5;
    this.recoveryTimeout = config.recoveryTimeout ?? 60000; // 1 minute
    this.successThreshold = config.successThreshold ?? 2;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error(
          `Circuit breaker is OPEN. Will retry after ${new Date(this.lastFailureTime + this.recoveryTimeout).toISOString()}`,
        );
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

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getStats() {
    return {
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
      nextRetryTime:
        this.state === 'OPEN'
          ? new Date(this.lastFailureTime + this.recoveryTimeout).toISOString()
          : null,
      state: this.state,
    };
  }

  reset(): void {
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}
