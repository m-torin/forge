/**
 * OpenTelemetry provider for distributed tracing and observability
 * Server-side implementation with Node.js SDK
 */

import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
import { Environment, Runtime } from '../../shared/utils/environment';

interface OpenTelemetryConfig extends ObservabilityProviderConfig {
  endpoint?: string;
  serviceName?: string;
  serviceVersion?: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export class OpenTelemetryProvider implements ObservabilityProvider {
  readonly name = 'opentelemetry';
  private isInitialized = false;
  private sdk: any;
  private tracer: any;
  private config: OpenTelemetryConfig = {};
  private activeSpans = new Map<string, any>();

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const span = this.tracer.startSpan('exception');
      span.recordException(error);
      span.setStatus({ code: 2, message: (error as Error)?.message || 'Unknown error' }); // ERROR status

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]: [string, any]) => {
          span.setAttributes({ [key]: value });
        });
      }

      if (context?.extra) {
        span.setAttributes({ 'exception.extra': JSON.stringify(context.extra).slice(0, 1000) });
      }

      span.end();
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to capture exception: ', error);
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const span = this.tracer.startSpan('log_message');
      span.setAttributes({
        'log.level': level,
        'log.message': message,
        'log.timestamp': new Date().toISOString(),
      });

      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]: [string, any]) => {
          span.setAttributes({ [key]: value });
        });
      }

      span.end();
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to capture message: ', error);
    }
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    if (this.isInitialized) return;

    this.config = {
      serviceName: 'observability-app',
      serviceVersion: '1.0.0',
      timeout: 5000,
      ...config,
    } as OpenTelemetryConfig;

    try {
      // Only initialize in Node.js environment
      if (Runtime.isEdge()) {
        throw new Error('OpenTelemetry not supported in Edge runtime');
      }

      // Dynamic import for ESM compliance
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const resourceModule = await import('@opentelemetry/resources');
      const Resource = (resourceModule as any).Resource || resourceModule.default;
      const { SemanticResourceAttributes } = await import('@opentelemetry/semantic-conventions');
      const { getNodeAutoInstrumentations } = await import(
        '@opentelemetry/auto-instrumentations-node'
      );
      const { trace } = await import('@opentelemetry/api');

      // Create resource with service information
      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.config.serviceName!,
        [SemanticResourceAttributes.SERVICE_VERSION]: this.config.serviceVersion!,
        [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.pid.toString(),
      });

      // Initialize SDK
      this.sdk = new NodeSDK({
        resource,
        instrumentations: [getNodeAutoInstrumentations()],
      });

      this.sdk.start();
      this.tracer = trace.getTracer(this.config.serviceName!, this.config.serviceVersion!);
      this.isInitialized = true;

      if (Environment.isDevelopment()) {
        console.log('[OpenTelemetry] Provider initialized successfully');
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to initialize:', error);
      // Don't throw - allow other providers to work
    }
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const span = this.tracer.startSpan('breadcrumb');
      span.setAttributes({
        'breadcrumb.category': breadcrumb.category || 'default',
        'breadcrumb.message': breadcrumb.message || '',
        'breadcrumb.level': breadcrumb.level || 'info',
        'breadcrumb.timestamp': breadcrumb.timestamp || Date.now(),
      });

      if (breadcrumb.data) {
        span.setAttributes({
          'breadcrumb.data': JSON.stringify(breadcrumb.data).slice(0, 1000),
        });
      }

      span.end();
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to add breadcrumb: ', error);
    }
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.isInitialized || !this.tracer) return null;

    try {
      const span = this.tracer.startSpan(name, {
        parent: parentSpan,
        startTime: Date.now(),
      });

      const spanId = `${name}-${Date.now()}`;
      this.activeSpans.set(spanId, span);

      return {
        id: spanId,
        finish: () => {
          try {
            span.end();
            this.activeSpans.delete(spanId);
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to finish span: ', error);
          }
        },
        setAttributes: (attributes: Record<string, any>) => {
          try {
            span.setAttributes(attributes);
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to set span attributes: ', error);
          }
        },
        recordException: (error: Error) => {
          try {
            span.recordException(error);
            span.setStatus({ code: 2, message: (error as Error)?.message || 'Unknown error' });
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to record exception on span: ', error);
          }
        },
      };
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to start span:', error);
      return null;
    }
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.tracer) return null;

    try {
      const span = this.tracer.startSpan(name, {
        startTime: Date.now(),
        attributes: {
          'transaction.name': name,
          'transaction.type': 'transaction',
        },
      });

      if (context?.tags) {
        span.setAttributes(context.tags);
      }

      const transactionId = `transaction-${name}-${Date.now()}`;
      this.activeSpans.set(transactionId, span);

      return {
        id: transactionId,
        finish: () => {
          try {
            span.end();
            this.activeSpans.delete(transactionId);
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to finish transaction: ', error);
          }
        },
        setContext: (contextData: Record<string, any>) => {
          try {
            span.setAttributes(contextData);
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to set transaction context: ', error);
          }
        },
        setUser: (user: { id: string; [key: string]: any }) => {
          try {
            span.setAttributes({
              'user.id': user.id,
              'user.data': JSON.stringify(user).slice(0, 500),
            });
          } catch (error: any) {
            console.error('[OpenTelemetry] Failed to set transaction user: ', error);
          }
        },
      };
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to start transaction:', error);
      return null;
    }
  }

  setUser(user: { id: string; [key: string]: any }): void {
    if (!this.isInitialized || !this.tracer) return;

    try {
      // Set user context on current active span if available
      const activeSpan = this.tracer.getActiveSpan();
      if (activeSpan) {
        activeSpan.setAttributes({
          'user.id': user.id,
          'user.email': user.email || '',
          'user.username': user.username || '',
        });
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to set user: ', error);
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const activeSpan = this.tracer.getActiveSpan();
      if (activeSpan) {
        activeSpan.setAttributes({
          [`context.${key}`]: JSON.stringify(context).slice(0, 1000),
        });
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to set context: ', error);
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const activeSpan = this.tracer.getActiveSpan();
      if (activeSpan) {
        activeSpan.setAttributes({
          [`extra.${key}`]:
            typeof value === 'string' ? value : JSON.stringify(value).slice(0, 1000),
        });
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to set extra: ', error);
    }
  }

  setTag(key: string, value: string | number | boolean): void {
    if (!this.isInitialized || !this.tracer) return;

    try {
      const activeSpan = this.tracer.getActiveSpan();
      if (activeSpan) {
        activeSpan.setAttributes({ [key]: value });
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to set tag: ', error);
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    return this.captureMessage(message, level as 'error' | 'info' | 'warning', { extra: metadata });
  }

  endSession(): void {
    if (!this.isInitialized) return;

    try {
      // Finish all active spans
      for (const [spanId, span] of this.activeSpans) {
        try {
          span.end();
        } catch (error: any) {
          console.error(`[OpenTelemetry] Failed to end span ${spanId}: `, error);
        }
      }
      this.activeSpans.clear();

      // Shutdown SDK
      if (this.sdk?.shutdown) {
        this.sdk.shutdown();
      }
    } catch (error: any) {
      console.error('[OpenTelemetry] Failed to end session: ', error);
    }
  }

  startSession(): void {
    // OpenTelemetry doesn't have explicit session management
    // Sessions are managed through spans and traces
    if (Environment.isDevelopment()) {
      console.log('[OpenTelemetry] Session started (spans will be tracked)');
    }
  }
}
