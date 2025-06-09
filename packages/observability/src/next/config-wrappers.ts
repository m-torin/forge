/**
 * Next.js configuration wrappers for observability providers
 * Migrated from the original observability package
 */

import { withLogtail as withBetterStack } from '@logtail/next';
import { withSentryConfig } from '@sentry/nextjs';

import type { NextConfig } from 'next';

/**
 * Sentry configuration options for Next.js builds
 */
export interface SentryBuildOptions {
  authToken?: string;
  automaticVercelMonitors?: boolean;
  disableLogger?: boolean;
  org?: string;
  project?: string;
  silent?: boolean;
  tunnelRoute?: string;
  widenClientFileUpload?: boolean;
  sourcemaps?: {
    disable?: boolean;
    deleteSourcemapsAfterUpload?: boolean;
  };
  release?: {
    name?: string;
  };
}

/**
 * Wrap Next.js config with Sentry
 * This adds source map uploading and other build-time integrations
 */
export function withSentry(
  nextConfig: NextConfig,
  sentryBuildOptions?: SentryBuildOptions,
): NextConfig {
  const defaultOptions: Parameters<typeof withSentryConfig>[1] = {
    authToken: sentryBuildOptions?.authToken || process.env.SENTRY_AUTH_TOKEN,
    // Organization and project from env vars
    org: sentryBuildOptions?.org || process.env.SENTRY_ORG,
    project: sentryBuildOptions?.project || process.env.SENTRY_PROJECT,

    // Only print logs for uploading source maps in CI
    silent: sentryBuildOptions?.silent ?? !process.env.CI,

    // Upload a larger set of source maps for prettier stack traces
    widenClientFileUpload: sentryBuildOptions?.widenClientFileUpload ?? true,

    // Route browser requests to Sentry through a Next.js rewrite
    tunnelRoute: sentryBuildOptions?.tunnelRoute ?? '/monitoring',

    // Automatically tree-shake Sentry logger statements
    disableLogger: sentryBuildOptions?.disableLogger ?? true,

    // Enable automatic Vercel Cron monitoring
    automaticVercelMonitors: sentryBuildOptions?.automaticVercelMonitors ?? true,

    // Source maps configuration
    sourcemaps: sentryBuildOptions?.sourcemaps || {
      disable: false,
      deleteSourcemapsAfterUpload: true, // Default in v9
    },

    // Release configuration
    release: sentryBuildOptions?.release,
  };

  // Add transpilePackages for Sentry
  const configWithTranspile: NextConfig = {
    ...nextConfig,
    transpilePackages: [...(nextConfig.transpilePackages || []), '@sentry/nextjs'],
  };

  return withSentryConfig(configWithTranspile, defaultOptions);
}

/**
 * Wrap Next.js config with Better Stack (Logtail)
 * This adds Better Stack's optimized logging capabilities for Next.js
 */
export function withLogging(nextConfig: NextConfig): NextConfig {
  return withBetterStack(nextConfig);
}

/**
 * Wrap Next.js config with all observability providers
 * Apply this to your next.config.js for full observability
 *
 * @example
 * ```js
 * // next.config.js
 * import { withObservability } from '@repo/observability/server/next';
 *
 * export default withObservability({
 *   // Your Next.js config
 * }, {
 *   sentry: {
 *     org: 'my-org',
 *     project: 'my-project'
 *   },
 *   logtail: true // Enables Better Stack integration
 * });
 * ```
 */
export function withObservability(
  nextConfig: NextConfig,
  options?: {
    sentry?: SentryBuildOptions | boolean;
    logtail?: boolean; // Enables Better Stack (Logtail) integration
  },
): NextConfig {
  let config = nextConfig;

  // Apply Sentry if enabled
  if (options?.sentry !== false) {
    const sentryOptions = typeof options?.sentry === 'object' ? options.sentry : undefined;

    config = withSentry(config, sentryOptions);
  }

  // Apply Logtail if enabled
  if (options?.logtail !== false) {
    config = withLogging(config);
  }

  return config;
}

/**
 * Create environment-aware configuration
 * Different settings for development vs production
 */
export function createObservabilityConfig(
  baseConfig: NextConfig,
  options?: {
    development?: {
      sentry?: SentryBuildOptions | boolean;
      logtail?: boolean;
    };
    production?: {
      sentry?: SentryBuildOptions | boolean;
      logtail?: boolean;
    };
  },
): NextConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const envOptions = isDevelopment ? options?.development : options?.production;

  return withObservability(baseConfig, envOptions);
}
