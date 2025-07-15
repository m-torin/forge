/**
 * Optimized Step Conditions Tests
 * Testing performance-optimized condition evaluation and caching
 */

import '@repo/qa/vitest/setup/next-app';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
import {
  conditionOptimizationUtils,
  OptimizedConditionFactory,
  type PerformanceOptimizedCondition,
} from '../../../src/server/agents/optimized-conditions';

describe('optimizedConditionFactory', () => {
  let factory: OptimizedConditionFactory;

  beforeEach(() => {
    factory = new OptimizedConditionFactory({
      enableCaching: true,
      enableParallelization: true,
      cacheTTL: 5000,
      maxCacheSize: 100,
    });
  });

  afterEach(() => {
    factory.destroy();
  });

  describe('basic Condition Evaluation', () => {
    test('should evaluate simple conditions correctly', async () => {
      const condition: PerformanceOptimizedCondition = {
        id: 'simple-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async context => {
          return context.data.value > 10;
        },
        optimizationHints: {
          cacheable: false,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const context = { data: { value: 15 }, metadata: {} };
      const result = await factory.evaluateCondition(condition, context);

      expect(result.success).toBeTruthy();
      expect(result.result).toBeTruthy();
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.fromCache).toBeFalsy();
    });

    test('should handle condition evaluation errors', async () => {
      const condition: PerformanceOptimizedCondition = {
        id: 'error-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async () => {
          throw new Error('Condition evaluation failed');
        },
        optimizationHints: {
          cacheable: false,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const context = { data: {}, metadata: {} };
      const result = await factory.evaluateCondition(condition, context);

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Condition evaluation failed');
      expect(result.result).toBeFalsy();
    });
  });

  describe('condition Caching', () => {
    test('should cache condition results when cacheable', async () => {
      const evaluatorSpy = vi.fn().mockResolvedValue(true);

      const condition: PerformanceOptimizedCondition = {
        id: 'cacheable-condition',
        type: 'performance_optimized',
        complexity: 'medium',
        evaluator: evaluatorSpy,
        cacheKey: context => `cache-key-${context.data.id}`,
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const context = { data: { id: 'test-123' }, metadata: {} };

      // First evaluation
      const result1 = await factory.evaluateCondition(condition, context);
      expect(result1.success).toBeTruthy();
      expect(result1.result).toBeTruthy();
      expect(result1.fromCache).toBeFalsy();
      expect(evaluatorSpy).toHaveBeenCalledTimes(1);

      // Second evaluation - should use cache
      const result2 = await factory.evaluateCondition(condition, context);
      expect(result2.success).toBeTruthy();
      expect(result2.result).toBeTruthy();
      expect(result2.fromCache).toBeTruthy();
      expect(evaluatorSpy).toHaveBeenCalledTimes(1); // No additional calls
    });

    test('should respect cache TTL', async () => {
      const shortTTLFactory = new OptimizedConditionFactory({
        enableCaching: true,
        cacheTTL: 50, // 50ms TTL
      });

      const evaluatorSpy = vi.fn().mockResolvedValue(true);

      const condition: PerformanceOptimizedCondition = {
        id: 'ttl-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: evaluatorSpy,
        cacheKey: () => 'ttl-test',
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const context = { data: {}, metadata: {} };

      // First evaluation
      await shortTTLFactory.evaluateCondition(condition, context);
      expect(evaluatorSpy).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 60));

      // Second evaluation - cache should be expired
      await shortTTLFactory.evaluateCondition(condition, context);
      expect(evaluatorSpy).toHaveBeenCalledTimes(2);

      shortTTLFactory.destroy();
    });

    test('should handle cache size limits', async () => {
      const smallCacheFactory = new OptimizedConditionFactory({
        enableCaching: true,
        maxCacheSize: 2, // Very small cache
      });

      const createCondition = (id: string): PerformanceOptimizedCondition => ({
        id,
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async () => true,
        cacheKey: () => `key-${id}`,
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      });

      const context = { data: {}, metadata: {} };

      // Fill cache beyond capacity
      await smallCacheFactory.evaluateCondition(createCondition('1'), context);
      await smallCacheFactory.evaluateCondition(createCondition('2'), context);
      await smallCacheFactory.evaluateCondition(createCondition('3'), context);

      const stats = smallCacheFactory.getCacheStats();
      expect(stats.size).toBeLessThanOrEqual(2);
      expect(stats.evictions).toBeGreaterThan(0);

      smallCacheFactory.destroy();
    });
  });

  describe('parallel Condition Evaluation', () => {
    test('should evaluate parallelizable conditions concurrently', async () => {
      const evaluationOrder: string[] = [];

      const createCondition = (id: string, delay: number): PerformanceOptimizedCondition => ({
        id,
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async () => {
          await new Promise(resolve => setTimeout(resolve, delay));
          evaluationOrder.push(id);
          return true;
        },
        optimizationHints: {
          cacheable: false,
          parallelizable: true,
          memoryIntensive: false,
        },
      });

      const conditions = [
        createCondition('slow', 100),
        createCondition('fast', 50),
        createCondition('medium', 75),
      ];

      const context = { data: {}, metadata: {} };
      const startTime = Date.now();

      const results = await factory.evaluateConditionsParallel(conditions, context);
      const endTime = Date.now();

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success && r.result)).toBeTruthy();

      // Should complete faster than sequential execution (225ms)
      expect(endTime - startTime).toBeLessThan(150);

      // Fast condition should complete first
      expect(evaluationOrder[0]).toBe('fast');
    });

    test('should handle mixed parallelizable and non-parallelizable conditions', async () => {
      const conditions: PerformanceOptimizedCondition[] = [
        {
          id: 'sequential-1',
          type: 'performance_optimized',
          complexity: 'low',
          evaluator: async () => true,
          optimizationHints: {
            cacheable: false,
            parallelizable: false,
            memoryIntensive: false,
          },
        },
        {
          id: 'parallel-1',
          type: 'performance_optimized',
          complexity: 'low',
          evaluator: async () => true,
          optimizationHints: {
            cacheable: false,
            parallelizable: true,
            memoryIntensive: false,
          },
        },
        {
          id: 'parallel-2',
          type: 'performance_optimized',
          complexity: 'low',
          evaluator: async () => true,
          optimizationHints: {
            cacheable: false,
            parallelizable: true,
            memoryIntensive: false,
          },
        },
      ];

      const context = { data: {}, metadata: {} };
      const results = await factory.evaluateConditionsParallel(conditions, context);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBeTruthy();
    });
  });

  describe('performance Optimization', () => {
    test('should track and optimize condition performance', async () => {
      const slowCondition: PerformanceOptimizedCondition = {
        id: 'slow-condition',
        type: 'performance_optimized',
        complexity: 'high',
        predictedExecutionTime: 50,
        evaluator: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return true;
        },
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
      };

      const context = { data: {}, metadata: {} };

      // Execute multiple times to build performance history
      for (let i = 0; i < 5; i++) {
        await factory.evaluateCondition(slowCondition, context);
      }

      const performance = factory.getPerformanceMetrics();
      expect(performance.totalEvaluations).toBe(5);
      expect(performance.averageExecutionTime).toBeGreaterThan(90);

      const optimizations = factory.getOptimizationRecommendations();
      expect(optimizations.length).toBeGreaterThan(0);
      expect(optimizations.some(opt => opt.type === 'caching')).toBeTruthy();
    });

    test('should provide complexity-based optimization hints', async () => {
      const complexConditions: PerformanceOptimizedCondition[] = [
        {
          id: 'simple',
          type: 'performance_optimized',
          complexity: 'low',
          evaluator: async () => true,
          optimizationHints: { cacheable: false, parallelizable: true, memoryIntensive: false },
        },
        {
          id: 'complex',
          type: 'performance_optimized',
          complexity: 'high',
          evaluator: async () => true,
          optimizationHints: { cacheable: true, parallelizable: false, memoryIntensive: true },
        },
      ];

      const context = { data: {}, metadata: {} };

      for (const condition of complexConditions) {
        await factory.evaluateCondition(condition, context);
      }

      const optimizations = factory.getOptimizationRecommendations();
      expect(
        optimizations.some(opt => opt.conditionId === 'complex' && opt.priority === 'high'),
      ).toBeTruthy();
    });
  });

  describe('memory Management', () => {
    test('should handle memory-intensive conditions appropriately', async () => {
      const memoryIntensiveCondition: PerformanceOptimizedCondition = {
        id: 'memory-intensive',
        type: 'performance_optimized',
        complexity: 'high',
        evaluator: async context => {
          // Simulate memory-intensive operation
          const largeArray = new Array(10000).fill(context.data.value);
          return largeArray.length > 0;
        },
        optimizationHints: {
          cacheable: false, // Don't cache to avoid memory bloat
          parallelizable: false, // Don't parallelize to limit memory usage
          memoryIntensive: true,
        },
      };

      const context = { data: { value: 'test' }, metadata: {} };
      const result = await factory.evaluateCondition(memoryIntensiveCondition, context);

      expect(result.success).toBeTruthy();
      expect(result.result).toBeTruthy();

      // Should track memory usage
      const performance = factory.getPerformanceMetrics();
      expect(performance.memoryPressureWarnings).toBeGreaterThanOrEqual(0);
    });

    test('should clean up resources on destroy', async () => {
      const condition: PerformanceOptimizedCondition = {
        id: 'cleanup-test',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async () => true,
        cacheKey: () => 'cleanup-key',
        optimizationHints: { cacheable: true, parallelizable: false, memoryIntensive: false },
      };

      const context = { data: {}, metadata: {} };
      await factory.evaluateCondition(condition, context);

      const statsBeforeDestroy = factory.getCacheStats();
      expect(statsBeforeDestroy.size).toBeGreaterThan(0);

      factory.destroy();

      // After destroy, cache should be cleared
      const statsAfterDestroy = factory.getCacheStats();
      expect(statsAfterDestroy.size).toBe(0);
    });
  });

  describe('advanced Features', () => {
    test('should support dynamic condition modification', async () => {
      const dynamicCondition: PerformanceOptimizedCondition = {
        id: 'dynamic-condition',
        type: 'performance_optimized',
        complexity: 'medium',
        evaluator: async context => {
          return context.data.threshold ? context.data.value > context.data.threshold : false;
        },
        optimizationHints: {
          cacheable: true,
          parallelizable: false,
          memoryIntensive: false,
        },
        cacheKey: context => `dynamic-${context.data.threshold}-${context.data.value}`,
      };

      // Test with different thresholds
      const result1 = await factory.evaluateCondition(dynamicCondition, {
        data: { value: 15, threshold: 10 },
        metadata: {},
      });
      expect(result1.result).toBeTruthy();

      const result2 = await factory.evaluateCondition(dynamicCondition, {
        data: { value: 15, threshold: 20 },
        metadata: {},
      });
      expect(result2.result).toBeFalsy();

      const result3 = await factory.evaluateCondition(dynamicCondition, {
        data: { value: 15, threshold: null },
        metadata: {},
      });
      expect(result3.result).toBeFalsy();
    });

    test('should handle condition chaining and dependencies', async () => {
      const baseCondition: PerformanceOptimizedCondition = {
        id: 'base-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async context => {
          context.data.baseConditionExecuted = true;
          return context.data.enableDependentCondition === true;
        },
        optimizationHints: { cacheable: false, parallelizable: false, memoryIntensive: false },
      };

      const dependentCondition: PerformanceOptimizedCondition = {
        id: 'dependent-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async context => {
          expect(context.data.baseConditionExecuted).toBeTruthy();
          return context.data.finalValue > 0;
        },
        optimizationHints: { cacheable: false, parallelizable: false, memoryIntensive: false },
      };

      const context = {
        data: { enableDependentCondition: true, finalValue: 5 },
        metadata: {},
      };

      // Evaluate base condition first
      const baseResult = await factory.evaluateCondition(baseCondition, context);
      expect(baseResult.result).toBeTruthy();

      // Then evaluate dependent condition
      const dependentResult = await factory.evaluateCondition(dependentCondition, context);
      expect(dependentResult.result).toBeTruthy();
    });
  });

  describe('error Recovery and Resilience', () => {
    test('should handle intermittent evaluation failures', async () => {
      let attemptCount = 0;

      const flakyCondition: PerformanceOptimizedCondition = {
        id: 'flaky-condition',
        type: 'performance_optimized',
        complexity: 'medium',
        evaluator: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error(`Attempt ${attemptCount} failed`);
          }
          return true;
        },
        optimizationHints: { cacheable: false, parallelizable: false, memoryIntensive: false },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 10,
        },
      };

      const context = { data: {}, metadata: {} };
      const result = await factory.evaluateCondition(flakyCondition, context);

      expect(result.success).toBeTruthy();
      expect(result.result).toBeTruthy();
      expect(attemptCount).toBe(3);
    });

    test('should provide detailed error context on failures', async () => {
      const errorCondition: PerformanceOptimizedCondition = {
        id: 'error-context-condition',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async context => {
          const error = new Error('Evaluation failed with context');
          (error as any).context = { conditionId: 'error-context-condition', data: context.data };
          throw error;
        },
        optimizationHints: { cacheable: false, parallelizable: false, memoryIntensive: false },
      };

      const context = { data: { testValue: 'test-data' }, metadata: {} };
      const result = await factory.evaluateCondition(errorCondition, context);

      expect(result.success).toBeFalsy();
      expect(result.error).toContain('Evaluation failed with context');
      expect(result.errorContext).toBeDefined();
    });
  });
});

describe('conditionOptimizationUtils', () => {
  describe('condition Analysis', () => {
    test('should analyze condition complexity accurately', () => {
      const simpleCondition: PerformanceOptimizedCondition = {
        id: 'simple',
        type: 'performance_optimized',
        complexity: 'low',
        evaluator: async () => true,
        optimizationHints: { cacheable: false, parallelizable: true, memoryIntensive: false },
      };

      const complexCondition: PerformanceOptimizedCondition = {
        id: 'complex',
        type: 'performance_optimized',
        complexity: 'high',
        evaluator: async () => true,
        optimizationHints: { cacheable: true, parallelizable: false, memoryIntensive: true },
      };

      const simpleAnalysis = conditionOptimizationUtils.analyzeCondition(simpleCondition);
      const complexAnalysis = conditionOptimizationUtils.analyzeCondition(complexCondition);

      expect(simpleAnalysis.recommendsCaching).toBeFalsy();
      expect(simpleAnalysis.supportsParallelization).toBeTruthy();
      expect(simpleAnalysis.optimizationScore).toBeGreaterThan(70);

      expect(complexAnalysis.recommendsCaching).toBeTruthy();
      expect(complexAnalysis.supportsParallelization).toBeFalsy();
      expect(complexAnalysis.optimizationScore).toBeLessThan(simpleAnalysis.optimizationScore);
    });

    test('should generate optimization strategies', () => {
      const conditions: PerformanceOptimizedCondition[] = [
        {
          id: 'cacheable-slow',
          type: 'performance_optimized',
          complexity: 'high',
          predictedExecutionTime: 200,
          evaluator: async () => true,
          optimizationHints: { cacheable: true, parallelizable: false, memoryIntensive: false },
        },
        {
          id: 'parallelizable-fast',
          type: 'performance_optimized',
          complexity: 'low',
          predictedExecutionTime: 50,
          evaluator: async () => true,
          optimizationHints: { cacheable: false, parallelizable: true, memoryIntensive: false },
        },
      ];

      const strategy = conditionOptimizationUtils.generateOptimizationStrategy(conditions);

      expect(strategy.cachingCandidates).toContain('cacheable-slow');
      expect(strategy.parallelizationCandidates).toContain('parallelizable-fast');
      expect(strategy.expectedPerformanceGain).toBeGreaterThan(0);
    });
  });

  describe('performance Benchmarking', () => {
    test('should benchmark condition performance', async () => {
      const testCondition: PerformanceOptimizedCondition = {
        id: 'benchmark-condition',
        type: 'performance_optimized',
        complexity: 'medium',
        evaluator: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          return true;
        },
        optimizationHints: { cacheable: false, parallelizable: false, memoryIntensive: false },
      };

      const context = { data: {}, metadata: {} };
      const benchmark = await conditionOptimizationUtils.benchmarkCondition(
        testCondition,
        context,
        5, // 5 iterations
      );

      expect(benchmark.averageExecutionTime).toBeGreaterThan(40);
      expect(benchmark.averageExecutionTime).toBeLessThan(80);
      expect(benchmark.iterations).toBe(5);
      expect(benchmark.successRate).toBe(1.0);
    });
  });
});
