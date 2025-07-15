/**
 * Advanced Bounded Cache with LRU eviction, TTL, analytics, and memory management.
 * Consolidates and enhances the BoundedCache implementation from agent files.
 */

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
  private maxSize: number;
  private ttl: number;
  private enableAnalytics: boolean;
  private cache: Map<string, any>;
  private timers: Map<string, NodeJS.Timeout>;
  private accessTimes: Map<string, number>;
  private analytics: CacheAnalytics;
  private lastMemoryCheck: number;
  private memoryCheckInterval: number;

  constructor(options: BoundedCacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
    this.enableAnalytics = options.enableAnalytics || false;
    
    this.cache = new Map();
    this.timers = new Map();
    this.accessTimes = new Map();
    
    // Analytics tracking
    this.analytics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
      deletes: 0,
      memoryPressureCleanups: 0
    };
    
    // Memory pressure monitoring
    this.lastMemoryCheck = Date.now();
    this.memoryCheckInterval = 60000; // Check every minute
  }

  set(key: string, value: any): void {
    this.analytics.sets++;
    
    // Remove oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.delete(oldestKey);
        this.analytics.evictions++;
      }
    }

    // Clear existing timer if key exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set value, access time, and TTL timer
    this.cache.set(key, value);
    this.accessTimes.set(key, Date.now());
    
    const timer = setTimeout(() => {
      this.delete(key);
    }, this.ttl);
    this.timers.set(key, timer);

    this.checkMemoryPressure();
  }

  get(key: string): any {
    if (!this.cache.has(key)) {
      this.analytics.misses++;
      return undefined;
    }

    this.analytics.hits++;
    
    // Update access time for LRU
    this.accessTimes.set(key, Date.now());
    
    // Move to end (LRU behavior) - reinsert at end
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): boolean {
    this.analytics.deletes++;
    
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    this.accessTimes.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.accessTimes.clear();
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
    
    if (force || heapUsedMB > 100) { // Clean if heap > 100MB or forced
      const sizeBefore = this.cache.size;
      this.clear();
      this.analytics.memoryPressureCleanups++;
      
      return {
        cleaned: true,
        sizeBefore,
        sizeAfter: this.cache.size,
        memoryFreed: heapUsedMB
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
      if (heapUsedMB > 150) { // 150MB threshold
        this.cleanup(true);
      }
    }
  }

  // Get cache analytics and performance metrics
  getAnalytics() {
    const hitRate = this.analytics.hits + this.analytics.misses > 0 
      ? (this.analytics.hits / (this.analytics.hits + this.analytics.misses) * 100).toFixed(2)
      : '0';

    return {
      ...this.analytics,
      hitRate: `${hitRate}%`,
      currentSize: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      memoryUsage: process.memoryUsage()
    };
  }

  // Export cache state for debugging/monitoring
  exportState(): CacheState {
    return {
      config: {
        maxSize: this.maxSize,
        ttl: this.ttl,
        enableAnalytics: this.enableAnalytics
      },
      state: {
        size: this.cache.size,
        keys: this.keys(),
        accessTimes: Object.fromEntries(this.accessTimes)
      },
      analytics: this.getAnalytics()
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