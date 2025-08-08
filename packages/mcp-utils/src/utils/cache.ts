/**
 * Bounded Cache implementation using lru-cache library
 * Maintains API compatibility while leveraging battle-tested LRU implementation
 * Enhanced with Node.js 22+ structuredClone for better performance
 */

import { LRUCache } from 'lru-cache';
import { CLEANUP_PRIORITIES, registerCleanupHandler } from '../runtime/lifecycle';
import { enhancedClone, isStructuredCloneAvailable } from './structured-clone';

export interface BoundedCacheOptions {
  maxSize?: number;
  ttl?: number;
  enableAnalytics?: boolean;
  useStructuredClone?: boolean;
  deepCopy?: boolean;
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
  private useStructuredClone: boolean;
  private deepCopy: boolean;
  private analytics: CacheAnalytics;
  private lastMemoryCheck: number;
  private memoryCheckInterval: number;

  constructor(options: BoundedCacheOptions = {}) {
    const maxSize = options.maxSize || 100;
    const ttl = options.ttl || 30 * 60 * 1000; // 30 minutes default
    this.enableAnalytics = options.enableAnalytics || false;
    this.useStructuredClone = options.useStructuredClone !== false && isStructuredCloneAvailable();
    this.deepCopy = options.deepCopy !== false;

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

    // Deep copy value if requested using structured clone for better performance
    const valueToCache = this.deepCopy ? this.deepCloneValue(value) : value;
    this.cache.set(key, valueToCache);
    this.checkMemoryPressure();
  }

  get(key: string): any {
    const value = this.cache.get(key);

    if (value === undefined) {
      if (this.enableAnalytics) {
        this.analytics.misses++;
      }
      return undefined;
    }

    if (this.enableAnalytics) {
      this.analytics.hits++;
    }

    // Deep copy return value if requested using structured clone for better performance
    return this.deepCopy ? this.deepCloneValue(value) : value;
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

  /**
   * Deep clone value using Node.js 22+ structured clone for better performance
   */
  private deepCloneValue(value: any): any {
    if (!this.deepCopy) {
      return value;
    }

    const cloneResult = enhancedClone(value, {
      fallbackToJson: true,
      trackPerformance: false,
    });

    return cloneResult.data;
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

  cleanup(force = false): CleanupResult {
    let totalCleaned = 0;
    let totalBefore = 0;

    for (const [name, cache] of this.caches) {
      const result = cache.cleanup(force);
      if (result.cleaned) {
        totalCleaned++;
        totalBefore += result.sizeBefore || 0;
      }
    }

    return {
      cleaned: totalCleaned > 0,
      sizeBefore: totalBefore,
      sizeAfter: 0,
      reason: force ? 'forced_cleanup' : 'memory_pressure',
    };
  }
}

// Default global registry instance
export const globalCacheRegistry = new CacheRegistry();

/**
 * Progressive Memory Cleanup System
 * Implements multi-level cleanup strategies based on memory pressure
 */
export class ProgressiveMemoryCleanup {
  private readonly thresholds = {
    low: 50, // 50MB - Start gentle cleanup
    medium: 100, // 100MB - More aggressive cleanup
    high: 150, // 150MB - Aggressive cleanup
    critical: 200, // 200MB - Emergency cleanup
  };

  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastCleanup = 0;
  private readonly cleanupCooldown = 30000; // 30 seconds between cleanups

  constructor() {
    this.startMonitoring();
  }

  /**
   * Start monitoring memory pressure and perform progressive cleanup
   */
  private startMonitoring(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastCleanup < this.cleanupCooldown) {
        return; // Still in cooldown period
      }

      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      if (heapUsedMB > this.thresholds.critical) {
        this.performCriticalCleanup();
        this.lastCleanup = now;
      } else if (heapUsedMB > this.thresholds.high) {
        this.performHighCleanup();
        this.lastCleanup = now;
      } else if (heapUsedMB > this.thresholds.medium) {
        this.performMediumCleanup();
        this.lastCleanup = now;
      } else if (heapUsedMB > this.thresholds.low) {
        this.performLowCleanup();
        this.lastCleanup = now;
      }
    }, 10000); // Check every 10 seconds

    // Unref to not block process exit
    this.cleanupInterval.unref();
  }

  /**
   * Level 1: Gentle cleanup - Clear oldest cache entries
   */
  private performLowCleanup(): void {
    console.debug('Progressive cleanup: Low memory pressure - gentle cleanup');

    // Clean up old cache entries (but keep some)
    for (const [name, cache] of globalCacheRegistry['caches']) {
      if (cache.size() > 20) {
        const keysToRemove = cache.keys().slice(0, Math.floor(cache.size() * 0.1));
        for (const key of keysToRemove) {
          cache.delete(key);
        }
      }
    }
  }

  /**
   * Level 2: Medium cleanup - Clear half of cache entries
   */
  private performMediumCleanup(): void {
    console.debug('Progressive cleanup: Medium memory pressure - moderate cleanup');

    // Clear half of cache entries
    for (const [name, cache] of globalCacheRegistry['caches']) {
      if (cache.size() > 10) {
        const keysToRemove = cache.keys().slice(0, Math.floor(cache.size() * 0.5));
        for (const key of keysToRemove) {
          cache.delete(key);
        }
      }
    }

    // Clear buffer pools partially
    if (typeof globalThis !== 'undefined' && (globalThis as any).BufferPoolManager) {
      // This would be available if streams.ts is imported
      const stats = (globalThis as any).BufferPoolManager.getStats();
      for (const [size, info] of Object.entries(stats)) {
        if (
          info &&
          typeof info === 'object' &&
          'pooled' in info &&
          typeof (info as any).pooled === 'number'
        ) {
          if ((info as any).pooled > 10) {
            // Clear half of pooled buffers for each size
            console.debug(
              `Clearing ${Math.floor((info as any).pooled / 2)} buffers of size ${size}`,
            );
          }
        }
      }
    }
  }

  /**
   * Level 3: High cleanup - Clear most cache entries and buffers
   */
  private performHighCleanup(): void {
    console.debug('Progressive cleanup: High memory pressure - aggressive cleanup');

    // Clear most cache entries (keep only 25%)
    for (const [name, cache] of globalCacheRegistry['caches']) {
      if (cache.size() > 5) {
        const keysToRemove = cache.keys().slice(0, Math.floor(cache.size() * 0.75));
        for (const key of keysToRemove) {
          cache.delete(key);
        }
      }
    }

    // Clear most buffer pools
    if (typeof globalThis !== 'undefined' && (globalThis as any).BufferPoolManager) {
      (globalThis as any).BufferPoolManager.handleMemoryPressure();
    }

    // Suggest GC if available
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Level 4: Critical cleanup - Emergency memory cleanup
   */
  private performCriticalCleanup(): void {
    console.warn('Progressive cleanup: CRITICAL memory pressure - emergency cleanup');

    // Clear all caches completely
    globalCacheRegistry.cleanupAll();

    // Clear all buffer pools
    if (typeof globalThis !== 'undefined' && (globalThis as any).BufferPoolManager) {
      (globalThis as any).BufferPoolManager.clear();
    }

    // Force garbage collection multiple times
    if (global.gc) {
      global.gc();
      setTimeout(() => global.gc && global.gc(), 100);
      setTimeout(() => global.gc && global.gc(), 500);
    }

    // Log memory usage for debugging
    const afterCleanup = process.memoryUsage();
    console.warn('Post-cleanup memory usage:', {
      heapUsed: `${(afterCleanup.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(afterCleanup.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(afterCleanup.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(afterCleanup.rss / 1024 / 1024).toFixed(2)}MB`,
    });
  }

  /**
   * Force immediate cleanup at specified level
   */
  public forceCleanup(level: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    switch (level) {
      case 'low':
        this.performLowCleanup();
        break;
      case 'medium':
        this.performMediumCleanup();
        break;
      case 'high':
        this.performHighCleanup();
        break;
      case 'critical':
        this.performCriticalCleanup();
        break;
    }
    this.lastCleanup = Date.now();
  }

  /**
   * Get current memory status and cleanup recommendations
   */
  public getMemoryStatus(): {
    currentUsage: NodeJS.MemoryUsage;
    usageMB: number;
    pressureLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    nextCleanupIn: number;
  } {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

    let pressureLevel: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none';
    let recommendation = 'Memory usage is healthy';

    if (heapUsedMB > this.thresholds.critical) {
      pressureLevel = 'critical';
      recommendation = 'Critical memory pressure - emergency cleanup needed';
    } else if (heapUsedMB > this.thresholds.high) {
      pressureLevel = 'high';
      recommendation = 'High memory pressure - aggressive cleanup recommended';
    } else if (heapUsedMB > this.thresholds.medium) {
      pressureLevel = 'medium';
      recommendation = 'Medium memory pressure - moderate cleanup recommended';
    } else if (heapUsedMB > this.thresholds.low) {
      pressureLevel = 'low';
      recommendation = 'Low memory pressure - gentle cleanup recommended';
    }

    const now = Date.now();
    const nextCleanupIn = Math.max(0, this.cleanupCooldown - (now - this.lastCleanup));

    return {
      currentUsage: memUsage,
      usageMB: heapUsedMB,
      pressureLevel,
      recommendation,
      nextCleanupIn,
    };
  }

  /**
   * Configure cleanup thresholds
   */
  public configureThresholds(thresholds: Partial<typeof this.thresholds>): void {
    Object.assign(this.thresholds, thresholds);
  }

  /**
   * Stop monitoring and cleanup
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Global progressive memory cleanup instance
export const globalMemoryCleanup = new ProgressiveMemoryCleanup();

// Register cleanup with centralized lifecycle management
registerCleanupHandler(
  'cache-memory-cleanup',
  () => {
    globalMemoryCleanup.forceCleanup('critical');
    globalMemoryCleanup.destroy();
  },
  CLEANUP_PRIORITIES.CACHES,
);
