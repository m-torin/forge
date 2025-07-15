import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // PostHog server configuration for feature flags and analytics
    POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_API_KEY: z.string().optional(), // Additional key used in source code
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),

    // Segment server configuration
    SEGMENT_WRITE_KEY: z.string().optional(),

    // Analytics logging configuration
    ANALYTICS_LOG_PROVIDER: z.enum(['console', 'sentry']).default('console'),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  },
  client: {
    // PostHog client configuration
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),

    // Segment client configuration
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().optional(),

    // Vercel Analytics
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),

    // App environment for client
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    // Server-side variables
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
    ANALYTICS_LOG_PROVIDER: process.env.ANALYTICS_LOG_PROVIDER,
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,

    // Client-side variables (NEXT_PUBLIC_*)
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: (error: any) => {
    console.warn('Analytics environment validation failed:', String(error));
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server variables
    POSTHOG_HOST: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    POSTHOG_KEY: process.env.POSTHOG_KEY || '',
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY || '',
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID || '',
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY || '',
    ANALYTICS_LOG_PROVIDER:
      (process.env.ANALYTICS_LOG_PROVIDER as 'console' | 'sentry') || 'console',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    APP_ENV: process.env.APP_ENV as 'development' | 'staging' | 'production' | undefined,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined,

    // Client variables
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || '',
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '',
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as
      | 'development'
      | 'staging'
      | 'production'
      | undefined,
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Export type for better DX
export type Env = typeof env;
