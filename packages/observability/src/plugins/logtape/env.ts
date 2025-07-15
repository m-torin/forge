import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * LogTape environment configuration
 * LogTape is a modern, zero-dependency logging library
 */

// Create validated env object
export const env = createEnv({
  server: {
    LOGTAPE_ENABLED: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    LOGTAPE_LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warning', 'error', 'fatal'])
      .default('info'),
    LOGTAPE_CONSOLE_ENABLED: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(true),
    LOGTAPE_FILE_PATH: z.string().optional(),
    LOGTAPE_CLOUDWATCH_LOG_GROUP: z.string().optional(),
    LOGTAPE_CLOUDWATCH_REGION: z.string().optional(),
    LOGTAPE_SENTRY_DSN: z.string().optional(),
    LOGTAPE_CATEGORY_PREFIX: z.string().default('observability'),
  },
  client: {
    NEXT_PUBLIC_LOGTAPE_ENABLED: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    NEXT_PUBLIC_LOGTAPE_LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warning', 'error', 'fatal'])
      .default('info'),
  },
  runtimeEnv: {
    LOGTAPE_ENABLED: process.env.LOGTAPE_ENABLED || process.env.OBSERVABILITY_LOGTAPE_ENABLED,
    LOGTAPE_LOG_LEVEL: process.env.LOGTAPE_LOG_LEVEL,
    LOGTAPE_CONSOLE_ENABLED: process.env.LOGTAPE_CONSOLE_ENABLED,
    LOGTAPE_FILE_PATH: process.env.LOGTAPE_FILE_PATH,
    LOGTAPE_CLOUDWATCH_LOG_GROUP: process.env.LOGTAPE_CLOUDWATCH_LOG_GROUP,
    LOGTAPE_CLOUDWATCH_REGION: process.env.LOGTAPE_CLOUDWATCH_REGION,
    LOGTAPE_SENTRY_DSN: process.env.LOGTAPE_SENTRY_DSN,
    LOGTAPE_CATEGORY_PREFIX: process.env.LOGTAPE_CATEGORY_PREFIX,
    NEXT_PUBLIC_LOGTAPE_ENABLED: process.env.NEXT_PUBLIC_LOGTAPE_ENABLED,
    NEXT_PUBLIC_LOGTAPE_LOG_LEVEL: process.env.NEXT_PUBLIC_LOGTAPE_LOG_LEVEL,
  },
  onValidationError: error => {
    console.warn('LogTape environment validation failed:', error);
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
    LOGTAPE_ENABLED:
      process.env.LOGTAPE_ENABLED === 'true' ||
      process.env.OBSERVABILITY_LOGTAPE_ENABLED === 'true',
    LOGTAPE_LOG_LEVEL:
      (process.env.LOGTAPE_LOG_LEVEL as
        | 'trace'
        | 'debug'
        | 'info'
        | 'warning'
        | 'error'
        | 'fatal') || 'info',
    LOGTAPE_CONSOLE_ENABLED: process.env.LOGTAPE_CONSOLE_ENABLED !== 'false',
    LOGTAPE_FILE_PATH: process.env.LOGTAPE_FILE_PATH || '',
    LOGTAPE_CLOUDWATCH_LOG_GROUP: process.env.LOGTAPE_CLOUDWATCH_LOG_GROUP || '',
    LOGTAPE_CLOUDWATCH_REGION: process.env.LOGTAPE_CLOUDWATCH_REGION || '',
    LOGTAPE_SENTRY_DSN: process.env.LOGTAPE_SENTRY_DSN || '',
    LOGTAPE_CATEGORY_PREFIX: process.env.LOGTAPE_CATEGORY_PREFIX || 'observability',
    NEXT_PUBLIC_LOGTAPE_ENABLED: process.env.NEXT_PUBLIC_LOGTAPE_ENABLED === 'true',
    NEXT_PUBLIC_LOGTAPE_LOG_LEVEL:
      (process.env.NEXT_PUBLIC_LOGTAPE_LOG_LEVEL as
        | 'trace'
        | 'debug'
        | 'info'
        | 'warning'
        | 'error'
        | 'fatal') || 'info',
  };
}

// Export type
export type Env = typeof env;
