/**
 * Advanced Memory Leak Detection and Management
 * Node.js 22+ optimized memory monitoring with WeakRef tracking, automatic leak detection,
 * and intelligent garbage collection management
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { freemem, totalmem } from 'node:os';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import { scheduler } from 'node:timers/promises';
import type { MCPToolResponse } from '../types/mcp';
import { ErrorPatterns } from './error-handling';
import { ok, runTool } from './tool-helpers';
// Advanced memory tracking interfaces
export interface MemoryLeakReport {
  leakId: string;
  objectType: string;
  creationTime: number;
  suspectedLeakTime: number;
  retentionPath?: string[];
  estimatedSize: number;
  suspectedCause: string;
  stackTrace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WeakRefTrackedObject {
  id: string;
  type: string;
  createdAt: number;
  lastAccessed: number;
  size: number;
  metadata: Record<string, any>;
  stackTrace?: string;
}

export interface AdvancedMemoryPressureLevel {
  level: 'optimal' | 'elevated' | 'high' | 'critical' | 'emergency';
  heapUsage: number;
  heapUtilization: number;
  externalMemory: number;
  rssMemory: number;
  systemMemoryPressure: number;
  recommendation: string;
  actionRequired: boolean;
}

export interface GCMetrics {
  gcType: string;
  duration: number;
  heapBefore: number;
  heapAfter: number;
  memoryFreed: number;
  efficiency: number; // percentage of memory freed
  timestamp: number;
}

export interface HeapAnalysisResult {
  totalObjects: number;
  leakyObjects: number;
  cycleDetected: boolean;
  fragmentationLevel: number;
  largestRetainers: Array<{
    type: string;
    size: number;
    count: number;
  }>;
  recommendations: string[];
}

/**
 * WeakRef-based Object Tracker for leak detection
 */
class WeakRefObjectTracker {
  private trackedObjects = new Map<string, WeakRefTrackedObject>();
  private weakRefs = new Map<string, WeakRef<object>>();
  private finalizationRegistry: FinalizationRegistry<string>;
  private cleanupCallbacks = new Map<string, () => void>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.finalizationRegistry = new FinalizationRegistry((objectId: string) => {
      this.handleObjectFinalization(objectId);
    });

    // Periodic cleanup of tracked objects - unref to not block exit
    this.cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, 30000); // Every 30 seconds
    this.cleanupInterval.unref();
  }

  /**
   * Track an object for potential memory leaks
   */
  trackObject<T extends object>(
    obj: T,
    type: string,
    metadata: Record<string, any> = {},
    cleanupCallback?: () => void,
  ): string {
    const id = `${type}-${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;
    const stackTrace = this.captureStackTrace();

    const trackedObj: WeakRefTrackedObject = {
      id,
      type,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      size: this.estimateObjectSize(obj),
      metadata,
      stackTrace,
    };

    this.trackedObjects.set(id, trackedObj);
    this.weakRefs.set(id, new WeakRef(obj));

    if (cleanupCallback) {
      this.cleanupCallbacks.set(id, cleanupCallback);
    }

    // Register for finalization
    this.finalizationRegistry.register(obj, id, obj);

    return id;
  }

  /**
   * Update last accessed time for an object
   */
  touchObject(id: string): void {
    const tracked = this.trackedObjects.get(id);
    if (tracked) {
      tracked.lastAccessed = Date.now();
    }
  }

  /**
   * Get all potentially leaked objects
   */
  detectLeakedObjects(ageThresholdMs: number = 300000): MemoryLeakReport[] {
    const now = Date.now();
    const leaks: MemoryLeakReport[] = [];

    for (const [id, tracked] of this.trackedObjects.entries()) {
      const age = now - tracked.createdAt;
      const timeSinceAccess = now - tracked.lastAccessed;

      // Check if object is still alive but potentially leaked
      const weakRef = this.weakRefs.get(id);
      const isAlive = weakRef?.deref() !== undefined;

      if (isAlive && age > ageThresholdMs && timeSinceAccess > ageThresholdMs) {
        const severity = this.calculateLeakSeverity(tracked, age, timeSinceAccess);

        leaks.push({
          leakId: id,
          objectType: tracked.type,
          creationTime: tracked.createdAt,
          suspectedLeakTime: tracked.lastAccessed,
          estimatedSize: tracked.size,
          suspectedCause: this.determineSuspectedCause(tracked, age, timeSinceAccess),
          stackTrace: tracked.stackTrace,
          severity,
        });
      }
    }

    return leaks;
  }

  /**
   * Force cleanup of tracked object
   */
  forceCleanup(id: string): boolean {
    const cleanup = this.cleanupCallbacks.get(id);
    if (cleanup) {
      try {
        cleanup();
      } catch (error) {
        console.warn(`Cleanup callback failed for ${id}:`, error);
      }
    }

    const removed =
      this.trackedObjects.delete(id) &&
      this.weakRefs.delete(id) &&
      this.cleanupCallbacks.delete(id);

    return removed;
  }

  private handleObjectFinalization(objectId: string): void {
    // Object was garbage collected
    this.forceCleanup(objectId);
  }

  private performPeriodicCleanup(): void {
    // Clean up dead references
    for (const [id, weakRef] of this.weakRefs.entries()) {
      if (weakRef.deref() === undefined) {
        this.forceCleanup(id);
      }
    }
  }

  private captureStackTrace(): string {
    const error = new Error();
    return error.stack?.split('\n').slice(2, 10).join('\n') || 'No stack trace available';
  }

  private estimateObjectSize(obj: any): number {
    try {
      // Rough estimation - in production you might use more sophisticated methods
      const jsonStr = JSON.stringify(obj);
      return jsonStr.length * 2; // Rough estimate for UTF-16
    } catch {
      return 0;
    }
  }

  private calculateLeakSeverity(
    tracked: WeakRefTrackedObject,
    age: number,
    timeSinceAccess: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const sizeScore = tracked.size > 1000000 ? 3 : tracked.size > 100000 ? 2 : 1; // 1MB, 100KB
    const ageScore = age > 1800000 ? 3 : age > 900000 ? 2 : 1; // 30min, 15min
    const accessScore = timeSinceAccess > 1200000 ? 3 : timeSinceAccess > 600000 ? 2 : 1; // 20min, 10min

    const totalScore = sizeScore + ageScore + accessScore;

    if (totalScore >= 8) return 'critical';
    if (totalScore >= 6) return 'high';
    if (totalScore >= 4) return 'medium';
    return 'low';
  }

  private determineSuspectedCause(
    tracked: WeakRefTrackedObject,
    age: number,
    timeSinceAccess: number,
  ): string {
    if (timeSinceAccess > age * 0.8) {
      return 'Object created but never accessed - possible unused allocation';
    }
    if (tracked.type.includes('cache') || tracked.type.includes('Cache')) {
      return 'Cache entry not properly evicted';
    }
    if (tracked.type.includes('event') || tracked.type.includes('Event')) {
      return 'Event listener or handler not properly cleaned up';
    }
    if (tracked.type.includes('stream') || tracked.type.includes('Stream')) {
      return 'Stream not properly closed or destroyed';
    }
    return 'Long-lived object with infrequent access - potential memory leak';
  }

  /**
   * Dispose of the tracker and stop all timers
   */
  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear all tracked objects and callbacks
    this.trackedObjects.clear();
    this.weakRefs.clear();
    this.cleanupCallbacks.clear();
  }

  /**
   * Get tracking statistics
   */
  getStats(): {
    totalTracked: number;
    aliveObjects: number;
    deadReferences: number;
    oldestObject: number | null;
    largestObject: number;
    typeDistribution: Record<string, number>;
  } {
    let aliveCount = 0;
    let deadCount = 0;
    let oldestTime: number | null = null;
    let largestSize = 0;
    const typeDistribution: Record<string, number> = {};

    for (const [id, tracked] of this.trackedObjects.entries()) {
      const weakRef = this.weakRefs.get(id);
      const isAlive = weakRef?.deref() !== undefined;

      if (isAlive) {
        aliveCount++;
        if (oldestTime === null || tracked.createdAt < oldestTime) {
          oldestTime = tracked.createdAt;
        }
        if (tracked.size > largestSize) {
          largestSize = tracked.size;
        }
      } else {
        deadCount++;
      }

      typeDistribution[tracked.type] = (typeDistribution[tracked.type] || 0) + 1;
    }

    return {
      totalTracked: this.trackedObjects.size,
      aliveObjects: aliveCount,
      deadReferences: deadCount,
      oldestObject: oldestTime,
      largestObject: largestSize,
      typeDistribution,
    };
  }
}

/**
 * Advanced Memory Monitor with Node.js 22+ optimizations
 */
export class AdvancedMemoryMonitor {
  private objectTracker = new WeakRefObjectTracker();
  private gcObserver: PerformanceObserver | null = null;
  private gcMetrics: GCMetrics[] = [];
  private memorySnapshots: Array<{
    timestamp: number;
    usage: NodeJS.MemoryUsage;
    pressure: AdvancedMemoryPressureLevel;
  }> = [];

  private v8Stats: any = null;
  private heapProfiler: any = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  // Node.js 22+ specific features
  private memoryMeasurement: any = null;
  private asyncLocalStorage = new AsyncLocalStorage<{
    allocationContext: string;
    trackingEnabled: boolean;
  }>();

  constructor() {
    void this.initializeV8Features();
    this.setupGCObserver();
  }

  private async initializeV8Features(): Promise<void> {
    try {
      const v8 = await import('node:v8');
      this.v8Stats = v8;

      if (typeof v8.writeHeapSnapshot === 'function') {
        this.heapProfiler = v8;
      }

      // Node.js 22+ memory measurement API (experimental)
      try {
        if (typeof (performance as any).measureUserAgentSpecificMemory === 'function') {
          this.memoryMeasurement = performance;
        }
      } catch {
        // Experimental API not available
      }
    } catch (error) {
      console.debug('V8 advanced features not available:', error);
    }
  }

  private setupGCObserver(): void {
    try {
      this.gcObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'gc') {
            this.recordGCMetrics(entry as any);
          }
        }
      });

      // Observe GC events if available
      this.gcObserver.observe({ entryTypes: ['gc'] });
    } catch (error) {
      console.debug('GC observation not available:', error);
    }
  }

  private recordGCMetrics(entry: any): void {
    const beforeUsage = entry.detail?.before || process.memoryUsage();
    const afterUsage = process.memoryUsage();

    const gcMetric: GCMetrics = {
      gcType: entry.detail?.kind || 'unknown',
      duration: entry.duration,
      heapBefore: beforeUsage.heapUsed,
      heapAfter: afterUsage.heapUsed,
      memoryFreed: beforeUsage.heapUsed - afterUsage.heapUsed,
      efficiency:
        beforeUsage.heapUsed > 0
          ? ((beforeUsage.heapUsed - afterUsage.heapUsed) / beforeUsage.heapUsed) * 100
          : 0,
      timestamp: Date.now(),
    };

    this.gcMetrics.push(gcMetric);

    // Keep only last 100 GC events
    if (this.gcMetrics.length > 100) {
      this.gcMetrics.splice(0, this.gcMetrics.length - 100);
    }
  }

  /**
   * Start comprehensive memory monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performMemorySnapshot();
      this.detectMemoryAnomalies();
    }, intervalMs);

    // Unref to not block process exit
    this.monitoringInterval.unref();

    console.debug('Advanced memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Track object for memory leak detection
   */
  trackObject<T extends object>(
    obj: T,
    type: string,
    metadata: Record<string, any> = {},
    cleanupCallback?: () => void,
  ): string {
    return this.objectTracker.trackObject(obj, type, metadata, cleanupCallback);
  }

  /**
   * Get comprehensive memory pressure analysis
   */
  getMemoryPressure(): AdvancedMemoryPressureLevel {
    const usage = process.memoryUsage();
    const systemTotal = totalmem();
    const systemFree = freemem();

    const heapUsage = usage.heapUsed / 1024 / 1024; // MB
    const heapUtilization = (usage.heapUsed / usage.heapTotal) * 100;
    const externalMemory = usage.external / 1024 / 1024; // MB
    const rssMemory = usage.rss / 1024 / 1024; // MB
    const systemMemoryPressure = ((systemTotal - systemFree) / systemTotal) * 100;

    let level: AdvancedMemoryPressureLevel['level'] = 'optimal';
    let recommendation = 'Memory usage is healthy';
    let actionRequired = false;

    // Advanced pressure calculation considering multiple factors
    const pressureScore = this.calculatePressureScore(
      heapUtilization,
      systemMemoryPressure,
      heapUsage,
      externalMemory,
    );

    if (pressureScore >= 90) {
      level = 'emergency';
      recommendation = 'EMERGENCY: Immediate memory cleanup and optimization required';
      actionRequired = true;
    } else if (pressureScore >= 80) {
      level = 'critical';
      recommendation = 'Critical memory pressure - immediate action required';
      actionRequired = true;
    } else if (pressureScore >= 65) {
      level = 'high';
      recommendation = 'High memory usage - optimization recommended';
      actionRequired = true;
    } else if (pressureScore >= 40) {
      level = 'elevated';
      recommendation = 'Elevated memory usage - monitor closely';
      actionRequired = false;
    }

    return {
      level,
      heapUsage,
      heapUtilization,
      externalMemory,
      rssMemory,
      systemMemoryPressure,
      recommendation,
      actionRequired,
    };
  }

  private calculatePressureScore(
    heapUtilization: number,
    systemPressure: number,
    heapUsage: number,
    externalMemory: number,
  ): number {
    // Weighted scoring system
    const heapScore = Math.min(heapUtilization * 0.4, 40); // Max 40 points
    const systemScore = Math.min(systemPressure * 0.3, 30); // Max 30 points
    const sizeScore = Math.min((heapUsage / 500) * 20, 20); // Max 20 points (500MB baseline)
    const externalScore = Math.min((externalMemory / 100) * 10, 10); // Max 10 points (100MB baseline)

    return heapScore + systemScore + sizeScore + externalScore;
  }

  /**
   * Detect memory leaks using WeakRef tracking
   */
  async detectMemoryLeaks(ageThresholdMs: number = 300000): Promise<MemoryLeakReport[]> {
    const leaks = this.objectTracker.detectLeakedObjects(ageThresholdMs);

    // Enhanced leak detection with heap analysis
    if (leaks.length > 0) {
      const heapAnalysis = await this.analyzeHeap();

      // Correlate leaks with heap analysis
      for (const leak of leaks) {
        const heapRetainer = heapAnalysis.largestRetainers.find(r =>
          r.type.toLowerCase().includes(leak.objectType.toLowerCase()),
        );

        if (heapRetainer) {
          leak.retentionPath = [
            `Heap retainer: ${heapRetainer.type} (${heapRetainer.count} instances)`,
          ];
        }
      }
    }

    return leaks;
  }

  /**
   * Perform heap analysis using Node.js 22+ features
   */
  async analyzeHeap(): Promise<HeapAnalysisResult> {
    if (!this.v8Stats) {
      return {
        totalObjects: 0,
        leakyObjects: 0,
        cycleDetected: false,
        fragmentationLevel: 0,
        largestRetainers: [],
        recommendations: ['V8 heap analysis not available'],
      };
    }

    try {
      const heapStats = this.v8Stats.getHeapStatistics();
      const heapSpaceStats = this.v8Stats.getHeapSpaceStatistics();

      const fragmentationLevel = this.calculateFragmentation(heapStats, heapSpaceStats);
      const largestRetainers = this.identifyLargestRetainers(heapSpaceStats);

      const recommendations: string[] = [];

      if (fragmentationLevel > 30) {
        recommendations.push('High heap fragmentation detected - consider forced GC');
      }

      if (heapStats.used_heap_size > heapStats.heap_size_limit * 0.8) {
        recommendations.push(
          'Heap usage approaching limit - increase heap size or optimize memory usage',
        );
      }

      if (largestRetainers.length > 0 && largestRetainers[0].size > 50 * 1024 * 1024) {
        recommendations.push(
          `Large memory retainer detected: ${largestRetainers[0].type} (${Math.round(largestRetainers[0].size / 1024 / 1024)}MB)`,
        );
      }

      return {
        totalObjects: heapStats.number_of_native_contexts + heapStats.number_of_detached_contexts,
        leakyObjects: 0, // Would require more detailed analysis
        cycleDetected: false, // Would require cycle detection algorithm
        fragmentationLevel,
        largestRetainers,
        recommendations:
          recommendations.length > 0 ? recommendations : ['Heap analysis looks healthy'],
      };
    } catch (error) {
      return {
        totalObjects: 0,
        leakyObjects: 0,
        cycleDetected: false,
        fragmentationLevel: 0,
        largestRetainers: [],
        recommendations: [
          `Heap analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  private calculateFragmentation(heapStats: any, heapSpaceStats: any[]): number {
    const totalUsed = heapStats.used_heap_size;
    const totalCommitted = heapStats.total_heap_size;

    if (totalCommitted === 0) return 0;

    // Calculate fragmentation as percentage of uncommitted space
    const fragmentation = ((totalCommitted - totalUsed) / totalCommitted) * 100;
    return Math.min(Math.max(fragmentation, 0), 100);
  }

  private identifyLargestRetainers(
    heapSpaceStats: any[],
  ): Array<{ type: string; size: number; count: number }> {
    const retainers = heapSpaceStats
      .map(space => ({
        type: space.space_name,
        size: space.space_used_size,
        count: 1,
      }))
      .filter(retainer => retainer.size > 1024 * 1024) // Only spaces > 1MB
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    return retainers;
  }

  private performMemorySnapshot(): void {
    const usage = process.memoryUsage();
    const pressure = this.getMemoryPressure();

    this.memorySnapshots.push({
      timestamp: Date.now(),
      usage,
      pressure,
    });

    // Keep only last 100 snapshots
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots.splice(0, this.memorySnapshots.length - 100);
    }
  }

  private detectMemoryAnomalies(): void {
    if (this.memorySnapshots.length < 2) return;

    const current = this.memorySnapshots[this.memorySnapshots.length - 1];
    const previous = this.memorySnapshots[this.memorySnapshots.length - 2];

    // Detect rapid memory growth
    const heapGrowth = current.usage.heapUsed - previous.usage.heapUsed;
    const timeElapsed = current.timestamp - previous.timestamp;
    const growthRate = heapGrowth / timeElapsed; // bytes per ms

    if (growthRate > 1000) {
      // > 1KB per ms sustained growth
      console.warn(`Rapid memory growth detected: ${Math.round(growthRate)}KB/s`);
    }

    // Detect memory pressure escalation
    const pressureLevels = ['optimal', 'elevated', 'high', 'critical', 'emergency'];
    const currentLevel = pressureLevels.indexOf(current.pressure.level);
    const previousLevel = pressureLevels.indexOf(previous.pressure.level);

    if (currentLevel > previousLevel + 1) {
      console.warn(
        `Memory pressure escalation detected: ${previous.pressure.level} → ${current.pressure.level}`,
      );
    }
  }

  /**
   * Intelligent garbage collection with Node.js 22+ optimizations
   */
  async performIntelligentGC(
    options: {
      forceFullGC?: boolean;
      waitForCompletion?: boolean;
      maxWaitMs?: number;
    } = {},
  ): Promise<{
    gcPerformed: boolean;
    memoryFreed: number;
    duration: number;
    efficiency: number;
    error?: string;
  }> {
    const { forceFullGC = false, waitForCompletion = true, maxWaitMs = 5000 } = options;

    const beforeUsage = process.memoryUsage();
    const startTime = performance.now();

    let gcPerformed = false;
    let error: string | undefined;

    try {
      if (global.gc) {
        // Perform multiple GC passes for better cleanup
        const passes = forceFullGC ? 3 : 1;

        for (let i = 0; i < passes; i++) {
          global.gc();
          gcPerformed = true;

          if (waitForCompletion && i < passes - 1) {
            await scheduler.wait(Math.min(500, maxWaitMs / passes));
          }
        }

        if (waitForCompletion) {
          await scheduler.wait(100); // Allow GC to complete
        }
      } else {
        error = 'Garbage collection not available (run with --expose-gc)';
      }
    } catch (err) {
      error = `GC error: ${err instanceof Error ? err.message : 'Unknown error'}`;
    }

    const endTime = performance.now();
    const afterUsage = process.memoryUsage();

    const memoryFreed = beforeUsage.heapUsed - afterUsage.heapUsed;
    const duration = endTime - startTime;
    const efficiency = beforeUsage.heapUsed > 0 ? (memoryFreed / beforeUsage.heapUsed) * 100 : 0;

    return {
      gcPerformed,
      memoryFreed,
      duration,
      efficiency,
      error,
    };
  }

  /**
   * Get object tracking statistics
   */
  getStats(): ReturnType<WeakRefObjectTracker['getStats']> {
    return this.objectTracker.getStats();
  }

  /**
   * Get comprehensive memory analysis report
   */
  async getMemoryReport(): Promise<{
    pressure: AdvancedMemoryPressureLevel;
    leaks: MemoryLeakReport[];
    heapAnalysis: HeapAnalysisResult;
    gcMetrics: {
      recentGCs: GCMetrics[];
      averageEfficiency: number;
      totalMemoryFreed: number;
    };
    tracking: ReturnType<WeakRefObjectTracker['getStats']>;
    recommendations: string[];
  }> {
    const pressure = this.getMemoryPressure();
    const leaks = await this.detectMemoryLeaks();
    const heapAnalysis = await this.analyzeHeap();
    const tracking = this.objectTracker.getStats();

    const recentGCs = this.gcMetrics.slice(-10);
    const averageEfficiency =
      recentGCs.length > 0
        ? recentGCs.reduce((sum, gc) => sum + gc.efficiency, 0) / recentGCs.length
        : 0;
    const totalMemoryFreed = recentGCs.reduce((sum, gc) => sum + gc.memoryFreed, 0);

    const recommendations: string[] = [];

    // Generate recommendations based on analysis
    if (pressure.actionRequired) {
      recommendations.push(pressure.recommendation);
    }

    if (leaks.length > 0) {
      const criticalLeaks = leaks.filter(l => l.severity === 'critical').length;
      if (criticalLeaks > 0) {
        recommendations.push(
          `${criticalLeaks} critical memory leaks detected - immediate investigation required`,
        );
      }
    }

    if (averageEfficiency < 20 && recentGCs.length >= 3) {
      recommendations.push('Low GC efficiency detected - review memory allocation patterns');
    }

    if (tracking.deadReferences > tracking.aliveObjects * 0.5) {
      recommendations.push('Many dead references detected - improve object lifecycle management');
    }

    recommendations.push(...heapAnalysis.recommendations);

    return {
      pressure,
      leaks,
      heapAnalysis,
      gcMetrics: {
        recentGCs,
        averageEfficiency,
        totalMemoryFreed,
      },
      tracking,
      recommendations: Array.from(new Set(recommendations)), // Remove duplicates
    };
  }

  /**
   * Force cleanup of leaked objects
   */
  async cleanupLeakedObjects(maxAge: number = 300000): Promise<{
    cleaned: number;
    failed: number;
    memoryFreed: number;
  }> {
    const leaks = await this.detectMemoryLeaks(maxAge);
    const beforeUsage = process.memoryUsage();

    let cleaned = 0;
    let failed = 0;

    for (const leak of leaks) {
      const success = this.objectTracker.forceCleanup(leak.leakId);
      if (success) {
        cleaned++;
      } else {
        failed++;
      }
    }

    // Force GC after cleanup
    await this.performIntelligentGC({ forceFullGC: true });

    const afterUsage = process.memoryUsage();
    const memoryFreed = beforeUsage.heapUsed - afterUsage.heapUsed;

    return {
      cleaned,
      failed,
      memoryFreed,
    };
  }

  /**
   * Generate heap snapshot with Node.js 22+ optimizations
   */
  async generateHeapSnapshot(filename?: string): Promise<string | null> {
    if (!this.heapProfiler) {
      return null;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const snapshotFile = filename || `heap-snapshot-${timestamp}.heapsnapshot`;

      // Generate the snapshot
      this.heapProfiler.writeHeapSnapshot(snapshotFile);

      return snapshotFile;
    } catch (error) {
      console.error('Failed to generate heap snapshot:', error);
      return null;
    }
  }

  /**
   * Clean up all monitoring resources
   */
  dispose(): void {
    this.stopMonitoring();

    if (this.gcObserver) {
      this.gcObserver.disconnect();
      this.gcObserver = null;
    }

    // Dispose of the object tracker
    this.objectTracker.dispose();

    // Clear all data
    this.gcMetrics.length = 0;
    this.memorySnapshots.length = 0;

    // Reset V8 references
    this.v8Stats = null;
    this.heapProfiler = null;
    this.memoryMeasurement = null;

    console.debug('Advanced memory monitor disposed');
  }
}

// Global instance
export const globalAdvancedMemoryMonitor = new AdvancedMemoryMonitor();

// MCP Tool interface
export interface AdvancedMemoryMonitorArgs {
  action:
    | 'startMonitoring'
    | 'stopMonitoring'
    | 'getMemoryPressure'
    | 'detectLeaks'
    | 'analyzeHeap'
    | 'performGC'
    | 'generateReport'
    | 'cleanupLeaks'
    | 'generateSnapshot'
    | 'trackObject';

  // Action-specific parameters
  intervalMs?: number;
  ageThresholdMs?: number;
  forceFullGC?: boolean;
  objectType?: string;
  objectMetadata?: Record<string, any>;
  filename?: string;
}

export const advancedMemoryMonitorTool = {
  name: 'advanced_memory_monitor',
  description: 'Advanced memory leak detection and management with Node.js 22+ optimizations',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: [
          'startMonitoring',
          'stopMonitoring',
          'getMemoryPressure',
          'detectLeaks',
          'analyzeHeap',
          'performGC',
          'generateReport',
          'cleanupLeaks',
          'generateSnapshot',
          'trackObject',
        ],
        description: 'Action to perform',
      },
      intervalMs: {
        type: 'number',
        description: 'Monitoring interval in milliseconds (default: 30000)',
      },
      ageThresholdMs: {
        type: 'number',
        description: 'Age threshold for leak detection in milliseconds (default: 300000)',
      },
      forceFullGC: {
        type: 'boolean',
        description: 'Force full garbage collection (default: false)',
      },
      objectType: {
        type: 'string',
        description: 'Type of object to track',
      },
      objectMetadata: {
        type: 'object',
        description: 'Metadata for tracked object',
      },
      filename: {
        type: 'string',
        description: 'Filename for heap snapshot',
      },
    },
    required: ['action'],
  },

  async execute(args: AdvancedMemoryMonitorArgs): Promise<MCPToolResponse> {
    return runTool('advanced_memory_monitor', args.action, async () => {
      const { action } = args;

      switch (action) {
        case 'startMonitoring': {
          const intervalMs = args.intervalMs || 30000;
          globalAdvancedMemoryMonitor.startMonitoring(intervalMs);

          return ok({
            success: true,
            message: `Advanced memory monitoring started with ${intervalMs}ms interval`,
          });
        }

        case 'stopMonitoring': {
          globalAdvancedMemoryMonitor.stopMonitoring();

          return ok({
            success: true,
            message: 'Advanced memory monitoring stopped',
          });
        }

        case 'getMemoryPressure': {
          const pressure = globalAdvancedMemoryMonitor.getMemoryPressure();

          return ok(pressure);
        }

        case 'detectLeaks': {
          const ageThresholdMs = args.ageThresholdMs || 300000;
          const leaks = await globalAdvancedMemoryMonitor.detectMemoryLeaks(ageThresholdMs);

          return ok({
            totalLeaks: leaks.length,
            criticalLeaks: leaks.filter(l => l.severity === 'critical').length,
            highSeverityLeaks: leaks.filter(l => l.severity === 'high').length,
            leaks,
          });
        }

        case 'analyzeHeap': {
          const analysis = await globalAdvancedMemoryMonitor.analyzeHeap();

          return ok(analysis);
        }

        case 'performGC': {
          const forceFullGC = args.forceFullGC || false;
          const result = await globalAdvancedMemoryMonitor.performIntelligentGC({
            forceFullGC,
            waitForCompletion: true,
          });

          return ok(result);
        }

        case 'generateReport': {
          const report = await globalAdvancedMemoryMonitor.getMemoryReport();

          return ok(report);
        }

        case 'cleanupLeaks': {
          const ageThresholdMs = args.ageThresholdMs || 300000;
          const result = await globalAdvancedMemoryMonitor.cleanupLeakedObjects(ageThresholdMs);

          return ok(result);
        }

        case 'generateSnapshot': {
          const filename = args.filename;
          const snapshotPath = await globalAdvancedMemoryMonitor.generateHeapSnapshot(filename);

          return ok({
            success: snapshotPath !== null,
            filename: snapshotPath,
            message: snapshotPath
              ? `Heap snapshot generated: ${snapshotPath}`
              : 'Failed to generate heap snapshot - V8 profiler not available',
          });
        }

        case 'trackObject': {
          if (!args.objectType) {
            throw new Error('objectType is required for trackObject action');
          }

          // Note: This is primarily for demonstration - in real usage,
          // objects would be tracked from within other operations
          const trackingId = globalAdvancedMemoryMonitor.trackObject(
            { type: args.objectType, timestamp: Date.now() },
            args.objectType,
            args.objectMetadata || {},
          );

          return ok({
            success: true,
            trackingId,
            objectType: args.objectType,
            message: `Object tracking started with ID: ${trackingId}`,
          });
        }

        default:
          throw ErrorPatterns.unknownAction(action, [
            'startMonitoring',
            'stopMonitoring',
            'getMemoryPressure',
            'detectLeaks',
            'analyzeHeap',
            'performGC',
            'generateReport',
            'cleanupLeaks',
            'generateSnapshot',
            'trackObject',
          ]);
      }

      // This should never be reached due to default case throwing
      throw new Error('Unreachable code');
    });
  },
};
