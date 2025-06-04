/**
 * Segment client-side (browser) provider implementation using @segment/analytics-next
 */

import type { AnalyticsProvider, ProviderConfig } from '../types';
import type { SegmentConfig } from './types';

export class SegmentClientProvider implements AnalyticsProvider {
  readonly name = 'segment';
  private config: SegmentConfig;
  private analytics: any = null;
  private isInitialized = false;

  constructor(config: ProviderConfig) {
    if (!config.writeKey) {
      throw new Error('Segment writeKey is required');
    }
    
    this.config = {
      writeKey: config.writeKey,
      options: config.options
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamically import Segment Analytics Next
      const { AnalyticsBrowser } = await import('@segment/analytics-next');
      
      // Initialize Analytics Browser
      this.analytics = AnalyticsBrowser.load({
        writeKey: this.config.writeKey,
        ...this.config.options
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Segment client provider:', error);
      throw new Error('Segment Analytics Next not available. Install with: npm install @segment/analytics-next');
    }
  }

  async track(event: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Segment not initialized, cannot track event:', event);
      return;
    }

    try {
      await this.analytics.track(event, properties);
    } catch (error) {
      console.error('Segment track error:', error);
    }
  }

  async identify(userId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Segment not initialized, cannot identify user');
      return;
    }

    try {
      await this.analytics.identify(userId, traits);
    } catch (error) {
      console.error('Segment identify error:', error);
    }
  }

  async page(name?: string, properties: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Segment not initialized, cannot track page');
      return;
    }

    try {
      await this.analytics.page(name, properties);
    } catch (error) {
      console.error('Segment page error:', error);
    }
  }

  async group(groupId: string, traits: any = {}): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Segment not initialized, cannot track group');
      return;
    }

    try {
      await this.analytics.group(groupId, traits);
    } catch (error) {
      console.error('Segment group error:', error);
    }
  }

  async alias(userId: string, previousId: string): Promise<void> {
    if (!this.isInitialized || !this.analytics) {
      console.warn('Segment not initialized, cannot alias user');
      return;
    }

    try {
      await this.analytics.alias(userId, previousId);
    } catch (error) {
      console.error('Segment alias error:', error);
    }
  }
}