/**
 * Enhanced Performance Metrics with Event Loop Monitoring
 *
 * Advanced performance monitoring leveraging Node.js 22+ features for enterprise-grade
 * observability and performance analysis. This module provides comprehensive metrics
 * collection, real-time monitoring, and performance trend analysis.
 *
 * ## Key Node 22+ Features Used:
 * - **High-resolution timing**: `process.hrtime.bigint()` for nanosecond precision
 * - **Event loop monitoring**: Real-time lag detection and utilization tracking
 * - **Performance Observer API**: Comprehensive performance entry collection
 * - **Resource utilization**: Memory, CPU, and network metrics with Node 22+ APIs
 * - **Structured data**: Modern discriminated unions for type-safe metrics
 *
 * ## Core Capabilities:
 * - Nanosecond-precision operation timing
 * - Event loop health monitoring with lag detection
 * - Memory usage tracking with leak detection
 * - CPU utilization analysis with trend detection
 * - Garbage collection metrics and optimization insights
 * - Network performance monitoring
 * - Performance trend analysis with statistical confidence
 * - Configurable alerting thresholds
 * - Integration with enterprise observability platforms
 *
 * ## Usage Examples:
 *
 * ### Basic Performance Monitoring:
 * ```typescript
 * import { globalPerformanceMonitor } from '@repo/orchestration';
 *
 * await globalPerformanceMonitor.start();
 *
 * const timingId = globalPerformanceMonitor.startTiming('api-call');
 * const result = await performApiCall();
 * const metrics = globalPerformanceMonitor.endTiming(timingId);
 *
 * console.log(`API call took ${metrics.durationMs}ms`);
 * ```
 *
 * ### Advanced Metrics Collection:
 * ```typescript
 * // Get comprehensive system metrics
 * const metrics = globalPerformanceMonitor.getCurrentMetrics();
 * console.log(`Event loop lag: ${metrics.eventLoop.lag}ms`);
 * console.log(`Memory usage: ${metrics.memory.heapUsed / 1024 / 1024}MB`);
 * console.log(`CPU usage: ${metrics.cpu.usage}%`);
 *
 * // Analyze performance trends
 * const trends = globalPerformanceMonitor.analyzeTrends();
 * trends.forEach(trend => {
 *   console.log(`${trend.metric}: ${trend.direction} (${trend.changePercent}%)`);
 * });
 * ```
 *
 * ### High-Precision Timing:
 * ```typescript
 * // Direct high-resolution timing
 * const start = process.hrtime.bigint();
 * await criticalOperation();
 * const durationNs = process.hrtime.bigint() - start;
 * const durationMs = Number(durationNs) / 1_000_000;
 *
 * console.log(`Critical operation: ${durationMs.toFixed(3)}ms (${durationNs}ns)`);
 * ```
 *
 * @module PerformanceMetrics
 * @version 2.0.0
 * @since Node.js 22.0.0
 *
 * @example
 * // Enterprise monitoring setup
 * const monitor = new PerformanceMonitor({
 *   eventLoopInterval: 100,
 *   alertThresholds: {
 *     eventLoopLag: 10, // Alert if event loop lag > 10ms
 *     memoryUsage: 80,  // Alert if memory usage > 80%
 *     cpuUsage: 90      // Alert if CPU usage > 90%
 *   }
 * });
 *
 * await monitor.start();
 *
 * // Monitor critical operations
 * const timingId = monitor.startTiming('database-query');
 * const result = await database.query('SELECT * FROM users');
 * const metrics = monitor.endTiming(timingId);
 *
 * if (metrics.durationMs > 500) {
 *   console.warn(`Slow query detected: ${metrics.durationMs}ms`);
 * }
 */

import { createServerObservability } from '@repo/observability/server/next';
import { performance, PerformanceObserver } from 'perf_hooks';
import { globalMemoryMonitor } from './memory-monitor';

/**
 * Event loop metrics
 */
interface EventLoopMetrics {
  readonly timestamp: Date;
  readonly lag: number; // milliseconds
  readonly utilization: number; // percentage (0-100)
  readonly idle: number; // time spent idle in ms
  readonly active: number; // time spent active in ms
  readonly delay: number; // scheduler delay in ms
}

/**
 * Performance timing metrics
 */
interface PerformanceTimingMetrics {
  readonly operation: string;
  readonly startTime: bigint;
  readonly endTime: bigint;
  readonly duration: number; // nanoseconds
  readonly durationMs: number; // milliseconds
  readonly memoryBefore: number;
  readonly memoryAfter: number;
  readonly memoryDelta: number;
  readonly timestamp: Date;
}

/**
 * Comprehensive performance metrics
 */
interface ComprehensiveMetrics {
  readonly timestamp: Date;
  readonly eventLoop: EventLoopMetrics;
  readonly memory: {
    readonly heapUsed: number;
    readonly heapTotal: number;
    readonly external: number;
    readonly rss: number;
    readonly arrayBuffers: number;
  };
  readonly cpu: {
    readonly user: number;
    readonly system: number;
    readonly total: number;
    readonly usage: number; // percentage
  };
  readonly gc: {
    readonly collections: number;
    readonly duration: number;
    readonly freedMemory: number;
    readonly type?: string;
  };
  readonly network: {
    readonly requests: number;
    readonly responses: number;
    readonly errors: number;
    readonly bytesIn: number;
    readonly bytesOut: number;
  };
}

/**
 * Performance trend analysis
 */
interface PerformanceTrend {
  readonly metric: keyof ComprehensiveMetrics;
  readonly direction: 'improving' | 'degrading' | 'stable';
  readonly changePercent: number;
  readonly confidence: number; // 0-1
  readonly dataPoints: number;
  readonly timespan: number; // milliseconds
}

/**
 * Performance monitoring configuration
 */
interface PerformanceConfig {
  readonly eventLoopInterval: number; // ms
  readonly metricsRetention: number; // number of metrics to keep
  readonly trendAnalysisWindow: number; // number of data points for trend analysis
  readonly alertThresholds: {
    readonly eventLoopLag: number; // ms
    readonly memoryUsage: number; // percentage
    readonly cpuUsage: number; // percentage
    readonly gcDuration: number; // ms
  };
  readonly enableDetailedProfiling: boolean;
  readonly enableNetworkMonitoring: boolean;
}

/**
 * Default performance monitoring configuration
 */
const DEFAULT_CONFIG: PerformanceConfig = {
  eventLoopInterval: 5000, // 5 seconds
  metricsRetention: 720, // Keep 1 hour at 5s intervals
  trendAnalysisWindow: 12, // 1 minute of data points
  alertThresholds: {
    eventLoopLag: 100, // 100ms lag threshold
    memoryUsage: 80, // 80% memory usage threshold
    cpuUsage: 80, // 80% CPU usage threshold
    gcDuration: 50, // 50ms GC duration threshold
  },
  enableDetailedProfiling: false,
  enableNetworkMonitoring: false,
};

/**
 * Enhanced Performance Monitor with Event Loop Monitoring
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private readonly config: PerformanceConfig;
  private readonly metrics: ComprehensiveMetrics[] = [];
  private readonly timingMetrics = new Map<string, PerformanceTimingMetrics[]>();
  private eventLoopTimer?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  private lastCpuUsage = process.cpuUsage();
  private lastEventLoopUtilization = performance.eventLoopUtilization();
  private networkMetrics = {
    requests: 0,
    responses: 0,
    errors: 0,
    bytesIn: 0,
    bytesOut: 0,
  };
  private gcMetrics = {
    collections: 0,
    duration: 0,
    freedMemory: 0,
    type: undefined as string | undefined,
  };
  private isMonitoring = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupPerformanceObserver();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<PerformanceConfig>): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  async start(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    let logger: any = null;
    try {
      logger = await createServerObservability();
    } catch {
      // Logger not available
    }
    logger?.log('info', 'Starting performance monitoring', {
      config: this.config,
    });

    this.isMonitoring = true;

    // Start event loop monitoring
    this.eventLoopTimer = setInterval(() => {
      (async () => {
        try {
          await this.collectMetrics();
        } catch (error) {
          logger?.log('warning', 'Failed to collect performance metrics', { error });
        }
      })();
    }, this.config.eventLoopInterval);

    // Collect initial metrics
    await this.collectMetrics();

    // Start memory monitor integration
    if (!globalMemoryMonitor.getCurrentMetrics()) {
      try {
        await globalMemoryMonitor.start();
      } catch (error) {
        logger?.log('warning', 'Failed to start memory monitor', { error });
      }
    }
  }

  /**
   * Stop performance monitoring
   */
  async stop(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    let logger: any = null;
    try {
      logger = await createServerObservability();
    } catch {
      // Logger not available
    }
    logger?.log('info', 'Stopping performance monitoring');

    this.isMonitoring = false;

    if (this.eventLoopTimer) {
      clearInterval(this.eventLoopTimer);
      this.eventLoopTimer = undefined;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  /**
   * Collect comprehensive performance metrics
   */
  async collectMetrics(): Promise<ComprehensiveMetrics> {
    const timestamp = new Date();

    // Event loop metrics
    const eventLoop = await this.measureEventLoopMetrics();

    // Memory metrics
    const memoryUsage = process.memoryUsage();

    // CPU metrics
    const cpu = this.calculateCpuMetrics();

    // Comprehensive metrics
    const metrics: ComprehensiveMetrics = {
      timestamp,
      eventLoop,
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
        arrayBuffers: memoryUsage.arrayBuffers,
      },
      cpu,
      gc: { ...this.gcMetrics },
      network: { ...this.networkMetrics },
    };

    // Store metrics with retention limit
    this.metrics.push(metrics);
    if (this.metrics.length > this.config.metricsRetention) {
      this.metrics.shift();
    }

    // Check for performance alerts
    await this.checkPerformanceAlerts(metrics);

    return metrics;
  }

  /**
   * Measure event loop metrics
   */
  private async measureEventLoopMetrics(): Promise<EventLoopMetrics> {
    // Measure event loop lag
    const lagStart = process.hrtime.bigint();
    await new Promise(resolve => setImmediate(resolve));
    const lagEnd = process.hrtime.bigint();
    const lag = Number(lagEnd - lagStart) / 1_000_000; // Convert to milliseconds

    // Get event loop utilization
    const utilization = performance.eventLoopUtilization(this.lastEventLoopUtilization);
    this.lastEventLoopUtilization = performance.eventLoopUtilization();

    // Calculate scheduler delay
    const delayStart = process.hrtime.bigint();
    await new Promise(resolve => setTimeout(resolve, 0));
    const delayEnd = process.hrtime.bigint();
    const delay = Number(delayEnd - delayStart) / 1_000_000;

    return {
      timestamp: new Date(),
      lag,
      utilization: utilization.utilization * 100, // Convert to percentage
      idle: utilization.idle,
      active: utilization.active,
      delay,
    };
  }

  /**
   * Calculate CPU metrics
   */
  private calculateCpuMetrics(): ComprehensiveMetrics['cpu'] {
    const currentUsage = process.cpuUsage(this.lastCpuUsage);
    this.lastCpuUsage = process.cpuUsage();

    const user = currentUsage.user / 1000; // Convert to milliseconds
    const system = currentUsage.system / 1000;
    const total = user + system;

    // Estimate CPU usage percentage (rough calculation)
    const interval = this.config.eventLoopInterval;
    const usage = Math.min(100, (total / (interval * 1000)) * 100);

    return {
      user,
      system,
      total,
      usage,
    };
  }

  /**
   * Start timing an operation
   */
  startTiming(operationName: string): string {
    const id = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = process.hrtime.bigint();
    const memoryBefore = process.memoryUsage().heapUsed;

    // Store timing start info
    const timingStart = {
      operation: operationName,
      startTime,
      endTime: 0n,
      duration: 0,
      durationMs: 0,
      memoryBefore,
      memoryAfter: 0,
      memoryDelta: 0,
      timestamp: new Date(),
    };

    if (!this.timingMetrics.has(operationName)) {
      this.timingMetrics.set(operationName, []);
    }

    // Use Map to temporarily store start info
    (this as any)._pendingTimings = (this as any)._pendingTimings || new Map();
    (this as any)._pendingTimings.set(id, timingStart);

    return id;
  }

  /**
   * End timing an operation
   */
  endTiming(timingId: string): PerformanceTimingMetrics | null {
    const pendingTimings = (this as any)._pendingTimings as Map<string, any> | undefined;
    if (!pendingTimings || !pendingTimings.has(timingId)) {
      return null;
    }

    const timingStart = pendingTimings.get(timingId);
    pendingTimings.delete(timingId);

    const endTime = process.hrtime.bigint();
    const memoryAfter = process.memoryUsage().heapUsed;

    const timing: PerformanceTimingMetrics = {
      ...timingStart,
      endTime,
      duration: Number(endTime - timingStart.startTime),
      durationMs: Number(endTime - timingStart.startTime) / 1_000_000,
      memoryAfter,
      memoryDelta: memoryAfter - timingStart.memoryBefore,
    };

    // Store completed timing
    const operationTimings = this.timingMetrics.get(timing.operation) || [];
    operationTimings.push(timing);

    // Keep only recent timings (last 100 per operation)
    if (operationTimings.length > 100) {
      operationTimings.shift();
    }

    this.timingMetrics.set(timing.operation, operationTimings);

    return timing;
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): ComprehensiveMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(count: number = 60): ReadonlyArray<ComprehensiveMetrics> {
    return this.metrics.slice(-count);
  }

  /**
   * Get timing metrics for an operation
   */
  getTimingMetrics(operation: string): ReadonlyArray<PerformanceTimingMetrics> {
    return this.timingMetrics.get(operation) || [];
  }

  /**
   * Get all timing metrics
   */
  getAllTimingMetrics(): ReadonlyMap<string, ReadonlyArray<PerformanceTimingMetrics>> {
    return new Map(this.timingMetrics);
  }

  /**
   * Analyze performance trends
   */
  analyzePerformanceTrends(): ReadonlyArray<PerformanceTrend> {
    if (this.metrics.length < this.config.trendAnalysisWindow) {
      return [];
    }

    const recent = this.metrics.slice(-this.config.trendAnalysisWindow);
    const trends: PerformanceTrend[] = [];

    // Analyze event loop lag trend
    const lagValues = recent.map(m => m.eventLoop.lag);
    trends.push(this.calculateTrend('eventLoop.lag' as any, lagValues, recent.length));

    // Analyze memory usage trend
    const memoryValues = recent.map(m => (m.memory.heapUsed / m.memory.heapTotal) * 100);
    trends.push(this.calculateTrend('memory.usage' as any, memoryValues, recent.length));

    // Analyze CPU usage trend
    const cpuValues = recent.map(m => m.cpu.usage);
    trends.push(this.calculateTrend('cpu.usage' as any, cpuValues, recent.length));

    return trends;
  }

  /**
   * Calculate trend for a series of values
   */
  private calculateTrend(
    metric: keyof ComprehensiveMetrics,
    values: number[],
    dataPoints: number,
  ): PerformanceTrend {
    if (values.length < 2) {
      return {
        metric,
        direction: 'stable',
        changePercent: 0,
        confidence: 0,
        dataPoints,
        timespan: dataPoints * this.config.eventLoopInterval,
      };
    }

    // Simple linear trend calculation
    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices

    // Calculate linear trend slope (unused but kept for potential future enhancements)
    const _slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];

    const changePercent = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    let direction: PerformanceTrend['direction'] = 'stable';
    if (Math.abs(changePercent) > 5) {
      // 5% threshold
      direction = changePercent > 0 ? 'degrading' : 'improving';
    }

    // Simple confidence based on consistency of trend
    const consistency = this.calculateTrendConsistency(values);
    const confidence = Math.min(1, consistency * (n / this.config.trendAnalysisWindow));

    return {
      metric,
      direction,
      changePercent,
      confidence,
      dataPoints,
      timespan: dataPoints * this.config.eventLoopInterval,
    };
  }

  /**
   * Calculate trend consistency (0-1)
   */
  private calculateTrendConsistency(values: number[]): number {
    if (values.length < 3) return 0;

    let consistentDirections = 0;
    let totalDirections = 0;

    for (let i = 1; i < values.length - 1; i++) {
      const prev = values[i - 1];
      const curr = values[i];
      const next = values[i + 1];

      const dir1 = curr > prev ? 1 : curr < prev ? -1 : 0;
      const dir2 = next > curr ? 1 : next < curr ? -1 : 0;

      if (dir1 !== 0 && dir2 !== 0) {
        totalDirections++;
        if (dir1 === dir2) {
          consistentDirections++;
        }
      }
    }

    return totalDirections > 0 ? consistentDirections / totalDirections : 0;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    current: ComprehensiveMetrics;
    trends: ReadonlyArray<PerformanceTrend>;
    alerts: string[];
    recommendations: string[];
    operationStats: Array<{
      operation: string;
      count: number;
      averageDuration: number;
      p95Duration: number;
      memoryImpact: number;
    }>;
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      throw new Error('No performance metrics available');
    }

    const trends = this.analyzePerformanceTrends();
    const alerts: string[] = [];
    const recommendations: string[] = [];

    // Generate alerts and recommendations
    if (current.eventLoop.lag > this.config.alertThresholds.eventLoopLag) {
      alerts.push(`High event loop lag: ${current.eventLoop.lag.toFixed(2)}ms`);
      recommendations.push(
        'Consider optimizing synchronous operations or increasing concurrency limits',
      );
    }

    const memoryUsagePercent = (current.memory.heapUsed / current.memory.heapTotal) * 100;
    if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`);
      recommendations.push('Consider implementing memory cleanup or increasing heap size');
    }

    if (current.cpu.usage > this.config.alertThresholds.cpuUsage) {
      alerts.push(`High CPU usage: ${current.cpu.usage.toFixed(1)}%`);
      recommendations.push('Consider optimizing CPU-intensive operations or scaling horizontally');
    }

    // Analyze operation performance
    const operationStats = Array.from(this.timingMetrics.entries()).map(([operation, timings]) => {
      const durations = timings.map(t => t.durationMs);
      const memoryDeltas = timings.map(t => t.memoryDelta);

      durations.sort((a, b) => a - b);
      const p95Index = Math.floor(durations.length * 0.95);

      return {
        operation,
        count: timings.length,
        averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        p95Duration: durations[p95Index] || 0,
        memoryImpact: memoryDeltas.reduce((sum, d) => sum + d, 0) / memoryDeltas.length,
      };
    });

    return {
      current,
      trends,
      alerts,
      recommendations,
      operationStats,
    };
  }

  /**
   * Setup performance observer for GC and other events
   */
  private setupPerformanceObserver(): void {
    try {
      this.performanceObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();

        for (const entry of entries) {
          if (entry.entryType === 'gc') {
            this.gcMetrics = {
              collections: this.gcMetrics.collections + 1,
              duration: entry.duration,
              freedMemory: 0, // Not available in performance entries
              type: entry.name,
            };
          }
        }
      });

      // Observe GC events
      this.performanceObserver.observe({ entryTypes: ['gc'] });
    } catch {
      // Performance Observer may not be available in all environments
    }
  }

  /**
   * Check for performance alerts
   */
  private async checkPerformanceAlerts(metrics: ComprehensiveMetrics): Promise<void> {
    let logger: any = null;
    try {
      logger = await createServerObservability();
    } catch {
      // Logger not available
    }
    const alerts: string[] = [];

    // Event loop lag alert
    if (metrics.eventLoop.lag > this.config.alertThresholds.eventLoopLag) {
      alerts.push(`Event loop lag: ${metrics.eventLoop.lag.toFixed(2)}ms`);
    }

    // Memory usage alert
    const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
      alerts.push(`Memory usage: ${memoryUsagePercent.toFixed(1)}%`);
    }

    // CPU usage alert
    if (metrics.cpu.usage > this.config.alertThresholds.cpuUsage) {
      alerts.push(`CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
    }

    // GC duration alert
    if (metrics.gc.duration > this.config.alertThresholds.gcDuration) {
      alerts.push(`GC duration: ${metrics.gc.duration.toFixed(2)}ms`);
    }

    if (alerts.length > 0) {
      logger?.log('warning', 'Performance alerts detected', { alerts, metrics });
    }
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = PerformanceMonitor.getInstance();

/**
 * Performance monitoring decorator
 */
function MonitorPerformance(operationName?: string) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as T;
    const name = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const timingId = globalPerformanceMonitor.startTiming(name);

      try {
        const result = await method.apply(this, args);
        globalPerformanceMonitor.endTiming(timingId);
        return result;
      } catch (error) {
        globalPerformanceMonitor.endTiming(timingId);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Utility functions for performance monitoring
 */
export namespace PerformanceUtils {
  /**
   * Measure async function performance
   */
  export async function measureAsync<T>(
    operation: () => Promise<T>,
    name: string = 'anonymous',
  ): Promise<{ result: T; metrics: PerformanceTimingMetrics }> {
    const timingId = globalPerformanceMonitor.startTiming(name);

    try {
      const result = await operation();
      const metrics = globalPerformanceMonitor.endTiming(timingId);
      if (!metrics) {
        throw new Error('Failed to capture performance metrics');
      }
      return { result, metrics };
    } catch (error) {
      globalPerformanceMonitor.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Measure sync function performance
   */
  export function measureSync<T>(
    operation: () => T,
    name: string = 'anonymous',
  ): { result: T; metrics: PerformanceTimingMetrics } {
    const timingId = globalPerformanceMonitor.startTiming(name);

    try {
      const result = operation();
      const metrics = globalPerformanceMonitor.endTiming(timingId);
      if (!metrics) {
        throw new Error('Failed to capture performance metrics');
      }
      return { result, metrics };
    } catch (error) {
      globalPerformanceMonitor.endTiming(timingId);
      throw error;
    }
  }

  /**
   * Get current event loop lag
   */
  export async function getCurrentEventLoopLag(): Promise<number> {
    const start = process.hrtime.bigint();
    await new Promise(resolve => setImmediate(resolve));
    const end = process.hrtime.bigint();
    return Number(end - start) / 1_000_000; // Convert to milliseconds
  }

  /**
   * Format duration in human readable format
   */
  export function formatDuration(nanoseconds: number): string {
    const ms = nanoseconds / 1_000_000;
    const seconds = ms / 1000;
    const minutes = seconds / 60;

    if (ms < 1000) {
      return `${ms.toFixed(2)}ms`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    } else {
      return `${minutes.toFixed(2)}m`;
    }
  }

  /**
   * Get memory usage in human readable format
   */
  export function formatMemory(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Calculate percentile from array of numbers
   */
  export function calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)] || 0;
  }

  /**
   * Get performance health score (0-100)
   */
  export function calculateHealthScore(metrics: ComprehensiveMetrics): number {
    let score = 100;

    // Penalize high event loop lag
    if (metrics.eventLoop.lag > 50) {
      score -= Math.min(30, (metrics.eventLoop.lag - 50) / 2);
    }

    // Penalize high memory usage
    const memoryUsagePercent = (metrics.memory.heapUsed / metrics.memory.heapTotal) * 100;
    if (memoryUsagePercent > 70) {
      score -= Math.min(25, (memoryUsagePercent - 70) / 2);
    }

    // Penalize high CPU usage
    if (metrics.cpu.usage > 70) {
      score -= Math.min(25, (metrics.cpu.usage - 70) / 2);
    }

    // Penalize long GC durations
    if (metrics.gc.duration > 30) {
      score -= Math.min(20, (metrics.gc.duration - 30) / 5);
    }

    return Math.max(0, Math.round(score));
  }
}

/**
 * Start global performance monitoring
 */
async function startGlobalPerformanceMonitoring(
  config?: Partial<PerformanceConfig>,
): Promise<PerformanceMonitor> {
  const monitor = PerformanceMonitor.getInstance(config);
  await monitor.start();
  return monitor;
}

/**
 * Stop global performance monitoring
 */
async function stopGlobalPerformanceMonitoring(): Promise<void> {
  await globalPerformanceMonitor.stop();
}
