/**
 * Prompt Cache Analytics and Optimization
 * Advanced analytics for prompt caching effectiveness and hit rate optimization
 */

import { logInfo } from '@repo/observability/server/next';
import type { PromptCache } from './prompt-cache';

/**
 * Cache analytics metrics
 */
export interface CacheAnalyticsMetrics {
  performance: {
    hitRate: number;
    missRate: number;
    totalRequests: number;
    totalHits: number;
    totalMisses: number;
    averageResponseTime: number;
    cacheResponseTime: number;
    uncachedResponseTime: number;
  };
  efficiency: {
    storageUtilization: number;
    evictionRate: number;
    ttlEffectiveness: number;
    memorySavings: number; // Estimated memory saved by caching
    costSavings: number; // Estimated cost savings
  };
  patterns: {
    mostAccessedPrompts: Array<{ key: string; hits: number; prompt: string }>;
    leastAccessedPrompts: Array<{ key: string; hits: number; prompt: string }>;
    hotspots: Array<{ pattern: string; frequency: number }>;
    temporalPatterns: Array<{ hour: number; requests: number; hitRate: number }>;
  };
  optimization: {
    recommendations: string[];
    suggestedTTLAdjustments: Array<{
      pattern: string;
      currentTTL: number;
      suggestedTTL: number;
      reason: string;
    }>;
    redundantEntries: Array<{ key: string; reason: string }>;
    preloadCandidates: Array<{ prompt: string; frequency: number; predictedValue: number }>;
  };
}

/**
 * Cache access record for analytics
 */
export interface CacheAccessRecord {
  timestamp: number;
  key: string;
  prompt: string;
  hit: boolean;
  responseTime: number;
  metadata?: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    tokens?: number;
    cost?: number;
  };
}

/**
 * Cache analytics configuration
 */
export interface CacheAnalyticsConfig {
  maxRecords?: number;
  enableTemporalAnalysis?: boolean;
  enablePatternDetection?: boolean;
  enableCostAnalysis?: boolean;
  costPerToken?: number;
  memoryEstimationEnabled?: boolean;
}

/**
 * Prompt cache analytics engine
 */
export class PromptCacheAnalytics {
  private accessRecords: CacheAccessRecord[] = [];
  private config: Required<CacheAnalyticsConfig>;
  private patternDetector: PromptPatternDetector;
  private costCalculator: CacheCostCalculator;
  private temporalAnalyzer: TemporalAccessAnalyzer;

  constructor(config: CacheAnalyticsConfig = {}) {
    this.config = {
      maxRecords: config.maxRecords || 10000,
      enableTemporalAnalysis: config.enableTemporalAnalysis ?? true,
      enablePatternDetection: config.enablePatternDetection ?? true,
      enableCostAnalysis: config.enableCostAnalysis ?? true,
      costPerToken: config.costPerToken || 0.003, // Default: $0.003 per token
      memoryEstimationEnabled: config.memoryEstimationEnabled ?? true,
      ...config,
    };

    this.patternDetector = new PromptPatternDetector();
    this.costCalculator = new CacheCostCalculator(this.config.costPerToken);
    this.temporalAnalyzer = new TemporalAccessAnalyzer();
  }

  /**
   * Record cache access for analytics
   */
  recordAccess(record: CacheAccessRecord): void {
    this.accessRecords.push(record);

    // Maintain record limit
    if (this.accessRecords.length > this.config.maxRecords) {
      this.accessRecords = this.accessRecords.slice(-this.config.maxRecords);
    }

    // Update pattern detection
    if (this.config.enablePatternDetection) {
      this.patternDetector.analyzePrompt(record.prompt, record.hit);
    }

    // Update temporal analysis
    if (this.config.enableTemporalAnalysis) {
      this.temporalAnalyzer.recordAccess(record.timestamp, record.hit);
    }

    // Update cost analysis
    if (this.config.enableCostAnalysis && record.metadata) {
      this.costCalculator.recordAccess(
        record.hit,
        record.metadata.tokens || 0,
        record.metadata.cost || 0,
      );
    }

    logInfo('Cache Analytics: Access recorded', {
      operation: 'cache_analytics_record_access',
      metadata: {
        hit: record.hit,
        responseTime: record.responseTime,
        promptLength: record.prompt.length,
      },
    });
  }

  /**
   * Generate comprehensive analytics report
   */
  generateAnalyticsReport(cache: PromptCache): CacheAnalyticsMetrics {
    const cacheStats = cache.getStats();
    const recentRecords = this.accessRecords.slice(-1000); // Last 1000 records

    const performance = this.calculatePerformanceMetrics(recentRecords, cacheStats);
    const efficiency = this.calculateEfficiencyMetrics(cache, recentRecords);
    const patterns = this.analyzePatterns(cache, recentRecords);
    const optimization = this.generateOptimizationRecommendations(cache, recentRecords);

    const report: CacheAnalyticsMetrics = {
      performance,
      efficiency,
      patterns,
      optimization,
    };

    logInfo('Cache Analytics: Report generated', {
      operation: 'cache_analytics_report_generated',
      metadata: {
        hitRate: performance.hitRate,
        totalRequests: performance.totalRequests,
        recommendationCount: optimization.recommendations.length,
      },
    });

    return report;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    records: CacheAccessRecord[],
    _cacheStats: any,
  ): CacheAnalyticsMetrics['performance'] {
    const totalRequests = records.length;
    const hits = records.filter(r => r.hit);
    const misses = records.filter(r => !r.hit);

    const hitRate = totalRequests > 0 ? hits.length / totalRequests : 0;
    const missRate = 1 - hitRate;

    const averageResponseTime =
      totalRequests > 0 ? records.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests : 0;

    const cacheResponseTime =
      hits.length > 0 ? hits.reduce((sum, r) => sum + r.responseTime, 0) / hits.length : 0;

    const uncachedResponseTime =
      misses.length > 0 ? misses.reduce((sum, r) => sum + r.responseTime, 0) / misses.length : 0;

    return {
      hitRate,
      missRate,
      totalRequests,
      totalHits: hits.length,
      totalMisses: misses.length,
      averageResponseTime,
      cacheResponseTime,
      uncachedResponseTime,
    };
  }

  /**
   * Calculate efficiency metrics
   */
  private calculateEfficiencyMetrics(
    cache: PromptCache,
    records: CacheAccessRecord[],
  ): CacheAnalyticsMetrics['efficiency'] {
    const cacheStats = cache.getStats();
    const hits = records.filter(r => r.hit);

    // Storage utilization (simulated)
    const maxSize = (cache as any).config?.maxSize || 1000;
    const storageUtilization = cacheStats.size / maxSize;

    // Eviction rate (would need tracking in cache)
    const evictionRate = 0; // Placeholder

    // TTL effectiveness (percentage of entries that expire naturally vs evicted)
    const ttlEffectiveness = 0.85; // Placeholder - would need TTL tracking

    // Memory savings (estimated)
    const avgPromptSize =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.prompt.length, 0) / records.length
        : 0;
    const memorySavings = hits.length * avgPromptSize * 2; // Estimate bytes saved

    // Cost savings (estimated)
    const avgTokensPerRequest =
      records.length > 0
        ? records.reduce((sum, r) => sum + (r.metadata?.tokens || 0), 0) / records.length
        : 0;
    const costSavings = hits.length * avgTokensPerRequest * this.config.costPerToken;

    return {
      storageUtilization,
      evictionRate,
      ttlEffectiveness,
      memorySavings,
      costSavings,
    };
  }

  /**
   * Analyze usage patterns
   */
  private analyzePatterns(
    cache: PromptCache,
    records: CacheAccessRecord[],
  ): CacheAnalyticsMetrics['patterns'] {
    // Most/least accessed prompts (simulated - would need cache internals)
    const promptHits = new Map<string, number>();
    records.forEach(r => {
      promptHits.set(r.key, (promptHits.get(r.key) || 0) + (r.hit ? 1 : 0));
    });

    const sortedPrompts = Array.from(promptHits.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([key, hits]) => {
        const record = records.find(r => r.key === key);
        return { key, hits, prompt: record?.prompt.substring(0, 100) || '' };
      });

    const mostAccessedPrompts = sortedPrompts.slice(0, 10);
    const leastAccessedPrompts = sortedPrompts.slice(-10).reverse();

    // Pattern detection
    const hotspots = this.config.enablePatternDetection ? this.patternDetector.getHotspots() : [];

    // Temporal patterns
    const temporalPatterns = this.config.enableTemporalAnalysis
      ? this.temporalAnalyzer.getHourlyPatterns()
      : [];

    return {
      mostAccessedPrompts,
      leastAccessedPrompts,
      hotspots,
      temporalPatterns,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    cache: PromptCache,
    records: CacheAccessRecord[],
  ): CacheAnalyticsMetrics['optimization'] {
    const recommendations: string[] = [];
    const suggestedTTLAdjustments: any[] = [];
    const redundantEntries: any[] = [];
    const preloadCandidates: any[] = [];

    const cacheStats = cache.getStats();
    const hitRate = cacheStats.avgHitRate;

    // Hit rate recommendations
    if (hitRate < 0.5) {
      recommendations.push(
        'Low hit rate detected. Consider increasing cache size or adjusting TTL values.',
      );
    } else if (hitRate > 0.9) {
      recommendations.push('Very high hit rate. Consider reducing cache size to save memory.');
    }

    // Storage utilization recommendations
    const maxSize = (cache as any).config?.maxSize || 1000;
    const utilization = cacheStats.size / maxSize;

    if (utilization > 0.9) {
      recommendations.push(
        'Cache is nearly full. Consider increasing maxSize or implementing more aggressive eviction.',
      );
    } else if (utilization < 0.3) {
      recommendations.push('Cache is underutilized. Consider reducing maxSize to save memory.');
    }

    // TTL optimization
    const avgAccessInterval = this.calculateAverageAccessInterval(records);
    if (avgAccessInterval > 0) {
      const optimalTTL = avgAccessInterval * 2; // Heuristic: 2x average access interval
      const currentTTL = (cache as any).config?.defaultTTL || 3600000;

      if (Math.abs(optimalTTL - currentTTL) > currentTTL * 0.3) {
        suggestedTTLAdjustments.push({
          pattern: 'default',
          currentTTL,
          suggestedTTL: optimalTTL,
          reason: `Based on access patterns, optimal TTL is ~${Math.round(optimalTTL / 1000)}s`,
        });
      }
    }

    // Preload candidates (frequently accessed patterns)
    const frequentPatterns = this.patternDetector.getFrequentPatterns();
    frequentPatterns.forEach(pattern => {
      if (pattern.frequency > 10) {
        preloadCandidates.push({
          prompt: pattern.pattern,
          frequency: pattern.frequency,
          predictedValue: pattern.frequency * 0.8, // Heuristic prediction score
        });
      }
    });

    // Redundant entries detection (similar prompts with different keys)
    // This would require semantic analysis in a real implementation

    return {
      recommendations,
      suggestedTTLAdjustments,
      redundantEntries,
      preloadCandidates,
    };
  }

  /**
   * Calculate average access interval for prompts
   */
  private calculateAverageAccessInterval(records: CacheAccessRecord[]): number {
    const promptAccesses = new Map<string, number[]>();

    records.forEach(record => {
      if (!promptAccesses.has(record.key)) {
        promptAccesses.set(record.key, []);
      }
      const accesses = promptAccesses.get(record.key);
      if (accesses) accesses.push(record.timestamp);
    });

    let totalInterval = 0;
    let intervalCount = 0;

    promptAccesses.forEach(timestamps => {
      if (timestamps.length > 1) {
        for (let i = 1; i < timestamps.length; i++) {
          totalInterval += timestamps[i] - timestamps[i - 1];
          intervalCount++;
        }
      }
    });

    return intervalCount > 0 ? totalInterval / intervalCount : 0;
  }

  /**
   * Export analytics data
   */
  exportAnalyticsData(): {
    accessRecords: CacheAccessRecord[];
    patterns: any;
    temporalData: any;
    costData: any;
  } {
    return {
      accessRecords: [...this.accessRecords],
      patterns: this.patternDetector.exportData(),
      temporalData: this.temporalAnalyzer.exportData(),
      costData: this.costCalculator.exportData(),
    };
  }

  /**
   * Reset analytics data
   */
  reset(): void {
    this.accessRecords = [];
    this.patternDetector.reset();
    this.temporalAnalyzer.reset();
    this.costCalculator.reset();

    logInfo('Cache Analytics: Data reset', {
      operation: 'cache_analytics_reset',
    });
  }
}

/**
 * Pattern detection for prompt analysis
 */
class PromptPatternDetector {
  private patterns = new Map<string, { count: number; hitRate: number; hits: number }>();
  private frequentTokens = new Map<string, number>();

  analyzePrompt(prompt: string, hit: boolean): void {
    // Extract simple patterns (first 50 characters)
    const pattern = prompt.substring(0, 50);
    const current = this.patterns.get(pattern) || { count: 0, hitRate: 0, hits: 0 };

    current.count++;
    if (hit) current.hits++;
    current.hitRate = current.hits / current.count;

    this.patterns.set(pattern, current);

    // Analyze tokens
    const tokens = prompt
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 3);
    tokens.forEach(token => {
      this.frequentTokens.set(token, (this.frequentTokens.get(token) || 0) + 1);
    });
  }

  getHotspots(): Array<{ pattern: string; frequency: number }> {
    return Array.from(this.patterns.entries())
      .filter(([_, data]) => data.count > 5)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([pattern, data]) => ({ pattern, frequency: data.count }));
  }

  getFrequentPatterns(): Array<{ pattern: string; frequency: number; hitRate: number }> {
    return Array.from(this.patterns.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        hitRate: data.hitRate,
      }));
  }

  exportData(): any {
    return {
      patterns: Object.fromEntries(this.patterns),
      frequentTokens: Object.fromEntries(this.frequentTokens),
    };
  }

  reset(): void {
    this.patterns.clear();
    this.frequentTokens.clear();
  }
}

/**
 * Temporal access pattern analysis
 */
class TemporalAccessAnalyzer {
  private hourlyData = new Map<number, { requests: number; hits: number }>();
  private dailyData = new Map<string, { requests: number; hits: number }>();

  recordAccess(timestamp: number, hit: boolean): void {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const day = date.toDateString();

    // Hourly data
    const hourlyStats = this.hourlyData.get(hour) || { requests: 0, hits: 0 };
    hourlyStats.requests++;
    if (hit) hourlyStats.hits++;
    this.hourlyData.set(hour, hourlyStats);

    // Daily data
    const dailyStats = this.dailyData.get(day) || { requests: 0, hits: 0 };
    dailyStats.requests++;
    if (hit) dailyStats.hits++;
    this.dailyData.set(day, dailyStats);
  }

  getHourlyPatterns(): Array<{ hour: number; requests: number; hitRate: number }> {
    return Array.from(this.hourlyData.entries())
      .map(([hour, data]) => ({
        hour,
        requests: data.requests,
        hitRate: data.requests > 0 ? data.hits / data.requests : 0,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  exportData(): any {
    return {
      hourlyData: Object.fromEntries(this.hourlyData),
      dailyData: Object.fromEntries(this.dailyData),
    };
  }

  reset(): void {
    this.hourlyData.clear();
    this.dailyData.clear();
  }
}

/**
 * Cost analysis for cache effectiveness
 */
class CacheCostCalculator {
  private totalCostSaved = 0;
  private totalTokensSaved = 0;
  private totalRequests = 0;
  private costPerToken: number;

  constructor(costPerToken: number) {
    this.costPerToken = costPerToken;
  }

  recordAccess(hit: boolean, tokens: number, cost: number): void {
    this.totalRequests++;

    if (hit) {
      this.totalTokensSaved += tokens;
      this.totalCostSaved += cost || tokens * this.costPerToken;
    }
  }

  exportData(): any {
    return {
      totalCostSaved: this.totalCostSaved,
      totalTokensSaved: this.totalTokensSaved,
      totalRequests: this.totalRequests,
      averageCostSavingPerHit:
        this.totalRequests > 0 ? this.totalCostSaved / this.totalRequests : 0,
    };
  }

  reset(): void {
    this.totalCostSaved = 0;
    this.totalTokensSaved = 0;
    this.totalRequests = 0;
  }
}

/**
 * Enhanced prompt cache with analytics integration
 */
export function createAnalyticsEnabledCache(
  cacheConfig?: any,
  analyticsConfig?: CacheAnalyticsConfig,
) {
  const analytics = new PromptCacheAnalytics(analyticsConfig);

  // This would wrap the existing PromptCache class with analytics
  // In a real implementation, we'd extend or wrap the PromptCache class

  return {
    analytics,
    // Would include wrapped cache methods here
  };
}

/**
 * Cache optimization utilities
 */
export const cacheOptimizationUtils = {
  /**
   * Analyze cache performance and suggest optimizations
   */
  optimizeCache: async (cache: PromptCache, analytics: PromptCacheAnalytics) => {
    const report = analytics.generateAnalyticsReport(cache);
    const optimizations: string[] = [];

    // Implement optimization suggestions
    report.optimization.recommendations.forEach(rec => {
      optimizations.push(rec);
    });

    // Apply TTL adjustments
    report.optimization.suggestedTTLAdjustments.forEach(adjustment => {
      optimizations.push(`Consider adjusting TTL for ${adjustment.pattern}: ${adjustment.reason}`);
    });

    return {
      report,
      optimizations,
      applied: [], // Would contain actual applied optimizations
    };
  },

  /**
   * Generate cache warming strategy
   */
  generateWarmingStrategy: (analytics: PromptCacheAnalytics) => {
    const data = analytics.exportAnalyticsData();
    const strategy: Array<{ prompt: string; priority: number; estimatedValue: number }> = [];

    // Analyze patterns to determine warming candidates
    data.patterns?.patterns &&
      Object.entries(data.patterns.patterns).forEach(([pattern, stats]: [string, any]) => {
        if (stats.count > 5 && stats.hitRate > 0.7) {
          strategy.push({
            prompt: pattern,
            priority: stats.count * stats.hitRate,
            estimatedValue: stats.count * 0.8, // Heuristic value calculation
          });
        }
      });

    return strategy.sort((a, b) => b.priority - a.priority);
  },

  /**
   * Calculate ROI of caching
   */
  calculateCacheROI: (analytics: PromptCacheAnalytics) => {
    const data = analytics.exportAnalyticsData();
    const costData = data.costData;

    if (!costData) {
      return { roi: 0, details: 'Cost tracking not enabled' };
    }

    const totalSavings = costData.totalCostSaved || 0;
    const cachingOverhead = 0.001; // Estimated overhead cost per request
    const totalOverhead = (costData.totalRequests || 0) * cachingOverhead;

    const roi = totalOverhead > 0 ? (totalSavings - totalOverhead) / totalOverhead : 0;

    return {
      roi,
      totalSavings,
      totalOverhead,
      netBenefit: totalSavings - totalOverhead,
      details: `Cache ROI: ${(roi * 100).toFixed(1)}%`,
    };
  },
};
