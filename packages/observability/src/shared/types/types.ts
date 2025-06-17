/**
 * Core types for the multi-provider observability system
 * Updated for React 19 and Next.js 15 compatibility
 */

export interface Breadcrumb {
  category?: string;
  data?: Record<string, any>;
  level?: 'critical' | 'debug' | 'error' | 'info' | 'warning';
  message?: string;
  timestamp?: number;
  type?:
    | 'debug'
    | 'default'
    | 'error'
    | 'http'
    | 'info'
    | 'navigation'
    | 'query'
    | 'transaction'
    | 'ui'
    | 'user';
}

export type LogLevel = 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

export interface ObservabilityConfig {
  debug?: boolean;
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
    failureWindow?: number;
    successThreshold?: number;
  };
  connectionPool?: {
    maxConnections?: number;
    idleTimeout?: number;
    maxLifetime?: number;
  };
  healthCheck?: {
    enabled?: boolean;
    intervalMs?: number;
  };
  nextjs?: {
    automaticVercelMonitors?: boolean;
    beforeSend?: (event: any) => any;
    disableLogger?: boolean;
    hideSourceMaps?: boolean;
    // Next.js specific configuration
    tunnelRoute?: string;
    widenClientFileUpload?: boolean;
  };
  grafanaMonitoring?: {
    enabled?: boolean;
    endpoints?: {
      grafana?: string;
      prometheus?: string;
      loki?: string;
      otelGrpc?: string;
      otelHttp?: string;
      rum?: string;
    };
    service?: {
      name?: string;
      version?: string;
      environment?: string;
    };
    features?: {
      rum?: boolean;
      traces?: boolean;
      metrics?: boolean;
      logs?: boolean;
      healthChecks?: boolean;
    };
  };
  onError?: (
    error: unknown,
    context: { [key: string]: any; method: string; provider: string },
  ) => void;
  onInfo?: (message: string) => void;
  onProviderError?: (error: unknown, context: { [key: string]: any; provider: string }) => void;
  providers: Record<string, ObservabilityProviderConfig>;
}

export interface ObservabilityContext {
  [key: string]: any;
  environment?: string;
  extra?: Record<string, any>;
  fingerprint?: string[];
  level?: 'debug' | 'error' | 'fatal' | 'info' | 'warning';
  organizationId?: string;
  platform?: string;
  release?: string;
  requestId?: string;
  serverName?: string;
  sessionId?: string;
  spanId?: string;
  tags?: Record<string, boolean | number | string>;
  traceId?: string;
  transaction?: string;
  userId?: string;
}

export interface ObservabilityManager {
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;
  captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void>;
  endSession(): void;
  initialize(): Promise<void>;
  log(level: string, message: string, metadata?: any): Promise<void>;
  setContext(key: string, context: Record<string, any>): void;
  setExtra(key: string, value: any): void;
  setTag(key: string, value: boolean | number | string): void;
  setUser(user: { [key: string]: any; email?: string; id: string; username?: string }): void;
  startSession(): void;
  startSpan(name: string, parentSpan?: any): any;
  startTransaction(name: string, context?: ObservabilityContext): any;
}

export interface ObservabilityProvider {
  // Breadcrumbs
  addBreadcrumb?(breadcrumb: Breadcrumb): void;

  // Error tracking
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;

  captureMessage(
    message: string,
    level: 'error' | 'info' | 'warning',
    context?: ObservabilityContext,
  ): Promise<void>;
  endSession?(): void;

  initialize(config: ObservabilityProviderConfig): Promise<void>;

  // Logging
  log?(level: string, message: string, metadata?: any): Promise<void>;
  readonly name: string;

  setContext?(key: string, context: Record<string, any>): void;
  setExtra?(key: string, value: any): void;
  setTag?(key: string, value: boolean | number | string): void;
  // User context
  setUser?(user: { [key: string]: any; email?: string; id: string; username?: string }): void;

  // Session tracking
  startSession?(): void;

  startSpan?(name: string, parentSpan?: any): any;
  // Performance monitoring
  startTransaction?(name: string, context?: ObservabilityContext): any;
}

export interface ObservabilityProviderConfig {
  // Allow any other properties for provider-specific config
  [key: string]: any;
  apiKey?: string; // General API key
  // Provider-specific required fields
  dsn?: string; // Sentry DSN
  // Optional configuration
  environment?: string;

  format?: 'json' | 'pretty' | 'text';
  // Logging configuration
  level?: 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';

  options?: Record<string, any>;
  profilesSampleRate?: number;
  projectId?: string; // Project identifier
  release?: string;
  serviceName?: string; // Service/app name

  tracesSampleRate?: number;
}
export type ProviderFactory = (
  config: ObservabilityProviderConfig,
) => ObservabilityProvider | Promise<ObservabilityProvider>;

export type ProviderRegistry = Record<string, ProviderFactory>;
