/**
 * Sentry-specific types
 */

export interface SentryConfig {
  // Required
  dsn: string;

  // Core Options
  debug?: boolean;
  release?: string;
  environment?: string;
  tunnel?: string; // For working around ad-blockers
  sendDefaultPii?: boolean;
  maxBreadcrumbs?: number;
  attachStacktrace?: boolean;
  serverName?: string; // Server-only
  initialScope?: Record<string, any> | ((scope: any) => any);
  maxValueLength?: number;
  normalizeDepth?: number;
  normalizeMaxBreadth?: number;
  enabled?: boolean;
  sendClientReports?: boolean;
  includeLocalVariables?: boolean; // Server-only
  integrations?: any[] | string[];
  defaultIntegrations?: false; // Set to false to disable default integrations
  beforeBreadcrumb?: (breadcrumb: any, hint?: any) => any | null;
  transport?: (transportOptions: any) => any;
  transportOptions?: {
    headers?: Record<string, string>;
    // Node transport options
    proxy?: string;
    caCerts?: string | string[] | Buffer;
    httpModule?: any;
    keepAlive?: boolean;
    // Browser transport options
    fetchOptions?: RequestInit;
  };
  shutdownTimeout?: number; // Server-only
  disableInstrumentationWarnings?: boolean; // Server-only

  // Error Monitoring Options
  sampleRate?: number;
  beforeSend?: (event: any, hint: any) => any;
  ignoreErrors?: Array<string | RegExp>;
  denyUrls?: Array<string | RegExp>; // Client-only
  allowUrls?: Array<string | RegExp>; // Client-only

  // Tracing Options
  tracesSampleRate?: number;
  tracesSampler?: (samplingContext: any) => number | boolean;
  tracePropagationTargets?: Array<string | RegExp>;
  beforeSendTransaction?: (event: any, hint: any) => any;
  beforeSendSpan?: (span: any) => any;
  ignoreTransactions?: Array<string | RegExp>;

  // Session Replay Options (Client-only)
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  replayMaskAllText?: boolean;
  replayBlockAllMedia?: boolean;

  // Profiling Options
  profilesSampleRate?: number;

  // Next.js specific build options
  automaticVercelMonitors?: boolean;
  disableLogger?: boolean;
  hideSourceMaps?: boolean;
  tunnelRoute?: string;
  widenClientFileUpload?: boolean;

  // New features from Sentry documentation
  browserTracingEnabled?: boolean;
  feedbackEnabled?: boolean;
  loggingEnabled?: boolean;
  experiments?: {
    enableLogs?: boolean;
  };

  // Additional options to spread into Sentry.init()
  options?: Record<string, any>;
}

export interface SentryOptions {
  // Additional runtime options
  autoSessionTracking?: boolean;
}

export interface SentryUser {
  email?: string;
  id: string;
  ip_address?: string;
  segment?: string;
  username?: string;
}
