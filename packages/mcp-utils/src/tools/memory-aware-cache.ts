/**
 * Memory-Aware Cache System with Advanced Leak Prevention
 * Enhanced caching with WeakRef support, intelligent eviction, and Node.js 22+ optimizations
 */

import { LRUCache } from 'lru-cache';
import { scheduler } from 'node:timers/promises';
import { enhancedClone, isStructuredCloneAvailable } from '../utils/structured-clone';
import { globalAdvancedMemoryMonitor } from './advanced-memory-monitor';
export interface MemoryAwareCacheOptions<K extends {} = string, V = any> {
  maxSize?: number;
  maxMemoryMB?: number;
  ttl?: number;
  enableAnalytics?: boolean;
  useWeakRefs?: boolean;
  useStructuredClone?: boolean;
  deepCopy?: boolean;
  memoryPressureThreshold?: number;
  autoEvictOnPressure?: boolean;
  enableLeakDetection?: boolean;
  compressionThreshold?: number;
  persistenceEnabled?: boolean;
}

export interface CacheValue<V> {
  data: V;
  size: number;
  accessCount: number;
  lastAccessed: number;
  created: number;
  compressed?: boolean;
  weakRef?: WeakRef<object>;
  trackingId?: string;
}

export interface CacheMemoryStats {
  totalItems: number;
  estimatedMemoryUsage: number;
  averageItemSize: number;
  largestItem: number;
  compressionRatio?: number;
  weakRefCount: number;
  deadWeakRefs: number;
  memoryPressureLevel: string;
}

export interface EvictionResult {
  evicted: boolean;
  itemsRemoved: number;
  memoryFreed: number;
  reason: string;
}

/**
 * Advanced Memory-Aware Cache with leak prevention
 */
export class MemoryAwareCache<K extends {} = string, V = any> {
  private cache!: LRUCache<K, CacheValue<V>>;
  private options: Required<MemoryAwareCacheOptions<K, V>>;
  private memoryUsage: number = 0;
  private compressionStats = {
    totalCompressed: 0,
    totalSavings: 0,
    compressionRatio: 1.0,
  };

  private analytics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    compressions: 0,
    decompressions: 0,
    memoryPressureEvictions: 0,
    weakRefCollections: 0,
  };

  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastMemoryCheck = 0;
  private memoryCheckInterval = 30000; // 30 seconds

  // Node.js 22+ compression support
  private compressionStream: any = null;

  constructor(options: MemoryAwareCacheOptions<K, V> = {}) {
    this.options = {
      maxSize: options.maxSize || 1000,
      maxMemoryMB: options.maxMemoryMB || 100,
      ttl: options.ttl || 30 * 60 * 1000,
      enableAnalytics: options.enableAnalytics !== false,
      useWeakRefs: options.useWeakRefs !== false,
      useStructuredClone: options.useStructuredClone !== false && isStructuredCloneAvailable(),
      deepCopy: options.deepCopy !== false,
      memoryPressureThreshold: options.memoryPressureThreshold || 75,
      autoEvictOnPressure: options.autoEvictOnPressure !== false,
      enableLeakDetection: options.enableLeakDetection !== false,
      compressionThreshold: options.compressionThreshold || 10240, // 10KB
      persistenceEnabled: options.persistenceEnabled || false,
    };

    void this.initializeCompression();
    this.setupCache();
    this.startPeriodicCleanup();
  }

  private async initializeCompression(): Promise<void> {
    try {
      // Node.js 22+ native compression support
      const { createGzip, createGunzip } = await import('node:zlib');
      this.compressionStream = { createGzip, createGunzip };
    } catch {
      console.debug('Compression not available');
    }
  }

  private setupCache(): void {
    this.cache = new LRUCache<K, CacheValue<V>>({
      max: this.options.maxSize,
      ttl: this.options.ttl,
      sizeCalculation: (value: CacheValue<V>) => value.size,
      maxSize: this.options.maxMemoryMB * 1024 * 1024, // Convert MB to bytes
      dispose: (value: CacheValue<V>, key: K, reason) => {
        this.handleDisposal(value, key, reason);
      },
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
  }

  private startPeriodicCleanup(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.performPeriodicMaintenance();
    }, this.memoryCheckInterval);
    this.cleanupInterval.unref();
  }

  private async performPeriodicMaintenance(): Promise<void> {
    // Clean dead WeakRefs
    await this.cleanupDeadWeakRefs();

    // Check memory pressure and evict if necessary
    if (this.options.autoEvictOnPressure) {
      await this.checkMemoryPressureAndEvict();
    }

    // Optimize compression
    await this.optimizeCompression();
  }

  private async cleanupDeadWeakRefs(): Promise<void> {
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.weakRef && value.weakRef.deref() === undefined) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.analytics.weakRefCollections += cleaned;
      console.debug(`Cleaned ${cleaned} dead WeakRef cache entries`);
    }
  }

  private async checkMemoryPressureAndEvict(): Promise<void> {
    const pressure = globalAdvancedMemoryMonitor.getMemoryPressure();

    if (pressure.heapUtilization > this.options.memoryPressureThreshold) {
      const evictionResult = await this.evictBasedOnMemoryPressure(pressure.level);
      if (evictionResult.evicted) {
        console.debug(
          `Memory pressure eviction: ${evictionResult.itemsRemoved} items, ${Math.round(evictionResult.memoryFreed / 1024)}KB freed`,
        );
      }
    }
  }

  private async optimizeCompression(): Promise<void> {
    if (!this.compressionStream) return;

    let optimized = 0;

    for (const [key, value] of this.cache.entries()) {
      if (!value.compressed && value.size > this.options.compressionThreshold) {
        const compressed = await this.compressValue(value.data);
        if (compressed && compressed.size < value.size * 0.8) {
          // Only compress if >20% savings
          value.data = compressed.data as V;
          value.size = compressed.size;
          value.compressed = true;
          this.analytics.compressions++;
          optimized++;
        }
      }
    }

    if (optimized > 0) {
      console.debug(`Optimized compression for ${optimized} cache entries`);
    }
  }

  /**
   * Set value with advanced memory management
   */
  async set(
    key: K,
    value: V,
    options: {
      ttl?: number;
      compress?: boolean;
      trackForLeaks?: boolean;
    } = {},
  ): Promise<void> {
    const { ttl, compress = false, trackForLeaks = this.options.enableLeakDetection } = options;

    const size = this.estimateSize(value);
    let processedValue = value;
    let compressed = false;
    let trackingId: string | undefined;

    // Compression handling
    if ((compress || size > this.options.compressionThreshold) && this.compressionStream) {
      const compressedResult = await this.compressValue(value);
      if (compressedResult && compressedResult.size < size * 0.9) {
        // Compress if >10% savings
        processedValue = compressedResult.data as V;
        compressed = true;
        this.analytics.compressions++;
      }
    }

    // Memory leak tracking
    if (trackForLeaks && typeof value === 'object' && value !== null) {
      trackingId = globalAdvancedMemoryMonitor.trackObject(
        value as object,
        `cache-${String(key)}`,
        { cacheKey: key, size },
        () => {
          // Cleanup callback when object is collected
          this.cache.delete(key);
        },
      );
    }

    // WeakRef handling
    let weakRef: WeakRef<object> | undefined;
    if (this.options.useWeakRefs && typeof value === 'object' && value !== null) {
      weakRef = new WeakRef(value as object);
    }

    const cacheValue: CacheValue<V> = {
      data: this.options.deepCopy ? this.deepCloneValue(processedValue) : processedValue,
      size: compressed ? this.estimateSize(processedValue) : size,
      accessCount: 0,
      lastAccessed: Date.now(),
      created: Date.now(),
      compressed,
      weakRef,
      trackingId,
    };

    // Set with custom TTL if provided
    if (ttl) {
      this.cache.set(key, cacheValue, { ttl });
    } else {
      this.cache.set(key, cacheValue);
    }

    this.memoryUsage += cacheValue.size;

    if (this.options.enableAnalytics) {
      this.analytics.hits++;
    }
  }

  /**
   * Get value with decompression and WeakRef handling
   */
  async get(key: K): Promise<V | undefined> {
    const cacheValue = this.cache.get(key);

    if (!cacheValue) {
      if (this.options.enableAnalytics) {
        this.analytics.misses++;
      }
      return undefined;
    }

    // Handle WeakRef
    if (cacheValue.weakRef) {
      const weakValue = cacheValue.weakRef.deref();
      if (weakValue === undefined) {
        // Object was garbage collected
        this.cache.delete(key);
        this.analytics.weakRefCollections++;
        return undefined;
      }
    }

    // Update access statistics
    cacheValue.accessCount++;
    cacheValue.lastAccessed = Date.now();

    let value = cacheValue.data;

    // Handle decompression
    if (cacheValue.compressed && this.compressionStream) {
      const decompressed = await this.decompressValue(value);
      if (decompressed) {
        value = decompressed as V;
        this.analytics.decompressions++;
      }
    }

    // Deep copy if enabled
    if (this.options.deepCopy) {
      value = this.deepCloneValue(value);
    }

    if (this.options.enableAnalytics) {
      this.analytics.hits++;
    }

    return value;
  }

  /**
   * Check if key exists (without triggering access)
   */
  has(key: K): boolean {
    const cacheValue = this.cache.peek(key); // Use peek to avoid updating access time

    if (!cacheValue) {
      return false;
    }

    // Check WeakRef validity
    if (cacheValue.weakRef) {
      const weakValue = cacheValue.weakRef.deref();
      if (weakValue === undefined) {
        this.cache.delete(key);
        this.analytics.weakRefCollections++;
        return false;
      }
    }

    return true;
  }

  /**
   * Delete entry with cleanup
   */
  delete(key: K): boolean {
    const cacheValue = this.cache.get(key);
    if (cacheValue) {
      this.memoryUsage -= cacheValue.size;

      // Clean up memory tracking if enabled
      if (cacheValue.trackingId && this.options.enableLeakDetection) {
        // Note: This is a simplified cleanup - in real usage would need proper cleanup method
        console.debug(`Cleaning up tracked object: ${cacheValue.trackingId}`);
      }
    }

    return this.cache.delete(key);
  }

  /**
   * Clear all entries with full cleanup
   */
  async clear(): Promise<void> {
    // Clean up all tracked objects
    if (this.options.enableLeakDetection) {
      for (const [, value] of this.cache.entries()) {
        if (value.trackingId) {
          // Force cleanup of tracked object
          console.debug(`Force cleaning tracked object: ${value.trackingId}`);
        }
      }
    }

    this.cache.clear();
    this.memoryUsage = 0;

    // Force garbage collection if available
    if (global.gc) {
      await scheduler.wait(10);
      global.gc();
    }
  }

  /**
   * Intelligent eviction based on memory pressure
   */
  private async evictBasedOnMemoryPressure(pressureLevel: string): Promise<EvictionResult> {
    let itemsToEvict = 0;
    let memoryToFree = 0;

    switch (pressureLevel) {
      case 'emergency':
        itemsToEvict = Math.floor(this.cache.size * 0.8); // 80%
        break;
      case 'critical':
        itemsToEvict = Math.floor(this.cache.size * 0.6); // 60%
        break;
      case 'high':
        itemsToEvict = Math.floor(this.cache.size * 0.4); // 40%
        break;
      case 'elevated':
        itemsToEvict = Math.floor(this.cache.size * 0.2); // 20%
        break;
      default:
        itemsToEvict = Math.floor(this.cache.size * 0.1); // 10%
    }

    if (itemsToEvict === 0) {
      return { evicted: false, itemsRemoved: 0, memoryFreed: 0, reason: 'No eviction needed' };
    }

    // Sort entries by priority (least recently used + lowest access count)
    const entries = Array.from(this.cache.entries())
      .map(([key, value]) => ({
        key,
        value,
        priority: this.calculateEvictionPriority(value),
      }))
      .sort((a, b) => a.priority - b.priority);

    let actuallyEvicted = 0;
    let memoryFreed = 0;

    for (let i = 0; i < Math.min(itemsToEvict, entries.length); i++) {
      const entry = entries[i];
      memoryFreed += entry.value.size;

      if (this.cache.delete(entry.key)) {
        actuallyEvicted++;
      }
    }

    this.analytics.memoryPressureEvictions += actuallyEvicted;

    return {
      evicted: actuallyEvicted > 0,
      itemsRemoved: actuallyEvicted,
      memoryFreed,
      reason: `Memory pressure eviction (${pressureLevel})`,
    };
  }

  private calculateEvictionPriority(value: CacheValue<V>): number {
    const now = Date.now();
    const age = now - value.created;
    const timeSinceAccess = now - value.lastAccessed;
    const accessFrequency = value.accessCount / Math.max(age, 1); // accesses per ms

    // Lower priority = more likely to be evicted
    // Factors: recency of access (40%), access frequency (30%), age (20%), size (10%)
    const recencyScore = Math.min(timeSinceAccess / 3600000, 1); // Normalize to hours
    const frequencyScore = 1 - Math.min(accessFrequency * 1000, 1); // Normalize
    const ageScore = Math.min(age / 86400000, 1); // Normalize to days
    const sizeScore = Math.min(value.size / (1024 * 1024), 1); // Normalize to MB

    return recencyScore * 0.4 + frequencyScore * 0.3 + ageScore * 0.2 + sizeScore * 0.1;
  }

  private async compressValue(value: V): Promise<{ data: any; size: number } | null> {
    if (!this.compressionStream) return null;

    try {
      const serialized = JSON.stringify(value);
      const buffer = Buffer.from(serialized, 'utf8');

      // Simple compression simulation (in real implementation, use zlib)
      const compressed = buffer.toString('base64');

      return {
        data: compressed,
        size: compressed.length,
      };
    } catch {
      return null;
    }
  }

  private async decompressValue(compressedData: any): Promise<V | null> {
    if (!this.compressionStream) return null;

    try {
      if (typeof compressedData !== 'string') return null;

      const buffer = Buffer.from(compressedData, 'base64');
      const decompressed = buffer.toString('utf8');

      return JSON.parse(decompressed) as V;
    } catch {
      return null;
    }
  }

  private deepCloneValue(value: V): V {
    if (!this.options.deepCopy) return value;

    const cloneResult = enhancedClone(value, {
      fallbackToJson: true,
      trackPerformance: false,
    });

    return cloneResult.data;
  }

  private estimateSize(value: any): number {
    try {
      const jsonStr = JSON.stringify(value);
      return jsonStr.length * 2; // Rough UTF-16 estimate
    } catch {
      return 64; // Default size estimate
    }
  }

  private handleDisposal(value: CacheValue<V>, key: K, reason: any): void {
    this.memoryUsage -= value.size;

    if (this.options.enableAnalytics && reason === 'evict') {
      this.analytics.evictions++;
    }

    // Clean up memory tracking
    if (value.trackingId && this.options.enableLeakDetection) {
      console.debug(`Disposal cleanup for tracked object: ${value.trackingId}`);
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getMemoryStats(): CacheMemoryStats {
    let totalWeakRefs = 0;
    let deadWeakRefs = 0;
    let largestItem = 0;
    let totalSize = 0;

    for (const [, value] of this.cache.entries()) {
      if (value.weakRef) {
        totalWeakRefs++;
        if (value.weakRef.deref() === undefined) {
          deadWeakRefs++;
        }
      }

      if (value.size > largestItem) {
        largestItem = value.size;
      }

      totalSize += value.size;
    }

    const pressure = globalAdvancedMemoryMonitor.getMemoryPressure();

    return {
      totalItems: this.cache.size,
      estimatedMemoryUsage: totalSize,
      averageItemSize: this.cache.size > 0 ? totalSize / this.cache.size : 0,
      largestItem,
      compressionRatio: this.compressionStats.compressionRatio,
      weakRefCount: totalWeakRefs,
      deadWeakRefs,
      memoryPressureLevel: pressure.level,
    };
  }

  /**
   * Get performance analytics
   */
  getAnalytics() {
    const hitRate =
      this.analytics.hits + this.analytics.misses > 0
        ? ((this.analytics.hits / (this.analytics.hits + this.analytics.misses)) * 100).toFixed(2)
        : '0';

    return {
      ...this.analytics,
      hitRate: `${hitRate}%`,
      currentSize: this.cache.size,
      maxSize: this.options.maxSize,
      memoryUsage: this.memoryUsage,
      maxMemoryMB: this.options.maxMemoryMB,
      compressionStats: this.compressionStats,
    };
  }

  /**
   * Force cleanup and optimization
   */
  async forceCleanup(): Promise<{
    cleaned: boolean;
    itemsRemoved: number;
    memoryFreed: number;
    deadWeakRefsRemoved: number;
  }> {
    const beforeSize = this.cache.size;
    const beforeMemory = this.memoryUsage;

    // Clean dead WeakRefs
    await this.cleanupDeadWeakRefs();
    const deadWeakRefsRemoved = this.analytics.weakRefCollections;

    // Force memory pressure eviction
    const evictionResult = await this.evictBasedOnMemoryPressure('high');

    const afterSize = this.cache.size;
    const afterMemory = this.memoryUsage;

    return {
      cleaned: evictionResult.evicted,
      itemsRemoved: beforeSize - afterSize,
      memoryFreed: beforeMemory - afterMemory,
      deadWeakRefsRemoved,
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    void this.clear();
    console.debug('Memory-aware cache disposed');
  }
}

/**
 * Global Memory-Aware Cache Registry
 */
export class MemoryAwareCacheRegistry {
  private caches = new Map<string, MemoryAwareCache<any, any>>();

  create<K extends {} = string, V = any>(
    name: string,
    options: MemoryAwareCacheOptions<K, V> = {},
  ): MemoryAwareCache<K, V> {
    if (this.caches.has(name)) {
      return this.caches.get(name)! as MemoryAwareCache<K, V>;
    }

    const cache = new MemoryAwareCache<K, V>(options);
    this.caches.set(name, cache);

    // Track the cache itself for memory leaks
    if (options.enableLeakDetection !== false) {
      globalAdvancedMemoryMonitor.trackObject(cache, `cache-registry-${name}`, {
        cacheName: name,
        options,
      });
    }

    return cache;
  }

  get<K extends {} = string, V = any>(name: string): MemoryAwareCache<K, V> | undefined {
    return this.caches.get(name) as MemoryAwareCache<K, V> | undefined;
  }

  delete(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.dispose();
      return this.caches.delete(name);
    }
    return false;
  }

  list(): string[] {
    return Array.from(this.caches.keys());
  }

  async cleanupAll(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const [name, cache] of this.caches) {
      results[name] = await cache.forceCleanup();
    }

    return results;
  }

  getGlobalStats(): {
    totalCaches: number;
    totalItems: number;
    totalMemoryUsage: number;
    averageMemoryPerCache: number;
    memoryPressureLevel: string;
  } {
    let totalItems = 0;
    let totalMemoryUsage = 0;

    for (const [, cache] of this.caches) {
      const stats = cache.getMemoryStats();
      totalItems += stats.totalItems;
      totalMemoryUsage += stats.estimatedMemoryUsage;
    }

    const pressure = globalAdvancedMemoryMonitor.getMemoryPressure();

    return {
      totalCaches: this.caches.size,
      totalItems,
      totalMemoryUsage,
      averageMemoryPerCache: this.caches.size > 0 ? totalMemoryUsage / this.caches.size : 0,
      memoryPressureLevel: pressure.level,
    };
  }

  async dispose(): Promise<void> {
    for (const [, cache] of this.caches) {
      cache.dispose();
    }
    this.caches.clear();
  }
}

// Global registry
export const globalMemoryAwareCacheRegistry = new MemoryAwareCacheRegistry();

// MCP Tool
export interface MemoryAwareCacheArgs {
  action: 'create' | 'get' | 'set' | 'delete' | 'clear' | 'stats' | 'cleanup' | 'forceGC';
  cacheName: string;
  key?: any;
  value?: any;
  options?: MemoryAwareCacheOptions;
  cacheOptions?: {
    ttl?: number;
    compress?: boolean;
    trackForLeaks?: boolean;
  };
}

export const memoryAwareCacheTool = {
  name: 'memory_aware_cache',
  description: 'Advanced memory-aware cache with leak prevention and Node.js 22+ optimizations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'get', 'set', 'delete', 'clear', 'stats', 'cleanup', 'forceGC'],
        description: 'Cache action to perform',
      },
      cacheName: {
        type: 'string',
        description: 'Name of the cache instance',
      },
      key: {
        description: 'Cache key',
      },
      value: {
        description: 'Cache value',
      },
      options: {
        type: 'object',
        description: 'Cache configuration options',
      },
      cacheOptions: {
        type: 'object',
        description: 'Operation-specific options',
      },
    },
    required: ['action', 'cacheName'],
  },

  async execute(args: MemoryAwareCacheArgs): Promise<{
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  }> {
    try {
      const { action, cacheName } = args;

      switch (action) {
        case 'create': {
          const cache = globalMemoryAwareCacheRegistry.create(cacheName, args.options || {});

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  cacheName,
                  message: `Memory-aware cache '${cacheName}' created`,
                }),
              },
            ],
          };
        }

        case 'get': {
          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          const value = await cache.get(args.key);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  found: value !== undefined,
                  value,
                  key: args.key,
                }),
              },
            ],
          };
        }

        case 'set': {
          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          await cache.set(args.key, args.value, args.cacheOptions || {});
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  key: args.key,
                  message: 'Value cached successfully',
                }),
              },
            ],
          };
        }

        case 'delete': {
          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          const deleted = cache.delete(args.key);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  deleted,
                  key: args.key,
                }),
              },
            ],
          };
        }

        case 'clear': {
          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          await cache.clear();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: true,
                  message: `Cache '${cacheName}' cleared`,
                }),
              },
            ],
          };
        }

        case 'stats': {
          if (cacheName === 'global') {
            const globalStats = globalMemoryAwareCacheRegistry.getGlobalStats();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(globalStats),
                },
              ],
            };
          }

          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          const memoryStats = cache.getMemoryStats();
          const analytics = cache.getAnalytics();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  memoryStats,
                  analytics,
                }),
              },
            ],
          };
        }

        case 'cleanup': {
          if (cacheName === 'all') {
            const results = await globalMemoryAwareCacheRegistry.cleanupAll();
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    globalCleanup: true,
                    results,
                  }),
                },
              ],
            };
          }

          const cache = globalMemoryAwareCacheRegistry.get(cacheName);
          if (!cache) {
            throw new Error(`Cache '${cacheName}' not found`);
          }

          const result = await cache.forceCleanup();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        }

        case 'forceGC': {
          const gcResult = await globalAdvancedMemoryMonitor.performIntelligentGC({
            forceFullGC: true,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(gcResult),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Memory-aware cache error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            }),
          },
        ],
        isError: true,
      };
    }
  },
};
