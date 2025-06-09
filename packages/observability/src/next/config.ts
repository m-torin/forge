/**
 * Configuration helpers for Next.js observability
 * Provides default configurations that apps can extend
 */

import type { ObservabilityConfig } from '../shared/types/types';

/**
 * Get default observability configuration for Next.js apps
 * This provides a base configuration that apps can extend or override
 */
export function getObservabilityConfig(): ObservabilityConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    providers: {
      sentry: {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
        environment: process.env.NEXT_PUBLIC_ENV || process.env.NODE_ENV || 'development',

        profilesSampleRate: isProduction ? 0.1 : 0,
        // Performance monitoring
        tracesSampleRate: isProduction ? 0.1 : 1.0,

        integrations: ['replay'],
        replaysOnErrorSampleRate: 1.0,
        // Session replay (client-side only)
        replaysSessionSampleRate: isProduction ? 0.1 : 0.5,

        // Debug in development
        debug: isDevelopment,

        hideSourceMaps: true,
        widenClientFileUpload: true,
        automaticVercelMonitors: true,
        disableLogger: true,
        // Next.js specific options
        tunnelRoute: '/monitoring',
      },

      logtail: {
        sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
      },

      console: {
        enabled: isDevelopment,
      },
    },
  };
}

/**
 * Merge observability configurations
 * Useful for apps that want to extend the default configuration
 */
export function mergeObservabilityConfig(
  base: ObservabilityConfig,
  override: Partial<ObservabilityConfig>,
): ObservabilityConfig {
  return {
    ...base,
    providers: {
      ...base.providers,
      ...override.providers,
      console: {
        ...(base.providers?.console || {}),
        ...(override.providers?.console || {}),
      },
      logtail: {
        ...(base.providers?.logtail || {}),
        ...(override.providers?.logtail || {}),
      },
      // Deep merge individual provider configs
      sentry: {
        ...(base.providers?.sentry || {}),
        ...(override.providers?.sentry || {}),
      },
    },
  };
}
