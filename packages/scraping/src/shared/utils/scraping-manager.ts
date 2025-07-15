/**
 * Scraping Manager - Core orchestration for multi-provider scraping
 */

import {
  ExtractedData,
  MultiScrapeOptions,
  ProviderRegistry,
  ScrapeOptions,
  ScrapeResult,
  ScrapingConfig,
  ScrapingProvider,
  SelectorMap,
} from '../types/scraping-types';

export class ScrapingManager {
  private providers = new Map<string, ScrapingProvider>();
  private isInitialized = false;

  constructor(
    private config: ScrapingConfig,
    private availableProviders: ProviderRegistry,
  ) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const initPromises: Promise<void>[] = [];

    for (const [providerName, providerConfig] of Object.entries(this.config.providers)) {
      const providerFactory = this.availableProviders[providerName];

      if (providerFactory) {
        try {
          const provider = providerFactory(providerConfig);
          this.providers.set(providerName, provider);

          // Initialize provider with error boundary using async/await
          initPromises.push(
            (async () => {
              try {
                await provider.initialize(providerConfig);
              } catch (error) {
                if (this.config.onError) {
                  this.config.onError(error, { provider: providerName, method: 'initialize' });
                }
                // Remove failed provider to ensure it doesn't affect others
                this.providers.delete(providerName);
              }
            })(),
          );
        } catch (error) {
          if (this.config.onError) {
            this.config.onError(error, { provider: providerName, method: 'create' });
          }
        }
      } else {
        const error = new Error(`Provider "${providerName}" not found in registry`);
        if (this.config.onError) {
          this.config.onError(error, { provider: providerName, method: 'lookup' });
        }
      }
    }

    await Promise.all(initPromises);
    this.isInitialized = true;

    if (this.config.debug) {
      this.config.onInfo?.(`Initialized ${this.providers.size} scraping providers`);
    }
  }

  async scrape(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult> {
    if (!this.isInitialized) {
      throw new Error('ScrapingManager not initialized. Call initialize() first.');
    }

    const mergedOptions = {
      ...this.config.defaults,
      ...options,
    };

    // Select provider based on options or use first available
    const providerName = this.selectProvider(url, mergedOptions);
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`No provider available for scraping: ${providerName}`);
    }

    try {
      const result = await provider.scrape(url, mergedOptions);

      if (this.config.debug) {
        this.config.onInfo?.(`Scraped ${url} using ${providerName}`);
      }

      return result;
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error, { provider: providerName, method: 'scrape', url });
      }
      throw error;
    }
  }

  async extract(html: string, selectors: SelectorMap, provider?: string): Promise<ExtractedData> {
    if (!this.isInitialized) {
      throw new Error('ScrapingManager not initialized. Call initialize() first.');
    }

    // Use specified provider or first available
    const providerName = provider || this.providers.keys().next().value;
    if (!providerName) {
      throw new Error('No providers available for extraction');
    }
    const selectedProvider = this.providers.get(providerName);

    if (!selectedProvider) {
      throw new Error(`Provider not available: ${providerName}`);
    }

    try {
      return await selectedProvider.extract(html, selectors);
    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error, { provider: providerName, method: 'extract' });
      }
      throw error;
    }
  }

  async scrapeMultiple(urls: string[], options: MultiScrapeOptions = {}): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    const { concurrent = 5 } = options;

    // Process in batches
    for (let i = 0; i < urls.length; i += concurrent) {
      const batch = urls.slice(i, i + concurrent);
      const batchPromises = batch.map(async (url, index: any) => {
        try {
          const result = await this.scrape(url, options);

          if (options.onProgress) {
            options.onProgress(url, i + index, urls.length, result);
          }

          return result;
        } catch (error) {
          if (options.continueOnError !== false) {
            const errorResult: ScrapeResult = {
              url,
              html: '',
              metadata: {
                statusCode: 0,
                timing: { start: Date.now(), end: Date.now(), duration: 0 },
              },
              provider: 'error',
              error: error as Error,
            };

            if (options.onProgress) {
              options.onProgress(url, i + index, urls.length);
            }

            return errorResult;
          }
          throw error;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  async *scrapeStream(
    urls: string[],
    options: MultiScrapeOptions = {},
  ): AsyncIterableIterator<ScrapeResult> {
    const { concurrent = 5 } = options;

    for (let i = 0; i < urls.length; i += concurrent) {
      const batch = urls.slice(i, i + concurrent);
      const batchPromises = batch.map(async (url, index: any) => {
        try {
          const result = await this.scrape(url, options);

          if (options.onProgress) {
            options.onProgress(url, i + index, urls.length, result);
          }

          return result;
        } catch (error) {
          if (options.continueOnError !== false) {
            const errorResult: ScrapeResult = {
              url,
              html: '',
              metadata: {
                statusCode: 0,
                timing: { start: Date.now(), end: Date.now(), duration: 0 },
              },
              provider: 'error',
              error: error as Error,
            };

            if (options.onProgress) {
              options.onProgress(url, i + index, urls.length);
            }

            return errorResult;
          }
          throw error;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        yield result;
      }
    }
  }

  async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      if (provider.healthCheck) {
        try {
          health[name] = await provider.healthCheck();
        } catch {
          health[name] = false;
        }
      } else {
        health[name] = true; // Assume healthy if no health check
      }
    }

    return health;
  }

  async getMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    for (const [name, provider] of this.providers) {
      try {
        // Basic metrics - providers can extend this
        metrics[name] = {
          type: provider.type,
          available: true,
        };
      } catch (error) {
        metrics[name] = { error: (error as Error)?.message || 'Unknown error' };
      }
    }

    return metrics;
  }

  async dispose(): Promise<void> {
    const disposePromises = Array.from(this.providers.values())
      .filter((provider: any) => provider.dispose)
      .map(async (provider: any) => {
        try {
          if (provider.dispose) {
            await provider.dispose();
          }
        } catch (error) {
          if (this.config.onError) {
            this.config.onError(error, { provider: provider.name, method: 'dispose' });
          }
        }
      });

    await Promise.all(disposePromises);
    this.providers.clear();
    this.isInitialized = false;
  }

  private selectProvider(url: string, options: ScrapeOptions): string {
    // 1. Explicit provider in options
    if (options.provider && this.providers.has(options.provider)) {
      return options.provider;
    }

    // 2. Hint-based selection
    if (options.hint) {
      // Look for providers that support the hint
      for (const [name, provider] of this.providers) {
        if (provider.type === 'browser' && options.hint === 'dynamic') return name;
        if (provider.type === 'html' && options.hint === 'static') return name;
      }
    }

    // 3. Default to first available provider
    const firstProvider = this.providers.keys().next().value;
    if (firstProvider) {
      return firstProvider;
    }

    throw new Error('No providers available');
  }
}

/**
 * Create a scraping manager with the given config and provider registry
 */
export function createScrapingManager(
  config: ScrapingConfig,
  providerRegistry: ProviderRegistry,
): ScrapingManager {
  return new ScrapingManager(config, providerRegistry);
}
