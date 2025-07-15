import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Better Stack (Logtail) environment configuration
 * Updated to support official @logtail packages
 */

// Create validated env object
export const env = createEnv({
  server: {
    // Legacy support
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    BETTERSTACK_SOURCE_TOKEN: z.string().optional(),

    // Official Better Stack environment variables
    BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    BETTER_STACK_INGESTING_URL: z.string().url().optional(),
    BETTER_STACK_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'off']).optional(),
  },
  client: {
    // Legacy support
    NEXT_PUBLIC_LOGTAIL_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTERSTACK_TOKEN: z.string().optional(),

    // Official Better Stack client environment variables
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: z.string().optional(),
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: z.string().url().optional(),
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: z
      .enum(['debug', 'info', 'warn', 'error', 'off'])
      .optional(),
  },
  runtimeEnv: {
    // Legacy
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    BETTERSTACK_SOURCE_TOKEN: process.env.BETTERSTACK_SOURCE_TOKEN,
    NEXT_PUBLIC_LOGTAIL_TOKEN: process.env.NEXT_PUBLIC_LOGTAIL_TOKEN,
    NEXT_PUBLIC_BETTERSTACK_TOKEN: process.env.NEXT_PUBLIC_BETTERSTACK_TOKEN,

    // Official Better Stack
    BETTER_STACK_SOURCE_TOKEN: process.env.BETTER_STACK_SOURCE_TOKEN,
    BETTER_STACK_INGESTING_URL: process.env.BETTER_STACK_INGESTING_URL,
    BETTER_STACK_LOG_LEVEL: process.env.BETTER_STACK_LOG_LEVEL,
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN,
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL,
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: process.env.NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL,
  },
  onValidationError: error => {
    console.warn('Better Stack environment validation failed:', error);
    // Don't throw in packages - use fallbacks
    return undefined as never;
  },
  emptyStringAsUndefined: true,
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience with proper priority
  return {
    // Legacy support
    LOGTAIL_SOURCE_TOKEN:
      process.env.LOGTAIL_SOURCE_TOKEN || process.env.BETTERSTACK_SOURCE_TOKEN || '',
    BETTERSTACK_SOURCE_TOKEN:
      process.env.BETTERSTACK_SOURCE_TOKEN || process.env.LOGTAIL_SOURCE_TOKEN || '',
    NEXT_PUBLIC_LOGTAIL_TOKEN:
      process.env.NEXT_PUBLIC_LOGTAIL_TOKEN || process.env.NEXT_PUBLIC_BETTERSTACK_TOKEN || '',
    NEXT_PUBLIC_BETTERSTACK_TOKEN:
      process.env.NEXT_PUBLIC_BETTERSTACK_TOKEN || process.env.NEXT_PUBLIC_LOGTAIL_TOKEN || '',

    // Official Better Stack (preferred)
    BETTER_STACK_SOURCE_TOKEN:
      process.env.BETTER_STACK_SOURCE_TOKEN ||
      process.env.LOGTAIL_SOURCE_TOKEN ||
      process.env.BETTERSTACK_SOURCE_TOKEN ||
      '',
    BETTER_STACK_INGESTING_URL: process.env.BETTER_STACK_INGESTING_URL || '',
    BETTER_STACK_LOG_LEVEL:
      (process.env.BETTER_STACK_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | 'off') || 'info',
    NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN:
      process.env.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN ||
      process.env.NEXT_PUBLIC_LOGTAIL_TOKEN ||
      process.env.NEXT_PUBLIC_BETTERSTACK_TOKEN ||
      '',
    NEXT_PUBLIC_BETTER_STACK_INGESTING_URL:
      process.env.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL || '',
    NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL:
      (process.env.NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL as
        | 'debug'
        | 'info'
        | 'warn'
        | 'error'
        | 'off') || 'info',
  };
}

// Export type
export type Env = typeof env;
