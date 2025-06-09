/**
 * Sentry-specific types
 */

export interface SentryConfig {
  beforeSend?: (event: any, hint: any) => any;
  beforeSendTransaction?: (event: any, hint: any) => any;
  debug?: boolean;
  dsn: string;
  environment?: string;
  integrations?: any[] | string[];
  profilesSampleRate?: number;
  release?: string;
  tracesSampleRate?: number;

  replayBlockAllMedia?: boolean;
  replayMaskAllText?: boolean;
  replaysOnErrorSampleRate?: number;
  // Replay integration options
  replaysSessionSampleRate?: number;

  // Next.js specific build options
  automaticVercelMonitors?: boolean;
  disableLogger?: boolean;
  hideSourceMaps?: boolean;
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
