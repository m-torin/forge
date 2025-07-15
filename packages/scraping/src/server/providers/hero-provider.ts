/**
 * Hero-based scraping provider
 * AI-powered browser automation with enhanced capabilities
 * Migrated from packages/scraping with enhanced functionality
 */

import { ScrapingError, ScrapingErrorCode } from '../../shared/errors';
import {
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
  ScrapingProvider,
  type ExtractionResult,
  type SelectorMap,
} from '../../shared/types/scraping-types';
import {
  detectCaptcha,
  getRandomUserAgent,
  humanDelay,
  retryWithBackoff,
} from '../../shared/utils/helpers';

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
      blockedResourceTypes: ['image', 'stylesheet'],
      ...config.options,
    };
  }

  async launch(): Promise<void> {
    try {
      // Dynamic import to handle optional peer dependency
      // Note: Using @ulixee/hero-playground as peer dependency
      const heroModule = await import('@ulixee/hero-playground').catch(() => {
        throw new ScrapingError(
          'Hero is not installed. Run: npm install @ulixee/hero-playground',
          ScrapingErrorCode.PROVIDER_ERROR,
        );
      });
      const Hero = heroModule.default || heroModule;

      this.hero = new Hero({
        // Hero-specific configuration
        // blockedResourceTypes: this.config.blockedResourceTypes, // Hero uses different format
        showChrome: !this.config.headless,
        userAgent: this.config.userAgent || getRandomUserAgent(),
        viewport: this.config.viewport,
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Hero browser',
        ScrapingErrorCode.PROVIDER_ERROR,
        undefined,
        error instanceof Error ? error : undefined,
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
        if (!this.hero)
          throw new ScrapingError(
            'Hero instance not initialized',
            ScrapingErrorCode.PROVIDER_ERROR,
          );
        await this.hero.setUserAgent(options.userAgent);
      }

      // Navigate to URL with retry
      await retryWithBackoff(
        async () => {
          if (!this.hero)
            throw new ScrapingError(
              'Hero instance not initialized',
              ScrapingErrorCode.PROVIDER_ERROR,
            );
          await this.hero.goto(url, {
            timeoutMs: options.timeout || this.config.defaultTimeout,
          });
        },
        { attempts: this.config.retryAttempts || 3, delay: this.config.retryDelay || 1000 },
      );

      // Wait for page to stabilize
      if (!this.hero)
        throw new ScrapingError('Hero instance not initialized', ScrapingErrorCode.PROVIDER_ERROR);
      await this.hero.waitForPaintingStable();

      // Wait for selector if specified
      if (options.waitForSelector) {
        if (!this.hero)
          throw new ScrapingError(
            'Hero instance not initialized',
            ScrapingErrorCode.PROVIDER_ERROR,
          );
        await this.hero.querySelector(options.waitForSelector).wait({
          timeoutMs: options.timeout || this.config.defaultTimeout,
        });
      }

      // Add human-like delay
      await humanDelay(500, 1500);

      // Get page content
      if (!this.hero)
        throw new ScrapingError('Hero instance not initialized', ScrapingErrorCode.PROVIDER_ERROR);
      const html = await this.hero.document.body.innerHTML;
      const fullHtml = `<!DOCTYPE html><html><head>${await this.hero.document.head.innerHTML}</head><body>${html}</body></html>`;

      // Check for CAPTCHA
      if (detectCaptcha(fullHtml)) {
        throw new ScrapingError('CAPTCHA detected on page', ScrapingErrorCode.CAPTCHA_DETECTED);
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        const screenshotOptions = typeof options.screenshot === 'object' ? options.screenshot : {};
        if (!this.hero)
          throw new ScrapingError(
            'Hero instance not initialized',
            ScrapingErrorCode.PROVIDER_ERROR,
          );
        screenshot = await this.hero.takeScreenshot({
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
      const title = await this.hero.document.title;
      const metaDescription = await this.hero
        .querySelector('meta[name="description"]')
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
      if (error instanceof ScrapingError) {
        throw error;
      }

      throw new ScrapingError(
        error instanceof Error
          ? (error as Error)?.message || 'Unknown error'
          : 'Unknown error during scraping',
        ScrapingErrorCode.SCRAPING_FAILED,
        { url },
        error instanceof Error ? error : undefined,
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
          if (!this.hero)
            throw new ScrapingError(
              'Hero instance not initialized',
              ScrapingErrorCode.PROVIDER_ERROR,
            );
          const elements = await this.hero.querySelectorAll(config.selector);
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
          if (!this.hero)
            throw new ScrapingError(
              'Hero instance not initialized',
              ScrapingErrorCode.PROVIDER_ERROR,
            );
          const element = await this.hero.querySelector(config.selector);
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
      } catch (error) {
        // Re-throw extraction errors so they can be handled upstream
        throw new Error(`Failed to extract data for key "${key}": ${(error as Error).message}`);
      }
    }

    return results;
  }

  private extractFromHtml(html: string, selectors: SelectorMap): ExtractionResult {
    const result: ExtractionResult = {};

    // Basic HTML parsing (simplified implementation)
    // In production, this would use a proper HTML parser like cheerio
    for (const [key] of Object.entries(selectors)) {
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
      return await this.hero.ai?.extract(prompt);
    } catch (error) {
      throw new ScrapingError(
        'AI extraction failed',
        ScrapingErrorCode.AI_EXTRACTION_FAILED,
        undefined,
        error instanceof Error ? error : undefined,
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
      await this.hero.ai?.interact(instruction);
    } catch (error) {
      throw new ScrapingError(
        'AI interaction failed',
        ScrapingErrorCode.INTERACTION_FAILED,
        undefined,
        error instanceof Error ? error : undefined,
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
      // Health check failures should return false but not throw
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
  // eslint-disable-next-line unused-imports/no-unused-vars
  async click(selector: string, options = {}): Promise<void> {
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

  async typeText(selector: string, text: string): Promise<void> {
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
export function createHeroProvider(_config?: ProviderConfig): HeroProvider {
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
