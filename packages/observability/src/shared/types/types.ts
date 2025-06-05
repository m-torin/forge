/**
 * Core types for the multi-provider observability system
 */

export interface ObservabilityProviderConfig {
  apiKey?: string; // General API key
  // Provider-specific required fields
  dsn?: string; // Sentry DSN
  projectId?: string; // Project identifier
  serviceName?: string; // Service/app name

  format?: 'json' | 'pretty' | 'text';
  // Logging configuration
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  // Optional configuration
  environment?: string;
  options?: Record<string, any>;
  profilesSampleRate?: number;
  release?: string;
  tracesSampleRate?: number;

  // No 'enabled' field - presence = enabled
}

export interface ObservabilityProvider {
  readonly name: string;

  initialize(config: ObservabilityProviderConfig): Promise<void>;

  // Error tracking
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void>;

  // Logging
  log?(level: string, message: string, metadata?: any): Promise<void>;

  startSpan?(name: string, parentSpan?: any): any;
  // Performance monitoring
  startTransaction?(name: string, context?: ObservabilityContext): any;

  setContext?(key: string, context: Record<string, any>): void;
  setExtra?(key: string, value: any): void;
  setTag?(key: string, value: string | number | boolean): void;
  // User context
  setUser?(user: { id: string; email?: string; username?: string; [key: string]: any }): void;

  // Breadcrumbs
  addBreadcrumb?(breadcrumb: Breadcrumb): void;

  endSession?(): void;
  // Session tracking
  startSession?(): void;
}

export interface ObservabilityConfig {
  debug?: boolean;
  nextjs?: {
    // Next.js specific configuration
    tunnelRoute?: string;
    hideSourceMaps?: boolean;
    disableLogger?: boolean;
    automaticVercelMonitors?: boolean;
    widenClientFileUpload?: boolean;
    beforeSend?: (event: any) => any;
  };
  onError?: (
    error: unknown,
    context: { provider: string; method: string; [key: string]: any },
  ) => void;
  onInfo?: (message: string) => void;
  providers: Record<string, ObservabilityProviderConfig>;
}

export interface ObservabilityContext {
  [key: string]: any;
  environment?: string;
  extra?: Record<string, any>;
  fingerprint?: string[];
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  organizationId?: string;
  platform?: string;
  release?: string;
  requestId?: string;
  serverName?: string;
  sessionId?: string;
  spanId?: string;
  tags?: Record<string, string | number | boolean>;
  traceId?: string;
  transaction?: string;
  userId?: string;
}

export interface Breadcrumb {
  category?: string;
  data?: Record<string, any>;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message?: string;
  timestamp?: number;
  type?:
    | 'default'
    | 'debug'
    | 'error'
    | 'navigation'
    | 'http'
    | 'info'
    | 'query'
    | 'transaction'
    | 'ui'
    | 'user';
}

export type ProviderFactory = (config: ObservabilityProviderConfig) => ObservabilityProvider;
export type ProviderRegistry = Record<string, ProviderFactory>;

export interface ObservabilityManager {
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: ObservabilityContext,
  ): Promise<void>;
  endSession(): void;
  initialize(): Promise<void>;
  log(level: string, message: string, metadata?: any): Promise<void>;
  setContext(key: string, context: Record<string, any>): void;
  setExtra(key: string, value: any): void;
  setTag(key: string, value: string | number | boolean): void;
  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void;
  startSession(): void;
  startSpan(name: string, parentSpan?: any): any;
  startTransaction(name: string, context?: ObservabilityContext): any;
}
