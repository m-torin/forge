/**
 * Client-side Redis types and utilities for browser environments
 * Provides type definitions and helper functions for Redis operations in client components
 *
 * @example
 * ```typescript
 * import { RedisClientConfig, formatRedisKey, validateRedisKey } from '@repo/database/redis/client';
 *
 * // Type-safe configuration
 * const config: RedisClientConfig = {
 *   url: 'redis://localhost:6379',
 *   token: 'your-token',
 *   retry: { retries: 3 }
 * };
 *
 * // Key validation and formatting
 * const userKey = formatRedisKey('users', userId);
 * if (validateRedisKey(userKey)) {
 *   // Safe to use key
 * }
 *
 * // Error handling
 * try {
 *   // Redis operation
 * } catch (error) {
 *   if (isRedisError(error)) {
 *     console.error('Redis error:', error.message);
 *   }
 * }
 * ```
 *
 * Note: Actual Redis client instances must be created on the server side.
 * Import from '@repo/database/redis/server' for Redis operations.
 */

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

// Re-export types and constants from @upstash/redis (client-safe)
export type {
  Requester,
  ScanCommandOptions,
  SetCommandOptions,
  UpstashResponse,
  ZAddCommandOptions,
  ZRangeCommandOptions,
} from '@upstash/redis';

// ============================================================================
// CLIENT CONFIGURATION TYPES
// ============================================================================

/**
 * Redis utility types that are safe for client use
 */
export interface RedisClientConfig {
  url: string;
  token: string;
  retry?: {
    retries?: number;
    backoff?: (retryIndex: number) => number;
  };
}

// ============================================================================
// CLIENT INTERFACE DEFINITIONS
// ============================================================================

/**
 * Client-side Redis interface (for type checking)
 */
export interface ClientRedisInterface {
  // Basic operations
  get(key: string): Promise<string | null>;
  set(key: string, value: string | number): Promise<'OK'>;
  del(...keys: string[]): Promise<number>;
  exists(...keys: string[]): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;

  // Hash operations
  hget(key: string, field: string): Promise<string | null>;
  hset(key: string, fieldValues: Record<string, string | number>): Promise<number>;
  hgetall(key: string): Promise<Record<string, string>>;
  hdel(key: string, ...fields: string[]): Promise<number>;

  // List operations
  lpush(key: string, ...values: (string | number)[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  lrange(key: string, start: number, end: number): Promise<string[]>;
  llen(key: string): Promise<number>;

  // Set operations
  sadd(key: string, members: (string | number)[]): Promise<number>;
  srem(key: string, members: (string | number)[]): Promise<number>;
  smembers(key: string): Promise<string[]>;
  sismember(key: string, member: string | number): Promise<number>;

  // Sorted set operations
  zadd(key: string, ...args: any[]): Promise<number>;
  zrange(key: string, start: number, end: number, options?: any): Promise<any>;
  zscore(key: string, member: string | number): Promise<number | null>;

  // Utility
  ping(): Promise<string>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Client-side helper functions for Redis operations
 */
export function isRedisError(error: unknown): error is Error {
  return error instanceof Error && error.name === 'UpstashError';
}

export function validateRedisKey(key: string): boolean {
  return typeof key === 'string' && key.length > 0 && key.length <= 512;
}

export function formatRedisKey(collection: string, id: string): string {
  return `${collection}:${id}`;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Client-side Redis patterns (for validation/UI)
 */
export const REDIS_PATTERNS = {
  KEY_SEPARATOR: ':',
  WILDCARD: '*',
  MAX_KEY_LENGTH: 512,
  MAX_VALUE_SIZE: 512 * 1024 * 1024, // 512MB
} as const;

// ============================================================================
// CLIENT LIMITATION NOTICE
// ============================================================================

/**
 * Important note about client-side limitations
 */
export const CLIENT_REDIS_NOTE = `
Redis client instances can only be created on the server side.
Import from '@repo/database/redis/server' or '@repo/database/redis/server/next' for actual Redis operations.
` as const;
