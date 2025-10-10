/**
 * Main entry point for @repo/db-upstash-redis package
 * Provides Upstash Redis client with rate limiting and edge runtime support
 */

// Export all types
export type * from './types';

// Export configuration utilities
export * from './config';

// Export main client functions
export { createClient, createClientCache } from './client';
export { createEdgeClient, createServerClient, safeServerOperation } from './server';

// Export operations
export { CacheOperations, RateLimitOperations, SessionOperations } from './operations';

// Runtime detection will be added later
export { detectRuntime } from './config';

// Re-export commonly used Upstash Redis types
export type {
  Algorithm,
  Duration,
  Ratelimit,
  RatelimitOptions,
  RatelimitResponse,
  Redis,
  RedisConfigBrowser,
  RedisConfigNodejs,
} from '@upstash/redis';
