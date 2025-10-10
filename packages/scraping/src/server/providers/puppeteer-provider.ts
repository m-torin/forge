/**
 * Puppeteer-based scraping provider
 * Migrated from packages/scraping with enhanced functionality
 */

import { Browser, Page } from 'puppeteer';

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
 * Puppeteer-based scraping provider
 * Migrated from packages/scraping with enhanced functionality
 */

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
        error instanceof Error ? error : undefined,
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
      if (!this.browser)
        throw new ScrapingError('Browser not initialized', ScrapingErrorCode.PROVIDER_ERROR);
      page = await this.browser.newPage();

      // Set user agent
      const userAgent = options.userAgent || this.config.userAgent || getRandomUserAgent();
      await page.setUserAgent(userAgent);

      // Set viewport
      const viewport = options.viewport || this.config.viewport;
      if (viewport) {
        await page.setViewport(viewport);
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
          if (options.blockResources?.includes(request.resourceType())) {
            request.abort();
          } else {
            request.continue();
          }
        });
      }

      // Navigate to page with retry
      await retryWithBackoff(
        async () => {
          if (!page)
            throw new ScrapingError('Page not initialized', ScrapingErrorCode.PROVIDER_ERROR);
          const response = await page.goto(url, {
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
        const result = await page.screenshot({
          type: 'png',
          fullPage: screenshotOptions.fullPage || false,
          ...screenshotOptions,
        });
        screenshot = Buffer.from(result);
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
            elements.map(async (el: any) => {
              if (config.attribute) {
                return el.evaluate(
                  (element: Element, attr: string) => element.getAttribute(attr),
                  config.attribute,
                );
              }
              return el.evaluate((element: any) => element.textContent);
            }),
          );
          results[key] = values.filter((v): v is string => v !== null);
        } else {
          const element = await page.$(config.selector);
          if (element) {
            if (config.attribute) {
              results[key] = await element.evaluate(
                (el, attr: any) => el.getAttribute(attr),
                config.attribute,
              );
            } else {
              results[key] = await element.evaluate((el: any) => el.textContent);
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to extract data for key "${key}": ${errorMessage}`);
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
      // Health check failures should return false but not throw
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

  async click(page: Page, selector: string): Promise<void> {
    await page.click(selector);
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
      const screenshotOptions: any = {};
      if (
        options.path &&
        (options.path.endsWith('.png') ||
          options.path.endsWith('.jpeg') ||
          options.path.endsWith('.webp'))
      ) {
        screenshotOptions.path = options.path;
      }
      const result = await element.screenshot(screenshotOptions);
      return Buffer.from(result);
    }

    const screenshotOptions: any = {
      fullPage: options.fullPage,
    };
    if (
      options.path &&
      (options.path.endsWith('.png') ||
        options.path.endsWith('.jpeg') ||
        options.path.endsWith('.webp'))
    ) {
      screenshotOptions.path = options.path;
    }
    const result = await page.screenshot(screenshotOptions);
    return Buffer.from(result);
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
function _createPuppeteerProvider(_config?: ProviderConfig): PuppeteerProvider {
  return new PuppeteerProvider();
}

/**
 * Legacy compatibility: Create Puppeteer scraper (maintains old API)
 */
function createPuppeteerScraper(config?: any): PuppeteerProvider {
  const provider = new PuppeteerProvider();
  if (config) {
    provider.initialize({ options: config });
  }
  return provider;
}

/**
 * Legacy compatibility: Scrape with Puppeteer (maintains old API)
 */
async function _scrapePuppeteer(options: any, config?: any): Promise<any> {
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
