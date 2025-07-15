/**
 * Dub.co Provider Implementation
 * Integrates with Dub's API for URL shortening and analytics
 */

import {
  BulkCreateRequest,
  BulkCreateResponse,
  ClickEvent,
  CreateLinkRequest,
  DubProviderConfig,
  Link,
  LinkAnalytics,
  LinkProvider,
  UpdateLinkRequest,
} from '../types/index';

export class DubProvider implements LinkProvider {
  public readonly name = 'dub';

  private config: DubProviderConfig;
  private dubClient: any = null;

  constructor(config: DubProviderConfig, injectedClient?: any) {
    this.config = {
      baseUrl: 'https://api.dub.co',
      defaultDomain: 'dub.sh',
      ...config,
    };

    // Allow injected client for testing
    if (injectedClient) {
      this.dubClient = injectedClient;
    }
  }

  private async getDubClient() {
    if (!this.dubClient) {
      try {
        const { Dub } = await import('dub');
        this.dubClient = new Dub({
          token: this.config.apiKey,
        });
      } catch (_error) {
        throw new Error('Dub SDK not found. Install it with: pnpm add @dub/sdk');
      }
    }
    return this.dubClient;
  }

  async createLink(request: CreateLinkRequest): Promise<Link> {
    const client = await this.getDubClient();

    const payload = {
      url: request.url,
      domain: request.domain || this.config.defaultDomain,
      key: request.key,
      prefix: request.prefix,
      trackConversion: request.trackConversion,
      publicStats: request.publicStats,
      tagIds: request.tagIds,
      comments: request.comments,
      expiresAt: request.expiresAt,
      expiredUrl: request.expiredUrl,
      password: request.password,
      proxy: request.proxy,
      title: request.title,
      description: request.description,
      image: request.image,
      video: request.video,
      ios: request.ios,
      android: request.android,
      geo: request.geo,
      utm: request.utm,
    };

    try {
      const response = await client.links.create(payload);
      return this.transformDubLinkToLink(response);
    } catch (error: any) {
      throw new Error(
        `Failed to create link: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async getLink(id: string): Promise<Link | null> {
    const client = await this.getDubClient();

    try {
      const response = await client.links.get(id);
      return this.transformDubLinkToLink(response);
    } catch (error: any) {
      if (
        error instanceof Error &&
        ((error as Error)?.message || 'Unknown error').includes('404')
      ) {
        return null;
      }
      throw new Error(
        `Failed to get link: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async updateLink(id: string, request: UpdateLinkRequest): Promise<Link> {
    const client = await this.getDubClient();

    try {
      const response = await client.links.update(id, request);
      return this.transformDubLinkToLink(response);
    } catch (error: any) {
      throw new Error(
        `Failed to update link: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async deleteLink(id: string): Promise<void> {
    const client = await this.getDubClient();

    try {
      await client.links.delete(id);
    } catch (error: any) {
      throw new Error(
        `Failed to delete link: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async getAnalytics(
    id: string,
    interval: '1h' | '24h' | '7d' | '30d' | '90d' | 'all' = '7d',
  ): Promise<LinkAnalytics> {
    const client = await this.getDubClient();

    try {
      const [
        clicksData,
        countriesData,
        citiesData,
        referrersData,
        browsersData,
        osData,
        devicesData,
      ] = await Promise.all([
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'timeseries',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'countries',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'cities',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'referers',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'browsers',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'os',
        }),
        client.analytics.retrieve({
          linkId: id,
          interval,
          groupBy: 'devices',
        }),
      ]);

      return {
        clicks: clicksData.reduce((sum: number, item: any) => sum + item.clicks, 0),
        uniqueClicks: clicksData.reduce(
          (sum: number, item: any) => sum + (item.uniqueClicks || 0),
          0,
        ),
        topCountries: countriesData.map((item: any) => ({
          country: item.country,
          clicks: item.clicks,
        })),
        topCities: citiesData.map((item: any) => ({
          city: item.city,
          country: item.country,
          clicks: item.clicks,
        })),
        topReferrers: referrersData.map((item: any) => ({
          referrer: item.referer,
          clicks: item.clicks,
        })),
        topBrowsers: browsersData.map((item: any) => ({
          browser: item.browser,
          clicks: item.clicks,
        })),
        topOs: osData.map((item: any) => ({
          os: item.os,
          clicks: item.clicks,
        })),
        topDevices: devicesData.map((item: any) => ({
          device: item.device,
          clicks: item.clicks,
        })),
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get analytics: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async getClicks(id: string, page = 1, pageSize = 100): Promise<ClickEvent[]> {
    const client = await this.getDubClient();

    try {
      const response = await client.links.getClicks(id, {
        page,
        pageSize,
      });

      return response.map((click: any) => ({
        timestamp: new Date(click.timestamp),
        country: click.country,
        city: click.city,
        region: click.region,
        latitude: click.latitude,
        longitude: click.longitude,
        os: click.os,
        device: click.device,
        browser: click.browser,
        referrer: click.referer,
        referrerUrl: click.refererUrl,
        ip: click.ip,
        ua: click.ua,
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to get clicks: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  async bulkCreate(request: BulkCreateRequest): Promise<BulkCreateResponse> {
    const client = await this.getDubClient();

    try {
      const response = await client.links.createMany(
        request.links.map((link: any) => ({
          ...link,
          domain: link.domain || this.config.defaultDomain,
        })),
      );

      return {
        created: response.map((link: any) => this.transformDubLinkToLink(link)),
        errors: [], // Dub SDK handles errors differently, may need adjustment
      };
    } catch (error: any) {
      throw new Error(
        `Failed to bulk create links: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : String(error)}`,
      );
    }
  }

  private transformDubLinkToLink(dubLink: any): Link {
    return {
      id: dubLink.id,
      domain: dubLink.domain,
      key: dubLink.key,
      url: dubLink.url,
      shortLink: dubLink.shortLink || `https://${dubLink.domain}/${dubLink.key}`,
      qrCode:
        dubLink.qrCode || `https://api.dub.co/qr?url=${encodeURIComponent(dubLink.shortLink)}`,
      archived: dubLink.archived || false,
      expiresAt: dubLink.expiresAt ? new Date(dubLink.expiresAt) : undefined,
      expiredUrl: dubLink.expiredUrl,
      password: dubLink.password,
      proxy: dubLink.proxy || false,
      title: dubLink.title,
      description: dubLink.description,
      image: dubLink.image,
      video: dubLink.video,
      ios: dubLink.ios,
      android: dubLink.android,
      utm: dubLink.utm,
      tagIds: dubLink.tagIds || [],
      tags: dubLink.tags || [],
      comments: dubLink.comments,
      clicks: dubLink.clicks || 0,
      lastClicked: dubLink.lastClicked ? new Date(dubLink.lastClicked) : undefined,
      createdAt: new Date(dubLink.createdAt),
      updatedAt: new Date(dubLink.updatedAt),
      userId: dubLink.userId,
      workspaceId: dubLink.workspaceId || this.config.workspace || '',
    };
  }
}
