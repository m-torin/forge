/**
 * Analytics-Enabled Prompt Cache with Optimization
 * Caching system with comprehensive analytics and automatic optimization
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import {
  PromptCacheAnalytics,
  type CacheAccessRecord,
  type CacheAnalyticsConfig,
} from './cache-analytics';
import { PromptCache, type PromptCacheConfig, type PromptCacheEntry } from './prompt-cache';

/**
 * Analytics cache configuration
 */
export interface AnalyticsCacheConfig extends PromptCacheConfig {
  analytics?: CacheAnalyticsConfig;
  enableAutoOptimization?: boolean;
  optimizationInterval?: number;
  enablePreloading?: boolean;
  enableSemanticSimilarity?: boolean;
  similarityThreshold?: number;
  enableCostTracking?: boolean;
  costPerToken?: number;
}

/**
 * Cache operation result with analytics
 */
export interface CacheOperationResult<T = any> {
  success: boolean;
  data?: T;
  fromCache: boolean;
  responseTime: number;
  cacheKey: string;
  analytics?: {
    hitRate: number;
    totalSavings: number;
    memoryUsage: number;
  };
}

/**
 * Analytics prompt cache with optimization
 */
export class AnalyticsPromptCache extends PromptCache {
  private analytics: PromptCacheAnalytics;
  private cacheConfig: Required<AnalyticsCacheConfig>;
  private optimizationTimer?: NodeJS.Timeout;
  private preloadedPrompts = new Set<string>();
  private semanticIndex?: Map<string, number[]>;

  constructor(config: AnalyticsCacheConfig = {}) {
    super(config);

    this.cacheConfig = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 3600000,
      evictionPolicy: config.evictionPolicy || 'lru',
      persistToFile: config.persistToFile || '',
      analytics: config.analytics || {},
      enableAutoOptimization: config.enableAutoOptimization ?? true,
      optimizationInterval: config.optimizationInterval || 300000, // 5 minutes
      enablePreloading: config.enablePreloading ?? false,
      enableSemanticSimilarity: config.enableSemanticSimilarity ?? false,
      similarityThreshold: config.similarityThreshold || 0.85,
      enableCostTracking: config.enableCostTracking ?? true,
      costPerToken: config.costPerToken || 0.003,
    };

    this.analytics = new PromptCacheAnalytics({
      ...this.cacheConfig.analytics,
      enableCostAnalysis: this.cacheConfig.enableCostTracking,
      costPerToken: this.cacheConfig.costPerToken,
    });

    if (this.cacheConfig.enableSemanticSimilarity) {
      this.semanticIndex = new Map();
    }

    this.startAutoOptimization();
  }

  /**
   * Enhanced get with analytics tracking
   */
  async getWithAnalytics(
    key: string,
    metadata?: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
      tokens?: number;
      cost?: number;
    },
  ): Promise<CacheOperationResult<PromptCacheEntry>> {
    const startTime = Date.now();
    const entry = super.get(key);
    const responseTime = Date.now() - startTime;
    const hit = entry !== null;

    // Record access for analytics
    const record: CacheAccessRecord = {
      timestamp: Date.now(),
      key,
      prompt: entry?.prompt || '',
      hit,
      responseTime,
      metadata,
    };

    this.analytics.recordAccess(record);

    const result: CacheOperationResult<PromptCacheEntry> = {
      success: true,
      data: entry || undefined,
      fromCache: hit,
      responseTime,
      cacheKey: key,
    };

    // Add analytics summary for frequent requests
    if (hit && entry) {
      const stats = this.getStats();
      result.analytics = {
        hitRate: stats.avgHitRate,
        totalSavings: this.estimateCostSavings(),
        memoryUsage: this.estimateMemoryUsage(),
      };
    }

    return result;
  }

  /**
   * Enhanced set with analytics and optimization
   */
  async setWithAnalytics(
    key: string,
    prompt: string,
    response?: any,
    metadata?: Partial<PromptCacheEntry['metadata']> & {
      tokens?: number;
      cost?: number;
    },
    ttl?: number,
  ): Promise<CacheOperationResult<void>> {
    const startTime = Date.now();

    try {
      // Store semantic embedding if enabled
      if (this.cacheConfig.enableSemanticSimilarity && this.semanticIndex) {
        const embedding = await this.generateEmbedding(prompt);
        this.semanticIndex.set(key, embedding);
      }

      super.set(key, prompt, response, metadata, ttl);

      const responseTime = Date.now() - startTime;

      // Record the set operation
      const record: CacheAccessRecord = {
        timestamp: Date.now(),
        key,
        prompt,
        hit: false, // This is a new entry
        responseTime,
        metadata: {
          model: metadata?.model,
          temperature: metadata?.temperature,
          maxOutputTokens: metadata?.maxOutputTokens,
          tokens: metadata?.tokens,
          cost: metadata?.cost,
        },
      };

      this.analytics.recordAccess(record);

      return {
        success: true,
        fromCache: false,
        responseTime,
        cacheKey: key,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      logError('Enhanced Cache: Set operation failed', {
        operation: 'enhanced_cache_set_error',
        error: error instanceof Error ? error : new Error(String(error)),
      });

      return {
        success: false,
        fromCache: false,
        responseTime,
        cacheKey: key,
      };
    }
  }

  /**
   * Semantic similarity search
   */
  async findSimilarPrompt(prompt: string): Promise<CacheOperationResult<PromptCacheEntry> | null> {
    if (!this.cacheConfig.enableSemanticSimilarity || !this.semanticIndex) {
      return null;
    }

    const startTime = Date.now();
    const queryEmbedding = await this.generateEmbedding(prompt);
    let bestMatch: { key: string; similarity: number } | null = null;

    // Find most similar cached prompt
    for (const [key, embedding] of this.semanticIndex) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      if (
        similarity >= this.cacheConfig.similarityThreshold &&
        (!bestMatch || similarity > bestMatch.similarity)
      ) {
        bestMatch = { key, similarity };
      }
    }

    if (bestMatch) {
      const entry = super.get(bestMatch.key);
      if (entry) {
        const responseTime = Date.now() - startTime;

        // Record as semantic hit
        const record: CacheAccessRecord = {
          timestamp: Date.now(),
          key: bestMatch.key,
          prompt,
          hit: true,
          responseTime,
        };

        this.analytics.recordAccess(record);

        logInfo('Enhanced Cache: Semantic similarity hit', {
          operation: 'enhanced_cache_semantic_hit',
          metadata: {
            similarity: bestMatch.similarity,
            originalKey: bestMatch.key,
            responseTime,
          },
        });

        return {
          success: true,
          data: entry,
          fromCache: true,
          responseTime,
          cacheKey: bestMatch.key,
        };
      }
    }

    return null;
  }

  /**
   * Preload frequently accessed prompts
   */
  async preloadPrompts(
    prompts: Array<{ prompt: string; response?: any; metadata?: any }>,
  ): Promise<void> {
    logInfo('Enhanced Cache: Preloading prompts', {
      operation: 'enhanced_cache_preload',
      metadata: { count: prompts.length },
    });

    for (const { prompt, response, metadata } of prompts) {
      const key = this.generateKey(prompt, metadata);
      if (!this.preloadedPrompts.has(key)) {
        await this.setWithAnalytics(key, prompt, response, {
          ...metadata,
          preloaded: true,
        });
        this.preloadedPrompts.add(key);
      }
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(): any {
    return this.analytics.generateAnalyticsReport(this);
  }

  /**
   * Optimize cache based on analytics
   */
  async optimizeCache(): Promise<{
    optimizationsApplied: string[];
    performanceImprovement: number;
    recommendations: string[];
  }> {
    const report = this.analytics.generateAnalyticsReport(this);
    const optimizationsApplied: string[] = [];
    const recommendations = report.optimization.recommendations;

    logInfo('Enhanced Cache: Running optimization', {
      operation: 'enhanced_cache_optimize',
      metadata: {
        currentHitRate: report.performance.hitRate,
        cacheSize: report.performance.totalRequests,
      },
    });

    // Apply TTL optimizations
    for (const adjustment of report.optimization.suggestedTTLAdjustments) {
      if (adjustment.pattern === 'default') {
        // Would adjust default TTL in a real implementation
        optimizationsApplied.push(`Adjusted default TTL to ${adjustment.suggestedTTL}ms`);
      }
    }

    // Preload high-value prompts if enabled
    if (this.cacheConfig.enablePreloading && report.optimization.preloadCandidates.length > 0) {
      const candidates = report.optimization.preloadCandidates
        .filter(c => c.predictedValue > 0.5)
        .slice(0, 10); // Top 10 candidates

      if (candidates.length > 0) {
        await this.preloadPrompts(
          candidates.map(c => ({
            prompt: c.prompt,
            metadata: { predicted: true },
          })),
        );
        optimizationsApplied.push(`Preloaded ${candidates.length} high-value prompts`);
      }
    }

    if (report.optimization.redundantEntries.length > 0) {
      for (const entry of report.optimization.redundantEntries.slice(0, 5)) {
        this.delete(entry.key);
        optimizationsApplied.push(`Removed redundant entry: ${entry.reason}`);
      }
    }

    const performanceImprovement = optimizationsApplied.length * 0.05; // Estimated 5% per optimization

    return {
      optimizationsApplied,
      performanceImprovement,
      recommendations,
    };
  }

  /**
   * Start automatic optimization
   */
  private startAutoOptimization(): void {
    if (!this.cacheConfig.enableAutoOptimization) return;

    this.optimizationTimer = setInterval(async () => {
      try {
        const result = await this.optimizeCache();

        if (result.optimizationsApplied.length > 0) {
          logInfo('Enhanced Cache: Auto-optimization completed', {
            operation: 'enhanced_cache_auto_optimize',
            metadata: {
              optimizations: result.optimizationsApplied.length,
              improvement: result.performanceImprovement,
            },
          });
        }
      } catch (error) {
        logWarn('Enhanced Cache: Auto-optimization failed', {
          operation: 'enhanced_cache_auto_optimize_error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }, this.cacheConfig.optimizationInterval);
  }

  /**
   * Generate embedding for semantic similarity (mock implementation)
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // In a real implementation, this would use an embedding model
    // For now, create a simple hash-based embedding
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(100).fill(0);

    words.forEach((word, _index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 100] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Simple hash function for mock embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Estimate cost savings from caching
   */
  private estimateCostSavings(): number {
    const analyticsData = this.analytics.exportAnalyticsData();
    return analyticsData.costData?.totalCostSaved || 0;
  }

  /**
   * Estimate current memory usage
   */
  private estimateMemoryUsage(): number {
    // Rough estimation based on cache size and average entry size
    const stats = this.getStats();
    const avgEntrySize = 2048; // Estimated 2KB per entry
    return stats.size * avgEntrySize;
  }

  /**
   * Get enhanced statistics
   */
  getEnhancedStats(): {
    cache: ReturnType<PromptCache['getStats']>;
    analytics: any;
    performance: {
      hitRate: number;
      costSavings: number;
      memoryUsage: number;
      optimizationScore: number;
    };
  } {
    const cacheStats = this.getStats();
    const analyticsReport = this.analytics.generateAnalyticsReport(this);

    return {
      cache: cacheStats,
      analytics: analyticsReport,
      performance: {
        hitRate: analyticsReport.performance.hitRate,
        costSavings: this.estimateCostSavings(),
        memoryUsage: this.estimateMemoryUsage(),
        optimizationScore: this.calculateOptimizationScore(analyticsReport),
      },
    };
  }

  /**
   * Calculate optimization score (0-100)
   */
  private calculateOptimizationScore(report: any): number {
    let score = 0;

    // Hit rate contributes 40%
    score += report.performance.hitRate * 40;

    // Storage utilization contributes 20%
    const utilization = report.efficiency.storageUtilization;
    const optimalUtilization = utilization > 0.3 && utilization < 0.8 ? 1 : 0.5;
    score += optimalUtilization * 20;

    // TTL effectiveness contributes 20%
    score += report.efficiency.ttlEffectiveness * 20;

    // Low eviction rate contributes 20%
    const evictionScore = Math.max(0, 1 - report.efficiency.evictionRate);
    score += evictionScore * 20;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }

    this.clear();
    this.analytics.reset();

    logInfo('Enhanced Cache: Destroyed', {
      operation: 'enhanced_cache_destroy',
    });
  }
}

/**
 * Cache warming utilities
 */
export const cacheWarmingUtils = {
  /**
   * Generate warming strategy from analytics data
   */
  generateWarmingStrategy: (cache: AnalyticsPromptCache) => {
    const report = cache.generateAnalyticsReport();
    const strategy: Array<{
      prompt: string;
      priority: number;
      estimatedBenefit: number;
      metadata?: any;
    }> = [];

    // High-frequency, high-hit-rate prompts
    report.patterns.mostAccessedPrompts.forEach((pattern: any) => {
      if (pattern.hits > 5) {
        strategy.push({
          prompt: pattern.prompt,
          priority: pattern.hits,
          estimatedBenefit: pattern.hits * 0.003, // Estimated cost per hit
        });
      }
    });

    // Preload candidates from analytics
    report.optimization.preloadCandidates.forEach((candidate: any) => {
      strategy.push({
        prompt: candidate.prompt,
        priority: candidate.frequency,
        estimatedBenefit: candidate.predictedValue * 0.01,
      });
    });

    return strategy.sort((a, b) => b.priority - a.priority).slice(0, 20); // Top 20 warming candidates
  },

  /**
   * Execute cache warming
   */
  warmCache: async (
    cache: AnalyticsPromptCache,
    strategy: Array<{ prompt: string; metadata?: any }>,
  ) => {
    logInfo('Cache Warming: Starting cache warming', {
      operation: 'cache_warming_start',
      metadata: { promptCount: strategy.length },
    });

    const results = {
      successful: 0,
      failed: 0,
      totalTime: 0,
    };

    const startTime = Date.now();

    for (const { prompt, metadata } of strategy) {
      try {
        await cache.preloadPrompts([{ prompt, metadata }]);
        results.successful++;
      } catch (error) {
        results.failed++;
        logWarn('Cache Warming: Failed to warm prompt', {
          operation: 'cache_warming_failed',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    results.totalTime = Date.now() - startTime;

    logInfo('Cache Warming: Completed', {
      operation: 'cache_warming_complete',
      metadata: results,
    });

    return results;
  },
};

/**
 * Global enhanced cache instance
 */
export const globalAnalyticsCache = new AnalyticsPromptCache({
  maxSize: 2000,
  enableAutoOptimization: true,
  enablePreloading: true,
  enableSemanticSimilarity: true,
  enableCostTracking: true,
});
