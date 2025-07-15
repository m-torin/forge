/**
 * Next.js configuration wrappers for observability providers
 * Migrated from the original observability package
 */

import { withLogtail as withBetterStack } from '@logtail/next';
import { NextConfig } from 'next';

import { getRawEnv, isProduction as isProductionEnv } from '../../env';
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
  // Core Options
  org?: string;
  project?: string;
  authToken?: string;
  sentryUrl?: string;
  headers?: Record<string, string>;
  telemetry?: boolean;
  silent?: boolean;
  debug?: boolean;

  // Source Maps Options
  sourcemaps?: {
    disable?: boolean;
    assets?: string | string[];
    ignore?: string | string[];
    deleteSourcemapsAfterUpload?: boolean;
  };

  // Release Options
  release?: {
    name?: string;
    create?: boolean;
    finalize?: boolean;
    dist?: string;
  };

  // Bundle Size Optimizations
  bundleSizeOptimizations?: {
    excludeDebugStatements?: boolean;
    excludeTracing?: boolean;
  };

  // Next.js Specific Options
  widenClientFileUpload?: boolean;
  autoInstrumentServerFunctions?: boolean;
  autoInstrumentMiddleware?: boolean;
  autoInstrumentAppDirectory?: boolean;
  excludeServerRoutes?: Array<RegExp | string>;
  tunnelRoute?: string;
  automaticVercelMonitors?: boolean;
  unstable_sentryWebpackPluginOptions?: Record<string, any>;

  // Deprecated but kept for backward compatibility
  disableLogger?: boolean;
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
 *     endpoint: 'https://otel-collector.example.com'
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
  // Check if we have minimum required config for source map upload
  const env = getRawEnv();
  const hasRequiredConfig = Boolean(
    (sentryBuildOptions?.authToken || env.SENTRY_AUTH_TOKEN) &&
      (sentryBuildOptions?.org || env.SENTRY_ORG) &&
      (sentryBuildOptions?.project || env.SENTRY_PROJECT),
  );

  // Determine if we're in production
  const isProduction = isProductionEnv();

  // Dynamically import Sentry using eval wrapper to prevent static analysis
  const dynamicImport = eval('(specifier) => import(specifier)');
  const sentryModule = await dynamicImport('@sentry/nextjs');
  const { withSentryConfig } = sentryModule;

  const defaultOptions: Parameters<typeof withSentryConfig>[1] = {
    // Core Options
    org: sentryBuildOptions?.org || env.SENTRY_ORG,
    project: sentryBuildOptions?.project || env.SENTRY_PROJECT,
    authToken: sentryBuildOptions?.authToken || env.SENTRY_AUTH_TOKEN,
    sentryUrl: sentryBuildOptions?.sentryUrl || 'https://sentry.io/',
    headers: sentryBuildOptions?.headers,
    telemetry: sentryBuildOptions?.telemetry ?? true,
    silent: sentryBuildOptions?.silent ?? !env.CI,
    debug: sentryBuildOptions?.debug ?? !isProduction,

    // Source Maps Options - only upload if we have required config
    sourcemaps: {
      disable: sentryBuildOptions?.sourcemaps?.disable ?? !hasRequiredConfig,
      assets: sentryBuildOptions?.sourcemaps?.assets,
      ignore: sentryBuildOptions?.sourcemaps?.ignore,
      deleteSourcemapsAfterUpload:
        sentryBuildOptions?.sourcemaps?.deleteSourcemapsAfterUpload ?? true,
    },

    // Release Options
    release: {
      name: sentryBuildOptions?.release?.name,
      create: sentryBuildOptions?.release?.create ?? true,
      finalize: sentryBuildOptions?.release?.finalize ?? true,
      dist: sentryBuildOptions?.release?.dist,
    },

    // Bundle Size Optimizations
    bundleSizeOptimizations: {
      excludeDebugStatements:
        sentryBuildOptions?.bundleSizeOptimizations?.excludeDebugStatements ?? isProduction,
      excludeTracing: sentryBuildOptions?.bundleSizeOptimizations?.excludeTracing ?? false,
    },

    // Next.js Specific Options
    widenClientFileUpload: sentryBuildOptions?.widenClientFileUpload ?? true,
    autoInstrumentServerFunctions: sentryBuildOptions?.autoInstrumentServerFunctions ?? true,
    autoInstrumentMiddleware: sentryBuildOptions?.autoInstrumentMiddleware ?? true,
    autoInstrumentAppDirectory: sentryBuildOptions?.autoInstrumentAppDirectory ?? true,
    excludeServerRoutes: sentryBuildOptions?.excludeServerRoutes,
    tunnelRoute: sentryBuildOptions?.tunnelRoute ?? '/monitoring',
    automaticVercelMonitors: sentryBuildOptions?.automaticVercelMonitors ?? true,

    // Deprecated options (mapped to new options)
    disableLogger: sentryBuildOptions?.disableLogger ?? true,

    // Pass through any unstable options
    ...sentryBuildOptions?.unstable_sentryWebpackPluginOptions,
  };

  // Apply Sentry configuration with enhanced webpack externals for edge runtime
  const configWithSentry = withSentryConfig(nextConfig, defaultOptions);

  // Enhance webpack configuration to better handle edge runtime and enable tree shaking
  const originalWebpack = configWithSentry.webpack;
  configWithSentry.webpack = (config: any, options: any) => {
    // Apply original webpack config first
    if (originalWebpack) {
      config = originalWebpack(config, options);
    }

    // Add DefinePlugin for tree shaking based on build options
    config.plugins = config.plugins || [];

    // Only add DefinePlugin in client bundles to avoid server-side issues
    if (!options.isServer) {
      try {
        // Use eval to prevent webpack from analyzing this require
        const webpack = eval('require')('webpack');
        const { DefinePlugin } = webpack;

        // Add DefinePlugin configuration for tree shaking
        const definePluginConfig: Record<string, any> = {
          // Enable/disable debug based on environment and build options
          __SENTRY_DEBUG__: JSON.stringify(sentryBuildOptions?.debug ?? !isProduction),
        };

        // Add feature flags for tree shaking
        if (sentryBuildOptions?.bundleSizeOptimizations?.excludeDebugStatements) {
          definePluginConfig.__SENTRY_DEBUG__ = JSON.stringify(false);
        }

        if (sentryBuildOptions?.bundleSizeOptimizations?.excludeTracing) {
          definePluginConfig.__SENTRY_TRACING__ = JSON.stringify(false);
        }

        // Add experimental feature flags if provided
        if (sentryBuildOptions?.unstable_sentryWebpackPluginOptions?.definePlugin) {
          Object.assign(
            definePluginConfig,
            sentryBuildOptions.unstable_sentryWebpackPluginOptions.definePlugin,
          );
        }

        config.plugins.push(new DefinePlugin(definePluginConfig));
      } catch (_error) {
        // Silently skip DefinePlugin if webpack is not available
        // This is fine as the DefinePlugin is optional for optimizations
      }
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
 *   endpoint: 'https://otel-collector.example.com'
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
