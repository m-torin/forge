/**
 * Server-side scraping providers
 * Exports all available providers for server environments
 */

// Core provider implementations
// Factory functions for provider creation
import { ProviderRegistry } from '../../shared/types/scraping-types';

import { CheerioProvider } from './cheerio-provider';
import { HeroProvider } from './hero-provider';
import { NodeFetchProvider } from './node-fetch-provider';
import { PlaywrightProvider } from './playwright-provider';
import { PuppeteerProvider } from './puppeteer-provider';

export { ConsoleProvider } from '../../shared/providers/console-provider';
export { CheerioProvider } from './cheerio-provider';
export { HeroProvider } from './hero-provider';
export { NodeFetchProvider } from './node-fetch-provider';
export { PlaywrightProvider } from './playwright-provider';
export { PuppeteerProvider } from './puppeteer-provider';

// Provider types and interfaces;

/**
 * Default server provider registry
 * Maps provider names to factory functions
 */
const defaultServerProviders: ProviderRegistry = {
  // Browser automation providers
  puppeteer: (_config: any) => new PuppeteerProvider(),
  playwright: (_config: any) => new PlaywrightProvider(),
  hero: (_config: any) => new HeroProvider(),

  // HTML parsing providers
  cheerio: (_config: any) => new CheerioProvider(),
  'node-fetch': (_config: any) => new NodeFetchProvider(),

  // Aliases for convenience
  browser: (_config: any) => new PlaywrightProvider(), // Default browser provider
  html: (_config: any) => new CheerioProvider(), // Default HTML provider
  fetch: (_config: any) => new NodeFetchProvider(), // Default fetch provider
};

/**
 * Get a provider by name with dynamic loading
 */
async function _getProvider(name: string, config?: any) {
  const factory = defaultServerProviders[name];
  if (!factory) {
    throw new Error(`Provider "${name}" not found`);
  }

  const provider = factory(config);
  if (config) {
    await provider.initialize(config);
  }

  return provider;
}

/**
 * Get all available provider names
 */
function _getAvailableProviders(): string[] {
  return Object.keys(defaultServerProviders);
}

/**
 * Check if a provider is available
 */
function _hasProvider(name: string): boolean {
  return name in defaultServerProviders;
}

/**
 * Register a custom provider
 */
function _registerProvider(
  name: string,
  factory: (config?: any) => any,
  aliases: string[] = [],
): void {
  // Add primary name
  defaultServerProviders[name] = factory;

  // Add aliases
  for (const alias of aliases) {
    defaultServerProviders[alias] = factory;
  }
}

/**
 * Legacy compatibility exports
 * Maintains backward compatibility with old package API
 */

// Legacy factory functions (maintain old API)
