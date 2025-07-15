import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // Site URL configuration
    SITE_URL: z.string().url().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  client: {
    // Public site URL
    NEXT_PUBLIC_URL: z.string().url().optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    // Server environment variables
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    SITE_URL: process.env.SITE_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,

    // Client environment variables
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: issues => {
    console.error(
      'SEO environment validation failed:',
      issues.map(issue => issue.message).join(', '),
    );
    // Always throw to satisfy TypeScript's never return type
    throw new Error(
      `Invalid SEO environment configuration: ${issues.map(issue => issue.message).join(', ')}`,
    );
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server variables
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    VERCEL_ENV: process.env.VERCEL_ENV as 'development' | 'preview' | 'production' | undefined,
    SITE_URL: process.env.SITE_URL || '',
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL || '',

    // Client variables
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL || '',
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Helper functions for common patterns used in SEO package
export function getProtocol(): 'http' | 'https' {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production' ? 'https' : 'http';
}

export function getBaseUrl(fallback: string = 'https://example.com'): string {
  const envVars = safeEnv();
  return (
    envVars.SITE_URL || envVars.NEXT_PUBLIC_URL || envVars.VERCEL_PROJECT_PRODUCTION_URL || fallback
  );
}

export function isDevelopment(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'development';
}

export function isStaging(): boolean {
  const envVars = safeEnv();
  return envVars.VERCEL_ENV === 'preview';
}

export function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

// Export type for better DX
export type Env = typeof env;
