// middleware/circuit/index.ts
import { createCircuitBreakerMiddleware } from './middleware';
export type {
  CircuitState,
  CircuitOptions,
  CircuitMetadata,
  CircuitStats,
  CircuitBucket,
  CircuitMetrics,
} from './types';

export { CircuitBreaker, createCircuitBreakerMiddleware } from './middleware';

export { CircuitBreakerError } from './types';

// Export configured middleware with default options
export const circuitBreakerMiddleware = createCircuitBreakerMiddleware();

// Export factory with custom error threshold
export const createETLCircuitBreaker = (errorThresholdPercentage = 25) =>
  createCircuitBreakerMiddleware({
    bucketSize: 1000, // 1 second windows
    bucketCount: 60, // 1 minute total window
    errorThresholdPercentage,
    resetTimeout: 60000, // 1 minute reset timeout
    halfOpenLimit: 5, // Allow 5 requests in half-open
    degradationThreshold: 10000, // 10 second degradation threshold
  });
