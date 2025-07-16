import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProductionEnv = process.env.NODE_ENV === 'production';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasArcjetVars = Boolean(process.env.ARCJET_KEY);
const hasUpstashVars = Boolean(
  process.env.UPSTASH_REDIS_REST_TOKEN && process.env.UPSTASH_REDIS_REST_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireArcjetInProduction = isProductionEnv && hasArcjetVars;
const requireUpstashInProduction = isProductionEnv && hasUpstashVars;

// Direct export for Next.js webpack inlining
let env: any = null;

try {
  env = createEnv({
    server: {
      ARCJET_KEY: requireArcjetInProduction
        ? z.string().min(1).startsWith('ajkey_')
        : z.string().startsWith('ajkey_').optional().or(z.literal('')),
      UPSTASH_REDIS_REST_TOKEN: requireUpstashInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
      UPSTASH_REDIS_REST_URL: requireUpstashInProduction
        ? z.string().min(1).url()
        : z.string().url().optional().or(z.literal('')),

      // Environment detection
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    },
    runtimeEnv: {
      ARCJET_KEY: process.env.ARCJET_KEY ?? undefined,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? undefined,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? undefined,
      NODE_ENV: process.env.NODE_ENV,
    },
    onValidationError: error => {
      const message = Array.isArray(error) ? error.map(e => e.message).join(', ') : String(error);
      console.warn('Security environment validation failed:', message);
      // Don't throw in packages - use fallbacks for resilience
      throw new Error('Security environment validation failed');
    },
  });
} catch (error) {
  console.warn('Security environment validation failed, using fallbacks');
  env = null;
}

export { env };

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    ARCJET_KEY: process.env.ARCJET_KEY || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || 'https://localhost:6379',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

export function hasArcjetConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.ARCJET_KEY);
}

export function hasUpstashConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.UPSTASH_REDIS_REST_TOKEN && envVars.UPSTASH_REDIS_REST_URL);
}

// Export type for better DX
export type Env = typeof env;
