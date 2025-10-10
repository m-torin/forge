/**
 * Vercel Analytics Edge Runtime integration
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
import { validateVercelConfig } from './config';
import type { VercelAnalyticsConfig } from './types';

export class VercelEdgeAnalytics extends BaseProviderAdapter {
  constructor(
    config: VercelAnalyticsConfig,
    batchingConfig?: BatchingConfig,
    privacyConfig?: PrivacyConfig,
    retryConfig?: RetryConfig,
  ) {
    super(config, batchingConfig, privacyConfig, retryConfig);

    const validation = validateVercelConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid Vercel config: ${validation.errors.join(', ')}`);
    }
  }

  get provider() {
    return 'vercel' as const;
  }

  protected async doInitialize(): Promise<void> {
    // Edge runtime initialization
    // Limited functionality in edge runtime - mostly for logging and basic tracking
    this.log('info', 'Vercel Analytics edge adapter initialized');
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    try {
      // In edge runtime, we might queue events to be processed later
      // or send them to an API endpoint for processing
      const eventData = {
        name: event.name,
        properties: event.properties,
        timestamp: Date.now(),
        userId: event.userId,
        anonymousId: event.anonymousId,
      };

      this.log('debug', 'Edge event tracked', eventData);
      return true;
    } catch (error) {
      this.log('error', 'Failed to track event in edge runtime', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    try {
      this.log('debug', 'Edge user identified', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user in edge runtime', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    try {
      this.log('debug', 'Edge group identified', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group in edge runtime', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    try {
      this.log('debug', 'Edge page tracked', { name: payload.name });
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page in edge runtime', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    this.log('info', 'Vercel Analytics edge adapter destroyed');
  }
}

export function createEdgeAnalytics(config: VercelAnalyticsConfig) {
  return new VercelEdgeAnalytics(config);
}
