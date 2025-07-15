import { beforeEach, describe, expect, vi } from 'vitest';

import { createClientScraping, quickScrape } from '#/client';
import { ScrapingConfig, SelectorMap } from '#/shared/types/scraping-types';

// Mock fetch for client tests
vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  redirected: false,
  type: 'basic' as ResponseType,
  url: 'https://example.com',
  text: vi.fn().mockResolvedValue('<html><body><h1>Example Domain</h1></body></html>'),
  json: vi.fn().mockResolvedValue({}),
  blob: vi.fn().mockResolvedValue(new Blob()),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  formData: vi.fn().mockResolvedValue(new FormData()),
  bytes: vi.fn().mockResolvedValue(new Uint8Array()),
  clone: vi.fn().mockReturnThis(),
  headers: new Headers({ 'content-type': 'text/html' }),
  body: null,
  bodyUsed: false,
} as unknown as Response);

// Use vi.hoisted to ensure mock is available before module import
const { mockFetchProvider } = vi.hoisted(() => {
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

  return { mockFetchProvider };
});

// Mock the FetchProvider
vi.mock('#/client/providers/fetch-provider', () => ({
  FetchProvider: mockFetchProvider,
}));

describe('client Scraping', () => {
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

  test('should create a client scraping instance', () => {
    expect(scraper).toBeDefined();
    expect(scraper.scrape).toBeDefined();
  });

  test('should perform a quick scrape', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
      description: { selector: 'meta[name="description"]', attribute: 'content' },
    };

    const result = await quickScrape('https://example.com', selectors);

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    expect(result?.data.title).toBeDefined();
  });

  test('should handle errors gracefully', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
    };

    // Mock global fetch to reject with an error
    const originalFetch = global.fetch;
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await expect(quickScrape('https://this-url-does-not-exist.com', selectors)).rejects.toThrow(
      'Quick scrape failed',
    );

    // Restore original fetch
    global.fetch = originalFetch;
  }, 20000);
});
