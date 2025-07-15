/**
 * Prompt Cache Benchmarking Suite
 * Comprehensive benchmarks to test and optimize prompt caching effectiveness
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { EnhancedPromptCache, type EnhancedCacheConfig } from './enhanced-prompt-cache';

/**
 * Benchmark test configuration
 */
export interface BenchmarkConfig {
  testSuites: BenchmarkTestSuite[];
  warmupRequests?: number;
  testRequests?: number;
  concurrentUsers?: number;
  randomSeed?: number;
}

/**
 * Individual benchmark test suite
 */
export interface BenchmarkTestSuite {
  name: string;
  description: string;
  cacheConfig: EnhancedCacheConfig;
  testScenario: BenchmarkScenario;
  expectedMetrics?: {
    minHitRate?: number;
    maxResponseTime?: number;
    maxMemoryUsage?: number;
  };
}

/**
 * Benchmark scenario types
 */
export type BenchmarkScenario =
  | 'high-frequency-repeated'
  | 'low-frequency-diverse'
  | 'mixed-patterns'
  | 'temporal-patterns'
  | 'semantic-similarity'
  | 'memory-pressure'
  | 'concurrent-access';

/**
 * Benchmark results
 */
export interface BenchmarkResults {
  testSuite: string;
  scenario: BenchmarkScenario;
  performance: {
    totalRequests: number;
    hitRate: number;
    missRate: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughputPerSecond: number;
  };
  resource: {
    memoryUsage: {
      baseline: number;
      peak: number;
      average: number;
    };
    cacheSize: {
      entries: number;
      estimatedBytes: number;
    };
    evictions: number;
  };
  cost: {
    totalCostSavings: number;
    costPerRequest: number;
    roi: number;
  };
  quality: {
    semanticHits?: number;
    falsePositives?: number;
    dataFreshness: number;
  };
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

/**
 * Prompt cache benchmark runner
 */
export class PromptCacheBenchmarkRunner {
  private random: () => number;

  constructor(seed: number = Date.now()) {
    this.random = this.createSeededRandom(seed);
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmarks(config: BenchmarkConfig): Promise<BenchmarkResults[]> {
    const results: BenchmarkResults[] = [];

    logInfo('Cache Benchmarks: Starting benchmark suite', {
      operation: 'cache_benchmarks_start',
      metadata: {
        testSuites: config.testSuites.length,
        testRequests: config.testRequests || 1000,
        concurrentUsers: config.concurrentUsers || 1,
      },
    });

    for (const testSuite of config.testSuites) {
      try {
        const result = await this.runSingleBenchmark(testSuite, config);
        results.push(result);

        logInfo(`Cache Benchmarks: Completed ${testSuite.name}`, {
          operation: 'cache_benchmark_complete',
          metadata: {
            passed: result.passed,
            hitRate: result.performance.hitRate,
            avgResponseTime: result.performance.averageResponseTime,
          },
        });
      } catch (error) {
        logWarn(`Cache Benchmarks: Failed ${testSuite.name}`, {
          operation: 'cache_benchmark_error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    return results;
  }

  /**
   * Run a single benchmark test
   */
  private async runSingleBenchmark(
    testSuite: BenchmarkTestSuite,
    config: BenchmarkConfig,
  ): Promise<BenchmarkResults> {
    const cache = new EnhancedPromptCache(testSuite.cacheConfig);
    const testRequests = config.testRequests || 1000;
    const warmupRequests = config.warmupRequests || 100;
    const concurrentUsers = config.concurrentUsers || 1;

    // Generate test data
    const testData = this.generateTestData(testSuite.testScenario, testRequests + warmupRequests);

    // Warmup phase
    await this.runWarmup(cache, testData.slice(0, warmupRequests));

    // Reset analytics after warmup
    const baselineMemory = this.getMemoryUsage();
    const startTime = Date.now();

    // Main benchmark phase
    const responseData = await this.runTestPhase(
      cache,
      testData.slice(warmupRequests),
      concurrentUsers,
    );

    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Collect results
    const cacheStats = cache.getEnhancedStats();
    const analyticsReport = cache.generateAnalyticsReport();

    const result: BenchmarkResults = {
      testSuite: testSuite.name,
      scenario: testSuite.testScenario,
      performance: this.calculatePerformanceMetrics(responseData, totalDuration),
      resource: this.calculateResourceMetrics(cacheStats, baselineMemory),
      cost: this.calculateCostMetrics(analyticsReport),
      quality: this.calculateQualityMetrics(responseData, cacheStats),
      passed: this.evaluateTestSuccess(testSuite, responseData, cacheStats),
      issues: this.identifyIssues(testSuite, responseData, cacheStats),
      recommendations: this.generateRecommendations(responseData, cacheStats),
    };

    // Cleanup
    cache.destroy();

    return result;
  }

  /**
   * Generate test data for different scenarios
   */
  private generateTestData(
    scenario: BenchmarkScenario,
    count: number,
  ): Array<{
    prompt: string;
    metadata?: any;
    expectedFromCache?: boolean;
  }> {
    const testData: Array<{ prompt: string; metadata?: any; expectedFromCache?: boolean }> = [];

    switch (scenario) {
      case 'high-frequency-repeated':
        // 20% unique prompts, 80% repetitions
        const uniquePrompts = Math.floor(count * 0.2);
        const basePrompts = Array.from(
          { length: uniquePrompts },
          (_, i) =>
            `Analyze the performance metrics for system ${i + 1} and provide detailed insights.`,
        );

        for (let i = 0; i < count; i++) {
          const promptIndex = i < uniquePrompts ? i : Math.floor(this.random() * uniquePrompts);
          testData.push({
            prompt: basePrompts[promptIndex],
            expectedFromCache: i >= uniquePrompts,
          });
        }
        break;

      case 'low-frequency-diverse':
        // 95% unique prompts, 5% repetitions
        for (let i = 0; i < count; i++) {
          const isRepeat = this.random() < 0.05 && i > 20;
          const prompt = isRepeat
            ? testData[Math.floor(this.random() * Math.min(i, 20))].prompt
            : `Generate unique analysis for dataset ${i}_${Math.random().toString(36).substring(7)}`;

          testData.push({
            prompt,
            expectedFromCache: isRepeat,
          });
        }
        break;

      case 'mixed-patterns':
        // Mix of patterns with temporal clustering
        for (let i = 0; i < count; i++) {
          const clusterSize = 10;
          const cluster = Math.floor(i / clusterSize);
          const withinCluster = i % clusterSize;

          let prompt: string;
          let expectedFromCache = false;

          if (withinCluster < 3) {
            // New prompt within cluster
            prompt = `Cluster ${cluster} analysis task ${withinCluster}: ${Math.random().toString(36)}`;
          } else {
            // Repeat from earlier in cluster
            const repeatIndex = Math.floor(this.random() * 3);
            prompt = `Cluster ${cluster} analysis task ${repeatIndex}: ${Math.random().toString(36)}`;
            expectedFromCache = true;
          }

          testData.push({ prompt, expectedFromCache });
        }
        break;

      case 'semantic-similarity':
        // Similar prompts that should trigger semantic matching
        const templates = [
          'Analyze the {metric} for {system} and provide {detail} insights',
          'Review the {metric} of {system} and give {detail} analysis',
          'Examine the {metric} in {system} and deliver {detail} report',
        ];

        const metrics = ['performance', 'efficiency', 'reliability', 'scalability'];
        const systems = ['database', 'API', 'frontend', 'cache'];
        const details = ['detailed', 'comprehensive', 'thorough', 'in-depth'];

        for (let i = 0; i < count; i++) {
          const template = templates[Math.floor(this.random() * templates.length)];
          const metric = metrics[Math.floor(this.random() * metrics.length)];
          const system = systems[Math.floor(this.random() * systems.length)];
          const detail = details[Math.floor(this.random() * details.length)];

          const prompt = template
            .replace('{metric}', metric)
            .replace('{system}', system)
            .replace('{detail}', detail);

          testData.push({
            prompt,
            expectedFromCache: i > 50 && this.random() < 0.3, // 30% semantic similarity expected
          });
        }
        break;

      case 'temporal-patterns':
        // Patterns that vary by time of day simulation
        for (let i = 0; i < count; i++) {
          const hour = Math.floor((i / count) * 24); // Simulate 24 hours
          const isBusinessHours = hour >= 9 && hour <= 17;

          let prompt: string;
          if (isBusinessHours) {
            // Business queries during work hours
            prompt = `Business analysis for hour ${hour}: quarterly report ${Math.floor(i / 10)}`;
          } else {
            // System maintenance queries outside hours
            prompt = `System maintenance task for hour ${hour}: backup ${Math.floor(i / 20)}`;
          }

          testData.push({
            prompt,
            metadata: { hour },
            expectedFromCache: i > 100 && this.random() < 0.4,
          });
        }
        break;

      case 'memory-pressure':
        // Large prompts to test memory handling
        for (let i = 0; i < count; i++) {
          const largeContent = 'A'.repeat(1000 + Math.floor(this.random() * 4000)); // 1-5KB prompts
          const prompt = `Process this large dataset: ${largeContent} - Analysis ${i}`;

          testData.push({
            prompt,
            expectedFromCache: i > 50 && this.random() < 0.2,
          });
        }
        break;

      case 'concurrent-access':
        // Prompts designed for concurrent access testing
        for (let i = 0; i < count; i++) {
          const sharedKey = Math.floor(i / 5); // Groups of 5 share the same prompt
          const prompt = `Concurrent analysis task ${sharedKey} with parameters ${i % 5}`;

          testData.push({
            prompt,
            expectedFromCache: i % 5 > 0, // First in group is new, others should hit cache
          });
        }
        break;

      default:
        // Default: simple repeated pattern
        for (let i = 0; i < count; i++) {
          testData.push({
            prompt: `Default test prompt ${i % 100}`,
            expectedFromCache: i >= 100,
          });
        }
    }

    return testData;
  }

  /**
   * Run warmup phase
   */
  private async runWarmup(
    cache: EnhancedPromptCache,
    warmupData: Array<{ prompt: string; metadata?: any }>,
  ): Promise<void> {
    for (const { prompt, metadata } of warmupData) {
      const key = cache.generateKey(prompt, metadata);
      await cache.setWithAnalytics(key, prompt, `Response for: ${prompt}`, {
        ...metadata,
        tokens: 100 + Math.floor(Math.random() * 200),
        cost: 0.003 * (100 + Math.floor(Math.random() * 200)),
      });
    }
  }

  /**
   * Run main test phase
   */
  private async runTestPhase(
    cache: EnhancedPromptCache,
    testData: Array<{ prompt: string; metadata?: any; expectedFromCache?: boolean }>,
    concurrentUsers: number,
  ): Promise<
    Array<{
      responseTime: number;
      fromCache: boolean;
      expectedFromCache: boolean;
      success: boolean;
    }>
  > {
    const responseData: Array<{
      responseTime: number;
      fromCache: boolean;
      expectedFromCache: boolean;
      success: boolean;
    }> = [];

    if (concurrentUsers === 1) {
      // Sequential execution
      for (const { prompt, metadata, expectedFromCache } of testData) {
        const key = cache.generateKey(prompt, metadata);
        const result = await cache.getWithAnalytics(key, metadata);

        responseData.push({
          responseTime: result.responseTime,
          fromCache: result.fromCache,
          expectedFromCache: expectedFromCache || false,
          success: result.success,
        });
      }
    } else {
      // Concurrent execution
      const chunks = this.chunkArray(testData, Math.ceil(testData.length / concurrentUsers));
      const promises = chunks.map(async chunk => {
        const chunkResults: Array<{
          responseTime: number;
          fromCache: boolean;
          expectedFromCache: boolean;
          success: boolean;
        }> = [];

        for (const { prompt, metadata, expectedFromCache } of chunk) {
          const key = cache.generateKey(prompt, metadata);
          const result = await cache.getWithAnalytics(key, metadata);

          chunkResults.push({
            responseTime: result.responseTime,
            fromCache: result.fromCache,
            expectedFromCache: expectedFromCache || false,
            success: result.success,
          });
        }

        return chunkResults;
      });

      const results = await Promise.all(promises);
      responseData.push(...results.flat());
    }

    return responseData;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    responseData: Array<{ responseTime: number; fromCache: boolean; success: boolean }>,
    totalDuration: number,
  ) {
    const successful = responseData.filter(r => r.success);
    const hits = successful.filter(r => r.fromCache);
    const responseTimes = successful.map(r => r.responseTime).sort((a, b) => a - b);

    return {
      totalRequests: responseData.length,
      hitRate: successful.length > 0 ? hits.length / successful.length : 0,
      missRate: successful.length > 0 ? (successful.length - hits.length) / successful.length : 0,
      averageResponseTime:
        responseTimes.length > 0
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          : 0,
      p95ResponseTime:
        responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] : 0,
      p99ResponseTime:
        responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.99)] : 0,
      throughputPerSecond: totalDuration > 0 ? (responseData.length / totalDuration) * 1000 : 0,
    };
  }

  /**
   * Calculate resource metrics
   */
  private calculateResourceMetrics(cacheStats: any, baselineMemory: number) {
    const currentMemory = this.getMemoryUsage();

    return {
      memoryUsage: {
        baseline: baselineMemory,
        peak: currentMemory,
        average: (baselineMemory + currentMemory) / 2,
      },
      cacheSize: {
        entries: cacheStats.cache.size,
        estimatedBytes: cacheStats.performance.memoryUsage,
      },
      evictions: cacheStats.cache.evictions || 0,
    };
  }

  /**
   * Calculate cost metrics
   */
  private calculateCostMetrics(analyticsReport: any) {
    return {
      totalCostSavings: analyticsReport.efficiency.costSavings || 0,
      costPerRequest:
        analyticsReport.performance.totalRequests > 0
          ? (analyticsReport.efficiency.costSavings || 0) /
            analyticsReport.performance.totalRequests
          : 0,
      roi: 1.5, // Placeholder - would calculate based on actual costs
    };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    responseData: Array<{ fromCache: boolean; expectedFromCache: boolean }>,
    cacheStats: any,
  ) {
    const semanticHits = responseData.filter(r => r.fromCache && !r.expectedFromCache).length;
    const falsePositives = responseData.filter(r => !r.fromCache && r.expectedFromCache).length;

    return {
      semanticHits,
      falsePositives,
      dataFreshness: 0.9, // Placeholder - would calculate based on TTL and access patterns
    };
  }

  /**
   * Evaluate if test passed
   */
  private evaluateTestSuccess(
    testSuite: BenchmarkTestSuite,
    responseData: Array<{ responseTime: number; fromCache: boolean; success: boolean }>,
    cacheStats: any,
  ): boolean {
    const expectations = testSuite.expectedMetrics;
    if (!expectations) return true;

    const hitRate =
      responseData.length > 0
        ? responseData.filter(r => r.fromCache).length / responseData.length
        : 0;

    const avgResponseTime =
      responseData.length > 0
        ? responseData.reduce((sum, r) => sum + r.responseTime, 0) / responseData.length
        : 0;

    const issues: boolean[] = [];

    if (expectations.minHitRate && hitRate < expectations.minHitRate) {
      issues.push(false);
    }

    if (expectations.maxResponseTime && avgResponseTime > expectations.maxResponseTime) {
      issues.push(false);
    }

    if (
      expectations.maxMemoryUsage &&
      cacheStats.performance.memoryUsage > expectations.maxMemoryUsage
    ) {
      issues.push(false);
    }

    return issues.length === 0;
  }

  /**
   * Identify specific issues
   */
  private identifyIssues(
    testSuite: BenchmarkTestSuite,
    responseData: Array<{ responseTime: number; fromCache: boolean; success: boolean }>,
    cacheStats: any,
  ): string[] {
    const issues: string[] = [];
    const expectations = testSuite.expectedMetrics;

    if (!expectations) return issues;

    const hitRate =
      responseData.length > 0
        ? responseData.filter(r => r.fromCache).length / responseData.length
        : 0;

    const avgResponseTime =
      responseData.length > 0
        ? responseData.reduce((sum, r) => sum + r.responseTime, 0) / responseData.length
        : 0;

    if (expectations.minHitRate && hitRate < expectations.minHitRate) {
      issues.push(
        `Hit rate ${(hitRate * 100).toFixed(1)}% below expected ${(expectations.minHitRate * 100).toFixed(1)}%`,
      );
    }

    if (expectations.maxResponseTime && avgResponseTime > expectations.maxResponseTime) {
      issues.push(
        `Average response time ${avgResponseTime.toFixed(2)}ms exceeds limit ${expectations.maxResponseTime}ms`,
      );
    }

    if (
      expectations.maxMemoryUsage &&
      cacheStats.performance.memoryUsage > expectations.maxMemoryUsage
    ) {
      issues.push(
        `Memory usage ${cacheStats.performance.memoryUsage} exceeds limit ${expectations.maxMemoryUsage}`,
      );
    }

    const errorRate =
      responseData.length > 0
        ? responseData.filter(r => !r.success).length / responseData.length
        : 0;

    if (errorRate > 0.05) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    return issues;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    responseData: Array<{ responseTime: number; fromCache: boolean; success: boolean }>,
    cacheStats: any,
  ): string[] {
    const recommendations: string[] = [];

    const hitRate =
      responseData.length > 0
        ? responseData.filter(r => r.fromCache).length / responseData.length
        : 0;

    if (hitRate < 0.5) {
      recommendations.push(
        'Consider increasing cache size or adjusting TTL values to improve hit rate',
      );
    }

    if (cacheStats.performance.memoryUsage > 100 * 1024 * 1024) {
      // 100MB
      recommendations.push(
        'High memory usage detected - consider implementing memory limits or compression',
      );
    }

    const avgResponseTime =
      responseData.length > 0
        ? responseData.reduce((sum, r) => sum + r.responseTime, 0) / responseData.length
        : 0;

    if (avgResponseTime > 10) {
      recommendations.push('High response times - consider optimizing cache lookup performance');
    }

    return recommendations;
  }

  /**
   * Utility methods
   */
  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 1664525 + 1013904223) % 2 ** 32;
      return state / 2 ** 32;
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }
}

/**
 * Predefined benchmark configurations
 */
export const benchmarkConfigs = {
  /**
   * Comprehensive performance test
   */
  comprehensive: (): BenchmarkConfig => ({
    testSuites: [
      {
        name: 'High Frequency Repeated Access',
        description: 'Tests cache effectiveness with repeated access patterns',
        cacheConfig: {
          maxSize: 1000,
          defaultTTL: 300000, // 5 minutes
          evictionPolicy: 'lru',
          enableAutoOptimization: true,
        },
        testScenario: 'high-frequency-repeated',
        expectedMetrics: {
          minHitRate: 0.8,
          maxResponseTime: 5,
          maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        },
      },
      {
        name: 'Semantic Similarity',
        description: 'Tests semantic matching capabilities',
        cacheConfig: {
          maxSize: 500,
          enableSemanticSimilarity: true,
          similarityThreshold: 0.85,
        },
        testScenario: 'semantic-similarity',
        expectedMetrics: {
          minHitRate: 0.6,
          maxResponseTime: 10,
        },
      },
      {
        name: 'Memory Pressure',
        description: 'Tests behavior under memory constraints',
        cacheConfig: {
          maxSize: 100,
          defaultTTL: 60000, // 1 minute
          evictionPolicy: 'lfu',
        },
        testScenario: 'memory-pressure',
        expectedMetrics: {
          minHitRate: 0.3,
          maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        },
      },
    ],
    warmupRequests: 100,
    testRequests: 1000,
    concurrentUsers: 1,
  }),

  /**
   * Performance stress test
   */
  stress: (): BenchmarkConfig => ({
    testSuites: [
      {
        name: 'Concurrent Access Stress',
        description: 'Tests cache under high concurrent load',
        cacheConfig: {
          maxSize: 2000,
          enableAutoOptimization: false, // Disable to avoid interference
        },
        testScenario: 'concurrent-access',
        expectedMetrics: {
          minHitRate: 0.7,
          maxResponseTime: 20,
        },
      },
    ],
    warmupRequests: 200,
    testRequests: 5000,
    concurrentUsers: 10,
  }),

  /**
   * Memory efficiency test
   */
  memory: (): BenchmarkConfig => ({
    testSuites: [
      {
        name: 'Memory Efficiency',
        description: 'Optimizes for memory usage',
        cacheConfig: {
          maxSize: 500,
          evictionPolicy: 'lfu',
          enableAutoOptimization: true,
        },
        testScenario: 'mixed-patterns',
        expectedMetrics: {
          maxMemoryUsage: 25 * 1024 * 1024, // 25MB
        },
      },
    ],
    warmupRequests: 50,
    testRequests: 2000,
    concurrentUsers: 1,
  }),
};
