import { beforeEach, describe, expect, vi } from 'vitest';

// Import after mocks are set up
import { createScraper, createServerScraper } from '../../../shared/factories/scraper-factory';

beforeAll(() => {
  vi.doMock('../../../server/providers/playwright-provider', async () => ({
    PlaywrightProvider: vi.fn().mockImplementation(() => ({
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
    })),
  }));
});

vi.mock('../../../server/providers/cheerio-provider', () => ({
  CheerioProvider: vi.fn().mockImplementation(() => ({
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
  })),
}));

vi.mock('../../../client/providers/fetch-provider', () => ({
  FetchProvider: vi.fn().mockImplementation(() => ({
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
  })),
}));

describe('createScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('environment detection', () => {
    test('should create server scraper by default', async () => {
      const scraper = await createScraper();

      // Verify it returns a provider
      expect(scraper).toBeDefined();
      expect(typeof scraper.initialize).toBe('function');
      expect(typeof scraper.scrape).toBe('function');
    });

    test('should create client scraper when specified', async () => {
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
    test('should create playwright provider by default', async () => {
      const scraper = await createServerScraper('playwright');

      expect(scraper).toBeDefined();
      const result = await scraper.scrape('https://example.com');
      expect(result.provider).toBe('playwright');
    });

    test('should pass config to provider', async () => {
      const config = { timeout: 5000 };
      const scraper = await createServerScraper('auto', config);

      expect(scraper).toBeDefined();
      expect(scraper.initialize).toHaveBeenCalledWith(config);
    });
  });
});
