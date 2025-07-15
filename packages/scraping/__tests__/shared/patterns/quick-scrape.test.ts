import { extractFromHtml, extractFromUrl, quickScrape } from '@/shared/patterns/quick-scrape';
import { beforeEach, describe, expect, vi } from 'vitest';

// Mock the provider imports
vi.mock('../../../server/providers/cheerio-provider', () => ({
  CheerioProvider: vi.fn(() => ({
    initialize: vi.fn(),
    extract: vi.fn().mockResolvedValue({ title: 'Test Title' }),
  })),
}));

vi.mock('../../../shared/utils/scraping-manager', () => ({
  createScrapingManager: vi.fn(),
}));

describe('quick-scrape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractFromHtml', () => {
    test('should extract data from HTML using selectors', async () => {
      const html = '<html><body><h1>Test Title</h1></body></html>';
      const selectors = { title: 'h1' };

      const result = await extractFromHtml(html, selectors);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('should handle empty HTML', async () => {
      const html = '';
      const selectors = { title: 'h1' };

      const result = await extractFromHtml(html, selectors);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    test('should handle invalid selectors', async () => {
      const html = '<html><body><h1>Test Title</h1></body></html>';
      const selectors = { title: 'invalid-selector' };

      const result = await extractFromHtml(html, selectors);

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('quickScrape', () => {
    test('should scrape a URL and return data', async () => {
      const mockManager = {
        scrape: vi.fn().mockResolvedValue({
          data: { title: 'Test Title' },
          metadata: { url: 'https://example.com', title: 'Test Title' },
          title: 'Test Title',
        }),
        dispose: vi.fn(),
        extract: vi.fn(),
        getMetrics: vi.fn(),
        healthCheck: vi.fn(),
        initialize: vi.fn(),
        scrapeMultiple: vi.fn(),
        scrapeStream: vi.fn(),
      };

      const { createScrapingManager } = await import('../../../shared/utils/scraping-manager');
      vi.mocked(createScrapingManager).mockReturnValue(mockManager as any);

      const result = await quickScrape('https://example.com', { title: 'h1' });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.title).toBe('Test Title');
    });

    test('should handle scraping errors', async () => {
      const mockManager = {
        scrape: vi.fn().mockRejectedValue(new Error('Scraping failed')),
        dispose: vi.fn(),
        extract: vi.fn(),
        getMetrics: vi.fn(),
        healthCheck: vi.fn(),
        initialize: vi.fn(),
        scrapeMultiple: vi.fn(),
        scrapeStream: vi.fn(),
      };

      const { createScrapingManager } = await import('../../../shared/utils/scraping-manager');
      vi.mocked(createScrapingManager).mockReturnValue(mockManager as any);

      // The function should throw an error for invalid URLs
      await expect(quickScrape('invalid-url', { title: 'h1' })).rejects.toThrow('Invalid URL');
    });

    test('should handle provider initialization errors', async () => {
      const mockManager = {
        scrape: vi.fn().mockRejectedValue(new Error('Provider initialization failed')),
        dispose: vi.fn(),
        extract: vi.fn(),
        getMetrics: vi.fn(),
        healthCheck: vi.fn(),
        initialize: vi.fn(),
        scrapeMultiple: vi.fn(),
        scrapeStream: vi.fn(),
      };

      const { createScrapingManager } = await import('../../../shared/utils/scraping-manager');
      vi.mocked(createScrapingManager).mockReturnValue(mockManager as any);

      await expect(quickScrape('https://example.com', { title: 'h1' })).rejects.toThrow(
        'Provider initialization failed',
      );
    });
  });

  describe('extractFromUrl', () => {
    test('should extract data from URL', async () => {
      const mockManager = {
        scrape: vi.fn().mockResolvedValue({
          data: { title: 'Test Title' },
          metadata: { url: 'https://example.com', title: 'Test Title' },
          title: 'Test Title',
        }),
        dispose: vi.fn(),
        extract: vi.fn(),
        getMetrics: vi.fn(),
        healthCheck: vi.fn(),
        initialize: vi.fn(),
        scrapeMultiple: vi.fn(),
        scrapeStream: vi.fn(),
      };

      const { createScrapingManager } = await import('../../../shared/utils/scraping-manager');
      vi.mocked(createScrapingManager).mockReturnValue(mockManager as any);

      const result = await extractFromUrl('https://example.com', { title: 'h1' });

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Title');
    });

    test('should handle extraction errors', async () => {
      const mockManager = {
        scrape: vi.fn().mockRejectedValue(new Error('Extraction failed')),
        dispose: vi.fn(),
        extract: vi.fn(),
        getMetrics: vi.fn(),
        healthCheck: vi.fn(),
        initialize: vi.fn(),
        scrapeMultiple: vi.fn(),
        scrapeStream: vi.fn(),
      };

      const { createScrapingManager } = await import('../../../shared/utils/scraping-manager');
      vi.mocked(createScrapingManager).mockReturnValue(mockManager as any);

      await expect(extractFromUrl('https://example.com', { title: 'h1' })).rejects.toThrow(
        'Extraction failed',
      );
    });
  });

  // TODO: Add tests for quickMultiScrape and createQuickScraper when implemented
});
