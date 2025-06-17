/**
 * Sentry-specific types
 */

export interface SentryConfig {
  // Next.js specific build options
  automaticVercelMonitors?: boolean;
  beforeSend?: (event: any, hint: any) => any;
  beforeSendTransaction?: (event: any, hint: any) => any;
  debug?: boolean;
  disableLogger?: boolean;
  dsn: string;
  environment?: string;
  hideSourceMaps?: boolean;
  integrations?: any[] | string[];

  // Additional options to spread into Sentry.init()
  options?: Record<string, any>;
  profilesSampleRate?: number;
  release?: string;
  replayBlockAllMedia?: boolean;

  replayMaskAllText?: boolean;
  replaysOnErrorSampleRate?: number;
  // Replay integration options
  replaysSessionSampleRate?: number;
  tracesSampleRate?: number;
  tunnelRoute?: string;

  widenClientFileUpload?: boolean;
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
