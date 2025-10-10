import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
const env = createEnv({
  server: {
    // Flags SDK v4+ configuration
    FLAGS_SECRET: z.string().min(32).optional(),

    // PostHog server-side configuration
    POSTHOG_KEY: z.string().min(1).optional(),
    POSTHOG_HOST: z.string().url().optional(),
    POSTHOG_PERSONAL_API_KEY: z.string().min(1).optional(),
    POSTHOG_PROJECT_ID: z.string().min(1).optional(),

    // Edge Config configuration
    EDGE_CONFIG: z.string().url().optional(),

    // Analytics configuration
    VERCEL_ANALYTICS_DEBUG: z.boolean().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
  },
  client: {
    // PostHog client-side configuration (public)
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),

    // Feature flag configuration
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  },
  runtimeEnv: {
    // Server-side environment variables
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    EDGE_CONFIG: process.env.EDGE_CONFIG,
    VERCEL_ANALYTICS_DEBUG: process.env.VERCEL_ANALYTICS_DEBUG === 'true',
    NODE_ENV: process.env.NODE_ENV as 'development' | 'test' | 'production',

    // Client-side environment variables
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
  onValidationError: error => {
    const message = Array.isArray(error) ? error.map(e => e.message).join(', ') : String(error);
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Feature flags environment validation failed:', message);
    }
    // Don't throw in packages - use fallbacks for resilience (following security package pattern)
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  try {
    if (env && typeof env === 'object') return env;
  } catch (_error) {
    // Environment validation failed, use fallbacks
  }

  // Fallback values for resilience
  return {
    // Server variables
    FLAGS_SECRET: process.env.FLAGS_SECRET || '',
    POSTHOG_KEY: process.env.POSTHOG_KEY || '',
    POSTHOG_HOST: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY || '',
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID || '',
    EDGE_CONFIG: process.env.EDGE_CONFIG || '',
    VERCEL_ANALYTICS_DEBUG: process.env.VERCEL_ANALYTICS_DEBUG === 'true',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',

    // Client variables
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    NEXT_PUBLIC_VERCEL_ENV:
      (process.env.NEXT_PUBLIC_VERCEL_ENV as 'development' | 'preview' | 'production') ||
      'development',
  };
}

// Helper functions for common patterns (following security package style)
function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

function hasPostHogConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.POSTHOG_KEY);
}

function hasEdgeConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.EDGE_CONFIG);
}

function hasFlagsSecret(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.FLAGS_SECRET);
}

function isEncryptionEnabled(): boolean {
  return hasFlagsSecret() && isProduction();
}

// Export type for better DX
type Env = typeof env;
