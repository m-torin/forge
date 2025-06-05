/**
 * PostHog client-side (browser) provider implementation with feature flags support
 */

import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type { 
  PostHogConfig, 
  FeatureFlags, 
  FeatureFlagPayload, 
  ExperimentInfo,
  BootstrapData,
  EnhancedPostHogProvider 
} from '../../shared/types/posthog-types';

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
  private retryQueue: Array<{ method: string; args: any[] }> = [];
  private isOnline = true;
  private debugMode = false;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('PostHog apiKey is required');
    }
    
    this.config = {
      apiKey: config.apiKey,
      options: config.options
    };

    // Set up debug mode
    this.debugMode = config.options?.debug || 
                    (typeof window !== 'undefined' && 
                     window.location.search.includes('debug=posthog'));

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
        ui_host: 'https://app.posthog.com',
        capture_pageview: false, // We handle pageviews manually
        capture_pageleave: true, // Important for engagement tracking
        
        // Privacy & GDPR compliance
        person_profiles: 'identified_only', // GDPR-friendly default
        opt_in_site_apps: false, // Conservative default
        respect_dnt: true, // Respect Do Not Track headers
        
        // Performance optimizations
        uuid_version: 'v7', // Better performance than v4
        request_batching: true, // Batch requests for better performance
        batch_flush_interval_ms: 10000, // 10 second batching
        
        // Session recording with safe defaults
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true, // Always mask passwords
            email: false,
            number: false,
            text: false
          },
          recordCrossOriginIframes: false, // Conservative default
          recordCanvas: false, // Performance consideration
          sampling: {
            minimumDurationMs: 1000, // Only record sessions > 1s
            sampleRate: 1.0 // Record all sessions by default
          }
        },
        
        // Debug mode
        debug: this.debugMode,
        
        // Apply user configuration (this will override defaults)
        ...this.config.options,
        
        // Add bootstrap data if available (must be last to not be overridden)
        ...(bootstrap && {
          bootstrap: {
            distinctID: bootstrap.distinctID,
            featureFlags: bootstrap.featureFlags,
            featureFlagPayloads: bootstrap.featureFlagPayloads
          }
        })
      };
      
      posthog.init(this.config.apiKey, initOptions);
      
      // Store instance references
      this.posthogInstance = posthog;
      window.posthog = posthog as any;
      
      this.isInitialized = true;
    } catch (error) {
      throw new Error('PostHog JS SDK not available. Install with: npm install posthog-js');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      this.queueEvent('track', [event, properties]);
      return;
    }

    try {
      // Debug logging
      this.log('Tracking event:', event, properties);
      
      // Validate properties in debug mode
      if (this.debugMode) {
        this.validateEventProperties(event, properties);
      }
      
      this.posthogInstance.capture(event, properties);
    } catch (error) {
      // Queue event if offline
      if (!this.isOnline) {
        this.queueEvent('track', [event, properties]);
      }
      
      // Enhanced error reporting
      this.reportError(error, 'track', { event, properties });
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.identify(userId, traits);
    } catch (error) {
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
        ...properties
      });
    } catch (error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.group('company', groupId, traits);
    } catch (error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.posthogInstance.alias(userId);
    } catch (error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  // Feature Flag Methods
  async getAllFlags(userId?: string): Promise<FeatureFlags> {
    if (!this.isInitialized || !this.posthogInstance) {
      return {};
    }

    try {
      if (userId) {
        // If userId provided, identify first to ensure flags are for correct user
        await this.identify(userId);
      }
      
      return this.posthogInstance.getAllFlags() || {};
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return false;
    }
  }

  async getFeatureFlagPayload(flag: string, userId?: string): Promise<FeatureFlagPayload | null> {
    if (!this.isInitialized || !this.posthogInstance) {
      return null;
    }

    try {
      if (userId) {
        await this.identify(userId);
      }
      
      return this.posthogInstance.getFeatureFlagPayload(flag) || null;
    } catch (error) {
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
        variant: this.posthogInstance.getFeatureFlag(flag),
        payload: this.posthogInstance.getFeatureFlagPayload(flag)
      }));
    } catch (error) {
      return [];
    }
  }

  // Bootstrap method (not typically used on client, but included for completeness)
  async getBootstrapData(distinctId: string): Promise<BootstrapData> {
    if (!this.isInitialized || !this.posthogInstance) {
      return { distinctID: distinctId };
    }

    try {
      const flags = await this.getAllFlags();
      
      return {
        distinctID: distinctId,
        featureFlags: flags,
        featureFlagPayloads: {}
      };
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      return null;
    }
  }

  // Enhanced error handling and utility methods
  private queueEvent(method: string, args: any[]) {
    this.retryQueue.push({ method, args });
    this.log(`Queued ${method} event for retry:`, args);
  }

  private async flushRetryQueue() {
    this.log(`Flushing retry queue with ${this.retryQueue.length} events`);
    
    while (this.retryQueue.length > 0) {
      const { method, args } = this.retryQueue.shift()!;
      try {
        await (this as any)[method](...args);
      } catch (error) {
        // Re-queue failed events (limit retries)
        if (this.retryQueue.length < 100) { // Prevent infinite queue growth
          this.queueEvent(method, args);
        }
        break;
      }
    }
  }

  private log(...args: any[]) {
    if (this.debugMode) {
      console.log('[PostHog Debug]', ...args);
    }
  }

  private validateEventProperties(event: string, properties: any) {
    // Check for reserved property names
    const reserved = ['$set', '$set_once', '$unset', 'distinct_id', '$groups'];
    const conflicts = Object.keys(properties).filter(key => 
      reserved.includes(key) && !key.startsWith('$')
    );
    
    if (conflicts.length > 0) {
      console.warn(`PostHog: Properties ${conflicts.join(', ')} may conflict with reserved names`);
    }

    // Check for circular references
    try {
      JSON.stringify(properties);
    } catch (error) {
      console.warn('PostHog: Event properties contain circular references', properties);
    }
  }

  private reportError(error: any, method: string, context: any) {
    if (this.debugMode) {
      console.error(`[PostHog Error] ${method}:`, error, context);
    }
    
    // Could emit error event to other analytics providers
    // this.emit('analytics_error', { provider: 'posthog', method, error: error.message, context });
  }

  // Consent management methods
  async optIn(): Promise<void> {
    if (this.posthogInstance) {
      this.posthogInstance.opt_in_capturing();
      this.log('User opted in to tracking');
    }
  }

  async optOut(): Promise<void> {
    if (this.posthogInstance) {
      this.posthogInstance.opt_out_capturing();
      this.log('User opted out of tracking');
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
    options?: { setAsDefault?: boolean }
  ): Promise<void> {
    if (!this.isInitialized || !this.posthogInstance) {
      return;
    }

    try {
      this.log('Group identify:', groupType, groupKey, groupProperties);
      
      // Set group properties
      this.posthogInstance.group(groupType, groupKey, groupProperties);
      
      // Optionally set as default group for user
      if (options?.setAsDefault) {
        this.posthogInstance.register({
          [`$groups`]: {
            [groupType]: groupKey
          }
        });
      }
    } catch (error) {
      this.reportError(error, 'groupIdentify', { groupType, groupKey, groupProperties });
    }
  }
}