// types.ts - Core types and constants for the factory system
// avoids circular dependencies

// =====================================
// Core Operation Types
// =====================================
export type Metadata = Readonly<Record<string, unknown>>;

export interface BaseContext {
  readonly id: string;
  readonly startTime: number;
  readonly metadata: Metadata;
}

export interface BaseResult<T = unknown> {
  readonly success: boolean;
  readonly duration: number;
  readonly metadata: Metadata;
  readonly data?: T;
  readonly error?: Error;
}

export interface WrapperConfig {
  timeout?: number;
  retries?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
    key: string;
  };
  logging?: {
    enabled: boolean;
    redactKeys: string[];
  };
  circuit?: {
    enabled: boolean;
    bucketSize: number;
    bucketCount: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
    halfOpenLimit: number;
    degradationThreshold: number;
    onStateChange?: () => void;
  };
  metadata?: Record<string, unknown>;
}

// =====================================
// Operation Settings & Defaults
// =====================================
export const OPERATION_DEFAULTS = {
  // Timeouts (in milliseconds)
  TIMEOUT: 30_000, // 30 seconds
  MIN_TIMEOUT: 1_000, // 1 second
  MAX_TIMEOUT: 300_000, // 5 minutes

  // Retry Configuration
  RETRIES: 3,
  MIN_RETRIES: 0,
  MAX_RETRIES: 10,
  RETRY_BACKOFF_MS: 1_000,
  MIN_RETRY_DELAY: 100, // 100ms
  MAX_RETRY_DELAY: 30_000, // 30 seconds

  // Cache Configuration
  CACHE_TTL: 300, // 5 minutes
  MIN_CACHE_TTL: 1, // 1 second
  MAX_CACHE_TTL: 86_400, // 24 hours

  // Middleware Limits
  MAX_MIDDLEWARE_COUNT: 100,
  MIDDLEWARE_TIMEOUT: 5_000,

  // Batch Processing
  MAX_BATCH_SIZE: 100,
  MIN_BATCH_SIZE: 1,
  MAX_BATCH_BYTES: 5 * 1024 * 1024, // 5MB
  BATCH_TIMEOUT: 1_000, // 1 second

  // Circuit Breaker
  CIRCUIT_WINDOW: 60_000, // 1 minute
  ERROR_THRESHOLD: 50, // 50%
  MIN_SAMPLES: 10, // Minimum samples before triggering
  RESET_TIMEOUT: 30_000, // 30 seconds
} as const;

export type OperationDefaultsType = typeof OPERATION_DEFAULTS;

// =====================================
// Middleware Configuration
// =====================================
export interface CleanupHandler {
  readonly cleanup: () => Promise<void>;
}

export interface TimeoutConfig {
  readonly timeoutMs: number;
  readonly signal: AbortSignal;
}

export interface RetryConfig {
  readonly maxAttempts: number;
  readonly backoffMs: number;
}

export interface CacheConfig {
  readonly enabled: boolean;
  readonly ttl: number;
  readonly key: string;
}

export type Priority = number;

export interface Disposable {
  readonly dispose: () => Promise<void>;
}

export const MIDDLEWARE_PRIORITY = {
  TELEMETRY: 1000, // Always first
  LOGGING: 900, // Early logging
  SIGNAL: 850, // Signal handling
  TIMEOUT: 800, // Timeout checking
  CIRCUIT: 700, // Circuit breaker
  RETRY: 600, // Retry handling
  CACHE: 500, // Cache checking
  RATE_LIMIT: 400, // Rate limiting
  LOCK: 300, // Resource locking
  BATCH: 200, // Batch processing
  TRANSFORM: 100, // Data transformation
  CUSTOM: 0, // Default for custom middleware
} as const;

export type MiddlewarePriorityType = typeof MIDDLEWARE_PRIORITY;

// =====================================
// Logging & Levels
// =====================================
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 50,
  [LogLevel.WARN]: 40,
  [LogLevel.INFO]: 30,
  [LogLevel.DEBUG]: 20,
  [LogLevel.TRACE]: 10,
} as const;

// =====================================
// HTTP & Network
// =====================================
export const HTTP_STATUS = {
  // Success Codes
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Error Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error Codes
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusType = typeof HTTP_STATUS;

export const RETRY_CODES = new Set([
  HTTP_STATUS.BAD_GATEWAY,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT,
  HTTP_STATUS.TOO_MANY_REQUESTS,
]);

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'Cache-Control': 'no-cache',
} as const;

export type DefaultHeadersType = typeof DEFAULT_HEADERS;

// =====================================
// Environment
// =====================================
export const ENV = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

export type EnvType = (typeof ENV)[keyof typeof ENV];
