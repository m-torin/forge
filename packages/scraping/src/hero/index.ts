import { ScrapingError, ScrapingErrorCodes } from '../types';
import {
  detectCaptcha,
  extractFromHtml,
  getRandomUserAgent,
  humanDelay,
  retryWithBackoff,
} from '../utils';

import type {
  BrowserManager,
  ExtractionResult,
  ScrapingEngineConfig,
  ScrapingOptions,
  ScrapingResult,
  SelectorMap,
} from '../types';

/**
 * Hero-based scraping implementation
 * Hero is an AI-powered browser automation tool
 */
export class HeroScraper implements BrowserManager {
  private hero?: any; // Will be Hero instance when installed
  private config: ScrapingEngineConfig;

  constructor(config: Partial<ScrapingEngineConfig> = {}) {
    this.config = {
      engine: 'hero',
      headless: true,
      maxConcurrency: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  async launch(): Promise<void> {
    try {
      // Dynamic import to handle optional peer dependency
      // @ts-ignore - Optional peer dependency, handled with try-catch
      const { Hero } = await import('@heroai/hero').catch(() => {
        throw new ScrapingError(
          'Hero is not installed. Run: npm install @heroai/hero',
          ScrapingErrorCodes.BROWSER_LAUNCH_FAILED,
        );
      });

      this.hero = new Hero({
        // Hero-specific configuration
        blockedResourceTypes: ['BlockImages', 'BlockStylesheets'],
        showChrome: !this.config.headless,
        userAgent: getRandomUserAgent(),
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Hero browser',
        ScrapingErrorCodes.BROWSER_LAUNCH_FAILED,
        undefined,
        error,
      );
    }
  }

  async close(): Promise<void> {
    if (this.hero) {
      await this.hero.close();
      this.hero = undefined;
    }
  }

  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    if (!this.hero) {
      await this.launch();
    }

    const startTime = Date.now();

    try {
      // Set user agent if provided
      if (options.userAgent) {
        await this.hero!.setUserAgent(options.userAgent);
      }

      // Navigate to URL
      await this.hero!.goto(options.url, {
        timeoutMs: options.waitForTimeout,
      });

      // Wait for page to stabilize
      await this.hero!.waitForPaintingStable();

      // Wait for selector if specified
      if (options.waitForSelector) {
        await this.hero!.querySelector(options.waitForSelector).wait({
          timeoutMs: options.waitForTimeout,
        });
      }

      // Add human-like delay
      await humanDelay(500, 1500);

      // Get page content
      const html = await this.hero!.document.body.innerHTML;
      const fullHtml = `<!DOCTYPE html><html><head>${await this.hero!.document.head.innerHTML}</head><body>${html}</body></html>`;

      // Check for CAPTCHA
      if (detectCaptcha(fullHtml)) {
        throw new ScrapingError(
          'CAPTCHA detected on page',
          ScrapingErrorCodes.CAPTCHA_DETECTED,
          options.url,
        );
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        screenshot = await this.hero!.takeScreenshot({
          fullPage: options.fullPage,
        });
      }

      // Get page metadata
      const title = await this.hero!.document.title;
      const metaDescription = await this.hero!.querySelector('meta[name="description"]')
        ?.getAttribute('content')
        .catch(() => undefined);

      const endTime = Date.now();

      return {
        url: options.url,
        html: fullHtml,
        metadata: {
          description: metaDescription,
          timing: {
            duration: endTime - startTime,
            end: endTime,
            start: startTime,
          },
          title,
        },
        screenshot,
      };
    } catch (error) {
      const endTime = Date.now();

      if (error instanceof ScrapingError) {
        throw error;
      }

      return {
        url: options.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        html: '',
        metadata: {
          timing: {
            duration: endTime - startTime,
            end: endTime,
            start: startTime,
          },
        },
      };
    }
  }

  extract(html: string, selectors: SelectorMap): ExtractionResult {
    return extractFromHtml(html, selectors);
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.hero) {
        return false;
      }

      // Check if Hero is still connected
      await this.hero.url;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Hero-specific: Use AI to extract data
   */
  async extractWithAI(prompt: string): Promise<unknown> {
    if (!this.hero) {
      throw new Error('Hero not initialized');
    }

    try {
      // Hero's AI extraction capabilities
      return await this.hero!.ai.extract(prompt);
    } catch (error) {
      throw new ScrapingError('AI extraction failed', 'AI_EXTRACTION_FAILED', undefined, error);
    }
  }
}

/**
 * Factory function to create a Hero scraper
 */
export function createHeroScraper(config?: Partial<ScrapingEngineConfig>): HeroScraper {
  return new HeroScraper(config);
}

/**
 * Scrape a URL using Hero
 */
export async function scrapeHero(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createHeroScraper(config);

  try {
    await scraper.launch();
    return await retryWithBackoff(
      () => scraper.scrape(options),
      config?.retryAttempts || 3,
      config?.retryDelay || 1000,
    );
  } finally {
    await scraper.close();
  }
}
