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
 * Playwright-based scraping implementation
 */
export class PlaywrightScraper implements BrowserManager {
  private browser?: any; // Will be Playwright.Browser when installed
  private playwright?: any; // Will be Playwright
  private config: ScrapingEngineConfig;

  constructor(config: Partial<ScrapingEngineConfig> = {}) {
    this.config = {
      engine: 'playwright',
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
      this.playwright = await import('playwright').catch(() => {
        throw new ScrapingError(
          'Playwright is not installed. Run: npm install playwright',
          ScrapingErrorCodes.BROWSER_LAUNCH_FAILED,
        );
      });

      // Default to Chromium, but could use firefox or webkit
      this.browser = await this.playwright.chromium.launch({
        args: this.config.args,
        executablePath: this.config.executablePath,
        headless: this.config.headless,
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Playwright browser',
        ScrapingErrorCodes.BROWSER_LAUNCH_FAILED,
        undefined,
        error,
      );
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
    }
  }

  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    if (!this.browser) {
      await this.launch();
    }

    const startTime = Date.now();
    let context: any; // Will be Playwright.BrowserContext
    let page: any; // Will be Playwright.Page

    try {
      // Create context with options
      context = await this.browser!.newContext({
        extraHTTPHeaders: options.headers,
        proxy: options.proxy
          ? {
              username: options.proxy.username,
              password: options.proxy.password,
              server: options.proxy.server,
            }
          : undefined,
        userAgent: options.userAgent || getRandomUserAgent(),
        viewport: options.viewport,
      });

      // Add cookies if provided
      if (options.cookies && options.cookies.length > 0) {
        await context.addCookies(options.cookies);
      }

      page = await context.newPage();

      // Block resource types if specified
      if (options.blockedResourceTypes && options.blockedResourceTypes.length > 0) {
        await page.route('**/*', (route: any) => {
          const request = route.request();
          if (options.blockedResourceTypes!.includes(request.resourceType())) {
            route.abort();
          } else {
            route.continue();
          }
        });
      }

      // Navigate to page
      const response = await page.goto(options.url, {
        timeout: options.waitForTimeout,
        waitUntil: 'networkidle',
      });

      const statusCode = response?.status();

      // Wait for selector if specified
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: options.waitForTimeout,
        });
      }

      // Add human-like delay
      await humanDelay(500, 1500);

      // Get page content
      const html = await page.content();

      // Check for CAPTCHA
      if (detectCaptcha(html)) {
        throw new ScrapingError(
          'CAPTCHA detected on page',
          ScrapingErrorCodes.CAPTCHA_DETECTED,
          options.url,
        );
      }

      // Take screenshot if requested
      let screenshot: Buffer | undefined;
      if (options.screenshot) {
        screenshot = await page.screenshot({
          type: 'png',
          fullPage: options.fullPage,
        });
      }

      // Get page metadata
      const title = await page.title();
      const description = await page
        .$eval('meta[name="description"]', (el: any) => el.getAttribute('content'))
        .catch(() => undefined);

      const endTime = Date.now();

      return {
        url: options.url,
        html,
        metadata: {
          description,
          statusCode,
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
    } finally {
      if (context) {
        await context.close();
      }
    }
  }

  extract(html: string, selectors: SelectorMap): ExtractionResult {
    return extractFromHtml(html, selectors);
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.browser) {
        return false;
      }

      return this.browser.isConnected();
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create a Playwright scraper
 */
export function createPlaywrightScraper(config?: Partial<ScrapingEngineConfig>): PlaywrightScraper {
  return new PlaywrightScraper(config);
}

/**
 * Scrape a URL using Playwright
 */
export async function scrapePlaywright(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createPlaywrightScraper(config);

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
