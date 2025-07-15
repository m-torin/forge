/**
 * Analytics Integration Utility
 * Non-blocking integration with @repo/analytics package
 */

import { logDebug } from '@repo/observability/server/next';
import {
  AnalyticsConfig,
  AnalyticsIntegration,
  AnalyticsManager,
  LinkAnalyticsEventData,
} from '../types/analytics-integration';

export class LinkAnalyticsIntegration implements AnalyticsIntegration {
  private analytics: AnalyticsManager | null = null;
  private config: AnalyticsConfig;
  private eventQueue: LinkAnalyticsEventData[] = [];
  private isProcessing = false;

  constructor(config: AnalyticsConfig) {
    this.config = {
      events: ['link_created', 'link_clicked', 'link_deleted'],
      sampling: 1.0,
      debugMode: false,
      ...config,
    };

    // Initialize analytics provider if provided
    if (this.config.provider) {
      this.analytics = this.config.provider;
    } else if (this.config.enabled) {
      // Try to lazy load analytics package
      this.initializeAnalyticsProvider();
    }
  }

  private async initializeAnalyticsProvider(): Promise<void> {
    try {
      // Attempt to load analytics package without breaking if it's not available
      const analyticsModule = await import('@repo/analytics/server/next').catch(() => null);

      if (analyticsModule?.createServerAnalytics) {
        // Create a minimal analytics wrapper
        const observability = await analyticsModule.createServerAnalytics({
          providers: {
            console: {
              /* enabled: this.config.debugMode */
            }, // Removed: property doesn't exist
          },
        });

        this.analytics = {
          track: async (event: string, properties?: Record<string, any>) => {
            // await observability.log('info', `Link Event: ${event}`, properties); // Commented: log method doesn't exist
            await observability.track(event, properties);
          },
        };

        if (this.config.debugMode) {
          logDebug('Analytics provider initialized', { provider: this.config.provider });
        }
      }
    } catch (_error: any) {
      if (this.config.debugMode) {
        logDebug('Analytics provider not available', { reason: 'Missing configuration' });
      }
      // Graceful degradation - links package continues to work
    }
  }

  async track(eventData: LinkAnalyticsEventData): Promise<void> {
    // Return early if analytics is disabled
    if (!this.config.enabled) return;

    // Check if this event type should be tracked
    if (this.config.events && !this.config.events.includes(eventData.event)) {
      return;
    }

    // Apply sampling
    if (this.config.sampling && Math.random() > this.config.sampling) {
      return;
    }

    // Non-blocking execution
    setImmediate(() => this.processEvent(eventData));
  }

  private async processEvent(eventData: LinkAnalyticsEventData): Promise<void> {
    try {
      if (!this.analytics) {
        // Queue events for later processing if analytics isn't ready
        this.eventQueue.push(eventData);
        this.processQueuedEvents();
        return;
      }

      // Convert link event to analytics event format
      const analyticsEvent = this.transformEventForAnalytics(eventData);

      // Track the event (non-blocking for link operations)
      await this.analytics.track(analyticsEvent.name, analyticsEvent.properties);

      if (this.config.debugMode) {
        logDebug('[LinkAnalytics] Event tracked', { event: analyticsEvent });
      }
    } catch (error: any) {
      if (this.config.debugMode) {
        logDebug('[LinkAnalytics] Event tracking failed (non-critical)', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
      // Silent failure to avoid impacting link functionality
    }
  }

  private async processQueuedEvents(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      for (const event of eventsToProcess) {
        await this.processEvent(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private transformEventForAnalytics(eventData: LinkAnalyticsEventData): {
    name: string;
    properties: Record<string, any>;
  } {
    const baseProperties = {
      timestamp: eventData.timestamp,
      source: 'links_package',
    };

    switch (eventData.event) {
      case 'link_created':
        return {
          name: 'Link Created',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            original_url: eventData.originalUrl,
            domain: eventData.domain,
            key: eventData.key,
            title: eventData.title,
            tags: eventData.tags,
            utm_source: eventData.utm?.source,
            utm_medium: eventData.utm?.medium,
            utm_campaign: eventData.utm?.campaign,
            utm_term: eventData.utm?.term,
            utm_content: eventData.utm?.content,
            expires_at: eventData.expiresAt,
            created_by: eventData.createdBy,
            workspace: eventData.workspace,
          },
        };

      case 'link_clicked':
        return {
          name: 'Link Clicked',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            original_url: eventData.originalUrl,
            click_id: eventData.clickId,
            country: eventData.country,
            city: eventData.city,
            region: eventData.region,
            latitude: eventData.latitude,
            longitude: eventData.longitude,
            browser: eventData.browser,
            os: eventData.os,
            device: eventData.device,
            user_agent: eventData.userAgent,
            referrer: eventData.referrer,
            referrer_url: eventData.referrerUrl,
            user_id: eventData.userId,
            session_id: eventData.sessionId,
            visitor_id: eventData.visitorId,
            utm_source: eventData.utmSource,
            utm_medium: eventData.utmMedium,
            utm_campaign: eventData.utmCampaign,
            utm_term: eventData.utmTerm,
            utm_content: eventData.utmContent,
            ip: eventData.ip,
          },
        };

      case 'link_updated':
        return {
          name: 'Link Updated',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            changes: eventData.changes,
            updated_by: eventData.updatedBy,
          },
        };

      case 'link_deleted':
        return {
          name: 'Link Deleted',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            original_url: eventData.originalUrl,
            deleted_by: eventData.deletedBy,
            total_clicks: eventData.finalStats?.totalClicks,
            unique_clicks: eventData.finalStats?.uniqueClicks,
            lifespan_days: eventData.finalStats?.lifespan,
          },
        };

      case 'link_expired':
        return {
          name: 'Link Expired',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            original_url: eventData.originalUrl,
            expired_at: eventData.expiredAt,
            total_clicks: eventData.finalStats?.totalClicks,
            unique_clicks: eventData.finalStats?.uniqueClicks,
          },
        };

      case 'bulk_created':
        return {
          name: 'Links Bulk Created',
          properties: {
            ...baseProperties,
            total_links: eventData.totalLinks,
            successful_links: eventData.successfulLinks,
            failed_links: eventData.failedLinks,
            domains: eventData.domains,
            tags: eventData.tags,
            created_by: eventData.createdBy,
          },
        };

      case 'redirect_processed':
        return {
          name: 'Link Redirect Processed',
          properties: {
            ...baseProperties,
            link_id: eventData.linkId,
            short_url: eventData.shortUrl,
            original_url: eventData.originalUrl,
            redirect_type: eventData.redirectType,
            response_time_ms: eventData.responseTime,
          },
        };

      default:
        return {
          name: 'Link Event',
          properties: {
            ...baseProperties,
            event_type: (eventData as any).event,
            ...(eventData as any),
          },
        };
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (!this.config.enabled || !this.analytics?.identify) return;

    try {
      await this.analytics.identify(userId, traits);
    } catch (error: any) {
      if (this.config.debugMode) {
        logDebug('[LinkAnalytics] User identification failed (non-critical)', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  async getAttributionContext(): Promise<{
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
    };
    referrer?: string;
    sessionId?: string;
  }> {
    // This would integrate with analytics package to get current attribution context
    // For now, return empty object as fallback
    try {
      // In a real implementation, this would call analytics package methods
      // const context = await this.analytics.getAttributionContext?.();
      // return context || {};
      return {};
    } catch {
      return {};
    }
  }

  // Utility methods
  isEnabled(): boolean {
    return this.config.enabled;
  }

  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.provider) {
      this.analytics = newConfig.provider;
    }
  }

  getQueueLength(): number {
    return this.eventQueue.length;
  }

  async flush(): Promise<void> {
    await this.processQueuedEvents();
  }
}

// Factory function for creating analytics integration
export function createAnalyticsIntegration(config: AnalyticsConfig): LinkAnalyticsIntegration {
  return new LinkAnalyticsIntegration(config);
}

// Helper function to check if analytics package is available
export async function isAnalyticsAvailable(): Promise<boolean> {
  try {
    await import('@repo/analytics/server');
    return true;
  } catch {
    return false;
  }
}
