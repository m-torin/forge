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

import { PlaywrightProvider } from './server/providers/playwright-provider';
import { PuppeteerProvider } from './server/providers/puppeteer-provider';
import { HeroProvider } from './server/providers/hero-provider';
import { CheerioProvider } from './server/providers/cheerio-provider';
import { NodeFetchProvider } from './server/providers/node-fetch-provider';
import { ConsoleProvider } from './shared/providers/console-provider';
import { createScrapingManager } from './shared/utils/scraping-manager';
import type {
  ProviderRegistry,
  ScrapingConfig,
  ScrapingManager,
} from './shared/types/scraping-types';

// Server-specific provider registry
const SERVER_PROVIDERS: ProviderRegistry = {
  playwright: (config) => new PlaywrightProvider(),
  puppeteer: (config) => new PuppeteerProvider(),
  hero: (config) => new HeroProvider(),
  cheerio: (config) => new CheerioProvider(),
  'node-fetch': (config) => new NodeFetchProvider(),
  console: (config) => new ConsoleProvider(),
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
  // Core scraping patterns
  quickScrape,
  scrapeMultiple,
  scrapeWithPagination,

  // Enhanced browser patterns
  // enhancedScrape,
  browserScrape,
  sessionScrape,

  // Extraction patterns
  // extractFromHtml,
  // extractFromUrl,
  extractWithAI,

  // Session patterns
  // createSession,
  // withSession,
  withBrowser,
} from './shared/patterns';

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Legacy compatibility functions (critical for migration)
export {
  // Legacy factory functions
  createScraper,
  createPuppeteerScraper,
  createPlaywrightScraper,
  createHeroScraper,

  // Legacy scraping functions
  scrapePuppeteer,
  scrapePlaywright,
  scrapeHero,

  // Legacy enhanced functions
  EnhancedPlaywrightScraper,
} from './shared/factories/legacy-factory';

export type {
  // Legacy types for backward compatibility
  BrowserManager,
  ScrapingEngine,
  ScrapingEngineConfig,
  ScrapingOptions as LegacyScrapingOptions,
  ScrapingResult,
  ScrapingSession,
} from './shared/types/legacy-types';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {
  // Provider processing utilities
  processScrapingRequest,
  createProviderProcessor,
  routeToProvider,
} from './shared/utils/provider-adapter';

// ============================================================================
// TYPES
// ============================================================================

// Core scraping types
export type {
  ScrapingConfig,
  ScrapeOptions as ScrapingOptions,
  ProviderConfig,
  ScrapingProvider,
  ScrapingContext,
  ScrapingManager,
} from './shared/types/scraping-types';

// Scraping operation types
export type {
  ScrapeOptions,
  ScrapeResult,
  ExtractedData,
  SelectorMap,
  SelectorConfig,
  ExtractionResult,
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
  QuickScrapeOptions,
  MultiScrapeOptions,
  PaginationOptions,
  SessionOptions,
  BrowserScrapeOptions,
  AIExtractionOptions,
} from './shared/patterns/types';

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export {
  getScrapingConfig,
  createConfigBuilder,
  validateConfig,
  PROVIDER_REQUIREMENTS,
} from './shared/utils/config';

export type { ConfigBuilder, ConfigRequirements } from './shared/utils/config';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  validateScrapingConfig,
  validateProvider,
  validateConfigOrThrow,
  debugConfig,
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
  launchBrowser,
  createBrowserPool,
  getBrowserCapabilities,
  optimizeBrowserPerformance,
} from './shared/utils/browser-utils';

export {
  // Performance optimization
  createPerformanceProfile,
  optimizeForSpeed,
  optimizeForMemory,
  createResourceManager,
} from './shared/utils/performance';

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Export error classes and utilities
export {
  ScrapingError,
  ScrapingErrorCode,
  getErrorMessage,
  isRetryableError,
  isScrapingError,
} from './shared/errors';

export type { ScrapingErrorType, ErrorContext } from './shared/errors';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

// Import scraping functions for convenience exports
import {
  quickScrape,
  scrapeMultiple,
  extractFromHtml,
  extractWithAI,
  createSession,
  withBrowser,
} from './shared/patterns';

import {
  createScraper,
  createPlaywrightScraper,
  createPuppeteerScraper,
  createHeroScraper,
} from './shared/factories/legacy-factory';

// Scraping helpers for server-side
export const scrape = {
  quick: quickScrape,
  multiple: scrapeMultiple,
  extract: extractFromHtml,
  ai: extractWithAI,
  session: createSession,
  browser: withBrowser,
};

// Legacy scraping helpers (backward compatibility)
export const legacy = {
  createScraper,
  playwright: createPlaywrightScraper,
  puppeteer: createPuppeteerScraper,
  hero: createHeroScraper,
};

// Server scraping default utilities
export const server = {
  manager: createScrapingManager,
  config: createConfigBuilder,
  scrape: quickScrape,
  extract: extractFromHtml,
  legacy: legacy,
};
