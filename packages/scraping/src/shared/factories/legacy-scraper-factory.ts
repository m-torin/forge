/**
 * Legacy ScraperFactory class for backward compatibility
 */

import { ScrapingConfig, ScrapingProvider } from '../types/scraping-types';

interface ScraperInstance {
  dispose(): Promise<void>;
  scrape(url: string, options?: any): Promise<any>;
  scrapeMultiple?(urls: string[], options?: any): Promise<any[]>;
}

/**
 * Legacy factory class for creating scrapers
 * @deprecated Use createScraper() function instead
 */
export class ScraperFactory {
  private defaultProvider?: string;
  private providers = new Map<string, ScrapingProvider>();

  createScraper(config?: Partial<ScrapingConfig>): ScraperInstance {
    const providerName =
      (config?.providers && Object.keys(config.providers)[0]) ?? this.defaultProvider;

    if (!providerName) {
      throw new Error('No provider specified and no default provider set');
    }

    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // Create a wrapper that implements the legacy interface
    const scraperInstance: ScraperInstance = {
      async dispose() {
        if (provider.dispose) {
          await provider.dispose();
        }
      },

      async scrape(url: string, options?: any) {
        // Middleware support removed - not in ScrapingConfig

        // Retry support removed - not in ScrapingConfig

        return provider.scrape(url, options);
      },

      async scrapeMultiple(urls: string[], options?: any) {
        // Simple implementation - just map over URLs
        return Promise.all(urls.map((url: any) => this.scrape(url, options)));
      },
    };

    // Cache support removed - not in ScrapingConfig

    return scraperInstance;
  }

  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  registerProvider(name: string, provider: ScrapingProvider): void {
    if (this.providers.has(name)) {
      throw new Error(`Provider ${name} is already registered`);
    }
    this.providers.set(name, provider);

    // Set as default if it's the first provider
    this.defaultProvider ??= name;
  }

  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not found`);
    }
    this.defaultProvider = name;
  }
}
