/**
 * Server-side scraping exports (non-Next.js)
 * Complete scraping solution for server/Node.js environments
 *
 * This file provides server-side scraping functionality for non-Next.js applications.
 * Use this in Node.js applications, API servers, and standalone server environments.
 *
 * For Next.js applications, use '@repo/scraping/server/next' instead.
 *
 * @example
 * ```typescript
 * import { createServerScraping, quickScrape, scrapeMultiple } from '@repo/scraping/server';
 *
 * const scraper = await createServerScraping({
 *   providers: {
 *     playwright: { headless: true },
 *     cheerio: { timeout: 5000 }
 *   }
 * };
 *
 * // Scrape a URL with browser automation
 * const result = await scraper.scrape('https://spa-app.com', {
 *   provider: 'playwright',
 *   waitForSelector: '.content',
 *   extract: {
 *     title: 'h1',
 *     data: { selector: '[data-product]', attribute: 'data-product', multiple: true }
 *   }
 * };
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
// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================
import { ProviderRegistry, ScrapingConfig, ScrapingManager } from './shared/types/scraping-types';
import { createScrapingManager } from './shared/utils/scraping-manager';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  cheerio: (_config: any) => new CheerioProvider(),
  console: (_config: any) => new ConsoleProvider(),
  hero: (_config: any) => new HeroProvider(),
  'node-fetch': (_config: any) => new NodeFetchProvider(),
  playwright: (_config: any) => new PlaywrightProvider(),
  puppeteer: (_config: any) => new PuppeteerProvider(),
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
// PROVIDERS - Direct access to provider classes
// ============================================================================

// Export error classes and utilities
export {
  getErrorMessage,
  isRetryableError,
  isScrapingError,
  ScrapingError,
  ScrapingErrorCode,
} from './shared/errors';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export type { ErrorContext, ScrapingErrorType } from './shared/errors';

// ============================================================================
// TYPES
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

// Pattern types
export type {
  AIExtractionOptions,
  BrowserScrapeOptions,
  MultiScrapeOptions,
  PaginationOptions,
  QuickScrapeOptions,
  SessionOptions,
} from './shared/patterns/types';

// Provider-specific types
export type { PlaywrightConfig, PlaywrightOptions } from './shared/types/browser-types';

export type { PuppeteerConfig, PuppeteerOptions } from './shared/types/browser-types';

export type { HeroConfig, HeroOptions } from './shared/types/browser-types';

export type { ConsoleConfig, ConsoleOptions } from './shared/types/console-types';

export type { CheerioConfig, CheerioOptions } from './shared/types/html-types';

export type { NodeFetchConfig, NodeFetchOptions } from './shared/types/html-types';

// Core scraping types
export type {
  ProviderConfig,
  ScrapingConfig,
  ScrapingContext,
  ScrapingManager,
  ScrapeOptions as ScrapingOptions,
  ScrapingProvider,
} from './shared/types/scraping-types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

// Scraping operation types
export type {
  ExtractedData,
  ExtractionResult,
  ScrapeOptions,
  ScrapeResult,
  SelectorConfig,
  SelectorMap,
} from './shared/types/scraping-types';

// Browser server utilities
export {
  createBrowserPool,
  getBrowserCapabilities,
  launchBrowser,
  optimizeBrowserPerformance,
} from './shared/utils/browser-utils';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  createConfigBuilder,
  getScrapingConfig,
  PROVIDER_REQUIREMENTS,
  validateConfig,
} from './shared/utils/config';

export type { ConfigBuilder, ConfigRequirements } from './shared/utils/config';

// ============================================================================
// ADVANCED UTILITIES
// ============================================================================

export {
  // Performance optimization
  createPerformanceProfile,
  createResourceManager,
  optimizeForMemory,
  optimizeForSpeed,
} from './shared/utils/performance';
export {
  createProviderProcessor,
  // Provider processing utilities
  processScrapingRequest,
  routeToProvider,
} from './shared/utils/provider-adapter';

// Manager utilities
export { createScrapingManager } from './shared/utils/scraping-manager';

export { ScrapingManager as ScrapingManagerClass } from './shared/utils/scraping-manager';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export {
  debugConfig,
  validateConfigOrThrow,
  validateProvider,
  validateScrapingConfig,
} from './shared/utils/validation';

export type { ValidationError, ValidationResult } from './shared/utils/validation';

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
    debug: false,
    providers: {},
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
