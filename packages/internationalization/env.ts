import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Languine AI Translation Service
    DEEPSEEK_API_KEY: z.string().min(1).optional(),

    // Environment Detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  client: {
    // Client environment detection
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: error => {
    const message = Array.isArray(error) ? error.map(e => e.message).join(', ') : String(error);
    console.warn('Internationalization environment validation failed:', message);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
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

// Export type for better DX
export type Env = typeof env;
