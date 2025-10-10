/**
 * Upstash Redis configuration and environment detection
 */

import { logWarn } from '@repo/observability/server/next';
import { z } from 'zod';
import type { RateLimitConfig, RuntimeEnvironment, UpstashRedisConfig } from './types';

/**
 * Upstash Redis configuration schema
 */
const upstashRedisConfigSchema = z.object({
  url: z.string().url('Valid Upstash Redis URL is required'),
  token: z.string().min(1, 'Upstash Redis token is required'),
  enableTelemetry: z.boolean().optional().default(false),
  enableAutoPipelining: z.boolean().optional().default(true),
  readYourWrites: z.boolean().optional().default(true),
  retry: z
    .object({
      retries: z.number().min(0).max(10).optional().default(3),
      delay: z.number().min(0).optional().default(1000),
    })
    .optional(),
});

/**
 * Rate limit configuration schema
 */
const rateLimitConfigSchema = z.object({
  requests: z.number().min(1, 'Requests must be at least 1'),
  window: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'string') {
      // Convert string durations like "10s", "1m", "1h" to milliseconds
      const match = val.match(/^(\d+)([smhd])$/);
      if (!match) throw new Error('Invalid window format. Use format like "10s", "1m", "1h"');

      const [, amount, unit] = match;
      const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      return parseInt(amount) * multipliers[unit as keyof typeof multipliers];
    }
    return val;
  }),
  algorithm: z
    .enum(['sliding-window', 'fixed-window', 'token-bucket'])
    .optional()
    .default('sliding-window'),
  prefix: z.string().optional().default('ratelimit'),
});

/**
 * Validate Upstash Redis configuration
 */
export function validateConfig(config: unknown): UpstashRedisConfig {
  const result = upstashRedisConfigSchema.safeParse(config);
  if (!result.success) {
    logWarn('Invalid Upstash Redis config, using defaults', {
      error: result.error.message,
      receivedConfig: config,
    });
    return {
      url: '',
      token: '',
      enableTelemetry: false,
      enableAutoPipelining: true,
      readYourWrites: true,
      retry: { retries: 3, delay: 1000 },
    } as UpstashRedisConfig;
  }
  return result.data;
}

/**
 * Validate rate limit configuration
 */
export function validateRateLimitConfig(config: unknown): RateLimitConfig & { window: number } {
  const result = rateLimitConfigSchema.safeParse(config);
  if (!result.success) {
    logWarn('Invalid rate limit config, using defaults', {
      error: result.error.message,
      receivedConfig: config,
    });
    return {
      requests: 100,
      window: 60000,
      algorithm: 'sliding-window',
      prefix: 'ratelimit',
    } as RateLimitConfig & { window: number };
  }
  return result.data as RateLimitConfig & { window: number };
}

/**
 * Detect runtime environment
 */
export function detectRuntime(): RuntimeEnvironment {
  // Check for Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return 'nodejs';
  }

  // Check for browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'browser';
  }

  // Check for edge runtime
  if (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) {
    return 'edge';
  }

  // Check for web worker
  if (typeof globalThis !== 'undefined' && 'importScripts' in globalThis) {
    return 'worker';
  }

  // Default to nodejs
  return 'nodejs';
}

/**
 * Get default configuration from environment variables
 */
export function getDefaultConfig(): Partial<UpstashRedisConfig> {
  const env: Record<string, string | undefined> =
    typeof process !== 'undefined' && process.env ? process.env : {};

  return {
    url: env['UPSTASH_REDIS_REST_URL'] || env['UPSTASH_REDIS_URL'],
    token: env['UPSTASH_REDIS_REST_TOKEN'] || env['UPSTASH_REDIS_TOKEN'],
    enableTelemetry: env['UPSTASH_DISABLE_TELEMETRY'] !== 'true',
    enableAutoPipelining: env['UPSTASH_DISABLE_AUTO_PIPELINING'] !== 'true',
    readYourWrites: env['UPSTASH_DISABLE_READ_YOUR_WRITES'] !== 'true',
  };
}

/**
 * Merge configuration with defaults
 */
export function mergeConfig(
  userConfig: Partial<UpstashRedisConfig>,
  defaults?: Partial<UpstashRedisConfig>,
): UpstashRedisConfig {
  const defaultConfig = defaults || getDefaultConfig();
  const merged = { ...defaultConfig, ...userConfig };

  return validateConfig(merged);
}

/**
 * Check if configuration is complete
 */
export function isConfigComplete(config: Partial<UpstashRedisConfig>): boolean {
  return !!(config.url && config.token);
}

/**
 * Create environment-optimized configuration
 */
export function createOptimizedConfig(
  runtime: RuntimeEnvironment,
  userConfig: Partial<UpstashRedisConfig> = {},
): UpstashRedisConfig {
  const baseConfig = mergeConfig(userConfig);

  // Apply runtime-specific optimizations
  switch (runtime) {
    case 'nodejs':
      return {
        ...baseConfig,
        enableAutoPipelining: true,
        readYourWrites: true,
        retry: { retries: 3, delay: 1000 },
      };

    case 'edge':
      return {
        ...baseConfig,
        enableAutoPipelining: false, // Disable for edge to reduce latency
        readYourWrites: false, // Edge functions are stateless
        retry: { retries: 1, delay: 500 }, // Faster retry for edge
      };

    case 'browser':
      return {
        ...baseConfig,
        enableTelemetry: false, // Privacy-conscious
        enableAutoPipelining: true,
        retry: { retries: 2, delay: 2000 },
      };

    case 'worker':
      return {
        ...baseConfig,
        enableAutoPipelining: false,
        readYourWrites: false,
        retry: { retries: 1, delay: 1000 },
      };

    default:
      return baseConfig;
  }
}

/**
 * Create rate limit configuration for common scenarios
 */
export const commonRateLimits = {
  // API rate limits
  strict: { requests: 10, window: '1m' },
  moderate: { requests: 100, window: '1m' },
  lenient: { requests: 1000, window: '1m' },

  // User action rate limits
  login: { requests: 5, window: '15m' },
  signup: { requests: 3, window: '1h' },
  passwordReset: { requests: 3, window: '1h' },

  // Content creation rate limits
  posts: { requests: 10, window: '1h' },
  comments: { requests: 30, window: '1h' },
  uploads: { requests: 20, window: '1h' },
} as const;

/**
 * Connection health check
 */
export async function healthCheck(config: UpstashRedisConfig): Promise<boolean> {
  try {
    // This would be implemented with actual Redis connection test
    // For now, just validate config completeness
    return isConfigComplete(config);
  } catch {
    return false;
  }
}
