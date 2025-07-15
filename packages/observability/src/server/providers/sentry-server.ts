/**
 * Sentry server-side provider
 */

import { safeEnv } from '../../../env';
import { SentryConfig } from '../../shared/types/sentry-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class SentryServerProvider implements ObservabilityProvider {
  readonly name = 'sentry-server';
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
        if (context.requestId) {
          scope.setTag('request_id', context.requestId);
        }
        if (context.sessionId) {
          scope.setTag('session_id', context.sessionId);
        }

        // Server-specific context
        if (context.organizationId) {
          scope.setTag('organization_id', context.organizationId);
        }
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
        if (context.requestId) {
          scope.setTag('request_id', context.requestId);
        }
        if (context.organizationId) {
          scope.setTag('organization_id', context.organizationId);
        }
      }

      this.client.captureMessage(message, sentryLevel);
    });
  }

  endSession(): void {
    if (!this.isInitialized || !this.client) return;
    // Sessions are handled automatically in Node.js
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const sentryConfig = config as SentryConfig;

    const env = safeEnv();

    if (!sentryConfig.dsn) {
      // Silently skip initialization if no DSN is provided
      if (env.NODE_ENV === 'development') {
        console.info('[Sentry] No DSN provided, skipping initialization');
      }
      return;
    }

    try {
      // Check if Sentry is available globally (initialized via instrumentation.ts)
      // @ts-ignore - Global Sentry might not be typed
      const Sentry = globalThis.Sentry;

      if (!Sentry) {
        if (env.NODE_ENV === 'development') {
          console.warn(
            '[Sentry] Global Sentry instance not found. Please initialize Sentry via instrumentation.ts',
          );
        }
        return;
      }

      // Sentry should already be initialized via instrumentation.ts
      // We just need to store the global instance for our provider methods
      // No need to call Sentry.init() again as it would overwrite the existing config

      this.client = Sentry;
      this.isInitialized = true;
    } catch (error: any) {
      if (env.NODE_ENV === 'development') {
        throw new Error(`Failed to initialize Sentry: ${error}`);
      }
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

    const { email, id, ip_address, username, ...rest } = user;
    this.client.setUser({
      email,
      id,
      ip_address,
      username,
      ...rest,
    });
  }

  startSession(): void {
    if (!this.isInitialized || !this.client) return;
    // Sessions are handled automatically in Node.js
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
}
