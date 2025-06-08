import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createScraper } from '../../../shared/factories/scraper-factory';
import type { ScrapingProvider } from '../../../shared/types/scraping-types';

// Mock the server/client scraper creation
vi.mock('../../../shared/factories/scraper-factory', async () => {
  const actual = await vi.importActual<typeof import('../../../shared/factories/scraper-factory')>(
    '../../../shared/factories/scraper-factory',
  );
  return {
    ...actual,
    createServerScraper: vi.fn(),
    createClientScraper: vi.fn(),
  };
});

describe('createScraper', () => {
  const mockProvider: ScrapingProvider = {
    name: 'mock',
    type: 'custom' as const,
    async initialize(config: any): Promise<void> {
      // Mock initialization
    },
    async extract(html: string, selectors: any): Promise<any> {
      return {};
    },
    async scrape(url: string, options?: any) {
      return {
        url,
        html: '<html><body>Mock content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'mock',
      };
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('environment detection', () => {
    it('should create server scraper by default', async () => {
      const { createServerScraper } = await import('../../../shared/factories/scraper-factory');
      (createServerScraper as any).mockResolvedValue(mockProvider);

      const scraper = await createScraper();

      expect(createServerScraper).toHaveBeenCalled();
    });

    it('should create client scraper when specified', async () => {
      const { createClientScraper } = await import('../../../shared/factories/scraper-factory');
      (createClientScraper as any).mockResolvedValue(mockProvider);

      const scraper = await createScraper(undefined, { environment: 'client' });

      expect(createClientScraper).toHaveBeenCalled();
    });
  });

  describe('provider selection', () => {
    it('should pass provider option to scraper creation', async () => {
      const { createServerScraper } = await import('../../../shared/factories/scraper-factory');
      (createServerScraper as any).mockResolvedValue(mockProvider);

      await createScraper(undefined, { provider: 'playwright' });

      expect(createServerScraper).toHaveBeenCalledWith('playwright', expect.any(Object));
    });

    it('should pass config to scraper creation', async () => {
      const { createServerScraper } = await import('../../../shared/factories/scraper-factory');
      (createServerScraper as any).mockResolvedValue(mockProvider);

      const config = { timeout: 5000 };
      await createScraper(undefined, { config });

      expect(createServerScraper).toHaveBeenCalledWith('auto', config);
    });
  });
});
