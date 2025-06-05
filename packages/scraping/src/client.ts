/**
 * Client-side scraping exports
 * Complete scraping solution for browser/client environments
 *
 * @example
 * ```typescript
 * import { createClientScraping, quickScrape, scrapeMultiple } from '@repo/scraping-new/client';
 *
 * const scraper = await createClientScraping({
 *   providers: {
 *     fetch: { timeout: 10000 },
 *     console: { debug: true }
 *   }
 * });
 *
 * // Scrape a URL
 * const result = await scraper.scrape('https://example.com', {
 *   extract: {
 *     title: 'h1',
 *     price: { selector: '.price', transform: (text) => parseFloat(text.replace('$', '')) }
 *   }
 * });
 * ```
 */

import { FetchProvider } from './client/providers/fetch-provider';
// Import scraping functions for convenience exports
import { createSession, extractFromHtml, quickScrape, scrapeMultiple } from './shared/patterns';
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

// Client-specific provider registry
const CLIENT_PROVIDERS: ProviderRegistry = {
  console: (config) => new ConsoleProvider(),
  fetch: (config) => new FetchProvider(),
};

// ============================================================================
// CORE SCRAPING FUNCTIONS
// ============================================================================

/**
 * Create and initialize a client scraping instance
 * This is the primary way to create scraping for client-side applications
 */
export async function createClientScraping(config: ScrapingConfig): Promise<ScrapingManager> {
  const manager = createScrapingManager(config, CLIENT_PROVIDERS);
  await manager.initialize();
  return manager;
}

/**
 * Create a client scraping instance without initializing
 * Useful when you need to control initialization timing
 */
export function createClientScrapingUninitialized(config: ScrapingConfig): ScrapingManager {
  return createScrapingManager(config, CLIENT_PROVIDERS);
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

  // Extraction patterns (basic ones only)
  // extractFromHtml,
  // extractFromUrl,

  // Session patterns (basic ones only)
  // createSession,
  // withSession
} from './shared/patterns';

// ============================================================================
// ADAPTER UTILITIES
// ============================================================================

export {} from // Provider processing utilities (removed - not implemented yet)
// processScrapingRequest,
// createProviderProcessor,
// routeToProvider
'./shared/utils/provider-adapter';

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
export type {
  ClientProviderConfig as FetchConfig,
  ClientScrapeOptions as FetchOptions,
} from './shared/types/client-types';

export type {
  ConsoleProviderConfig as ConsoleConfig,
  ConsoleScrapeOptions as ConsoleOptions,
} from './shared/types/console-types';

// Pattern types
export type {
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
  mergeScrapingConfig as getScrapingConfig,
  // validateConfig,
  // PROVIDER_REQUIREMENTS
} from './shared/utils/config';

export type {
  ConfigBuilder,
  // ConfigRequirements
} from './shared/utils/config';

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

// Client-specific utilities
export {
  // createFetchClient,
  // isCorsEnabled,
  getBrowserInfo as getBrowserCapabilities,
  // createClientSession
} from './shared/utils/client-utils';

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

// Scraping helpers for client-side
export const scrape = {
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

// Client scraping default utilities
export const client = {
  config: createConfigBuilder,
  manager: createScrapingManager,
  scrape: quickScrape,
  // extract: extractFromHtml
};
