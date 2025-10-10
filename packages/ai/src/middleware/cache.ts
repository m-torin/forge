/**
 * Caching middleware for AI requests
 *
 * Simple in-memory LRU cache implementation
 * For production, integrate with @upstash/redis or Redis client
 */

// Simple in-memory LRU cache
class LRUCache {
  private cache = new Map<string, { value: any; expiry: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.value;
  }

  getTtl(key: string): number {
    const item = this.cache.get(key);
    if (!item) return 0;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return 0;
    }

    return Math.max(0, item.expiry - Date.now());
  }

  set(key: string, value: any, ttlSeconds = 3600): void {
    // Remove oldest item if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (request: any) => string;
  shouldServeFromCache?: (request: any, cachedValue: any) => boolean;
  shouldCacheResult?: (request: any, response: any) => boolean;
  invalidateOnError?: boolean;
  maxSize?: number;
  provider?: 'redis' | 'upstash' | 'memory';
  cacheInstance?: LRUCache;
}

const globalCache = new LRUCache();

const cacheMiddleware = (config: CacheConfig = {}) => {
  const {
    ttl = 3600, // 1 hour default
    keyGenerator = (req: any) =>
      JSON.stringify({
        model: req?.model,
        messages: req?.messages,
        temperature: req?.temperature,
      }),
    shouldServeFromCache = (request: any, cachedValue: any) => !!cachedValue,
    shouldCacheResult = (request: any, response: any) => !!response && !response.error,
    invalidateOnError = true,
  } = config;

  // Use global cache by default, allow override
  const cache = config.cacheInstance || globalCache;

  return async (request: any, next: (req: any) => Promise<any>) => {
    const cacheKey = keyGenerator(request);

    // Check cache first - split read decision
    const cached = cache.get(cacheKey);
    if (cached && shouldServeFromCache(request, cached)) {
      return {
        ...cached,
        fromCache: true,
        cacheKey,
        cacheTtlRemaining: cache.getTtl(cacheKey),
      };
    }

    try {
      const response = await next(request);

      // Store in cache if should cache - split write decision
      if (shouldCacheResult(request, response)) {
        cache.set(cacheKey, response, ttl);
      }

      return response;
    } catch (error) {
      // Optionally invalidate cache on error
      if (invalidateOnError) {
        cache.delete(cacheKey);
      }
      throw error;
    }
  };
};

// Export alias for index.ts
export const cache = cacheMiddleware;
