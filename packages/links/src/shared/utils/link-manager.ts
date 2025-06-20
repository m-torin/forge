/**
 * Link Manager
 * Coordinates between different link providers and handles caching/analytics
 */

import {
  LinkManager,
  LinkProvider,
  LinkConfig,
  CreateLinkRequest,
  UpdateLinkRequest,
  Link,
  LinkAnalytics,
  ClickEvent,
  BulkCreateRequest,
  BulkCreateResponse,
  LinkMetrics,
} from '../types/index';

export class LinkManagerClass implements LinkManager {
  private providers: Map<string, LinkProvider> = new Map();
  private config: LinkConfig;
  private defaultProvider: string | null = null;
  private analytics: any = null; // LinkAnalyticsIntegration

  constructor(config: LinkConfig) {
    this.config = config;
    this.initializeProviders();
    this.initializeAnalytics();
  }

  private async initializeProviders(): Promise<void> {
    // Initialize Dub provider if configured
    if (this.config.providers.dub?.enabled) {
      const { DubProvider } = await import('../providers/dub-provider');
      const provider = new DubProvider(this.config.providers.dub);
      this.providers.set('dub', provider);

      if (!this.defaultProvider) {
        this.defaultProvider = 'dub';
      }
    }

    if (this.providers.size === 0) {
      throw new Error('No link providers configured. Please enable at least one provider.');
    }
  }

  private async initializeAnalytics(): Promise<void> {
    if (!this.config.analytics?.enabled) return;

    try {
      const { createAnalyticsIntegration } = await import('./analytics-integration');
      this.analytics = createAnalyticsIntegration(this.config.analytics);
    } catch (error: any) {
      const { linksLogger } = await import('./logger');
      void linksLogger.debug('Analytics integration not available', {
        operation: 'initialize_analytics',
        error,
      });
      // Graceful degradation - links work without analytics
    }
  }

  private getProvider(providerName?: string): LinkProvider {
    const name = providerName || this.defaultProvider;
    if (!name) {
      throw new Error('No default provider available');
    }

    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found or not configured`);
    }

    return provider;
  }

  async createLink(request: CreateLinkRequest, providerName?: string): Promise<Link> {
    const provider = this.getProvider(providerName);
    const link = await provider.createLink(request);

    // Track creation event with analytics (non-blocking)
    await this.trackAnalyticsEvent({
      event: 'link_created',
      linkId: link.id,
      shortUrl: link.shortLink,
      originalUrl: link.url,
      domain: link.domain,
      key: link.key,
      title: link.title,
      tags: link.tags,
      utm: link.utm,
      expiresAt: link.expiresAt,
      workspace: link.workspaceId,
      timestamp: new Date(),
    });

    return link;
  }

  async getLink(id: string, providerName?: string): Promise<Link | null> {
    const provider = this.getProvider(providerName);
    return provider.getLink(id);
  }

  async getLinkByKey(key: string, domain?: string, providerName?: string): Promise<Link | null> {
    // This might need to be implemented differently depending on the provider
    // For now, we'll try to construct the ID from domain and key
    const provider = this.getProvider(providerName);

    // For Dub, we might need to search or use a different approach
    // This is a simplified implementation
    try {
      return await provider.getLink(`${domain || 'dub.sh'}:${key}`);
    } catch {
      return null;
    }
  }

  async updateLink(id: string, request: UpdateLinkRequest, providerName?: string): Promise<Link> {
    const provider = this.getProvider(providerName);
    const link = await provider.updateLink(id, request);

    // Track update event with analytics (non-blocking)
    await this.trackAnalyticsEvent({
      event: 'link_updated',
      linkId: link.id,
      shortUrl: link.shortLink,
      changes: request,
      timestamp: new Date(),
    });

    return link;
  }

  async deleteLink(id: string, providerName?: string): Promise<void> {
    const provider = this.getProvider(providerName);

    // Get link details before deletion for tracking
    const link = await provider.getLink(id);

    await provider.deleteLink(id);

    // Track deletion event with analytics (non-blocking)
    if (link) {
      await this.trackAnalyticsEvent({
        event: 'link_deleted',
        linkId: link.id,
        shortUrl: link.shortLink,
        originalUrl: link.url,
        finalStats: {
          totalClicks: link.clicks,
          uniqueClicks: link.clicks, // Simplified for now
          lifespan: Math.floor((Date.now() - link.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        },
        timestamp: new Date(),
      });
    }
  }

  async getAnalytics(
    _id: string,
    interval: '1h' | '24h' | '7d' | '30d' | '90d' | 'all' = '7d',
    _providerName?: string,
  ): Promise<LinkAnalytics> {
    const provider = this.getProvider(_providerName);
    return provider.getAnalytics(_id, interval);
  }

  async getClicks(
    _id: string,
    page = 1,
    pageSize = 100,
    _providerName?: string,
  ): Promise<ClickEvent[]> {
    const provider = this.getProvider(_providerName);
    return provider.getClicks(_id, page, pageSize);
  }

  async getMetrics(id: string, providerName?: string): Promise<LinkMetrics> {
    const provider = this.getProvider(providerName);

    const [link, analytics] = await Promise.all([
      provider.getLink(id),
      provider.getAnalytics(id, '30d'),
    ]);

    if (!link) {
      throw new Error(`Link with id "${id}" not found`);
    }

    // Get time series data for the last 30 days
    const timeSeries = await this.getTimeSeriesData(id, providerName);

    return {
      link,
      analytics,
      timeSeries,
    };
  }

  async bulkCreate(request: BulkCreateRequest, providerName?: string): Promise<BulkCreateResponse> {
    const provider = this.getProvider(providerName);

    if (provider.bulkCreate) {
      const result = await provider.bulkCreate(request);

      // Track bulk creation event with analytics (non-blocking)
      await this.trackAnalyticsEvent({
        event: 'bulk_created',
        totalLinks: request.links.length,
        successfulLinks: result.created.length,
        failedLinks: result.errors.length,
        domains: [...new Set(result.created.map((link: any) => link.domain))],
        tags: [...new Set(request.links.flatMap((req: any) => req.tags || []))],
        timestamp: new Date(),
      });

      // Track individual link creation events
      for (const link of result.created) {
        await this.trackAnalyticsEvent({
          event: 'link_created',
          linkId: link.id,
          shortUrl: link.shortLink,
          originalUrl: link.url,
          domain: link.domain,
          key: link.key,
          title: link.title,
          tags: link.tags,
          utm: link.utm,
          workspace: link.workspaceId,
          timestamp: new Date(),
        });
      }

      return result;
    }

    // Fallback to individual creation if bulk is not supported
    const results: BulkCreateResponse = {
      created: [],
      errors: [],
    };

    for (const linkRequest of request.links) {
      try {
        const link = await provider.createLink(linkRequest);
        results.created.push(link);
        await this.trackAnalyticsEvent({
          event: 'link_created',
          linkId: link.id,
          shortUrl: link.shortLink,
          originalUrl: link.url,
          domain: link.domain,
          key: link.key,
          title: link.title,
          tags: link.tags,
          utm: link.utm,
          workspace: link.workspaceId,
          timestamp: new Date(),
        });
      } catch (error: any) {
        results.errors.push({
          url: linkRequest.url,
          error:
            error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error),
        });
      }
    }

    return results;
  }

  async trackClick(
    linkId: string,
    event: Partial<ClickEvent>,
    providerName?: string,
  ): Promise<void> {
    // Get link details for tracking
    const link = await this.getLink(linkId, providerName);

    if (link) {
      // Track click event with analytics (non-blocking)
      await this.trackAnalyticsEvent({
        event: 'link_clicked',
        linkId: link.id,
        shortUrl: link.shortLink,
        originalUrl: link.url,
        country: event.country,
        city: event.city,
        region: event.region,
        latitude: event.latitude,
        longitude: event.longitude,
        browser: event.browser,
        os: event.os,
        device: event.device,
        userAgent: event.ua,
        referrer: event.referrer,
        referrerUrl: event.referrerUrl,
        ip: event.ip,
        timestamp: new Date(),
      });
    }
  }

  private async getTimeSeriesData(
    id: string,
    providerName?: string,
  ): Promise<Array<{ start: Date; clicks: number }>> {
    // This would fetch time series data from the provider
    // For now, return empty array as this might require additional API calls
    return [];
  }

  private async trackAnalyticsEvent(eventData: any): Promise<void> {
    if (!this.analytics) return;

    try {
      await this.analytics.track(eventData);
    } catch (error: any) {
      // Silent failure to avoid impacting link functionality
      console.debug('[LinkManager] Analytics tracking failed (non-critical): ', error);
    }
  }

  // Utility methods
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getDefaultProvider(): string | null {
    return this.defaultProvider;
  }

  setDefaultProvider(providerName: string): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`Provider "${providerName}" not found`);
    }
    this.defaultProvider = providerName;
  }
}

// Factory function to create link manager
export async function createLinkManager(config: LinkConfig): Promise<LinkManager> {
  const manager = new LinkManagerClass(config);
  return manager;
}
