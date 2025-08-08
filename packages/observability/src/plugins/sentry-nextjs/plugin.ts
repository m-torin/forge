/**
 * Next.js-specific Sentry plugin with enhanced configuration
 */

import type { ObservabilityContext } from '../../core/types';
import type { SentryPluginConfig } from '../sentry/plugin';
import { SentryPlugin } from '../sentry/plugin';

/**
 * Next.js-specific Sentry client interface extending the base interface
 */
interface SentryNextJSClient {
  init(options: any): void;
  captureException(error: any, captureContext?: any): string;
  captureMessage(message: string, captureContext?: any): string;
  setUser(user: any): void;
  addBreadcrumb(breadcrumb: any): void;
  withScope(callback: (scope: any) => void): void;
  getCurrentScope?(): any;
  flush?(timeout?: number): Promise<boolean>;
  close?(timeout?: number): Promise<boolean>;

  // Next.js specific integrations
  browserTracingIntegration?(options?: any): any;
  replayIntegration?(options?: any): any;
  profilesIntegration?(): any;
  feedbackIntegration?(options?: any): any;

  // Additional integrations from @sentry/nextjs
  httpClientIntegration?(): any;
  contextLinesIntegration?(): any;
  reportingObserverIntegration?(): any;
  captureConsoleIntegration?(options?: any): any;
  extraErrorDataIntegration?(options?: any): any;
  rewriteFramesIntegration?(options?: any): any;
  sessionTimingIntegration?(): any;
  dedupeIntegration?(): any;
  debugIntegration?(options?: any): any;
  replayCanvasIntegration?(options?: any): any;

  // Feature flag integrations
  featureFlagsIntegration?(): any;
  launchDarklyIntegration?(): any;
  unleashIntegration?(options?: any): any;

  // Next.js specific methods
  captureRouterTransitionStart?(name: string): void;
  withServerActionInstrumentation?<T>(name: string, options: any, fn: () => Promise<T>): Promise<T>;
  captureRequestError?(...args: any[]): void;
  getTraceData?(): Record<string, string>;
}

/**
 * Enhanced Sentry configuration for Next.js applications
 */
export interface SentryNextJSPluginConfig extends SentryPluginConfig {
  /**
   * Enable performance monitoring with browserTracingIntegration
   * @default true in production
   */
  enableTracing?: boolean;

  /**
   * Enable session replay
   * @default false
   */
  enableReplay?: boolean;

  /**
   * Enable user feedback widget
   * @default false
   */
  enableFeedback?: boolean;

  /**
   * Enable experimental logs
   * @default false
   */
  enableLogs?: boolean;

  /**
   * Enable profiling integration
   * @default false
   */
  enableProfiling?: boolean;

  /**
   * Enable canvas recording for session replay
   * @default false
   */
  enableCanvasRecording?: boolean;

  /**
   * Replay sampling rates
   */
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;

  /**
   * Replay configuration options
   */
  replayOptions?: {
    maskAllText?: boolean;
    blockAllMedia?: boolean;
    [key: string]: any;
  };

  /**
   * Profiling sample rate
   */
  profilesSampleRate?: number;

  /**
   * Feedback widget configuration
   */
  feedbackOptions?: {
    colorScheme?: 'light' | 'dark' | 'system';
    autoInject?: boolean;
    [key: string]: any;
  };

  /**
   * Canvas recording options
   */
  canvasRecordingOptions?: {
    quality?: 'low' | 'medium' | 'high';
    [key: string]: any;
  };

  /**
   * Custom trace propagation targets for client-side
   */
  tracePropagationTargets?: (string | RegExp)[];

  /**
   * Automatically instrument server actions
   * @default true
   */
  instrumentServerActions?: boolean;

  /**
   * Automatically capture router transitions
   * @default true
   */
  captureRouterTransitions?: boolean;

  // Additional integration options
  /**
   * Enable HTTP client integration
   * @default false
   */
  enableHttpClient?: boolean;

  /**
   * Enable context lines integration
   * @default false
   */
  enableContextLines?: boolean;

  /**
   * Enable reporting observer integration
   * @default false
   */
  enableReportingObserver?: boolean;

  /**
   * Enable capture console integration
   * @default false
   */
  enableCaptureConsole?: boolean;

  /**
   * Capture console options
   */
  captureConsoleOptions?: {
    levels?: string[];
  };

  /**
   * Enable extra error data integration
   * @default false
   */
  enableExtraErrorData?: boolean;

  /**
   * Extra error data options
   */
  extraErrorDataOptions?: {
    depth?: number;
  };

  /**
   * Enable rewrite frames integration
   * @default false
   */
  enableRewriteFrames?: boolean;

  /**
   * Rewrite frames options
   */
  rewriteFramesOptions?: {
    prefix?: string;
    iteratee?: (frame: any) => any;
  };

  /**
   * Enable session timing integration
   * @default false
   */
  enableSessionTiming?: boolean;

  /**
   * Enable debug integration
   * @default false
   */
  enableDebug?: boolean;

  /**
   * Debug options
   */
  debugOptions?: {
    stringify?: boolean;
    debugger?: boolean;
  };

  /**
   * Feature flags configuration
   */
  featureFlags?: {
    provider?: 'launchdarkly' | 'unleash' | 'custom';
    launchDarkly?: {
      clientId: string;
      options?: any;
    };
    unleash?: {
      url: string;
      clientKey: string;
      appName: string;
      featureFlagClientClass?: any;
    };
    custom?: {
      integration: any;
      config?: any;
    };
  };
}

/**
 * Next.js-specific Sentry plugin with auto-configured integrations
 */
export class SentryNextJSPlugin extends SentryPlugin<SentryNextJSClient> {
  name = 'sentry-nextjs';
  private nextjsConfig: SentryNextJSPluginConfig;

  constructor(config: SentryNextJSPluginConfig = {}) {
    // Prepare base configuration
    const baseConfig = SentryNextJSPlugin.prepareConfig(config);
    super(baseConfig);
    this.nextjsConfig = config;
  }

  /**
   * Prepare configuration with Next.js-specific defaults
   */
  private static prepareConfig(config: SentryNextJSPluginConfig): SentryNextJSPluginConfig {
    const isProduction = process.env.NODE_ENV === 'production';
    const isClient = typeof window !== 'undefined';

    return {
      ...config,
      // Enable tracing by default in production
      enableTracing: config.enableTracing ?? isProduction,
      // Set default sampling rates
      tracesSampleRate: config.tracesSampleRate ?? (isProduction ? 0.1 : 1.0),
      // Set replay rates
      replaysSessionSampleRate: config.replaysSessionSampleRate ?? (isProduction ? 0.1 : 0),
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
      // Set profiling rate (server-side only)
      profilesSampleRate: config.profilesSampleRate ?? 0,
      // Default integrations will be added during initialization
      integrations: config.integrations || [],
      // Enable PII for server-side by default
      sendDefaultPii: config.sendDefaultPii ?? !isClient,
    };
  }

  /**
   * Initialize with Next.js-specific integrations
   */
  async initialize(config?: SentryNextJSPluginConfig): Promise<void> {
    const mergedConfig = { ...this.nextjsConfig, ...config };

    // Build integrations array based on configuration
    const integrations = await this.buildIntegrations(mergedConfig);

    // Add experimental features
    const experiments: any = {};
    if (mergedConfig.enableLogs) {
      experiments.enableLogs = true;
    }

    // Initialize with enhanced configuration
    const finalConfig: any = {
      ...mergedConfig,
      integrations,
    };

    // Add experiments if any
    if (Object.keys(experiments).length > 0) {
      finalConfig._experiments = experiments;
    }

    await super.initialize(finalConfig);
  }

  /**
   * Build Next.js-specific integrations
   */
  private async buildIntegrations(config: SentryNextJSPluginConfig): Promise<any[]> {
    const integrations = [...(config.integrations || [])];
    const isClient = typeof window !== 'undefined';
    const isServer = !isClient;

    if (!this.client) return integrations;

    // Client-side integrations
    if (isClient) {
      // Browser tracing for performance monitoring
      if (config.enableTracing && this.client.browserTracingIntegration) {
        const tracingOptions = config.tracePropagationTargets
          ? { tracePropagationTargets: config.tracePropagationTargets }
          : undefined;

        try {
          integrations.push(this.client.browserTracingIntegration(tracingOptions));
        } catch (_error) {
          integrations.push(this.client.browserTracingIntegration());
        }
      }

      // Session replay
      if (config.enableReplay && this.client.replayIntegration) {
        const replayOptions = {
          maskAllText: config.replayOptions?.maskAllText ?? true,
          blockAllMedia: config.replayOptions?.blockAllMedia ?? false,
        };
        integrations.push(this.client.replayIntegration(replayOptions));
      }

      // Canvas recording for replay
      if (config.enableCanvasRecording && this.client.replayCanvasIntegration) {
        integrations.push(this.client.replayCanvasIntegration(config.canvasRecordingOptions || {}));
      }

      // User feedback widget
      if (config.enableFeedback && this.client.feedbackIntegration) {
        integrations.push(this.client.feedbackIntegration(config.feedbackOptions || {}));
      }

      // HTTP client integration
      if (config.enableHttpClient && this.client.httpClientIntegration) {
        integrations.push(this.client.httpClientIntegration());
      }

      // Reporting observer integration
      if (config.enableReportingObserver && this.client.reportingObserverIntegration) {
        integrations.push(this.client.reportingObserverIntegration());
      }
    }

    // Server-side integrations
    if (isServer) {
      // Profiling integration
      if (config.enableProfiling && this.client.profilesIntegration) {
        integrations.push(this.client.profilesIntegration());
      }

      // Context lines integration
      if (config.enableContextLines && this.client.contextLinesIntegration) {
        integrations.push(this.client.contextLinesIntegration());
      }
    }

    // Integrations for both client and server
    // Capture console integration
    if (config.enableCaptureConsole && this.client.captureConsoleIntegration) {
      integrations.push(this.client.captureConsoleIntegration(config.captureConsoleOptions || {}));
    }

    // Extra error data integration
    if (config.enableExtraErrorData && this.client.extraErrorDataIntegration) {
      integrations.push(this.client.extraErrorDataIntegration(config.extraErrorDataOptions || {}));
    }

    // Rewrite frames integration
    if (config.enableRewriteFrames && this.client.rewriteFramesIntegration) {
      integrations.push(this.client.rewriteFramesIntegration(config.rewriteFramesOptions || {}));
    }

    // Session timing integration
    if (config.enableSessionTiming && this.client.sessionTimingIntegration) {
      integrations.push(this.client.sessionTimingIntegration());
    }

    // Debug integration
    if (config.enableDebug && this.client.debugIntegration) {
      integrations.push(this.client.debugIntegration(config.debugOptions || {}));
    }

    // Feature flag integrations
    if (config.featureFlags) {
      const { provider, launchDarkly, unleash, custom } = config.featureFlags;

      if (provider === 'launchdarkly' && launchDarkly && this.client.launchDarklyIntegration) {
        integrations.push(this.client.launchDarklyIntegration());
      } else if (provider === 'unleash' && unleash && this.client.unleashIntegration) {
        const unleashOptions = unleash.featureFlagClientClass
          ? { featureFlagClientClass: unleash.featureFlagClientClass }
          : { unleashClientClass: unleash.featureFlagClientClass }; // Support both old and new API
        integrations.push(this.client.unleashIntegration(unleashOptions));
      } else if (provider === 'custom' && custom) {
        integrations.push(custom.integration);
      }

      // Add general feature flags integration if available
      if (this.client.featureFlagsIntegration) {
        integrations.push(this.client.featureFlagsIntegration());
      }
    }

    return integrations;
  }

  /**
   * Capture exception with Next.js context
   */
  captureException(error: Error | unknown, context?: ObservabilityContext): void {
    // Enhance context with Next.js-specific information
    const enhancedContext = {
      ...context,
      runtime: process.env.NEXT_RUNTIME || 'unknown',
      isEdge: process.env.NEXT_RUNTIME === 'edge',
      isClient: typeof window !== 'undefined',
    };

    super.captureException(error, enhancedContext);
  }

  /**
   * Get router transition capture function for client-side
   */
  getCaptureRouterTransitionStart(): ((name: string) => void) | undefined {
    if (typeof window === 'undefined' || !this.client) return undefined;

    // Return the Sentry function if available
    return this.client.captureRouterTransitionStart;
  }

  /**
   * Wrap server action with instrumentation
   */
  withServerActionInstrumentation<T>(
    name: string,
    options: {
      formData?: FormData;
      headers?: Record<string, string>;
      recordResponse?: boolean;
    },
    fn: () => Promise<T>,
  ): Promise<T> {
    if (!this.client || !this.client.withServerActionInstrumentation) {
      // Fallback if not available
      return fn();
    }

    return this.client.withServerActionInstrumentation(name, options, fn);
  }

  /**
   * Get trace data for distributed tracing
   */
  getTraceData(): Record<string, string> {
    if (!this.client || !this.client.getTraceData) {
      return {};
    }
    return this.client.getTraceData();
  }

  /**
   * Capture request error (for Next.js instrumentation)
   */
  captureRequestError(...args: any[]): void {
    if (!this.client || !this.client.captureRequestError) {
      console.warn('captureRequestError not available in current Sentry client');
      return;
    }
    this.client.captureRequestError(...args);
  }

  /**
   * Get debug information including Next.js-specific details
   */
  getDebugInfo(): Record<string, any> {
    return {
      name: this.name,
      enabled: this.enabled,
      initialized: (this as any).initialized,
      sentryPackage: (this as any).sentryPackage,
      runtime: process.env.NEXT_RUNTIME || 'unknown',
      isEdge: process.env.NEXT_RUNTIME === 'edge',
      isClient: typeof window !== 'undefined',
      enableTracing: this.nextjsConfig.enableTracing,
      enableReplay: this.nextjsConfig.enableReplay,
      enableFeedback: this.nextjsConfig.enableFeedback,
      enableLogs: this.nextjsConfig.enableLogs,
      enableProfiling: this.nextjsConfig.enableProfiling,
      enableCanvasRecording: this.nextjsConfig.enableCanvasRecording,
      featureFlagProvider: this.nextjsConfig.featureFlags?.provider,
    };
  }
}

/**
 * Factory function to create a Next.js Sentry plugin
 */
export const createSentryNextJSPlugin = (config?: SentryNextJSPluginConfig): SentryNextJSPlugin => {
  return new SentryNextJSPlugin(config);
};
