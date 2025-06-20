import { describe, expect, beforeEach, vi } from 'vitest';

import { createServerScraping, quickScrape } from '../server';
import { ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';

// Use vi.hoisted to ensure mocks are available before module imports
const { mockNodeFetchProvider, mockCheerioProvider } = vi.hoisted(() => {
  const mockNodeFetchProvider = vi.fn();
  const mockCheerioProvider = vi.fn();

  // Default implementation for NodeFetchProvider
  mockNodeFetchProvider.mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    scrape: vi.fn().mockResolvedValue({
      url: 'https://example.com',
      html: '<html><body><h1>Example Domain</h1></body></html>',
      metadata: {
        title: 'Example Domain',
        statusCode: 200,
      },
      provider: 'node-fetch',
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

  // Default implementation for CheerioProvider
  mockCheerioProvider.mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    scrape: vi.fn().mockResolvedValue({
      url: 'https://example.com',
      html: '<html><body><h1>Example Domain</h1></body></html>',
      metadata: {
        title: 'Example Domain',
        statusCode: 200,
      },
      provider: 'cheerio',
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

  return { mockNodeFetchProvider, mockCheerioProvider };
});

// Mock the providers
vi.mock('../server/providers/node-fetch-provider', () => ({
  NodeFetchProvider: mockNodeFetchProvider,
}));

vi.mock('../server/providers/cheerio-provider', () => ({
  CheerioProvider: mockCheerioProvider,
}));

describe('server Scraping', () => {
  let scraper: Awaited<ReturnType<typeof createServerScraping>>;

  beforeEach(async () => {
    const config: ScrapingConfig = {
      providers: {
        'node-fetch': { timeout: 5000 },
      },
    };
    scraper = await createServerScraping(config);
  });

  test('should create a server scraping instance', () => {
    expect(scraper).toBeDefined();
    expect(scraper.scrape).toBeDefined();
  });

  test('should perform a quick scrape using node-fetch', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
      description: { selector: 'meta[name="description"]', attribute: 'content' },
    };

    const result = await quickScrape('https://example.com', selectors, {
      provider: 'node-fetch',
    });

    expect(result).toBeDefined();
    expect(result?.data).toBeDefined();
    // The mock returns data as { title: 'Example Domain' } in the scrape result
    expect(result?.data).toStrictEqual({
      title: 'Example Domain',
      description: 'Example description',
    });
  });

  test('should handle errors gracefully', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
    };

    // Mock the provider to throw an error for this specific test
    mockNodeFetchProvider.mockImplementationOnce(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      scrape: vi.fn().mockRejectedValue(new Error('Network error')),
      extract: vi.fn().mockRejectedValue(new Error('Network error')),
    }));

    await expect(
      quickScrape('https://this-url-does-not-exist.com', selectors, {
        provider: 'node-fetch',
      }),
    ).rejects.toThrow('Quick scrape failed');
  });
});
