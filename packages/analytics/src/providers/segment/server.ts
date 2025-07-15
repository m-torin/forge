/**
 * Segment server-side (Node.js) provider implementation using @segment/analytics-next
 * Note: analytics-next supports universal runtime environments including Node.js
 */

import type { AnalyticsProvider, ProviderConfig } from '../../shared/types/types';
import type { SegmentConfig } from './types';

export class SegmentServerProvider implements AnalyticsProvider {
  readonly name = 'segment';
  private config: SegmentConfig;
  private analytics: any = null;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    if (!config.writeKey) {
      throw new Error('Segment writeKey is required');
    }

    this.config = {
      options: config.options,
      writeKey: config.writeKey,
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import Segment Analytics Next
      // analytics-next supports Node.js runtime with flushAt: 1 for server environments
      const { Analytics } = await import(
        /* webpackChunkName: "segment-analytics" */
        '@segment/analytics-next'
      );

      this.analytics = new Analytics({
        writeKey: this.config.writeKey,
        // Note: flushAt is not supported in @segment/analytics-next
        // Server-side events are sent immediately by default
        ...this.config.options,
      });

      this.isInitialized = true;
    } catch (_error) {
      throw new Error(
        'Segment Analytics Next not available. Install with: npm install @segment/analytics-next',
      );
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      return;
    }

    try {
      await this.analytics.track({
        event,
        properties,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      return;
    }

    try {
      await this.analytics.identify({
        traits,
        userId,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      return;
    }

    try {
      await this.analytics.page({
        name,
        properties,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      return;
    }

    try {
      await this.analytics.group({
        groupId,
        traits,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      return;
    }

    try {
      await this.analytics.alias({
        previousId,
        userId,
      });
    } catch (_error) {
      // Silently fail to avoid disrupting app flow
    }
  }
}
