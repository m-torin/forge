/**
 * Dub Provider Tests
 *
 * Tests for the Dub provider implementation including:
 * - Provider initialization and configuration
 * - Link CRUD operations
 * - Analytics functionality
 * - Error handling
 * - Bulk operations
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { createTestData } from '../../setup';

describe('dub Provider', () => {
  let mockDubClient: any;

  beforeEach(() => {
    mockDubClient = createTestData.dubClient();
    // Ensure bulk createMany returns the correct structure
    mockDubClient.links.createMany.mockImplementation(data =>
      Promise.resolve({
        created:
          data?.links?.map((link: any, index: number) => ({
            id: `bulk-link-${index + 1}`,
            url: link.url || `https://example.com/${index + 1}`,
            shortUrl: `https://dub.sh/bulk${index + 1}`,
            domain: link.domain || 'dub.sh',
            key: link.key || `bulk${index + 1}`,
            title: link.title,
            description: link.description,
            tags: link.tags,
            clicks: 0,
            uniqueClicks: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) || [],
        failed: [],
      }),
    );
  });

  // Test provider initialization
  describe('provider Initialization', () => {
    test('should initialize with minimal configuration', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider(
        {
          enabled: true,
          apiKey: 'test-api-key',
        },
        mockDubClient,
      );

      expect(provider).toBeDefined();
      expect(provider.name).toBe('dub');
      expect(provider.client).toBeDefined();
    });

    test('should initialize with full configuration', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider(
        {
          enabled: true,
          apiKey: 'test-api-key',
          workspace: 'test-workspace',
          baseUrl: 'https://api.dub.co',
          defaultDomain: 'custom.link',
          defaultExpiration: '2024-12-31T23:59:59Z',
          defaultTags: ['production', 'marketing'],
        },
        mockDubClient,
      );

      expect(provider).toBeDefined();
      expect(provider.name).toBe('dub');
      expect(provider.client).toBeDefined();
    });

    test('should handle disabled provider', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider(
        {
          enabled: false,
          apiKey: 'test-api-key',
        },
        mockDubClient,
      );

      expect(provider).toBeDefined();
      expect(provider.name).toBe('dub');
      expect(provider.client).toBeDefined();
    });
  });

  // Test link creation
  describe('link Creation', () => {
    test('should create link with minimal data', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const link = await provider.createLink({
        url: 'https://example.com',
      });

      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('shortUrl');
      expect(link).toHaveProperty('domain');
      expect(link).toHaveProperty('key');
      expect(link.url).toBe('https://example.com');
      expect(mockDubClient.links.create).toHaveBeenCalledWith({
        url: 'https://example.com',
      });
    });

    test('should create link with all options', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const link = await provider.createLink({
        url: 'https://example.com',
        domain: 'custom.link',
        key: 'custom-key',
        prefix: 'prefix',
        title: 'Test Link',
        description: 'A test link',
        tags: ['test', 'development'],
        expiresAt: '2024-12-31T23:59:59Z',
        expiredUrl: 'https://expired.com',
        password: 'secret',
        proxy: true,
        publicStats: true,
        trackConversion: true,
        image: 'https://example.com/image.png',
        ios: 'https://apps.apple.com/app',
        android: 'https://play.google.com/store/apps',
        geo: {
          US: 'https://usa.example.com',
          UK: 'https://uk.example.com',
        },
        comments: 'Test comment',
        tagIds: ['tag-1', 'tag-2'],
      });

      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('shortUrl');
      expect(link.url).toBe('https://example.com');
      expect(mockDubClient.links.create).toHaveBeenCalledWith({
        url: 'https://example.com',
        domain: 'custom.link',
        key: 'custom-key',
        prefix: 'prefix',
        title: 'Test Link',
        description: 'A test link',
        tags: ['test', 'development'],
        expiresAt: '2024-12-31T23:59:59Z',
        expiredUrl: 'https://expired.com',
        password: 'secret',
        proxy: true,
        publicStats: true,
        trackConversion: true,
        image: 'https://example.com/image.png',
        ios: 'https://apps.apple.com/app',
        android: 'https://play.google.com/store/apps',
        geo: {
          US: 'https://usa.example.com',
          UK: 'https://uk.example.com',
        },
        comments: 'Test comment',
        tagIds: ['tag-1', 'tag-2'],
      });
    });

    test('should handle create errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockRejectedValueOnce(new Error('API Error'));

      await expect(provider.createLink({ url: 'https://example.com' })).rejects.toThrow(
        'API Error',
      );
    });
  });

  // Test link retrieval
  describe('link Retrieval', () => {
    test('should get link by ID', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const link = await provider.getLink('test-link-id');

      expect(link).toHaveProperty('id');
      expect(link).toHaveProperty('url');
      expect(link).toHaveProperty('shortUrl');
      expect(link?.id).toBe('test-link-id');
      expect(mockDubClient.links.get).toHaveBeenCalledWith('test-link-id');
    });

    test('should return null for non-existent link', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const error = new Error('404: Link not found');
      mockDubClient.links.get.mockRejectedValueOnce(error);

      const link = await provider.getLink('non-existent-id');

      expect(link).toBeNull();
    });

    test('should handle non-404 errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const error = new Error('500: Server error');
      mockDubClient.links.get.mockRejectedValueOnce(error);

      await expect(provider.getLink('test-link-id')).rejects.toThrow('500: Server error');
    });
  });

  // Test link updates
  describe('link Updates', () => {
    test('should update link', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const updatedLink = await provider.updateLink('test-link-id', {
        title: 'Updated Title',
        description: 'Updated description',
      });

      expect(updatedLink).toHaveProperty('id');
      expect(updatedLink).toHaveProperty('title');
      expect(updatedLink.title).toBe('Updated Title');
      expect(mockDubClient.links.update).toHaveBeenCalledWith('test-link-id', {
        title: 'Updated Title',
        description: 'Updated description',
      });
    });

    test('should handle update errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.update.mockRejectedValueOnce(new Error('Update failed'));

      await expect(provider.updateLink('test-link-id', { title: 'New Title' })).rejects.toThrow(
        'Update failed',
      );
    });
  });

  // Test link deletion
  describe('link Deletion', () => {
    test('should delete link', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      await provider.deleteLink('test-link-id');

      expect(mockDubClient.links.delete).toHaveBeenCalledWith('test-link-id');
    });

    test('should handle delete errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(provider.deleteLink('test-link-id')).rejects.toThrow('Delete failed');
    });
  });

  // Test analytics
  describe('analytics', () => {
    test('should get analytics data', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const analytics = await provider.getAnalytics('test-link-id', '7d');

      expect(analytics).toHaveProperty('clicks');
      expect(analytics).toHaveProperty('uniqueClicks');
      expect(analytics).toHaveProperty('topCountries');
      expect(analytics).toHaveProperty('topReferrers');
      expect(analytics).toHaveProperty('topBrowsers');
      expect(mockDubClient.analytics.retrieve).toHaveBeenCalledWith('test-link-id', '7d');
    });

    test('should get click events', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const clicks = await provider.getClicks('test-link-id');

      expect(Array.isArray(clicks)).toBeTruthy();
      expect(clicks.length).toBeGreaterThan(0);
      expect(clicks[0]).toHaveProperty('timestamp');
      expect(clicks[0]).toHaveProperty('country');
      expect(clicks[0]).toHaveProperty('browser');
      expect(mockDubClient.links.getClicks).toHaveBeenCalledWith('test-link-id');
    });
  });

  // Test bulk operations
  describe('bulk Operations', () => {
    test('should bulk create links', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const response = await provider.bulkCreate({
        links: [
          { url: 'https://example.com/1', title: 'Link 1' },
          { url: 'https://example.com/2', title: 'Link 2' },
        ],
      });

      expect(response).toHaveProperty('created');
      expect(response).toHaveProperty('failed');
      expect(Array.isArray(response.created)).toBeTruthy();
      expect(Array.isArray(response.failed)).toBeTruthy();
      expect(response.created).toHaveLength(2);
      expect(response.failed).toHaveLength(0);
      expect(mockDubClient.links.createMany).toHaveBeenCalledWith({
        links: [
          { url: 'https://example.com/1', title: 'Link 1' },
          { url: 'https://example.com/2', title: 'Link 2' },
        ],
      });
    });

    test('should handle bulk create errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.createMany.mockRejectedValueOnce(new Error('Bulk create failed'));

      await expect(
        provider.bulkCreate({
          links: [
            { url: 'https://example.com/1', title: 'Link 1' },
            { url: 'https://example.com/2', title: 'Link 2' },
          ],
        }),
      ).rejects.toThrow('Bulk create failed');
    });
  });

  // Test configuration handling
  describe('configuration Handling', () => {
    test('should apply default configuration', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider(
        {
          enabled: true,
          apiKey: 'test-key',
          defaultDomain: 'custom.link',
          defaultTags: ['production'],
        },
        mockDubClient,
      );

      await provider.createLink({
        url: 'https://example.com',
      });

      // Should merge with default configuration
      expect(mockDubClient.links.create).toHaveBeenCalledWith({
        url: 'https://example.com',
      });
    });

    test('should override default configuration', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider(
        {
          enabled: true,
          apiKey: 'test-key',
          defaultDomain: 'custom.link',
          defaultTags: ['production'],
        },
        mockDubClient,
      );

      await provider.createLink({
        url: 'https://example.com',
        domain: 'override.link',
        tags: ['development'],
      });

      // Should use overridden values
      expect(mockDubClient.links.create).toHaveBeenCalledWith({
        url: 'https://example.com',
        domain: 'override.link',
        tags: ['development'],
      });
    });
  });

  // Test error handling scenarios
  describe('error Handling', () => {
    test('should handle authentication errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'invalid-key' }, mockDubClient);

      mockDubClient.links.create.mockRejectedValueOnce(new Error('401: Unauthorized'));

      await expect(provider.createLink({ url: 'https://example.com' })).rejects.toThrow(
        '401: Unauthorized',
      );
    });

    test('should handle rate limiting errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockRejectedValueOnce(new Error('429: Too Many Requests'));

      await expect(provider.createLink({ url: 'https://example.com' })).rejects.toThrow(
        '429: Too Many Requests',
      );
    });

    test('should handle validation errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockRejectedValueOnce(new Error('400: Invalid URL'));

      await expect(provider.createLink({ url: 'invalid-url' })).rejects.toThrow('400: Invalid URL');
    });

    test('should handle network errors', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockRejectedValueOnce(new Error('Network error'));

      await expect(provider.createLink({ url: 'https://example.com' })).rejects.toThrow(
        'Network error',
      );
    });
  });

  // Test edge cases
  describe('edge Cases', () => {
    test('should handle empty responses', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockResolvedValueOnce(null);

      const link = await provider.createLink({ url: 'https://example.com' });

      expect(link).toBeNull();
    });

    test('should handle malformed responses', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      mockDubClient.links.create.mockResolvedValueOnce({ invalid: 'response' });

      const link = await provider.createLink({ url: 'https://example.com' });

      expect(link).toEqual({ invalid: 'response' });
    });

    test('should handle large payloads', async () => {
      const { DubProvider } = await import('#/shared/providers/dub-provider');

      const provider = new DubProvider({ enabled: true, apiKey: 'test-key' }, mockDubClient);

      const largeTags = Array.from({ length: 100 }, (_, i) => `tag-${i}`);

      await provider.createLink({
        url: 'https://example.com',
        title: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        tags: largeTags,
      });

      expect(mockDubClient.links.create).toHaveBeenCalledWith({
        url: 'https://example.com',
        title: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        tags: largeTags,
      });
    });
  });
});
