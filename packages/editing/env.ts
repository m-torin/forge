import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),

    // Optional WebSocket configuration for collaboration
    COLLABORATION_WS_URL: z.string().url().optional(),
    COLLABORATION_WS_TOKEN: z.string().optional(),
  },
  client: {
    // App environment for client
    NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Optional public WebSocket URL for collaboration
    NEXT_PUBLIC_COLLABORATION_WS_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    // Server-side variables
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    COLLABORATION_WS_URL: process.env.COLLABORATION_WS_URL,
    COLLABORATION_WS_TOKEN: process.env.COLLABORATION_WS_TOKEN,

    // Client-side variables (NEXT_PUBLIC_*)
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_COLLABORATION_WS_URL: process.env.NEXT_PUBLIC_COLLABORATION_WS_URL,
  },
  onValidationError: (error: any) => {
    console.warn('Editing package environment validation failed:', String(error));
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
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    APP_ENV: process.env.APP_ENV as 'development' | 'staging' | 'production' | undefined,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined,
    COLLABORATION_WS_URL: process.env.COLLABORATION_WS_URL,
    COLLABORATION_WS_TOKEN: process.env.COLLABORATION_WS_TOKEN,

    // Client variables
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as
      | 'development'
      | 'staging'
      | 'production'
      | undefined,
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
    NEXT_PUBLIC_COLLABORATION_WS_URL: process.env.NEXT_PUBLIC_COLLABORATION_WS_URL,
  };
}

// Export type for better DX
export type Env = typeof env;
