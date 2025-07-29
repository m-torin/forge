/**
 * Type definitions for Sentry SDK
 * These are minimal types to avoid using 'any' throughout the plugin
 */

import type { LogLevel } from '../../core/types';

/**
 * Sentry Scope interface
 */
export interface SentryScope {
  setTag(key: string, value: string | number | boolean | null): void;
  setContext(key: string, context: Record<string, any> | null): void;
  setUser(user: Record<string, any> | null): void;
  setLevel(level: SentrySeverityLevel): void;
  setFingerprint(fingerprint: string[]): void;
  clear(): void;
}

/**
 * Sentry Hub interface
 */
export interface SentryHub {
  getScope(): SentryScope;
  pushScope(): SentryScope;
  popScope(): boolean;
  withScope(callback: (scope: SentryScope) => void): void;
}

/**
 * Sentry Client interface
 */
export interface SentryClient {
  captureException(exception: any, hint?: any): string;
  captureMessage(message: string, level?: SentrySeverityLevel): string;
  captureEvent(event: any): string;
  flush(timeout?: number): Promise<boolean>;
  close(timeout?: number): Promise<boolean>;
  getOptions(): SentryOptions;
  getCurrentHub?(): SentryHub;
}

/**
 * Sentry SDK interface
 */
export interface SentrySDK {
  init(options: SentryOptions): void;
  captureException(exception: any, captureContext?: any): string;
  captureMessage(message: string, captureContext?: any): string;
  captureEvent(event: any, hint?: any): string;
  withScope(callback: (scope: SentryScope) => void): void;
  addBreadcrumb(breadcrumb: any): void;
  setUser(user: any): void;
  setTag(key: string, value: string): void;
  setContext(key: string, context: any): void;
  setExtra(key: string, extra: any): void;
  getCurrentHub(): SentryHub;
  getClient<T extends SentryClient>(): T | undefined;
  flush(timeout?: number): Promise<boolean>;
  close(timeout?: number): Promise<boolean>;
  lastEventId(): string | undefined;

  // Integration methods
  addEventProcessor(processor: (event: any) => any | null): void;

  // Browser specific
  Scope?: new () => SentryScope;

  // Transport creation
  makeMultiplexedTransport?(
    createTransport: (options: any) => any,
    matcher: (options: any) => any[],
  ): any;
  makeFetchTransport?(options: any): any;

  // Integrations
  browserTracingIntegration?(): any;
  browserProfilingIntegration?(): any;
  replayIntegration?(options?: any): any;
  captureConsoleIntegration?(options?: any): any;
  feedbackIntegration?(options?: any): any;
  vercelAIIntegration?(): any;
}

/**
 * Sentry Options interface
 */
export interface SentryOptions {
  dsn?: string;
  release?: string;
  environment?: string;
  debug?: boolean;
  sampleRate?: number;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  transport?: any;
  integrations?: any[];
  beforeSend?: (event: any, hint: any) => any | null;
  beforeSendTransaction?: (event: any, hint: any) => any | null;
  beforeBreadcrumb?: (breadcrumb: any, hint?: any) => any | null;
  tracePropagationTargets?: (string | RegExp)[];
  initialScope?: any;
  maxBreadcrumbs?: number;
  attachStacktrace?: boolean;
  autoSessionTracking?: boolean;
  sendDefaultPii?: boolean;
  _experiments?: Record<string, any>;
}

/**
 * Sentry Severity Level
 */
export type SentrySeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

/**
 * Map LogLevel to Sentry Severity
 */
export function mapLogLevelToSentrySeverity(level: LogLevel): SentrySeverityLevel {
  switch (level) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    case 'debug':
      return 'debug';
    default:
      return 'info';
  }
}
