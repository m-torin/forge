import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Sentry-specific environment configuration
 * Apps can extend this configuration to inherit Sentry environment variables
 */

// Create validated env object
export const env = createEnv({
  server: {
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_ENVIRONMENT: z.enum(['development', 'preview', 'production']).optional(),
    SENTRY_RELEASE: z.string().optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    SENTRY_PROFILES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    SENTRY_REPLAYS_SESSION_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
    SENTRY_DEBUG: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.enum(['development', 'preview', 'production']).optional(),
    NEXT_PUBLIC_SENTRY_RELEASE: z.string().optional(),
  },
  runtimeEnv: {
    // Server
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
    SENTRY_PROFILES_SAMPLE_RATE: process.env.SENTRY_PROFILES_SAMPLE_RATE,
    SENTRY_REPLAYS_SESSION_SAMPLE_RATE: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    SENTRY_DEBUG: process.env.SENTRY_DEBUG,
    // Client
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  },
  onValidationError: error => {
    // Note: Using console.warn during env validation as observability may not be initialized
    console.warn('Sentry environment validation failed:', error);
    // Don't throw in packages - use fallbacks
    return undefined as never;
  },
  emptyStringAsUndefined: true,
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server
    SENTRY_DSN: process.env.SENTRY_DSN || '',
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
    SENTRY_ORG: process.env.SENTRY_ORG || '',
    SENTRY_PROJECT: process.env.SENTRY_PROJECT || '',
    SENTRY_ENVIRONMENT:
      (process.env.SENTRY_ENVIRONMENT as 'development' | 'preview' | 'production') || 'development',
    SENTRY_RELEASE: process.env.SENTRY_RELEASE || '',
    SENTRY_TRACES_SAMPLE_RATE:
      Number(process.env.SENTRY_TRACES_SAMPLE_RATE) ||
      (process.env.NODE_ENV === 'production' ? 0.1 : 1.0),
    SENTRY_PROFILES_SAMPLE_RATE: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0,
    SENTRY_REPLAYS_SESSION_SAMPLE_RATE:
      Number(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE) ||
      (process.env.NODE_ENV === 'production' ? 0.1 : 0),
    SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE:
      Number(process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0,
    SENTRY_DEBUG: process.env.SENTRY_DEBUG === 'true',
    // Client
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT:
      (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT as 'development' | 'preview' | 'production') ||
      'development',
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE || '',
  };
}

// Export type
export type Env = typeof env;
