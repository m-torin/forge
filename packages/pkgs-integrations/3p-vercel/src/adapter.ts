/**
 * Vercel Analytics Adapter - Standardized 3p-core implementation
 * Tree-shaking optimized with composable features
 */

import { BaseMinimalAdapter } from '@repo/3p-core/adapters/minimal-adapter';
import type {
  AnalyticsEvent,
  BaseProviderConfig,
  GroupPayload,
  IdentifyPayload,
  PagePayload,
} from '@repo/3p-core/types';

export interface VercelConfig extends BaseProviderConfig {
  provider: 'vercel';
  mode?: 'auto' | 'production' | 'development';
  beforeSend?: (event: { url: string; name?: string; data?: Record<string, any> }) => any;
  endpoint?: string;
  scriptSrc?: string;
}

export interface VercelWebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType?: string;
}

export class VercelAdapter extends BaseMinimalAdapter {
  private trackFunction: ((name: string, data?: Record<string, any>) => void) | null = null;

  constructor(config: VercelConfig) {
    super(config);
  }

  get provider() {
    return 'vercel' as const;
  }

  protected async doInitialize(): Promise<void> {
    try {
      // Dynamic import of the official @vercel/analytics package
      const { track } = await import('@vercel/analytics');
      this.trackFunction = track;
      this.log('info', 'Vercel Analytics initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Vercel Analytics: ${(error as Error).message}`);
    }
  }

  protected async doTrack(event: AnalyticsEvent): Promise<boolean> {
    if (!this.trackFunction) {
      this.log('error', 'Vercel Analytics not initialized');
      return false;
    }

    try {
      const eventData = this.sanitizeProperties(event.properties || {});

      if (Object.keys(eventData).length > 0) {
        this.trackFunction(event.name, eventData);
      } else {
        this.trackFunction(event.name);
      }

      this.log('debug', 'Event tracked successfully', { name: event.name, properties: eventData });
      return true;
    } catch (error) {
      this.log('error', 'Failed to track event', error);
      return false;
    }
  }

  protected async doIdentify(payload: IdentifyPayload): Promise<boolean> {
    // Vercel Analytics doesn't have native identify support
    // Track as a custom event instead
    try {
      if (!this.trackFunction) return false;

      this.trackFunction('User Identified', {
        user_id: payload.userId,
        ...this.sanitizeProperties(payload.traits || {}),
      });

      this.log('debug', 'User identified successfully', { userId: payload.userId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify user', error);
      return false;
    }
  }

  protected async doGroup(payload: GroupPayload): Promise<boolean> {
    // Vercel Analytics doesn't have native group support
    // Track as a custom event instead
    try {
      if (!this.trackFunction) return false;

      this.trackFunction('Group Identified', {
        group_id: payload.groupId,
        user_id: payload.userId,
        ...this.sanitizeProperties(payload.traits || {}),
      });

      this.log('debug', 'Group identified successfully', { groupId: payload.groupId });
      return true;
    } catch (error) {
      this.log('error', 'Failed to identify group', error);
      return false;
    }
  }

  protected async doPage(payload: PagePayload): Promise<boolean> {
    // Vercel Analytics automatically tracks page views when using <Analytics /> component
    // We can track additional page data as a custom event if properties are provided
    try {
      if (this.trackFunction && payload.properties && Object.keys(payload.properties).length > 0) {
        this.trackFunction('Page Viewed', {
          page_name: payload.name,
          page_category: payload.category,
          ...this.sanitizeProperties(payload.properties),
        });

        this.log('debug', 'Page tracked successfully', payload);
      }
      return true;
    } catch (error) {
      this.log('error', 'Failed to track page', error);
      return false;
    }
  }

  protected async doDestroy(): Promise<void> {
    // Vercel Analytics doesn't require explicit cleanup
    this.trackFunction = null;
    this.log('info', 'Vercel Analytics adapter destroyed');
  }

  // Vercel-specific features

  async trackWebVital(metric: VercelWebVitalsMetric): Promise<boolean> {
    try {
      if (!this.trackFunction) {
        await this.initialize();
      }

      if (this.trackFunction) {
        this.trackFunction('Web Vital', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
          navigation_type: metric.navigationType,
        });

        this.log('debug', 'Web vital tracked', metric);
        return true;
      }
      return false;
    } catch (error) {
      this.log('error', 'Failed to track web vital', error);
      return false;
    }
  }

  async trackWithFlags(name: string, data: Record<string, any>, flags: string[]): Promise<boolean> {
    try {
      // For client-side, we simulate feature flags by adding them to event data
      return this.doTrack({
        name,
        properties: {
          ...data,
          feature_flags: flags,
        },
      });
    } catch (error) {
      this.log('error', 'Failed to track with flags', error);
      return false;
    }
  }

  // Utility methods

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      // Vercel Analytics supports various data types
      if (value !== null && value !== undefined) {
        // Convert complex objects to strings for Vercel compatibility
        if (typeof value === 'object' && !Array.isArray(value)) {
          sanitized[key] = JSON.stringify(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  getConfig(): VercelConfig {
    return this.config as VercelConfig;
  }
}
