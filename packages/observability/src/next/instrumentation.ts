/**
 * Next.js instrumentation for server-side observability
 * This file is imported by apps in their instrumentation.ts
 */

import * as Sentry from '@sentry/nextjs';

import type { ObservabilityConfig } from '../shared/types/types';

/**
 * Register function for Next.js instrumentation
 * Called automatically by Next.js on server startup
 */
export async function register(config?: ObservabilityConfig) {
  // Initialize based on runtime environment - use server-next for Next.js environments
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createServerObservability } = await import('../server-next');

    // Use provided config or default config
    const observabilityConfig = config || getDefaultServerConfig();

    // Initialize observability providers
    await createServerObservability(observabilityConfig);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    const { createServerObservability } = await import('../server-next');

    // Edge runtime config might differ slightly
    const observabilityConfig = config || getDefaultEdgeConfig();

    // Initialize for edge runtime
    await createServerObservability(observabilityConfig);
  }
}

/**
 * Sentry's onRequestError handler for Next.js
 * Captures errors that occur during request handling
 */
export const onRequestError = Sentry.captureRequestError;

/**
 * Get default server configuration
 * Apps can override this by passing their own config
 */
function getDefaultServerConfig(): ObservabilityConfig {
  return {
    providers: {
      console: {
        enabled: process.env.NODE_ENV === 'development',
      },
      logtail: {
        sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
      },
      sentry: {
        // Remove debug option to avoid non-debug bundle conflicts
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      },
    },
  };
}

/**
 * Get default edge configuration
 * Similar to server but may have different settings for edge runtime
 */
function getDefaultEdgeConfig(): ObservabilityConfig {
  return {
    providers: {
      console: {
        enabled: process.env.NODE_ENV === 'development',
      },
      sentry: {
        debug: false, // Disable debug in edge runtime
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1, // Lower sample rate for edge
      },
    },
  };
}
