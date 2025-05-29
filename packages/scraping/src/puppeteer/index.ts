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
 * Puppeteer-based scraping implementation
 */
export class PuppeteerScraper implements BrowserManager {
  private browser?: any; // Will be Puppeteer.Browser when installed
  private config: ScrapingEngineConfig;

  constructor(config: Partial<ScrapingEngineConfig> = {}) {
    this.config = {
      engine: 'puppeteer',
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
      const puppeteer = await import('puppeteer').catch(() => {
        throw new ScrapingError(
          'Puppeteer is not installed. Run: npm install puppeteer',
          ScrapingErrorCodes.BROWSER_LAUNCH_FAILED,
        );
      });

      this.browser = await puppeteer.default.launch({
        args: this.config.args || [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        executablePath: this.config.executablePath,
        headless: this.config.headless ? 'new' : false,
      });
    } catch (error) {
      throw new ScrapingError(
        'Failed to launch Puppeteer browser',
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
    let page: any; // Will be Puppeteer.Page

    try {
      page = await this.browser!.newPage();

      // Set user agent
      const userAgent = options.userAgent || getRandomUserAgent();
      await page.setUserAgent(userAgent);

      // Set viewport
      if (options.viewport) {
        await page.setViewport(options.viewport);
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
      if (options.blockedResourceTypes && options.blockedResourceTypes.length > 0) {
        await page.setRequestInterception(true);
        page.on('request', (request: any) => {
          if (options.blockedResourceTypes!.includes(request.resourceType())) {
            request.abort();
          } else {
            request.continue();
          }
        });
      }

      // Navigate to page
      const response = await page.goto(options.url, {
        timeout: options.waitForTimeout,
        waitUntil: 'networkidle2',
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
        .$eval('meta[name="description"]', (el: any) => el.content)
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
      if (page) {
        await page.close();
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

      const pages = await this.browser.pages();
      return pages.length >= 0;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create a Puppeteer scraper
 */
export function createPuppeteerScraper(config?: Partial<ScrapingEngineConfig>): PuppeteerScraper {
  return new PuppeteerScraper(config);
}

/**
 * Scrape a URL using Puppeteer
 */
export async function scrapePuppeteer(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createPuppeteerScraper(config);

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
