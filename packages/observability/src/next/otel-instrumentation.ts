/**
 * OpenTelemetry instrumentation helpers for Next.js applications
 * Supports both Vercel's @vercel/otel package and standard OpenTelemetry SDK
 * Follows Vercel's recommended patterns for optimal performance
 */

import { VercelOTelConfig } from '../shared/types/opentelemetry-types';
// Note: All OpenTelemetry types are defined as 'any' since they're dynamic imports
// and peer dependencies that may not be available

/**
 * Get default OpenTelemetry configuration for different environments
 */
export function getDefaultOTelConfig(serviceName: string): VercelOTelConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercelEnv = !!process.env.VERCEL_ENV;

  return {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
      ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
      : undefined,
    resourceAttributes: {
      'service.environment': process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      ...(process.env.VERCEL_GIT_COMMIT_SHA && {
        'service.version': process.env.VERCEL_GIT_COMMIT_SHA,
      }),
    },
    samplingRatio: isProduction ? 0.1 : 1.0, // 10% sampling in production, 100% in development
    serviceName,
    serviceVersion: process.env.npm_package_version || '1.0.0',
    useVercelOTel: isVercelEnv, // Use Vercel OTel when on Vercel
  };
}

/**
 * Register OpenTelemetry instrumentation for Next.js
 * This should be called in your instrumentation.ts file
 * Follows Vercel's recommended registerOTel() pattern
 *
 * @example
 * ```typescript
 * // instrumentation.ts
 * import { registerOTel } from '@repo/observability/server/next';
 *
 * export function register() {
 *   registerOTel({ serviceName: 'my-app' });
 * }
 * ```
 */
export async function registerOTel(config: VercelOTelConfig): Promise<void> {
  // Only register on server-side
  if (typeof window !== 'undefined') {
    return;
  }

  try {
    // Check if OpenTelemetry dependencies are available
    await checkOTelDependencies();

    // Check if we're in a Vercel environment or should use Vercel OTel
    const isVercelEnv = process.env.VERCEL_ENV || config.useVercelOTel !== false;
    const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

    if (isVercelEnv || isEdgeRuntime) {
      // Use Vercel's OTel package for better compatibility
      await registerVercelOTel(config);
    } else {
      // Use standard OpenTelemetry SDK for Node.js environments
      await registerStandardOTel(config);
    }

    if (process.env.NODE_ENV === 'development') {
      console.info(`[OTel] Instrumentation registered for service: ${config.serviceName}`);
    }
  } catch (_error: any) {
    // If dependencies are missing, silently skip instead of throwing
    if (
      (_error instanceof Error && (_error as Error)?.message) ||
      'Unknown error'.includes('Cannot resolve module')
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.info('[OTel] OpenTelemetry dependencies not found, skipping instrumentation');
      }
      return;
    }
    console.error('[OTel] Failed to register instrumentation: ', _error);
  }
}

/**
 * Simple instrumentation setup for common use cases
 * Perfect for getting started quickly with sensible defaults
 *
 * @example
 * ```typescript
 * // instrumentation.ts
 * import { simpleOTelSetup } from '@repo/observability/server/next';
 *
 * export function register() {
 *   simpleOTelSetup('my-app');
 * }
 * ```
 */
export async function simpleOTelSetup(serviceName: string): Promise<void> {
  const config = getDefaultOTelConfig(serviceName);
  await registerOTel(config);
}

/**
 * Check if OpenTelemetry dependencies are available
 */
async function checkOTelDependencies(): Promise<void> {
  try {
    // Try to import OpenTelemetry API to check if it's available
    await import('@opentelemetry/api' as any);
  } catch (_error: any) {
    throw new Error(
      'Cannot resolve module @opentelemetry/api - OpenTelemetry dependencies not available',
    );
  }
}

/**
 * Register using standard OpenTelemetry SDK
 */
async function registerStandardOTel(config: VercelOTelConfig): Promise<void> {
  const nodeSDKModule = (await import('@opentelemetry/sdk-node' as any)) as any;
  const resourceModule = (await import('@opentelemetry/resources' as any)) as any;
  const semanticConventions = (await import('@opentelemetry/semantic-conventions' as any)) as any;
  const otlpModule = (await import('@opentelemetry/exporter-trace-otlp-http' as any)) as any;
  const autoInstrumentationsModule = (await import(
    '@opentelemetry/auto-instrumentations-node' as any
  )) as any;

  // Build resource attributes
  const resourceAttributes: Record<string, any> = {
    [semanticConventions.ATTR_SERVICE_NAME]: config.serviceName,
    ...(config.serviceVersion && {
      [semanticConventions.ATTR_SERVICE_VERSION]: config.serviceVersion,
    }),
    ...(config.environment && { 'deployment.environment': config.environment }),
    ...config.resourceAttributes,
  };

  // Add Vercel-specific attributes if available
  if (process.env.VERCEL_ENV) {
    resourceAttributes['vercel.env'] = process.env.VERCEL_ENV;
  }
  if (process.env.VERCEL_DEPLOYMENT_ID) {
    resourceAttributes['vercel.deployment.id'] = process.env.VERCEL_DEPLOYMENT_ID;
  }
  if (process.env.VERCEL_REGION) {
    resourceAttributes['vercel.region'] = process.env.VERCEL_REGION;
  }
  if (process.env.NEXT_RUNTIME) {
    resourceAttributes['vercel.runtime'] = process.env.NEXT_RUNTIME;
  }

  const resource = new resourceModule.Resource(resourceAttributes);

  // Configure trace exporter
  const traceExporter = new otlpModule.OTLPTraceExporter({
    headers: {
      ...config.headers,
      ...(process.env.OTEL_EXPORTER_OTLP_HEADERS &&
        JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)),
    },
    url:
      config.endpoint ||
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      'http://localhost:4318/v1/traces',
  });

  // Initialize SDK
  const sdk = new nodeSDKModule.NodeSDK({
    instrumentations: autoInstrumentationsModule.getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable filesystem instrumentation for better performance
      },
    }),
    resource,
    traceExporter,
  });

  sdk.start();
}

/**
 * Register using Vercel's OTel package
 */
async function registerVercelOTel(config: VercelOTelConfig): Promise<void> {
  try {
    const { registerOTel } = (await import('@vercel/otel' as any)) as any;

    // Build configuration following Vercel's registerOTel API
    const registerConfig: any = {
      serviceName: config.serviceName,
    };

    // Add optional parameters only if provided
    if (config.serviceVersion) {
      registerConfig.serviceVersion = config.serviceVersion;
    }
    if (config.instrumentations) {
      registerConfig.instrumentations = config.instrumentations;
    }
    if (config.propagateContextUrls) {
      registerConfig.propagateContextUrls = config.propagateContextUrls;
    }

    // Handle trace exporter configuration
    if (config.traceExporter) {
      // Use custom exporter if provided
      registerConfig.traceExporter = config.traceExporter;
    } else if (config.endpoint) {
      // Create OTLP exporter for custom endpoint
      const { OTLPHttpJsonTraceExporter } = (await import('@vercel/otel' as any)) as any;
      registerConfig.traceExporter = new OTLPHttpJsonTraceExporter({
        headers: config.headers || {},
        url: config.endpoint,
      });
    } else {
      // Use Vercel's auto-configuration (recommended for Vercel deployments)
      registerConfig.traceExporter = 'auto';
    }

    registerOTel(registerConfig);
  } catch (_error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[OTel] Vercel OTel not available, falling back to standard OTel');
    }
    await registerStandardOTel(config);
  }
}
