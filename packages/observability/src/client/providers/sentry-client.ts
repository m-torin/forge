/**
 * Sentry client-side provider
 */

import type { SentryConfig } from '../../shared/types/sentry-types';
import type {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class SentryClientProvider implements ObservabilityProvider {
  readonly name = 'sentry-client';
  private client: any;
  private isInitialized = false;

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const sentryConfig = config as SentryConfig;

    if (!sentryConfig.dsn) {
      throw new Error('Sentry DSN is required');
    }

    try {
      // Dynamically import Sentry to avoid bundling if not used
      const Sentry = await import('@sentry/react');

      // Initialize with configuration similar to original
      Sentry.init({
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment || 'production',
        release: sentryConfig.release,

        replaysOnErrorSampleRate: 1,
        replaysSessionSampleRate: sentryConfig.profilesSampleRate ?? 0.1,
        // Sampling rates from original config
        tracesSampleRate: sentryConfig.tracesSampleRate ?? 1,

        // Debug mode
        debug: sentryConfig.debug ?? false,

        // Integrations including replay from original
        integrations: [
          Sentry.replayIntegration({
            blockAllMedia: true,
            maskAllText: true,
          }),
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
        if (context.sessionId) {
          scope.setTag('session_id', context.sessionId);
        }
        if (context.requestId) {
          scope.setTag('request_id', context.requestId);
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
      }

      this.client.captureMessage(message, sentryLevel);
    });
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.client) return null;

    const transaction = this.client.startTransaction({
      name,
      data: context?.extra,
      op: context?.operation || 'navigation',
      tags: context?.tags,
      ...(context?.traceId && { traceId: context.traceId }),
    });

    // Set transaction on scope for child spans
    this.client.getCurrentScope().setSpan(transaction);

    return {
      finish: () => transaction.finish(),
      setData: (key: string, value: any) => transaction.setData(key, value),
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

    const { id, username, email, ...rest } = user;
    this.client.setUser({
      id,
      username,
      email,
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
    this.client.startSession();
  }

  endSession(): void {
    if (!this.isInitialized || !this.client) return;
    this.client.endSession();
  }
}
