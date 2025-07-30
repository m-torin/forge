// middleware/circuit/middleware.ts
import {
  createMiddleware,
  type Middleware,
  type MiddlewareContext,
} from '../base';
import {
  CircuitState,
  CircuitOptions,
  CircuitStats,
  CircuitMetadata,
  CircuitBucket,
  CircuitMetrics,
  CircuitBreakerError,
} from './types';

// Make onStateChange required in default options by excluding it
const DEFAULT_OPTIONS: Required<Omit<CircuitOptions, 'onStateChange'>> = {
  enabled: true,
  bucketSize: 1000, // 1 second
  bucketCount: 10, // 10 second rolling window
  errorThresholdPercentage: 50,
  resetTimeout: 30000, // 30 seconds
  halfOpenLimit: 1,
  degradationThreshold: 5000, // 5 seconds
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private buckets: CircuitBucket[];
  private lastFailure?: Date;
  private nextReset?: Date;
  private halfOpenCount = 0;

  // Fix: Make options type explicitly include onStateChange
  private readonly options: Required<Omit<CircuitOptions, 'onStateChange'>> & {
    onStateChange?: (from: CircuitState, to: CircuitState) => void;
  };

  constructor(options: CircuitOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.buckets = Array(this.options.bucketCount)
      .fill(null)
      .map(() => ({
        timestamp: 0,
        failures: 0,
        successes: 0,
        totalTime: 0,
      }));
  }

  private setState(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.options.onStateChange?.(oldState, newState);
    }
  }

  private getCurrentMetrics(): CircuitMetrics {
    const now = Date.now();
    const windowStart =
      now - this.options.bucketSize * this.options.bucketCount;

    const totals = this.buckets
      .filter((b) => b.timestamp >= windowStart)
      .reduce(
        (acc, bucket) => ({
          failures: acc.failures + bucket.failures,
          successes: acc.successes + bucket.successes,
          totalTime: acc.totalTime + bucket.totalTime,
          total: acc.total + bucket.failures + bucket.successes,
        }),
        { failures: 0, successes: 0, totalTime: 0, total: 0 },
      );

    return {
      failures: totals.failures,
      successes: totals.successes,
      errorPercentage:
        totals.total === 0 ? 0 : (totals.failures / totals.total) * 100,
      avgResponseTime: totals.total === 0 ? 0 : totals.totalTime / totals.total,
    };
  }

  private updateMetrics(success: boolean, duration: number): void {
    const now = Date.now();
    const bucketIndex =
      Math.floor(now / this.options.bucketSize) % this.options.bucketCount;

    if (this.buckets[bucketIndex].timestamp < now - this.options.bucketSize) {
      this.buckets[bucketIndex] = {
        timestamp: now,
        failures: 0,
        successes: 0,
        totalTime: 0,
      };
    }

    if (success) {
      this.buckets[bucketIndex].successes++;
    } else {
      this.buckets[bucketIndex].failures++;
    }
    this.buckets[bucketIndex].totalTime += duration;
  }

  private isDegraded(metrics: CircuitMetrics): boolean {
    return metrics.avgResponseTime > this.options.degradationThreshold;
  }

  canExecute(): boolean {
    if (!this.options.enabled) return true;

    switch (this.state) {
      case CircuitState.CLOSED:
        return true;
      case CircuitState.OPEN:
        if (this.nextReset && Date.now() >= this.nextReset.getTime()) {
          this.setState(CircuitState.HALF_OPEN);
          return this.halfOpenCount < this.options.halfOpenLimit;
        }
        return false;
      case CircuitState.HALF_OPEN:
        const canExecute = this.halfOpenCount < this.options.halfOpenLimit;
        if (canExecute) this.halfOpenCount++;
        return canExecute;
      default:
        return false;
    }
  }

  recordSuccess(duration: number): void {
    this.updateMetrics(true, duration);
    const metrics = this.getCurrentMetrics();

    switch (this.state) {
      case CircuitState.HALF_OPEN:
        if (metrics.errorPercentage < this.options.errorThresholdPercentage) {
          this.reset();
        }
        break;
      case CircuitState.CLOSED:
        break;
    }
  }

  recordFailure(error: Error, duration: number): void {
    this.updateMetrics(false, duration);
    this.lastFailure = new Date();
    const metrics = this.getCurrentMetrics();

    if (
      this.state === CircuitState.HALF_OPEN ||
      metrics.errorPercentage >= this.options.errorThresholdPercentage
    ) {
      this.trip();
    }
  }

  private trip(): void {
    this.setState(CircuitState.OPEN);
    this.nextReset = new Date(Date.now() + this.options.resetTimeout);
    this.halfOpenCount = 0;
  }

  private reset(): void {
    this.setState(CircuitState.CLOSED);
    this.halfOpenCount = 0;
    delete this.nextReset;
  }

  getStats(): CircuitStats {
    const metrics = this.getCurrentMetrics();
    return {
      ...metrics,
      state: this.state,
      degraded: this.isDegraded(metrics),
      ...(this.lastFailure && { lastFailure: this.lastFailure }),
      ...(this.nextReset && { nextReset: this.nextReset }),
    };
  }
}

// Fix: Extend CircuitOptions to include index signature
interface ExtendedCircuitOptions extends CircuitOptions {
  [key: string]: unknown;
}

export const createCircuitBreakerMiddleware = (
  options: ExtendedCircuitOptions = {},
): Middleware => {
  const breaker = new CircuitBreaker(options);

  return createMiddleware(async (context: MiddlewareContext, next) => {
    if (!breaker.canExecute()) {
      const stats = breaker.getStats();
      throw new CircuitBreakerError(
        `Circuit breaker is ${stats.state}`,
        stats.state,
        stats,
      );
    }

    const startTime = Date.now();

    try {
      const result = await next();
      const duration = Date.now() - startTime;
      breaker.recordSuccess(duration);

      const stats = breaker.getStats();
      const circuitMeta: CircuitMetadata = {
        state: stats.state,
        metrics: {
          failures: stats.failures,
          successes: stats.successes,
          errorPercentage: stats.errorPercentage,
          avgResponseTime: stats.avgResponseTime,
        },
        degraded: stats.degraded,
      };

      return {
        ...result,
        metadata: {
          ...result.metadata,
          circuit: circuitMeta,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      breaker.recordFailure(
        error instanceof Error ? error : new Error(String(error)),
        duration,
      );
      throw error;
    }
  }, options);
};

// Export a helper to create a breaker with default settings
export const createDefaultCircuitBreaker = (
  customOptions: Partial<ExtendedCircuitOptions> = {},
): Middleware => {
  return createCircuitBreakerMiddleware({
    ...DEFAULT_OPTIONS,
    ...customOptions,
  });
};
