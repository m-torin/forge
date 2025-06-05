/**
 * Core types for the multi-provider observability system
 */

export interface ObservabilityProviderConfig {
  // Provider-specific required fields
  dsn?: string;           // Sentry DSN
  apiKey?: string;        // General API key
  projectId?: string;     // Project identifier
  serviceName?: string;   // Service/app name
  
  // Logging configuration
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  format?: 'json' | 'pretty' | 'text';
  
  // Optional configuration
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  options?: Record<string, any>;
  
  // No 'enabled' field - presence = enabled
}

export interface ObservabilityProvider {
  readonly name: string;
  
  initialize(config: ObservabilityProviderConfig): Promise<void>;
  
  // Error tracking
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ObservabilityContext): Promise<void>;
  
  // Logging
  log?(level: string, message: string, metadata?: any): Promise<void>;
  
  // Performance monitoring
  startTransaction?(name: string, context?: ObservabilityContext): any;
  startSpan?(name: string, parentSpan?: any): any;
  
  // User context
  setUser?(user: { id: string; email?: string; username?: string; [key: string]: any }): void;
  setTag?(key: string, value: string | number | boolean): void;
  setExtra?(key: string, value: any): void;
  setContext?(key: string, context: Record<string, any>): void;
  
  // Breadcrumbs
  addBreadcrumb?(breadcrumb: Breadcrumb): void;
  
  // Session tracking
  startSession?(): void;
  endSession?(): void;
}

export interface ObservabilityConfig {
  providers: Record<string, ObservabilityProviderConfig>;
  onError?: (error: unknown, context: { provider: string; method: string; [key: string]: any }) => void;
  onInfo?: (message: string) => void;
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
}

export interface ObservabilityContext {
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  requestId?: string;
  traceId?: string;
  spanId?: string;
  tags?: Record<string, string | number | boolean>;
  extra?: Record<string, any>;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  fingerprint?: string[];
  environment?: string;
  release?: string;
  transaction?: string;
  platform?: string;
  serverName?: string;
  [key: string]: any;
}

export interface Breadcrumb {
  timestamp?: number;
  type?: 'default' | 'debug' | 'error' | 'navigation' | 'http' | 'info' | 'query' | 'transaction' | 'ui' | 'user';
  category?: string;
  message?: string;
  data?: Record<string, any>;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
}

export type ProviderFactory = (config: ObservabilityProviderConfig) => ObservabilityProvider;
export type ProviderRegistry = Record<string, ProviderFactory>;

export interface ObservabilityManager {
  initialize(): Promise<void>;
  captureException(error: Error, context?: ObservabilityContext): Promise<void>;
  captureMessage(message: string, level: 'info' | 'warning' | 'error', context?: ObservabilityContext): Promise<void>;
  log(level: string, message: string, metadata?: any): Promise<void>;
  startTransaction(name: string, context?: ObservabilityContext): any;
  startSpan(name: string, parentSpan?: any): any;
  setUser(user: { id: string; email?: string; username?: string; [key: string]: any }): void;
  setTag(key: string, value: string | number | boolean): void;
  setExtra(key: string, value: any): void;
  setContext(key: string, context: Record<string, any>): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  startSession(): void;
  endSession(): void;
}