import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Always optional for notifications
    KNOCK_SECRET_API_KEY: z.string().min(1).optional(),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    // Always optional for notifications
    NEXT_PUBLIC_KNOCK_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY || undefined,
    NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY || undefined,
    NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || undefined,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: error => {
    const message = Array.isArray(error) ? error.map(e => e.message).join(', ') : String(error);
    console.warn('Notifications environment validation failed:', message);
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
    KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',

    // Client variables
    NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY || '',
    NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || '',
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Helper functions for common patterns
export function hasKnockConfig(): boolean {
  const env = safeEnv();
  return Boolean(env.KNOCK_SECRET_API_KEY || env.NEXT_PUBLIC_KNOCK_API_KEY);
}

export function isProduction(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production';
}

// Export type for better DX
export type Env = typeof env;
