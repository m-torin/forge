/**
 * Edge runtime Upstash Redis server
 * Optimized for Vercel Edge Functions, Cloudflare Workers, etc.
 */

import { createOptimizedConfig, detectRuntime } from './config';
import { createServer } from './server';
import type { UpstashRedisConfig, UpstashRedisServer } from './types';

/**
 * Create Edge runtime Redis server with optimized configuration
 */
export function createEdgeServer(config?: Partial<UpstashRedisConfig>): UpstashRedisServer {
  const runtime = detectRuntime();
  const optimizedConfig = createOptimizedConfig(runtime, config);

  return createServer(optimizedConfig);
}

/**
 * Default server instance for Edge runtime
 */
let defaultServer: UpstashRedisServer | null = null;

/**
 * Get or create the default Edge server instance
 */
export function getEdgeServer(): UpstashRedisServer {
  if (!defaultServer) {
    defaultServer = createEdgeServer();
  }
  return defaultServer;
}

// Re-export types and utilities
export { detectRuntime, validateConfig } from './config';
export type { UpstashRedisConfig, UpstashRedisServer } from './types';
