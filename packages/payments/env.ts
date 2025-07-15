import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProductionEnv = process.env.NODE_ENV === 'production';
const isBuildEnv = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
);

// Make env vars optional in development, local builds, or when they're missing (indicating .env.local usage)
const requireInProduction = isProductionEnv && !isBuildEnv && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    STRIPE_SECRET_KEY: requireInProduction
      ? z.string().startsWith('sk_')
      : z.string().startsWith('sk_').optional().or(z.literal('')),
    STRIPE_WEBHOOK_SECRET: requireInProduction
      ? z.string().startsWith('whsec_')
      : z.string().startsWith('whsec_').optional().or(z.literal('')),
    PAYMENTS_LOG_PROVIDER: z.string().optional(),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL: z.string().optional(),
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? undefined,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? undefined,
    PAYMENTS_LOG_PROVIDER: process.env.PAYMENTS_LOG_PROVIDER ?? undefined,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  },
  onValidationError: error => {
    const errorMessage = Array.isArray(error)
      ? error.map(e => e.message).join(', ')
      : String(error);

    console.warn('Payments environment validation failed:', errorMessage);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    PAYMENTS_LOG_PROVIDER: process.env.PAYMENTS_LOG_PROVIDER || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    VERCEL: process.env.VERCEL || '',
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production';
}

export function isBuild(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production' && !env.VERCEL;
}

export function hasStripeConfig(): boolean {
  const env = safeEnv();
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
}

// Export type for better DX
export type Env = typeof env;
