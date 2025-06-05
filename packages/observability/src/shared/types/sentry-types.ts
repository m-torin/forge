/**
 * Sentry-specific types
 */

export interface SentryConfig {
  beforeSend?: (event: any, hint: any) => any;
  beforeSendTransaction?: (event: any, hint: any) => any;
  debug?: boolean;
  dsn: string;
  environment?: string;
  integrations?: any[];
  profilesSampleRate?: number;
  release?: string;
  tracesSampleRate?: number;

  automaticVercelMonitors?: boolean;
  disableLogger?: boolean;
  hideSourceMaps?: boolean;
  // Next.js specific
  tunnelRoute?: string;
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
  email?: string;
  id: string;
  ip_address?: string;
  segment?: string;
  username?: string;
}
