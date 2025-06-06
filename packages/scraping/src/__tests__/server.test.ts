import { describe, it, expect, beforeEach } from 'vitest';
import { createServerScraping, quickScrape } from '../server';
import type { ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';

describe('Server Scraping', () => {
  let scraper: Awaited<ReturnType<typeof createServerScraping>>;

  beforeEach(async () => {
    const config: ScrapingConfig = {
      providers: {
        'node-fetch': { timeout: 5000 },
      },
    };
    scraper = await createServerScraping(config);
  });

  it('should create a server scraping instance', () => {
    expect(scraper).toBeDefined();
    expect(scraper.scrape).toBeDefined();
  });

  it('should perform a quick scrape using node-fetch', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
      description: { selector: 'meta[name="description"]', attribute: 'content' },
    };

    const result = await quickScrape('https://example.com', selectors, {
      provider: 'node-fetch',
    });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.data.title).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const selectors: SelectorMap = {
      title: 'h1',
    };

    await expect(
      quickScrape('https://this-url-does-not-exist.com', selectors, {
        provider: 'node-fetch',
      }),
    ).rejects.toThrow();
  });
});
