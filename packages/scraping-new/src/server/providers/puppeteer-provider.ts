/**
 * Puppeteer-based scraping provider
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

import type { Browser, Page } from 'puppeteer';
import type {
  ScrapingProvider,
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
} from '../../shared/types/scraping-types';

/**
 * Puppeteer scraping provider with full browser automation
 */
export class PuppeteerProvider implements ScrapingProvider {
  readonly name = 'puppeteer';
  readonly type = 'browser' as const;

  private browser?: Browser;
  private puppeteer?: any;
  private config: {
    headless?: boolean;
    args?: string[];
    executablePath?: string;
    viewport?: { width: number; height: number };
    userAgent?: string;
    defaultTimeout?: number;
    autoClose?: boolean;
    maxConcurrency?: number;
    retryAttempts?: number;
    retryDelay?: number;
  } = {};

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      defaultTimeout: config.timeout || 30000,
      autoClose: true,
      maxConcurrency: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config.options,
    };
  }

  async launch(): Promise<void> {
    try {
      // Dynamic import to handle optional peer dependency
      this.puppeteer = await import('puppeteer').catch(() => {
        throw new ScrapingError(
          'Puppeteer is not installed. Run: npm install puppeteer',
          ScrapingErrorCode.PROVIDER_ERROR,
        );
      });

      this.browser = await this.puppeteer.default.launch({
        args: this.config.args,
        executablePath: this.config.executablePath,
        headless: this.config.headless ? 'new' : false,
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Puppeteer browser',
        ScrapingErrorCode.PROVIDER_ERROR,
        undefined,
        error,
      );
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    if (!this.browser) {
      await this.launch();
    }

    const startTime = Date.now();
    let page: Page | undefined;

    try {
      page = await this.browser!.newPage();

      // Set user agent
      const userAgent = options.userAgent || this.config.userAgent || getRandomUserAgent();
      await page.setUserAgent(userAgent);

      // Set viewport
      if (options.viewport || this.config.viewport) {
        await page.setViewport(options.viewport || this.config.viewport!);
      }

      // Set headers
      if (options.headers) {
        await page.setExtraHTTPHeaders(options.headers);
      }

      // Set cookies
      if (options.cookies && options.cookies.length > 0) {
        await page.setCookie(...options.cookies);
      }

      // Block resource types if specified
      if (options.blockResources && options.blockResources.length > 0) {
        await page.setRequestInterception(true);
        page.on('request', (request: any) => {
          if (options.blockResources!.includes(request.resourceType())) {
            request.abort();
          } else {
            request.continue();
          }
        });
      }

      // Navigate to page with retry
      await retryWithBackoff(
        async () => {
          const response = await page!.goto(url, {
            timeout: options.timeout || this.config.defaultTimeout,
            waitUntil: options.waitUntil || 'networkidle2',
          });

          if (!response || response.status() >= 400) {
            throw new ScrapingError(
              `Failed to load page: ${response?.status()}`,
              ScrapingErrorCode.NETWORK_ERROR,
            );
          }
        },
        { attempts: this.config.retryAttempts || 3, delay: this.config.retryDelay || 1000 },
      );

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.timeout || this.config.defaultTimeout,
        });
      }

      // Add human-like delay
      await humanDelay(500, 1500);

      // Get page content
      const html = await page.content();

      // Check for CAPTCHA
      if (detectCaptcha(html)) {
        throw new ScrapingError('CAPTCHA detected on page', ScrapingErrorCode.CAPTCHA_DETECTED);
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        const screenshotOptions = typeof options.screenshot === 'object' ? options.screenshot : {};
        screenshot = await page.screenshot({
          type: 'png',
          fullPage: screenshotOptions.fullPage || false,
          ...screenshotOptions,
        });
      }

      // Extract data if selectors provided
      let data: Record<string, any> | undefined;
      if (options.extract) {
        data = await this.extract(html, options.extract, page);
      }

      // Get page metadata
      const title = await page.title();
      const description = await page
        .$eval('meta[name="description"]', (el: any) => el.content)
        .catch(() => undefined);

      const endTime = Date.now();

      return {
        url,
        html,
        data,
        screenshot,
        provider: this.name,
        metadata: {
          title,
          description,
          statusCode: 200,
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
      if (page) {
        await page.close();
      }

      if (this.config.autoClose && this.browser) {
        await this.dispose();
      }
    }
  }

  async extract(html: string, selectors: SelectorMap, page?: Page): Promise<ExtractionResult> {
    // If we have a page instance, use it for more accurate extraction
    if (page) {
      return this.extractFromPage(page, selectors);
    }

    // Fallback to HTML parsing (less accurate but works without page)
    return this.extractFromHtml(html, selectors);
  }

  private async extractFromPage(page: Page, selectors: SelectorMap): Promise<ExtractionResult> {
    const results: ExtractionResult = {};

    for (const [key, configOrSelector] of Object.entries(selectors)) {
      try {
        const config =
          typeof configOrSelector === 'string' ? { selector: configOrSelector } : configOrSelector;

        if (config.multiple) {
          const elements = await page.$$(config.selector);
          const values = await Promise.all(
            elements.map(async (el) => {
              if (config.attribute) {
                return el.evaluate((element, attr) => element.getAttribute(attr), config.attribute);
              }
              return el.evaluate((element) => element.textContent);
            }),
          );
          results[key] = values.filter((v): v is string => v !== null);
        } else {
          const element = await page.$(config.selector);
          if (element) {
            if (config.attribute) {
              results[key] = await element.evaluate(
                (el, attr) => el.getAttribute(attr),
                config.attribute,
              );
            } else {
              results[key] = await element.evaluate((el) => el.textContent);
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
      // This is simplified - a real implementation would parse the HTML properly
      result[key] = null;
    }

    return result;
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.browser) {
        return false;
      }

      const pages = await this.browser.pages();
      return pages.length >= 0;
    } catch {
      return false;
    }
  }

  async dispose(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  // Additional Puppeteer-specific methods for enhanced functionality
  async fillForm(page: Page, fields: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
      await page.type(selector, value);
      await humanDelay(100, 300);
    }
  }

  async click(
    page: Page,
    selector: string,
    options: { timeout?: number; force?: boolean } = {},
  ): Promise<void> {
    await page.click(selector, {
      timeout: options.timeout,
    });
  }

  async waitForNavigation(
    page: Page,
    options: { url?: string | RegExp; timeout?: number } = {},
  ): Promise<void> {
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: options.timeout,
    });
  }

  // Internal screenshot method for use with pages
  async screenshotPage(
    page: Page,
    options: { path?: string; fullPage?: boolean; selector?: string } = {},
  ): Promise<Buffer> {
    if (options.selector) {
      const element = await page.$(options.selector);
      if (!element) {
        throw new ScrapingError(
          `Element not found for screenshot: ${options.selector}`,
          ScrapingErrorCode.ELEMENT_NOT_FOUND,
        );
      }
      return element.screenshot({ path: options.path });
    }

    return page.screenshot({
      fullPage: options.fullPage,
      path: options.path,
    });
  }

  // Implementation of ScrapingProvider screenshot method
  async screenshot(options: { fullPage?: boolean; selector?: string } = {}): Promise<Buffer> {
    if (!this.browser) {
      throw new ScrapingError(
        'Browser not initialized',
        ScrapingErrorCode.PROVIDER_NOT_INITIALIZED,
      );
    }

    const page = await this.browser.newPage();
    try {
      return await this.screenshotPage(page, options);
    } finally {
      await page.close();
    }
  }

  async evaluateScript<T>(page: Page, fn: () => T): Promise<T> {
    return page.evaluate(fn);
  }
}

/**
 * Factory function to create a Puppeteer provider
 */
export function createPuppeteerProvider(config?: ProviderConfig): PuppeteerProvider {
  return new PuppeteerProvider();
}

/**
 * Legacy compatibility: Create Puppeteer scraper (maintains old API)
 */
export function createPuppeteerScraper(config?: any): PuppeteerProvider {
  const provider = new PuppeteerProvider();
  if (config) {
    provider.initialize({ options: config });
  }
  return provider;
}

/**
 * Legacy compatibility: Scrape with Puppeteer (maintains old API)
 */
export async function scrapePuppeteer(options: any, config?: any): Promise<any> {
  const provider = createPuppeteerScraper(config);

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
