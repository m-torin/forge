/**
 * Advanced Memory Monitoring and Garbage Collection Management
 *
 * This utility provides comprehensive memory monitoring with automatic garbage collection
 * triggers and memory pressure detection to prevent out-of-memory crashes.
 */

import { randomUUID } from 'crypto';
import { freemem, totalmem } from 'os';
import { performance } from 'perf_hooks';

export interface MemoryPressureLevel {
  level: 'low' | 'medium' | 'high' | 'critical';
  percentage: number;
  shouldPause: boolean;
  shouldGC: boolean;
  recommendedAction: string;
}

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  systemFree: number;
  systemTotal: number;
  systemUsed: number;
  pressure: MemoryPressureLevel;
}

export interface GCTriggerResult {
  triggered: boolean;
  beforeHeapMB: number;
  afterHeapMB: number;
  freedMB: number;
  duration: number;
  reason: string;
}

export interface MemoryMonitorOptions {
  /** Warning threshold percentage (default: 75) */
  warningThreshold?: number;
  /** Critical threshold percentage (default: 85) */
  criticalThreshold?: number;
  /** Enable automatic GC triggers (default: true) */
  enableAutoGC?: boolean;
  /** GC trigger threshold percentage (default: 80) */
  gcThreshold?: number;
  /** Maximum GC attempts per monitoring cycle (default: 3) */
  maxGCAttempts?: number;
  /** Enable memory snapshots for debugging (default: false) */
  enableSnapshots?: boolean;
  /** Snapshot interval in milliseconds (default: 30000) */
  snapshotInterval?: number;
}

export type MemoryEventCallback = (snapshot: MemorySnapshot) => void;
export type GCEventCallback = (result: GCTriggerResult) => void;

export class MemoryMonitor {
  private options: Required<MemoryMonitorOptions>;
  private snapshots: MemorySnapshot[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private snapshotInterval?: NodeJS.Timeout;
  private gcHistory: GCTriggerResult[] = [];
  private memoryCallbacks: Set<MemoryEventCallback> = new Set();
  private gcCallbacks: Set<GCEventCallback> = new Set();
  private sessionId: string;

  constructor(options: MemoryMonitorOptions = {}) {
    this.options = {
      warningThreshold: options.warningThreshold ?? 75,
      criticalThreshold: options.criticalThreshold ?? 85,
      enableAutoGC: options.enableAutoGC ?? true,
      gcThreshold: options.gcThreshold ?? 80,
      maxGCAttempts: options.maxGCAttempts ?? 3,
      enableSnapshots: options.enableSnapshots ?? false,
      snapshotInterval: options.snapshotInterval ?? 30000,
    };

    this.sessionId = `monitor_${randomUUID().slice(0, 8)}`;
  }

  /**
   * Start monitoring memory usage
   */
  public startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Main monitoring loop
    this.monitoringInterval = setInterval(() => {
      void this.checkMemoryPressure();
    }, intervalMs);

    // Snapshot loop (if enabled)
    if (this.options.enableSnapshots) {
      this.snapshotInterval = setInterval(() => {
        this.takeSnapshot();
      }, this.options.snapshotInterval);
    }

    // Initial check
    void this.checkMemoryPressure();
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = undefined;
    }
  }

  /**
   * Register callback for memory events
   */
  public onMemoryEvent(callback: MemoryEventCallback): void {
    this.memoryCallbacks.add(callback);
  }

  /**
   * Remove memory event callback
   */
  public offMemoryEvent(callback: MemoryEventCallback): void {
    this.memoryCallbacks.delete(callback);
  }

  /**
   * Register callback for GC events
   */
  public onGCEvent(callback: GCEventCallback): void {
    this.gcCallbacks.add(callback);
  }

  /**
   * Remove GC event callback
   */
  public offGCEvent(callback: GCEventCallback): void {
    this.gcCallbacks.delete(callback);
  }

  /**
   * Get current memory snapshot
   */
  public getMemorySnapshot(): MemorySnapshot {
    const memUsage = process.memoryUsage();
    const systemTotal = totalmem();
    const systemFree = freemem();
    const systemUsed = systemTotal - systemFree;

    const pressure = this.calculateMemoryPressure(memUsage, systemUsed, systemTotal);

    return {
      timestamp: Date.now(),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024), // MB
      systemFree: Math.round(systemFree / 1024 / 1024), // MB
      systemTotal: Math.round(systemTotal / 1024 / 1024), // MB
      systemUsed: Math.round(systemUsed / 1024 / 1024), // MB
      pressure,
    };
  }

  /**
   * Manually trigger garbage collection with monitoring
   */
  public async triggerGC(reason: string = 'manual'): Promise<GCTriggerResult> {
    const beforeSnapshot = this.getMemorySnapshot();
    const startTime = performance.now();

    if (!global.gc) {
      return {
        triggered: false,
        beforeHeapMB: beforeSnapshot.heapUsed,
        afterHeapMB: beforeSnapshot.heapUsed,
        freedMB: 0,
        duration: 0,
        reason: 'GC not available (run with --expose-gc)',
      };
    }

    try {
      // Trigger garbage collection
      global.gc();

      // Wait a bit for GC to complete
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 100);
      });

      const afterSnapshot = this.getMemorySnapshot();
      const duration = performance.now() - startTime;
      const freedMB = beforeSnapshot.heapUsed - afterSnapshot.heapUsed;

      const result: GCTriggerResult = {
        triggered: true,
        beforeHeapMB: beforeSnapshot.heapUsed,
        afterHeapMB: afterSnapshot.heapUsed,
        freedMB: Math.max(0, freedMB),
        duration,
        reason,
      };

      // Store in history
      this.gcHistory.push(result);

      // Keep only last 100 GC events
      if (this.gcHistory.length > 100) {
        this.gcHistory = this.gcHistory.slice(-100);
      }

      // Notify callbacks
      this.gcCallbacks.forEach(callback => {
        try {
          callback(result);
        } catch (error) {
          console.warn('GC callback error:', error);
        }
      });

      return result;
    } catch (error) {
      return {
        triggered: false,
        beforeHeapMB: beforeSnapshot.heapUsed,
        afterHeapMB: beforeSnapshot.heapUsed,
        freedMB: 0,
        duration: performance.now() - startTime,
        reason: `GC failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Check for memory pressure and take action
   */
  private async checkMemoryPressure(): Promise<void> {
    const snapshot = this.getMemorySnapshot();

    // Notify memory callbacks
    this.memoryCallbacks.forEach(callback => {
      try {
        callback(snapshot);
      } catch (error) {
        console.warn('Memory callback error:', error);
      }
    });

    // Take action based on pressure level
    if (this.options.enableAutoGC && snapshot.pressure.shouldGC) {
      let gcAttempts = 0;
      let currentSnapshot = snapshot;

      while (gcAttempts < this.options.maxGCAttempts && currentSnapshot.pressure.shouldGC) {
        await this.triggerGC(`auto-pressure-${currentSnapshot.pressure.level}`);
        gcAttempts++;

        // Wait and recheck
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 500);
        });
        currentSnapshot = this.getMemorySnapshot();
      }
    }

    // Additional pause for critical memory pressure
    if (snapshot.pressure.level === 'critical') {
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 2000);
      });
    }
  }

  /**
   * Calculate memory pressure level
   */
  private calculateMemoryPressure(
    memUsage: NodeJS.MemoryUsage,
    systemUsed: number,
    systemTotal: number,
  ): MemoryPressureLevel {
    const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    const systemPercentage = (systemUsed / systemTotal) * 100;

    // Use the higher of heap or system pressure
    const overallPercentage = Math.max(heapPercentage, systemPercentage);

    if (overallPercentage >= this.options.criticalThreshold) {
      return {
        level: 'critical',
        percentage: overallPercentage,
        shouldPause: true,
        shouldGC: true,
        recommendedAction: 'Immediate GC and pause processing',
      };
    } else if (overallPercentage >= this.options.gcThreshold) {
      return {
        level: 'high',
        percentage: overallPercentage,
        shouldPause: false,
        shouldGC: true,
        recommendedAction: 'Trigger garbage collection',
      };
    } else if (overallPercentage >= this.options.warningThreshold) {
      return {
        level: 'medium',
        percentage: overallPercentage,
        shouldPause: false,
        shouldGC: false,
        recommendedAction: 'Monitor closely',
      };
    } else {
      return {
        level: 'low',
        percentage: overallPercentage,
        shouldPause: false,
        shouldGC: false,
        recommendedAction: 'Continue normally',
      };
    }
  }

  /**
   * Take a memory snapshot for debugging
   */
  private takeSnapshot(): void {
    const snapshot = this.getMemorySnapshot();
    this.snapshots.push(snapshot);

    // Keep only last 1000 snapshots
    if (this.snapshots.length > 1000) {
      this.snapshots = this.snapshots.slice(-1000);
    }
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStats(): {
    current: MemorySnapshot;
    history: MemorySnapshot[];
    gcHistory: GCTriggerResult[];
    isMonitoring: boolean;
    sessionId: string;
  } {
    return {
      current: this.getMemorySnapshot(),
      history: [...this.snapshots],
      gcHistory: [...this.gcHistory],
      isMonitoring: this.isMonitoring,
      sessionId: this.sessionId,
    };
  }

  /**
   * Clear history data
   */
  public clearHistory(): void {
    this.snapshots = [];
    this.gcHistory = [];
  }

  /**
   * Get GC effectiveness analysis
   */
  public analyzeGCEffectiveness(): {
    totalGCEvents: number;
    averageFreedMB: number;
    averageDuration: number;
    effectiveness: 'excellent' | 'good' | 'poor' | 'very-poor';
    recommendations: string[];
  } {
    if (this.gcHistory.length === 0) {
      return {
        totalGCEvents: 0,
        averageFreedMB: 0,
        averageDuration: 0,
        effectiveness: 'poor',
        recommendations: ['No GC events recorded yet'],
      };
    }

    const successful = this.gcHistory.filter(gc => gc.triggered);
    const totalFreed = successful.reduce((sum, gc) => sum + gc.freedMB, 0);
    const totalDuration = successful.reduce((sum, gc) => sum + gc.duration, 0);

    const averageFreedMB = totalFreed / successful.length;
    const averageDuration = totalDuration / successful.length;

    let effectiveness: 'excellent' | 'good' | 'poor' | 'very-poor';
    const recommendations: string[] = [];

    if (averageFreedMB > 100 && averageDuration < 50) {
      effectiveness = 'excellent';
    } else if (averageFreedMB > 50 && averageDuration < 100) {
      effectiveness = 'good';
    } else if (averageFreedMB > 10) {
      effectiveness = 'poor';
      recommendations.push('Consider reducing batch sizes or improving memory efficiency');
    } else {
      effectiveness = 'very-poor';
      recommendations.push('GC is not freeing much memory - possible memory leak');
      recommendations.push('Consider heap profiling to identify memory leaks');
    }

    if (averageDuration > 100) {
      recommendations.push('GC duration is high - consider reducing heap size');
    }

    return {
      totalGCEvents: this.gcHistory.length,
      averageFreedMB,
      averageDuration,
      effectiveness,
      recommendations,
    };
  }
}

/**
 * Global memory monitor instance
 */
let globalMonitor: MemoryMonitor | null = null;

/**
 * Get or create global memory monitor
 */
export function getGlobalMemoryMonitor(options?: MemoryMonitorOptions): MemoryMonitor {
  if (!globalMonitor) {
    globalMonitor = new MemoryMonitor(options);
  }
  return globalMonitor;
}

/**
 * Simple memory check function
 */
export function checkMemoryPressure(): MemoryPressureLevel {
  const memUsage = process.memoryUsage();
  const systemTotal = totalmem();
  const systemFree = freemem();
  const systemUsed = systemTotal - systemFree;

  const heapPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  const systemPercentage = (systemUsed / systemTotal) * 100;
  const overallPercentage = Math.max(heapPercentage, systemPercentage);

  if (overallPercentage >= 85) {
    return {
      level: 'critical',
      percentage: overallPercentage,
      shouldPause: true,
      shouldGC: true,
      recommendedAction: 'Immediate GC and pause processing',
    };
  } else if (overallPercentage >= 80) {
    return {
      level: 'high',
      percentage: overallPercentage,
      shouldPause: false,
      shouldGC: true,
      recommendedAction: 'Trigger garbage collection',
    };
  } else if (overallPercentage >= 75) {
    return {
      level: 'medium',
      percentage: overallPercentage,
      shouldPause: false,
      shouldGC: false,
      recommendedAction: 'Monitor closely',
    };
  } else {
    return {
      level: 'low',
      percentage: overallPercentage,
      shouldPause: false,
      shouldGC: false,
      recommendedAction: 'Continue normally',
    };
  }
}

/**
 * Simple GC trigger with monitoring
 */
export async function triggerGCIfNeeded(threshold: number = 80): Promise<GCTriggerResult | null> {
  const pressure = checkMemoryPressure();

  if (pressure.percentage >= threshold && global.gc) {
    const monitor = new MemoryMonitor();
    return await monitor.triggerGC(`threshold-${threshold}`);
  }

  return null;
}
