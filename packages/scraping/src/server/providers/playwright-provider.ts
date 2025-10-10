import { Browser, BrowserContext, ElementHandle, Page } from 'playwright';

import { ScrapingError, ScrapingErrorCode } from '../../shared/errors';
import {
  ProviderConfig,
  ScrapeOptions,
  ScrapeResult,
  ScrapingProvider,
  type ExtractionResult,
  type SelectorMap,
} from '../../shared/types/scraping-types';
import { humanDelay, retryWithBackoff } from '../../shared/utils/helpers';

/**
 * Enhanced Playwright scraper with reduced boilerplate
 */
export class PlaywrightProvider implements ScrapingProvider {
  readonly name = 'playwright';
  readonly type = 'browser' as const;

  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  private playwright?: any;
  private config: {
    headless?: boolean;
    viewport?: { width: number; height: number };
    userAgent?: string;
    defaultTimeout?: number;
    autoClose?: boolean;
  } = {};

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = {
      autoClose: true,
      defaultTimeout: config.timeout || 30000,
      headless: true,
      ...config.options,
    };
  }

  /**
   * Initialize browser, context, and page in one go
   */
  async init(): Promise<Page> {
    if (this.page) return this.page;

    // Dynamic import
    this.playwright = await import('playwright');

    // Launch browser
    this.browser = await this.playwright.chromium.launch({
      headless: this.config.headless,
    });

    if (!this.browser) {
      throw new Error('Failed to launch browser');
    }

    // Create context with default settings
    this.context = await this.browser.newContext({
      userAgent: this.config.userAgent,
      viewport: this.config.viewport ?? { width: 1920, height: 1080 },
    });

    // Create page
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.defaultTimeout || 30000);

    return this.page;
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    const startTime = Date.now();
    const page = await this.init();

    try {
      // Navigate to URL with built-in retry and error handling
      await retryWithBackoff(
        async () => {
          // Map waitUntil values from generic options to Playwright-specific
          let waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' | undefined;
          if (options.waitUntil) {
            if (options.waitUntil === 'networkidle0' || options.waitUntil === 'networkidle2') {
              waitUntil = 'networkidle';
            } else {
              waitUntil = options.waitUntil as 'load' | 'domcontentloaded';
            }
          } else {
            waitUntil = 'networkidle';
          }

          const response = await page.goto(url, {
            timeout: options.timeout,
            waitUntil,
          });

          if (!response || response.status() >= 400) {
            throw new ScrapingError(
              `Failed to load page: ${response?.status()}`,
              ScrapingErrorCode.NETWORK_ERROR,
            );
          }
        },
        { attempts: 3, delay: 1000 },
      );

      // Wait for selector if specified
      if (options.waitForSelector) {
        await this.waitFor(options.waitForSelector);
      }

      // Get page content
      const html = await page.content();
      const title = await page.title();

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        screenshot = await this.screenshot(
          typeof options.screenshot === 'object' ? options.screenshot : {},
        );
      }

      // Extract data if selectors provided
      let data: Record<string, any> | undefined;
      if (options.extract) {
        data = await this.extract(html, options.extract);
      }

      const endTime = Date.now();

      return {
        url,
        html,
        data,
        screenshot,
        provider: this.name,
        metadata: {
          title,
          statusCode: 200,
          timing: {
            start: startTime,
            end: endTime,
            duration: endTime - startTime,
          },
        },
      };
    } finally {
      if (this.config.autoClose) {
        await this.dispose();
      }
    }
  }

  async extract(html: string, selectors: SelectorMap): Promise<ExtractionResult> {
    const page = await this.init();
    const results: ExtractionResult = {};

    for (const [key, configOrSelector] of Object.entries(selectors)) {
      try {
        // Handle both string selectors and SelectorConfig objects
        const config =
          typeof configOrSelector === 'string' ? { selector: configOrSelector } : configOrSelector;

        if (config.multiple) {
          const elements = await page.$$(config.selector);
          const values = await Promise.all(
            elements.map(async (el: any) => {
              if (config.attribute) {
                return el.getAttribute(config.attribute);
              }
              return el.textContent();
            }),
          );
          // Filter out null values
          results[key] = values.filter((v): v is string => v !== null);
        } else {
          const element = await page.$(config.selector);
          if (element) {
            if (config.attribute) {
              results[key] = await element.getAttribute(config.attribute);
            } else {
              results[key] = await element.textContent();
            }
          }
        }

        // Apply transform if provided
        if (config.transform && results[key] !== null) {
          if (typeof config.transform === 'function') {
            results[key] = config.transform(results[key]);
          }
          // Note: String transforms like 'text', 'html' etc. would be handled
          // in a more complete implementation, but for now we skip them
        }
      } catch {
        results[key] = null;
      }
    }

    return results;
  }

  /**
   * Wait for element and return it
   */
  async waitFor(
    selector: string,
    options: {
      timeout?: number;
      state?: 'attached' | 'detached' | 'visible' | 'hidden';
    } = {},
  ): Promise<ElementHandle> {
    const page = await this.init();

    const element = await page.waitForSelector(selector, {
      state: options.state || 'visible',
      timeout: options.timeout,
    });

    if (!element) {
      throw new ScrapingError(
        `Element not found: ${selector}`,
        ScrapingErrorCode.ELEMENT_NOT_FOUND,
      );
    }

    return element;
  }

  /**
   * Extract text from element
   */
  async getText(selector: string): Promise<string | null> {
    const page = await this.init();
    return page.textContent(selector);
  }

  /**
   * Extract multiple texts
   */
  async getTexts(selector: string): Promise<string[]> {
    const page = await this.init();
    return page.$$eval(selector, (els: any) => els.map((el: any) => el.textContent || ''));
  }

  /**
   * Extract attribute from element
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const page = await this.init();
    return page.getAttribute(selector, attribute);
  }

  /**
   * Extract href links
   */
  async getLinks(selector?: string): Promise<string[]> {
    const page = await this.init();
    const linkSelector = selector || 'a[href]';
    return page.$$eval(linkSelector, (links: any) =>
      links.map((link: any) => (link as HTMLAnchorElement).href),
    );
  }

  /**
   * Fill form fields
   */
  async fillForm(fields: Record<string, string>): Promise<void> {
    const page = await this.init();

    for (const [selector, value] of Object.entries(fields)) {
      await page.fill(selector, value);
      await humanDelay(100, 300); // Human-like delay between fields
    }
  }

  /**
   * Click element with retry
   */
  async click(
    selector: string,
    options: {
      timeout?: number;
      force?: boolean;
    } = {},
  ): Promise<void> {
    const page = await this.init();

    await page.click(selector, {
      force: options.force,
      timeout: options.timeout,
    });
  }

  /**
   * Take screenshot
   */
  async screenshot(
    options: {
      path?: string;
      fullPage?: boolean;
      selector?: string;
    } = {},
  ): Promise<Buffer> {
    const page = await this.init();

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

  /**
   * Execute JavaScript in page context
   */
  async evaluate<T>(fn: () => T): Promise<T> {
    const page = await this.init();
    return page.evaluate(fn);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(
    options: {
      url?: string | RegExp;
      timeout?: number;
    } = {},
  ): Promise<void> {
    const page = await this.init();
    await page.waitForNavigation({
      url: options.url,
      timeout: options.timeout,
    });
  }

  /**
   * Block resources to speed up scraping
   */
  async blockResources(types: string[]): Promise<void> {
    const page = await this.init();

    await page.route('**/*', (route: any) => {
      if (types.includes(route.request().resourceType())) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  /**
   * Get page content
   */
  async getContent(): Promise<string> {
    const page = await this.init();
    return page.content();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    const page = await this.init();
    return page.title();
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.browser) return false;
      return this.browser.isConnected();
    } catch {
      return false;
    }
  }

  /**
   * Clean up resources
   */
  async dispose(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();

    this.page = undefined;
    this.context = undefined;
    this.browser = undefined;
  }

  /**
   * Auto-closing wrapper for operations
   */
  async withAutoClose<T>(operation: (scraper: PlaywrightProvider) => Promise<T>): Promise<T> {
    try {
      return await operation(this);
    } finally {
      if (this.config.autoClose) {
        await this.dispose();
      }
    }
  }
}

/**
 * Convenience function for quick scraping
 */
async function quickScrape(
  url: string,
  selectors: SelectorMap,
  options: {
    waitForSelector?: string;
    blockResources?: string[];
    screenshot?: boolean;
  } = {},
): Promise<{
  data: ExtractionResult;
  title: string;
  screenshot?: Buffer;
}> {
  const scraper = new PlaywrightProvider();
  await scraper.initialize({ options: { headless: true } });

  return scraper.withAutoClose(async (s: any) => {
    // Navigate to URL
    const result = await s.scrape(url, {
      waitForSelector: options.waitForSelector,
      screenshot: options.screenshot,
      extract: selectors,
    });

    return {
      data: result?.data || {},
      screenshot: result.screenshot,
      title: result.metadata.title || '',
    };
  });
}

/**
 * Scrape multiple pages with the same selectors
 */
async function _scrapeMultiple(
  urls: string[],
  selectors: SelectorMap,
  options: {
    concurrent?: number;
    onProgress?: (url: string, index: number, total: number) => void;
  } = {},
): Promise<{ url: string; data: ExtractionResult; error?: string }[]> {
  const concurrent = options.concurrent || 3;
  const results: { url: string; data: ExtractionResult; error?: string }[] = [];

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += concurrent) {
    const batch = urls.slice(i, i + concurrent);

    const batchResults = await Promise.all(
      batch.map(async (url, batchIndex: any) => {
        const index = i + batchIndex;

        try {
          if (options.onProgress) {
            options.onProgress(url, index + 1, urls.length);
          }

          const { data } = await quickScrape(url, selectors);
          return { url, data };
        } catch (error) {
          return {
            url,
            data: {},
            error:
              error instanceof Error
                ? (error as Error)?.message || 'Unknown error'
                : 'Unknown error',
          };
        }
      }),
    );

    results.push(...batchResults);
  }

  return results;
}

/**
 * Scrape with pagination support
 */
async function _scrapeWithPagination(
  startUrl: string,
  selectors: SelectorMap & {
    nextPageSelector?: string;
  },
  options: {
    maxPages?: number;
    delay?: number;
  } = {},
): Promise<{ page: number; data: ExtractionResult }[]> {
  const scraper = new PlaywrightProvider();
  await scraper.initialize({ options: { headless: true } });
  const results: { page: number; data: ExtractionResult }[] = [];
  const maxPages = options.maxPages || 10;

  return scraper.withAutoClose(async (s: any) => {
    let currentUrl = startUrl;
    let pageNum = 1;

    while (pageNum <= maxPages) {
      // Navigate to page and extract
      const result = await s.scrape(currentUrl, { extract: selectors });
      const data = result?.data || {};
      results.push({ data, page: pageNum });

      // Check for next page
      if (selectors.nextPageSelector) {
        try {
          const nextLink = await s.getAttribute(selectors.nextPageSelector, 'href');
          if (!nextLink) break;

          currentUrl = new URL(nextLink, currentUrl).href;
          pageNum++;

          // Add delay between pages
          if (options.delay) {
            await humanDelay(options.delay, options.delay * 1.5);
          }
        } catch {
          break; // No more pages
        }
      } else {
        break;
      }
    }

    return results;
  });
}
