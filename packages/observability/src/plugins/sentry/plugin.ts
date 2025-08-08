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
import type { Hub, Scope, Span, SpanContext, Transaction, TransactionContext } from './types';

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
  getActiveTransaction?(): any;
  startTransaction?(context: TransactionContext, customSamplingContext?: any): any;
  startSpan?(context: SpanContext): any;
  configureScope?(callback: (scope: any) => void): void;
  getCurrentHub?(): any;
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
  beforeBreadcrumb?: (breadcrumb: any, hint?: any) => any;

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

  /**
   * Start a new transaction
   */
  startTransaction(
    context: TransactionContext,
    customSamplingContext?: any,
  ): Transaction | undefined {
    if (!this.enabled || !this.client) return undefined;

    if (this.client.startTransaction) {
      return this.client.startTransaction(context, customSamplingContext);
    }

    // Fallback for older versions
    console.warn('startTransaction not available in this Sentry version');
    return undefined;
  }

  /**
   * Start a new span
   */
  startSpan(context: SpanContext): Span | undefined {
    if (!this.enabled || !this.client) return undefined;

    if (this.client.startSpan) {
      return this.client.startSpan(context);
    }

    // Try to create span from active transaction
    const transaction = this.getActiveTransaction();
    if (transaction?.startChild) {
      return transaction.startChild(context);
    }

    return undefined;
  }

  /**
   * Get the currently active transaction
   */
  getActiveTransaction(): Transaction | undefined {
    if (!this.enabled || !this.client) return undefined;

    if (this.client.getActiveTransaction) {
      return this.client.getActiveTransaction();
    }

    // Try to get from current scope
    if (this.client.getCurrentScope) {
      const scope = this.client.getCurrentScope();
      if (scope?.getTransaction) {
        return scope.getTransaction();
      }
    }

    return undefined;
  }

  /**
   * Configure the current scope
   */
  configureScope(callback: (scope: Scope) => void): void {
    if (!this.enabled || !this.client) return;

    if (this.client.configureScope) {
      this.client.configureScope(callback);
    } else if (this.client.withScope) {
      // Fallback using withScope
      this.client.withScope(callback);
    }
  }

  /**
   * Get the current hub instance
   */
  getCurrentHub(): Hub | undefined {
    if (!this.enabled || !this.client) return undefined;

    if (this.client.getCurrentHub) {
      return this.client.getCurrentHub();
    }

    return undefined;
  }

  /**
   * Set a measurement on the active transaction
   */
  setMeasurement(name: string, value: number, unit?: string): void {
    if (!this.enabled || !this.client) return;

    const transaction = this.getActiveTransaction();
    if (transaction?.setMeasurement) {
      transaction.setMeasurement(name, value, unit);
    }
  }

  /**
   * Add performance entries as breadcrumbs and measurements
   */
  addPerformanceEntries(entries: PerformanceEntry[]): void {
    if (!this.enabled || !this.client) return;

    const transaction = this.getActiveTransaction();

    entries.forEach(entry => {
      // Add as breadcrumb for context
      this.addBreadcrumb({
        category: 'performance',
        message: `${entry.entryType}: ${entry.name}`,
        data: {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          ...(entry.entryType === 'navigation' && {
            transferSize: (entry as PerformanceNavigationTiming).transferSize,
            encodedBodySize: (entry as PerformanceNavigationTiming).encodedBodySize,
            decodedBodySize: (entry as PerformanceNavigationTiming).decodedBodySize,
          }),
          ...(entry.entryType === 'resource' && {
            initiatorType: (entry as PerformanceResourceTiming).initiatorType,
            transferSize: (entry as PerformanceResourceTiming).transferSize,
          }),
        },
      });

      // Add measurements for key metrics
      if (transaction && entry.entryType === 'navigation') {
        const navEntry = entry as PerformanceNavigationTiming;

        // Core Web Vitals and other metrics
        this.setMeasurement('fcp', navEntry.responseStart - navEntry.fetchStart, 'millisecond');
        this.setMeasurement(
          'dom_interactive',
          navEntry.domInteractive - navEntry.fetchStart,
          'millisecond',
        );
        this.setMeasurement(
          'dom_complete',
          navEntry.domComplete - navEntry.fetchStart,
          'millisecond',
        );
        this.setMeasurement(
          'load_event_end',
          navEntry.loadEventEnd - navEntry.fetchStart,
          'millisecond',
        );
      }
    });
  }

  /**
   * Record a Web Vital measurement
   */
  recordWebVital(
    name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP' | string,
    value: number,
    options?: {
      unit?: string;
      rating?: 'good' | 'needs-improvement' | 'poor';
    },
  ): void {
    if (!this.enabled || !this.client) return;

    const { unit = 'millisecond', rating } = options || {};
    const transaction = this.getActiveTransaction();

    if (transaction) {
      // Set the measurement
      transaction.setMeasurement(name.toLowerCase(), value, unit);

      // Add rating as tag if provided
      if (rating) {
        transaction.setTag(`webvital.${name.toLowerCase()}.rating`, rating);
      }

      // Also send as a standalone event for monitoring
      this.client.captureMessage(`Web Vital: ${name}`, {
        level: 'info',
        tags: {
          'webvital.name': name,
          'webvital.value': value,
          'webvital.unit': unit,
          ...(rating && { 'webvital.rating': rating }),
        },
        contexts: {
          trace: {
            trace_id: transaction.traceId,
            span_id: transaction.spanId,
          },
        },
      });
    }
  }

  /**
   * Create a custom performance mark
   */
  mark(name: string, options?: { detail?: any }): void {
    if (!this.enabled) return;

    // Use Performance API if available
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name, options);
    }

    // Also add as breadcrumb
    this.addBreadcrumb({
      category: 'performance.mark',
      message: name,
      data: options?.detail,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Create a custom performance measure
   */
  measure(
    name: string,
    startMarkOrOptions?: string | PerformanceMeasureOptions,
    endMark?: string,
  ): void {
    if (!this.enabled) return;

    // Use Performance API if available
    if (typeof performance !== 'undefined' && performance.measure) {
      if (typeof startMarkOrOptions === 'string') {
        performance.measure(name, startMarkOrOptions, endMark);
      } else {
        performance.measure(name, startMarkOrOptions);
      }

      // Get the measure to record its duration
      const measures = performance.getEntriesByName(name, 'measure');
      const measure = measures[measures.length - 1];

      if (measure) {
        this.setMeasurement(name, measure.duration, 'millisecond');

        this.addBreadcrumb({
          category: 'performance.measure',
          message: name,
          data: {
            duration: measure.duration,
            startTime: measure.startTime,
          },
          timestamp: measure.startTime / 1000,
        });
      }
    }
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
