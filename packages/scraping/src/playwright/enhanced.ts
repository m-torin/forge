import {
  type ExtractionResult,
  ScrapingError,
  ScrapingErrorCodes,
  type SelectorMap,
} from '../types';
import { humanDelay, retryWithBackoff } from '../utils';

import type { Browser, BrowserContext, ElementHandle, Page } from 'playwright';

/**
 * Enhanced Playwright scraper with reduced boilerplate
 */
export class EnhancedPlaywrightScraper {
  private browser?: Browser;
  private context?: BrowserContext;
  private page?: Page;
  private playwright?: any;

  constructor(
    private config: {
      headless?: boolean;
      viewport?: { width: number; height: number };
      userAgent?: string;
      defaultTimeout?: number;
      autoClose?: boolean;
    } = {},
  ) {
    this.config = {
      autoClose: true,
      defaultTimeout: 30000,
      headless: true,
      ...config,
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

  /**
   * Navigate to URL with built-in retry and error handling
   */
  async goto(
    url: string,
    options: {
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
      timeout?: number;
    } = {},
  ): Promise<void> {
    const page = await this.init();

    await retryWithBackoff(
      async () => {
        const response = await page.goto(url, {
          timeout: options.timeout,
          waitUntil: options.waitUntil || 'networkidle',
        });

        if (!response || response.status() >= 400) {
          throw new ScrapingError(
            `Failed to load page: ${response?.status()}`,
            ScrapingErrorCodes.PAGE_LOAD_FAILED,
            url,
          );
        }
      },
      3,
      1000,
    );
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
        ScrapingErrorCodes.SELECTOR_NOT_FOUND,
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
    return page.$$eval(selector, (els) => els.map((el) => el.textContent || ''));
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
    return page.$$eval(linkSelector, (links) =>
      links.map((link) => (link as HTMLAnchorElement).href),
    );
  }

  /**
   * Extract data using a selector map
   */
  async extract(selectors: SelectorMap): Promise<ExtractionResult> {
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
            elements.map(async (el) => {
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

        // Apply transform if provided - transform is a string indicating the type of transformation
        if (config.transform && results[key] !== null) {
          const _value = results[key];
          switch (config.transform) {
            case 'text':
              // Already text content, no transformation needed
              break;
            case 'html':
              // Would need to get innerHTML instead, but for now keep as text
              break;
            case 'href':
            case 'src':
            case 'value':
              // These should be handled by setting the appropriate attribute
              break;
          }
        }
      } catch {
        results[key] = null;
      }
    }

    return results;
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
          ScrapingErrorCodes.SELECTOR_NOT_FOUND,
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

    await page.route('**/*', (route) => {
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

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
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
  async withAutoClose<T>(
    operation: (scraper: EnhancedPlaywrightScraper) => Promise<T>,
  ): Promise<T> {
    try {
      return await operation(this);
    } finally {
      if (this.config.autoClose) {
        await this.close();
      }
    }
  }
}

/**
 * Convenience function for quick scraping
 */
export async function quickScrape(
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
  const scraper = new EnhancedPlaywrightScraper({ headless: true });

  return scraper.withAutoClose(async (s) => {
    // Navigate to URL
    await s.goto(url);

    // Block resources if specified
    if (options.blockResources) {
      await s.blockResources(options.blockResources);
    }

    // Wait for selector if specified
    if (options.waitForSelector) {
      await s.waitFor(options.waitForSelector);
    }

    // Extract data
    const data = await s.extract(selectors);
    const title = await s.getTitle();

    // Take screenshot if requested
    let screenshot;
    if (options.screenshot) {
      screenshot = await s.screenshot({ fullPage: true });
    }

    return { data, screenshot, title };
  });
}

/**
 * Scrape multiple pages with the same selectors
 */
export async function scrapeMultiple(
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
      batch.map(async (url, batchIndex) => {
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
            error: error instanceof Error ? error.message : 'Unknown error',
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
export async function scrapeWithPagination(
  startUrl: string,
  selectors: SelectorMap & {
    nextPageSelector?: string;
  },
  options: {
    maxPages?: number;
    delay?: number;
  } = {},
): Promise<{ page: number; data: ExtractionResult }[]> {
  const scraper = new EnhancedPlaywrightScraper({ headless: true });
  const results: { page: number; data: ExtractionResult }[] = [];
  const maxPages = options.maxPages || 10;

  return scraper.withAutoClose(async (s) => {
    let currentUrl = startUrl;
    let pageNum = 1;

    while (pageNum <= maxPages) {
      // Navigate to page
      await s.goto(currentUrl);

      // Extract data
      const data = await s.extract(selectors);
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
