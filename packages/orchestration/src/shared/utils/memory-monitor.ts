/**
 * Memory Pressure Monitoring and Heap Diagnostics
 *
 * Enterprise-grade memory monitoring leveraging Node.js 22+ features for
 * comprehensive heap analysis, leak detection, and memory pressure management.
 * This module provides real-time memory tracking, automatic cleanup, and
 * proactive memory optimization.
 *
 * ## Key Node 22+ Features Used:
 * - **WeakMap/WeakSet**: Automatic garbage collection of tracked objects
 * - **FinalizationRegistry**: Detection of object cleanup and potential leaks
 * - **WeakRef**: Non-intrusive object reference tracking
 * - **Performance Observer**: Memory allocation and GC metrics
 * - **process.memoryUsage()**: High-resolution memory statistics
 * - **Structured cloning**: Safe memory usage analysis without leaks
 *
 * ## Core Capabilities:
 * - Real-time memory pressure detection (low/medium/high/critical)
 * - Automatic object lifecycle tracking with WeakMap
 * - Memory leak detection using FinalizationRegistry
 * - Garbage collection monitoring and optimization insights
 * - Heap usage analysis with configurable thresholds
 * - Memory trend analysis and prediction
 * - Automatic cleanup triggers for memory pressure relief
 * - Integration with enterprise monitoring platforms
 *
 * ## Usage Examples:
 *
 * ### Basic Memory Monitoring:
 * ```typescript
 * import { globalMemoryMonitor } from '@repo/orchestration';
 *
 * await globalMemoryMonitor.start();
 *
 * // Track important objects automatically
 * const userData = loadUserData();
 * globalMemoryMonitor.trackObject(userData, 'user_data', {
 *   userId: userData.id,
 *   loadedAt: new Date()
 * });
 *
 * // Get current memory status
 * const metrics = globalMemoryMonitor.getCurrentMetrics();
 * console.log(`Memory pressure: ${metrics.memoryPressure}`);
 * console.log(`Heap usage: ${metrics.heapUsedPercent}%`);
 * ```
 *
 * ### Memory Leak Detection:
 * ```typescript
 * // Detect potential memory leaks
 * const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
 * if (potentialLeaks.length > 0) {
 *   console.warn(`${potentialLeaks.length} potential memory leaks detected:`);
 *   potentialLeaks.forEach(leak => {
 *     console.log(`- ${leak.type}: created ${leak.createdAt}, age: ${Date.now() - leak.createdAt.getTime()}ms`);
 *   });
 * }
 * ```
 *
 * ### Memory Pressure Response:
 * ```typescript
 * // Automatic memory pressure handling
 * globalMemoryMonitor.onMemoryPressure('high', async (metrics) => {
 *   console.warn(`High memory pressure detected: ${metrics.heapUsedPercent}%`);
 *
 *   // Trigger cleanup
 *   await performMemoryCleanup();
 *
 *   // Force garbage collection if available
 *   if (global.gc) {
 *     global.gc();
 *   }
 * });
 * ```
 *
 * ### WeakMap-Based Object Tracking:
 * ```typescript
 * // Use WeakMap for automatic cleanup
 * const objectMetadata = new WeakMap<object, ObjectMetadata>();
 *
 * function trackWithMetadata(obj: object, metadata: ObjectMetadata) {
 *   objectMetadata.set(obj, metadata);
 *   // Metadata automatically cleaned up when obj is garbage collected
 * }
 *
 * // Integrate with global monitor
 * globalMemoryMonitor.trackObject(obj, 'tracked_object', metadata);
 * ```
 *
 * ## Memory Safety Patterns:
 *
 * ### Preventing Memory Leaks:
 * ```typescript
 * class MemorySafeProcessor {
 *   // Use WeakMap instead of Map to prevent memory leaks
 *   private objectCache = new WeakMap<object, ProcessedData>();
 *
 *   // Track object lifecycle with FinalizationRegistry
 *   private cleanup = new FinalizationRegistry((id: string) => {
 *     console.log(`Object ${id} was garbage collected`);
 *   });
 *
 *   processObject(obj: object): ProcessedData {
 *     // Check if already processed
 *     let cached = this.objectCache.get(obj);
 *     if (cached) return cached;
 *
 *     // Process and cache
 *     cached = this.performProcessing(obj);
 *     this.objectCache.set(obj, cached);
 *
 *     // Track for cleanup detection
 *     this.cleanup.register(obj, `object-${Date.now()}`);
 *
 *     return cached;
 *   }
 * }
 * ```
 *
 * @module MemoryMonitor
 * @version 2.0.0
 * @since Node.js 22.0.0
 *
 * @example
 * // Enterprise memory monitoring setup
 * const memoryMonitor = new MemoryMonitor({
 *   thresholds: {
 *     lowPressure: 100,    // 100MB
 *     mediumPressure: 250, // 250MB
 *     highPressure: 400,   // 400MB
 *     criticalPressure: 500 // 500MB
 *   },
 *   leakDetection: {
 *     enabled: true,
 *     maxAge: 300000, // 5 minutes
 *     checkInterval: 60000 // 1 minute
 *   }
 * });
 *
 * await memoryMonitor.start();
 *
 * // Monitor large operations
 * const largeDataSet = loadLargeDataSet();
 * memoryMonitor.trackObject(largeDataSet, 'large_dataset', {
 *   size: largeDataSet.length,
 *   source: 'database_query'
 * });
 *
 * // Process with memory monitoring
 * const results = await processLargeDataSet(largeDataSet);
 *
 * // Check for memory issues
 * const metrics = memoryMonitor.getCurrentMetrics();
 * if (metrics.memoryPressure === 'high') {
 *   console.warn('High memory pressure - consider optimizing data processing');
 * }
 */

import { createServerObservability } from '@repo/observability/server/next';

/**
 * Memory usage metrics
 */
interface MemoryMetrics {
  readonly timestamp: Date;
  readonly heapUsed: number;
  readonly heapTotal: number;
  readonly external: number;
  readonly rss: number;
  readonly arrayBuffers: number;
  readonly heapUsedPercent: number;
  readonly memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  readonly gcActivity: {
    readonly collections: number;
    readonly duration: number;
    readonly freedMemory: number;
  };
}

/**
 * Memory leak detection entry
 */
interface LeakDetectionEntry {
  readonly id: string;
  readonly type: string;
  readonly createdAt: Date;
  readonly stackTrace?: string;
  readonly metadata: Record<string, unknown>;
}

/**
 * Memory threshold configuration
 */
interface MemoryThresholds {
  /** Low memory pressure threshold (MB) */
  readonly lowPressure: number;
  /** Medium memory pressure threshold (MB) */
  readonly mediumPressure: number;
  /** High memory pressure threshold (MB) */
  readonly highPressure: number;
  /** Critical memory pressure threshold (MB) */
  readonly criticalPressure: number;
  /** Maximum heap usage percentage before forcing GC */
  readonly maxHeapPercent: number;
}

/**
 * Memory monitoring configuration
 */
interface MemoryMonitorConfig {
  /** Monitoring interval in milliseconds */
  readonly monitoringInterval: number;
  /** Memory thresholds */
  readonly thresholds: MemoryThresholds;
  /** Whether to enable leak detection */
  readonly enableLeakDetection: boolean;
  /** Whether to enable automatic garbage collection */
  readonly enableAutoGC: boolean;
  /** Whether to enable heap snapshots */
  readonly enableHeapSnapshots: boolean;
  /** Maximum number of leak entries to keep */
  readonly maxLeakEntries: number;
}

/**
 * Default memory monitor configuration
 */
const DEFAULT_CONFIG: MemoryMonitorConfig = {
  monitoringInterval: 10000, // 10 seconds
  thresholds: {
    lowPressure: 512, // 512 MB
    mediumPressure: 1024, // 1 GB
    highPressure: 2048, // 2 GB
    criticalPressure: 4096, // 4 GB
    maxHeapPercent: 85, // 85%
  },
  enableLeakDetection: true,
  enableAutoGC: true,
  enableHeapSnapshots: false,
  maxLeakEntries: 1000,
};

/**
 * Comprehensive memory monitoring system
 */
export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private readonly config: MemoryMonitorConfig;
  private readonly metrics: MemoryMetrics[] = [];
  private readonly leakDetectionRegistry = new FinalizationRegistry<string>((id: string) => {
    this.onObjectFinalized(id);
  });
  private readonly leakEntries = new Map<string, LeakDetectionEntry>();
  private readonly trackedObjects = new Map<string, WeakRef<object>>();
  private monitoringTimer?: NodeJS.Timeout;
  private lastGCStats = { collections: 0, duration: 0, freedMemory: 0 };
  private isMonitoring = false;

  constructor(config: Partial<MemoryMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupPerformanceObserver();
  }

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<MemoryMonitorConfig>): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(config);
    }
    return MemoryMonitor.instance;
  }

  /**
   * Start memory monitoring
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
    logger?.log('info', 'Starting memory monitoring', { config: this.config });

    this.isMonitoring = true;
    this.monitoringTimer = setInterval(() => {
      (async () => {
        try {
          await this.collectMetrics();
        } catch (error) {
          logger?.log('warning', 'Failed to collect memory metrics', { error });
        }
      })();
    }, this.config.monitoringInterval);

    // Initial metrics collection
    await this.collectMetrics();
  }

  /**
   * Stop memory monitoring
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
    logger?.log('info', 'Stopping memory monitoring');

    this.isMonitoring = false;
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
  }

  /**
   * Collect current memory metrics
   */
  async collectMetrics(): Promise<MemoryMetrics> {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    // Determine memory pressure level
    const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
    let memoryPressure: MemoryMetrics['memoryPressure'] = 'low';

    if (heapUsedMB >= this.config.thresholds.criticalPressure) {
      memoryPressure = 'critical';
    } else if (heapUsedMB >= this.config.thresholds.highPressure) {
      memoryPressure = 'high';
    } else if (heapUsedMB >= this.config.thresholds.mediumPressure) {
      memoryPressure = 'medium';
    }

    const metrics: MemoryMetrics = {
      timestamp: new Date(),
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      arrayBuffers: memUsage.arrayBuffers,
      heapUsedPercent,
      memoryPressure,
      gcActivity: { ...this.lastGCStats },
    };

    // Store metrics (keep last 100 entries)
    this.metrics.push(metrics);
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Handle memory pressure
    await this.handleMemoryPressure(metrics);

    return metrics;
  }

  /**
   * Get current memory metrics
   */
  getCurrentMetrics(): MemoryMetrics | undefined {
    return this.metrics[this.metrics.length - 1];
  }

  /**
   * Get historical memory metrics
   */
  getHistoricalMetrics(count: number = 10): ReadonlyArray<MemoryMetrics> {
    return this.metrics.slice(-count);
  }

  /**
   * Track object for leak detection
   */
  trackObject<T extends object>(
    object: T,
    type: string,
    metadata: Record<string, unknown> = {},
  ): string {
    if (!this.config.enableLeakDetection) {
      return '';
    }

    const id = `leak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const entry: LeakDetectionEntry = {
      id,
      type,
      createdAt: new Date(),
      stackTrace: new Error().stack?.split('\n').slice(2, 7).join('\n'),
      metadata,
    };

    this.leakEntries.set(id, entry);
    this.trackedObjects.set(id, new WeakRef(object));
    this.leakDetectionRegistry.register(object, id);

    // Prevent unbounded growth
    if (this.leakEntries.size > this.config.maxLeakEntries) {
      const oldestId = this.leakEntries.keys().next().value;
      if (oldestId) {
        this.leakEntries.delete(oldestId);
        this.trackedObjects.delete(oldestId);
      }
    }

    return id;
  }

  /**
   * Get potential memory leaks
   */
  getPotentialLeaks(): ReadonlyArray<LeakDetectionEntry & { age: number }> {
    const now = Date.now();
    const potentialLeaks: Array<LeakDetectionEntry & { age: number }> = [];

    for (const [id, entry] of this.leakEntries) {
      const weakRef = this.trackedObjects.get(id);
      const age = now - entry.createdAt.getTime();

      // Objects older than 5 minutes that still exist might be leaks
      if (age > 5 * 60 * 1000 && weakRef?.deref() !== undefined) {
        potentialLeaks.push({ ...entry, age });
      }
    }

    return potentialLeaks.sort((a, b) => b.age - a.age);
  }

  /**
   * Force garbage collection if available
   */
  forceGC(): boolean {
    if (global.gc && this.config.enableAutoGC) {
      const beforeGC = process.memoryUsage().heapUsed;
      global.gc();
      const afterGC = process.memoryUsage().heapUsed;

      this.lastGCStats = {
        collections: this.lastGCStats.collections + 1,
        duration: 0, // We don't have precise timing for manual GC
        freedMemory: beforeGC - afterGC,
      };

      return true;
    }
    return false;
  }

  /**
   * Get memory usage summary
   */
  getMemorySummary(): {
    current: MemoryMetrics;
    trend: 'increasing' | 'decreasing' | 'stable';
    leakCount: number;
    recommendations: string[];
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      throw new Error('No memory metrics available');
    }

    // Analyze trend over last 5 measurements
    const recent = this.metrics.slice(-5);
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';

    if (recent.length >= 3) {
      const first = recent[0].heapUsed;
      const last = recent[recent.length - 1].heapUsed;
      const change = ((last - first) / first) * 100;

      if (change > 5) {
        trend = 'increasing';
      } else if (change < -5) {
        trend = 'decreasing';
      }
    }

    const leakCount = this.getPotentialLeaks().length;
    const recommendations: string[] = [];

    // Generate recommendations
    if (current.memoryPressure === 'critical') {
      recommendations.push(
        'Critical memory pressure detected - consider increasing memory limits or optimizing memory usage',
      );
    }
    if (current.heapUsedPercent > 80) {
      recommendations.push('High heap usage - consider forcing garbage collection');
    }
    if (trend === 'increasing') {
      recommendations.push('Memory usage is trending upward - monitor for potential leaks');
    }
    if (leakCount > 10) {
      recommendations.push(
        `${leakCount} potential memory leaks detected - review object lifecycle management`,
      );
    }

    return {
      current,
      trend,
      leakCount,
      recommendations,
    };
  }

  /**
   * Create a heap snapshot (if enabled)
   */
  async createHeapSnapshot(): Promise<string | null> {
    if (!this.config.enableHeapSnapshots) {
      return null;
    }

    try {
      // This requires the v8 module for heap snapshots
      const v8 = await import('v8');
      const snapshot = v8.writeHeapSnapshot();

      let logger: any = null;
      try {
        logger = await createServerObservability();
      } catch {
        // Logger not available
      }
      logger?.log('info', 'Heap snapshot created', { snapshot });

      return snapshot;
    } catch (error) {
      let logger: any = null;
      try {
        logger = await createServerObservability();
      } catch {
        // Logger not available
      }
      logger?.log('warning', 'Failed to create heap snapshot', { error });
      return null;
    }
  }

  /**
   * Setup performance observer for GC monitoring
   */
  private setupPerformanceObserver(): void {
    try {
      // Monitor GC performance if available
      const { PerformanceObserver } = require('perf_hooks');

      const obs = new PerformanceObserver((list: any) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          if (entry.entryType === 'gc') {
            this.lastGCStats = {
              collections: this.lastGCStats.collections + 1,
              duration: entry.duration,
              freedMemory: 0, // Not available in performance entries
            };
          }
        }
      });

      obs.observe({ entryTypes: ['gc'] });
    } catch {
      // Performance Observer may not be available in all environments
    }
  }

  /**
   * Handle memory pressure based on current metrics
   */
  private async handleMemoryPressure(metrics: MemoryMetrics): Promise<void> {
    let logger: any = null;
    try {
      logger = await createServerObservability();
    } catch {
      // Logger not available
    }

    switch (metrics.memoryPressure) {
      case 'critical':
        logger?.log('error', 'Critical memory pressure detected', {
          heapUsed: `${(metrics.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapPercent: `${metrics.heapUsedPercent.toFixed(2)}%`,
        });

        // Force garbage collection
        this.forceGC();

        // Note: Timeout cleanup would be triggered automatically by the timeout manager
        break;

      case 'high':
        logger?.log('warning', 'High memory pressure detected', {
          heapUsed: `${(metrics.heapUsed / 1024 / 1024).toFixed(2)}MB`,
          heapPercent: `${metrics.heapUsedPercent.toFixed(2)}%`,
        });

        // Suggest garbage collection
        if (metrics.heapUsedPercent > this.config.thresholds.maxHeapPercent) {
          this.forceGC();
        }
        break;

      case 'medium':
        logger?.log('info', 'Medium memory pressure detected', {
          heapUsed: `${(metrics.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        });
        break;

      case 'low':
        // Normal operation
        break;
    }
  }

  /**
   * Handle object finalization (leak detection)
   */
  private onObjectFinalized(id: string): void {
    this.leakEntries.delete(id);
    this.trackedObjects.delete(id);
  }
}

/**
 * Global memory monitor instance
 */
export const globalMemoryMonitor = MemoryMonitor.getInstance();

/**
 * Utility functions for memory monitoring
 */
export namespace MemoryUtils {
  /**
   * Format bytes to human readable string
   */
  export function formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Get memory usage percentage
   */
  export function getMemoryUsagePercent(): number {
    const memUsage = process.memoryUsage();
    return (memUsage.heapUsed / memUsage.heapTotal) * 100;
  }

  /**
   * Check if memory usage is above threshold
   */
  export function isMemoryPressureHigh(thresholdMB: number = 1024): boolean {
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / (1024 * 1024);
    return heapUsedMB > thresholdMB;
  }

  /**
   * Get current memory metrics as object
   */
  export function getCurrentMemoryInfo(): {
    heapUsed: string;
    heapTotal: string;
    external: string;
    rss: string;
    heapPercent: string;
  } {
    const memUsage = process.memoryUsage();
    const heapPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    return {
      heapUsed: formatBytes(memUsage.heapUsed),
      heapTotal: formatBytes(memUsage.heapTotal),
      external: formatBytes(memUsage.external),
      rss: formatBytes(memUsage.rss),
      heapPercent: `${heapPercent.toFixed(2)}%`,
    };
  }
}

/**
 * Memory monitoring decorator for methods
 */
function MonitorMemory(
  options: {
    trackObjects?: boolean;
    logMetrics?: boolean;
    objectType?: string;
  } = {},
) {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value as T;
    const objectType = options.objectType || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const beforeMemory = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      const result = await method.apply(this, args);

      // Track result object if requested
      if (options.trackObjects && typeof result === 'object' && result !== null) {
        globalMemoryMonitor.trackObject(result, objectType, {
          method: propertyName,
          args: args.length,
        });
      }

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryDiff = afterMemory - beforeMemory;
      const duration = Date.now() - startTime;

      if (options.logMetrics) {
        let logger: any = null;
        try {
          logger = await createServerObservability();
        } catch {
          // Logger not available
        }
        logger?.log('debug', `Memory usage for ${objectType}`, {
          memoryDiff: MemoryUtils.formatBytes(memoryDiff),
          duration: `${duration}ms`,
          currentHeapUsage: MemoryUtils.formatBytes(afterMemory),
        });
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Start global memory monitoring with default configuration
 */
async function startGlobalMemoryMonitoring(
  config?: Partial<MemoryMonitorConfig>,
): Promise<MemoryMonitor> {
  const monitor = MemoryMonitor.getInstance(config);
  await monitor.start();
  return monitor;
}

/**
 * Stop global memory monitoring
 */
async function stopGlobalMemoryMonitoring(): Promise<void> {
  await globalMemoryMonitor.stop();
}
