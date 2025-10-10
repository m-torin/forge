/**
 * Upstash Redis type definitions and interfaces
 */

// Re-export Upstash Redis types (only the ones that exist)
export type { Redis, RedisConfigNodejs } from '@upstash/redis';

// Re-export rate limit types (only the ones that exist)
export type { Algorithm, Duration, Ratelimit } from '@upstash/ratelimit';

/**
 * Upstash Redis configuration
 */
export interface UpstashRedisConfig {
  url: string;
  token: string;
  enableTelemetry?: boolean;
  enableAutoPipelining?: boolean;
  readYourWrites?: boolean;
  retry?: {
    retries?: number;
    delay?: number;
  };
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requests: number;
  window: string | number; // e.g., "10s", "1m", "1h", or milliseconds
  algorithm?: 'sliding-window' | 'fixed-window' | 'token-bucket';
  identifier?: (request?: any) => string;
  prefix?: string;
  ephemeralCache?: Map<string, any>;
}

/**
 * Cache operation options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
  compress?: boolean;
  serialize?: boolean;
}

/**
 * Pagination options for Redis operations
 */
export interface RedisPaginationOptions {
  cursor?: string;
  count?: number;
  match?: string;
}

/**
 * Redis scan result
 */
export interface RedisScanResult<T = string> {
  cursor: string;
  keys: T[];
  hasMore: boolean;
}

/**
 * Batch operation types
 */
export type RedisBatchOperation =
  | { type: 'set'; key: string; value: any; options?: CacheOptions }
  | { type: 'get'; key: string }
  | { type: 'del'; key: string }
  | { type: 'expire'; key: string; seconds: number }
  | { type: 'incr'; key: string }
  | { type: 'decr'; key: string };

/**
 * Redis pipeline result
 */
export interface RedisPipelineResult {
  results: any[];
  errors: (Error | null)[];
  success: boolean;
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  maxConnections?: number;
  minConnections?: number;
  acquireTimeout?: number;
  idleTimeout?: number;
  reapInterval?: number;
}

/**
 * Monitoring and metrics
 */
export interface RedisMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  operations: {
    total: number;
    successful: number;
    failed: number;
  };
  latency: {
    min: number;
    max: number;
    avg: number;
  };
  memory: {
    used: number;
    peak: number;
  };
}

/**
 * Redis operation result wrapper
 */
export type RedisResult<T> =
  | { success: true; data: T; metrics?: Partial<RedisMetrics> }
  | { success: false; error: string; code?: string };

/**
 * Key pattern for different data types
 */
export interface KeyPatterns {
  user: (id: string) => string;
  session: (sessionId: string) => string;
  cache: (namespace: string, key: string) => string;
  rateLimit: (identifier: string) => string;
  lock: (resource: string) => string;
  queue: (name: string) => string;
}

/**
 * Default key patterns
 */
export const defaultKeyPatterns: KeyPatterns = {
  user: (id: string) => `user:${id}`,
  session: (sessionId: string) => `session:${sessionId}`,
  cache: (namespace: string, key: string) => `cache:${namespace}:${key}`,
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
  lock: (resource: string) => `lock:${resource}`,
  queue: (name: string) => `queue:${name}`,
};

/**
 * Distributed lock options
 */
export interface LockOptions {
  ttl?: number; // Lock time to live in seconds
  retry?: {
    attempts?: number;
    delay?: number;
  };
  extend?: boolean; // Allow extending lock
}

/**
 * Lock result
 */
export interface LockResult {
  acquired: boolean;
  lockId?: string;
  ttl?: number;
  extend?: (additionalTtl: number) => Promise<boolean>;
  release?: () => Promise<boolean>;
}

/**
 * Queue message
 */
export interface QueueMessage<T = any> {
  id: string;
  data: T;
  timestamp: number;
  attempts: number;
  delay?: number;
  priority?: number;
}

/**
 * Queue options
 */
export interface QueueOptions {
  maxRetries?: number;
  retryDelay?: number;
  priority?: number;
  delay?: number; // Delay in seconds before processing
  ttl?: number; // Message time to live
}

/**
 * Queue processor function
 */
export type QueueProcessor<T = any> = (message: QueueMessage<T>) => Promise<void>;

/**
 * Session storage interface
 */
export interface SessionStore {
  get(sessionId: string): Promise<any | null>;
  set(sessionId: string, data: any, ttl?: number): Promise<void>;
  destroy(sessionId: string): Promise<void>;
  touch(sessionId: string, ttl?: number): Promise<void>;
  exists(sessionId: string): Promise<boolean>;
}

/**
 * Runtime environment detection
 */
export type RuntimeEnvironment = 'nodejs' | 'browser' | 'edge' | 'worker';

/**
 * Environment-specific client options
 */
export interface EnvironmentOptions {
  runtime?: RuntimeEnvironment;
  enableCompression?: boolean;
  enableMetrics?: boolean;
  enableDebug?: boolean;
}

/**
 * Upstash Redis client interface
 */
export interface UpstashRedisClient {
  // Basic Redis operations
  get<T = string>(key: string): Promise<T | null>;
  set(key: string, value: any, options?: CacheOptions): Promise<'OK'>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;

  // Advanced operations
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  incrby(key: string, increment: number): Promise<number>;
  decrby(key: string, decrement: number): Promise<number>;

  // Hash operations
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, field: string, value: any): Promise<number>;
  hdel(key: string, ...fields: string[]): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;

  // List operations
  lpush(key: string, ...elements: any[]): Promise<number>;
  rpush(key: string, ...elements: any[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  rpop(key: string): Promise<string | null>;
  llen(key: string): Promise<number>;

  // Set operations
  sadd(key: string, ...members: any[]): Promise<number>;
  srem(key: string, ...members: any[]): Promise<number>;
  sismember(key: string, member: any): Promise<boolean>;
  smembers(key: string): Promise<string[]>;

  // Batch operations
  pipeline(): RedisPipeline;
  multi(): RedisMulti;

  // Utility
  ping(): Promise<'PONG'>;
  flushdb(): Promise<'OK'>;
  keys(pattern: string): Promise<string[]>;
  scan(cursor: string, options?: RedisPaginationOptions): Promise<RedisScanResult>;
}

/**
 * Redis pipeline interface
 */
export interface RedisPipeline {
  get(key: string): RedisPipeline;
  set(key: string, value: any, options?: CacheOptions): RedisPipeline;
  del(...keys: string[]): RedisPipeline;
  exec(): Promise<RedisPipelineResult>;
}

/**
 * Redis multi/transaction interface
 */
export interface RedisMulti extends RedisPipeline {
  discard(): Promise<'OK'>;
}

/**
 * Upstash Redis server interface (for server-side operations)
 */
export interface UpstashRedisServer extends UpstashRedisClient {
  // Rate limiting
  rateLimit: {
    check(
      identifier: string,
      config: RateLimitConfig,
    ): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
      pendingHits?: number;
    }>;
    limit(
      identifier: string,
      config: RateLimitConfig,
    ): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
      pendingHits?: number;
    }>;
    reset(identifier: string): Promise<void>;
  };

  // Distributed locking
  lock: {
    acquire(resource: string, options?: LockOptions): Promise<LockResult>;
    release(lockId: string): Promise<boolean>;
    extend(lockId: string, ttl: number): Promise<boolean>;
  };

  // Queue operations
  queue: {
    push<T>(name: string, data: T, options?: QueueOptions): Promise<string>;
    pop<T>(name: string): Promise<QueueMessage<T> | null>;
    process<T>(name: string, processor: QueueProcessor<T>): Promise<void>;
    size(name: string): Promise<number>;
  };

  // Session management
  session: SessionStore;

  // Monitoring
  getMetrics(): Promise<RedisMetrics>;
  healthCheck(): Promise<boolean>;
}
