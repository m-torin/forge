import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScraperFactory } from '../../../shared/factories/scraper-factory';
import type { ScrapingProvider, ScrapingConfig } from '../../../shared/types/scraping-types';

// Mock provider
class MockProvider implements ScrapingProvider {
  name = 'mock';

  async scrape(url: string, options?: any) {
    return {
      url,
      html: '<html><body>Mock content</body></html>',
      success: true,
    };
  }

  async scrapeMultiple(urls: string[], options?: any) {
    return urls.map((url) => ({
      url,
      html: '<html><body>Mock content</body></html>',
      success: true,
    }));
  }

  async dispose() {
    // Mock cleanup
  }
}

describe('ScraperFactory', () => {
  let factory: ScraperFactory;
  let mockProvider: MockProvider;

  beforeEach(() => {
    mockProvider = new MockProvider();
    factory = new ScraperFactory();
  });

  describe('provider registration', () => {
    it('should register a provider', () => {
      factory.registerProvider('test', mockProvider);

      expect(factory.hasProvider('test')).toBe(true);
    });

    it('should throw when registering duplicate provider', () => {
      factory.registerProvider('test', mockProvider);

      expect(() => {
        factory.registerProvider('test', mockProvider);
      }).toThrow('Provider test is already registered');
    });

    it('should list registered providers', () => {
      factory.registerProvider('provider1', mockProvider);
      factory.registerProvider('provider2', new MockProvider());

      const providers = factory.listProviders();

      expect(providers).toEqual(['provider1', 'provider2']);
    });

    it('should check if provider exists', () => {
      factory.registerProvider('exists', mockProvider);

      expect(factory.hasProvider('exists')).toBe(true);
      expect(factory.hasProvider('not-exists')).toBe(false);
    });
  });

  describe('createScraper', () => {
    beforeEach(() => {
      factory.registerProvider('mock', mockProvider);
    });

    it('should create scraper with default provider', async () => {
      const scraper = factory.createScraper();

      const result = await scraper.scrape('https://example.com');

      expect(result).toEqual({
        url: 'https://example.com',
        html: '<html><body>Mock content</body></html>',
        success: true,
      });
    });

    it('should create scraper with specific provider', async () => {
      const scraper = factory.createScraper({ provider: 'mock' });

      const result = await scraper.scrape('https://example.com');

      expect(result.success).toBe(true);
    });

    it('should throw when provider not found', () => {
      expect(() => {
        factory.createScraper({ provider: 'unknown' });
      }).toThrow('Provider unknown not found');
    });

    it('should pass configuration to scraper', async () => {
      const config: ScrapingConfig = {
        provider: 'mock',
        timeout: 5000,
        retries: 2,
        userAgent: 'Test Agent',
      };

      const scraper = factory.createScraper(config);

      expect(scraper).toBeDefined();
    });
  });

  describe('scraper instance', () => {
    let scraper: any;

    beforeEach(() => {
      factory.registerProvider('mock', mockProvider);
      scraper = factory.createScraper();
    });

    it('should scrape single URL', async () => {
      const result = await scraper.scrape('https://example.com');

      expect(result).toEqual({
        url: 'https://example.com',
        html: expect.any(String),
        success: true,
      });
    });

    it('should scrape multiple URLs', async () => {
      const urls = ['https://example1.com', 'https://example2.com'];
      const results = await scraper.scrapeMultiple(urls);

      expect(results).toHaveLength(2);
      expect(results[0].url).toBe('https://example1.com');
      expect(results[1].url).toBe('https://example2.com');
    });

    it('should handle scraping errors', async () => {
      const errorProvider = new MockProvider();
      errorProvider.scrape = vi.fn().mockRejectedValue(new Error('Scrape failed'));

      factory.registerProvider('error', errorProvider);
      const errorScraper = factory.createScraper({ provider: 'error' });

      await expect(errorScraper.scrape('https://example.com')).rejects.toThrow('Scrape failed');
    });

    it('should dispose resources', async () => {
      const disposeSpy = vi.spyOn(mockProvider, 'dispose');

      await scraper.dispose();

      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('middleware support', () => {
    beforeEach(() => {
      factory.registerProvider('mock', mockProvider);
    });

    it('should apply middleware to scraping', async () => {
      const middleware = vi.fn((result) => ({
        ...result,
        processed: true,
      }));

      const scraper = factory.createScraper({
        middleware: [middleware],
      });

      const result = await scraper.scrape('https://example.com');

      expect(middleware).toHaveBeenCalled();
      expect(result.processed).toBe(true);
    });

    it('should apply multiple middleware in order', async () => {
      const order: number[] = [];

      const middleware1 = vi.fn((result) => {
        order.push(1);
        return { ...result, step1: true };
      });

      const middleware2 = vi.fn((result) => {
        order.push(2);
        return { ...result, step2: true };
      });

      const scraper = factory.createScraper({
        middleware: [middleware1, middleware2],
      });

      const result = await scraper.scrape('https://example.com');

      expect(order).toEqual([1, 2]);
      expect(result.step1).toBe(true);
      expect(result.step2).toBe(true);
    });
  });

  describe('retry mechanism', () => {
    it('should retry on failure', async () => {
      let attempts = 0;
      const retryProvider = new MockProvider();
      retryProvider.scrape = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return {
          url: 'https://example.com',
          html: '<html>Success</html>',
          success: true,
        };
      });

      factory.registerProvider('retry', retryProvider);
      const scraper = factory.createScraper({
        provider: 'retry',
        retries: 3,
      });

      const result = await scraper.scrape('https://example.com');

      expect(result.success).toBe(true);
      expect(attempts).toBe(3);
    });

    it('should fail after max retries', async () => {
      const failProvider = new MockProvider();
      failProvider.scrape = vi.fn().mockRejectedValue(new Error('Always fails'));

      factory.registerProvider('fail', failProvider);
      const scraper = factory.createScraper({
        provider: 'fail',
        retries: 2,
      });

      await expect(scraper.scrape('https://example.com')).rejects.toThrow('Always fails');
      expect(failProvider.scrape).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('caching support', () => {
    beforeEach(() => {
      factory.registerProvider('mock', mockProvider);
    });

    it('should cache results when enabled', async () => {
      const scrapeSpy = vi.spyOn(mockProvider, 'scrape');

      const scraper = factory.createScraper({
        cache: {
          enabled: true,
          ttl: 60000,
        },
      });

      // First call
      await scraper.scrape('https://example.com');
      // Second call (should be cached)
      await scraper.scrape('https://example.com');

      expect(scrapeSpy).toHaveBeenCalledTimes(1);
    });

    it('should respect cache TTL', async () => {
      const scrapeSpy = vi.spyOn(mockProvider, 'scrape');

      const scraper = factory.createScraper({
        cache: {
          enabled: true,
          ttl: 100, // 100ms
        },
      });

      await scraper.scrape('https://example.com');

      // Wait for cache to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      await scraper.scrape('https://example.com');

      expect(scrapeSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('setDefaultProvider', () => {
    it('should set default provider', () => {
      factory.registerProvider('provider1', mockProvider);
      factory.registerProvider('provider2', new MockProvider());

      factory.setDefaultProvider('provider2');

      const scraper = factory.createScraper();
      // Should use provider2 as default
      expect(scraper).toBeDefined();
    });

    it('should throw when setting non-existent default', () => {
      expect(() => {
        factory.setDefaultProvider('unknown');
      }).toThrow('Provider unknown not found');
    });
  });
});
