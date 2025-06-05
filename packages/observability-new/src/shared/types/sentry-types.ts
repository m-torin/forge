/**
 * Sentry-specific types
 */

export interface SentryConfig {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  debug?: boolean;
  integrations?: any[];
  beforeSend?: (event: any, hint: any) => any;
  beforeSendTransaction?: (event: any, hint: any) => any;
  
  // Next.js specific
  tunnelRoute?: string;
  hideSourceMaps?: boolean;
  disableLogger?: boolean;
  automaticVercelMonitors?: boolean;
  widenClientFileUpload?: boolean;
  
  // Additional options to spread into Sentry.init()
  options?: Record<string, any>;
}

export interface SentryOptions {
  // Additional runtime options
  attachStacktrace?: boolean;
  autoSessionTracking?: boolean;
  maxBreadcrumbs?: number;
  normalizeDepth?: number;
  transportOptions?: {
    headers?: Record<string, string>;
  };
}

export interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  ip_address?: string;
  segment?: string;
}