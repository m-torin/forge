/**
 * Provider adapter utilities
 * Helps adapt between different provider interfaces
 */

import { ProviderConfig, ScrapingProvider } from '../types/scraping-types';

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
      async initialize(_config: ProviderConfig) {
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
  for (const [name] of (adapterRegistry as any).adapters) {
    if (adapterRegistry.canAdapt(name, provider)) {
      return adapterRegistry.adapt(name, provider);
    }
  }
  return null;
}

// Register the legacy adapter by default
registerAdapter('legacy', new LegacyProviderAdapter());

// Additional exports for backward compatibility
export interface ProviderRoute {
  pattern: RegExp | string;
  provider: string;
  options?: any;
}

/**
 * Process a scraping request and route to appropriate provider
 */
export async function processScrapingNextNextRequest(
  url: string,
  routes: ProviderRoute[],
  providers: Record<string, ScrapingProvider>,
  defaultProvider: string,
): Promise<any> {
  // Find matching route
  const route = routes.find((r: any) => {
    if (typeof r.pattern === 'string') {
      return url.includes(r.pattern);
    }
    return r.pattern.test(url);
  });

  const providerName = route?.provider || defaultProvider;
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Provider not found: ${providerName}`);
  }

  return provider.scrape(url, route?.options || {});
}

/**
 * Create a provider processor function
 */
export function createProviderProcessor(
  routes: ProviderRoute[],
  providers: Record<string, ScrapingProvider>,
  defaultProvider: string,
) {
  return (url: string, _options?: any) => {
    return processScrapingNextNextRequest(url, routes, providers, defaultProvider);
  };
}

/**
 * Route to a specific provider based on URL patterns
 */
export function routeToProvider(
  url: string,
  routes: Record<string, RegExp | string>,
  defaultProvider: string,
): string {
  for (const [provider, pattern] of Object.entries(routes)) {
    if (typeof pattern === 'string') {
      if (url.includes(pattern)) return provider;
    } else {
      if (pattern.test(url)) return provider;
    }
  }
  return defaultProvider;
}

// Export alias for backward compatibility
export const processScrapingRequest = processScrapingNextNextRequest;
