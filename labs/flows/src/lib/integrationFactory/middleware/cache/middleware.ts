// middleware/cache/middleware.ts
import { createMiddleware, type Middleware } from '../base';
import type {
  CacheOptions,
  CacheContext,
  CacheMetrics,
  MemoryCacheProvider,
} from './types';

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  enabled: true,
  order: -10, // Cache should run early
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  keyPrefix: '',
  keyGenerator: (context) => JSON.stringify(context.input),
};

export const createCacheMiddleware = (
  provider: MemoryCacheProvider,
  options: CacheOptions = {},
): Middleware => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    size: 0,
    maxSize: opts.maxSize,
  };

  const updateMetrics = () => {
    metrics.totalRequests = metrics.hits + metrics.misses;
    metrics.hitRate = metrics.totalRequests > 0 ? metrics.hits / metrics.totalRequests : 0;
    metrics.size = provider.size();
  };

  return createMiddleware(async (context, next) => {
    if (!opts.enabled) return next();

    const cacheKey = opts.keyPrefix + opts.keyGenerator(context);
    const startTime = Date.now();
    
    const cacheContext: CacheContext = {
      cacheKey,
      hit: false,
      startTime,
    };

    // Try to get from cache
    const cachedResult = provider.get(cacheKey);
    
    if (cachedResult !== undefined) {
      metrics.hits++;
      cacheContext.hit = true;
      updateMetrics();
      
      return {
        data: cachedResult,
        metadata: {
          cache: {
            hit: true,
            key: cacheKey,
            metrics,
          },
        },
        duration: Date.now() - startTime,
      };
    }

    // Cache miss - execute and cache result
    metrics.misses++;
    updateMetrics();
    
    try {
      const result = await next();
      
      // Cache the result
      provider.set(cacheKey, result.data, opts.ttl);
      
      return {
        ...result,
        metadata: {
          ...result.metadata,
          cache: {
            hit: false,
            key: cacheKey,
            metrics,
          },
        },
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }, options);
};