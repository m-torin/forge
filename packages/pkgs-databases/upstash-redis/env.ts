import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Upstash Redis configuration
    UPSTASH_REDIS_REST_URL: requireInProduction ? z.string().url() : z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: requireInProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),

    // Rate limiting configuration
    REDIS_RATE_LIMIT_ENABLED: z.string().optional().default('true'),
    REDIS_RATE_LIMIT_WINDOW: z.string().optional().default('60'), // seconds
    REDIS_RATE_LIMIT_MAX: z.string().optional().default('100'), // requests per window

    // Redis logging configuration
    REDIS_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('error'),
    REDIS_LOG_PERFORMANCE: z.string().optional().default('false'),
  },
  runtimeEnv: {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_RATE_LIMIT_ENABLED: process.env.REDIS_RATE_LIMIT_ENABLED,
    REDIS_RATE_LIMIT_WINDOW: process.env.REDIS_RATE_LIMIT_WINDOW,
    REDIS_RATE_LIMIT_MAX: process.env.REDIS_RATE_LIMIT_MAX,
    REDIS_LOG_LEVEL: process.env.REDIS_LOG_LEVEL,
    REDIS_LOG_PERFORMANCE: process.env.REDIS_LOG_PERFORMANCE,
  },
  onValidationError: error => {
    console.warn('Upstash Redis environment validation failed:', error);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    REDIS_RATE_LIMIT_ENABLED: process.env.REDIS_RATE_LIMIT_ENABLED || 'true',
    REDIS_RATE_LIMIT_WINDOW: process.env.REDIS_RATE_LIMIT_WINDOW || '60',
    REDIS_RATE_LIMIT_MAX: process.env.REDIS_RATE_LIMIT_MAX || '100',
    REDIS_LOG_LEVEL: process.env.REDIS_LOG_LEVEL || 'error',
    REDIS_LOG_PERFORMANCE: process.env.REDIS_LOG_PERFORMANCE === 'true',
  };
}

// Export type for better DX
export type Env = typeof env;
