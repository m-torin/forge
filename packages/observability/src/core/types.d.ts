/**
 * Core types for the observability package
 * These types are provider-agnostic and define the common interface
 */
export interface ObservabilityUser {
  id: string;
  email?: string;
  username?: string;
  [key: string]: unknown;
}
export interface ObservabilityContext {
  [key: string]: unknown;
}
export type LogLevel = 'debug' | 'info' | 'warning' | 'error';
export interface Breadcrumb {
  message: string;
  category?: string;
  level?: LogLevel | 'critical';
  data?: Record<string, unknown>;
  timestamp?: number;
}
export interface ObservabilityClient {
  captureException(error: Error | unknown, context?: ObservabilityContext): void;
  captureMessage(message: string, level?: LogLevel, context?: ObservabilityContext): void;
  setUser(user: ObservabilityUser | null): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  withScope(callback: (scope: any) => void): void;
}
export interface ObservabilityServer extends ObservabilityClient {
  flush(timeout?: number): Promise<boolean>;
}
export interface ObservabilityConfig {
  enabled?: boolean;
  environment?: 'development' | 'preview' | 'production';
  debug?: boolean;
}
//# sourceMappingURL=types.d.ts.map
