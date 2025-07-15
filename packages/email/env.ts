import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProductionMode = process.env.NODE_ENV === 'production';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(process.env.RESEND_FROM && process.env.RESEND_TOKEN);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProductionMode && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    RESEND_FROM: requireInProduction ? z.string().email() : z.string().email().optional(),
    RESEND_TOKEN: requireInProduction
      ? z.string().startsWith('re_')
      : z.string().startsWith('re_').optional(),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    RESEND_FROM: process.env.RESEND_FROM || undefined,
    RESEND_TOKEN: process.env.RESEND_TOKEN || undefined,
    NODE_ENV: process.env.NODE_ENV,
  },
  onValidationError: (error: any) => {
    console.warn('Email environment validation failed:', error.message);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    RESEND_FROM: process.env.RESEND_FROM || '',
    RESEND_TOKEN: process.env.RESEND_TOKEN || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'development';
}

export function hasEmailConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.RESEND_FROM && envVars.RESEND_TOKEN);
}

// Export type for better DX
export type Env = typeof env;
