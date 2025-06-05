/**
 * Reliability and resilience patterns for orchestration
 */

// Retry pattern
export {
  calculateDelay,
  createRetryFn,
  Retry,
  retryDatabase,
  retryFast,
  retryNetwork,
  retryPatient,
  retryStandard,
  RetryStrategies,
  withRetry,
} from './retry.js';

export type { RetryOptions } from './retry.js';

// Batch pattern
export {
  Batch,
  BatchManager,
  createBatchProcessor,
  withBatch,
} from './batch.js';

export type {
  BatchItem,
  BatchOptions,
  BatchProcessor,
} from './batch.js';

// Circuit breaker pattern
export {
  CircuitBreaker,
  CircuitBreakerConfigs,
  CircuitBreakerManager,
  circuitBreakerManager,
  createCircuitBreakerFn,
  getCircuitBreakerStats,
  resetCircuitBreaker,
  withCircuitBreaker,
} from './circuit-breaker.js';

export type { CircuitBreakerOptions } from './circuit-breaker.js';