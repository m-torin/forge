/**
 * Vercel OpenTelemetry provider with edge runtime support
 * All OpenTelemetry dependencies are lazy-loaded to avoid bundling when not used
 */

import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
// Note: All OpenTelemetry types are defined as 'any' since they're dynamic imports
// and peer dependencies that may not be available

interface VercelOTelConfig extends ObservabilityProviderConfig {
  // Custom OTLP exporter options (when not using Vercel's collector)
  endpoint?: string;
  // General options
  environment?: string;
  headers?: Record<string, string>;
  // Vercel-specific options (matches registerOTel API)
  instrumentations?: any[];
  propagateContextUrls?: (RegExp | string)[];

  resourceAttributes?: Record<string, boolean | number | string>;
  serviceName: string;

  serviceVersion?: string;
  traceExporter?: any; // Custom exporter or 'auto' for Vercel's collector
  useVercelOTel?: boolean; // Default true for better edge compatibility
}

export class VercelOTelProvider implements ObservabilityProvider {
  readonly name = 'vercel-otel';
  private activeSpans = new Map<string, any>();
  private api: any = null;
  private config: null | VercelOTelConfig = null;
  private isInitialized = false;
  private tracer: any = null;

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized || !this.tracer) return;

    const activeSpan = this.api?.trace?.getActiveSpan?.();
    if (activeSpan) {
      activeSpan.addEvent('breadcrumb', {
        category: breadcrumb.category,
        level: breadcrumb.level,
        message: breadcrumb.message,
        type: breadcrumb.type,
        ...(breadcrumb.data || {}),
      });
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized || !this.tracer) return;

    const span = this.tracer.startSpan(`exception:${error.name}`, {
      attributes: {
        '(error as Error)?.message || "Unknown error"':
          (error as Error)?.message || 'Unknown error',
        'error.stack': error.stack,
        'error.type': error.name,
        ...(context?.tags && this.flattenTags(context.tags)),
        ...(context?.userId && { 'user.id': context.userId }),
        ...(context?.organizationId && { 'organization.id': context.organizationId }),
        ...(context?.requestId && { 'request.id': context.requestId }),
        ...(context?.sessionId && { 'session.id': context.sessionId }),
      },
      kind: 1, // SpanKind.INTERNAL
    });

    // Record the exception
    span.recordException(error);
    span.setStatus({ code: 2, message: (error as Error)?.message || 'Unknown error' }); // ERROR status

    // Add extra data as events
    if (context?.extra) {
      span.addEvent('exception.context', context.extra);
    }

    span.end();
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized || !this.tracer) return;

    const span = this.tracer.startSpan(`message:${level}`, {
      attributes: {
        'message.content': message,
        'message.level': level,
        ...(context?.tags && this.flattenTags(context.tags)),
        ...(context?.userId && { 'user.id': context.userId }),
        ...(context?.organizationId && { 'organization.id': context.organizationId }),
        ...(context?.requestId && { 'request.id': context.requestId }),
      },
      kind: 1, // SpanKind.INTERNAL
    });

    // Add message as an event
    span.addEvent('message', {
      level,
      message,
      ...(context?.extra || {}),
    });

    span.end();
  }

  endSession(): void {
    if (!this.isInitialized || !this.tracer) return;
    const span = this.tracer.startSpan('session.end');
    span.addEvent('session.ended');
    span.end();
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const vercelConfig = config as VercelOTelConfig;
    this.config = vercelConfig;

    if (!vercelConfig.serviceName) {
      if (this.config?.debug) {
        console.info('[Vercel OTel] No service name provided, skipping initialization');
      }
      return;
    }

    try {
      // Check if OpenTelemetry dependencies are available
      await this.checkDependencies();

      // Check if we're in a Vercel environment or if explicitly requested
      const isVercelEnv = process.env.VERCEL_ENV || vercelConfig.useVercelOTel !== false;
      const isEdgeRuntime = process.env.NEXT_RUNTIME === 'edge';

      if (isVercelEnv || isEdgeRuntime) {
        // Use Vercel's OTel package for better compatibility
        await this.initializeVercelOTel(vercelConfig);
      } else {
        // Use standard OpenTelemetry SDK for Node.js environments
        await this.initializeStandardOTel(vercelConfig);
      }

      this.isInitialized = true;
      if (this.config?.debug) {
        console.info(
          `[Vercel OTel] Initialized successfully with service: ${vercelConfig.serviceName}`,
        );
      }
    } catch (error: any) {
      // If dependencies are missing, silently skip instead of throwing
      if (
        (error instanceof Error && (error as Error)?.message) ||
        'Unknown error'.includes('Cannot resolve module')
      ) {
        if (this.config?.debug) {
          console.info(
            '[Vercel OTel] OpenTelemetry dependencies not found, skipping initialization',
          );
        }
        return;
      }
      if (this.config?.debug) {
        console.error('[Vercel OTel] Failed to initialize: ', error);
      }
      throw error;
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isInitialized || !this.tracer) return;

    const span = this.tracer.startSpan(`log:${level}`);
    span.addEvent('log', {
      level,
      message,
      ...(metadata || {}),
    });
    span.end();
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.tracer) return;

    const activeSpan = this.api?.trace?.getActiveSpan?.();
    if (activeSpan) {
      const flatContext = this.flattenObject(context, `context.${key}`);
      activeSpan.setAttributes(flatContext);
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.tracer) return;

    const activeSpan = this.api?.trace?.getActiveSpan?.();
    if (activeSpan) {
      activeSpan.setAttributes({ [`extra.${key}`]: JSON.stringify(value) });
    }
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized || !this.tracer) return;

    const activeSpan = this.api?.trace?.getActiveSpan?.();
    if (activeSpan) {
      activeSpan.setAttributes({ [key]: value });
    }
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized || !this.tracer) return;

    // Set user context on active span
    const activeSpan = this.api?.trace?.getActiveSpan?.();
    if (activeSpan) {
      activeSpan.setAttributes({
        'user.id': user.id,
        ...(user.email && { 'user.email': user.email }),
        ...(user.username && { 'user.username': user.username }),
      });
    }
  }

  startSession(): void {
    if (!this.isInitialized || !this.tracer) return;
    // Sessions are typically handled at the application level in OpenTelemetry
    const span = this.tracer.startSpan('session.start');
    span.addEvent('session.started');
    span.end();
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.isInitialized || !this.tracer) return null;

    // Create context from parent span if provided
    let context;
    if (parentSpan && typeof parentSpan === 'object' && parentSpan.spanContext && this.api) {
      context = this.api.trace.setSpan(this.api.trace.context.active(), parentSpan);
    }

    const span = this.tracer.startSpan(
      name,
      {
        kind: 1, // SpanKind.INTERNAL
      },
      context,
    );

    const spanId = `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeSpans.set(spanId, span);

    return {
      addEvent: (name: string, attributes?: Record<string, any>) => {
        span.addEvent(name, attributes);
      },
      finish: () => {
        span.end();
        this.activeSpans.delete(spanId);
      },
      id: spanId,
      setAttribute: (key: string, value: any) => {
        span.setAttributes({ [key]: value });
      },
      setStatus: (status: string) => {
        const statusCode = status === 'ok' ? 1 : status === 'error' ? 2 : 0;
        span.setStatus({ code: statusCode, message: status });
      },
    };
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.tracer) return null;

    const span = this.tracer.startSpan(name, {
      attributes: {
        'operation.name': name,
        ...(context?.tags && this.flattenTags(context.tags)),
        ...(context?.userId && { 'user.id': context.userId }),
        ...(context?.organizationId && { 'organization.id': context.organizationId }),
        ...(context?.requestId && { 'request.id': context.requestId }),
      },
      kind: 2, // SpanKind.SERVER
    });

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeSpans.set(transactionId, span);

    return {
      finish: () => {
        span.end();
        this.activeSpans.delete(transactionId);
      },
      id: transactionId,
      setData: (key: string, value: any) => {
        span.setAttributes({ [`data.${key}`]: JSON.stringify(value) });
      },
      setHttpStatus: (code: number) => {
        span.setAttributes({ 'http.status_code': code });
        span.setStatus({ code: code >= 400 ? 2 : 1 });
      },
      setStatus: (status: string) => {
        const statusCode = status === 'ok' ? 1 : status === 'error' ? 2 : 0;
        span.setStatus({ code: statusCode, message: status });
      },
      setTag: (key: string, value: boolean | number | string) => {
        span.setAttributes({ [key]: value });
      },
      startChild: (operation: string, description?: string) => {
        return this.startSpan(description || operation, span);
      },
    };
  }

  private async checkDependencies(): Promise<void> {
    // Skip dependency check in browser/edge runtime
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('OpenTelemetry is not supported in browser/edge runtime');
    }

    try {
      // Try to import OpenTelemetry API to check if it's available
      await import('@opentelemetry/api' as any);
    } catch (error: any) {
      throw new Error(
        'Cannot resolve module @opentelemetry/api - OpenTelemetry dependencies not available',
      );
    }
  }

  private flattenObject(obj: Record<string, any>, prefix: string): Record<string, any> {
    const flattened: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const flatKey = `${prefix}.${key}`;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, flatKey));
      } else {
        flattened[flatKey] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }
    return flattened;
  }

  private flattenTags(tags: Record<string, boolean | number | string>): Record<string, any> {
    const flattened: Record<string, any> = {};
    for (const [key, value] of Object.entries(tags)) {
      flattened[`tag.${key}`] = value;
    }
    return flattened;
  }

  private async initializeStandardOTel(config: VercelOTelConfig): Promise<void> {
    // Skip initialization in browser/edge runtime
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('Standard OpenTelemetry is not supported in browser/edge runtime');
    }

    // Dynamically import OpenTelemetry packages
    const nodeSDKModule = (await import('@opentelemetry/sdk-node' as any)) as any;
    const resourceModule = (await import('@opentelemetry/resources' as any)) as any;
    const semanticConventions = (await import('@opentelemetry/semantic-conventions' as any)) as any;
    const otelAPI = (await import('@opentelemetry/api' as any)) as any;
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

    this.api = otelAPI;
    this.tracer = otelAPI.trace.getTracer(config.serviceName, config.serviceVersion);
  }

  private async initializeVercelOTel(config: VercelOTelConfig): Promise<void> {
    // Skip initialization in browser/edge runtime
    if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('Vercel OpenTelemetry is not supported in browser/edge runtime');
    }

    try {
      // Dynamically import Vercel OTel to avoid bundling if not used
      const vercelOTel = (await import('@vercel/otel' as any)) as any;
      const otelAPI = (await import('@opentelemetry/api' as any)) as any;

      // Build registerOTel configuration following Vercel's recommended API
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
        // Use Vercel's auto-configuration (recommended)
        registerConfig.traceExporter = 'auto';
      }

      // Initialize Vercel OTel
      vercelOTel.registerOTel(registerConfig);

      this.api = otelAPI;
      this.tracer = otelAPI.trace.getTracer(config.serviceName, config.serviceVersion);
    } catch (error: any) {
      if (this.config?.debug) {
        console.warn('[Vercel OTel] Vercel OTel not available, falling back to standard OTel');
      }
      await this.initializeStandardOTel(config);
    }
  }
}
