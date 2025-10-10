/**
 * Segment Edge Runtime integration
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
import { validateSegmentConfig } from './config';
import type { SegmentConfig } from './types';

export class SegmentEdgeAnalytics extends BaseProviderAdapter {
  constructor(
    config: SegmentConfig,
    batchingConfig?: BatchingConfig,
    privacyConfig?: PrivacyConfig,
    retryConfig?: RetryConfig,
  ) {
    super(config, batchingConfig, privacyConfig, retryConfig);

    const validation = validateSegmentConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid Segment config: ${validation.errors.join(', ')}`);
    }
  }

  get provider() {
    return 'segment' as const;
  }

  protected async doInitialize(): Promise<void> {
    this.log('info', 'Segment edge adapter initialized');
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    return this.sendToSegment('track', {
      event: event.name,
      properties: event.properties,
      userId: event.userId,
      anonymousId: event.anonymousId,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    return this.sendToSegment('identify', {
      userId: payload.userId,
      traits: payload.traits,
      timestamp: payload.timestamp || new Date().toISOString(),
    });
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    return this.sendToSegment('group', {
      groupId: payload.groupId,
      traits: payload.traits,
      userId: payload.userId,
      timestamp: payload.timestamp || new Date().toISOString(),
    });
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    return this.sendToSegment('page', {
      name: payload.name,
      category: payload.category,
      properties: payload.properties,
      userId: payload.userId,
      timestamp: payload.timestamp || new Date().toISOString(),
    });
  }

  protected async doDestroy(): Promise<void> {
    this.log('info', 'Segment edge adapter destroyed');
  }

  private async sendToSegment(type: string, payload: any): Promise<boolean> {
    try {
      const config = this.config as SegmentConfig;
      const endpoint = config.dataplane || config.endpoint || 'https://api.segment.io';

      const response = await fetch(`${endpoint}/v1/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(config.writeKey + ':')}`,
        },
        body: JSON.stringify({
          ...payload,
          context: {
            library: {
              name: '@repo/3p-segment',
              version: '0.1.0',
            },
          },
          messageId: 'edge-' + Math.random().toString(36).substr(2, 9),
        }),
      });

      if (!response.ok) {
        throw new Error(`Segment API request failed: ${response.statusText}`);
      }

      this.log('debug', `Edge ${type} event sent successfully`);
      return true;
    } catch (error) {
      this.log('error', `Failed to send ${type} event in edge runtime`, error);
      return false;
    }
  }
}

export function createEdgeAnalytics(config: SegmentConfig) {
  return new SegmentEdgeAnalytics(config);
}
