import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // QStash Configuration
    QSTASH_URL: z.string().url().optional(),
    QSTASH_TOKEN: z.string().min(1).optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1).optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1).optional(),

    // Upstash Redis Configuration (for orchestration state)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Environment Detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  },
  onValidationError: error => {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Orchestration environment validation failed:', error);
    }
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    QSTASH_URL: process.env.QSTASH_URL || 'http://localhost:8081',
    QSTASH_TOKEN: process.env.QSTASH_TOKEN || 'development-qstash-token',
    QSTASH_CURRENT_SIGNING_KEY:
      process.env.QSTASH_CURRENT_SIGNING_KEY || 'sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r',
    QSTASH_NEXT_SIGNING_KEY:
      process.env.QSTASH_NEXT_SIGNING_KEY || 'sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || 'https://localhost:6379',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || 'development-redis-token',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Export type for better DX
export type Env = typeof env;
