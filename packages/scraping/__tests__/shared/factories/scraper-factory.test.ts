import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocks are set up
import { createScraper, createServerScraper } from '@/shared/factories/scraper-factory';

// Use vi.hoisted to ensure mocks are available before module imports
const { mockPlaywrightProvider, mockCheerioProvider, mockFetchProvider, mockConsoleProvider } =
  vi.hoisted(() => {
    const mockPlaywrightProvider = vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      scrape: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: '<html><body>Mock content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'playwright',
      }),
    }));

    const mockCheerioProvider = vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      scrape: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: '<html><body>Mock content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'cheerio',
      }),
    }));

    const mockFetchProvider = vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      scrape: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: '<html><body>Mock content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'fetch',
      }),
    }));

    const mockConsoleProvider = vi.fn().mockImplementation(() => ({
      initialize: vi.fn().mockResolvedValue(undefined),
      scrape: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        html: '<html><body>Mock content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'console',
      }),
    }));

    return { mockPlaywrightProvider, mockCheerioProvider, mockFetchProvider, mockConsoleProvider };
  });

// Mock the providers
vi.doMock('../../../server/providers/playwright-provider', () => ({
  PlaywrightProvider: mockPlaywrightProvider,
}));

vi.doMock('../../../server/providers/cheerio-provider', () => ({
  CheerioProvider: mockCheerioProvider,
}));

vi.doMock('../../../client/providers/fetch-provider', () => ({
  FetchProvider: mockFetchProvider,
}));

vi.doMock('../../../shared/providers/console-provider', () => ({
  ConsoleProvider: mockConsoleProvider,
}));

describe('createScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('environment detection', () => {
    test.todo('should create server scraper by default', async () => {
      const scraper = await createScraper();

      // Verify it returns a provider
      expect(scraper).toBeDefined();
      expect(typeof scraper.initialize).toBe('function');
      expect(typeof scraper.scrape).toBe('function');
    });

    test.todo('should create client scraper when specified', async () => {
      // Mock window object for client environment

      const originalWindow = global.window;
      global.window = {} as any;

      try {
        const scraper = await createScraper(undefined, { environment: 'client' });

        // Verify it returns a provider
        expect(scraper).toBeDefined();
        expect(typeof scraper.initialize).toBe('function');
        expect(typeof scraper.scrape).toBe('function');
      } finally {
        // @ts-ignore
        delete global.window;
      }
    });
  });

  describe('provider selection', () => {
    test.todo('should create playwright provider by default', async () => {
      const scraper = await createServerScraper('playwright');

      expect(scraper).toBeDefined();
      const result = await scraper.scrape('https://example.com');
      expect(result.provider).toBe('playwright');
    });

    test.todo('should pass config to provider', async () => {
      const config = { timeout: 5000 };
      const scraper = await createServerScraper('auto', config);

      expect(scraper).toBeDefined();
      expect(scraper.initialize).toHaveBeenCalledWith(config);
    });
  });
});
