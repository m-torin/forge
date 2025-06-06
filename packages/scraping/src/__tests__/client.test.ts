import { describe, it, expect, beforeEach } from 'vitest';
import { createClientScraping, quickScrape } from '../client';
import type { ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';

describe('Client Scraping', () => {
  let scraper: Awaited<ReturnType<typeof createClientScraping>>;

  beforeEach(async () => {
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

    await expect(quickScrape('https://this-url-does-not-exist.com', selectors)).rejects.toThrow();
  });
});
