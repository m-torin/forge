/**
 * PostHog Edge Runtime integration
 */

import { BaseProviderAdapter } from '@repo/3p-core/adapters/base-adapter';
import type {
  AnalyticsEvent,
  BatchingConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
  PrivacyConfig,
  RetryConfig,
} from '@repo/3p-core/types';
import { validatePostHogConfig } from './config';
import type { PostHogConfig, PostHogEvent } from './types';

export class PostHogEdgeAnalytics extends BaseProviderAdapter {
  private eventQueue: PostHogEvent[] = [];

  constructor(
    config: PostHogConfig,
    batchingConfig?: BatchingConfig,
    privacyConfig?: PrivacyConfig,
    retryConfig?: RetryConfig,
  ) {
    super(config, batchingConfig, privacyConfig, retryConfig);

    const validation = validatePostHogConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid PostHog config: ${validation.errors.join(', ')}`);
    }
  }

  get provider() {
    return 'posthog' as const;
  }

  protected async doInitialize(): Promise<void> {
    // Edge runtime initialization - limited functionality
    this.log('info', 'PostHog edge adapter initialized');
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    try {
      const config = this.config as PostHogConfig;
      const posthogEvent = this.convertToPostHogEvent(event);

      // In edge runtime, we send events directly to PostHog's API
      const response = await fetch(`${config.host}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          event: posthogEvent.event,
          properties: posthogEvent.properties,
          distinct_id: posthogEvent.distinctId,
          timestamp: posthogEvent.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API request failed: ${response.statusText}`);
      }

      this.log('debug', 'Edge event tracked successfully', posthogEvent);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track event in edge runtime', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    try {
      const config = this.config as PostHogConfig;

      const response = await fetch(`${config.host}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          event: '$identify',
          properties: {
            $set: payload.traits,
            distinct_id: payload.userId,
          },
          distinct_id: payload.userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API request failed: ${response.statusText}`);
      }

      this.log('debug', 'Edge user identified successfully', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user in edge runtime', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    try {
      const config = this.config as PostHogConfig;
      const groupType = payload.groupId.split(':')[0] || 'company';
      const groupKey = payload.groupId.split(':')[1] || payload.groupId;

      const response = await fetch(`${config.host}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          event: '$groupidentify',
          properties: {
            $group_type: groupType,
            $group_key: groupKey,
            $group_set: payload.traits,
            distinct_id: payload.userId,
          },
          distinct_id: payload.userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API request failed: ${response.statusText}`);
      }

      this.log('debug', 'Edge group identified successfully', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group in edge runtime', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    try {
      const config = this.config as PostHogConfig;

      const response = await fetch(`${config.host}/capture/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          event: '$pageview',
          properties: {
            $current_url: payload.properties?.page_url,
            $title: payload.name,
            ...payload.properties,
          },
          distinct_id: payload.userId || 'anonymous',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API request failed: ${response.statusText}`);
      }

      this.log('debug', 'Edge page tracked successfully', payload);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page in edge runtime', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    // Flush any remaining events
    if (this.eventQueue.length > 0) {
      this.log('info', `Flushing ${this.eventQueue.length} remaining events`);
      await this.flushEvents();
    }

    this.log('info', 'PostHog edge adapter destroyed');
  }

  private convertToPostHogEvent(event: AnalyticsEvent): PostHogEvent {
    return {
      event: event.name,
      properties: event.properties,
      distinctId: event.userId || event.anonymousId || 'anonymous',
      timestamp: event.timestamp
        ? new Date(event.timestamp).toISOString()
        : new Date().toISOString(),
    };
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const config = this.config as PostHogConfig;
      const events = this.eventQueue.splice(0);

      const response = await fetch(`${config.host}/batch/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          batch: events.map(event => ({
            event: event.event,
            properties: event.properties,
            distinct_id: event.distinctId,
            timestamp: event.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog batch API request failed: ${response.statusText}`);
      }

      this.log('debug', `Flushed ${events.length} events successfully`);
    } catch (error) {
      this.log('error', 'Failed to flush events', error);
    }
  }

  // Edge-specific methods
  public async getFeatureFlag(
    flagKey: string,
    distinctId: string,
    groups?: Record<string, string>,
  ): Promise<boolean | string | undefined> {
    try {
      const config = this.config as PostHogConfig;

      const response = await fetch(`${config.host}/decide/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'posthog-edge/1.0.0',
        },
        body: JSON.stringify({
          api_key: config.apiKey,
          distinct_id: distinctId,
          groups: groups || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog decide API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.featureFlags?.[flagKey];
    } catch (error) {
      this.log('error', 'Failed to get feature flag in edge runtime', error);
      return undefined;
    }
  }

  public trackMiddleware(
    path: string,
    action: 'allow' | 'redirect' | 'rewrite' | 'block',
    distinctId?: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.track({
      name: 'Middleware Executed',
      properties: {
        middleware_path: path,
        middleware_action: action,
        runtime: 'edge',
        ...properties,
      },
      userId: distinctId,
      timestamp: new Date().toISOString(),
    });
  }
}

export function createEdgeAnalytics(config: PostHogConfig) {
  return new PostHogEdgeAnalytics(config);
}
