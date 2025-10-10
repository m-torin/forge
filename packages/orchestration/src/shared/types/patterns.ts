/**
 * Reliability and resilience pattern types
 */

export interface BatchPattern {
  /** Concurrency for batch processing */
  concurrency?: number;
  /** Error handling strategy */
  errorHandling?: 'collect-errors' | 'continue' | 'fail-fast';
  /** Maximum batch size */
  maxBatchSize: number;
  /** Maximum wait time before processing batch (ms) */
  maxWaitTime: number;
  /** Minimum batch size to trigger processing */
  minBatchSize?: number;
  /** Whether to preserve order in results */
  preserveOrder?: boolean;
  /** Callback for batch processing */
  processor: (items: unknown[]) => Promise<unknown[]>;
}

interface BulkheadPattern {
  /** Maximum concurrent operations */
  maxConcurrency: number;
  /** Maximum queue size for waiting operations */
  maxQueueSize: number;
  /** Name of the bulkhead */
  name: string;
  /** Callback for rejected operations */
  onRejection?: (operation: unknown) => void;
  /** Timeout for queued operations */
  queueTimeout?: number;
  /** Rejection strategy when full */
  rejectionStrategy: 'callback' | 'drop' | 'throw';
}

interface CachePattern {
  /** Cache key generator */
  keyGenerator: (args: unknown[]) => string;
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

interface DeduplicationPattern {
  /** Whether to extend window on duplicate */
  extendWindow?: boolean;
  /** Key extractor function */
  keyExtractor: (item: unknown) => string;
  /** Maximum entries to store */
  maxEntries?: number;
  /** Storage backend for deduplication state */
  storage: 'database' | 'memory' | 'redis';
  /** Time window for deduplication (ms) */
  windowMs: number;
}

interface FallbackPattern {
  /** Fallback operation */
  fallback: () => Promise<unknown>;
  /** Conditions to trigger fallback */
  fallbackOn?: (error: Error) => boolean;
  /** Primary operation */
  primary: () => Promise<unknown>;
  /** Delay before retrying primary */
  retryDelay?: number;
  /** Whether to try primary again after fallback */
  retryPrimary?: boolean;
}

interface MonitoringPattern {
  /** Custom metric extractors */
  customMetrics?: Record<string, (result: unknown, duration: number) => number>;
  /** Whether to log operations */
  enableLogging?: boolean;
  /** Log level */
  logLevel?: 'debug' | 'error' | 'info' | 'warn';
  /** Metrics to collect */
  metrics: ('duration' | 'error-rate' | 'success-rate' | 'throughput')[];
  /** Sampling rate (0-1) */
  samplingRate?: number;
}

export interface PatternContext {
  /** Attempt number */
  attempt: number;
  /** Additional context */
  metadata?: Record<string, unknown>;
  /** Operation identifier */
  operationId: string;
  /** Previous errors */
  previousErrors: Error[];
  /** Start time */
  startTime: Date;
}

export interface PatternResult<T = unknown> {
  /** Number of attempts made */
  attempts: number;
  /** Result data (if successful) */
  data?: T;
  /** Duration in milliseconds */
  duration: number;
  /** Error (if failed) */
  error?: Error;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Pattern that was applied */
  pattern?: string;
  /** Whether operation succeeded */
  success: boolean;
}

export interface RateLimitPattern {
  /** Algorithm to use */
  algorithm: 'fixed-window' | 'sliding-window' | 'token-bucket';
  /** Unique identifier for this rate limiter */
  getIdentifier: string;
  /** Time window in milliseconds */
  interval: number;
  /** Custom key generator */
  keyGenerator?: (context: unknown) => string;
  /** Whether to throw error or return false when limited */
  throwOnLimit?: boolean;
  /** Number of tokens/requests allowed */
  tokens: number;
}

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
  strategy: 'exponential' | 'fixed' | 'linear';
}

interface TimeoutPattern {
  /** Timeout duration in milliseconds */
  duration: number;
  /** Custom timeout message */
  message?: string;
  /** Callback when operation times out */
  onTimeout?: () => void;
  /** Whether to use AbortController */
  useAbortController?: boolean;
}
