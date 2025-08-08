/**
 * Build configuration utilities for Next.js Sentry integration
 * Wraps withSentryConfig with observability defaults
 */

import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import { safeEnv } from './env';

/**
 * Build options for Sentry integration
 * Based on withSentryConfig options
 */
export interface ObservabilitySentryBuildOptions {
  // Core options
  org?: string;
  project?: string;
  authToken?: string;
  sentryUrl?: string;
  headers?: Record<string, string>;
  telemetry?: boolean;
  silent?: boolean;
  debug?: boolean;
  errorHandler?: (error: Error) => void;

  // Source maps options
  sourcemaps?: {
    disable?: boolean;
    assets?: string | string[];
    ignore?: string | string[];
    deleteSourcemapsAfterUpload?: boolean;
  };

  // Release options
  release?: {
    name?: string;
    create?: boolean;
    finalize?: boolean;
    dist?: string;
  };

  // Next.js specific options
  tunnelRoute?: boolean | string;
  automaticVercelMonitors?: boolean;
  widenClientFileUpload?: boolean;
  disableLogger?: boolean;

  // Advanced options
  unstable_sentryWebpackPluginOptions?: any;

  // Environment detection
  autoDetectEnvironment?: boolean;

  // Profiling options
  enableProfiling?: boolean;
  /**
   * Add Document-Policy header for browser profiling
   * @default false
   */
  addDocumentPolicyHeader?: boolean;
}

/**
 * Default error handler for build failures
 */
const defaultErrorHandler = (error: Error) => {
  console.warn('⚠️  Sentry build error occurred:', error.message);
  console.warn('   This may prevent source maps from being uploaded to Sentry.');
  console.warn('   Check your SENTRY_AUTH_TOKEN and project settings.');
  // Don't re-throw by default to prevent build failures
};

/**
 * Wrap Next.js config with Sentry and observability defaults
 */
export function withObservabilitySentry(
  nextConfig: NextConfig,
  options: ObservabilitySentryBuildOptions = {},
): NextConfig {
  const env = safeEnv();

  // Auto-detect configuration from environment
  const autoDetectedOptions: ObservabilitySentryBuildOptions = {
    // Core options from env
    org: options.org || env.SENTRY_ORG,
    project: options.project || env.SENTRY_PROJECT,
    authToken: options.authToken || env.SENTRY_AUTH_TOKEN,
    sentryUrl: options.sentryUrl || env.SENTRY_URL,

    // Behavior options
    telemetry: options.telemetry ?? true,
    silent: options.silent ?? (env.SENTRY_SILENT || !process.env.CI),
    debug: options.debug ?? env.SENTRY_DEBUG_BUILD,
    errorHandler: options.errorHandler || defaultErrorHandler,

    // Source maps configuration
    sourcemaps: {
      disable: options.sourcemaps?.disable ?? env.SENTRY_DISABLE_SOURCEMAPS,
      assets: options.sourcemaps?.assets,
      ignore: options.sourcemaps?.ignore || [],
      deleteSourcemapsAfterUpload:
        options.sourcemaps?.deleteSourcemapsAfterUpload ??
        env.SENTRY_DELETE_SOURCEMAPS_AFTER_UPLOAD,
    },

    // Release configuration
    release: {
      name: options.release?.name || env.SENTRY_RELEASE_NAME || env.SENTRY_RELEASE,
      create: options.release?.create ?? env.SENTRY_RELEASE_CREATE,
      finalize: options.release?.finalize ?? env.SENTRY_RELEASE_FINALIZE,
      dist: options.release?.dist || env.SENTRY_RELEASE_DIST,
    },

    // Next.js specific
    tunnelRoute: options.tunnelRoute ?? env.SENTRY_TUNNEL_ROUTE,
    automaticVercelMonitors:
      options.automaticVercelMonitors ?? env.SENTRY_AUTOMATIC_VERCEL_MONITORS,
    widenClientFileUpload: options.widenClientFileUpload ?? env.SENTRY_WIDEN_CLIENT_FILE_UPLOAD,
    disableLogger: options.disableLogger ?? env.SENTRY_DISABLE_LOGGER,

    // Pass through advanced options
    unstable_sentryWebpackPluginOptions: options.unstable_sentryWebpackPluginOptions,
  };

  // Check if we have minimum required configuration
  if (!autoDetectedOptions.authToken) {
    console.warn('⚠️  SENTRY_AUTH_TOKEN not found. Source maps will not be uploaded.');
    console.warn('   Set SENTRY_AUTH_TOKEN environment variable to enable source map uploads.');
  }

  if (!autoDetectedOptions.org || !autoDetectedOptions.project) {
    console.warn('⚠️  SENTRY_ORG or SENTRY_PROJECT not configured.');
    console.warn('   Source map uploads may fail without these values.');
  }

  // Enhance Next.js config with Document-Policy header if profiling is enabled
  let enhancedNextConfig = { ...nextConfig };

  if (options.addDocumentPolicyHeader || options.enableProfiling) {
    const existingHeaders = enhancedNextConfig.headers;

    enhancedNextConfig.headers = async () => {
      const headers = existingHeaders ? await existingHeaders() : [];

      // Add Document-Policy header for browser profiling
      headers.push({
        source: '/:path*',
        headers: [
          {
            key: 'Document-Policy',
            value: 'js-profiling',
          },
        ],
      });

      return headers;
    };
  }

  // Apply withSentryConfig
  return withSentryConfig(enhancedNextConfig, autoDetectedOptions);
}

/**
 * Helper to create a complete next.config.js with Sentry
 */
export function createSentryNextConfig(
  nextConfig: NextConfig = {},
  sentryOptions: ObservabilitySentryBuildOptions = {},
): NextConfig {
  return withObservabilitySentry(nextConfig, sentryOptions);
}

/**
 * Create a Next.js config with profiling enabled
 * Includes Document-Policy header for browser profiling
 */
export function createProfilingEnabledConfig(
  nextConfig: NextConfig = {},
  sentryOptions: ObservabilitySentryBuildOptions = {},
): NextConfig {
  return withObservabilitySentry(nextConfig, {
    ...sentryOptions,
    enableProfiling: true,
    addDocumentPolicyHeader: true,
  });
}
