/**
 * Modern scraper factory functions
 * Creates scraping instances with the new provider-based architecture
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import type { ScrapingProvider, ScrapingConfig, ProviderConfig } from '../types/scraping-types';

/**
 * Create a scraper with automatic provider selection
 */
export function createScraper(
  url?: string,
  options: {
    provider?: string;
    config?: Partial<ProviderConfig>;
    environment?: 'client' | 'server';
  } = {},
): ScrapingProvider {
  const {
    provider = 'auto',
    config = {},
    environment = typeof window !== 'undefined' ? 'client' : 'server',
  } = options;

  if (environment === 'client') {
    return createClientScraper(provider, config);
  } else {
    return createServerScraper(provider, config);
  }
}

/**
 * Create a client-side scraper
 */
export function createClientScraper(
  provider: string = 'fetch',
  config: Partial<ProviderConfig> = {},
): ScrapingProvider {
  if (typeof window === 'undefined') {
    throw new ScrapingError(
      'Client scrapers can only be used in browser environments',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (provider) {
    case 'fetch':
    case 'auto':
      return createFetchProvider(config);
    case 'console':
      return createConsoleProvider(config);
    default:
      throw new ScrapingError(
        `Unknown client provider: ${provider}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }
}

/**
 * Create a server-side scraper
 */
export function createServerScraper(
  provider: string = 'playwright',
  config: Partial<ProviderConfig> = {},
): ScrapingProvider {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Server scrapers cannot be used in browser environments',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (provider) {
    case 'playwright':
    case 'auto':
      return createPlaywrightProvider(config);
    case 'puppeteer':
      return createPuppeteerProvider(config);
    case 'hero':
      return createHeroProvider(config);
    case 'cheerio':
      return createCheerioProvider(config);
    case 'node-fetch':
      return createNodeFetchProvider(config);
    case 'console':
      return createConsoleProvider(config);
    default:
      throw new ScrapingError(
        `Unknown server provider: ${provider}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }
}

/**
 * Create a browser automation scraper
 */
export function createBrowserScraper(
  engine: 'playwright' | 'puppeteer' | 'hero' = 'playwright',
  config: Partial<ProviderConfig> = {},
): ScrapingProvider {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Browser scrapers require server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (engine) {
    case 'playwright':
      return createPlaywrightProvider(config);
    case 'puppeteer':
      return createPuppeteerProvider(config);
    case 'hero':
      return createHeroProvider(config);
    default:
      throw new ScrapingError(
        `Unknown browser engine: ${engine}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }
}

/**
 * Create an HTML parsing scraper (no browser)
 */
export function createHtmlScraper(
  engine: 'cheerio' | 'node-fetch' = 'cheerio',
  config: Partial<ProviderConfig> = {},
): ScrapingProvider {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'HTML scrapers require server-side execution',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (engine) {
    case 'cheerio':
      return createCheerioProvider(config);
    case 'node-fetch':
      return createNodeFetchProvider(config);
    default:
      throw new ScrapingError(`Unknown HTML engine: ${engine}`, ScrapingErrorCode.PROVIDER_ERROR);
  }
}

/**
 * Create AI-enhanced scraper
 */
export function createAIScraper(
  baseProvider: string = 'hero',
  aiOptions: {
    model?: string;
    apiKey?: string;
  } = {},
): ScrapingProvider {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'AI scrapers require server-side execution',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  // Hero has built-in AI capabilities
  if (baseProvider === 'hero') {
    return createHeroProvider({
      options: {
        aiEnabled: true,
        ...aiOptions,
      },
    });
  }

  // For other providers, we'd wrap them with AI enhancement
  const baseScrapingProvider = createServerScraper(baseProvider);

  // TODO: Implement AI enhancement wrapper
  return baseScrapingProvider;
}

// Provider factory functions (these would import from actual provider files)
function createPlaywrightProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createPuppeteerProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createHeroProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createCheerioProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createNodeFetchProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createFetchProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}

function createConsoleProvider(config: Partial<ProviderConfig> = {}): ScrapingProvider {
  // Dynamic import to avoid circular dependencies
  return {} as ScrapingProvider; // Placeholder - would import actual provider
}
