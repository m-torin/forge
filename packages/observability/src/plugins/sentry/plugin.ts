/**
 * Sentry plugin implementation
 */

import type { ObservabilityServerPlugin } from '../../core/plugin';
import type {
  Breadcrumb,
  LogLevel,
  ObservabilityContext,
  ObservabilityUser,
} from '../../core/types';
import { safeEnv } from './env';

/**
 * Minimal Sentry interface for common methods across all Sentry packages
 */
interface SentryClient {
  init(options: any): void;
  captureException(error: any, captureContext?: any): string;
  captureMessage(message: string, captureContext?: any): string;
  setUser(user: any): void;
  addBreadcrumb(breadcrumb: any): void;
  withScope(callback: (scope: any) => void): void;
  getCurrentScope?(): any;
  flush?(timeout?: number): Promise<boolean>;
  close?(timeout?: number): Promise<boolean>;
  browserTracingIntegration?(): any;
  replayIntegration?(): any;
  profilesIntegration?(): any;
}

/**
 * Sentry plugin configuration
 */
export interface SentryPluginConfig {
  /**
   * The Sentry package to use (e.g., '@sentry/node', '@sentry/browser', '@sentry/nextjs')
   * If not provided, the plugin will try to detect based on environment
   */
  sentryPackage?: string;

  // Core Sentry options
  dsn?: string;
  environment?: string;
  release?: string;
  enabled?: boolean;
  debug?: boolean;

  // Sampling rates
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;

  // Integrations and hooks
  integrations?: any[];
  beforeSend?: (event: any, hint: any) => any;
  beforeSendTransaction?: (event: any, hint: any) => any;

  // Trace propagation
  tracePropagationTargets?: (string | RegExp)[];

  // Other options
  initialScope?: any;
  maxBreadcrumbs?: number;
  attachStacktrace?: boolean;
  autoSessionTracking?: boolean;
  sendDefaultPii?: boolean;
}

/**
 * Sentry plugin implementation
 */
export class SentryPlugin<T extends SentryClient = SentryClient>
  implements ObservabilityServerPlugin<T>
{
  name = 'sentry';
  enabled: boolean;
  protected client: T | undefined;
  protected initialized = false;
  protected sentryPackage: string;
  protected config: SentryPluginConfig;

  constructor(config: SentryPluginConfig = {}) {
    this.config = config;
    const env = safeEnv();
    // Auto-enable if DSN is provided
    const hasDSN = config.dsn || env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN;
    this.enabled = config.enabled ?? Boolean(hasDSN);

    // Determine Sentry package to use
    this.sentryPackage = config.sentryPackage || this.detectSentryPackage();
  }

  private detectSentryPackage(): string {
    if (typeof window !== 'undefined') {
      return '@sentry/browser';
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      return '@sentry/nextjs'; // Next.js edge uses same package
    } else if (process.env.NEXT_RUNTIME) {
      return '@sentry/nextjs';
    } else {
      return '@sentry/node';
    }
  }

  getClient(): T | undefined {
    return this.client;
  }

  protected getSafeEnv() {
    return safeEnv();
  }

  async initialize(config?: SentryPluginConfig): Promise<void> {
    if (this.initialized || !this.enabled) return;

    const env = safeEnv();
    const mergedConfig = { ...this.config, ...config };

    // Check for DSN
    const dsn = mergedConfig.dsn || env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      console.warn('Sentry plugin: No DSN provided, skipping initialization');
      this.enabled = false;
      return;
    }

    try {
      // Dynamic import of the specified Sentry package
      this.client = (await import(/* webpackIgnore: true */ this.sentryPackage)) as T;

      if (this.client && this.enabled) {
        // Build integrations array if not provided
        let integrations = mergedConfig.integrations;
        if (!integrations && this.client.browserTracingIntegration) {
          integrations = [];

          // Add browser tracing for performance monitoring
          if (
            mergedConfig.tracesSampleRate !== undefined ||
            env.SENTRY_TRACES_SAMPLE_RATE !== undefined
          ) {
            integrations.push(this.client.browserTracingIntegration());
          }

          // Add replay integration if configured
          if (
            this.client.replayIntegration &&
            (mergedConfig.replaysSessionSampleRate !== undefined ||
              env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE !== undefined)
          ) {
            integrations.push(this.client.replayIntegration());
          }

          // Add profiling if configured
          if (
            this.client.profilesIntegration &&
            (mergedConfig.profilesSampleRate !== undefined ||
              env.SENTRY_PROFILES_SAMPLE_RATE !== undefined)
          ) {
            integrations.push(this.client.profilesIntegration());
          }
        }

        this.client.init({
          dsn,
          environment: mergedConfig.environment || env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
          release: mergedConfig.release || env.SENTRY_RELEASE,
          debug: mergedConfig.debug ?? env.SENTRY_DEBUG,

          // Sampling rates
          tracesSampleRate: mergedConfig.tracesSampleRate ?? env.SENTRY_TRACES_SAMPLE_RATE,
          profilesSampleRate: mergedConfig.profilesSampleRate ?? env.SENTRY_PROFILES_SAMPLE_RATE,
          replaysSessionSampleRate:
            mergedConfig.replaysSessionSampleRate ?? env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
          replaysOnErrorSampleRate:
            mergedConfig.replaysOnErrorSampleRate ?? env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,

          // Integrations and hooks
          integrations,
          beforeSend: mergedConfig.beforeSend,
          beforeSendTransaction: mergedConfig.beforeSendTransaction,

          // Other options
          tracePropagationTargets: mergedConfig.tracePropagationTargets,
          initialScope: mergedConfig.initialScope,
          maxBreadcrumbs: mergedConfig.maxBreadcrumbs,
          attachStacktrace: mergedConfig.attachStacktrace,
          autoSessionTracking: mergedConfig.autoSessionTracking,
        });

        this.initialized = true;
      }
    } catch (error) {
      console.error(`Failed to import Sentry package '${this.sentryPackage}':`, error);
      this.enabled = false;
    }
  }

  async shutdown(): Promise<void> {
    if (this.client && this.initialized) {
      // Use close if available, otherwise flush
      if (this.client.close) {
        await this.client.close();
      } else if (this.client.flush) {
        await this.client.flush();
      }
      this.initialized = false;
    }
  }

  /**
   * Clean up the plugin (alias for shutdown)
   */
  async cleanup(): Promise<void> {
    await this.shutdown();
  }

  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    if (!this.enabled || !this.client) return;

    this.client.captureException(error, context);
  }

  captureMessage(message: string, level: LogLevel = 'info', _context?: ObservabilityContext): void {
    if (!this.enabled || !this.client) return;

    // Map our log levels to Sentry severity levels
    const sentryLevel =
      level === 'warning'
        ? 'warning'
        : level === 'error'
          ? 'error'
          : level === 'debug'
            ? 'debug'
            : 'info';

    this.client.captureMessage(message, sentryLevel);
  }

  setUser(user: ObservabilityUser | null): void {
    if (!this.enabled || !this.client) return;
    this.client.setUser(user);
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!this.enabled || !this.client) return;
    this.client.addBreadcrumb({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now() / 1000,
    });
  }

  withScope(callback: (scope: any) => void): void {
    if (!this.enabled || !this.client) return;
    this.client.withScope(callback);
  }

  async flush(timeout?: number): Promise<boolean> {
    if (!this.enabled || !this.client || !this.client.flush) return true;
    try {
      return await this.client.flush(timeout);
    } catch (_error) {
      return false;
    }
  }
}

/**
 * Factory function to create a Sentry plugin
 */
export const createSentryPlugin = <T extends SentryClient = SentryClient>(
  config?: SentryPluginConfig,
): SentryPlugin<T> => {
  return new SentryPlugin<T>(config);
};
