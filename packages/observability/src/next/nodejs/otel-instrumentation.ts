/**
 * OpenTelemetry instrumentation helpers for Next.js applications (Node.js ONLY)
 *
 * IMPORTANT: This file is isolated in the /nodejs folder because it contains
 * OpenTelemetry imports that are incompatible with edge runtime.
 *
 * DO NOT import this file directly from edge runtime code paths.
 */

import { getRawEnv, isProduction as isProductionEnv } from '../../../env';

// Import types but avoid static imports of OpenTelemetry packages
interface VercelOTelConfig {
  endpoint?: string;
  environment?: string;
  headers?: Record<string, string>;
  instrumentations?: any[];
  propagateContextUrls?: (RegExp | string)[];
  resourceAttributes?: Record<string, boolean | number | string>;
  serviceName: string;
  serviceVersion?: string;
  traceExporter?: any;
  useVercelOTel?: boolean;
  samplingRatio?: number;
}

/**
 * Get default OpenTelemetry configuration for different environments
 */
export function getDefaultOTelConfig(serviceName: string): VercelOTelConfig {
  const env = getRawEnv();
  const isProduction = isProductionEnv();
  const isVercelEnv = !!env.VERCEL_ENV;

  return {
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    environment: env.VERCEL_ENV || env.NODE_ENV || 'development',
    headers: env.OTEL_EXPORTER_OTLP_HEADERS
      ? JSON.parse(env.OTEL_EXPORTER_OTLP_HEADERS)
      : undefined,
    resourceAttributes: {
      'service.environment': env.VERCEL_ENV || env.NODE_ENV || 'development',
      ...(env.VERCEL_GIT_COMMIT_SHA && {
        'service.version': env.VERCEL_GIT_COMMIT_SHA,
      }),
    },
    samplingRatio: isProduction ? 0.1 : 1.0, // 10% sampling in production, 100% in development
    serviceName,
    serviceVersion: env.npm_package_version || '1.0.0',
    useVercelOTel: isVercelEnv, // Use Vercel OTel when on Vercel
  };
}

/**
 * Register OpenTelemetry instrumentation for Next.js (Node.js only)
 *
 * IMPORTANT: This function can only be used in Node.js runtime.
 * It will throw an error if called in edge runtime.
 */
export async function registerOTel(config: VercelOTelConfig): Promise<void> {
  // Strict runtime check - fail fast if not in Node.js
  if (typeof window !== 'undefined') {
    throw new Error('[OTel] Cannot initialize OpenTelemetry in browser environment');
  }

  if (getRawEnv().NEXT_RUNTIME === 'edge') {
    throw new Error('[OTel] Cannot initialize OpenTelemetry in edge runtime - not supported');
  }

  try {
    // Check if OpenTelemetry dependencies are available
    await checkOTelDependencies();

    // Check if we're in a Vercel environment or should use Vercel OTel
    const env = getRawEnv();
    const isVercelEnv = env.VERCEL_ENV || config.useVercelOTel !== false;

    if (isVercelEnv) {
      // Use Vercel's OTel package for better compatibility
      await registerVercelOTel(config);
    } else {
      // Use standard OpenTelemetry SDK for Node.js environments
      await registerStandardOTel(config);
    }

    if (!isProductionEnv()) {
      console.info(`[OTel] Instrumentation registered for service: ${config.serviceName}`);
    }
  } catch (error) {
    // If dependencies are missing, silently skip instead of throwing
    if (
      (error instanceof Error && (error as Error)?.message) ||
      'Unknown error'.includes('Cannot resolve module')
    ) {
      if (!isProductionEnv()) {
        console.info('[OTel] OpenTelemetry dependencies not found, skipping instrumentation');
      }
      return;
    }
    console.error('[OTel] Failed to register instrumentation: ', error);
  }
}

/**
 * Simple instrumentation setup for common use cases (Node.js only)
 */
export async function simpleOTelSetup(serviceName: string): Promise<void> {
  if (getRawEnv().NEXT_RUNTIME === 'edge') {
    throw new Error('[OTel] Cannot setup OpenTelemetry in edge runtime - not supported');
  }

  const config = getDefaultOTelConfig(serviceName);
  await registerOTel(config);
}

/**
 * Check if OpenTelemetry dependencies are available
 *
 * ISOLATED: This function performs dynamic imports that are isolated
 * from the main module graph to prevent bundling in edge runtime.
 */
async function checkOTelDependencies(): Promise<void> {
  try {
    // Use eval to prevent static analysis and bundling
    const dynamicImport = eval('(specifier) => import(specifier)');
    await dynamicImport('@opentelemetry/api');
  } catch (_error) {
    throw new Error(
      'Cannot resolve module @opentelemetry/api - OpenTelemetry dependencies not available',
    );
  }
}

/**
 * Register using standard OpenTelemetry SDK
 *
 * ISOLATED: Uses eval-wrapped dynamic imports to prevent static analysis
 */
async function registerStandardOTel(config: VercelOTelConfig): Promise<void> {
  // Use eval to prevent webpack from analyzing these imports
  const dynamicImport = eval('(specifier) => import(specifier)');

  const nodeSDKModule = await dynamicImport('@opentelemetry/sdk-node');
  const resourceModule = await dynamicImport('@opentelemetry/resources');
  const semanticConventions = await dynamicImport('@opentelemetry/semantic-conventions');
  const otlpModule = await dynamicImport('@opentelemetry/exporter-trace-otlp-http');
  const autoInstrumentationsModule = await dynamicImport(
    '@opentelemetry/auto-instrumentations-node',
  );

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
  const env = getRawEnv();
  if (env.VERCEL_ENV) {
    resourceAttributes['vercel.env'] = env.VERCEL_ENV;
  }
  if (env.VERCEL_DEPLOYMENT_ID) {
    resourceAttributes['vercel.deployment.id'] = env.VERCEL_DEPLOYMENT_ID;
  }
  if (env.VERCEL_REGION) {
    resourceAttributes['vercel.region'] = env.VERCEL_REGION;
  }
  if (env.NEXT_RUNTIME) {
    resourceAttributes['vercel.runtime'] = env.NEXT_RUNTIME;
  }

  const resource = new resourceModule.Resource(resourceAttributes);

  // Configure trace exporter
  const traceExporter = new otlpModule.OTLPTraceExporter({
    headers: {
      ...config.headers,
      ...(env.OTEL_EXPORTER_OTLP_HEADERS && JSON.parse(env.OTEL_EXPORTER_OTLP_HEADERS)),
    },
    url: config.endpoint || env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
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
 *
 * ISOLATED: Uses eval-wrapped dynamic imports to prevent static analysis
 */
async function registerVercelOTel(config: VercelOTelConfig): Promise<void> {
  try {
    // Use eval to prevent webpack from analyzing these imports
    const dynamicImport = eval('(specifier) => import(specifier)');
    const vercelOTel = await dynamicImport('@vercel/otel');

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
      registerConfig.traceExporter = new vercelOTel.OTLPHttpJsonTraceExporter({
        headers: config.headers || {},
        url: config.endpoint,
      });
    } else {
      // Use Vercel's auto-configuration (recommended for Vercel deployments)
      registerConfig.traceExporter = 'auto';
    }

    vercelOTel.registerOTel(registerConfig);
  } catch (_error) {
    if (!isProductionEnv()) {
      console.warn('[OTel] Vercel OTel not available, falling back to standard OTel');
    }
    await registerStandardOTel(config);
  }
}
