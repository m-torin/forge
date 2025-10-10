/**
 * Next.js client-side Upstash Redis client
 * Optimized for browser/client-side usage with Next.js
 */

import { createClient, type UpstashRedisConfig } from './client';
import { getDefaultConfig } from './config';
import type { UpstashRedisClient } from './types';

/**
 * Create Next.js client-side Redis client with environment defaults
 */
export function createNextClient(config?: Partial<UpstashRedisConfig>): UpstashRedisClient {
  const defaults = getDefaultConfig();
  const mergedConfig = { ...defaults, ...config } as UpstashRedisConfig;

  return createClient(mergedConfig);
}

/**
 * Default client instance for Next.js client-side usage
 */
let defaultClient: UpstashRedisClient | null = null;

/**
 * Get or create the default Next.js client instance
 */
export function getNextClient(): UpstashRedisClient {
  if (!defaultClient) {
    defaultClient = createNextClient();
  }
  return defaultClient;
}

// Re-export types and utilities
export { validateConfig } from './config';
export type { UpstashRedisClient, UpstashRedisConfig } from './types';
