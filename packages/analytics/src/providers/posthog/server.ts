/**
 * PostHog server-side (Node.js) provider implementation with feature flags support
 */

import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type {
  BootstrapData,
  EnhancedPostHogProvider,
  ExperimentInfo,
  PostHogConfig,
} from './types';

export class PostHogServerProvider implements AnalyticsProvider, Partial<EnhancedPostHogProvider> {
  readonly name = 'posthog';
  private config: PostHogConfig;
  private client: any = null;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error('PostHog apiKey is required');
    }

    this.config = {
      apiKey: config.apiKey,
      options: {
        // Server-side optimizations for Next.js
        flushAt: 1,
        flushInterval: 0,
        ...config.options,
      },
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import PostHog Node.js SDK
      const { PostHog } = await import('posthog-node');

      // Extract client-side only options that don't apply to server
      const {
        api_host: _api_host,
        autocapture: _autocapture,
        bootstrap: _bootstrap,
        capture_pageview: _capture_pageview,
        cross_subdomain_cookie: _cross_subdomain_cookie,
        disable_session_recording: _disable_session_recording,
        fetch_options: _fetch_options,
        loaded: _loaded,
        persistence: _persistence,
        ui_host: _ui_host,
        ...serverOptions
      } = this.config.options || {};

      this.client = new PostHog(this.config.apiKey, {
        host: 'https://app.posthog.com',
        ...serverOptions,
      });

      this.isInitialized = true;
    } catch (_error) {
      throw new Error('PostHog Node.js SDK not available. Install with: npm install posthog-node');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.capture({
        distinctId: properties.userId || properties.distinctId || 'anonymous',
        event,
        properties,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.identify({
        distinctId: userId,
        properties: traits,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.capture({
        distinctId: properties.userId || properties.distinctId || 'anonymous',
        event: '$pageview',
        properties: {
          $current_url: properties.url,
          $title: name,
          ...properties,
        },
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.groupIdentify({
        groupKey: groupId,
        groupType: 'company',
        properties: traits,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      this.client.alias({
        alias: previousId,
        distinctId: userId,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  // Feature Flag Methods (Server-Side)
  async getAllFlags(userId: string): Promise<Record<string, any>> {
    if (!this.isInitialized || !this.client) {
      return {};
    }

    if (!userId) {
      return {};
    }

    try {
      const flags = await this.client.getAllFlags(userId);
      return flags || {};
    } catch (_error) {
      return {};
    }
  }

  async getFeatureFlag(flag: string, userId: string): Promise<any> {
    if (!this.isInitialized || !this.client) {
      return false;
    }

    if (!userId) {
      return false;
    }

    try {
      return await this.client.getFeatureFlag(flag, userId);
    } catch (_error) {
      return false;
    }
  }

  async isFeatureEnabled(flag: string, userId: string): Promise<boolean> {
    if (!this.isInitialized || !this.client) {
      return false;
    }

    if (!userId) {
      return false;
    }

    try {
      const flagValue = await this.client.isFeatureEnabled(flag, userId);
      return Boolean(flagValue);
    } catch (_error) {
      return false;
    }
  }

  async getFeatureFlagPayload(flag: string, userId?: string): Promise<any | null> {
    if (!this.isInitialized || !this.client) {
      return null;
    }

    if (!userId) {
      return null;
    }

    try {
      const payload = await this.client.getFeatureFlagPayload(flag, userId);
      return payload || null;
    } catch (_error) {
      return null;
    }
  }

  async getActiveExperiments(userId: string): Promise<ExperimentInfo[]> {
    if (!this.isInitialized || !this.client) {
      return [];
    }

    if (!userId) {
      return [];
    }

    try {
      const flags = await this.getAllFlags(userId);
      const experiments: ExperimentInfo[] = [];

      for (const [key, variant] of Object.entries(flags)) {
        if (variant !== false) {
          const payload = await this.getFeatureFlagPayload(key, userId);
          experiments.push({
            key,
            payload: payload || undefined,
            variant: typeof variant === 'object' ? JSON.stringify(variant) : String(variant),
          });
        }
      }

      return experiments;
    } catch (_error) {
      return [];
    }
  }

  // Bootstrap method - primary use case for server-side
  async getBootstrapData(distinctId: string): Promise<BootstrapData> {
    if (!this.isInitialized || !this.client) {
      return { distinctID: distinctId };
    }

    try {
      // Get all flags for the user
      const featureFlags = await this.getAllFlags(distinctId);

      // Get payloads for flags that have them
      const featureFlagPayloads: Record<string, any> = {};

      for (const [flagKey, flagValue] of Object.entries(featureFlags)) {
        if (flagValue !== false) {
          try {
            const payload = await this.getFeatureFlagPayload(flagKey, distinctId);
            if (payload) {
              featureFlagPayloads[flagKey] = payload;
            }
          } catch (_error) {
            // Continue if individual payload fetch fails - silently ignore
          }
        }
      }

      return {
        distinctID: distinctId,
      };
    } catch (_error) {
      return { distinctID: distinctId };
    }
  }

  // Utility Methods
  reset(): void {
    // Server-side reset doesn't make sense in the same way as client-side
    // But we can provide a method for consistency
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      await this.client.shutdown();
    } catch (_error) {
      // Silently fail
    }
  }

  // Server-specific helper methods
  async forceFlush(): Promise<void> {
    if (!this.isInitialized || !this.client) {
      return;
    }

    try {
      await this.client.flush();
    } catch (_error) {
      // Silently fail
    }
  }

  // Get the PostHog client for advanced usage
  getClient(): any {
    return this.client;
  }
}
