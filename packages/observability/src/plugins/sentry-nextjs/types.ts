/**
 * Type definitions for Sentry Next.js plugin
 */

import type {
  Breadcrumb,
  Context,
  Contexts,
  Event,
  EventHint,
  SeverityLevel,
  Span,
  User,
} from '@sentry/nextjs';

/**
 * Re-export common Sentry types for convenience
 */
// Define basic types for compatibility
export type Severity = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';
export type Integration = any;
export type TransactionContext = any;
export type Transaction = any;
export type CustomSamplingContext = any;
export type SpanContext = any;
export type Extra = any;
export type Extras = Record<string, any>;
export type Primitive = string | number | boolean | null | undefined;
export type Tags = Record<string, string>;
export type CaptureContext = any;

export type { Breadcrumb, Context, Contexts, Event, EventHint, SeverityLevel, Span, User };

/**
 * Next.js specific event context
 */
export interface NextJSContext extends Context {
  runtime: 'nodejs' | 'edge' | 'browser';
  isServer: boolean;
  isClient: boolean;
  isEdge: boolean;
  route?: string;
  pathname?: string;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  method?: string;
}

/**
 * Enhanced error with Next.js metadata
 */
export interface NextJSError extends Error {
  statusCode?: number;
  digest?: string;
  code?: string;
  syscall?: string;
  hostname?: string;
  port?: number;
  path?: string;
  method?: string;
}

/**
 * Server action context
 */
export interface ServerActionContext {
  name: string;
  formData?: FormData;
  headers?: Headers | Record<string, string>;
  recordResponse?: boolean;
}

/**
 * Type-safe integration names
 */
export type IntegrationName =
  | 'BrowserTracing'
  | 'Replay'
  | 'ReplayCanvas'
  | 'Feedback'
  | 'Profiling'
  | 'HttpClient'
  | 'ContextLines'
  | 'ReportingObserver'
  | 'CaptureConsole'
  | 'ExtraErrorData'
  | 'RewriteFrames'
  | 'SessionTiming'
  | 'Debug'
  | 'Dedupe'
  | 'FeatureFlags'
  | 'LaunchDarkly'
  | 'Unleash'
  | 'Custom';

/**
 * Type-safe event types
 */
export type EventType =
  | 'error'
  | 'transaction'
  | 'session'
  | 'attachment'
  | 'user_report'
  | 'profile'
  | 'replay'
  | 'check_in';

/**
 * Type-safe transaction operations
 */
export type TransactionOp =
  | 'navigation'
  | 'pageload'
  | 'http.server'
  | 'http.client'
  | 'db'
  | 'rpc'
  | 'browser'
  | 'resource'
  | 'route.render'
  | 'route.navigation'
  | 'serveraction'
  | 'middleware'
  | 'api.route';

/**
 * Type guards
 */
export const TypeGuards = {
  /**
   * Check if error is a Next.js error
   */
  isNextJSError(error: unknown): error is NextJSError {
    return error instanceof Error && ('digest' in error || 'statusCode' in error);
  },

  /**
   * Check if context is Next.js context
   */
  isNextJSContext(context: unknown): context is NextJSContext {
    return (
      typeof context === 'object' &&
      context !== null &&
      'runtime' in context &&
      typeof (context as any).runtime === 'string'
    );
  },

  /**
   * Check if running on server
   */
  isServer(): boolean {
    return typeof window === 'undefined';
  },

  /**
   * Check if running on client
   */
  isClient(): boolean {
    return typeof window !== 'undefined';
  },

  /**
   * Check if running in edge runtime
   */
  isEdgeRuntime(): boolean {
    return process.env.NEXT_RUNTIME === 'edge';
  },

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  },

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
};

/**
 * Configuration validators
 */
export const ConfigValidators = {
  /**
   * Validate DSN format
   */
  isValidDSN(dsn: string): boolean {
    try {
      const url = new URL(dsn);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  },

  /**
   * Validate sample rate
   */
  isValidSampleRate(rate: unknown): rate is number {
    return typeof rate === 'number' && rate >= 0 && rate <= 1;
  },

  /**
   * Validate integration configuration
   */
  isValidIntegration(integration: unknown): integration is Integration {
    return (
      typeof integration === 'object' &&
      integration !== null &&
      'name' in integration &&
      typeof (integration as any).name === 'string'
    );
  },

  /**
   * Validate trace propagation targets
   */
  isValidTracePropagationTargets(targets: unknown): targets is (string | RegExp)[] {
    return (
      Array.isArray(targets) &&
      targets.every(target => typeof target === 'string' || target instanceof RegExp)
    );
  },
};

/**
 * Type-safe event builder
 */
export class EventBuilder {
  private event: Partial<Event> = {
    timestamp: Date.now() / 1000,
    platform: 'javascript',
  };

  constructor(type: EventType = 'error') {
    this.event.type = type as any;
  }

  setMessage(message: string): this {
    this.event.message = message;
    return this;
  }

  setLevel(level: Severity): this {
    this.event.level = level;
    return this;
  }

  setTags(tags: Tags): this {
    this.event.tags = { ...this.event.tags, ...tags };
    return this;
  }

  setUser(user: User): this {
    this.event.user = user;
    return this;
  }

  setContext(key: string, context: Context): this {
    if (!this.event.contexts) {
      this.event.contexts = {};
    }
    this.event.contexts[key] = context;
    return this;
  }

  setExtra(key: string, value: Extra): this {
    if (!this.event.extra) {
      this.event.extra = {};
    }
    this.event.extra[key] = value;
    return this;
  }

  addBreadcrumb(breadcrumb: Breadcrumb): this {
    if (!this.event.breadcrumbs) {
      this.event.breadcrumbs = [];
    }
    this.event.breadcrumbs.push(breadcrumb);
    return this;
  }

  setException(error: Error): this {
    this.event.exception = {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: error.stack ? { frames: [] } : undefined,
        },
      ],
    };
    return this;
  }

  build(): Event {
    return this.event as Event;
  }
}

/**
 * Type-safe breadcrumb builder
 */
export class BreadcrumbBuilder {
  private breadcrumb: Partial<Breadcrumb> = {
    timestamp: Date.now() / 1000,
  };

  constructor(category: string) {
    this.breadcrumb.category = category;
  }

  setMessage(message: string): this {
    this.breadcrumb.message = message;
    return this;
  }

  setLevel(level: Severity): this {
    this.breadcrumb.level = level;
    return this;
  }

  setType(type: string): this {
    this.breadcrumb.type = type;
    return this;
  }

  setData(data: Record<string, any>): this {
    this.breadcrumb.data = data;
    return this;
  }

  build(): Breadcrumb {
    return this.breadcrumb as Breadcrumb;
  }
}

/**
 * Type-safe transaction builder
 */
export class TransactionBuilder {
  private transaction: Partial<TransactionContext> = {
    op: 'navigation',
  };

  constructor(name: string) {
    this.transaction.name = name;
  }

  setOp(op: TransactionOp): this {
    this.transaction.op = op;
    return this;
  }

  setTags(tags: Tags): this {
    this.transaction.tags = { ...this.transaction.tags, ...tags };
    return this;
  }

  setData(data: Record<string, any>): this {
    this.transaction.data = data;
    return this;
  }

  setStatus(status: string): this {
    this.transaction.status = status;
    return this;
  }

  build(): TransactionContext {
    return this.transaction as TransactionContext;
  }
}

/**
 * Utility type for deep partial
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Utility type for strict event handlers
 */
export type StrictEventHandler<T = void> = (
  error: Error,
  eventHint: EventHint,
  originalException: unknown,
) => T;

/**
 * Utility type for async event handlers
 */
export type AsyncEventHandler<T = void> = (
  error: Error,
  eventHint: EventHint,
  originalException: unknown,
) => Promise<T>;

/**
 * Next.js specific Sentry options
 */
export interface NextJSSentryOptions {
  // Next.js specific options
  tunnelRoute?: boolean | string;
  automaticVercelMonitors?: boolean;
  widenClientFileUpload?: boolean;
  disableLogger?: boolean;
  hideSourceMaps?: boolean;

  // Enhanced options
  enableTracing?: boolean;
  enableReplay?: boolean;
  enableFeedback?: boolean;
  enableProfiling?: boolean;
  enableCanvasRecording?: boolean;

  // Feature flags
  featureFlags?: {
    provider?: 'launchdarkly' | 'unleash' | 'custom';
    config?: any;
  };

  // Custom integrations
  customIntegrations?: Integration[];
}
