import type {
  AnalyticsConfig,
  BulkCreateRequest,
  BulkCreateResponse,
  ClickEvent,
  CreateLinkRequest,
  DubProviderConfig,
  Link,
  LinkAnalytics,
  LinkConfig,
  LinkManager,
  LinkMetrics,
  LinkProvider,
  LinkTag,
  UpdateLinkRequest,
} from '@/shared/types/index';
import { describe, expect, test } from 'vitest';

describe('Type Definitions', () => {
  test('LinkConfig should have correct structure', () => {
    const config: LinkConfig = {
      providers: {
        dub: {
          enabled: true,
          apiKey: 'test-key',
          defaultDomain: 'test.sh',
        },
      },
      analytics: {
        enabled: true,
        events: ['link_created'],
        sampling: 1.0,
      },
    };

    expect(config.providers.dub?.enabled).toBe(true);
    expect(config.analytics?.enabled).toBe(true);
  });

  test('DubProviderConfig should have optional properties', () => {
    const minimalConfig: DubProviderConfig = {
      enabled: true,
    };

    const fullConfig: DubProviderConfig = {
      enabled: true,
      apiKey: 'test-key',
      workspace: 'workspace-id',
      baseUrl: 'https://api.dub.co',
      defaultDomain: 'dub.sh',
      defaultExpiration: new Date(),
      defaultTags: ['marketing'],
    };

    expect(minimalConfig.enabled).toBe(true);
    expect(fullConfig.defaultTags).toEqual(['marketing']);
  });

  test('CreateLinkRequest should support all properties', () => {
    const request: CreateLinkRequest = {
      url: 'https://example.com',
      domain: 'test.sh',
      key: 'custom-key',
      prefix: 'prefix',
      trackConversion: true,
      publicStats: false,
      tagIds: ['tag1', 'tag2'],
      tags: ['marketing', 'campaign'],
      comments: 'Test comment',
      expiresAt: new Date(),
      expiredUrl: 'https://expired.com',
      password: 'secret',
      proxy: true,
      title: 'Test Link',
      description: 'Test Description',
      image: 'https://example.com/image.png',
      video: 'https://example.com/video.mp4',
      ios: 'https://apps.apple.com/app',
      android: 'https://play.google.com/store/apps',
      geo: {
        US: 'https://us.example.com',
        EU: 'https://eu.example.com',
      },
      utm: {
        source: 'twitter',
        medium: 'social',
        campaign: 'spring2024',
        term: 'discount',
        content: 'banner',
      },
    };

    expect(request.url).toBe('https://example.com');
    expect(request.utm?.source).toBe('twitter');
    expect(request.geo?.US).toBe('https://us.example.com');
  });

  test('Link should have all required properties', () => {
    const link: Link = {
      id: 'link-id',
      domain: 'test.sh',
      key: 'abc123',
      url: 'https://example.com',
      shortLink: 'https://test.sh/abc123',
      qrCode: 'https://api.dub.co/qr?url=test',
      archived: false,
      proxy: false,
      tagIds: ['tag1'],
      tags: [
        {
          id: 'tag1',
          name: 'marketing',
          color: 'blue',
        },
      ],
      clicks: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-123',
      workspaceId: 'workspace-123',
    };

    expect(link.id).toBe('link-id');
    expect(link.clicks).toBe(42);
    expect(link.tags).toHaveLength(1);
  });

  test('LinkTag should have correct structure', () => {
    const tag: LinkTag = {
      id: 'tag-id',
      name: 'marketing',
      color: 'blue',
    };

    expect(tag.name).toBe('marketing');
    expect(tag.color).toBe('blue');
  });

  test('LinkAnalytics should have analytics data structure', () => {
    const analytics: LinkAnalytics = {
      clicks: 100,
      uniqueClicks: 80,
      topCountries: [
        { country: 'US', clicks: 50 },
        { country: 'UK', clicks: 30 },
      ],
      topCities: [
        { city: 'New York', country: 'US', clicks: 25 },
        { city: 'London', country: 'UK', clicks: 20 },
      ],
      topReferrers: [
        { referrer: 'google.com', clicks: 40 },
        { referrer: 'twitter.com', clicks: 20 },
      ],
      topBrowsers: [
        { browser: 'Chrome', clicks: 60 },
        { browser: 'Firefox', clicks: 25 },
      ],
      topOs: [
        { os: 'Windows', clicks: 50 },
        { os: 'Mac', clicks: 30 },
      ],
      topDevices: [
        { device: 'Desktop', clicks: 70 },
        { device: 'Mobile', clicks: 30 },
      ],
    };

    expect(analytics.clicks).toBe(100);
    expect(analytics.topCountries).toHaveLength(2);
    expect(analytics.topCities[0].city).toBe('New York');
  });

  test('ClickEvent should support all tracking properties', () => {
    const clickEvent: ClickEvent = {
      timestamp: new Date(),
      country: 'US',
      city: 'New York',
      region: 'NY',
      latitude: 40.7128,
      longitude: -74.006,
      os: 'Windows',
      device: 'Desktop',
      browser: 'Chrome',
      referrer: 'google.com',
      referrerUrl: 'https://google.com/search?q=test',
      ip: '192.168.1.1',
      ua: 'Mozilla/5.0...',
    };

    expect(clickEvent.country).toBe('US');
    expect(clickEvent.latitude).toBe(40.7128);
    expect(clickEvent.browser).toBe('Chrome');
  });

  test('LinkMetrics should combine link and analytics data', () => {
    const metrics: LinkMetrics = {
      link: {
        id: 'link-id',
        domain: 'test.sh',
        key: 'abc',
        url: 'https://example.com',
        shortLink: 'https://test.sh/abc',
        qrCode: 'https://api.dub.co/qr?url=test',
        archived: false,
        proxy: false,
        tagIds: [],
        tags: [],
        clicks: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
        workspaceId: 'workspace-123',
      },
      analytics: {
        clicks: 100,
        uniqueClicks: 80,
        topCountries: [],
        topCities: [],
        topReferrers: [],
        topBrowsers: [],
        topOs: [],
        topDevices: [],
      },
      timeSeries: [
        {
          start: new Date('2024-01-01'),
          clicks: 10,
        },
        {
          start: new Date('2024-01-02'),
          clicks: 15,
        },
      ],
    };

    expect(metrics.link.clicks).toBe(100);
    expect(metrics.analytics.uniqueClicks).toBe(80);
    expect(metrics.timeSeries).toHaveLength(2);
  });

  test('BulkCreateRequest and BulkCreateResponse should work together', () => {
    const request: BulkCreateRequest = {
      links: [
        { url: 'https://example1.com' },
        { url: 'https://example2.com' },
        { url: 'invalid-url' },
      ],
    };

    const response: BulkCreateResponse = {
      created: [
        {
          id: 'link-1',
          domain: 'test.sh',
          key: 'abc',
          url: 'https://example1.com',
          shortLink: 'https://test.sh/abc',
          qrCode: 'https://api.dub.co/qr?url=test',
          archived: false,
          proxy: false,
          tagIds: [],
          tags: [],
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-123',
          workspaceId: 'workspace-123',
        },
        {
          id: 'link-2',
          domain: 'test.sh',
          key: 'def',
          url: 'https://example2.com',
          shortLink: 'https://test.sh/def',
          qrCode: 'https://api.dub.co/qr?url=test',
          archived: false,
          proxy: false,
          tagIds: [],
          tags: [],
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-123',
          workspaceId: 'workspace-123',
        },
      ],
      errors: [
        {
          url: 'invalid-url',
          error: 'Invalid URL format',
        },
      ],
    };

    expect(request.links).toHaveLength(3);
    expect(response.created).toHaveLength(2);
    expect(response.errors).toHaveLength(1);
    expect(response.errors[0].url).toBe('invalid-url');
  });

  test('UpdateLinkRequest should support partial updates', () => {
    const updateRequest: UpdateLinkRequest = {
      title: 'Updated Title',
      description: 'Updated Description',
      archived: true,
    };

    expect(updateRequest.title).toBe('Updated Title');
    expect(updateRequest.archived).toBe(true);
    expect(updateRequest.url).toBeUndefined(); // Optional field not set
  });

  test('LinkProvider interface should define all required methods', () => {
    // This is a compile-time test to ensure the interface is well-defined
    const provider: LinkProvider = {
      name: 'test-provider',
      createLink: async (request: CreateLinkRequest) => ({
        id: 'test-id',
        domain: 'test.sh',
        key: 'abc',
        url: request.url,
        shortLink: 'https://test.sh/abc',
        qrCode: 'https://api.dub.co/qr?url=test',
        archived: false,
        proxy: false,
        tagIds: [],
        tags: [],
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
        workspaceId: 'workspace-123',
      }),
      getLink: async (id: string) => null,
      updateLink: async (id: string, request: UpdateLinkRequest) => ({
        id,
        domain: 'test.sh',
        key: 'abc',
        url: 'https://example.com',
        shortLink: 'https://test.sh/abc',
        qrCode: 'https://api.dub.co/qr?url=test',
        archived: false,
        proxy: false,
        tagIds: [],
        tags: [],
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
        workspaceId: 'workspace-123',
      }),
      deleteLink: async (id: string) => {},
      getAnalytics: async (id: string, interval = '7d') => ({
        clicks: 0,
        uniqueClicks: 0,
        topCountries: [],
        topCities: [],
        topReferrers: [],
        topBrowsers: [],
        topOs: [],
        topDevices: [],
      }),
      getClicks: async (id: string, page = 1, pageSize = 100) => [],
      bulkCreate: async (request: BulkCreateRequest) => ({
        created: [],
        errors: [],
      }),
    };

    expect(provider.name).toBe('test-provider');
    expect(typeof provider.createLink).toBe('function');
    expect(typeof provider.bulkCreate).toBe('function');
  });

  test('LinkManager interface should extend LinkProvider functionality', () => {
    // This is a compile-time test to ensure the interface is well-defined
    const manager: LinkManager = {
      createLink: async (request: CreateLinkRequest) => ({
        id: 'test-id',
        domain: 'test.sh',
        key: 'abc',
        url: request.url,
        shortLink: 'https://test.sh/abc',
        qrCode: 'https://api.dub.co/qr?url=test',
        archived: false,
        proxy: false,
        tagIds: [],
        tags: [],
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
        workspaceId: 'workspace-123',
      }),
      getLink: async (id: string) => null,
      getLinkByKey: async (key: string, domain?: string) => null,
      updateLink: async (id: string, request: UpdateLinkRequest) => ({
        id,
        domain: 'test.sh',
        key: 'abc',
        url: 'https://example.com',
        shortLink: 'https://test.sh/abc',
        qrCode: 'https://api.dub.co/qr?url=test',
        archived: false,
        proxy: false,
        tagIds: [],
        tags: [],
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-123',
        workspaceId: 'workspace-123',
      }),
      deleteLink: async (id: string) => {},
      getAnalytics: async (id: string, interval = '7d') => ({
        clicks: 0,
        uniqueClicks: 0,
        topCountries: [],
        topCities: [],
        topReferrers: [],
        topBrowsers: [],
        topOs: [],
        topDevices: [],
      }),
      getClicks: async (id: string, page = 1, pageSize = 100) => [],
      getMetrics: async (id: string) => ({
        link: {
          id,
          domain: 'test.sh',
          key: 'abc',
          url: 'https://example.com',
          shortLink: 'https://test.sh/abc',
          qrCode: 'https://api.dub.co/qr?url=test',
          archived: false,
          proxy: false,
          tagIds: [],
          tags: [],
          clicks: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user-123',
          workspaceId: 'workspace-123',
        },
        analytics: {
          clicks: 0,
          uniqueClicks: 0,
          topCountries: [],
          topCities: [],
          topReferrers: [],
          topBrowsers: [],
          topOs: [],
          topDevices: [],
        },
        timeSeries: [],
      }),
      bulkCreate: async (request: BulkCreateRequest) => ({
        created: [],
        errors: [],
      }),
      trackClick: async (linkId: string, event: Partial<ClickEvent>) => {},
    };

    expect(typeof manager.getLinkByKey).toBe('function');
    expect(typeof manager.getMetrics).toBe('function');
    expect(typeof manager.trackClick).toBe('function');
  });

  test('AnalyticsConfig should support various configuration options', () => {
    const minimalConfig: AnalyticsConfig = {
      enabled: true,
    };

    const fullConfig: AnalyticsConfig = {
      enabled: true,
      provider: {
        track: async (event: string, properties?: Record<string, any>) => {},
        identify: async (userId: string, traits?: Record<string, any>) => {},
      },
      events: ['link_created', 'link_clicked', 'link_deleted'],
      sampling: 0.5,
      debugMode: true,
    };

    expect(minimalConfig.enabled).toBe(true);
    expect(fullConfig.events).toHaveLength(3);
    expect(fullConfig.sampling).toBe(0.5);
    expect(typeof fullConfig.provider?.track).toBe('function');
  });

  test('should support type aliases', () => {
    // Test the type aliases work correctly
    const analytics: import('@/shared/types/index').Analytics = {
      clicks: 100,
      uniqueClicks: 80,
      topCountries: [],
      topCities: [],
      topReferrers: [],
      topBrowsers: [],
      topOs: [],
      topDevices: [],
    };

    const click: import('@/shared/types/index').Click = {
      timestamp: new Date(),
      country: 'US',
    };

    const createLink: import('@/shared/types/index').CreateLink = {
      url: 'https://example.com',
    };

    expect(analytics.clicks).toBe(100);
    expect(click.country).toBe('US');
    expect(createLink.url).toBe('https://example.com');
  });
});
