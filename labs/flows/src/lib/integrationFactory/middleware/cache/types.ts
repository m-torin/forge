// middleware/cache/types.ts
import { MiddlewareOptions } from '../base';

export interface CacheOptions extends MiddlewareOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  keyPrefix?: string; // Cache key prefix
  keyGenerator?: (context: any) => string;
}

export interface CacheContext {
  cacheKey: string;
  hit: boolean;
  startTime: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

export class MemoryCacheProvider {
  private cache = new Map<string, { value: any; expiry: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  set(key: string, value: any, ttl = 300000): void {
    // Clean up expired items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}