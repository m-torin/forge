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

      // Build integrations array
      const integrations = [];

      // Browser tracing integration
      if (sentryConfig.browserTracingEnabled) {
        integrations.push(
          Sentry.browserTracingIntegration({
            // Automatically start page loads and navigation transactions
          }),
        );
      }

      // Replay integration
      if (sentryConfig.replaysSessionSampleRate || sentryConfig.replaysOnErrorSampleRate) {
        integrations.push(
          Sentry.replayIntegration({
            blockAllMedia: sentryConfig.replayBlockAllMedia ?? true,
            maskAllText: sentryConfig.replayMaskAllText ?? true,
          }),
        );
      }

      // Feedback integration
      if (sentryConfig.feedbackEnabled) {
        integrations.push(
          Sentry.feedbackIntegration({
            colorScheme: 'system',
          }),
        );
      }

      // Logging integration (for _experiments.enableLogs)
      if (sentryConfig.loggingEnabled || sentryConfig._experiments?.enableLogs) {
        integrations.push(
          Sentry.consoleLoggingIntegration({
            levels: ['log', 'info', 'warn', 'error', 'debug'],
          }),
        );
      }

      // Add any custom integrations
      if (Array.isArray(sentryConfig.integrations)) {
        integrations.push(...sentryConfig.integrations.filter((i: any) => typeof i !== 'string'));
      }

      // Default ignored errors for client-side
      const defaultIgnoreErrors = [
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        'Non-Error promise rejection captured',
        /^Non-Error/,
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        'The operation was aborted',
        'cancelled',
        'AbortError',
      ];

      // Default ignored transactions
      const defaultIgnoreTransactions = [
        '/health',
        '/ping',
        '/_next',
        '/api/health',
        '/api/ping',
        '/favicon.ico',
      ];

      // Merge configuration with sensible defaults
      const finalConfig = {
        // Core configuration
        dsn: sentryConfig.dsn,
        environment: sentryConfig.environment || process.env.NODE_ENV || 'production',
        release: sentryConfig.release,
        debug: sentryConfig.debug ?? false,
        enabled: sentryConfig.enabled ?? true,

        // User privacy
        sendDefaultPii: sentryConfig.sendDefaultPii ?? false,

        // Core options with defaults
        maxBreadcrumbs: sentryConfig.maxBreadcrumbs ?? 100,
        attachStacktrace: sentryConfig.attachStacktrace ?? true,
        maxValueLength: sentryConfig.maxValueLength ?? 250,
        normalizeDepth: sentryConfig.normalizeDepth ?? 3,
        normalizeMaxBreadth: sentryConfig.normalizeMaxBreadth ?? 1000,
        sendClientReports: sentryConfig.sendClientReports ?? true,

        // Error monitoring with defaults
        sampleRate: sentryConfig.sampleRate ?? 1.0, // Capture all errors by default
        ignoreErrors: [...defaultIgnoreErrors, ...(sentryConfig.ignoreErrors || [])],
        denyUrls: sentryConfig.denyUrls || [],
        allowUrls: sentryConfig.allowUrls || [],

        // Tracing with defaults
        tracesSampleRate:
          sentryConfig.tracesSampleRate ?? (process.env.NODE_ENV === 'production' ? 0.1 : 1.0),
        tracesSampler: sentryConfig.tracesSampler,
        tracePropagationTargets: sentryConfig.tracePropagationTargets || [
          'localhost',
          /^\//, // Same origin
        ],
        ignoreTransactions: [
          ...defaultIgnoreTransactions,
          ...(sentryConfig.ignoreTransactions || []),
        ],

        // Session replay
        replaysSessionSampleRate: sentryConfig.replaysSessionSampleRate ?? 0.1,
        replaysOnErrorSampleRate: sentryConfig.replaysOnErrorSampleRate ?? 1.0,

        // Profiling
        profilesSampleRate: sentryConfig.profilesSampleRate,

        // Callbacks
        beforeSend: sentryConfig.beforeSend,
        beforeSendTransaction: sentryConfig.beforeSendTransaction,
        beforeSendSpan: sentryConfig.beforeSendSpan,
        beforeBreadcrumb: sentryConfig.beforeBreadcrumb,

        // Transport options
        tunnel: sentryConfig.tunnel,
        transport: sentryConfig.transport,
        transportOptions: sentryConfig.transportOptions,

        // Integrations (already built above)
        integrations,
        defaultIntegrations: sentryConfig.defaultIntegrations,

        // Initial scope
        initialScope: sentryConfig.initialScope,

        // Experimental features
        _experiments: sentryConfig._experiments,

        // Additional options from config
        ...(sentryConfig.options || {}),
      };

      // Initialize with merged configuration
      Sentry.init(finalConfig);

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
