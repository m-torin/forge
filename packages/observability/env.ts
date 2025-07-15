import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Core environment configuration for the observability package
 * Provider-specific configurations are handled by their respective plugins
 */

// Create validated env object
export const env = createEnv({
  server: {
    // Core observability config only - providers handle their own
  },
  client: {
    // Core configuration available on both client and server
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_OBSERVABILITY_DEBUG: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .default(false),
    NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED: z
      .string()
      .optional()
      .transform(val => (val === 'true' ? true : val === 'false' ? false : undefined)),
  },
  runtimeEnv: {
    // Client vars (available on both client and server)
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_OBSERVABILITY_DEBUG: process.env.NEXT_PUBLIC_OBSERVABILITY_DEBUG,
    NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED:
      process.env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED,
  },
  onValidationError: error => {
    console.warn('Observability package environment validation failed:', error);
    // Don't throw in packages - use fallbacks
    return undefined as never;
  },
  emptyStringAsUndefined: true,
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  try {
    if (env && typeof env === 'object') return env;
  } catch (_error) {
    // Environment validation failed, use fallbacks
  }

  // Fallback values for resilience
  return {
    // Core configuration only
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    NEXT_PUBLIC_OBSERVABILITY_DEBUG: process.env.NEXT_PUBLIC_OBSERVABILITY_DEBUG === 'true',
    NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED:
      process.env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED === 'true'
        ? true
        : process.env.NEXT_PUBLIC_OBSERVABILITY_CONSOLE_ENABLED === 'false'
          ? false
          : undefined,
  };
}

// Export type
export type Env = typeof env;
