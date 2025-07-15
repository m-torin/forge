/**
 * Provider registry for dynamic provider management
 * Handles provider registration, validation, and creation
 */

import { logWarn } from '@repo/observability';
import { ScrapingError, ScrapingErrorCode } from '../errors';
import { ProviderConfig, ProviderRegistry, ScrapingProvider } from '../types/scraping-types';

/**
 * Global provider registry
 */
class ScrapingProviderRegistry {
  private aliases = new Map<string, string>();
  private providers = new Map<string, (config: ProviderConfig) => ScrapingProvider>();

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear();
    this.aliases.clear();
  }

  /**
   * Create a provider instance
   */
  create(name: string, config: ProviderConfig = {}): ScrapingProvider {
    const actualName = this.aliases.get(name) ?? name;
    const factory = this.providers.get(actualName);

    if (!factory) {
      throw new ScrapingError(`Unknown provider: ${name}`, ScrapingErrorCode.PROVIDER_ERROR, {
        availableProviders: this.list(),
      });
    }

    return factory(config);
  }

  /**
   * Check if a provider is registered
   */
  has(name: string): boolean {
    const actualName = this.aliases.get(name) ?? name;
    return this.providers.has(actualName);
  }

  /**
   * Get provider info
   */
  info(name: string): {
    actualName: string;
    aliases: string[];
    available: boolean;
    name: string;
  } {
    const actualName = this.aliases.get(name) ?? name;
    const aliases = Array.from(this.aliases.entries())
      .filter(([_, target]: any) => target === actualName)
      .map(([alias]: any) => alias);

    return {
      actualName,
      aliases,
      available: this.providers.has(actualName),
      name,
    };
  }

  /**
   * List all registered providers
   */
  list(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * List all aliases
   */
  listAliases(): Record<string, string> {
    return Object.fromEntries(this.aliases);
  }

  /**
   * Register a new provider
   */
  register(
    name: string,
    factory: (config: ProviderConfig) => ScrapingProvider,
    aliases: string[] = [],
  ): void {
    this.providers.set(name, factory);

    // Register aliases
    for (const alias of aliases) {
      this.aliases.set(alias, name);
    }
  }
}

// Global registry instance
const globalRegistry = new ScrapingProviderRegistry();

/**
 * Create a provider from the global registry
 */
export function createProvider(name: string, config: ProviderConfig = {}): ScrapingProvider {
  return globalRegistry.create(name, config);
}

/**
 * Create provider registry from configuration
 */
export function createProviderRegistry(config: Record<string, any> = {}): ProviderRegistry {
  const registry: ProviderRegistry = {};

  // Add configured providers
  for (const [name, providerConfig] of Object.entries(config)) {
    if (hasProvider(name)) {
      registry[name] = (config: any) => createProvider(name, { ...providerConfig, ...config });
    }
  }

  return registry;
}

/**
 * Auto-detect best provider for current environment
 */
export function detectBestProvider(
  options: {
    ai?: boolean;
    environment?: 'client' | 'server';
    fast?: boolean;
    javascript?: boolean;
  } = {},
): string {
  const {
    ai = false,
    environment = typeof window !== 'undefined' ? 'client' : 'server',
    fast = false,
    javascript = false,
  } = options;

  if (environment === 'client') {
    return 'fetch'; // Only fetch available in client
  }

  // Server-side provider selection
  if (ai && hasProvider('hero')) {
    return 'hero'; // Hero has built-in AI
  }

  if (javascript) {
    if (hasProvider('playwright')) {
      return 'playwright'; // Playwright is generally more reliable
    }
    if (hasProvider('puppeteer')) {
      return 'puppeteer';
    }
    return 'hero'; // Fallback to Hero
  }

  if (fast) {
    if (hasProvider('cheerio')) {
      return 'cheerio'; // Fastest for HTML parsing
    }
    return 'node-fetch';
  }

  // Default fallback
  if (hasProvider('playwright')) {
    return 'playwright';
  }
  if (hasProvider('cheerio')) {
    return 'cheerio';
  }
  return 'console'; // Last resort
}

/**
 * Get provider information
 */
export function getProviderInfo(name: string) {
  return globalRegistry.info(name);
}

/**
 * Get the global provider registry
 */
export function getProviderRegistry(): ScrapingProviderRegistry {
  return globalRegistry;
}

/**
 * Check if provider is available
 */
export function hasProvider(name: string): boolean {
  return globalRegistry.has(name);
}

/**
 * List available providers
 */
export function listProviders(): string[] {
  return globalRegistry.list();
}

/**
 * Load default providers (called during initialization)
 */
export function loadDefaultProviders(): void {
  const environment = typeof window !== 'undefined' ? 'client' : 'server';

  try {
    if (environment === 'client') {
      // Register client providers
      registerProvider(
        'fetch',
        () => {
          // Dynamic import to avoid issues
          return {} as ScrapingProvider; // Placeholder
        },
        ['http', 'https'],
      );

      registerProvider(
        'console',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['debug', 'log'],
      );
    } else {
      // Register server providers
      registerProvider(
        'playwright',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['pw'],
      );

      registerProvider(
        'puppeteer',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['pptr'],
      );

      registerProvider(
        'hero',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['ai'],
      );

      registerProvider(
        'cheerio',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['html', 'parse'],
      );

      registerProvider(
        'node-fetch',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['fetch-server', 'node'],
      );

      registerProvider(
        'console',
        () => {
          return {} as ScrapingProvider; // Placeholder
        },
        ['debug', 'log'],
      );
    }
  } catch (error) {
    // Silently fail if providers can't be loaded

    logWarn('Failed to load default providers', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Register a provider globally
 */
export function registerProvider(
  name: string,
  factory: (config: ProviderConfig) => ScrapingProvider,
  aliases: string[] = [],
): void {
  globalRegistry.register(name, factory, aliases);
}

/**
 * Validate provider configuration
 */
export function validateProviderConfig(
  providers: string[],
  environment: 'client' | 'server' = typeof window !== 'undefined' ? 'client' : 'server',
): {
  invalid: string[];
  valid: string[];
  warnings: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  const clientProviders = ['fetch', 'console'];
  const serverProviders = ['playwright', 'puppeteer', 'hero', 'cheerio', 'node-fetch', 'console'];
  const allowedProviders = environment === 'client' ? clientProviders : serverProviders;

  for (const provider of providers) {
    if (!allowedProviders.includes(provider)) {
      invalid.push(provider);
      warnings.push(`Provider '${provider}' is not available in ${environment} environment`);
    } else if (!hasProvider(provider)) {
      invalid.push(provider);
      warnings.push(`Provider '${provider}' is not registered`);
    } else {
      valid.push(provider);
    }
  }

  return { invalid, valid, warnings };
}

// Auto-load default providers
loadDefaultProviders();
