/**
 * Bundle splitting and lazy loading utilities
 * React 19 and Next.js 15 optimized with concurrent features
 */

import { ObservabilityProvider, ProviderRegistry } from '../types/types';

import { Environment } from './environment';

/**
 * Cache configuration
 */
const CACHE_MAX_SIZE = 100; // Maximum number of cached providers
const CACHE_TTL_MS = 3600000; // 1 hour TTL for cached providers

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  promise: Promise<ObservabilityProvider>;
  timestamp: number;
  accessCount: number;
}

/**
 * React 19: Provider loading cache with TTL and size limits
 */
const providerCache = new Map<string, CacheEntry>();

/**
 * React 19: Bundle analyzer for development
 */
export function analyzeBundleSize(): void {
  if (Environment.isDevelopment()) {
    console.group('🔍 Observability Bundle Analysis');
    console.log('Provider cache size:', providerCache.size);
    console.log('Cached providers:', Array.from(providerCache.keys()));
    console.groupEnd();
  }
}

/**
 * Clear provider cache (useful for hot reloading)
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Clean expired entries from cache
 */
function cleanExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of Array.from(providerCache.entries())) {
    if (now - entry.timestamp > CACHE_TTL_MS) {
      expiredKeys.push(key);
    }
  }

  for (const key of expiredKeys) {
    providerCache.delete(key);
  }
}

/**
 * Enforce cache size limit using LRU eviction
 */
function enforceCacheSizeLimit(): void {
  if (providerCache.size <= CACHE_MAX_SIZE) return;

  // Sort entries by access count and timestamp (least recently used)
  const entries = Array.from(providerCache.entries()).sort(([, a], [, b]) => {
    // First sort by access count
    if (a.accessCount !== b.accessCount) {
      return a.accessCount - b.accessCount;
    }
    // Then by timestamp (older first)
    return a.timestamp - b.timestamp;
  });

  // Remove least recently used entries
  const entriesToRemove = entries.slice(0, providerCache.size - CACHE_MAX_SIZE);
  for (const [key] of entriesToRemove) {
    providerCache.delete(key);
  }
}

/**
 * React 19: Concurrent provider loader with optimized caching
 */
export function createLazyProviderLoader(providerRegistry: ProviderRegistry): ProviderRegistry {
  // Clean expired entries periodically
  cleanExpiredEntries();

  return Object.fromEntries(
    Object.entries(providerRegistry).map(([name, factory]: any) => [
      name,
      async (config: any) => {
        // Use stable cache key instead of JSON.stringify
        const cacheKey = createStableCacheKey(name, config);

        // Check if we have a valid cached entry
        const cachedEntry = providerCache.get(cacheKey);
        if (cachedEntry) {
          const now = Date.now();
          if (now - cachedEntry.timestamp <= CACHE_TTL_MS) {
            // Update access count and return cached promise
            cachedEntry.accessCount++;
            return cachedEntry.promise;
          } else {
            // Remove expired entry
            providerCache.delete(cacheKey);
          }
        }

        // Create promise for concurrent loading
        const providerPromise = Promise.resolve(factory(config));

        // Add to cache with metadata
        const cacheEntry: CacheEntry = {
          promise: providerPromise,
          timestamp: Date.now(),
          accessCount: 1,
        };
        providerCache.set(cacheKey, cacheEntry);

        // Enforce size limit after adding
        enforceCacheSizeLimit();

        try {
          const provider = await providerPromise;
          return provider;
        } catch (error: any) {
          // Remove failed provider from cache
          providerCache.delete(cacheKey);
          throw error;
        }
      },
    ]),
  );
}

/**
 * React 19: Concurrent provider initialization
 */
export async function initializeProvidersConcurrently(
  providerConfigs: Record<string, any>,
  providerRegistry: ProviderRegistry,
): Promise<Map<string, ObservabilityProvider>> {
  const providers = new Map<string, ObservabilityProvider>();

  // Create all provider promises concurrently
  const providerPromises = Object.entries(providerConfigs).map(async ([name, config]: any) => {
    if (config.enabled !== false && providerRegistry[name]) {
      try {
        const provider = await providerRegistry[name](config);
        await provider.initialize(config);
        return [name, provider] as const;
      } catch (error: any) {
        console.warn(`Failed to initialize provider "${name}":`, error);
        return null;
      }
    }
    return null;
  });

  // Wait for all providers to initialize
  const results = await Promise.allSettled(providerPromises);

  // Add successfully initialized providers
  results.forEach((result: any) => {
    if (result.status === 'fulfilled' && result.value) {
      const [name, provider] = result.value;
      providers.set(name, provider);
    }
  });

  return providers;
}

/**
 * React 19: Preload providers for improved performance
 */
export function preloadProviders(
  providerNames: string[],
  providerRegistry: ProviderRegistry,
): Promise<void> {
  return new Promise(resolve => {
    // Use requestIdleCallback for non-blocking preloading
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        const preloadPromises = providerNames.map(async (name: any) => {
          if (providerRegistry[name]) {
            try {
              // Preload provider by calling factory with minimal config
              await providerRegistry[name]({});
            } catch {
              // Ignore preload errors - providers may require valid config
            }
          }
        });

        Promise.allSettled(preloadPromises).then(() => resolve());
      });
    } else {
      // Fallback for environments without requestIdleCallback
      resolve();
    }
  });
}

/**
 * Create stable cache key from provider config
 */
function createStableCacheKey(name: string, config: any): string {
  // Create a stable key based on essential config properties only
  const essentials = {
    dsn: config?.dsn,
    enabled: config?.enabled,
    environment: config?.environment,
    level: config?.level,
  };

  // Sort keys for consistent serialization
  const sortedEntries = Object.entries(essentials)
    .filter(([_, value]: any) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  const configHash = sortedEntries
    .map(([key, value]: [string, any]) => `${key}:${value}`)
    .join('|');
  return `${name}#${configHash}`;
}

/**
 * Get provider module path for preloading (environment-agnostic)
 * Each environment should provide its own provider registry for preloading
 */
function _getProviderModulePath(providerName: string): string {
  // Only include shared providers that are available in all environments
  const sharedModuleMap: Record<string, string> = {
    console: '../providers/console-provider',
    // Environment-specific providers should be handled by environment-specific registries
  };

  return sharedModuleMap[providerName] || '';
}
