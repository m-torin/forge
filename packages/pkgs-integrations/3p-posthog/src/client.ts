/**
 * PostHog client adapter
 */

import { BaseProviderAdapter } from '@repo/3p-core/adapters/base-adapter';
import type {
  AnalyticsEvent,
  BatchingConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  PrivacyConfig,
  ProviderType,
  RetryConfig,
} from '@repo/3p-core/types';

import { validatePostHogConfig } from './config';
import type { PostHogConfig, PostHogEvent } from './types';

export class PostHogAdapter extends BaseProviderAdapter {
  private posthog: any = null;
  private serverClient: any = null;
  private isServer: boolean;

  constructor(
    config: PostHogConfig,
    batchingConfig?: BatchingConfig,
    privacyConfig?: PrivacyConfig,
    retryConfig?: RetryConfig,
  ) {
    super(config, batchingConfig, privacyConfig, retryConfig);

    // Validate PostHog-specific config
    const validation = validatePostHogConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid PostHog config: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => this.log('warn', warning));
    }

    this.isServer = typeof window === 'undefined';
  }

  get provider(): ProviderType {
    return 'posthog';
  }

  protected async doInitialize(): Promise<void> {
    const config = this.config as PostHogConfig;

    if (this.isServer) {
      await this.initializeServer(config);
    } else {
      await this.initializeClient(config);
    }

    this.log(
      'info',
      `PostHog ${this.isServer ? 'server' : 'client'} adapter initialized successfully`,
    );
  }

  private async initializeClient(config: PostHogConfig): Promise<void> {
    try {
      // Dynamic import to avoid bundling when not needed
      const { default: posthog } = await import('posthog-js');

      this.posthog = posthog;

      // Initialize PostHog with config
      posthog.init(config.apiKey, {
        api_host: config.host,
        ui_host: config.ui_host,
        autocapture: config.autocapture,
        capture_pageview: config.capture_pageview,
        capture_pageleave: config.capture_pageleave,
        cross_subdomain_cookie: config.cross_subdomain_cookie,
        persistence: config.persistence,
        persistence_name: config.persistence_name,
        cookie_name: config.cookie_name,
        loaded: config.loaded,
        session_recording: config.session_recording,
        bootstrap: config.bootstrap,
        opt_out_useragent_filter: config.opt_out_useragent_filter,
        opt_out_capturing_by_default: config.opt_out_capturing_by_default,
        sanitize_properties: config.sanitize_properties,
        property_blacklist: config.property_blacklist,
        respect_dnt: config.respect_dnt,
        secure_cookie: config.secure_cookie,
        custom_campaign_params: config.custom_campaign_params,
        save_referrer: config.save_referrer,
        verbose: config.verbose || config.debug,
      });
    } catch (error) {
      throw new Error(`Failed to initialize PostHog client: ${(error as Error).message}`);
    }
  }

  private async initializeServer(config: PostHogConfig): Promise<void> {
    try {
      // Dynamic import for server-side PostHog
      const { PostHog } = await import('posthog-node');

      this.serverClient = new PostHog(config.apiKey, {
        host: config.host,
        flushAt: config.batchSize,
        flushInterval: config.flushInterval,
        personalApiKey: config.personalApiKey,
        projectId: config.projectId,
        requestTimeout: config.requestTimeout,
      });
    } catch (error) {
      throw new Error(`Failed to initialize PostHog server: ${(error as Error).message}`);
    }
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    if (!this.posthog && !this.serverClient) {
      this.log('error', 'PostHog not initialized');
      return false;
    }

    try {
      const posthogEvent = this.convertToPostHogEvent(event);

      if (this.isServer && this.serverClient) {
        this.serverClient.capture(posthogEvent);
      } else if (this.posthog) {
        this.posthog.capture(posthogEvent.event, posthogEvent.properties, {
          send_feature_flags: posthogEvent.sendFeatureFlags,
          timestamp: posthogEvent.timestamp,
          uuid: posthogEvent.uuid,
        });
      }

      this.log('debug', 'Event tracked successfully', posthogEvent);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track event', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    try {
      if (this.isServer && this.serverClient) {
        this.serverClient.identify({
          distinctId: payload.userId,
          properties: payload.traits,
        });
      } else if (this.posthog) {
        this.posthog.identify(payload.userId, payload.traits);
      }

      this.log('debug', 'User identified successfully', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    try {
      const groupType = payload.groupId.split(':')[0] || 'company';
      const groupKey = payload.groupId.split(':')[1] || payload.groupId;

      if (this.isServer && this.serverClient) {
        this.serverClient.groupIdentify({
          groupType,
          groupKey,
          properties: payload.traits,
          distinctId: payload.userId,
        });
      } else if (this.posthog) {
        this.posthog.group(groupType, groupKey, payload.traits);
      }

      this.log('debug', 'Group identified successfully', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    try {
      if (this.isServer && this.serverClient) {
        this.serverClient.capture({
          event: '$pageview',
          distinctId: payload.userId || 'anonymous',
          properties: {
            $current_url: payload.properties?.page_url,
            $title: payload.name,
            ...payload.properties,
          },
        });
      } else if (this.posthog) {
        // PostHog automatically captures pageviews if capture_pageview is enabled
        // We can still track custom page data
        if (payload.properties && Object.keys(payload.properties).length > 0) {
          this.posthog.capture('$pageview', {
            $current_url: payload.properties.page_url,
            $title: payload.name,
            ...payload.properties,
          });
        }
      }

      this.log('debug', 'Page tracked successfully', payload);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    try {
      if (this.serverClient) {
        await this.serverClient.shutdownAsync();
        this.serverClient = null;
      }

      if (this.posthog) {
        // PostHog client doesn't need explicit cleanup
        this.posthog = null;
      }

      this.log('info', 'PostHog adapter destroyed');
    } catch (error) {
      this.log('error', 'Error during PostHog adapter destruction', error);
    }
  }

  private convertToPostHogEvent(event: AnalyticsEvent): PostHogEvent {
    return {
      event: event.name,
      properties: event.properties,
      distinctId: event.userId || event.anonymousId,
      sendFeatureFlags: true,
      timestamp: event.timestamp
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString(),
    };
  }

  // PostHog-specific methods
  public async getFeatureFlag(
    flagKey: string,
    distinctId?: string,
    groups?: Record<string, string>,
  ): Promise<boolean | string | undefined> {
    try {
      if (this.isServer && this.serverClient) {
        return await this.serverClient.getFeatureFlag(flagKey, distinctId, groups);
      } else if (this.posthog) {
        return this.posthog.getFeatureFlag(flagKey);
      }
      return undefined;
    } catch (error) {
      this.log('error', 'Failed to get feature flag', error);
      return undefined;
    }
  }

  public async isFeatureEnabled(
    flagKey: string,
    distinctId?: string,
    groups?: Record<string, string>,
  ): Promise<boolean> {
    try {
      if (this.isServer && this.serverClient) {
        return await this.serverClient.isFeatureEnabled(flagKey, distinctId, groups);
      } else if (this.posthog) {
        return this.posthog.isFeatureEnabled(flagKey);
      }
      return false;
    } catch (error) {
      this.log('error', 'Failed to check feature flag', error);
      return false;
    }
  }

  public async getFeatureFlagPayload(
    flagKey: string,
    distinctId?: string,
    groups?: Record<string, string>,
  ): Promise<any> {
    try {
      if (this.isServer && this.serverClient) {
        return await this.serverClient.getFeatureFlagPayload(flagKey, distinctId, groups);
      } else if (this.posthog) {
        return this.posthog.getFeatureFlagPayload(flagKey);
      }
      return null;
    } catch (error) {
      this.log('error', 'Failed to get feature flag payload', error);
      return null;
    }
  }

  public reloadFeatureFlags(): void {
    try {
      if (this.posthog && !this.isServer) {
        this.posthog.reloadFeatureFlags();
      }
    } catch (error) {
      this.log('error', 'Failed to reload feature flags', error);
    }
  }

  public startSessionRecording(): void {
    try {
      if (this.posthog && !this.isServer) {
        this.posthog.startSessionRecording();
      }
    } catch (error) {
      this.log('error', 'Failed to start session recording', error);
    }
  }

  public stopSessionRecording(): void {
    try {
      if (this.posthog && !this.isServer) {
        this.posthog.stopSessionRecording();
      }
    } catch (error) {
      this.log('error', 'Failed to stop session recording', error);
    }
  }

  public getSessionId(): string | null {
    try {
      if (this.posthog && !this.isServer) {
        return this.posthog.get_session_id();
      }
      return null;
    } catch (error) {
      this.log('error', 'Failed to get session ID', error);
      return null;
    }
  }

  public reset(): void {
    try {
      if (this.posthog && !this.isServer) {
        this.posthog.reset();
      }
    } catch (error) {
      this.log('error', 'Failed to reset PostHog', error);
    }
  }

  public getConfig(): PostHogConfig {
    return this.config as PostHogConfig;
  }
}
