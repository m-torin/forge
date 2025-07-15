import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_WEB_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1).url().optional(),
    NEXT_PUBLIC_APP_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),
    NEXT_PUBLIC_DOCS_URL: z.string().min(1).url().optional(),
    NEXT_PUBLIC_WEB_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),
  },
  extends: [vercel()],
  runtimeEnv: {
    ANALYZE: process.env.ANALYZE,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
  },
  server: {
    ANALYZE: z.string().optional(),

    // Added by Vercel
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
  },
  onValidationError: error => {
    console.warn('Config environment validation failed:', error.message);
    // Don't throw in packages - use fallbacks for resilience
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || '',
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3200',
    ANALYZE: process.env.ANALYZE || '',
    NEXT_RUNTIME: process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined,
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const env = safeEnv();
  return process.env.NODE_ENV === 'production';
}

export function hasAppConfig(): boolean {
  const env = safeEnv();
  return Boolean(env.NEXT_PUBLIC_APP_URL);
}

export function hasWebConfig(): boolean {
  const env = safeEnv();
  return Boolean(env.NEXT_PUBLIC_WEB_URL);
}

// Export type for better DX
export type Env = typeof env;
