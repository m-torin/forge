import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Next.js-specific Sentry environment configuration
 * Extends base Sentry env with build-time variables
 */

// Re-export base Sentry env for extension
export { safeEnv as baseSafeEnv, env as baseSentryEnv } from '../sentry/env';

// Create Next.js-specific env with build-time variables
export const env = createEnv({
  server: {
    // Build-time variables for source map uploads
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_URL: z.string().url().optional().default('https://sentry.io/'),

    // Tunnel configuration
    SENTRY_TUNNEL_ROUTE: z.union([z.boolean(), z.string()]).optional(),

    // Build options
    SENTRY_SILENT: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    SENTRY_DEBUG_BUILD: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    SENTRY_DISABLE_LOGGER: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(true),
    SENTRY_WIDEN_CLIENT_FILE_UPLOAD: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    SENTRY_AUTOMATIC_VERCEL_MONITORS: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),

    // Source map options
    SENTRY_DISABLE_SOURCEMAPS: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(true),

    // Release options
    SENTRY_RELEASE_NAME: z.string().optional(),
    SENTRY_RELEASE_CREATE: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(true),
    SENTRY_RELEASE_FINALIZE: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(true),
    SENTRY_RELEASE_DIST: z.string().optional(),

    // Runtime configuration (inherited from base)
    SENTRY_DSN: z.string().url().optional(),
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

    // Next.js specific options
    SENTRY_ENABLE_TRACING: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    SENTRY_ENABLE_REPLAY: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    SENTRY_ENABLE_FEEDBACK: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    SENTRY_ENABLE_LOGS: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  },
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.enum(['development', 'preview', 'production']).optional(),
    NEXT_PUBLIC_SENTRY_RELEASE: z.string().optional(),
    NEXT_PUBLIC_SENTRY_ENABLE_TRACING: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    NEXT_PUBLIC_SENTRY_ENABLE_REPLAY: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  },
  runtimeEnv: {
    // Server - Build-time
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_URL: process.env.SENTRY_URL,
    SENTRY_TUNNEL_ROUTE: process.env.SENTRY_TUNNEL_ROUTE,
    SENTRY_SILENT: process.env.SENTRY_SILENT,
    SENTRY_DEBUG_BUILD: process.env.SENTRY_DEBUG_BUILD,
    SENTRY_DISABLE_LOGGER: process.env.SENTRY_DISABLE_LOGGER,
    SENTRY_WIDEN_CLIENT_FILE_UPLOAD: process.env.SENTRY_WIDEN_CLIENT_FILE_UPLOAD,
    SENTRY_AUTOMATIC_VERCEL_MONITORS: process.env.SENTRY_AUTOMATIC_VERCEL_MONITORS,
    SENTRY_DISABLE_SOURCEMAPS: process.env.SENTRY_DISABLE_SOURCEMAPS,
    SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD: process.env.SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD,
    SENTRY_RELEASE_NAME: process.env.SENTRY_RELEASE_NAME,
    SENTRY_RELEASE_CREATE: process.env.SENTRY_RELEASE_CREATE,
    SENTRY_RELEASE_FINALIZE: process.env.SENTRY_RELEASE_FINALIZE,
    SENTRY_RELEASE_DIST: process.env.SENTRY_RELEASE_DIST,
    // Server - Runtime
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    SENTRY_RELEASE: process.env.SENTRY_RELEASE,
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
    SENTRY_PROFILES_SAMPLE_RATE: process.env.SENTRY_PROFILES_SAMPLE_RATE,
    SENTRY_REPLAYS_SESSION_SAMPLE_RATE: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    SENTRY_DEBUG: process.env.SENTRY_DEBUG,
    SENTRY_ENABLE_TRACING: process.env.SENTRY_ENABLE_TRACING,
    SENTRY_ENABLE_REPLAY: process.env.SENTRY_ENABLE_REPLAY,
    SENTRY_ENABLE_FEEDBACK: process.env.SENTRY_ENABLE_FEEDBACK,
    SENTRY_ENABLE_LOGS: process.env.SENTRY_ENABLE_LOGS,
    // Client
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    NEXT_PUBLIC_SENTRY_ENABLE_TRACING: process.env.NEXT_PUBLIC_SENTRY_ENABLE_TRACING,
    NEXT_PUBLIC_SENTRY_ENABLE_REPLAY: process.env.NEXT_PUBLIC_SENTRY_ENABLE_REPLAY,
    NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK: process.env.NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK,
  },
  onValidationError: error => {
    console.warn('Sentry Next.js environment validation failed:', error);
    // Don't throw in packages - use fallbacks
    return undefined as never;
  },
  emptyStringAsUndefined: true,
});

// Helper for non-Next.js contexts
export function safeEnv() {
  try {
    if (env) return env;
  } catch {
    // Ignore validation errors
  }

  // Fallback values for resilience
  return {
    // Build-time
    SENTRY_ORG: process.env.SENTRY_ORG || '',
    SENTRY_PROJECT: process.env.SENTRY_PROJECT || '',
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
    SENTRY_URL: process.env.SENTRY_URL || 'https://sentry.io/',
    SENTRY_TUNNEL_ROUTE: process.env.SENTRY_TUNNEL_ROUTE || false,
    SENTRY_SILENT: process.env.SENTRY_SILENT === 'true',
    SENTRY_DEBUG_BUILD: process.env.SENTRY_DEBUG_BUILD === 'true',
    SENTRY_DISABLE_LOGGER: process.env.SENTRY_DISABLE_LOGGER !== 'false',
    SENTRY_WIDEN_CLIENT_FILE_UPLOAD: process.env.SENTRY_WIDEN_CLIENT_FILE_UPLOAD === 'true',
    SENTRY_AUTOMATIC_VERCEL_MONITORS: process.env.SENTRY_AUTOMATIC_VERCEL_MONITORS === 'true',
    SENTRY_DISABLE_SOURCEMAPS: process.env.SENTRY_DISABLE_SOURCEMAPS === 'true',
    SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD:
      process.env.SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD !== 'false',
    SENTRY_RELEASE_NAME: process.env.SENTRY_RELEASE_NAME || '',
    SENTRY_RELEASE_CREATE: process.env.SENTRY_RELEASE_CREATE !== 'false',
    SENTRY_RELEASE_FINALIZE: process.env.SENTRY_RELEASE_FINALIZE !== 'false',
    SENTRY_RELEASE_DIST: process.env.SENTRY_RELEASE_DIST || '',
    // Runtime
    SENTRY_DSN: process.env.SENTRY_DSN || '',
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
    SENTRY_ENABLE_TRACING: process.env.SENTRY_ENABLE_TRACING === 'true',
    SENTRY_ENABLE_REPLAY: process.env.SENTRY_ENABLE_REPLAY === 'true',
    SENTRY_ENABLE_FEEDBACK: process.env.SENTRY_ENABLE_FEEDBACK === 'true',
    SENTRY_ENABLE_LOGS: process.env.SENTRY_ENABLE_LOGS === 'true',
    // Client
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT:
      (process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT as 'development' | 'preview' | 'production') ||
      'development',
    NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE || '',
    NEXT_PUBLIC_SENTRY_ENABLE_TRACING: process.env.NEXT_PUBLIC_SENTRY_ENABLE_TRACING === 'true',
    NEXT_PUBLIC_SENTRY_ENABLE_REPLAY: process.env.NEXT_PUBLIC_SENTRY_ENABLE_REPLAY === 'true',
    NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK: process.env.NEXT_PUBLIC_SENTRY_ENABLE_FEEDBACK === 'true',
  };
}

// Export type
export type Env = typeof env;
