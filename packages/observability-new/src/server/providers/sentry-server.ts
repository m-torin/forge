/**
 * Sentry server-side provider
 */

import type { SentryConfig } from '../../shared/types/sentry-types';
import type {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class SentryServerProvider implements ObservabilityProvider {
  readonly name = 'sentry-server';
  private client: any;
  private isInitialized = false;

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const sentryConfig = config as SentryConfig;

    if (!sentryConfig.dsn) {
      throw new Error('Sentry DSN is required');
    }

    try {
      // Dynamically import Sentry to avoid bundling if not used
      const Sentry = await import('@sentry/node');

      // Initialize with configuration similar to original instrumentation.ts
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment || 'production',
        release: sentryConfig.release,

        profilesSampleRate: sentryConfig.profilesSampleRate ?? 0.1,
        // Sampling rates
        tracesSampleRate: sentryConfig.tracesSampleRate ?? 1,

        // Debug mode
        debug: sentryConfig.debug ?? false,

        // Integrations
        integrations: [
          // Default integrations
          Sentry.httpIntegration(),
          Sentry.nativeNodeFetchIntegration(),
          ...(sentryConfig.integrations || []),
        ],

        // Callbacks
        beforeSend: sentryConfig.beforeSend,
        beforeSendTransaction: sentryConfig.beforeSendTransaction,

        // Additional options from config
        ...(sentryConfig.options || {}),
      });

      this.client = Sentry;
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
      throw error;
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized || !this.client) return;

    this.client.withScope((scope: any) => {
      // Set context
      if (context) {
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        if (context.level) {
          scope.setLevel(context.level);
        }
        if (context.fingerprint) {
          scope.setFingerprint(context.fingerprint);
        }
        if (context.requestId) {
          scope.setTag('request_id', context.requestId);
        }
        if (context.sessionId) {
          scope.setTag('session_id', context.sessionId);
        }

        // Server-specific context
        if (context.serverName) {
          scope.setTag('server_name', context.serverName);
        }
        if (context.platform) {
          scope.setTag('platform', context.platform);
        }
      }

      this.client.captureException(error);
    });
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized || !this.client) return;

    const sentryLevel = level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error';

    this.client.withScope((scope: any) => {
      // Set context
      if (context) {
        if (context.userId) {
          scope.setUser({ id: context.userId });
        }
        if (context.tags) {
          Object.entries(context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]) => {
            scope.setExtra(key, value);
          });
        }
        if (context.fingerprint) {
          scope.setFingerprint(context.fingerprint);
        }
        if (context.requestId) {
          scope.setTag('request_id', context.requestId);
        }
      }

      this.client.captureMessage(message, sentryLevel);
    });
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.client) return null;

    const transaction = this.client.startTransaction({
      name,
      data: context?.extra,
      op: context?.operation || 'http.server',
      parentSpanId: context?.spanId,
      tags: context?.tags,
      traceId: context?.traceId,
    });

    // Set transaction on scope for child spans
    this.client.getCurrentScope().setSpan(transaction);

    return {
      finish: () => transaction.finish(),
      setData: (key: string, value: any) => transaction.setData(key, value),
      setHttpStatus: (code: number) => transaction.setHttpStatus(code),
      setStatus: (status: string) => transaction.setStatus(status),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
      startChild: (op: string, description?: string) => transaction.startChild({ description, op }),
    };
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.isInitialized || !this.client) return null;

    if (parentSpan?.startChild) {
      return parentSpan.startChild({
        description: name,
        op: name,
      });
    }

    // If no parent, create a new transaction
    return this.startTransaction(name);
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isInitialized || !this.client) return;

    const { id, username, email, ip_address, ...rest } = user;
    this.client.setUser({
      id,
      username,
      email,
      ip_address,
      ...rest,
    });
  }

  setTag(key: string, value: string | number | boolean): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setTag(key, value);
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setExtra(key, value);
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setContext(key, context);
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized || !this.client) return;

    this.client.addBreadcrumb({
      type: breadcrumb.type || 'default',
      category: breadcrumb.category,
      data: breadcrumb.data,
      level: breadcrumb.level || 'info',
      message: breadcrumb.message,
      timestamp: breadcrumb.timestamp ? breadcrumb.timestamp / 1000 : undefined,
    });
  }

  startSession(): void {
    if (!this.isInitialized || !this.client) return;
    // Sessions are handled automatically in Node.js
  }

  endSession(): void {
    if (!this.isInitialized || !this.client) return;
    // Sessions are handled automatically in Node.js
  }
}
