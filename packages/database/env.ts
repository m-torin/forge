import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    // Firebase (optional)
    FIREBASE_PROJECT_ID: z.string().optional(),
    FIREBASE_CLIENT_EMAIL: z.string().optional(),
    FIREBASE_PRIVATE_KEY: z.string().optional(),
    // Prisma logging configuration
    PRISMA_LOG_PERFORMANCE: z.string().optional(),
    PRISMA_LOG_QUERIES: z.string().optional(),
    PRISMA_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'query']).optional(),
    PRISMA_LOG_PROVIDER: z.enum(['console', 'sentry']).optional(),
  },
  client: {},
  runtimeEnv: {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Firebase (optional)
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    // Prisma logging configuration
    PRISMA_LOG_PERFORMANCE: process.env.PRISMA_LOG_PERFORMANCE,
    PRISMA_LOG_QUERIES: process.env.PRISMA_LOG_QUERIES,
    PRISMA_LOG_LEVEL: process.env.PRISMA_LOG_LEVEL,
    PRISMA_LOG_PROVIDER: process.env.PRISMA_LOG_PROVIDER,
  },
  onValidationError: (error: any) => {
    console.warn('Database environment validation failed:', error.message);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || 'https://localhost:6379',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || 'development-token',
    // Firebase (optional)
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
    // Prisma logging configuration
    PRISMA_LOG_PERFORMANCE: process.env.PRISMA_LOG_PERFORMANCE || '',
    PRISMA_LOG_QUERIES: process.env.PRISMA_LOG_QUERIES || '',
    PRISMA_LOG_LEVEL:
      (process.env.PRISMA_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' | 'query') || undefined,
    PRISMA_LOG_PROVIDER: (process.env.PRISMA_LOG_PROVIDER as 'console' | 'sentry') || undefined,
  };
}

// Export type for better DX
export type Env = typeof env;
