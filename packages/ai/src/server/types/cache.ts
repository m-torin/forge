/**
 * Cache and Performance Types
 * Advanced caching and performance optimization types for AI operations
 */

import type { AgentExecutionContext } from "./agent-core";

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  ttl?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  size?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  totalMemoryUsage: number;
  averageAccessTime: number;
  mostAccessedKeys: Array<{ key: string; count: number }>;
  leastRecentlyUsed: Array<{ key: string; lastAccessed: number }>;
  // Legacy cache property for backward compatibility
  cache?: {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  maxSize?: number;
  maxMemoryMB?: number;
  defaultTTL?: number;
  cleanupInterval?: number;
  evictionPolicy?: "LRU" | "LFU" | "FIFO" | "TTL";
  enableStats?: boolean;
  enableCompression?: boolean;
  persistToDisk?: boolean;
  diskPath?: string;
}

/**
 * Enhanced prompt cache interface
 */
export interface AnalyticsPromptCache {
  // Basic cache operations
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    },
  ): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Advanced operations
  getMany<T = any>(keys: string[]): Promise<Array<T | null>>;
  setMany<T = any>(
    entries: Array<{
      key: string;
      value: T;
      options?: {
        ttl?: number;
        tags?: string[];
        metadata?: Record<string, any>;
      };
    }>,
  ): Promise<void>;
  deleteMany(keys: string[]): Promise<number>;
  deleteByTag(tag: string): Promise<number>;
  deleteByPattern(pattern: RegExp): Promise<number>;

  // Search and filtering
  keys(pattern?: RegExp): Promise<string[]>;
  values<T = any>(pattern?: RegExp): Promise<T[]>;
  entries<T = any>(pattern?: RegExp): Promise<Array<CacheEntry<T>>>;
  findByTag(tag: string): Promise<Array<CacheEntry>>;
  findByMetadata(query: Record<string, any>): Promise<Array<CacheEntry>>;

  // Statistics and monitoring
  getStats(): Promise<CacheStats>;
  resetStats(): Promise<void>;
  getEntry(key: string): Promise<CacheEntry | null>;
  touch(key: string): Promise<boolean>; // Update last accessed time

  // Maintenance
  cleanup(): Promise<{ removed: number; freed: number }>;
  compact(): Promise<{ sizeBefore: number; sizeAfter: number }>;
  export(): Promise<Array<CacheEntry>>;
  import(
    entries: Array<CacheEntry>,
  ): Promise<{ imported: number; skipped: number }>;

  // Event handling
  onHit?(key: string, value: any): void | Promise<void>;
  onMiss?(key: string): void | Promise<void>;
  onSet?(key: string, value: any): void | Promise<void>;
  onDelete?(key: string): void | Promise<void>;
  onEvict?(
    key: string,
    value: any,
    reason: "size" | "ttl" | "manual",
  ): void | Promise<void>;
}

/**
 * Layered cache system
 */
export interface LayeredCache {
  l1: AnalyticsPromptCache; // Fast in-memory cache
  l2?: AnalyticsPromptCache;
  l3?: AnalyticsPromptCache;

  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(
    key: string,
    value: T,
    options?: {
      layer?: "l1" | "l2" | "l3";
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    },
  ): Promise<void>;
  promote(key: string, toLayer: "l1" | "l2"): Promise<boolean>;
  demote(key: string, toLayer: "l2" | "l3"): Promise<boolean>;
  getStats(): Promise<{ l1: CacheStats; l2?: CacheStats; l3?: CacheStats }>;
}

/**
 * Cache warming strategy
 */
export interface CacheWarmingStrategy {
  name: string;
  priority: number;
  condition: (context: AgentExecutionContext) => boolean;
  execute: (
    cache: AnalyticsPromptCache,
    context: AgentExecutionContext,
  ) => Promise<{
    warmed: number;
    errors: number;
    duration: number;
  }>;
}

/**
 * Cache warming manager
 */
export interface CacheWarmingManager {
  registerStrategy(strategy: CacheWarmingStrategy): void;
  unregisterStrategy(name: string): boolean;
  warmCache(
    context: AgentExecutionContext,
    strategyNames?: string[],
  ): Promise<{
    totalWarmed: number;
    totalErrors: number;
    duration: number;
    results: Array<{
      strategy: string;
      warmed: number;
      errors: number;
      duration: number;
    }>;
  }>;
  scheduleWarming(cronExpression: string, strategyNames?: string[]): void;
  cancelScheduledWarming(jobId: string): boolean;
}

/**
 * Distributed cache coordinator
 */
export interface DistributedCacheCoordinator {
  sync(keys?: string[]): Promise<{ synced: number; conflicts: number }>;
  broadcast(
    operation: "set" | "delete" | "clear",
    key?: string,
    value?: any,
  ): Promise<void>;
  onRemoteChange(
    callback: (operation: string, key: string, value?: any) => void,
  ): void;
  getNodeStatus(): Promise<
    Array<{
      nodeId: string;
      status: "healthy" | "degraded" | "offline";
      lastSeen: number;
      cacheSize: number;
    }>
  >;
}

/**
 * Cache performance analyzer
 */
export interface CachePerformanceAnalyzer {
  analyze(timeRangeMs?: number): Promise<{
    efficiency: {
      hitRate: number;
      averageResponseTime: number;
      memoryUtilization: number;
      evictionRate: number;
    };
    patterns: {
      hotKeys: Array<{ key: string; accessCount: number; pattern?: string }>;
      coldKeys: Array<{ key: string; lastAccessed: number }>;
      accessPatterns: Array<{ pattern: string; frequency: number }>;
      peakUsageTimes: Array<{ hour: number; usage: number }>;
    };
    recommendations: Array<{
      type: "configuration" | "usage" | "architecture";
      priority: "high" | "medium" | "low";
      description: string;
      estimatedImpact: string;
    }>;
  }>;

  generateReport(): Promise<{
    summary: string;
    metrics: Record<string, number>;
    charts: Array<{
      type: "line" | "bar" | "pie";
      title: string;
      data: any;
    }>;
    actionItems: string[];
  }>;
}

/**
 * Semantic cache for similar prompts
 */
export interface SemanticCache extends AnalyticsPromptCache {
  findSimilar(
    prompt: string,
    threshold?: number,
    maxResults?: number,
  ): Promise<
    Array<{
      key: string;
      value: any;
      similarity: number;
      originalPrompt: string;
    }>
  >;

  embed(text: string): Promise<number[]>;

  setSimilar<T = any>(
    prompt: string,
    value: T,
    embedding?: number[],
    options?: {
      ttl?: number;
      tags?: string[];
      metadata?: Record<string, any>;
    },
  ): Promise<void>;

  cluster(minSimilarity?: number): Promise<
    Array<{
      centroid: string;
      members: Array<{ key: string; similarity: number }>;
      size: number;
    }>
  >;
}

/**
 * Cache middleware for request/response interception
 */
export interface CacheMiddleware {
  name: string;
  priority: number;

  beforeGet?(
    key: string,
    cache: AnalyticsPromptCache,
  ): Promise<{
    proceed: boolean;
    transformKey?: string;
    metadata?: Record<string, any>;
  }>;

  afterGet?<T>(
    key: string,
    value: T | null,
    cache: AnalyticsPromptCache,
  ): Promise<{
    value: T | null;
    metadata?: Record<string, any>;
  }>;

  beforeSet?<T>(
    key: string,
    value: T,
    cache: AnalyticsPromptCache,
  ): Promise<{
    proceed: boolean;
    transformKey?: string;
    transformValue?: T;
    metadata?: Record<string, any>;
  }>;

  afterSet?<T>(
    key: string,
    value: T,
    cache: AnalyticsPromptCache,
  ): Promise<void>;
}

/**
 * Cache factory for creating configured cache instances
 */
export interface CacheFactory {
  createMemoryCache(config?: CacheConfig): AnalyticsPromptCache;
  createRedisCache(config: CacheConfig & { url: string }): AnalyticsPromptCache;
  createDiskCache(config: CacheConfig & { path: string }): AnalyticsPromptCache;
  createLayeredCache(
    l1: AnalyticsPromptCache,
    l2?: AnalyticsPromptCache,
    l3?: AnalyticsPromptCache,
  ): LayeredCache;
  createSemanticCache(
    config: CacheConfig & { embeddingModel: string },
  ): SemanticCache;
}

/**
 * Cache event types
 */
export type CacheEvent =
  | { type: "hit"; key: string; value: any; responseTime: number }
  | { type: "miss"; key: string; responseTime: number }
  | { type: "set"; key: string; value: any; size?: number }
  | { type: "delete"; key: string; reason: "manual" | "ttl" | "eviction" }
  | { type: "clear"; reason: string }
  | {
      type: "evict";
      key: string;
      value: any;
      reason: "size" | "ttl" | "manual";
    }
  | { type: "error"; operation: string; key?: string; error: Error };

/**
 * Cache event listener
 */
export interface CacheEventListener {
  onEvent(event: CacheEvent): void | Promise<void>;
}
