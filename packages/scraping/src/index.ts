import { createHeroScraper } from './hero';
import { createPlaywrightScraper } from './playwright';
import { createPuppeteerScraper } from './puppeteer';

// Re-export all types
// Factory function to create appropriate scraper
import type { BrowserManager, ScrapingEngine, ScrapingEngineConfig } from './types';

export * from './types';

// Re-export utilities
export * from './utils';

// Re-export engine implementations
export * from './puppeteer';
export * from './playwright';
export * from './hero';

export function createScraper(
  engine: ScrapingEngine = 'puppeteer',
  config?: Partial<ScrapingEngineConfig>,
): BrowserManager {
  switch (engine) {
    case 'puppeteer':
      return createPuppeteerScraper(config);
    case 'playwright':
      return createPlaywrightScraper(config);
    case 'hero':
      return createHeroScraper(config);
    default:
      throw new Error(`Unknown scraping engine: ${engine}`);
  }
}
