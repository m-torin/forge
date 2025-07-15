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
      // Check if Sentry is available globally (initialized via instrumentation-client.ts)
      // @ts-ignore - Global Sentry might not be typed
      const Sentry = globalThis.Sentry || window.Sentry;

      if (!Sentry) {
        if (Environment.isDevelopment()) {
          console.warn(
            '[Sentry] Global Sentry instance not found. Please initialize Sentry via instrumentation-client.ts',
          );
        }
        return;
      }

      // Sentry should already be initialized via instrumentation-client.ts
      // We just need to store the global instance for our provider methods
      // No need to call Sentry.init() again as it would overwrite the existing config

      this.client = Sentry;
      this.isInitialized = true;
    } catch (error: any) {
      throw new Error(`Failed to initialize Sentry: ${error}`);
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

    // Use the modern startSpan API
    return this.client.startSpan({
      name,
      op: name,
      ...(parentSpan && { parentSpan }),
    });
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized || !this.client) return null;

    // Use the modern startSpan API
    return this.client.startSpan(
      {
        name,
        op: context?.operation || 'navigation',
        attributes: {
          ...(context?.tags || {}),
          ...(context?.extra || {}),
        },
      },
      (span: any) => {
        // Return a wrapper that mimics the old transaction API
        return {
          finish: () => span.end(),
          setData: (key: string, value: any) => span.setAttribute(key, value),
          setStatus: (status: string) => span.setStatus({ code: status === 'ok' ? 0 : 2 }),
          setTag: (key: string, value: string) => span.setAttribute(key, value),
          startChild: (op: string, description?: string) => {
            return this.client.startSpan({
              name: description || op,
              op,
              parentSpan: span,
            });
          },
        };
      },
    );
  }
}
