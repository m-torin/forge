/**
 * Next.js client-side instrumentation for observability
 * This file is imported by apps in their instrumentation-client.ts
 */

import { safeEnv } from '../../env';
import { ObservabilityConfig } from '../shared/types/types';

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
// We export a no-op function since Sentry client is initialized separately
// The actual router transition tracking is handled by Sentry's client provider when initialized
export const onRouterTransitionStart = () => {
  // No-op: Router transitions are automatically tracked when Sentry client is initialized
  // This export exists for API compatibility with apps expecting this function
};

/**
 * Get default client configuration
 * Apps can override this by passing their own config
 */
function getDefaultClientConfig(): ObservabilityConfig {
  const env = safeEnv();
  return {
    providers: {
      console: {
        enabled: env.NEXT_PUBLIC_NODE_ENV === 'development',
      },
      sentry: {
        debug: env.NEXT_PUBLIC_NODE_ENV === 'development',
        dsn: env.NEXT_PUBLIC_SENTRY_DSN,
        environment: env.NEXT_PUBLIC_NODE_ENV,
        integrations: ['replay'], // Enable session replay
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        tracesSampleRate: 1.0,
      },
    },
  };
}
