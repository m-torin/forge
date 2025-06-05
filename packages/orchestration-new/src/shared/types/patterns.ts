/**
 * Reliability and resilience pattern types
 */

export interface RetryPattern {
  /** Base delay in milliseconds */
  baseDelay: number;
  /** Whether to add jitter to delays */
  jitter?: boolean;
  /** Maximum number of attempts */
  maxAttempts: number;
  /** Maximum delay cap (for exponential/linear) */
  maxDelay?: number;
  /** Callback called before each retry */
  onRetry?: (error: Error, attempt: number) => void;
  /** Function to determine if error should be retried */
  shouldRetry?: (error: Error, attempt: number) => boolean;
  /** Strategy for retry delays */
  strategy: 'fixed' | 'exponential' | 'linear';
}

export interface CircuitBreakerPattern {
  /** Custom error transformer */
  errorFilter?: (error: Error) => boolean;
  /** Failure threshold to open circuit */
  failureThreshold: number;
  /** Minimum number of calls to consider statistics */
  minimumCallsToTrip?: number;
  /** Callback when circuit closes */
  onClose?: () => void;
  /** Callback when circuit is half-open */
  onHalfOpen?: () => void;
  /** Callback when circuit opens */
  onOpen?: () => void;
  /** How long to wait before attempting reset (ms) */
  resetTimeout: number;
  /** Rolling window size for statistics */
  rollingCountWindow?: number;
  /** Time window for failure counting (ms) */
  timeout: number;
}

export interface BatchPattern {
  /** Concurrency for batch processing */
  concurrency?: number;
  /** Error handling strategy */
  errorHandling?: 'fail-fast' | 'continue' | 'collect-errors';
  /** Maximum batch size */
  maxBatchSize: number;
  /** Maximum wait time before processing batch (ms) */
  maxWaitTime: number;
  /** Minimum batch size to trigger processing */
  minBatchSize?: number;
  /** Whether to preserve order in results */
  preserveOrder?: boolean;
  /** Callback for batch processing */
  processor: (items: any[]) => Promise<any[]>;
}

export interface RateLimitPattern {
  /** Algorithm to use */
  algorithm: 'sliding-window' | 'fixed-window' | 'token-bucket';
  /** Unique identifier for this rate limiter */
  identifier: string;
  /** Time window in milliseconds */
  interval: number;
  /** Custom key generator */
  keyGenerator?: (context: any) => string;
  /** Whether to throw error or return false when limited */
  throwOnLimit?: boolean;
  /** Number of tokens/requests allowed */
  tokens: number;
}

export interface DeduplicationPattern {
  /** Whether to extend window on duplicate */
  extendWindow?: boolean;
  /** Key extractor function */
  keyExtractor: (item: any) => string;
  /** Maximum entries to store */
  maxEntries?: number;
  /** Storage backend for deduplication state */
  storage: 'memory' | 'redis' | 'database';
  /** Time window for deduplication (ms) */
  windowMs: number;
}

export interface BulkheadPattern {
  /** Maximum concurrent operations */
  maxConcurrency: number;
  /** Maximum queue size for waiting operations */
  maxQueueSize: number;
  /** Name of the bulkhead */
  name: string;
  /** Callback for rejected operations */
  onRejection?: (operation: any) => void;
  /** Timeout for queued operations */
  queueTimeout?: number;
  /** Rejection strategy when full */
  rejectionStrategy: 'throw' | 'drop' | 'callback';
}

export interface TimeoutPattern {
  /** Timeout duration in milliseconds */
  duration: number;
  /** Custom timeout message */
  message?: string;
  /** Callback when operation times out */
  onTimeout?: () => void;
  /** Whether to use AbortController */
  useAbortController?: boolean;
}

export interface CachePattern {
  /** Cache key generator */
  keyGenerator: (args: any[]) => string;
  /** Maximum cache size */
  maxSize?: number;
  /** Whether to refresh cache in background */
  refreshAhead?: boolean;
  /** Refresh threshold (percentage of TTL) */
  refreshThreshold?: number;
  /** Cache storage backend */
  storage: 'memory' | 'redis';
  /** Time to live in milliseconds */
  ttl: number;
}

export interface FallbackPattern {
  /** Fallback operation */
  fallback: () => Promise<any>;
  /** Conditions to trigger fallback */
  fallbackOn?: (error: Error) => boolean;
  /** Primary operation */
  primary: () => Promise<any>;
  /** Delay before retrying primary */
  retryDelay?: number;
  /** Whether to try primary again after fallback */
  retryPrimary?: boolean;
}

export interface MonitoringPattern {
  /** Custom metric extractors */
  customMetrics?: Record<string, (result: any, duration: number) => number>;
  /** Whether to log operations */
  enableLogging?: boolean;
  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Metrics to collect */
  metrics: ('duration' | 'success-rate' | 'error-rate' | 'throughput')[];
  /** Sampling rate (0-1) */
  samplingRate?: number;
}

export interface PatternContext {
  /** Attempt number */
  attempt: number;
  /** Additional context */
  metadata?: Record<string, any>;
  /** Operation identifier */
  operationId: string;
  /** Previous errors */
  previousErrors: Error[];
  /** Start time */
  startTime: Date;
}

export interface PatternResult<T = any> {
  /** Number of attempts made */
  attempts: number;
  /** Result data (if successful) */
  data?: T;
  /** Duration in milliseconds */
  duration: number;
  /** Error (if failed) */
  error?: Error;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Pattern that was applied */
  pattern?: string;
  /** Whether operation succeeded */
  success: boolean;
}