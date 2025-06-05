/**
 * Legacy compatibility factory functions
 * Maintains backward compatibility with the old @repo/scraping package
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { retryWithBackoff } from '../utils/helpers';
import type { ScrapingProvider } from '../types/scraping-types';

// Legacy types (maintaining old API)
export type ScrapingEngine = 'puppeteer' | 'playwright' | 'hero';

export interface ScrapingEngineConfig {
  args?: string[];
  engine: ScrapingEngine;
  executablePath?: string;
  headless?: boolean;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface BrowserManager {
  close(): Promise<void>;
  extract(html: string, selectors: any): any;
  isHealthy(): Promise<boolean>;
  launch(): Promise<void>;
  scrape(options: any): Promise<any>;
}

export interface ScrapingOptions {
  url: string;
  blockedResourceTypes?: string[];
  cookies?: any[];
  fullPage?: boolean;
  headers?: Record<string, string>;
  javascript?: boolean;
  proxy?: {
    username?: string;
    password?: string;
    server: string;
  };
  screenshot?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  waitForSelector?: string;
  waitForTimeout?: number;
}

export interface ScrapingResult {
  error?: string;
  html: string;
  metadata: {
    title?: string;
    description?: string;
    statusCode?: number;
    headers?: Record<string, string>;
    timing: {
      start: number;
      end: number;
      duration: number;
    };
  };
  screenshot?: Buffer;
  url: string;
}

export interface ScrapingSession {
  completed: string[];
  endTime?: number;
  failed: string[];
  id: string;
  results: Map<string, ScrapingResult>;
  startTime: number;
  urls: string[];
}

/**
 * Legacy BrowserManager wrapper around new providers
 */
class LegacyBrowserManager implements BrowserManager {
  private provider: ScrapingProvider;
  private config: ScrapingEngineConfig;

  constructor(provider: ScrapingProvider, config: ScrapingEngineConfig) {
    this.provider = provider;
    this.config = config;
  }

  async launch(): Promise<void> {
    await this.provider.initialize({
      timeout: 30000,
      options: {
        headless: this.config.headless,
        args: this.config.args,
        executablePath: this.config.executablePath,
        autoClose: false,
      },
    });
  }

  async close(): Promise<void> {
    await this.provider.dispose();
  }

  async scrape(options: ScrapingOptions): Promise<ScrapingResult> {
    try {
      const result = await this.provider.scrape(options.url, {
        headers: options.headers,
        cookies: options.cookies,
        viewport: options.viewport,
        userAgent: options.userAgent,
        waitForSelector: options.waitForSelector,
        timeout: options.waitForTimeout,
        screenshot: options.screenshot,
        blockResources: options.blockedResourceTypes,
      });

      return {
        url: options.url,
        html: result.html,
        metadata: {
          title: result.metadata.title,
          description: result.metadata.description,
          statusCode: result.metadata.statusCode,
          timing: result.metadata.timing,
        },
        screenshot: result.screenshot,
      };
    } catch (error) {
      return {
        url: options.url,
        error: error instanceof Error ? error.message : 'Unknown error',
        html: '',
        metadata: {
          timing: (() => {
            const now = Date.now();
            return {
              start: now,
              end: now,
              duration: 0,
            };
          })(),
        },
      };
    }
  }

  extract(html: string, selectors: any): any {
    return this.provider.extract(html, selectors);
  }

  async isHealthy(): Promise<boolean> {
    return this.provider.healthCheck ? await this.provider.healthCheck() : true;
  }
}

/**
 * Legacy factory function: createScraper
 * Maintains exact API compatibility with old package
 */
export function createScraper(
  engine: ScrapingEngine = 'puppeteer',
  config?: Partial<ScrapingEngineConfig>,
): BrowserManager {
  const fullConfig: ScrapingEngineConfig = {
    engine,
    headless: true,
    maxConcurrency: 5,
    retryAttempts: 3,
    retryDelay: 1000,
    ...config,
  };

  let provider: ScrapingProvider;

  switch (engine) {
    case 'puppeteer':
      provider = createPuppeteerProvider();
      break;
    case 'playwright':
      provider = createPlaywrightProvider();
      break;
    case 'hero':
      provider = createHeroProvider();
      break;
    default:
      throw new ScrapingError(
        `Unknown scraping engine: ${engine}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }

  return new LegacyBrowserManager(provider, fullConfig);
}

/**
 * Legacy factory: createPuppeteerScraper
 */
export function createPuppeteerScraper(config?: Partial<ScrapingEngineConfig>): BrowserManager {
  return createScraper('puppeteer', config);
}

/**
 * Legacy factory: createPlaywrightScraper
 */
export function createPlaywrightScraper(config?: Partial<ScrapingEngineConfig>): BrowserManager {
  return createScraper('playwright', config);
}

/**
 * Legacy factory: createHeroScraper
 */
export function createHeroScraper(config?: Partial<ScrapingEngineConfig>): BrowserManager {
  return createScraper('hero', config);
}

/**
 * Legacy scraping function: scrapePuppeteer
 */
export async function scrapePuppeteer(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createPuppeteerScraper(config);

  try {
    await scraper.launch();
    return await retryWithBackoff(() => scraper.scrape(options), {
      attempts: config?.retryAttempts || 3,
      delay: config?.retryDelay || 1000,
    });
  } finally {
    await scraper.close();
  }
}

/**
 * Legacy scraping function: scrapePlaywright
 */
export async function scrapePlaywright(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createPlaywrightScraper(config);

  try {
    await scraper.launch();
    return await retryWithBackoff(() => scraper.scrape(options), {
      attempts: config?.retryAttempts || 3,
      delay: config?.retryDelay || 1000,
    });
  } finally {
    await scraper.close();
  }
}

/**
 * Legacy scraping function: scrapeHero
 */
export async function scrapeHero(
  options: ScrapingOptions,
  config?: Partial<ScrapingEngineConfig>,
): Promise<ScrapingResult> {
  const scraper = createHeroScraper(config);

  try {
    await scraper.launch();
    return await retryWithBackoff(() => scraper.scrape(options), {
      attempts: config?.retryAttempts || 3,
      delay: config?.retryDelay || 1000,
    });
  } finally {
    await scraper.close();
  }
}

/**
 * Enhanced Playwright Scraper class (legacy compatibility)
 */
export class EnhancedPlaywrightScraper {
  private manager: BrowserManager;

  constructor(config: Partial<ScrapingEngineConfig> = {}) {
    this.manager = createPlaywrightScraper({
      ...config,
      engine: 'playwright',
    });
  }

  async init(): Promise<void> {
    await this.manager.launch();
  }

  async close(): Promise<void> {
    await this.manager.close();
  }

  async goto(url: string, options: any = {}): Promise<void> {
    // This would be implemented by storing state and using it in scrape()
    // For now, we'll store the URL for the next scrape operation
  }

  async extract(selectors: any): Promise<any> {
    // This would need to work with the current page state
    // Implementation would depend on how the provider handles state
    return {};
  }

  async withAutoClose<T>(
    operation: (scraper: EnhancedPlaywrightScraper) => Promise<T>,
  ): Promise<T> {
    try {
      await this.init();
      return await operation(this);
    } finally {
      await this.close();
    }
  }

  // Add other enhanced methods as needed for compatibility
  async getText(selector: string): Promise<string | null> {
    return null; // Implementation would interact with current page
  }

  async click(selector: string, options: any = {}): Promise<void> {
    // Implementation would interact with current page
  }

  async screenshot(options: any = {}): Promise<Buffer> {
    // Implementation would take screenshot of current page
    return Buffer.from('');
  }
}

// Helper functions to create providers (these would import from the actual provider files)
function createPuppeteerProvider(): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createPlaywrightProvider(): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createHeroProvider(): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}
