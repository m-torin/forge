/**
 * Sentry edge runtime provider
 * Edge-compatible implementation with HTTP transport
 */

import { SentryConfig } from '../../shared/types/sentry-types';
import {
  Breadcrumb,
  ObservabilityContext,
  ObservabilityProvider,
  ObservabilityProviderConfig,
} from '../../shared/types/types';
import { Environment, Runtime, getEnvironment } from '../../shared/utils/environment';

/**
 * Lightweight Sentry event for edge runtime
 */
interface SentryEvent {
  event_id: string;
  timestamp: number;
  platform: string;
  level: string;
  logger?: string;
  environment?: string;
  release?: string;
  dist?: string;
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  };
  breadcrumbs?: Array<{
    timestamp: number;
    category?: string;
    message?: string;
    level?: string;
    type?: string;
    data?: Record<string, any>;
  }>;
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename: string;
          function: string;
          lineno: number;
          colno: number;
        }>;
      };
    }>;
  };
  message?: {
    formatted: string;
  };
}

export class SentryEdgeProvider implements ObservabilityProvider {
  readonly name = 'sentry-edge';
  private dsn: string | null = null;
  private projectId: string | null = null;
  private publicKey: string | null = null;
  private endpoint: string | null = null;
  private config: Partial<SentryConfig> = {};
  private breadcrumbs: Breadcrumb[] = [];
  private context: Record<string, any> = {};
  private tags: Record<string, string> = {};
  private user: Record<string, any> | null = null;
  private isInitialized = false;

  /**
   * Parse DSN to extract project ID and endpoint
   */
  private parseDSN(dsn: string): void {
    try {
      const url = new URL(dsn);
      this.publicKey = url.username;
      this.projectId = url.pathname.split('/').pop() || null;
      this.endpoint = `${url.protocol}//${url.host}/api/${this.projectId}/store/`;
    } catch (error: any) {
      throw new Error(`[Sentry Edge] Invalid DSN: ${error}`);
    }
  }

  /**
   * Generate a unique event ID
   */
  private generateEventId(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  /**
   * Send event to Sentry via HTTP
   */
  private async sendEvent(event: SentryEvent): Promise<void> {
    if (!this.endpoint || !this.publicKey) {
      throw new Error('[Sentry Edge] Cannot send event: missing endpoint or key');
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': [
            'Sentry sentry_version=7',
            `sentry_client=sentry-edge/1.0.0`,
            `sentry_key=${this.publicKey}`,
          ].join(', '),
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(
          `[Sentry Edge] Failed to send event: ${response.status} - ${await response.text()}`,
        );
      }
    } catch (error: any) {
      throw new Error(`[Sentry Edge] Failed to send event: ${error}`);
    }
  }

  /**
   * Create base event with common fields
   */
  private createBaseEvent(level: string = 'error'): SentryEvent {
    return {
      event_id: this.generateEventId(),
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level,
      logger: 'edge',
      environment: this.config.environment || getEnvironment(),
      release: this.config.release,
      dist: this.config.release, // Use release as dist fallback
      tags: {
        ...this.tags,
        runtime: 'edge',
      },
      extra: this.context,
      user: this.user || undefined,
      breadcrumbs: this.breadcrumbs.slice(-100).map((b: any) => ({
        timestamp: (b.timestamp || Date.now()) / 1000,
        category: b.category,
        message: b.message,
        level: b.level,
        type: b.type,
        data: b.data,
      })),
    };
  }

  /**
   * Parse error stack trace for edge runtime
   */
  private parseStackTrace(error: Error): any {
    if (!error.stack) return undefined;

    const lines = error.stack.split('\n');
    const frames: any[] = [];

    for (const line of lines) {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        frames.push({
          function: match[1],
          filename: match[2],
          lineno: parseInt(match[3], 10),
          colno: parseInt(match[4], 10),
        });
      }
    }

    return frames.length > 0 ? { frames: frames.reverse() } : undefined;
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.isInitialized) return;

    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    });

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100);
    }
  }

  async captureException(error: Error, context?: ObservabilityContext): Promise<void> {
    if (!this.isInitialized) return;

    const event = this.createBaseEvent('error');

    // Add exception details
    event.exception = {
      values: [
        {
          type: error.name || 'Error',
          value: (error as Error)?.message || 'Unknown error',
          stacktrace: this.parseStackTrace(error),
        },
      ],
    };

    // Apply context
    if (context) {
      if (context.tags) {
        event.tags = {
          ...event.tags,
          ...Object.fromEntries(Object.entries(context.tags).map(([k, v]: any) => [k, String(v)])),
        };
      }
      if (context.extra) {
        event.extra = { ...event.extra, ...context.extra };
      }
      if (context.userId) {
        event.user = { ...event.user, id: context.userId };
      }
    }

    await this.sendEvent(event);
  }

  async captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void> {
    if (!this.isInitialized) return;

    const event = this.createBaseEvent(level);

    // Add message
    event.message = {
      formatted: message,
    };

    // Apply context
    if (context) {
      if (context.tags) {
        event.tags = {
          ...event.tags,
          ...Object.fromEntries(Object.entries(context.tags).map(([k, v]: any) => [k, String(v)])),
        };
      }
      if (context.extra) {
        event.extra = { ...event.extra, ...context.extra };
      }
      if (context.userId) {
        event.user = { ...event.user, id: context.userId };
      }
    }

    await this.sendEvent(event);
  }

  endSession(): void {
    // Sessions are not supported in edge runtime
    // Clear breadcrumbs for new session
    this.breadcrumbs = [];
  }

  async initialize(config: ObservabilityProviderConfig): Promise<void> {
    const sentryConfig = config as SentryConfig;
    this.config = sentryConfig;

    if (!sentryConfig.dsn) {
      if (Environment.isDevelopment()) {
        console.info('[Sentry Edge] No DSN provided, skipping initialization');
      }
      return;
    }

    // Ensure we're in edge runtime
    if (!Runtime.isEdge()) {
      console.warn('[Sentry Edge] Not in edge runtime, consider using regular Sentry provider');
    }

    this.dsn = sentryConfig.dsn;
    this.parseDSN(sentryConfig.dsn);

    if (!this.endpoint || !this.publicKey) {
      throw new Error('[Sentry Edge] Failed to parse DSN');
    }

    this.isInitialized = true;

    if (Environment.isDevelopment()) {
      console.info('[Sentry Edge] Initialized with HTTP transport');
    }
  }

  setContext(key: string, context: Record<string, any>): void {
    if (!this.isInitialized) return;
    this.context[key] = context;
  }

  setExtra(key: string, value: any): void {
    if (!this.isInitialized) return;
    this.context[key] = value;
  }

  setTag(key: string, value: boolean | number | string): void {
    if (!this.isInitialized) return;
    this.tags[key] = String(value);
  }

  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void {
    if (!this.isInitialized) return;
    this.user = user;
  }

  startSession(): void {
    // Sessions are not fully supported in edge runtime
    // Clear state for new session
    this.breadcrumbs = [];
    this.context = {};
  }

  startSpan(name: string, _parentSpan?: any): any {
    // Limited span support in edge runtime
    // Return a minimal span object for compatibility
    const spanId = this.generateEventId();
    return {
      id: spanId,
      name,
      finish: () => {
        // In a full implementation, this would send span data
      },
      setData: (_key: string, _value: any) => {
        // Store span data locally
      },
      setHttpStatus: (_code: number) => {
        // Store HTTP status
      },
      setStatus: (_status: string) => {
        // Store span status
      },
      setTag: (_key: string, _value: string) => {
        // Store span tag
      },
      startChild: (childName: string) => this.startSpan(`${name}.${childName}`, spanId),
    };
  }

  startTransaction(name: string, _context?: ObservabilityContext): any {
    // Limited transaction support in edge runtime
    const transactionId = this.generateEventId();

    return {
      id: transactionId,
      name,
      finish: () => {
        // In a full implementation, this would send transaction data
      },
      setData: (key: string, value: any) => this.setExtra(`transaction.${key}`, value),
      setHttpStatus: (code: number) => this.setTag('http.status_code', code),
      setStatus: (status: string) => this.setTag('transaction.status', status),
      setTag: (key: string, value: string) => this.setTag(`transaction.${key}`, value),
      startChild: (op: string, _description?: string) => this.startSpan(`${name}.${op}`),
    };
  }

  async log(level: string, message: string, metadata?: any): Promise<void> {
    // Map log levels to Sentry levels
    const sentryLevel =
      level === 'debug' || level === 'trace'
        ? 'debug'
        : level === 'warn'
          ? 'warning'
          : level === 'fatal'
            ? 'fatal'
            : level === 'error'
              ? 'error'
              : 'info';

    await this.captureMessage(message, sentryLevel as any, { extra: metadata });
  }
}
