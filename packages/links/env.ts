import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Dub.sh configuration
    DUB_ENABLED: z
      .string()
      .transform(val => val === 'true')
      .default(false),
    DUB_API_KEY: z.string().optional(),
    DUB_WORKSPACE: z.string().optional(),
    DUB_DEFAULT_DOMAIN: z.string().default('dub.sh'),
    DUB_BASE_URL: z.string().url().default('https://api.dub.co'),

    // Analytics integration
    POSTHOG_API_KEY: z.string().optional(),
    SEGMENT_WRITE_KEY: z.string().optional(),

    // Links analytics configuration
    LINKS_ANALYTICS_ENABLED: z
      .string()
      .transform(val => val === 'true')
      .default(false),
    LINKS_ANALYTICS_SAMPLING: z
      .string()
      .transform(val => parseFloat(val))
      .default(1.0),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    // Public Dub configuration
    NEXT_PUBLIC_DUB_API_KEY: z.string().optional(),
    NEXT_PUBLIC_DUB_WORKSPACE: z.string().optional(),

    // Public analytics configuration
    NEXT_PUBLIC_POSTHOG_API_KEY: z.string().optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    // Server environment variables
    DUB_ENABLED: process.env.DUB_ENABLED,
    DUB_API_KEY: process.env.DUB_API_KEY,
    DUB_WORKSPACE: process.env.DUB_WORKSPACE,
    DUB_DEFAULT_DOMAIN: process.env.DUB_DEFAULT_DOMAIN,
    DUB_BASE_URL: process.env.DUB_BASE_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
    LINKS_ANALYTICS_ENABLED: process.env.LINKS_ANALYTICS_ENABLED,
    LINKS_ANALYTICS_SAMPLING: process.env.LINKS_ANALYTICS_SAMPLING,
    NODE_ENV: process.env.NODE_ENV,

    // Client environment variables
    NEXT_PUBLIC_DUB_API_KEY: process.env.NEXT_PUBLIC_DUB_API_KEY,
    NEXT_PUBLIC_DUB_WORKSPACE: process.env.NEXT_PUBLIC_DUB_WORKSPACE,
    NEXT_PUBLIC_POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: (error: any) => {
    const errorMessage = Array.isArray(error)
      ? error.map(e => e.message).join(', ')
      : String(error);
    console.warn('Links environment validation failed:', errorMessage);
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
    DUB_ENABLED: process.env.DUB_ENABLED === 'true',
    DUB_API_KEY: process.env.DUB_API_KEY || '',
    DUB_WORKSPACE: process.env.DUB_WORKSPACE || '',
    DUB_DEFAULT_DOMAIN: process.env.DUB_DEFAULT_DOMAIN || 'dub.sh',
    DUB_BASE_URL: process.env.DUB_BASE_URL || 'https://api.dub.co',
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY || '',
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY || '',
    LINKS_ANALYTICS_ENABLED: process.env.LINKS_ANALYTICS_ENABLED === 'true',
    LINKS_ANALYTICS_SAMPLING: parseFloat(process.env.LINKS_ANALYTICS_SAMPLING || '1.0'),
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',

    // Client variables
    NEXT_PUBLIC_DUB_API_KEY: process.env.NEXT_PUBLIC_DUB_API_KEY || '',
    NEXT_PUBLIC_DUB_WORKSPACE: process.env.NEXT_PUBLIC_DUB_WORKSPACE || '',
    NEXT_PUBLIC_POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '',
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Helper functions for common patterns
export function isDevelopment(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'development';
}

export function isDubEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.DUB_ENABLED;
}

export function isAnalyticsEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.LINKS_ANALYTICS_ENABLED;
}

// Export type for better DX
export type Env = typeof env;
