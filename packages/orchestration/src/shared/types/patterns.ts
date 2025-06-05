/**
 * Workflow Pattern Types
 * Common patterns and abstractions for workflow implementations
 */

import type { WorkflowStep, WorkflowContext } from './workflow';

/**
 * Circuit breaker state
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Failure threshold before opening circuit
   */
  failureThreshold: number;

  /**
   * Time window for failure counting (ms)
   */
  failureWindow: number;

  /**
   * Time to wait before attempting recovery (ms)
   */
  recoveryTimeout: number;

  /**
   * Number of successful calls to close circuit
   */
  successThreshold: number;

  /**
   * Fallback function when circuit is open
   */
  fallback?: <T>(error: Error) => T | Promise<T>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxAttempts: number;

  /**
   * Backoff strategy
   */
  backoff: {
    type: 'fixed' | 'exponential' | 'linear' | 'custom';
    baseDelay: number;
    maxDelay?: number;
    multiplier?: number;
    customStrategy?: (attempt: number) => number;
  };

  /**
   * Errors to retry (default: all)
   */
  retryableErrors?: Array<new (...args: any[]) => Error>;

  /**
   * Errors to not retry
   */
  nonRetryableErrors?: Array<new (...args: any[]) => Error>;

  /**
   * Custom retry predicate
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Jitter configuration
   */
  jitter?: {
    type: 'none' | 'full' | 'decorrelated';
    factor?: number;
  };
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Time window (ms)
   */
  window: number;

  /**
   * Strategy for rate limiting
   */
  strategy: 'sliding-window' | 'fixed-window' | 'token-bucket';

  /**
   * Key generator for distributed rate limiting
   */
  keyGenerator?: (context: WorkflowContext) => string;

  /**
   * What to do when rate limited
   */
  onRateLimit?: 'queue' | 'reject' | 'delay';
}

/**
 * Batch processing configuration
 */
export interface BatchConfig<T = any> {
  /**
   * Maximum batch size
   */
  maxSize: number;

  /**
   * Maximum wait time before processing (ms)
   */
  maxWait: number;

  /**
   * Concurrency for batch processing
   */
  concurrency?: number;

  /**
   * Group items into batches
   */
  groupBy?: (item: T) => string;

  /**
   * Process individual batch
   */
  processor: (batch: T[]) => Promise<any[]>;

  /**
   * Error handling strategy
   */
  errorStrategy?: 'fail-fast' | 'fail-silent' | 'partial';
}

/**
 * Parallel execution configuration
 */
export interface ParallelConfig {
  /**
   * Maximum concurrent executions
   */
  maxConcurrency: number;

  /**
   * Order preservation
   */
  preserveOrder?: boolean;

  /**
   * Timeout per execution (ms)
   */
  timeout?: number;

  /**
   * Error handling
   */
  onError?: 'fail-fast' | 'continue' | 'collect';
}

/**
 * Pipeline stage definition
 */
export interface PipelineStage<TInput = any, TOutput = any> {
  /**
   * Stage name
   */
  name: string;

  /**
   * Transform function
   */
  transform: (input: TInput, context: WorkflowContext) => Promise<TOutput>;

  /**
   * Stage configuration
   */
  config?: {
    parallel?: boolean;
    optional?: boolean;
    condition?: (input: TInput) => boolean;
  };
}

/**
 * Fan-out/fan-in pattern configuration
 */
export interface FanOutFanInConfig<T = any, R = any> {
  /**
   * Split function to create parallel tasks
   */
  split: (input: T) => T[] | Promise<T[]>;

  /**
   * Process individual item
   */
  process: (item: T, index: number) => Promise<R>;

  /**
   * Combine results
   */
  combine: (results: R[]) => any;

  /**
   * Parallel execution config
   */
  parallel?: ParallelConfig;
}

/**
 * Saga pattern configuration
 */
export interface SagaConfig<T = any> {
  /**
   * Saga steps with compensations
   */
  steps: Array<{
    name: string;
    action: (data: T, context: WorkflowContext) => Promise<any>;
    compensation?: (data: T, context: WorkflowContext, error?: Error) => Promise<void>;
  }>;

  /**
   * Compensation strategy
   */
  compensationStrategy?: 'sequential' | 'parallel';

  /**
   * Isolation level
   */
  isolationLevel?: 'read-uncommitted' | 'read-committed' | 'repeatable-read' | 'serializable';
}

/**
 * Workflow composition patterns
 */
export interface CompositionPatterns {
  /**
   * Sequential composition
   */
  sequence<T>(...steps: WorkflowStep[]): WorkflowStep<T, T>;

  /**
   * Parallel composition
   */
  parallel<T>(...steps: WorkflowStep[]): WorkflowStep<T, T[]>;

  /**
   * Conditional composition
   */
  conditional<T>(
    predicate: (input: T) => boolean,
    ifTrue: WorkflowStep,
    ifFalse?: WorkflowStep,
  ): WorkflowStep<T, T>;

  /**
   * Loop composition
   */
  loop<T>(
    condition: (input: T, iteration: number) => boolean,
    step: WorkflowStep,
    maxIterations?: number,
  ): WorkflowStep<T, T>;

  /**
   * Map over array
   */
  map<T, R>(step: WorkflowStep<T, R>, config?: ParallelConfig): WorkflowStep<T[], R[]>;

  /**
   * Reduce array
   */
  reduce<T, R>(step: WorkflowStep<{ acc: R; item: T }, R>, initialValue: R): WorkflowStep<T[], R>;

  /**
   * Filter array
   */
  filter<T>(predicate: (item: T) => boolean | Promise<boolean>): WorkflowStep<T[], T[]>;

  /**
   * Retry wrapper
   */
  retry<T, R>(step: WorkflowStep<T, R>, config: RetryConfig): WorkflowStep<T, R>;

  /**
   * Circuit breaker wrapper
   */
  circuitBreaker<T, R>(step: WorkflowStep<T, R>, config: CircuitBreakerConfig): WorkflowStep<T, R>;

  /**
   * Rate limit wrapper
   */
  rateLimit<T, R>(step: WorkflowStep<T, R>, config: RateLimitConfig): WorkflowStep<T, R>;

  /**
   * Timeout wrapper
   */
  timeout<T, R>(step: WorkflowStep<T, R>, ms: number): WorkflowStep<T, R>;

  /**
   * Cache wrapper
   */
  cache<T, R>(
    step: WorkflowStep<T, R>,
    config: {
      key: (input: T) => string;
      ttl: number;
      storage?: 'memory' | 'redis';
    },
  ): WorkflowStep<T, R>;
}

/**
 * Deduplication configuration
 */
export interface DeduplicationConfig {
  /**
   * Generate deduplication key
   */
  keyGenerator: (params: any) => string;

  /**
   * Deduplication window (ms)
   */
  window: number;

  /**
   * Storage backend
   */
  storage?: 'memory' | 'redis' | 'database';

  /**
   * What to do with duplicates
   */
  onDuplicate?: 'ignore' | 'merge' | 'reject';
}

/**
 * Event sourcing configuration
 */
export interface EventSourcingConfig {
  /**
   * Event store
   */
  store: {
    save: (event: any) => Promise<void>;
    load: (aggregateId: string) => Promise<any[]>;
  };

  /**
   * Event handlers
   */
  handlers: Record<string, (event: any, state: any) => any>;

  /**
   * Snapshot configuration
   */
  snapshots?: {
    frequency: number;
    store: {
      save: (aggregateId: string, state: any) => Promise<void>;
      load: (aggregateId: string) => Promise<any>;
    };
  };
}

/**
 * Workflow hooks
 */
export interface WorkflowHooks {
  /**
   * Before workflow starts
   */
  beforeStart?: (context: WorkflowContext) => Promise<void>;

  /**
   * After workflow completes
   */
  afterComplete?: (context: WorkflowContext, result: any) => Promise<void>;

  /**
   * On workflow error
   */
  onError?: (context: WorkflowContext, error: Error) => Promise<void>;

  /**
   * Before each step
   */
  beforeStep?: (stepName: string, input: any) => Promise<void>;

  /**
   * After each step
   */
  afterStep?: (stepName: string, output: any) => Promise<void>;

  /**
   * On step error
   */
  onStepError?: (stepName: string, error: Error) => Promise<void>;
}

/**
 * Workflow middleware
 */
export type WorkflowMiddleware = (
  next: (input: any) => Promise<any>,
) => (input: any) => Promise<any>;
