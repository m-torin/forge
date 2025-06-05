/**
 * Sentry server-side provider
 */

import type { 
  ObservabilityProvider, 
  ObservabilityProviderConfig, 
  ObservabilityContext,
  Breadcrumb
} from '../../shared/types/types';
import type { SentryConfig } from '../../shared/types/sentry-types';

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
        
        // Sampling rates
        tracesSampleRate: sentryConfig.tracesSampleRate ?? 1,
        profilesSampleRate: sentryConfig.profilesSampleRate ?? 0.1,
        
        // Debug mode
        debug: sentryConfig.debug ?? false,
        
        // Integrations
        integrations: [
          // Default integrations
          Sentry.httpIntegration(),
          Sentry.nativeNodeFetchIntegration(),
          ...(sentryConfig.integrations || [])
        ],
        
        // Callbacks
        beforeSend: sentryConfig.beforeSend,
        beforeSendTransaction: sentryConfig.beforeSendTransaction,
        
        // Additional options from config
        ...(sentryConfig.options || {})
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

  async captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ObservabilityContext): Promise<void> {
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
      op: context?.operation || 'http.server',
      tags: context?.tags,
      data: context?.extra,
      traceId: context?.traceId,
      parentSpanId: context?.spanId
    });

    // Set transaction on scope for child spans
    this.client.getCurrentScope().setSpan(transaction);
    
    return {
      finish: () => transaction.finish(),
      setTag: (key: string, value: string) => transaction.setTag(key, value),
      setData: (key: string, value: any) => transaction.setData(key, value),
      setHttpStatus: (code: number) => transaction.setHttpStatus(code),
      setStatus: (status: string) => transaction.setStatus(status),
      startChild: (op: string, description?: string) => 
        transaction.startChild({ op, description })
    };
  }

  startSpan(name: string, parentSpan?: any): any {
    if (!this.isInitialized || !this.client) return null;

    if (parentSpan?.startChild) {
      return parentSpan.startChild({
        op: name,
        description: name
      });
    }

    // If no parent, create a new transaction
    return this.startTransaction(name);
  }

  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isInitialized || !this.client) return;
    
    const { id, email, username, ip_address, ...rest } = user;
    this.client.setUser({
      id,
      email,
      username,
      ip_address,
      ...rest
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
      timestamp: breadcrumb.timestamp ? breadcrumb.timestamp / 1000 : undefined,
      type: breadcrumb.type || 'default',
      category: breadcrumb.category,
      message: breadcrumb.message,
      data: breadcrumb.data,
      level: breadcrumb.level || 'info'
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