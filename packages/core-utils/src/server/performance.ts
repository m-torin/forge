/**
 * Node.js 22+ Performance Observer Integration
 * Provides performance monitoring, profiling, and optimization insights
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { PerformanceObserver, performance } from 'node:perf_hooks';
import { safeThrowIfAborted } from './abort-support';

export interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    arrayBuffers?: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
  // Node.js 22+ enhancements
  hrDuration?: number;
  v8Stats?: {
    heapDelta: {
      totalHeapSize: number;
      totalHeapSizeExecutable: number;
      usedHeapSize: number;
      heapSizeLimit: number;
    };
    timeDelta: number;
  };
  // Performance insights
  gcCount?: number;
  eventLoopLag?: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  detail?: any;
}

export interface PerformanceSummary {
  totalOperations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMemoryAllocated: number;
  peakMemoryUsage: number;
  slowestOperations: PerformanceEntry[];
  memoryHeavyOperations: PerformanceEntry[];
}

export interface StreamingPerformanceChunk {
  timestamp: string;
  operationName: string;
  metrics: PerformanceMetrics;
  isComplete: boolean;
  chunkIndex: number;
}

/**
 * Enhanced Performance Monitor with Node.js 22+ features and security hardening
 */
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private entries: Map<string, PerformanceEntry[]> = new Map();
  private isObserving: boolean = false;
  private asyncLocalStorage = new AsyncLocalStorage<{ operationId: string; startTime: number }>();
  private operationCounter = 0;
  private memorySnapshots: Map<string, NodeJS.MemoryUsage> = new Map();

  // Security and performance enhancements
  private readonly maxEntries = 10000; // Prevent memory leaks
  private readonly maxOperationNameLength = 100; // Prevent DoS via long names
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly performanceCache = new Map<string, { value: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  // Node.js 22+ optimization tracking
  private v8Stats: any = null;
  private heapProfiler: any = null;

  constructor() {
    this.setupObserver();
    // Initialize V8 features asynchronously
    this.initializeV8Features().catch(error => {
      console.debug('Failed to initialize V8 features:', error);
    });

    // Setup periodic cleanup to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000);

    // Unref to not block process exit
    this.cleanupInterval.unref();
  }

  private async initializeV8Features(): Promise<void> {
    try {
      // Node.js 22+ V8 integration for advanced profiling with ESM import
      const v8 = await import('node:v8');
      this.v8Stats = v8;

      // Enable heap profiling if available (Node.js 22+)
      if (typeof v8.writeHeapSnapshot === 'function') {
        this.heapProfiler = v8;
      }
    } catch (error) {
      // V8 features not available, continue without them
      console.debug('V8 advanced features not available:', error);
    }
  }

  private setupObserver(): void {
    if (this.observer) return;

    this.observer = new PerformanceObserver(list => {
      const perfEntries = list.getEntries();

      for (const entry of perfEntries) {
        const operationName = entry.name.split(':')[0];

        if (!this.entries.has(operationName)) {
          this.entries.set(operationName, []);
        }

        this.entries.get(operationName)!.push({
          name: entry.name,
          entryType: entry.entryType,
          startTime: entry.startTime,
          duration: entry.duration,
          detail: (entry as any).detail,
        });
      }
    });
  }

  /**
   * Start performance monitoring with Node.js 22+ enhancements
   */
  startObserving(): void {
    if (!this.observer || this.isObserving) return;

    try {
      // Enhanced entry types for Node.js 22+
      const entryTypes: Array<any> = ['measure', 'mark'];

      // Add Node.js 22+ specific entry types if available
      const additionalTypes = [
        'function',
        'http',
        'dns',
        'gc',
        'resource',
        'navigation',
        'user-timing',
      ];
      for (const type of additionalTypes) {
        if (this.supportsEntryType(type)) {
          entryTypes.push(type);
        }
      }

      this.observer.observe({ entryTypes } as any);
      this.isObserving = true;

      console.debug(`Performance monitoring started with ${entryTypes.length} entry types`);
    } catch (error) {
      console.warn('Failed to start performance monitoring:', error);

      try {
        this.observer.observe({ entryTypes: ['measure', 'mark'] });
        this.isObserving = true;
      } catch (fallbackError) {
        console.error('Failed to start even basic performance monitoring:', fallbackError);
      }
    }
  }

  private supportsEntryType(type: string): boolean {
    try {
      // Check if PerformanceObserver has supportedEntryTypes (Node.js 18+)
      const supportedTypes = (PerformanceObserver as any).supportedEntryTypes;
      return Array.isArray(supportedTypes) && supportedTypes.includes(type);
    } catch {
      return false;
    }
  }

  /**
   * Stop performance monitoring
   */
  stopObserving(): void {
    if (!this.observer || !this.isObserving) return;

    this.observer.disconnect();
    this.isObserving = false;
  }

  /**
   * Enhanced async operation measurement with Node.js 22+ optimizations
   */
  async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    signal?: AbortSignal,
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    safeThrowIfAborted(signal);

    // Security: Validate operation name to prevent abuse
    if (operationName.length > this.maxOperationNameLength) {
      throw new Error(
        `Operation name too long: ${operationName.length} > ${this.maxOperationNameLength}`,
      );
    }

    // Check cache for repeated identical operations
    const cacheKey = `${operationName}_${operation.toString().substring(0, 50)}`;
    const cached = this.performanceCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      // Return cached result for identical operations (optimization)
      const result = await operation();
      return { result, metrics: cached.value };
    }

    const operationId = `${operationName}:${++this.operationCounter}`;
    const startMark = `${operationId}:start`;
    const endMark = `${operationId}:end`;

    // Enhanced initial measurements with Node.js 22+ features
    const initialMemory = process.memoryUsage();
    const initialCpu = process.cpuUsage();
    const initialV8Stats = this.v8Stats ? this.captureV8Stats() : null;

    this.memorySnapshots.set(operationId, initialMemory);

    performance.mark(startMark);
    const startTime = performance.now();
    const startTimeHr = process.hrtime.bigint();

    try {
      const result = await this.asyncLocalStorage.run({ operationId, startTime }, () =>
        operation(),
      );

      safeThrowIfAborted(signal);

      const endTime = performance.now();
      const endTimeHr = process.hrtime.bigint();
      performance.mark(endMark);
      performance.measure(operationId, startMark, endMark);

      const finalMemory = process.memoryUsage();
      const finalCpu = process.cpuUsage(initialCpu);
      const finalV8Stats = this.v8Stats ? this.captureV8Stats() : null;

      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        startTime,
        endTime,
        memoryUsage: finalMemory,
        cpuUsage: finalCpu,
        // Node.js 22+ high resolution timing
        hrDuration: Number(endTimeHr - startTimeHr) / 1000000, // Convert to milliseconds
        // V8 specific metrics if available
        v8Stats:
          initialV8Stats && finalV8Stats
            ? this.calculateV8Delta(initialV8Stats, finalV8Stats)
            : undefined,
      };

      // Cache the metrics for similar operations
      this.performanceCache.set(cacheKey, {
        value: metrics,
        timestamp: Date.now(),
      });

      // Store entry with size limit
      this.addPerformanceEntry(operationName, {
        name: operationId,
        entryType: 'measure',
        startTime,
        duration: endTime - startTime,
        detail: { metrics, operationName },
      });

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(operationId);
      this.memorySnapshots.delete(operationId);

      return { result, metrics };
    } catch (error) {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      this.memorySnapshots.delete(operationId);
      throw error;
    }
  }

  private captureV8Stats(): any {
    if (!this.v8Stats) return null;

    try {
      return {
        heapStatistics: this.v8Stats.getHeapStatistics(),
        heapSpaceStatistics: this.v8Stats.getHeapSpaceStatistics(),
        timestamp: Date.now(),
      };
    } catch {
      return null;
    }
  }

  private calculateV8Delta(initial: any, final: any): any {
    if (!initial || !final) return null;

    try {
      const heap = final.heapStatistics;
      const initialHeap = initial.heapStatistics;

      return {
        heapDelta: {
          totalHeapSize: heap.total_heap_size - initialHeap.total_heap_size,
          totalHeapSizeExecutable:
            heap.total_heap_size_executable - initialHeap.total_heap_size_executable,
          usedHeapSize: heap.used_heap_size - initialHeap.used_heap_size,
          heapSizeLimit: heap.heap_size_limit,
        },
        timeDelta: final.timestamp - initial.timestamp,
      };
    } catch {
      return null;
    }
  }

  private addPerformanceEntry(operationName: string, entry: PerformanceEntry): void {
    if (!this.entries.has(operationName)) {
      this.entries.set(operationName, []);
    }

    const entries = this.entries.get(operationName)!;
    entries.push(entry);

    // Prevent memory leaks by limiting entries per operation
    if (entries.length > 1000) {
      entries.splice(0, entries.length - 1000); // Keep only last 1000 entries
    }

    // Global entry limit
    const totalEntries = Array.from(this.entries.values()).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    if (totalEntries > this.maxEntries) {
      this.performCleanup();
    }
  }

  private performCleanup(): void {
    // Remove old cache entries
    const now = Date.now();
    for (const [key, cached] of this.performanceCache.entries()) {
      if (now - cached.timestamp > this.CACHE_TTL) {
        this.performanceCache.delete(key);
      }
    }

    // Trim entries if over limit
    const totalEntries = Array.from(this.entries.values()).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    if (totalEntries > this.maxEntries) {
      // Remove oldest entries from each operation
      for (const [operationName, entries] of this.entries.entries()) {
        if (entries.length > 500) {
          entries.splice(0, entries.length - 500);
        }
      }
    }

    // Clean old memory snapshots
    if (this.memorySnapshots.size > 100) {
      const oldestKeys = Array.from(this.memorySnapshots.keys()).slice(
        0,
        this.memorySnapshots.size - 100,
      );
      oldestKeys.forEach(key => this.memorySnapshots.delete(key));
    }
  }

  /**
   * Get performance summary for all monitored operations
   */
  getSummary(): PerformanceSummary {
    const allEntries: PerformanceEntry[] = [];
    let totalDuration = 0;
    let totalMemory = 0;
    let peakMemory = 0;

    for (const entries of this.entries.values()) {
      allEntries.push(...entries);
    }

    if (allEntries.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        totalMemoryAllocated: 0,
        peakMemoryUsage: 0,
        slowestOperations: [],
        memoryHeavyOperations: [],
      };
    }

    // Calculate statistics
    const durations = allEntries.map(e => e.duration);
    totalDuration = durations.reduce((sum, d) => sum + d, 0);

    const slowestOperations = [...allEntries].sort((a, b) => b.duration - a.duration).slice(0, 5);

    const memoryHeavyOperations = [...allEntries]
      .filter(e => e.detail?.memoryDelta)
      .sort((a, b) => (b.detail?.memoryDelta || 0) - (a.detail?.memoryDelta || 0))
      .slice(0, 5);

    return {
      totalOperations: allEntries.length,
      averageDuration: totalDuration / allEntries.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      totalMemoryAllocated: totalMemory,
      peakMemoryUsage: peakMemory,
      slowestOperations,
      memoryHeavyOperations,
    };
  }

  /**
   * Stream performance metrics in real-time using AsyncGenerator
   */
  async *streamPerformanceMetrics(
    options: {
      chunkSize?: number;
      signal?: AbortSignal;
      filterByOperation?: string[];
      minDurationThreshold?: number;
    } = {},
  ): AsyncGenerator<StreamingPerformanceChunk, void, unknown> {
    const { chunkSize = 10, signal, filterByOperation = [], minDurationThreshold = 0 } = options;

    let chunkIndex = 0;

    // Stream existing collected entries
    for (const [operationName, entries] of this.entries) {
      safeThrowIfAborted(signal);

      if (filterByOperation.length > 0 && !filterByOperation.includes(operationName)) {
        continue;
      }

      const filteredEntries = entries.filter(e => e.duration >= minDurationThreshold);

      for (let i = 0; i < filteredEntries.length; i += chunkSize) {
        safeThrowIfAborted(signal);

        const chunk = filteredEntries.slice(i, i + chunkSize);

        for (const entry of chunk) {
          const memorySnapshot = this.memorySnapshots.get(entry.name) || process.memoryUsage();

          yield {
            timestamp: new Date().toISOString(),
            operationName,
            metrics: {
              duration: entry.duration,
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              memoryUsage: {
                heapUsed: memorySnapshot.heapUsed,
                heapTotal: memorySnapshot.heapTotal,
                external: memorySnapshot.external,
                rss: memorySnapshot.rss,
              },
            },
            isComplete: false,
            chunkIndex: chunkIndex++,
          };

          if (chunkIndex % 5 === 0) {
            await new Promise(resolve => setImmediate(resolve));
          }
        }
      }
    }

    // Final completion chunk
    yield {
      timestamp: new Date().toISOString(),
      operationName: 'monitoring_complete',
      metrics: {
        duration: 0,
        startTime: performance.now(),
        endTime: performance.now(),
        memoryUsage: process.memoryUsage(),
      },
      isComplete: true,
      chunkIndex: chunkIndex++,
    };
  }

  /**
   * Get performance metrics for a specific operation
   */
  getOperationMetrics(operationName: string): PerformanceEntry[] {
    return this.entries.get(operationName) || [];
  }

  /**
   * Clear all collected performance data
   */
  clear(): void {
    this.entries.clear();
    this.memorySnapshots.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  /**
   * Get current memory pressure indicator
   */
  getMemoryPressure(): {
    level: 'low' | 'medium' | 'high' | 'critical';
    usage: NodeJS.MemoryUsage;
    recommendation: string;
  } {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const heapTotalMB = usage.heapTotal / 1024 / 1024;
    const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (heapUsagePercent < 50) {
      return {
        level: 'low',
        usage,
        recommendation: 'Memory usage is healthy',
      };
    } else if (heapUsagePercent < 75) {
      return {
        level: 'medium',
        usage,
        recommendation: 'Consider optimizing memory-intensive operations',
      };
    } else if (heapUsagePercent < 90) {
      return {
        level: 'high',
        usage,
        recommendation:
          'Memory usage is high - review object allocations and implement caching strategies',
      };
    } else {
      return {
        level: 'critical',
        usage,
        recommendation:
          'Critical memory usage - immediate optimization required, consider increasing heap size',
      };
    }
  }

  /**
   * Analyze performance bottlenecks
   */
  analyzeBottlenecks(): {
    slowOperations: string[];
    memoryLeaks: string[];
    recommendations: string[];
  } {
    const summary = this.getSummary();
    const slowOperations: string[] = [];
    const memoryLeaks: string[] = [];
    const recommendations: string[] = [];

    // Identify slow operations (> 100ms average)
    for (const [operationName, entries] of this.entries) {
      const avgDuration = entries.reduce((sum, e) => sum + e.duration, 0) / entries.length;
      if (avgDuration > 100) {
        slowOperations.push(`${operationName} (avg: ${avgDuration.toFixed(2)}ms)`);
      }
    }

    // Memory pressure analysis
    const memoryPressure = this.getMemoryPressure();
    if (memoryPressure.level === 'high' || memoryPressure.level === 'critical') {
      recommendations.push(
        `Address ${memoryPressure.level} memory pressure: ${memoryPressure.recommendation}`,
      );
    }

    // Performance recommendations
    if (slowOperations.length > 0) {
      recommendations.push(
        'Optimize identified slow operations using streaming, caching, or async patterns',
      );
    }

    if (summary.totalOperations > 1000) {
      recommendations.push(
        'Consider implementing performance result caching for frequently called operations',
      );
    }

    return {
      slowOperations,
      memoryLeaks,
      recommendations,
    };
  }

  /**
   * Enhanced cleanup with Node.js 22+ considerations
   */
  dispose(): void {
    // Stop monitoring
    this.stopObserving();

    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Clear all data
    this.clear();

    // Clear caches
    this.performanceCache.clear();
    this.memorySnapshots.clear();

    // Dispose observer
    this.observer = null;

    // Clear V8 references
    this.v8Stats = null;
    this.heapProfiler = null;

    console.debug('Performance monitor disposed');
  }

  /**
   * Generate heap snapshot for debugging (Node.js 22+)
   */
  generateHeapSnapshot(filename?: string): string | null {
    if (!this.heapProfiler) {
      console.warn('Heap profiler not available');
      return null;
    }

    try {
      const snapshotFile = filename || `heap-${Date.now()}.heapsnapshot`;
      this.heapProfiler.writeHeapSnapshot(snapshotFile);
      return snapshotFile;
    } catch (error) {
      console.error('Failed to generate heap snapshot:', error);
      return null;
    }
  }

  /**
   * Get Node.js 22+ specific performance insights
   */
  getAdvancedInsights(): {
    v8Stats: any;
    eventLoopUtilization: any;
    resourceUsage: any;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let v8Stats = null;
    let eventLoopUtilization = null;
    let resourceUsage = null;

    // V8 heap statistics
    if (this.v8Stats) {
      try {
        v8Stats = {
          heap: this.v8Stats.getHeapStatistics(),
          heapSpaces: this.v8Stats.getHeapSpaceStatistics(),
        };

        const heap = v8Stats.heap;
        if (heap.used_heap_size / heap.heap_size_limit > 0.8) {
          recommendations.push('High heap usage detected - consider memory optimization');
        }

        if (heap.total_heap_size > heap.used_heap_size * 2) {
          recommendations.push('Heap fragmentation detected - consider forced GC');
        }
      } catch (error) {
        console.debug('Failed to get V8 stats:', error);
      }
    }

    // Event loop utilization (Node.js 14+)
    try {
      const { performance } = require('node:perf_hooks');
      if (performance.eventLoopUtilization) {
        eventLoopUtilization = performance.eventLoopUtilization();

        if (eventLoopUtilization.utilization > 0.7) {
          recommendations.push('High event loop utilization - consider async optimization');
        }
      }
    } catch (error) {
      console.debug('Event loop utilization not available:', error);
    }

    // Resource usage (Node.js 12+)
    try {
      if (process.resourceUsage) {
        resourceUsage = process.resourceUsage();

        if (resourceUsage.userCPUTime > resourceUsage.systemCPUTime * 10) {
          recommendations.push('High user CPU time - optimize computational operations');
        }
      }
    } catch (error) {
      console.debug('Resource usage not available:', error);
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges');
    }

    return {
      v8Stats,
      eventLoopUtilization,
      resourceUsage,
      recommendations,
    };
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Decorator for automatically measuring function performance
 */
export function measurePerformance(operationName?: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value!;
    const opName = operationName || `${target.constructor.name}.${String(propertyKey)}`;

    descriptor.value = async function (this: any, ...args: any[]) {
      const { result } = await globalPerformanceMonitor.measureOperation(opName, () =>
        originalMethod.apply(this, args),
      );
      return result;
    } as T;

    return descriptor;
  };
}

/**
 * Utility function for measuring ad-hoc operations
 */
export async function measureAsync<T>(
  operationName: string,
  operation: () => Promise<T>,
  signal?: AbortSignal,
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  return globalPerformanceMonitor.measureOperation(operationName, operation, signal);
}

/**
 * Get performance insights and recommendations
 */
export function getPerformanceInsights(): {
  summary: PerformanceSummary;
  memoryPressure: ReturnType<PerformanceMonitor['getMemoryPressure']>;
  bottlenecks: ReturnType<PerformanceMonitor['analyzeBottlenecks']>;
  uptime: number;
} {
  return {
    summary: globalPerformanceMonitor.getSummary(),
    memoryPressure: globalPerformanceMonitor.getMemoryPressure(),
    bottlenecks: globalPerformanceMonitor.analyzeBottlenecks(),
    uptime: process.uptime(),
  };
}
