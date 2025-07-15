/**
 * Browser utilities for server-side scraping
 */

import { ScrapingProvider } from '../types/scraping-types';

export interface BrowserPool {
  acquire(): Promise<ScrapingProvider>;
  release(provider: ScrapingProvider): Promise<void>;
  drain(): Promise<void>;
  size(): number;
}

/**
 * Launch a browser instance
 */
export async function launchBrowser(
  provider: string,
  options: any = {},
): Promise<ScrapingProvider> {
  const { createBrowserScraper } = await import('../factories/scraper-factory');
  return createBrowserScraper(provider as any, options);
}

/**
 * Create a browser pool for efficient resource usage
 */
export function createBrowserPool(
  providerName: string,
  options: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
    acquireTimeoutMillis?: number;
  } = {},
): BrowserPool {
  const { max = 5 } = options;

  if (max <= 0) {
    throw new Error('Max pool size must be greater than 0');
  }

  const pool: ScrapingProvider[] = [];
  const available: ScrapingProvider[] = [];
  const pending: Array<(provider: ScrapingProvider) => void> = [];

  return {
    async acquire() {
      if (available.length > 0) {
        const provider = available.pop();
        if (!provider) throw new Error('No provider available in pool');
        return provider;
      }

      if (pool.length < max) {
        const provider = await launchBrowser(providerName, options);
        pool.push(provider);
        return provider;
      }

      // Wait for a provider to become available
      return new Promise((resolve: any) => {
        pending.push(resolve);
      });
    },

    async release(provider: ScrapingProvider) {
      const waiter = pending.shift();
      if (waiter) {
        waiter(provider);
      } else {
        available.push(provider);
      }
    },

    async drain() {
      // Close all browsers
      await Promise.all(pool.map((p: any) => p.dispose?.()));
      pool.length = 0;
      available.length = 0;
      pending.length = 0;
    },

    size() {
      return pool.length;
    },
  };
}

/**
 * Get browser capabilities for a provider
 */
export function getBrowserCapabilities(provider: string): Record<string, boolean> {
  const capabilities: Record<string, Record<string, boolean>> = {
    playwright: {
      screenshots: true,
      pdf: true,
      video: true,
      trace: true,
      multiPage: true,
      networkInterception: true,
      mobileEmulation: true,
      geolocation: true,
      permissions: true,
      offline: true,
      webSecurity: true,
    },
    puppeteer: {
      screenshots: true,
      pdf: true,
      video: false,
      trace: true,
      multiPage: true,
      networkInterception: true,
      mobileEmulation: true,
      geolocation: true,
      permissions: true,
      offline: false,
      webSecurity: true,
    },
    hero: {
      screenshots: true,
      pdf: false,
      video: false,
      trace: false,
      multiPage: true,
      networkInterception: true,
      mobileEmulation: true,
      geolocation: false,
      permissions: false,
      offline: false,
      webSecurity: true,
      ai: true,
    },
  };

  return capabilities[provider] || {};
}

/**
 * Optimize browser performance based on use case
 */
export function optimizeBrowserPerformance(
  options: any,
  useCase: 'speed' | 'memory' | 'quality' = 'speed',
): any {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be a valid object');
  }

  const optimized = { ...options };

  switch (useCase) {
    case 'speed':
      return {
        ...optimized,
        args: [
          ...(optimized.args || []),
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-images',
          '--disable-javascript', // Only if JS not needed
        ],
        viewport: { width: 1280, height: 720 },
      };

    case 'memory':
      return {
        ...optimized,
        args: [
          ...(optimized.args || []),
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--max_old_space_size=512',
          '--js-flags=--max-old-space-size=512',
        ],
        viewport: { width: 800, height: 600 },
      };

    case 'quality':
      return {
        ...optimized,
        args: [...(optimized.args || []), '--no-sandbox', '--disable-setuid-sandbox'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
      };

    default:
      return optimized;
  }
}
