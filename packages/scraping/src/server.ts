/**
 * Server-side scraping exports
 * Complete scraping solution for server/Node.js environments
 *
 * @example
 * ```typescript
 * import { createServerScraping, quickScrape, scrapeMultiple } from '@repo/scraping-new/server';
 *
 * const scraper = await createServerScraping({
 *   providers: {
 *     playwright: { headless: true },
 *     cheerio: { timeout: 5000 }
 *   }
 * });
 *
 * // Scrape a URL with browser automation
 * const result = await scraper.scrape('https://spa-app.com', {
 *   provider: 'playwright',
 *   waitForSelector: '.content',
 *   extract: {
 *     title: 'h1',
 *     data: { selector: '[data-product]', attribute: 'data-product', multiple: true }
 *   }
 * });
 * ```
 */

import { CheerioProvider } from './server/providers/cheerio-provider';
import { HeroProvider } from './server/providers/hero-provider';
import { NodeFetchProvider } from './server/providers/node-fetch-provider';
import { PlaywrightProvider } from './server/providers/playwright-provider';
import { PuppeteerProvider } from './server/providers/puppeteer-provider';
// Import scraping functions for convenience exports
import {
  createSession,
  extractFromHtml,
  extractWithAI,
  quickScrape,
  scrapeMultiple,
  withBrowser,
} from './shared/patterns';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createScrapingManager } from './shared/utils/scraping-manager';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================
import type {
  ProviderRegistry,
  ScrapingConfig,
  ScrapingManager,
} from './shared/types/scraping-types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  cheerio: (config) => new CheerioProvider(),
  console: (config) => new ConsoleProvider(),
  hero: (config) => new HeroProvider(),
  'node-fetch': (config) => new NodeFetchProvider(),
  playwright: (config) => new PlaywrightProvider(),
  puppeteer: (config) => new PuppeteerProvider(),
};

// ============================================================================
// CORE SCRAPING FUNCTIONS
// ============================================================================

/**
 * Create and initialize a server scraping instance
 * This is the primary way to create scraping for server-side applications
 */
export async function createServerScraping(config: ScrapingConfig): Promise<ScrapingManager> {
  const manager = createScrapingManager(config, SERVER_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a server scraping instance without initializing
 * Useful when you need to control initialization timing
 */
export function createServerScrapingUninitialized(config: ScrapingConfig): ScrapingManager {
  return createScrapingManager(config, SERVER_PROVIDERS);
}

// ============================================================================
// SCRAPING PATTERNS - PRIMARY INTERFACE
// ============================================================================

// Export all core patterns - these are the preferred way to scrape
export {
  // Enhanced browser patterns
  browserScrape,
  // Session patterns
  createSession,
  extractFromHtml,
  extractFromUrl,
  // Extraction patterns
  extractWithAI,

  // Core scraping patterns
  quickScrape,
  scrapeMultiple,
  scrapeWithPagination,
  sessionScrape,
  withBrowser,
  withSession,
} from './shared/patterns';

// ============================================================================
// PROVIDERS - Direct access to provider classes
// ============================================================================

export {
  // HTML parsing providers
  CheerioProvider,
  // Utility provider
  ConsoleProvider,
  HeroProvider,
  NodeFetchProvider,
  PlaywrightProvider,

  // Browser automation providers
  PuppeteerProvider,
} from './server/providers';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {
  createProviderProcessor,
  // Provider processing utilities
  processScrapingRequest,
  routeToProvider,
} from './shared/utils/provider-adapter';

// ============================================================================
// TYPES
// ============================================================================

// Core scraping types
export type {
  ProviderConfig,
  ScrapingConfig,
  ScrapingContext,
  ScrapingManager,
  ScrapeOptions as ScrapingOptions,
  ScrapingProvider,
} from './shared/types/scraping-types';

// Scraping operation types
export type {
  ExtractedData,
  ExtractionResult,
  ScrapeOptions,
  ScrapeResult,
  SelectorConfig,
  SelectorMap,
} from './shared/types/scraping-types';

// Provider-specific types
export type { PlaywrightConfig, PlaywrightOptions } from './shared/types/browser-types';

export type { PuppeteerConfig, PuppeteerOptions } from './shared/types/browser-types';

export type { HeroConfig, HeroOptions } from './shared/types/browser-types';

export type { CheerioConfig, CheerioOptions } from './shared/types/html-types';

export type { NodeFetchConfig, NodeFetchOptions } from './shared/types/html-types';

export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

// Pattern types
export type {
  AIExtractionOptions,
  BrowserScrapeOptions,
  MultiScrapeOptions,
  PaginationOptions,
  QuickScrapeOptions,
  SessionOptions,
} from './shared/patterns/types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export {
  createConfigBuilder,
  getScrapingConfig,
  PROVIDER_REQUIREMENTS,
  validateConfig,
} from './shared/utils/config';

export type { ConfigBuilder, ConfigRequirements } from './shared/utils/config';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  debugConfig,
  validateConfigOrThrow,
  validateProvider,
  validateScrapingConfig,
} from './shared/utils/validation';

export type { ValidationError, ValidationResult } from './shared/utils/validation';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

// Manager utilities
export { createScrapingManager } from './shared/utils/scraping-manager';
export { ScrapingManager as ScrapingManagerClass } from './shared/utils/scraping-manager';

// Browser server utilities
export {
  createBrowserPool,
  getBrowserCapabilities,
  launchBrowser,
  optimizeBrowserPerformance,
} from './shared/utils/browser-utils';

export {
  // Performance optimization
  createPerformanceProfile,
  createResourceManager,
  optimizeForMemory,
  optimizeForSpeed,
} from './shared/utils/performance';

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Export error classes and utilities
export {
  getErrorMessage,
  isRetryableError,
  isScrapingError,
  ScrapingError,
  ScrapingErrorCode,
} from './shared/errors';

export type { ErrorContext, ScrapingErrorType } from './shared/errors';

// Scraping helpers for server-side
export const scrape = {
  ai: extractWithAI,
  browser: withBrowser,
  extract: extractFromHtml,
  multiple: scrapeMultiple,
  quick: quickScrape,
  session: createSession,
};

// Create config builder function
function createConfigBuilder(initialConfig: Partial<ScrapingConfig> = {}): ScrapingConfig {
  return {
    providers: {},
    debug: false,
    ...initialConfig,
  };
}

// Server scraping default utilities
export const server = {
  config: createConfigBuilder,
  extract: extractFromHtml,
  manager: createScrapingManager,
  patterns: scrape,
  scrape: quickScrape,
};
