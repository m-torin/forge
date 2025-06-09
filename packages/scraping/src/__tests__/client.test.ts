import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClientScraping, quickScrape } from '../client';
import type { ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';

// Mock fetch for client tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  status: 200,
  text: vi.fn().mockResolvedValue('<html><body><h1>Example Domain</h1></body></html>'),
  headers: new Headers({ 'content-type': 'text/html' }),
});

// Use vi.hoisted to ensure mock is available before module import
const { mockFetchProvider, mockScrapeError } = vi.hoisted(() => {
  const mockFetchProvider = vi.fn();
  const mockScrapeError = vi.fn();

  // Default implementation
  mockFetchProvider.mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    scrape: mockScrapeError.mockResolvedValue({
      url: 'https://example.com',
      html: '<html><body><h1>Example Domain</h1></body></html>',
      metadata: {
        title: 'Example Domain',
        statusCode: 200,
      },
      provider: 'fetch',
      data: {
        title: 'Example Domain',
        description: 'Example description',
      },
    }),
    extract: vi.fn().mockResolvedValue({
      title: 'Example Domain',
      description: 'Example description',
    }),
  }));

  return { mockFetchProvider, mockScrapeError };
});

// Mock the FetchProvider
vi.mock('../client/providers/fetch-provider', () => ({
  FetchProvider: mockFetchProvider,
}));

// Also mock the dynamic import in quick-scrape
vi.mock('../../client/providers/fetch-provider', () => ({
  FetchProvider: mockFetchProvider,
}));

describe('Client Scraping', () => {
  let scraper: Awaited<ReturnType<typeof createClientScraping>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const config: ScrapingConfig = {
      providers: {
        fetch: { timeout: 5000 },
      },
    };
    scraper = await createClientScraping(config);
  });

  it('should create a client scraping instance', () => {
    expect(scraper).toBeDefined();
    expect(scraper.scrape).toBeDefined();
  });

  it('should perform a quick scrape', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
      description: { selector: 'meta[name="description"]', attribute: 'content' },
    };

    const result = await quickScrape('https://example.com', selectors);

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.title).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
    };

    // Mock global fetch to reject with an error
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

    await expect(quickScrape('https://this-url-does-not-exist.com', selectors)).rejects.toThrow(
      'Quick scrape failed',
    );

    // Restore original fetch
    global.fetch = originalFetch;
  }, 20000);
});
