/**
 * Sentry client-side provider
 */

import { SentryConfig } from '../../shared/types/sentry-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
import { Environment } from '../../shared/utils/environment';

export class SentryClientProvider implements ObservabilityProvider {
  readonly name = 'sentry-client';
  private client: any;
  private isInitialized = false;

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized || !this.client) return;

    this.client.addBreadcrumb({
      category: breadcrumb.category,
      data: breadcrumb.data,
      level: breadcrumb.level || 'info',
      message: breadcrumb.message,
      timestamp: breadcrumb.timestamp ? breadcrumb.timestamp / 1000 : undefined,
      type: breadcrumb.type || 'default',
    });
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
          Object.entries(context.tags).forEach(([key, value]: [string, any]) => {
            scope.setTag(key, value);
          });
        }
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]: [string, any]) => {
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
    level: 'error' | 'info' | 'warning',
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
          Object.entries(context.tags).forEach(([key, value]: [string, any]) => {
            scope.setTag(key, value);
          });
        }
        if (context.extra) {
          Object.entries(context.extra).forEach(([key, value]: [string, any]) => {
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

  endSession(): void {
    if (!this.isInitialized || !this.client) return;
    this.client.endSession();
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const sentryConfig = config as SentryConfig;

    if (!sentryConfig.dsn) {
      // Silently skip initialization if no DSN is provided
      if (Environment.isDevelopment()) {
        console.info('[Sentry] No DSN provided, skipping initialization');
      }
      return;
    }

    try {
      // Dynamically import Sentry to avoid bundling if not used
      const Sentry = await import('@sentry/nextjs');

      // Initialize with configuration similar to original
      Sentry.init({
        // Callbacks
        beforeSend: sentryConfig.beforeSend,
        beforeSendTransaction: sentryConfig.beforeSendTransaction,
        dsn: sentryConfig.dsn,

        environment: sentryConfig.environment || 'production',
        // Integrations
        integrations: [
          ...(sentryConfig.integrations?.includes('replay')
            ? [
                Sentry.replayIntegration({
                  blockAllMedia: sentryConfig.replayBlockAllMedia ?? true,
                  maskAllText: sentryConfig.replayMaskAllText ?? true,
                }),
              ]
            : []),
          ...(Array.isArray(sentryConfig.integrations)
            ? sentryConfig.integrations.filter((i: any) => typeof i !== 'string')
            : []),
        ],
        release: sentryConfig.release,

        // Debug mode removed to avoid non-debug bundle conflicts

        replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate ?? 1.0,

        replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate ?? 0.1,
        // Sampling rates from config
        tracesSampleRate: sentryConfig.tracesSampleRate ?? 1,

        // Additional options from config
        ...(sentryConfig.options || {}),
      });

      this.client = Sentry;
      this.isInitialized = true;
    } catch (error: any) {
      console.error('Failed to initialize Sentry:', error);
      throw error;
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setContext(key, context);
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setExtra(key, value);
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized || !this.client) return;
    this.client.setTag(key, value);
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized || !this.client) return;

    const { email, id, username, ...rest } = user;
    this.client.setUser({
      email,
      id,
      username,
      ...rest,
    });
  }

  startSession(): void {
    if (!this.isInitialized || !this.client) return;
    this.client.startSession();
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

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.client) return null;

    const transaction = this.client.startTransaction({
      data: context?.extra,
      name,
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
}
