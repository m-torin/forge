/**
 * Environment configuration for Sentry Micro Frontend Plugin
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Environment configuration specific to Sentry micro frontend functionality
 */
export const env = createEnv({
  server: {
    // Zone-specific DSNs for server-side
    SENTRY_DSN_CMS: z.string().url().optional(),
    SENTRY_DSN_WORKFLOWS: z.string().url().optional(),
    SENTRY_DSN_AUTHMGMT: z.string().url().optional(),

    // Micro frontend configuration
    SENTRY_MICROFRONTEND_MODE: z.enum(['host', 'child', 'standalone']).optional(),
    SENTRY_MICROFRONTEND_ZONE: z.string().optional(),

    // Feature toggles
    SENTRY_MICROFRONTEND_ENABLED: z.boolean().optional(),
    SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT: z.boolean().optional(),
  },
  client: {
    // Zone-specific DSNs for client-side
    NEXT_PUBLIC_SENTRY_DSN_CMS: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN_WORKFLOWS: z.string().url().optional(),
    NEXT_PUBLIC_SENTRY_DSN_AUTHMGMT: z.string().url().optional(),

    // Client-side micro frontend configuration
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_MODE: z.enum(['host', 'child', 'standalone']).optional(),
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ZONE: z.string().optional(),

    // Feature toggles
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED: z.boolean().optional(),
  },
  runtimeEnv: {
    // Server
    SENTRY_DSN_CMS: process.env.SENTRY_DSN_CMS,
    SENTRY_DSN_WORKFLOWS: process.env.SENTRY_DSN_WORKFLOWS,
    SENTRY_DSN_AUTHMGMT: process.env.SENTRY_DSN_AUTHMGMT,
    SENTRY_MICROFRONTEND_MODE: process.env.SENTRY_MICROFRONTEND_MODE,
    SENTRY_MICROFRONTEND_ZONE: process.env.SENTRY_MICROFRONTEND_ZONE,
    SENTRY_MICROFRONTEND_ENABLED: process.env.SENTRY_MICROFRONTEND_ENABLED
      ? process.env.SENTRY_MICROFRONTEND_ENABLED === 'true'
      : undefined,
    SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT: process.env
      .SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT
      ? process.env.SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT === 'true'
      : undefined,

    // Client
    NEXT_PUBLIC_SENTRY_DSN_CMS: process.env.NEXT_PUBLIC_SENTRY_DSN_CMS,
    NEXT_PUBLIC_SENTRY_DSN_WORKFLOWS: process.env.NEXT_PUBLIC_SENTRY_DSN_WORKFLOWS,
    NEXT_PUBLIC_SENTRY_DSN_AUTHMGMT: process.env.NEXT_PUBLIC_SENTRY_DSN_AUTHMGMT,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_MODE: process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_MODE,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ZONE: process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_ZONE,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED: process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED
      ? process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED === 'true'
      : undefined,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NODE_ENV === 'test',
  emptyStringAsUndefined: true,
  onValidationError: error => {
    // Non-critical plugin, warn but don't throw
    console.warn('Sentry Micro Frontend Plugin env validation failed:', error);
    return undefined as never;
  },
});

/**
 * Safe environment access for non-Next.js contexts
 */
export function safeEnv() {
  if (env) {
    return env;
  }

  // Fallback for non-Next.js contexts
  return {
    // Server
    SENTRY_DSN_CMS: process.env.SENTRY_DSN_CMS,
    SENTRY_DSN_WORKFLOWS: process.env.SENTRY_DSN_WORKFLOWS,
    SENTRY_DSN_AUTHMGMT: process.env.SENTRY_DSN_AUTHMGMT,
    SENTRY_MICROFRONTEND_MODE: process.env.SENTRY_MICROFRONTEND_MODE as
      | 'host'
      | 'child'
      | 'standalone'
      | undefined,
    SENTRY_MICROFRONTEND_ZONE: process.env.SENTRY_MICROFRONTEND_ZONE,
    SENTRY_MICROFRONTEND_ENABLED: process.env.SENTRY_MICROFRONTEND_ENABLED === 'true',
    SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT:
      process.env.SENTRY_MICROFRONTEND_MULTIPLEXED_TRANSPORT === 'true',

    // Client
    NEXT_PUBLIC_SENTRY_DSN_CMS: process.env.NEXT_PUBLIC_SENTRY_DSN_CMS,
    NEXT_PUBLIC_SENTRY_DSN_WORKFLOWS: process.env.NEXT_PUBLIC_SENTRY_DSN_WORKFLOWS,
    NEXT_PUBLIC_SENTRY_DSN_AUTHMGMT: process.env.NEXT_PUBLIC_SENTRY_DSN_AUTHMGMT,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_MODE: process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_MODE as
      | 'host'
      | 'child'
      | 'standalone'
      | undefined,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ZONE: process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_ZONE,
    NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED:
      process.env.NEXT_PUBLIC_SENTRY_MICROFRONTEND_ENABLED === 'true',
  };
}

export type Env = typeof env;
