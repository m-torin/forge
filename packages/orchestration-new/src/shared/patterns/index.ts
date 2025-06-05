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
} from './retry';

export type { RetryOptions } from './retry';

// Batch pattern
export { Batch, BatchManager, createBatchProcessor, withBatch } from './batch';

export type {
  BatchItem,
  BatchOptions,
  BatchProcessor,
  BatchResult,
  BatchContext,
  BatchProcessorDefinition,
} from './batch';

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
} from './circuit-breaker';

export type { CircuitBreakerOptions } from './circuit-breaker';
