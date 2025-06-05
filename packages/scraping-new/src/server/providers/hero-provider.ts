/**
 * Hero-based scraping provider
 * AI-powered browser automation with enhanced capabilities
 * Migrated from packages/scraping with enhanced functionality
 */

import {
  type ExtractionResult,
  type SelectorMap,
  type SelectorConfig,
} from '../../shared/types/scraping-types';
import { ScrapingError, ScrapingErrorCode } from '../../shared/errors';
import {
  humanDelay,
  retryWithBackoff,
  getRandomUserAgent,
  detectCaptcha,
} from '../../shared/utils/helpers';

import type {
  ScrapingProvider,
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
} from '../../shared/types/scraping-types';

/**
 * Hero scraping provider with AI-powered capabilities
 * Hero is an AI-enhanced browser automation tool
 */
export class HeroProvider implements ScrapingProvider {
  readonly name = 'hero';
  readonly type = 'browser' as const;

  private hero?: any; // Will be Hero instance when installed
  private config: {
    headless?: boolean;
    viewport?: { width: number; height: number };
    userAgent?: string;
    defaultTimeout?: number;
    autoClose?: boolean;
    maxConcurrency?: number;
    retryAttempts?: number;
    retryDelay?: number;
    blockedResourceTypes?: string[];
  } = {};

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = {
      headless: true,
      defaultTimeout: config.timeout || 30000,
      autoClose: true,
      maxConcurrency: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      blockedResourceTypes: ['BlockImages', 'BlockStylesheets'],
      ...config.options,
    };
  }

  async launch(): Promise<void> {
    try {
      // Dynamic import to handle optional peer dependency
      // Note: Using @ulixee/hero-playground as peer dependency
      const { Hero } = await import('@ulixee/hero-playground').catch(() => {
        throw new ScrapingError(
          'Hero is not installed. Run: npm install @ulixee/hero-playground',
          ScrapingErrorCode.PROVIDER_ERROR,
        );
      });

      this.hero = new Hero({
        // Hero-specific configuration
        blockedResourceTypes: this.config.blockedResourceTypes,
        showChrome: !this.config.headless,
        userAgent: this.config.userAgent || getRandomUserAgent(),
        viewport: this.config.viewport,
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Hero browser',
        ScrapingErrorCode.PROVIDER_ERROR,
        undefined,
        error,
      );
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    if (!this.hero) {
      await this.launch();
    }

    const startTime = Date.now();

    try {
      // Set user agent if provided
      if (options.userAgent) {
        await this.hero!.setUserAgent(options.userAgent);
      }

      // Navigate to URL with retry
      await retryWithBackoff(
        async () => {
          await this.hero!.goto(url, {
            timeoutMs: options.timeout || this.config.defaultTimeout,
          });
        },
        { attempts: this.config.retryAttempts || 3, delay: this.config.retryDelay || 1000 },
      );

      // Wait for page to stabilize
      await this.hero!.waitForPaintingStable();

      // Wait for selector if specified
      if (options.waitForSelector) {
        await this.hero!.querySelector(options.waitForSelector).wait({
          timeoutMs: options.timeout || this.config.defaultTimeout,
        });
      }

      // Add human-like delay
      await humanDelay(500, 1500);

      // Get page content
      const html = await this.hero!.document.body.innerHTML;
      const fullHtml = `<!DOCTYPE html><html><head>${await this.hero!.document.head.innerHTML}</head><body>${html}</body></html>`;

      // Check for CAPTCHA
      if (detectCaptcha(fullHtml)) {
        throw new ScrapingError('CAPTCHA detected on page', ScrapingErrorCode.CAPTCHA_DETECTED);
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        const screenshotOptions = typeof options.screenshot === 'object' ? options.screenshot : {};
        screenshot = await this.hero!.takeScreenshot({
          fullPage: screenshotOptions.fullPage || false,
          ...screenshotOptions,
        });
      }

      // Extract data if selectors provided
      let data: Record<string, any> | undefined;
      if (options.extract) {
        data = await this.extract(fullHtml, options.extract);
      }

      // Get page metadata
      const title = await this.hero!.document.title;
      const metaDescription = await this.hero!.querySelector('meta[name="description"]')
        ?.getAttribute('content')
        .catch(() => undefined);

      const endTime = Date.now();

      return {
        url,
        html: fullHtml,
        data,
        screenshot,
        provider: this.name,
        metadata: {
          title,
          description: metaDescription,
          statusCode: 200, // Hero doesn't expose status codes directly
          timing: {
            start: startTime,
            end: endTime,
            duration: endTime - startTime,
          },
        },
      };
    } catch (error) {
      const endTime = Date.now();

      if (error instanceof ScrapingError) {
        throw error;
      }

      throw new ScrapingError(
        error instanceof Error ? error.message : 'Unknown error during scraping',
        ScrapingErrorCode.SCRAPING_FAILED,
        url,
        error,
      );
    } finally {
      if (this.config.autoClose && this.hero) {
        await this.dispose();
      }
    }
  }

  async extract(html: string, selectors: SelectorMap): Promise<ExtractionResult> {
    // Use Hero's enhanced extraction capabilities if available
    if (this.hero) {
      return this.extractWithHero(selectors);
    }

    // Fallback to HTML parsing
    return this.extractFromHtml(html, selectors);
  }

  private async extractWithHero(selectors: SelectorMap): Promise<ExtractionResult> {
    const results: ExtractionResult = {};

    for (const [key, configOrSelector] of Object.entries(selectors)) {
      try {
        const config =
          typeof configOrSelector === 'string' ? { selector: configOrSelector } : configOrSelector;

        if (config.multiple) {
          const elements = await this.hero!.querySelectorAll(config.selector);
          const values = await Promise.all(
            elements.map(async (el: any) => {
              if (config.attribute) {
                return el.getAttribute(config.attribute);
              }
              return el.textContent;
            }),
          );
          results[key] = values.filter((v): v is string => v !== null);
        } else {
          const element = await this.hero!.querySelector(config.selector);
          if (element) {
            if (config.attribute) {
              results[key] = await element.getAttribute(config.attribute);
            } else {
              results[key] = await element.textContent;
            }
          } else {
            results[key] = null;
          }
        }

        // Apply transform if provided
        if (config.transform && results[key] !== null) {
          if (typeof config.transform === 'function') {
            results[key] = config.transform(results[key]);
          }
        }
      } catch {
        results[key] = null;
      }
    }

    return results;
  }

  private extractFromHtml(html: string, selectors: SelectorMap): ExtractionResult {
    const result: ExtractionResult = {};

    // Basic HTML parsing (simplified implementation)
    // In production, this would use a proper HTML parser like cheerio
    for (const [key, selectorOrConfig] of Object.entries(selectors)) {
      const config: SelectorConfig =
        typeof selectorOrConfig === 'string'
          ? { selector: selectorOrConfig, transform: 'text' }
          : selectorOrConfig;

      // Placeholder extraction logic
      result[key] = null;
    }

    return result;
  }

  /**
   * Hero-specific: Use AI to extract data
   * This is the unique capability that Hero provides
   */
  async extractWithAI(prompt: string): Promise<unknown> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    try {
      // Hero's AI extraction capabilities
      // Note: The exact API may vary based on Hero version
      return await this.hero!.ai?.extract(prompt);
    } catch (error) {
      throw new ScrapingError(
        'AI extraction failed',
        ScrapingErrorCode.AI_EXTRACTION_FAILED,
        undefined,
        error,
      );
    }
  }

  /**
   * Hero-specific: Intelligent element interaction
   */
  async interactWithAI(instruction: string): Promise<void> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    try {
      // Use Hero's AI to understand and execute interaction instructions
      await this.hero!.ai?.interact(instruction);
    } catch (error) {
      throw new ScrapingError(
        'AI interaction failed',
        ScrapingErrorCode.INTERACTION_FAILED,
        undefined,
        error,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
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

  async dispose(): Promise<void> {
    if (this.hero) {
      await this.hero.close();
      this.hero = undefined;
    }
  }

  // Additional Hero-specific methods for enhanced functionality
  async click(selector: string, options: { timeout?: number } = {}): Promise<void> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    const element = await this.hero.querySelector(selector);
    if (!element) {
      throw new ScrapingError(
        `Element not found: ${selector}`,
        ScrapingErrorCode.ELEMENT_NOT_FOUND,
      );
    }

    await element.click();
  }

  async type(selector: string, text: string): Promise<void> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    const element = await this.hero.querySelector(selector);
    if (!element) {
      throw new ScrapingError(
        `Element not found: ${selector}`,
        ScrapingErrorCode.ELEMENT_NOT_FOUND,
      );
    }

    await element.type(text);
  }

  async waitForElement(selector: string, options: { timeout?: number } = {}): Promise<void> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    await this.hero.querySelector(selector).wait({
      timeoutMs: options.timeout || this.config.defaultTimeout,
    });
  }

  async evaluateScript<T>(fn: () => T): Promise<T> {
    if (!this.hero) {
      throw new ScrapingError('Hero not initialized', ScrapingErrorCode.PROVIDER_ERROR);
    }

    return this.hero.evaluate(fn);
  }
}

/**
 * Factory function to create a Hero provider
 */
export function createHeroProvider(config?: ProviderConfig): HeroProvider {
  return new HeroProvider();
}

/**
 * Legacy compatibility: Create Hero scraper (maintains old API)
 */
export function createHeroScraper(config?: any): HeroProvider {
  const provider = new HeroProvider();
  if (config) {
    provider.initialize({ options: config });
  }
  return provider;
}

/**
 * Legacy compatibility: Scrape with Hero (maintains old API)
 */
export async function scrapeHero(options: any, config?: any): Promise<any> {
  const provider = createHeroScraper(config);

  try {
    await provider.launch();
    return await retryWithBackoff(() => provider.scrape(options.url, options), {
      attempts: config?.retryAttempts || 3,
      delay: config?.retryDelay || 1000,
    });
  } finally {
    await provider.dispose();
  }
}
