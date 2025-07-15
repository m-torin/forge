/**
 * PostHog client-side (browser) provider implementation with feature flags support
 */

// Simple console fallbacks - observability integration can be added later
import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type {
  BootstrapData,
  EnhancedPostHogProvider,
  ExperimentInfo,
  PostHogConfig,
} from './types';
const logDebug = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper debug logging via observability package
};
const logError = (_message: string, _error?: Error, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};
const logWarn = (_message: string, _context?: any) => {
  // No-op to avoid console warnings in production
  // TODO: Add proper error logging via observability package
};

declare global {
  interface Window {
    posthog?: {
      init: (apiKey: string, options?: any) => void;
      capture: (event: string, properties?: any) => void;
      identify: (userId: string, properties?: any) => void;
      reset: () => void;
      group: (groupType: string, groupKey: string, properties?: any) => void;
      alias: (alias: string) => void;
      people?: {
        set: (properties: any) => void;
        set_once: (properties: any) => void;
      };
      register: (properties: any) => void;

      // Feature flag methods
      isFeatureEnabled: (flag: string) => boolean;
      getFeatureFlag: (flag: string) => any;
      getFeatureFlagPayload: (flag: string) => any;
      getAllFlags: () => Record<string, any>;
      onFeatureFlags: (callback: (flags: string[], variants: Record<string, any>) => void) => void;

      // Experiment methods
      getActiveMatchingFeatureFlags: () => string[];

      // Utility methods
      get_distinct_id: () => string;
      shutdown: () => Promise<void>;
    };
  }
}

export class PostHogClientProvider implements AnalyticsProvider, Partial<EnhancedPostHogProvider> {
  readonly name = 'posthog';
  private config: PostHogConfig;
  private isInitialized = false;
  private posthogInstance: any = null;
  private retryQueue: { method: string; args: any[] }[] = [];
  private isOnline = true;
  private debugMode = false;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('PostHog apiKey is required');
    }

    this.config = {
      apiKey: config.apiKey,
      options: config.options,
    };

    // Set up debug mode
    this.debugMode =
      config.options?.debug ||
      (typeof window !== 'undefined' && window.location.search.includes('debug=posthog'));

    // Monitor network status for retry queue
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushRetryQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import PostHog (optional dependency)
      const { default: posthog } = await import('posthog-js');

      // Extract bootstrap data if provided
      const bootstrap = this.config.options?.bootstrap;

      // Initialize PostHog with enhanced options and all missing configurations
      const initOptions: any = {
        // Core PostHog configuration with PostHog recommended defaults
        api_host: 'https://app.posthog.com',
        capture_pageleave: true, // Important for engagement tracking
        capture_pageview: false, // We handle pageviews manually
        ui_host: 'https://app.posthog.com',

        opt_in_site_apps: false, // Conservative default
        // Privacy & GDPR compliance
        person_profiles: 'identified_only', // GDPR-friendly default
        respect_dnt: true, // Respect Do Not Track headers

        // Performance optimizations
        uuid_version: 'v7', // Better performance than v4
        batch_flush_interval_ms: 10000, // 10 second batching
        request_batching: true, // Batch requests for better performance

        // Session recording with safe defaults
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            email: false,
            number: false,
            password: true, // Always mask passwords
            text: false,
          },
          recordCanvas: false, // Performance consideration
          recordCrossOriginIframes: false, // Conservative default
          sampling: {
            minimumDurationMs: 1000, // Only record sessions > 1s
            sampleRate: 1.0, // Record all sessions by default
          },
        },

        // Debug mode
        debug: this.debugMode,

        // Apply user configuration (this will override defaults)
        ...this.config.options,

        // Add bootstrap data if available (must be last to not be overridden)
        ...(bootstrap && {
          bootstrap: {
            distinctID: bootstrap.distinctID,
          },
        }),
      };

      posthog.init(this.config.apiKey, initOptions);

      // Store instance references
      this.posthogInstance = posthog;
      window.posthog = posthog as any;

      this.isInitialized = true;
    } catch (_error) {
      throw new Error('PostHog JS SDK not available. Install with: npm install posthog-js');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      await this.queueEvent('track', [event, properties]);
      return;
    }

    try {
      // Debug logging
      await this.log('Tracking event:', event, properties);

      // Validate properties in debug mode
      if (this.debugMode) {
        await this.validateEventProperties(event, properties);
      }

      this.posthogInstance.capture(event, properties);
    } catch (error) {
      // Queue event if offline
      if (!this.isOnline) {
        await this.queueEvent('track', [event, properties]);
      }

      // Enhanced error reporting
      await this.reportError(error, 'track', { event, properties });
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.identify(userId, traits);
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.capture('$pageview', {
        $current_url: window.location.href,
        $title: name || document.title,
        ...properties,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.group('company', groupId, traits);
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async alias(userId: string, _previousId: string): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.alias(userId);
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  // Feature Flag Methods
  async getAllFlags(userId?: string): Promise<Record<string, any>> {
    if (!this.isInitialized || !this.posthogInstance) {
      return {};
    }

    try {
      if (userId) {
        // If userId provided, identify first to ensure flags are for correct user
        await this.identify(userId);
      }

      return this.posthogInstance.getAllFlags() || {};
    } catch (_error) {
      return {};
    }
  }

  async getFeatureFlag(flag: string, userId?: string): Promise<any> {
    if (!this.isInitialized || !this.posthogInstance) {
      return false;
    }

    try {
      if (userId) {
        await this.identify(userId);
      }

      return this.posthogInstance.getFeatureFlag(flag);
    } catch (_error) {
      return false;
    }
  }

  async isFeatureEnabled(flag: string, userId?: string): Promise<boolean> {
    if (!this.isInitialized || !this.posthogInstance) {
      return false;
    }

    try {
      if (userId) {
        await this.identify(userId);
      }

      return this.posthogInstance.isFeatureEnabled(flag) || false;
    } catch (_error) {
      return false;
    }
  }

  async getFeatureFlagPayload(flag: string, userId?: string): Promise<any | null> {
    if (!this.isInitialized || !this.posthogInstance) {
      return null;
    }

    try {
      if (userId) {
        await this.identify(userId);
      }

      return this.posthogInstance.getFeatureFlagPayload(flag) || null;
    } catch (_error) {
      return null;
    }
  }

  async getActiveExperiments(userId?: string): Promise<ExperimentInfo[]> {
    if (!this.isInitialized || !this.posthogInstance) {
      return [];
    }

    try {
      if (userId) {
        await this.identify(userId);
      }

      const activeFlags = this.posthogInstance.getActiveMatchingFeatureFlags() || [];
      return activeFlags.map((flag: string) => ({
        key: flag,
        payload: this.posthogInstance.getFeatureFlagPayload(flag),
        variant: this.posthogInstance.getFeatureFlag(flag),
      }));
    } catch (_error) {
      return [];
    }
  }

  // Bootstrap method (not typically used on client, but included for completeness)
  async getBootstrapData(distinctId: string): Promise<BootstrapData> {
    if (!this.isInitialized || !this.posthogInstance) {
      return { distinctID: distinctId };
    }

    try {
      const _flags = await this.getAllFlags();

      return {
        distinctID: distinctId,
      };
    } catch (_error) {
      return { distinctID: distinctId };
    }
  }

  // Utility Methods
  reset(): void {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.reset();
    } catch (_error) {
      // Silently fail
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      if (this.posthogInstance.shutdown) {
        await this.posthogInstance.shutdown();
      }
    } catch (_error) {
      // Silently fail
    }
  }

  // Get distinct ID for bootstrap purposes
  getDistinctId(): string | null {
    if (!this.isInitialized || !this.posthogInstance) {
      return null;
    }

    try {
      return this.posthogInstance.get_distinct_id();
    } catch (_error) {
      return null;
    }
  }

  // Enhanced error handling and utility methods
  private async queueEvent(method: string, args: any[]) {
    this.retryQueue.push({ args, method });
    await this.log(`Queued ${method} event for retry: `, args);
  }

  private async flushRetryQueue() {
    await this.log(`Flushing retry queue with ${this.retryQueue.length} events`);

    while (this.retryQueue.length > 0) {
      const item = this.retryQueue.shift();
      if (!item) break;
      const { args, method } = item;
      try {
        await (this as any)[method](...args);
      } catch (_error) {
        // Re-queue failed events (limit retries)
        if (this.retryQueue.length < 100) {
          // Prevent infinite queue growth
          await this.queueEvent(method, args);
        }
        break;
      }
    }
  }

  private log(...args: any[]) {
    if (this.debugMode) {
      logDebug('PostHog Debug:', { args });
    }
  }

  private async validateEventProperties(event: string, properties: any) {
    // Check for reserved property names
    const reserved = ['$set', '$set_once', '$unset', 'distinct_id', '$groups'];
    const conflicts = Object.keys(properties).filter(
      key => reserved.includes(key) && !key.startsWith('$'),
    );

    if (conflicts.length > 0) {
      logWarn('PostHog: Properties may conflict with reserved names:', {
        conflicts: conflicts.join(', '),
        event,
      });
    }

    // Check for circular references
    try {
      JSON.stringify(properties);
    } catch (error) {
      logWarn('PostHog: Event properties contain circular references:', {
        event,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async reportError(error: any, method: string, context: any) {
    if (this.debugMode) {
      logError('PostHog Error:', error instanceof Error ? error : new Error(String(error)), {
        method,
        context,
      });
    }

    // Could emit error event to other analytics providers
    // this.emit('analytics_error', { provider: 'posthog', method, error: error.message, context });
  }

  // Consent management methods
  async optIn(): Promise<void> {
    if (this.posthogInstance) {
      this.posthogInstance.opt_in_capturing();
      await this.log('User opted in to tracking');
    }
  }

  async optOut(): Promise<void> {
    if (this.posthogInstance) {
      this.posthogInstance.opt_out_capturing();
      await this.log('User opted out of tracking');
    }
  }

  hasOptedOut(): boolean {
    return this.posthogInstance ? this.posthogInstance.has_opted_out_capturing() : false;
  }

  // Enhanced group analytics
  async groupIdentify(
    groupType: string,
    groupKey: string,
    groupProperties: any,
    options?: { setAsDefault?: boolean },
  ): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      await this.log('Group identify:', groupType, groupKey, groupProperties);

      // Set group properties
      this.posthogInstance.group(groupType, groupKey, groupProperties);

      // Optionally set as default group for user
      if (options?.setAsDefault) {
        this.posthogInstance.register({
          [`$groups`]: {
            [groupType]: groupKey,
          },
        });
      }
    } catch (error) {
      await this.reportError(error, 'groupIdentify', { groupKey, groupProperties, groupType });
    }
  }
}
