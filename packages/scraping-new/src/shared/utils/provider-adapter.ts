/**
 * Provider adapter utilities
 * Helps adapt between different provider interfaces
 */

import type { ScrapingProvider, ProviderConfig } from '../types/scraping-types';

/**
 * Provider adapter interface
 */
export interface ProviderAdapter {
  adapt(provider: any): ScrapingProvider;
  canAdapt(provider: any): boolean;
}

/**
 * Registry of provider adapters
 */
class ProviderAdapterRegistry {
  private adapters: Map<string, ProviderAdapter> = new Map();

  register(name: string, adapter: ProviderAdapter): void {
    this.adapters.set(name, adapter);
  }

  adapt(providerName: string, provider: any): ScrapingProvider {
    const adapter = this.adapters.get(providerName);
    if (!adapter) {
      throw new Error(`No adapter found for provider: ${providerName}`);
    }
    return adapter.adapt(provider);
  }

  canAdapt(providerName: string, provider: any): boolean {
    const adapter = this.adapters.get(providerName);
    return adapter ? adapter.canAdapt(provider) : false;
  }
}

const adapterRegistry = new ProviderAdapterRegistry();

/**
 * Legacy provider adapter for old scraping interfaces
 */
export class LegacyProviderAdapter implements ProviderAdapter {
  canAdapt(provider: any): boolean {
    return (
      provider && typeof provider.scrape === 'function' && typeof provider.launch === 'function'
    );
  }

  adapt(provider: any): ScrapingProvider {
    return {
      name: provider.name || 'legacy',
      type: 'custom',
      async initialize(config: ProviderConfig) {
        if (provider.launch) {
          await provider.launch();
        }
      },
      async scrape(url: string, options: any = {}) {
        return provider.scrape({ url, ...options });
      },
      async extract(html: string, selectors: any) {
        if (provider.extract) {
          return provider.extract(html, selectors);
        }
        return {};
      },
      async dispose() {
        if (provider.close) {
          await provider.close();
        }
      },
      async healthCheck() {
        if (provider.isHealthy) {
          return provider.isHealthy();
        }
        return true;
      },
    };
  }
}

/**
 * Register a provider adapter
 */
export function registerAdapter(name: string, adapter: ProviderAdapter): void {
  adapterRegistry.register(name, adapter);
}

/**
 * Adapt a provider using registered adapters
 */
export function adaptProvider(providerName: string, provider: any): ScrapingProvider {
  return adapterRegistry.adapt(providerName, provider);
}

/**
 * Check if a provider can be adapted
 */
export function canAdaptProvider(providerName: string, provider: any): boolean {
  return adapterRegistry.canAdapt(providerName, provider);
}

/**
 * Auto-adapt a provider by trying all registered adapters
 */
export function autoAdaptProvider(provider: any): ScrapingProvider | null {
  for (const [name] of adapterRegistry.adapters) {
    if (adapterRegistry.canAdapt(name, provider)) {
      return adapterRegistry.adapt(name, provider);
    }
  }
  return null;
}

// Register the legacy adapter by default
registerAdapter('legacy', new LegacyProviderAdapter());
