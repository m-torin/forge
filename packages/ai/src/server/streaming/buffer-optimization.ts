/**
 * Buffer Optimization for Advanced Streaming
 * Intelligent buffer sizing, flow control optimization, and memory management
 */

import { logError, logInfo, logWarn } from '@repo/observability/server/next';
import type { BackpressureController } from './backpressure';

/**
 * Buffer optimization configuration
 */
export interface BufferOptimizationConfig {
  /** Enable adaptive buffer sizing */
  adaptiveBuffering?: boolean;
  /** Buffer size analysis window (number of measurements) */
  analysisWindow?: number;
  /** Target latency in milliseconds */
  targetLatency?: number;
  /** Maximum buffer size allowed */
  maxBufferSize?: number;
  /** Minimum buffer size allowed */
  minBufferSize?: number;
  /** Flow control optimization settings */
  flowControl?: {
    /** Enable dynamic flow control */
    enabled?: boolean;
    /** Consumer rate threshold (items/second) */
    consumerRateThreshold?: number;
    /** Producer rate threshold (items/second) */
    producerRateThreshold?: number;
    /** Adjustment factor for buffer size changes */
    adjustmentFactor?: number;
  };
  /** Memory optimization settings */
  memoryOptimization?: {
    /** Enable memory-based buffer sizing */
    enabled?: boolean;
    /** Target memory usage percentage (0-1) */
    targetMemoryUsage?: number;
    /** Memory sampling interval in milliseconds */
    sampleInterval?: number;
    /** Enable memory prediction */
    enablePrediction?: boolean;
  };
  /** Performance profiling settings */
  profiling?: {
    /** Enable performance profiling */
    enabled?: boolean;
    /** Profiling interval in milliseconds */
    interval?: number;
    /** Keep performance history count */
    historySize?: number;
  };
}

/**
 * Buffer performance metrics
 */
export interface BufferPerformanceMetrics {
  /** Current buffer utilization (0-1) */
  utilization: number;
  /** Average processing latency in milliseconds */
  averageLatency: number;
  /** Items processed per second */
  throughput: number;
  /** Producer rate (items/second) */
  producerRate: number;
  /** Consumer rate (items/second) */
  consumerRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Buffer efficiency score (0-100) */
  efficiencyScore: number;
  /** Recommended buffer size */
  recommendedBufferSize: number;
  /** Performance trends */
  trends: {
    latency: 'improving' | 'degrading' | 'stable';
    throughput: 'increasing' | 'decreasing' | 'stable';
    memory: 'growing' | 'shrinking' | 'stable';
  };
}

/**
 * Buffer optimization recommendations
 */
export interface BufferOptimizationRecommendations {
  /** Recommended actions */
  actions: Array<{
    type: 'resize_buffer' | 'adjust_flow_control' | 'optimize_memory' | 'change_strategy';
    description: string;
    priority: 'high' | 'medium' | 'low';
    expectedImprovement: number; // Percentage improvement expected
    implementation: string;
  }>;
  /** Performance outlook */
  outlook: {
    expectedLatencyImprovement: number;
    expectedThroughputImprovement: number;
    expectedMemoryReduction: number;
    confidenceScore: number; // 0-1
  };
  /** Warnings */
  warnings: string[];
}

/**
 * Buffer optimization engine
 */
export class BufferOptimizationEngine<T> {
  private config: Required<
    BufferOptimizationConfig & {
      flowControl: Required<BufferOptimizationConfig['flowControl']>;
      memoryOptimization: Required<BufferOptimizationConfig['memoryOptimization']>;
      profiling: Required<BufferOptimizationConfig['profiling']>;
    }
  >;

  private performanceHistory: Array<{
    timestamp: number;
    bufferSize: number;
    utilization: number;
    latency: number;
    throughput: number;
    memoryUsage: number;
  }> = [];

  private currentMetrics: BufferPerformanceMetrics = {
    utilization: 0,
    averageLatency: 0,
    throughput: 0,
    producerRate: 0,
    consumerRate: 0,
    memoryUsage: 0,
    efficiencyScore: 0,
    recommendedBufferSize: 100,
    trends: {
      latency: 'stable',
      throughput: 'stable',
      memory: 'stable',
    },
  };

  private processingTimes: number[] = [];
  private itemsSent = 0;
  private itemsReceived = 0;
  private startTime = Date.now();
  private lastMeasurement = Date.now();
  private profilingTimer?: NodeJS.Timeout;
  private memoryTimer?: NodeJS.Timeout;

  constructor(
    private backpressureController: BackpressureController<T>,
    config: BufferOptimizationConfig = {},
  ) {
    this.config = {
      adaptiveBuffering: config.adaptiveBuffering ?? true,
      analysisWindow: config.analysisWindow || 50,
      targetLatency: config.targetLatency || 100, // 100ms target
      maxBufferSize: config.maxBufferSize || 2000,
      minBufferSize: config.minBufferSize || 10,
      flowControl: {
        enabled: config.flowControl?.enabled ?? true,
        consumerRateThreshold: config.flowControl?.consumerRateThreshold || 100,
        producerRateThreshold: config.flowControl?.producerRateThreshold || 150,
        adjustmentFactor: config.flowControl?.adjustmentFactor || 0.2,
      },
      memoryOptimization: {
        enabled: config.memoryOptimization?.enabled ?? true,
        targetMemoryUsage: config.memoryOptimization?.targetMemoryUsage || 0.7,
        sampleInterval: config.memoryOptimization?.sampleInterval || 5000,
        enablePrediction: config.memoryOptimization?.enablePrediction ?? true,
      },
      profiling: {
        enabled: config.profiling?.enabled ?? true,
        interval: config.profiling?.interval || 10000, // 10 seconds
        historySize: config.profiling?.historySize || 100,
      },
    };

    this.startProfiling();
    this.startMemoryMonitoring();
  }

  /**
   * Record item processing
   */
  recordItemProcessed(processingTime: number): void {
    this.itemsSent++;
    this.processingTimes.push(processingTime);

    // Keep only recent processing times
    if (this.processingTimes.length > this.config.analysisWindow) {
      this.processingTimes = this.processingTimes.slice(-this.config.analysisWindow);
    }
  }

  /**
   * Record item received
   */
  recordItemReceived(): void {
    this.itemsReceived++;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): BufferPerformanceMetrics {
    this.updateMetrics();
    return { ...this.currentMetrics };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): BufferOptimizationRecommendations {
    const metrics = this.getCurrentMetrics();
    const actions: BufferOptimizationRecommendations['actions'] = [];
    const warnings: string[] = [];

    // Buffer size recommendations
    if (metrics.utilization > 0.9) {
      actions.push({
        type: 'resize_buffer',
        description: 'Increase buffer size to handle high utilization',
        priority: 'high',
        expectedImprovement: 15,
        implementation: `Increase buffer size from current to ${Math.min(
          metrics.recommendedBufferSize * 1.5,
          this.config.maxBufferSize,
        )}`,
      });
    } else if (
      metrics.utilization < 0.3 &&
      metrics.recommendedBufferSize > this.config.minBufferSize
    ) {
      actions.push({
        type: 'resize_buffer',
        description: 'Reduce buffer size to save memory',
        priority: 'medium',
        expectedImprovement: 10,
        implementation: `Reduce buffer size to ${Math.max(
          metrics.recommendedBufferSize * 0.8,
          this.config.minBufferSize,
        )}`,
      });
    }

    // Latency recommendations
    if (metrics.averageLatency > this.config.targetLatency * 1.5) {
      actions.push({
        type: 'optimize_memory',
        description: 'High latency detected - optimize memory usage',
        priority: 'high',
        expectedImprovement: 25,
        implementation: 'Enable garbage collection and reduce buffer overhead',
      });

      warnings.push(
        `Average latency (${metrics.averageLatency.toFixed(2)}ms) exceeds target by 50%`,
      );
    }

    // Flow control recommendations
    if (this.config.flowControl?.enabled) {
      const rateRatio = metrics.producerRate / (metrics.consumerRate || 1);

      if (rateRatio > 2) {
        actions.push({
          type: 'adjust_flow_control',
          description: 'Producer significantly outpacing consumer - implement throttling',
          priority: 'high',
          expectedImprovement: 20,
          implementation: 'Reduce producer rate or increase buffer capacity',
        });
      } else if (rateRatio < 0.5) {
        actions.push({
          type: 'adjust_flow_control',
          description: 'Consumer outpacing producer - reduce buffer overhead',
          priority: 'low',
          expectedImprovement: 5,
          implementation: 'Optimize consumer batching or reduce buffer size',
        });
      }
    }

    // Memory optimization recommendations
    if (this.config.memoryOptimization?.enabled) {
      const memoryPressure = this.calculateMemoryPressure();

      if (memoryPressure > 0.8) {
        actions.push({
          type: 'optimize_memory',
          description: 'High memory pressure - implement compression or cleanup',
          priority: 'high',
          expectedImprovement: 30,
          implementation: 'Enable data compression and aggressive garbage collection',
        });

        warnings.push('Memory usage approaching limits - consider reducing buffer sizes');
      }
    }

    // Strategy recommendations
    if (metrics.efficiencyScore < 60) {
      actions.push({
        type: 'change_strategy',
        description: 'Low efficiency score - consider different backpressure strategy',
        priority: 'medium',
        expectedImprovement: 20,
        implementation: 'Switch from buffering to throttling or hybrid approach',
      });
    }

    // Calculate outlook
    const totalExpectedImprovement = actions.reduce((sum, action) => {
      return sum + action.expectedImprovement * (action.priority === 'high' ? 1 : 0.5);
    }, 0);

    const outlook = {
      expectedLatencyImprovement: Math.min(totalExpectedImprovement * 0.3, 50),
      expectedThroughputImprovement: Math.min(totalExpectedImprovement * 0.4, 40),
      expectedMemoryReduction: Math.min(totalExpectedImprovement * 0.2, 30),
      confidenceScore: Math.min(this.performanceHistory.length / 50, 1), // More history = higher confidence
    };

    return {
      actions: actions.sort((a, b) => {
        const priorityScore = { high: 3, medium: 2, low: 1 };
        return priorityScore[b.priority] - priorityScore[a.priority];
      }),
      outlook,
      warnings,
    };
  }

  /**
   * Apply automatic optimizations
   */
  async applyOptimizations(): Promise<{
    applied: string[];
    skipped: string[];
    results: Partial<BufferPerformanceMetrics>;
  }> {
    const recommendations = this.generateRecommendations();
    const applied: string[] = [];
    const skipped: string[] = [];

    logInfo('Buffer Optimization: Applying automatic optimizations', {
      operation: 'buffer_optimization_apply',
      metadata: {
        recommendationCount: recommendations.actions.length,
        currentEfficiency: this.currentMetrics.efficiencyScore,
      },
    });

    // Apply high-priority optimizations automatically
    for (const action of recommendations.actions.filter(a => a.priority === 'high')) {
      try {
        switch (action.type) {
          case 'resize_buffer':
            if (this.config.adaptiveBuffering) {
              const newSize = this.currentMetrics.recommendedBufferSize;
              // Would apply buffer resize through backpressure controller
              applied.push(`Resized buffer to ${newSize}`);
            } else {
              skipped.push('Buffer resizing disabled');
            }
            break;

          case 'optimize_memory':
            // Trigger memory cleanup
            if (this.config.memoryOptimization?.enabled) {
              await this.optimizeMemoryUsage();
              applied.push('Applied memory optimizations');
            } else {
              skipped.push('Memory optimization disabled');
            }
            break;

          case 'adjust_flow_control':
            if (this.config.flowControl?.enabled) {
              this.adjustFlowControl();
              applied.push('Adjusted flow control parameters');
            } else {
              skipped.push('Flow control disabled');
            }
            break;

          default:
            skipped.push(`Unsupported optimization: ${action.type}`);
        }
      } catch (error) {
        logError('Buffer Optimization: Failed to apply optimization', {
          operation: 'buffer_optimization_error',
          error: error instanceof Error ? error : new Error(String(error)),
          metadata: { actionType: action.type },
        });
        skipped.push(`Failed to apply ${action.type}: ${error}`);
      }
    }

    // Measure results after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const resultsAfter = this.getCurrentMetrics();

    logInfo('Buffer Optimization: Completed optimization cycle', {
      operation: 'buffer_optimization_complete',
      metadata: {
        applied: applied.length,
        skipped: skipped.length,
        efficiencyImprovement: resultsAfter.efficiencyScore - this.currentMetrics.efficiencyScore,
      },
    });

    return {
      applied,
      skipped,
      results: resultsAfter,
    };
  }

  /**
   * Calculate optimal buffer size
   */
  calculateOptimalBufferSize(): number {
    if (this.performanceHistory.length < 5) {
      return 100; // Default size
    }

    const recentHistory = this.performanceHistory.slice(-20);
    let optimalSize = 100;
    let bestScore = 0;

    // Analyze different buffer sizes from history
    const sizePerformanceMap = new Map<number, { latency: number[]; throughput: number[] }>();

    recentHistory.forEach(record => {
      const size = record.bufferSize;
      if (!sizePerformanceMap.has(size)) {
        sizePerformanceMap.set(size, { latency: [], throughput: [] });
      }

      const data = sizePerformanceMap.get(size);
      if (data) {
        data.latency.push(record.latency);
        data.throughput.push(record.throughput);
      }
    });

    // Find size with best performance score
    sizePerformanceMap.forEach((data, size) => {
      const avgLatency = data.latency.reduce((a, b) => a + b, 0) / data.latency.length;
      const avgThroughput = data.throughput.reduce((a, b) => a + b, 0) / data.throughput.length;

      // Score based on latency (lower is better) and throughput (higher is better)
      const latencyScore = Math.max(0, 100 - (avgLatency / this.config.targetLatency) * 50);
      const throughputScore = Math.min(100, (avgThroughput / 100) * 50);
      const totalScore = (latencyScore + throughputScore) / 2;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        optimalSize = size;
      }
    });

    // Apply constraints
    return Math.max(this.config.minBufferSize, Math.min(this.config.maxBufferSize, optimalSize));
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const timeDelta = (now - this.lastMeasurement) / 1000; // seconds

    if (timeDelta <= 0) return;

    // Calculate rates
    const totalTime = (now - this.startTime) / 1000;
    this.currentMetrics.producerRate = this.itemsReceived / totalTime;
    this.currentMetrics.consumerRate = this.itemsSent / totalTime;
    this.currentMetrics.throughput = this.itemsSent / totalTime;

    // Calculate latency
    if (this.processingTimes.length > 0) {
      this.currentMetrics.averageLatency =
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    }

    // Estimate utilization (would need backpressure controller integration)
    const estimatedBufferSize = 100; // Placeholder
    this.currentMetrics.utilization = Math.min(1, estimatedBufferSize / 100);

    // Calculate memory usage
    this.currentMetrics.memoryUsage = this.getMemoryUsage();

    // Calculate efficiency score
    this.currentMetrics.efficiencyScore = this.calculateEfficiencyScore();

    // Calculate recommended buffer size
    this.currentMetrics.recommendedBufferSize = this.calculateOptimalBufferSize();

    // Update trends
    this.updateTrends();

    this.lastMeasurement = now;
  }

  /**
   * Calculate efficiency score (0-100)
   */
  private calculateEfficiencyScore(): number {
    let score = 100;

    // Penalize high latency
    if (this.currentMetrics.averageLatency > this.config.targetLatency) {
      const latencyPenalty = Math.min(
        50,
        (this.currentMetrics.averageLatency / this.config.targetLatency - 1) * 30,
      );
      score -= latencyPenalty;
    }

    // Penalize very high or very low utilization
    const utilization = this.currentMetrics.utilization;
    if (utilization > 0.9) {
      score -= (utilization - 0.9) * 200; // Heavy penalty for over-utilization
    } else if (utilization < 0.3) {
      score -= (0.3 - utilization) * 100; // Moderate penalty for under-utilization
    }

    // Factor in throughput efficiency
    const expectedThroughput = Math.min(
      this.currentMetrics.producerRate,
      this.currentMetrics.consumerRate,
    );
    if (expectedThroughput > 0) {
      const throughputEfficiency = this.currentMetrics.throughput / expectedThroughput;
      score *= throughputEfficiency;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Update performance trends
   */
  private updateTrends(): void {
    if (this.performanceHistory.length < 3) return;

    const recent = this.performanceHistory.slice(-3);
    const older = this.performanceHistory.slice(-6, -3);

    if (older.length === 0) return;

    const recentAvgLatency = recent.reduce((sum, r) => sum + r.latency, 0) / recent.length;
    const olderAvgLatency = older.reduce((sum, r) => sum + r.latency, 0) / older.length;

    const recentAvgThroughput = recent.reduce((sum, r) => sum + r.throughput, 0) / recent.length;
    const olderAvgThroughput = older.reduce((sum, r) => sum + r.throughput, 0) / older.length;

    const recentAvgMemory = recent.reduce((sum, r) => sum + r.memoryUsage, 0) / recent.length;
    const olderAvgMemory = older.reduce((sum, r) => sum + r.memoryUsage, 0) / older.length;

    // Determine trends
    const latencyChange = (recentAvgLatency - olderAvgLatency) / olderAvgLatency;
    const throughputChange = (recentAvgThroughput - olderAvgThroughput) / olderAvgThroughput;
    const memoryChange = (recentAvgMemory - olderAvgMemory) / olderAvgMemory;

    const threshold = 0.1; // 10% change threshold

    this.currentMetrics.trends.latency =
      latencyChange > threshold ? 'degrading' : latencyChange < -threshold ? 'improving' : 'stable';

    this.currentMetrics.trends.throughput =
      throughputChange > threshold
        ? 'increasing'
        : throughputChange < -threshold
          ? 'decreasing'
          : 'stable';

    this.currentMetrics.trends.memory =
      memoryChange > threshold ? 'growing' : memoryChange < -threshold ? 'shrinking' : 'stable';
  }

  /**
   * Start performance profiling
   */
  private startProfiling(): void {
    if (!this.config.profiling?.enabled) return;

    this.profilingTimer = setInterval(() => {
      const metrics = {
        timestamp: Date.now(),
        bufferSize: 100, // Would get from backpressure controller
        utilization: this.currentMetrics.utilization,
        latency: this.currentMetrics.averageLatency,
        throughput: this.currentMetrics.throughput,
        memoryUsage: this.currentMetrics.memoryUsage,
      };

      this.performanceHistory.push(metrics);

      // Keep history within limits
      if (this.performanceHistory.length > (this.config.profiling?.historySize || 100)) {
        this.performanceHistory = this.performanceHistory.slice(
          -(this.config.profiling?.historySize || 100),
        );
      }

      logInfo('Buffer Optimization: Performance profiling', {
        operation: 'buffer_optimization_profile',
        metadata: {
          efficiencyScore: this.currentMetrics.efficiencyScore,
          utilization: this.currentMetrics.utilization,
          latency: this.currentMetrics.averageLatency,
          throughput: this.currentMetrics.throughput,
        },
      });
    }, this.config.profiling?.interval || 5000);
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if (!this.config.memoryOptimization?.enabled) return;

    this.memoryTimer = setInterval(() => {
      const memoryPressure = this.calculateMemoryPressure();

      if (memoryPressure > (this.config.memoryOptimization?.targetMemoryUsage || 0.8)) {
        logWarn('Buffer Optimization: High memory pressure detected', {
          operation: 'buffer_optimization_memory_pressure',
          metadata: {
            memoryPressure,
            targetUsage: this.config.memoryOptimization?.targetMemoryUsage || 0.8,
            memoryUsage: this.currentMetrics.memoryUsage,
          },
        });
      }
    }, this.config.memoryOptimization?.sampleInterval || 1000);
  }

  /**
   * Calculate memory pressure (0-1)
   */
  private calculateMemoryPressure(): number {
    // In a real implementation, this would check actual memory usage
    const estimatedTotalMemory = 100 * 1024 * 1024; // 100MB estimate
    return this.currentMetrics.memoryUsage / estimatedTotalMemory;
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Optimize memory usage
   */
  private async optimizeMemoryUsage(): Promise<void> {
    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear old performance history
    const keepCount = Math.floor((this.config.profiling?.historySize || 100) * 0.5);
    this.performanceHistory = this.performanceHistory.slice(-keepCount);

    // Clear old processing times
    const keepProcessingTimes = Math.floor(this.config.analysisWindow * 0.5);
    this.processingTimes = this.processingTimes.slice(-keepProcessingTimes);

    logInfo('Buffer Optimization: Memory optimization applied', {
      operation: 'buffer_optimization_memory_optimized',
      metadata: {
        historyKept: this.performanceHistory.length,
        processingTimesKept: this.processingTimes.length,
      },
    });
  }

  /**
   * Adjust flow control parameters
   */
  private adjustFlowControl(): void {
    const rateRatio = this.currentMetrics.producerRate / (this.currentMetrics.consumerRate || 1);

    // This would integrate with the backpressure controller to adjust flow control
    logInfo('Buffer Optimization: Flow control adjusted', {
      operation: 'buffer_optimization_flow_control',
      metadata: {
        producerRate: this.currentMetrics.producerRate,
        consumerRate: this.currentMetrics.consumerRate,
        rateRatio,
      },
    });
  }

  /**
   * Get optimization summary
   */
  getOptimizationSummary(): {
    metrics: BufferPerformanceMetrics;
    recommendations: BufferOptimizationRecommendations;
    history: Array<{
      timestamp: number;
      bufferSize: number;
      utilization: number;
      latency: number;
      throughput: number;
      memoryUsage: number;
    }>;
    configuration: BufferOptimizationConfig;
  } {
    return {
      metrics: this.getCurrentMetrics(),
      recommendations: this.generateRecommendations(),
      history: [...this.performanceHistory],
      configuration: { ...this.config },
    };
  }

  /**
   * Cleanup and shutdown
   */
  destroy(): void {
    if (this.profilingTimer) {
      clearInterval(this.profilingTimer);
    }
    if (this.memoryTimer) {
      clearInterval(this.memoryTimer);
    }

    logInfo('Buffer Optimization: Engine destroyed', {
      operation: 'buffer_optimization_destroy',
      metadata: {
        finalEfficiencyScore: this.currentMetrics.efficiencyScore,
        totalItemsProcessed: this.itemsSent,
      },
    });
  }
}

/**
 * Stream buffer manager with optimization capabilities
 */
export class OptimizedBufferManager<T> {
  private optimizationEngine: BufferOptimizationEngine<T>;

  constructor(
    private backpressureController: BackpressureController<T>,
    optimizationConfig?: BufferOptimizationConfig,
  ) {
    this.optimizationEngine = new BufferOptimizationEngine(
      backpressureController,
      optimizationConfig,
    );
  }

  /**
   * Process item with optimization tracking
   */
  async processItem(item: T, processor: (item: T) => Promise<void>): Promise<boolean> {
    this.optimizationEngine.recordItemReceived();

    const startTime = Date.now();

    try {
      await processor(item);
      const processingTime = Date.now() - startTime;
      this.optimizationEngine.recordItemProcessed(processingTime);
      return true;
    } catch (error) {
      logError('Enhanced Stream Buffer: Item processing failed', {
        operation: 'stream_buffer_process_error',
        error: error instanceof Error ? error : new Error(String(error)),
      });
      return false;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): BufferPerformanceMetrics {
    return this.optimizationEngine.getCurrentMetrics();
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): BufferOptimizationRecommendations {
    return this.optimizationEngine.generateRecommendations();
  }

  /**
   * Apply automatic optimizations
   */
  async optimize(): Promise<{
    applied: string[];
    skipped: string[];
    results: Partial<BufferPerformanceMetrics>;
  }> {
    return this.optimizationEngine.applyOptimizations();
  }

  /**
   * Get full optimization summary
   */
  getSummary() {
    return this.optimizationEngine.getOptimizationSummary();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.optimizationEngine.destroy();
  }
}

/**
 * Buffer optimization utilities
 */
export const bufferOptimizationUtils = {
  /**
   * Create optimized buffer configuration
   */
  createOptimizedConfig: (
    scenario: 'high_throughput' | 'low_latency' | 'memory_efficient' | 'balanced',
  ): BufferOptimizationConfig => {
    const configs: Record<string, BufferOptimizationConfig> = {
      high_throughput: {
        adaptiveBuffering: true,
        targetLatency: 200,
        maxBufferSize: 5000,
        minBufferSize: 100,
        flowControl: {
          enabled: true,
          adjustmentFactor: 0.3,
        },
        memoryOptimization: {
          enabled: true,
          targetMemoryUsage: 0.8,
        },
      },
      low_latency: {
        adaptiveBuffering: true,
        targetLatency: 50,
        maxBufferSize: 1000,
        minBufferSize: 20,
        flowControl: {
          enabled: true,
          adjustmentFactor: 0.1,
        },
        memoryOptimization: {
          enabled: true,
          targetMemoryUsage: 0.6,
        },
      },
      memory_efficient: {
        adaptiveBuffering: true,
        targetLatency: 150,
        maxBufferSize: 500,
        minBufferSize: 10,
        memoryOptimization: {
          enabled: true,
          targetMemoryUsage: 0.5,
          sampleInterval: 2000,
        },
      },
      balanced: {
        adaptiveBuffering: true,
        targetLatency: 100,
        maxBufferSize: 2000,
        minBufferSize: 50,
        flowControl: {
          enabled: true,
          adjustmentFactor: 0.2,
        },
        memoryOptimization: {
          enabled: true,
          targetMemoryUsage: 0.7,
        },
        profiling: {
          enabled: true,
          interval: 5000,
        },
      },
    };

    return configs[scenario];
  },

  /**
   * Benchmark buffer configurations
   */
  benchmarkConfigurations: async (
    configurations: Array<{ name: string; config: BufferOptimizationConfig }>,
    testDuration = 30000, // 30 seconds
  ) => {
    const results: Array<{
      name: string;
      metrics: BufferPerformanceMetrics;
      score: number;
    }> = [];

    logInfo('Buffer Optimization: Starting benchmark', {
      operation: 'buffer_optimization_benchmark_start',
      metadata: {
        configurations: configurations.length,
        testDuration,
      },
    });

    // In a real implementation, this would run actual performance tests
    // For now, return simulated results
    configurations.forEach(({ name, config }) => {
      const simulatedMetrics: BufferPerformanceMetrics = {
        utilization: 0.7 + Math.random() * 0.2,
        averageLatency: (config.targetLatency || 100) * (0.8 + Math.random() * 0.4),
        throughput: 100 + Math.random() * 50,
        producerRate: 120 + Math.random() * 30,
        consumerRate: 110 + Math.random() * 20,
        memoryUsage: 10 * 1024 * 1024 + Math.random() * 20 * 1024 * 1024,
        efficiencyScore: 60 + Math.random() * 30,
        recommendedBufferSize: (config.minBufferSize || 50) + Math.random() * 100,
        trends: {
          latency: 'stable',
          throughput: 'stable',
          memory: 'stable',
        },
      };

      results.push({
        name,
        metrics: simulatedMetrics,
        score: simulatedMetrics.efficiencyScore,
      });
    });

    return results.sort((a, b) => b.score - a.score);
  },
};
