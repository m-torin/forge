/**
 * Modern scraper factory functions
 * Creates scraping instances with the new provider-based architecture
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { ProviderConfig, ScrapingProvider } from '../types/scraping-types';

/**
 * Create AI-enhanced scraper
 */
export async function createAIScraper(
  baseProvider = 'hero',
  aiOptions: {
    apiKey?: string;
    model?: string;
  } = {},
): Promise<ScrapingProvider> {
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
  const baseScrapingProvider = await createServerScraper(baseProvider);

  // TODO: Implement AI enhancement wrapper
  return baseScrapingProvider;
}

/**
 * Create a browser automation scraper
 */
export async function createBrowserScraper(
  engine: 'hero' | 'playwright' | 'puppeteer' = 'playwright',
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Browser scrapers require server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (engine) {
    case 'hero':
      return createHeroProvider(config);
    case 'playwright':
      return createPlaywrightProvider(config);
    case 'puppeteer':
      return createPuppeteerProvider(config);
    default:
      throw new ScrapingError(
        `Unknown browser engine: ${engine}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }
}

/**
 * Create a client-side scraper
 */
export async function createClientScraper(
  provider = 'fetch',
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  if (typeof window === 'undefined') {
    throw new ScrapingError(
      'Client scrapers can only be used in browser environments',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (provider) {
    case 'auto':
    case 'fetch':
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
 * Create an HTML parsing scraper (no browser)
 */
export async function createHtmlScraper(
  engine: 'cheerio' | 'node-fetch' = 'cheerio',
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
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
 * Create a scraper with automatic provider selection
 */
export async function createScraper(
  url?: string,
  options: {
    config?: Partial<ProviderConfig>;
    environment?: 'client' | 'server';
    provider?: string;
  } = {},
): Promise<ScrapingProvider> {
  const {
    config = {},
    environment = typeof window !== 'undefined' ? 'client' : 'server',
    provider = 'auto',
  } = options;

  if (environment === 'client') {
    return createClientScraper(provider, config);
  } else {
    return createServerScraper(provider, config);
  }
}

/**
 * Create a server-side scraper
 */
export async function createServerScraper(
  provider = 'playwright',
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Server scrapers cannot be used in browser environments',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  switch (provider) {
    case 'auto':
    case 'playwright':
      return createPlaywrightProvider(config);
    case 'cheerio':
      return createCheerioProvider(config);
    case 'console':
      return createConsoleProvider(config);
    case 'hero':
      return createHeroProvider(config);
    case 'node-fetch':
      return createNodeFetchProvider(config);
    case 'puppeteer':
      return createPuppeteerProvider(config);
    default:
      throw new ScrapingError(
        `Unknown server provider: ${provider}`,
        ScrapingErrorCode.PROVIDER_ERROR,
      );
  }
}

async function createCheerioProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  const { CheerioProvider } = await import('../../server/providers/cheerio-provider');
  const provider = new CheerioProvider();
  await provider.initialize(config);
  return provider;
}

async function createConsoleProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  const { ConsoleProvider } = await import('../providers/console-provider');
  const provider = new ConsoleProvider();
  await provider.initialize(config);
  return provider;
}

async function createFetchProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  if (typeof window !== 'undefined') {
    const { FetchProvider } = await import('../../client/providers/fetch-provider');
    const provider = new FetchProvider();
    await provider.initialize(config);
    return provider;
  } else {
    return createNodeFetchProvider(config);
  }
}

async function createHeroProvider(config: Partial<ProviderConfig> = {}): Promise<ScrapingProvider> {
  const { HeroProvider } = await import('../../server/providers/hero-provider');
  const provider = new HeroProvider();
  await provider.initialize(config);
  return provider;
}

async function createNodeFetchProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  const { NodeFetchProvider } = await import('../../server/providers/node-fetch-provider');
  const provider = new NodeFetchProvider();
  await provider.initialize(config);
  return provider;
}

// Provider factory functions with async loading
async function createPlaywrightProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');
  const provider = new PlaywrightProvider();
  await provider.initialize(config);
  return provider;
}

async function createPuppeteerProvider(
  config: Partial<ProviderConfig> = {},
): Promise<ScrapingProvider> {
  const { PuppeteerProvider } = await import('../../server/providers/puppeteer-provider');
  const provider = new PuppeteerProvider();
  await provider.initialize(config);
  return provider;
}
