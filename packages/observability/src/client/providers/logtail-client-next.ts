/**
 * Logtail/BetterStack provider for Next.js client-side
 * Uses @logtail/next for Next.js-optimized browser logging
 */

import { safeEnv } from '../../../env';
import { LogtailConfig } from '../../shared/types/logtail-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';

export class LogtailClientNextProvider implements ObservabilityProvider {
  readonly name = 'logtail';
  private config: LogtailConfig = {} as LogtailConfig;
  private isDevelopment = safeEnv().NEXT_PUBLIC_NODE_ENV !== 'production';
  private isInitialized = false;
  private logQueue: Array<{ level: string; message: string; metadata?: any }> = [];

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized) return;

    // Log breadcrumb as a debug entry
    this.log('debug', 'Breadcrumb', {
      breadcrumb: {
        category: breadcrumb.category,
        data: breadcrumb.data,
        level: breadcrumb.level,
        message: breadcrumb.message,
        timestamp: breadcrumb.timestamp || Date.now(),
        type: breadcrumb.type,
      },
    });
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized) return;

    const errorData = {
      error: {
        message: (error as Error)?.message || 'Unknown error',
        name: error.name,
        stack: error.stack,
      },
      level: context?.level || 'error',
      ...this.buildContext(context),
    };

    // For client-side Next.js, we'll use console in development
    if (this.isDevelopment || !this.config.sourceToken) {
      throw new Error(`Exception captured: ${JSON.stringify(errorData)}`);
    } else {
      // Queue for sending via Logger when available
      this.logQueue.push({ level: 'error', message: 'Exception captured', metadata: errorData });
    }
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized) return;

    const messageData = {
      level,
      ...this.buildContext(context),
    };

    if (this.isDevelopment || !this.config.sourceToken) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info';
      console[consoleMethod](message, messageData);
    } else {
      this.logQueue.push({ level, message, metadata: messageData });
    }
  }

  endSession(): void {
    if (!this.isInitialized) return;

    this.log('info', 'Session ended', {
      timestamp: Date.now(),
    });
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    this.config = config as LogtailConfig;

    // In development, only use console unless explicitly configured
    if (this.isDevelopment && !this.config.sourceToken) {
      console.warn('[Logtail] No source token provided, using console fallback in development');
      this.isInitialized = true;
      return;
    }

    if (!this.config.sourceToken) {
      console.warn('[Logtail] No source token provided for production');
    }

    this.isInitialized = true;

    // Process any queued logs
    if (this.logQueue.length > 0 && typeof window !== 'undefined') {
      // In a real implementation, we would use the useLogger hook or Logger instance
      // For now, just log to console
      this.logQueue.forEach(({ level, message, metadata }) => {
        const consoleMethod =
          level === 'error'
            ? 'error'
            : level === 'warning'
              ? 'warn'
              : level === 'debug'
                ? 'debug'
                : 'info';
        console[consoleMethod](`[Logtail] ${message}`, metadata);
      });
      this.logQueue = [];
    }
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    if (!this.isInitialized) return;

    if (this.isDevelopment || !this.config.sourceToken) {
      const consoleMethod =
        level === 'error'
          ? 'error'
          : level === 'warning' || level === 'warn'
            ? 'warn'
            : level === 'debug' || level === 'trace'
              ? 'debug'
              : 'info';
      console[consoleMethod](`[${level.toUpperCase()}]`, message, metadata);
      return;
    }

    // Queue logs for processing
    this.logQueue.push({ level, message, metadata });
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized) return;

    // Store context in session storage for browser persistence
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const contexts = JSON.parse(sessionStorage.getItem('logtail_contexts') || '{}');
      contexts[key] = context;
      sessionStorage.setItem('logtail_contexts', JSON.stringify(contexts));
    }
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized) return;

    // Store extra data in session storage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const extras = JSON.parse(sessionStorage.getItem('logtail_extras') || '{}');
      extras[key] = value;
      sessionStorage.setItem('logtail_extras', JSON.stringify(extras));
    }
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized) return;

    // Store tags in session storage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const tags = JSON.parse(sessionStorage.getItem('logtail_tags') || '{}');
      tags[key] = value;
      sessionStorage.setItem('logtail_tags', JSON.stringify(tags));
    }
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized) return;

    // Store user info in session storage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem('logtail_user', JSON.stringify(user));
    }
  }

  startSession(): void {
    if (!this.isInitialized) return;

    this.log('info', 'Session started', {
      sessionId: this.generateId(),
      timestamp: Date.now(),
    });
  }

  startSpan(_name: string, _parentSpan?: any): any {
    // Logtail doesn't support spans, return a no-op
    return null;
  }

  startTransaction(name: string, context?: ObservabilityContext): any {
    if (!this.isInitialized) return null;

    const transactionId = this.generateId();
    const startTime = Date.now();

    // Log transaction start
    this.log('info', `Transaction started: ${name}`, {
      transactionId,
      transactionName: name,
      ...this.buildContext(context),
    });

    return {
      finish: () => {
        const duration = Date.now() - startTime;
        this.log('info', `Transaction completed: ${name}`, {
          duration,
          durationUnit: 'ms',
          transactionId,
          transactionName: name,
        });
      },
    };
  }

  // Helper methods
  private buildContext(context?: ObservabilityContext): Record<string, any> {
    if (!context) return {};

    return {
      environment: context.environment,
      extra: context.extra,
      organizationId: context.organizationId,
      platform: context.platform,
      release: context.release,
      requestId: context.requestId,
      serverName: context.serverName,
      sessionId: context.sessionId,
      spanId: context.spanId,
      tags: context.tags,
      traceId: context.traceId,
      transaction: context.transaction,
      userId: context.userId,
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
