/**
 * Next.js configuration wrappers for observability providers
 * Migrated from the original observability package
 */

import { withLogtail as withBetterStack } from '@logtail/next';
import { NextConfig } from 'next';

import { Environment } from '../shared/utils/environment';

/**
 * Create header string from object without JSON.stringify for better performance
 */
function createHeaderString(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]: [string, any]) => `${key}=${value}`)
    .join(',');
}

/**
 * Sentry configuration options for Next.js builds
 */
export interface SentryBuildOptions {
  authToken?: string;
  automaticVercelMonitors?: boolean;
  disableLogger?: boolean;
  org?: string;
  project?: string;
  release?: {
    name?: string;
  };
  silent?: boolean;
  sourcemaps?: {
    deleteSourcemapsAfterUpload?: boolean;
    disable?: boolean;
  };
  tunnelRoute?: string;
  widenClientFileUpload?: boolean;
}

/**
 * OpenTelemetry configuration options for Next.js builds
 */
export interface VercelOTelBuildOptions {
  endpoint?: string;
  headers?: Record<string, string>;
  instrumentations?: string[];
  resourceAttributes?: Record<string, boolean | number | string>;
  samplingRatio?: number;
  serviceName?: string;
  serviceVersion?: string;
  useVercelOTel?: boolean;
}

/**
 * Create environment-aware configuration
 * Different settings for development vs production
 */
export async function createObservabilityConfig(
  baseConfig: NextConfig,
  options?: {
    development?: {
      logtail?: boolean;
      otel?: boolean | VercelOTelBuildOptions;
      sentry?: boolean | SentryBuildOptions;
      vercelOTel?: boolean | VercelOTelBuildOptions;
    };
    production?: {
      logtail?: boolean;
      otel?: boolean | VercelOTelBuildOptions;
      sentry?: boolean | SentryBuildOptions;
      vercelOTel?: boolean | VercelOTelBuildOptions;
    };
  },
): Promise<NextConfig> {
  const isDevelopment = Environment.isDevelopment();
  const envOptions = isDevelopment ? options?.development : options?.production;

  return withObservability(baseConfig, envOptions);
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
 *   vercelOTel: {
 *     serviceName: 'my-app',
 *     endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
 *   },
 *   logtail: true // Enables Better Stack integration
 * };
 * ```
 */
export async function withObservability(
  nextConfig: NextConfig,
  options?: {
    logtail?: boolean; // Enables Better Stack (Logtail) integration
    otel?: boolean | VercelOTelBuildOptions; // Alias for vercelOTel
    sentry?: boolean | SentryBuildOptions;
    vercelOTel?: boolean | VercelOTelBuildOptions;
  },
): Promise<NextConfig> {
  let config = nextConfig;

  // Apply Sentry if enabled
  if (options?.sentry !== false) {
    const sentryOptions = typeof options?.sentry === 'object' ? options.sentry : undefined;

    config = await withSentry(config, sentryOptions);
  }

  // OpenTelemetry disabled to prevent edge runtime bundling issues
  // const otelConfig = options?.vercelOTel || options?.otel;
  // if (otelConfig !== false) {
  //   const otelOptions = typeof otelConfig === 'object' ? otelConfig : undefined;
  //   config = withVercelOTel(config, otelOptions);
  // }

  // Apply Logtail if enabled
  if (options?.logtail !== false) {
    config = withLogging(config);
  }

  return config;
}

/**
 * Wrap Next.js config with Sentry
 * This adds source map uploading and other build-time integrations
 */
export async function withSentry(
  nextConfig: NextConfig,
  sentryBuildOptions?: SentryBuildOptions,
): Promise<NextConfig> {
  // Dynamically import Sentry to avoid edge runtime issues
  const { withSentryConfig } = await import('@sentry/nextjs');

  const defaultOptions: Parameters<typeof withSentryConfig>[1] = {
    authToken: sentryBuildOptions?.authToken || process.env.SENTRY_AUTH_TOKEN,
    // Enable automatic Vercel Cron monitoring
    automaticVercelMonitors: sentryBuildOptions?.automaticVercelMonitors ?? true,
    // Automatically tree-shake Sentry logger statements
    disableLogger: sentryBuildOptions?.disableLogger ?? true,

    // Organization and project from env vars
    org: sentryBuildOptions?.org || process.env.SENTRY_ORG,

    project: sentryBuildOptions?.project || process.env.SENTRY_PROJECT,

    // Release configuration
    release: sentryBuildOptions?.release,

    // Only print logs for uploading source maps in CI
    silent: sentryBuildOptions?.silent ?? !process.env.CI,

    // Source maps configuration
    sourcemaps: sentryBuildOptions?.sourcemaps || {
      deleteSourcemapsAfterUpload: true, // Default in v9
      disable: false,
    },

    // Route browser requests to Sentry through a Next.js rewrite
    tunnelRoute: sentryBuildOptions?.tunnelRoute ?? '/monitoring',

    // Upload a larger set of source maps for prettier stack traces
    widenClientFileUpload: sentryBuildOptions?.widenClientFileUpload ?? true,
  };

  // Apply Sentry configuration with enhanced webpack externals for edge runtime
  const configWithSentry = withSentryConfig(nextConfig, defaultOptions);

  // Enhance webpack configuration to better handle edge runtime
  const originalWebpack = configWithSentry.webpack;
  configWithSentry.webpack = (config: any, options: any) => {
    // Apply original webpack config first
    if (originalWebpack) {
      config = originalWebpack(config, options);
    }

    // Add additional externals for edge runtime to prevent OpenTelemetry bundling
    if (options.isServer && options.nextRuntime === 'edge') {
      config.externals = config.externals || [];

      // Add function to externalize Sentry and OpenTelemetry packages in edge runtime
      const originalExternals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals];
      config.externals = [
        ...originalExternals,
        ({ request }: { request: string }, callback: (error?: Error, result?: string) => void) => {
          if (!request) {
            return callback();
          }

          // Force externalize @sentry/nextjs and its OpenTelemetry dependencies in edge
          if (request.startsWith('@sentry/nextjs') || request.startsWith('@opentelemetry/')) {
            return callback(undefined, `commonjs ${request}`);
          }

          callback();
        },
      ];
    }

    return config;
  };

  return configWithSentry;
}

/**
 * Wrap Next.js config with Vercel OpenTelemetry
 * This enables distributed tracing with Vercel's optimized OTel setup
 *
 * @example
 * ```js
 * // next.config.js
 * import { withVercelOTel } from '@repo/observability/server/next';
 *
 * export default withVercelOTel({
 *   // Your Next.js config
 * }, {
 *   serviceName: 'my-app',
 *   endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
 * });
 * ```
 */
export function withVercelOTel(
  nextConfig: NextConfig,
  otelOptions?: VercelOTelBuildOptions,
): NextConfig {
  // Configure OpenTelemetry environment variables and settings
  // Note: Transpilation/externalization is handled by the shared @repo/config/next
  const configWithOTel: NextConfig = {
    ...nextConfig,
    // Add environment variables for OpenTelemetry
    env: {
      ...nextConfig.env,
      // Set service name if provided
      ...(otelOptions?.serviceName && { OTEL_SERVICE_NAME: otelOptions.serviceName }),
      ...(otelOptions?.serviceVersion && { OTEL_SERVICE_VERSION: otelOptions.serviceVersion }),
      ...(otelOptions?.endpoint && { OTEL_EXPORTER_OTLP_ENDPOINT: otelOptions.endpoint }),
      ...(otelOptions?.headers && {
        OTEL_EXPORTER_OTLP_HEADERS: createHeaderString(otelOptions.headers),
      }),
    },

    // Add experimental settings for better OpenTelemetry support
    experimental: {
      ...nextConfig.experimental,
      // Note: instrumentationHook is enabled by default in Next.js 15+
    },
  };

  return configWithOTel;
}
