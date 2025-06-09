/**
 * Next.js client-side instrumentation for observability
 * This file is imported by apps in their instrumentation-client.ts
 */

import * as Sentry from '@sentry/nextjs';

import type { ObservabilityConfig } from '../shared/types/types';

/**
 * Initialize client-side observability
 * This function is called when the client loads
 */
export default async function initializeClient(config?: ObservabilityConfig) {
  // Only initialize on client-side
  if (typeof window === 'undefined') {
    return;
  }

  const { createClientObservability } = await import('../client');

  // Use provided config or default config
  const observabilityConfig = config || getDefaultClientConfig();

  // Initialize observability providers
  await createClientObservability(observabilityConfig);
}

// Export as named export for flexibility
export { initializeClient };

// Export for Sentry Next.js navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

/**
 * Get default client configuration
 * Apps can override this by passing their own config
 */
function getDefaultClientConfig(): ObservabilityConfig {
  return {
    providers: {
      console: {
        enabled: process.env.NODE_ENV === 'development',
      },
      sentry: {
        debug: process.env.NODE_ENV === 'development',
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV,
        integrations: ['replay'], // Enable session replay
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        tracesSampleRate: 1.0,
      },
    },
  };
}
