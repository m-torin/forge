import { logWarn } from '@repo/observability/server/next';
import { MCPClientConfig } from './client';

/**
 * Configuration for MCP tool caching
 */
export interface MCPToolCacheConfig {
  enabled: boolean;
  maxEntries: number;
  ttlMs: number;
  maxMemoryMB: number;
  compressionEnabled: boolean;
}

/**
 * Default tool cache configuration
 */
export const DEFAULT_CACHE_CONFIG: MCPToolCacheConfig = {
  enabled: true,
  maxEntries: 1000,
  ttlMs: 300000, // 5 minutes
  maxMemoryMB: 50,
  compressionEnabled: false, // Disabled by default for simplicity
};

/**
 * Cache entry with metadata
 */
interface CacheEntry {
  tools: Record<string, any>;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  size: number; // Approximate size in bytes
}

/**
 * Tool cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  entries: number;
  totalSize: number;
  hitRate: number;
  avgAccessTime: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}

/**
 * MCP Tool Cache
 * Caches frequently used MCP tools to improve performance
 */
export class MCPToolCache {
  private cache = new Map<string, CacheEntry>();
  private config: MCPToolCacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalAccessTime: 0,
    accessCount: 0,
  };
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config: Partial<MCPToolCacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };

    if (this.config.enabled) {
      this.startCleanupTask();
    }
  }

  /**
   * Get tools from cache if available
   */
  get(clientConfig: MCPClientConfig): Record<string, any> | null {
    if (!this.config.enabled) {
      return null;
    }

    const key = this.getCacheKey(clientConfig);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    const now = new Date();
    const age = now.getTime() - entry.createdAt.getTime();

    if (age > this.config.ttlMs) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access metadata
    entry.lastAccessed = now;
    entry.accessCount++;
    this.stats.hits++;

    return entry.tools;
  }

  /**
   * Store tools in cache
   */
  set(clientConfig: MCPClientConfig, tools: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }

    const key = this.getCacheKey(clientConfig);
    const size = this.estimateSize(tools);
    const now = new Date();

    // Check memory limits
    if (this.shouldEvictForMemory(size)) {
      this.evictLeastRecentlyUsed();
    }

    // Check entry limits
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldestEntry();
    }

    const entry: CacheEntry = {
      tools,
      createdAt: now,
      lastAccessed: now,
      accessCount: 1,
      size,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear all cached tools for a specific client
   */
  invalidate(clientConfig: MCPClientConfig): void {
    const key = this.getCacheKey(clientConfig);
    this.cache.delete(key);
  }

  /**
   * Clear all cached tools
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const avgAccessTime =
      this.stats.accessCount > 0 ? this.stats.totalAccessTime / this.stats.accessCount : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      entries: this.cache.size,
      totalSize,
      hitRate,
      avgAccessTime,
      oldestEntry:
        entries.length > 0
          ? new Date(Math.min(...entries.map(e => e.createdAt.getTime())))
          : undefined,
      newestEntry:
        entries.length > 0
          ? new Date(Math.max(...entries.map(e => e.createdAt.getTime())))
          : undefined,
    };
  }

  /**
   * Generate cache key for client configuration
   */
  private getCacheKey(clientConfig: MCPClientConfig): string {
    // Include transport details and relevant config in key
    return `mcp:${clientConfig.name}:${clientConfig.transport.type}:${JSON.stringify(clientConfig.transport)}`;
  }

  /**
   * Estimate memory size of tools object
   */
  private estimateSize(tools: Record<string, any>): number {
    try {
      return JSON.stringify(tools).length * 2; // Rough estimate: 2 bytes per character
    } catch {
      return 1024; // Default estimate if serialization fails
    }
  }

  /**
   * Check if we should evict entries to stay within memory limits
   */
  private shouldEvictForMemory(newEntrySize: number): boolean {
    const currentSize = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const maxSizeBytes = this.config.maxMemoryMB * 1024 * 1024;

    return currentSize + newEntrySize > maxSizeBytes;
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return;

    // Sort by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime(),
    );

    // Remove oldest 25% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.25));

    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    logWarn(`Evicted ${toRemove} LRU entries from MCP tool cache`, {
      operation: 'mcp_cache_lru_eviction',
      metadata: {
        evictedCount: toRemove,
        remainingEntries: this.cache.size,
      },
    });
  }

  /**
   * Evict oldest entry
   */
  private evictOldestEntry(): void {
    if (this.cache.size === 0) return;

    // Find oldest entry
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt.getTime() < oldestTime) {
        oldestTime = entry.createdAt.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Start periodic cleanup task
   */
  private startCleanupTask(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      const age = now.getTime() - entry.createdAt.getTime();
      if (age > this.config.ttlMs) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
    }

    if (expiredKeys.length > 0) {
      logWarn(`Cleaned up ${expiredKeys.length} expired entries from MCP tool cache`, {
        operation: 'mcp_cache_cleanup',
        metadata: {
          expiredCount: expiredKeys.length,
          remainingEntries: this.cache.size,
        },
      });
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalAccessTime: 0,
      accessCount: 0,
    };
  }

  /**
   * Disable caching
   */
  disable(): void {
    this.config.enabled = false;
    this.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Enable caching
   */
  enable(): void {
    this.config.enabled = true;
    this.startCleanupTask();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.clear();
  }
}

/**
 * Global MCP tool cache instance
 */
export const globalMCPToolCache = new MCPToolCache();
