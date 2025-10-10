/**
 * Bounded Cache implementation using lru-cache library
 * Maintains API compatibility while leveraging battle-tested LRU implementation
 * Server-only module - uses Node.js APIs for memory monitoring
 */

import { LRUCache } from 'lru-cache';

export interface BoundedCacheOptions {
  maxSize?: number;
  ttl?: number;
  enableAnalytics?: boolean;
}

export interface CacheAnalytics {
  hits: number;
  misses: number;
  evictions: number;
  sets: number;
  deletes: number;
  memoryPressureCleanups: number;
}

export interface CacheState {
  config: {
    maxSize: number;
    ttl: number;
    enableAnalytics: boolean;
  };
  state: {
    size: number;
    keys: string[];
    accessTimes: Record<string, number>;
  };
  analytics: CacheAnalytics & {
    hitRate: string;
    currentSize: number;
    maxSize: number;
    ttl: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

export interface CleanupResult {
  cleaned: boolean;
  sizeBefore?: number;
  sizeAfter?: number;
  memoryFreed?: number;
  reason?: string;
}

export class BoundedCache {
  private cache: LRUCache<string, any>;
  private enableAnalytics: boolean;
  private analytics: CacheAnalytics;
  private lastMemoryCheck: number;
  private memoryCheckInterval: number;

  constructor(options: BoundedCacheOptions = {}) {
    const maxSize = options.maxSize || 100;
    const ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
    this.enableAnalytics = options.enableAnalytics || false;

    // Create LRUCache with TTL support
    this.cache = new LRUCache<string, any>({
      max: maxSize,
      ttl: ttl,
      updateAgeOnGet: true,
      // Track disposal for eviction analytics
      dispose: (_value, _key, reason) => {
        if (reason === 'evict' && this.enableAnalytics) {
          this.analytics.evictions++;
        }
      },
    });

    // Analytics tracking
    this.analytics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
      deletes: 0,
      memoryPressureCleanups: 0,
    };

    // Memory pressure monitoring
    this.lastMemoryCheck = Date.now();
    this.memoryCheckInterval = 60000; // Check every minute
  }

  set(key: string, value: any): void {
    if (this.enableAnalytics) {
      this.analytics.sets++;
    }
    this.cache.set(key, value);
    this.checkMemoryPressure();
  }

  get(key: string): any {
    const value = this.cache.get(key);

    if (this.enableAnalytics) {
      if (value === undefined) {
        this.analytics.misses++;
      } else {
        this.analytics.hits++;
      }
    }

    return value;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    if (this.enableAnalytics) {
      this.analytics.deletes++;
    }
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  values(): any[] {
    return Array.from(this.cache.values());
  }

  entries(): [string, any][] {
    return Array.from(this.cache.entries());
  }

  // Enhanced cleanup with memory pressure awareness
  cleanup(force = false): CleanupResult {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

    if (force || heapUsedMB > 100) {
      const sizeBefore = this.cache.size;
      this.cache.clear();

      if (this.enableAnalytics) {
        this.analytics.memoryPressureCleanups++;
      }

      return {
        cleaned: true,
        sizeBefore,
        sizeAfter: this.cache.size,
        memoryFreed: heapUsedMB,
      };
    }

    return { cleaned: false, reason: 'No memory pressure detected' };
  }

  // Memory pressure monitoring
  private checkMemoryPressure(): void {
    const now = Date.now();
    if (now - this.lastMemoryCheck > this.memoryCheckInterval) {
      this.lastMemoryCheck = now;

      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      // Auto-cleanup if memory usage is high
      if (heapUsedMB > 150) {
        this.cleanup(true);
      }
    }
  }

  // Get cache analytics and performance metrics
  getAnalytics() {
    const hitRate =
      this.analytics.hits + this.analytics.misses > 0
        ? ((this.analytics.hits / (this.analytics.hits + this.analytics.misses)) * 100).toFixed(2)
        : '0';

    return {
      ...this.analytics,
      hitRate: `${hitRate}%`,
      currentSize: this.cache.size,
      maxSize: this.cache.max,
      ttl: this.cache.ttl,
      memoryUsage: process.memoryUsage(),
    };
  }

  // Export cache state for debugging/monitoring
  exportState(): CacheState {
    // Create access times map from cache dump
    const accessTimes: Record<string, number> = {};
    for (const [key] of this.cache.entries()) {
      const remaining = this.cache.getRemainingTTL(key);
      if (remaining > 0) {
        // Approximate access time based on remaining TTL
        accessTimes[key] = Date.now() - (this.cache.ttl - remaining);
      }
    }

    return {
      config: {
        maxSize: this.cache.max,
        ttl: this.cache.ttl,
        enableAnalytics: this.enableAnalytics,
      },
      state: {
        size: this.cache.size,
        keys: this.keys(),
        accessTimes,
      },
      analytics: this.getAnalytics(),
    };
  }
}

// Global cache registry for managing multiple named caches
export class CacheRegistry {
  private caches: Map<string, BoundedCache>;

  constructor() {
    this.caches = new Map();
  }

  create(name: string, options: BoundedCacheOptions = {}): BoundedCache {
    if (this.caches.has(name)) {
      return this.caches.get(name)!;
    }

    const cache = new BoundedCache(options);
    this.caches.set(name, cache);
    return cache;
  }

  get(name: string): BoundedCache | undefined {
    return this.caches.get(name);
  }

  delete(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      this.caches.delete(name);
      return true;
    }
    return false;
  }

  list(): string[] {
    return Array.from(this.caches.keys());
  }

  cleanupAll(): Record<string, CleanupResult> {
    const results: Record<string, CleanupResult> = {};
    for (const [name, cache] of this.caches) {
      results[name] = cache.cleanup(true);
    }
    return results;
  }

  getGlobalAnalytics(): Record<string, ReturnType<BoundedCache['getAnalytics']>> {
    const analytics: Record<string, ReturnType<BoundedCache['getAnalytics']>> = {};
    for (const [name, cache] of this.caches) {
      analytics[name] = cache.getAnalytics();
    }
    return analytics;
  }
}

// Default global registry instance
export const globalCacheRegistry = new CacheRegistry();
