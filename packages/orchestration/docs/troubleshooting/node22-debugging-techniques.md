# Node 22+ Debugging Techniques

## Overview

Advanced debugging techniques specifically designed for Node 22+ features in the
`@repo/orchestration` package. This guide provides practical debugging
strategies, diagnostic tools, and performance profiling techniques.

## Node 22+ Feature Debugging

### 1. High-Resolution Timing Debug

```typescript
// Advanced timing debugging utilities
export class TimingDebugger {
  private static instance: TimingDebugger;
  private timingHistory = new Map<
    string,
    Array<{
      timestamp: bigint;
      operation: string;
      durationNs: number;
      durationMs: number;
      stackTrace: string;
    }>
  >();

  static getInstance() {
    if (!TimingDebugger.instance) {
      TimingDebugger.instance = new TimingDebugger();
    }
    return TimingDebugger.instance;
  }

  /**
   * Debug timing with full stack trace capture
   */
  debugTiming<T>(operation: string, fn: () => T): T {
    const startTime = process.hrtime.bigint();
    const stackTrace = new Error().stack || "No stack trace available";

    try {
      const result = fn();
      const endTime = process.hrtime.bigint();
      const durationNs = Number(endTime - startTime);
      const durationMs = durationNs / 1_000_000;

      this.recordTiming(
        operation,
        startTime,
        durationNs,
        durationMs,
        stackTrace
      );

      if (durationMs > 100) {
        // Alert for operations > 100ms
        console.warn(
          `🐌 Slow operation detected: ${operation} took ${durationMs.toFixed(3)}ms`
        );
        console.warn(`Stack trace:\n${stackTrace}`);
      }

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const durationNs = Number(endTime - startTime);
      const durationMs = durationNs / 1_000_000;

      console.error(
        `❌ Operation failed: ${operation} (${durationMs.toFixed(3)}ms)`
      );
      console.error(`Error: ${error}`);
      console.error(`Stack trace:\n${stackTrace}`);

      throw error;
    }
  }

  /**
   * Debug async timing operations
   */
  async debugAsyncTiming<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = process.hrtime.bigint();
    const stackTrace = new Error().stack || "No stack trace available";

    try {
      const result = await fn();
      const endTime = process.hrtime.bigint();
      const durationNs = Number(endTime - startTime);
      const durationMs = durationNs / 1_000_000;

      this.recordTiming(
        operation,
        startTime,
        durationNs,
        durationMs,
        stackTrace
      );

      if (durationMs > 500) {
        // Alert for async operations > 500ms
        console.warn(
          `🐌 Slow async operation: ${operation} took ${durationMs.toFixed(3)}ms`
        );
        console.warn(`Stack trace:\n${stackTrace}`);
      }

      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const durationNs = Number(endTime - startTime);
      const durationMs = durationNs / 1_000_000;

      console.error(
        `❌ Async operation failed: ${operation} (${durationMs.toFixed(3)}ms)`
      );
      console.error(`Error: ${error}`);
      console.error(`Stack trace:\n${stackTrace}`);

      throw error;
    }
  }

  private recordTiming(
    operation: string,
    timestamp: bigint,
    durationNs: number,
    durationMs: number,
    stackTrace: string
  ) {
    if (!this.timingHistory.has(operation)) {
      this.timingHistory.set(operation, []);
    }

    const history = this.timingHistory.get(operation)!;
    history.push({
      timestamp,
      operation,
      durationNs,
      durationMs,
      stackTrace
    });

    // Keep only last 100 entries per operation
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Get timing statistics for debugging
   */
  getTimingStats(operation?: string) {
    const stats: Record<
      string,
      {
        count: number;
        avgMs: number;
        minMs: number;
        maxMs: number;
        p95Ms: number;
        totalMs: number;
        slowestCalls: Array<{ durationMs: number; stackTrace: string }>;
      }
    > = {};

    const operations = operation
      ? [operation]
      : Array.from(this.timingHistory.keys());

    for (const op of operations) {
      const history = this.timingHistory.get(op) || [];
      if (history.length === 0) continue;

      const durations = history.map((h) => h.durationMs).sort((a, b) => a - b);
      const totalMs = durations.reduce((sum, d) => sum + d, 0);
      const avgMs = totalMs / durations.length;
      const p95Index = Math.floor(durations.length * 0.95);

      // Get 3 slowest calls for debugging
      const slowestCalls = history
        .sort((a, b) => b.durationMs - a.durationMs)
        .slice(0, 3)
        .map((h) => ({
          durationMs: h.durationMs,
          stackTrace: h.stackTrace
        }));

      stats[op] = {
        count: history.length,
        avgMs,
        minMs: durations[0],
        maxMs: durations[durations.length - 1],
        p95Ms: durations[p95Index] || 0,
        totalMs,
        slowestCalls
      };
    }

    return stats;
  }

  /**
   * Print timing report for debugging
   */
  printTimingReport() {
    const stats = this.getTimingStats();

    console.log("\n📊 TIMING REPORT");
    console.log("================");

    for (const [operation, stat] of Object.entries(stats)) {
      console.log(`\n🔧 ${operation}`);
      console.log(`   Count: ${stat.count}`);
      console.log(`   Average: ${stat.avgMs.toFixed(3)}ms`);
      console.log(`   Min: ${stat.minMs.toFixed(3)}ms`);
      console.log(`   Max: ${stat.maxMs.toFixed(3)}ms`);
      console.log(`   P95: ${stat.p95Ms.toFixed(3)}ms`);
      console.log(`   Total: ${stat.totalMs.toFixed(3)}ms`);

      if (stat.slowestCalls.length > 0) {
        console.log(
          `   🐌 Slowest call: ${stat.slowestCalls[0].durationMs.toFixed(3)}ms`
        );
      }
    }
  }
}

// Global instance for easy debugging
export const globalTimingDebugger = TimingDebugger.getInstance();

// Convenience functions
export function debugTiming<T>(operation: string, fn: () => T): T {
  return globalTimingDebugger.debugTiming(operation, fn);
}

export function debugAsyncTiming<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return globalTimingDebugger.debugAsyncTiming(operation, fn);
}
```

### 2. Memory Debugging Tools

```typescript
// Advanced memory debugging for Node 22+ features
export class MemoryDebugger {
  private snapshots = new Map<
    string,
    {
      timestamp: Date;
      memoryUsage: NodeJS.MemoryUsage;
      heapSnapshot?: string;
    }
  >();

  private objectTracking = new WeakMap<
    object,
    {
      id: string;
      type: string;
      createdAt: Date;
      stackTrace: string;
      metadata: any;
    }
  >();

  private leakDetectionRegistry = new FinalizationRegistry<string>(
    (objectId) => {
      console.log(`🗑️ Object garbage collected: ${objectId}`);
    }
  );

  /**
   * Take memory snapshot for debugging
   */
  async takeSnapshot(label: string): Promise<void> {
    const memoryUsage = process.memoryUsage();

    console.log(`📸 Memory snapshot: ${label}`);
    console.log(
      `   Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(
      `   External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)}MB`
    );
    console.log(`   RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB`);
    console.log(
      `   Array Buffers: ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)}MB`
    );

    let heapSnapshot: string | undefined;

    // Create heap snapshot in development
    if (process.env.NODE_ENV === "development") {
      try {
        const v8 = await import("v8");
        heapSnapshot = v8.writeHeapSnapshot();
        console.log(`   Heap snapshot saved: ${heapSnapshot}`);
      } catch (error) {
        console.warn(`   Failed to create heap snapshot: ${error}`);
      }
    }

    this.snapshots.set(label, {
      timestamp: new Date(),
      memoryUsage,
      heapSnapshot
    });
  }

  /**
   * Compare memory snapshots
   */
  compareSnapshots(label1: string, label2: string): void {
    const snapshot1 = this.snapshots.get(label1);
    const snapshot2 = this.snapshots.get(label2);

    if (!snapshot1 || !snapshot2) {
      console.error("❌ One or both snapshots not found");
      return;
    }

    const heapDiff =
      snapshot2.memoryUsage.heapUsed - snapshot1.memoryUsage.heapUsed;
    const rssDiff = snapshot2.memoryUsage.rss - snapshot1.memoryUsage.rss;
    const externalDiff =
      snapshot2.memoryUsage.external - snapshot1.memoryUsage.external;

    console.log(`\n📊 Memory Comparison: ${label1} → ${label2}`);
    console.log(
      `   Heap Used Δ: ${this.formatBytes(heapDiff)} (${heapDiff > 0 ? "+" : ""}${((heapDiff / snapshot1.memoryUsage.heapUsed) * 100).toFixed(2)}%)`
    );
    console.log(
      `   RSS Δ: ${this.formatBytes(rssDiff)} (${rssDiff > 0 ? "+" : ""}${((rssDiff / snapshot1.memoryUsage.rss) * 100).toFixed(2)}%)`
    );
    console.log(
      `   External Δ: ${this.formatBytes(externalDiff)} (${externalDiff > 0 ? "+" : ""}${((externalDiff / snapshot1.memoryUsage.external) * 100).toFixed(2)}%)`
    );

    if (heapDiff > 10 * 1024 * 1024) {
      // 10MB threshold
      console.warn(
        `⚠️ Significant heap increase detected: ${this.formatBytes(heapDiff)}`
      );
    }
  }

  /**
   * Track object for leak detection debugging
   */
  trackObject<T extends object>(
    obj: T,
    type: string,
    metadata: any = {}
  ): string {
    const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stackTrace = new Error().stack || "No stack trace available";

    this.objectTracking.set(obj, {
      id,
      type,
      createdAt: new Date(),
      stackTrace,
      metadata
    });

    this.leakDetectionRegistry.register(obj, id);

    console.log(`🔍 Tracking object: ${id} (${type})`);

    return id;
  }

  /**
   * Force garbage collection and report results
   */
  forceGC(): {
    beforeGC: NodeJS.MemoryUsage;
    afterGC: NodeJS.MemoryUsage;
    freedMemory: number;
  } | null {
    if (!global.gc) {
      console.warn(
        "⚠️ Garbage collection not available. Run with --expose-gc flag"
      );
      return null;
    }

    const beforeGC = process.memoryUsage();
    console.log(`🗑️ Running garbage collection...`);

    global.gc();

    const afterGC = process.memoryUsage();
    const freedMemory = beforeGC.heapUsed - afterGC.heapUsed;

    console.log(`   Freed: ${this.formatBytes(freedMemory)}`);
    console.log(`   Before: ${this.formatBytes(beforeGC.heapUsed)}`);
    console.log(`   After: ${this.formatBytes(afterGC.heapUsed)}`);

    return {
      beforeGC,
      afterGC,
      freedMemory
    };
  }

  /**
   * Detect potential memory leaks
   */
  detectLeaks(): Array<{
    type: string;
    count: number;
    objects: Array<{
      id: string;
      age: number;
      stackTrace: string;
      metadata: any;
    }>;
  }> {
    const leaksByType = new Map<
      string,
      Array<{
        id: string;
        age: number;
        stackTrace: string;
        metadata: any;
      }>
    >();

    // This is a simplified leak detection - in practice, we'd need more sophisticated analysis
    console.log("🔍 Analyzing potential memory leaks...");

    // Force GC to clean up unreferenced objects
    if (global.gc) {
      global.gc();
    }

    // In a real implementation, we'd analyze heap snapshots or use other techniques
    // For now, we'll return any tracked objects that are still alive after a certain time

    return Array.from(leaksByType.entries()).map(([type, objects]) => ({
      type,
      count: objects.length,
      objects
    }));
  }

  /**
   * Memory usage monitoring with alerts
   */
  startMemoryMonitoring(options: {
    interval: number;
    heapThreshold: number; // MB
    alertCallback?: (usage: NodeJS.MemoryUsage) => void;
  }): () => void {
    const interval = setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = usage.heapUsed / 1024 / 1024;

      if (heapUsedMB > options.heapThreshold) {
        console.warn(
          `🚨 High memory usage: ${heapUsedMB.toFixed(2)}MB (threshold: ${options.heapThreshold}MB)`
        );
        options.alertCallback?.(usage);
      }

      console.log(
        `💾 Memory: ${heapUsedMB.toFixed(2)}MB / ${(usage.heapTotal / 1024 / 1024).toFixed(2)}MB`
      );
    }, options.interval);

    return () => clearInterval(interval);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Global instance
export const globalMemoryDebugger = new MemoryDebugger();
```

### 3. structuredClone Debugging

```typescript
// Debug utilities for structuredClone issues
export class StructuredCloneDebugger {
  /**
   * Deep analyze object cloneability
   */
  static analyzeCloneability(
    obj: any,
    path: string[] = []
  ): {
    isCloneable: boolean;
    issues: Array<{
      path: string;
      issue: string;
      value: any;
      type: string;
    }>;
    summary: {
      totalProperties: number;
      uncloneableProperties: number;
      circularReferences: number;
    };
  } {
    const issues: Array<{
      path: string;
      issue: string;
      value: any;
      type: string;
    }> = [];

    const visited = new Set<any>();
    let totalProperties = 0;
    let circularReferences = 0;

    function analyze(current: any, currentPath: string[]): boolean {
      if (current === null || current === undefined) {
        return true;
      }

      const currentPathStr = currentPath.join(".");

      // Check for circular references
      if (typeof current === "object" && visited.has(current)) {
        issues.push({
          path: currentPathStr,
          issue: "Circular reference detected",
          value: "[Circular]",
          type: typeof current
        });
        circularReferences++;
        return false;
      }

      if (typeof current === "object") {
        visited.add(current);
      }

      // Check primitive types (cloneable)
      if (
        typeof current === "string" ||
        typeof current === "number" ||
        typeof current === "boolean" ||
        typeof current === "bigint"
      ) {
        totalProperties++;
        return true;
      }

      // Check functions (not cloneable)
      if (typeof current === "function") {
        issues.push({
          path: currentPathStr,
          issue: "Functions cannot be cloned",
          value: current.toString().substring(0, 50) + "...",
          type: "function"
        });
        totalProperties++;
        return false;
      }

      // Check symbols (not cloneable)
      if (typeof current === "symbol") {
        issues.push({
          path: currentPathStr,
          issue: "Symbols cannot be cloned",
          value: current.toString(),
          type: "symbol"
        });
        totalProperties++;
        return false;
      }

      // Check DOM nodes (not cloneable in browser environments)
      if (typeof window !== "undefined" && current instanceof Node) {
        issues.push({
          path: currentPathStr,
          issue: "DOM nodes cannot be cloned",
          value: current.nodeName || "[DOM Node]",
          type: "DOMNode"
        });
        totalProperties++;
        return false;
      }

      // Check Error objects (not cloneable)
      if (current instanceof Error) {
        issues.push({
          path: currentPathStr,
          issue: "Error objects cannot be cloned",
          value: current.message,
          type: "Error"
        });
        totalProperties++;
        return false;
      }

      // Check WeakMap/WeakSet (not cloneable)
      if (current instanceof WeakMap || current instanceof WeakSet) {
        issues.push({
          path: currentPathStr,
          issue: "WeakMap/WeakSet cannot be cloned",
          value: "[WeakMap/WeakSet]",
          type: current.constructor.name
        });
        totalProperties++;
        return false;
      }

      // Check dates (cloneable)
      if (current instanceof Date) {
        totalProperties++;
        return true;
      }

      // Check RegExp (cloneable)
      if (current instanceof RegExp) {
        totalProperties++;
        return true;
      }

      // Check arrays
      if (Array.isArray(current)) {
        totalProperties++;
        let arrayCloneable = true;

        for (let i = 0; i < current.length; i++) {
          if (!analyze(current[i], [...currentPath, i.toString()])) {
            arrayCloneable = false;
          }
        }

        return arrayCloneable;
      }

      // Check objects
      if (current !== null && typeof current === "object") {
        totalProperties++;
        let objectCloneable = true;

        for (const [key, value] of Object.entries(current)) {
          if (!analyze(value, [...currentPath, key])) {
            objectCloneable = false;
          }
        }

        return objectCloneable;
      }

      return true;
    }

    const isCloneable = analyze(obj, path);

    return {
      isCloneable,
      issues,
      summary: {
        totalProperties,
        uncloneableProperties: issues.length,
        circularReferences
      }
    };
  }

  /**
   * Safe clone with detailed error reporting
   */
  static safeClone<T>(
    obj: T,
    options: {
      fallbackToJSON?: boolean;
      logIssues?: boolean;
    } = {}
  ): T | null {
    const { fallbackToJSON = true, logIssues = true } = options;

    // First, analyze the object
    const analysis = this.analyzeCloneability(obj);

    if (logIssues && !analysis.isCloneable) {
      console.warn("🔍 Object cloneability analysis:");
      console.warn(`   Total properties: ${analysis.summary.totalProperties}`);
      console.warn(
        `   Uncloneable properties: ${analysis.summary.uncloneableProperties}`
      );
      console.warn(
        `   Circular references: ${analysis.summary.circularReferences}`
      );

      console.warn("   Issues found:");
      analysis.issues.forEach((issue) => {
        console.warn(`     - ${issue.path}: ${issue.issue} (${issue.type})`);
      });
    }

    // Try structuredClone first
    try {
      return structuredClone(obj);
    } catch (error) {
      if (logIssues) {
        console.error(`❌ structuredClone failed: ${error}`);
      }

      // Try JSON fallback if requested
      if (fallbackToJSON) {
        try {
          const result = JSON.parse(JSON.stringify(obj)) as T;
          if (logIssues) {
            console.warn("⚠️ Used JSON fallback - some data may be lost");
          }
          return result;
        } catch (jsonError) {
          if (logIssues) {
            console.error(`❌ JSON fallback also failed: ${jsonError}`);
          }
        }
      }
    }

    return null;
  }

  /**
   * Create cloneable version of object by removing problematic properties
   */
  static makeCloneable<T extends Record<string, any>>(obj: T): Partial<T> {
    const analysis = this.analyzeCloneability(obj);

    if (analysis.isCloneable) {
      return obj;
    }

    // Create a copy without problematic properties
    const cloneable: any = {};

    for (const [key, value] of Object.entries(obj)) {
      const propertyAnalysis = this.analyzeCloneability(value, [key]);

      if (propertyAnalysis.isCloneable) {
        cloneable[key] = value;
      } else {
        // Try to convert to cloneable representation
        if (typeof value === "function") {
          cloneable[key] = "[Function]";
        } else if (value instanceof Error) {
          cloneable[key] = {
            name: value.name,
            message: value.message,
            stack: value.stack
          };
        } else if (typeof value === "symbol") {
          cloneable[key] = value.toString();
        } else {
          cloneable[key] = "[Uncloneable Object]";
        }
      }
    }

    return cloneable;
  }
}
```

## Performance Profiling Tools

### 4. Event Loop Profiling

```typescript
// Advanced event loop profiling for Node 22+
export class EventLoopProfiler {
  private measurements: Array<{
    timestamp: Date;
    lag: number;
    utilization: number;
    delay: number;
  }> = [];

  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  /**
   * Start continuous event loop monitoring
   */
  startMonitoring(
    options: {
      interval?: number;
      sampleSize?: number;
      alertThreshold?: number;
    } = {}
  ): void {
    if (this.isMonitoring) return;

    const {
      interval = 100, // 100ms
      sampleSize = 1000, // Keep last 1000 measurements
      alertThreshold = 50 // Alert if lag > 50ms
    } = options;

    this.isMonitoring = true;
    let lastUtilization = performance.eventLoopUtilization();

    this.monitoringInterval = setInterval(async () => {
      // Measure event loop lag
      const lagStart = process.hrtime.bigint();
      await new Promise((resolve) => setImmediate(resolve));
      const lagEnd = process.hrtime.bigint();
      const lag = Number(lagEnd - lagStart) / 1_000_000;

      // Measure scheduler delay
      const delayStart = process.hrtime.bigint();
      await new Promise((resolve) => setTimeout(resolve, 0));
      const delayEnd = process.hrtime.bigint();
      const delay = Number(delayEnd - delayStart) / 1_000_000;

      // Get utilization
      const currentUtilization =
        performance.eventLoopUtilization(lastUtilization);
      lastUtilization = performance.eventLoopUtilization();

      const measurement = {
        timestamp: new Date(),
        lag,
        utilization: currentUtilization.utilization * 100,
        delay
      };

      this.measurements.push(measurement);

      // Keep only recent measurements
      if (this.measurements.length > sampleSize) {
        this.measurements.shift();
      }

      // Alert on high lag
      if (lag > alertThreshold) {
        console.warn(`🚨 High event loop lag detected: ${lag.toFixed(2)}ms`);
      }

      // Debug output in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔄 Event Loop - Lag: ${lag.toFixed(2)}ms, Util: ${(currentUtilization.utilization * 100).toFixed(1)}%, Delay: ${delay.toFixed(2)}ms`
        );
      }
    }, interval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
  }

  /**
   * Get event loop health report
   */
  getHealthReport(): {
    status: "healthy" | "degraded" | "critical";
    averageLag: number;
    maxLag: number;
    p95Lag: number;
    averageUtilization: number;
    recommendations: string[];
  } {
    if (this.measurements.length === 0) {
      return {
        status: "healthy",
        averageLag: 0,
        maxLag: 0,
        p95Lag: 0,
        averageUtilization: 0,
        recommendations: ["No measurements available. Start monitoring first."]
      };
    }

    const lags = this.measurements.map((m) => m.lag).sort((a, b) => a - b);
    const utilizations = this.measurements.map((m) => m.utilization);

    const averageLag = lags.reduce((sum, lag) => sum + lag, 0) / lags.length;
    const maxLag = Math.max(...lags);
    const p95Index = Math.floor(lags.length * 0.95);
    const p95Lag = lags[p95Index] || 0;
    const averageUtilization =
      utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;

    let status: "healthy" | "degraded" | "critical" = "healthy";
    const recommendations: string[] = [];

    if (averageLag > 100) {
      status = "critical";
      recommendations.push(
        "Critical: Average event loop lag > 100ms. Consider optimizing synchronous operations."
      );
    } else if (averageLag > 50) {
      status = "degraded";
      recommendations.push(
        "Warning: Average event loop lag > 50ms. Monitor for performance issues."
      );
    }

    if (maxLag > 500) {
      status = "critical";
      recommendations.push(
        "Critical: Maximum event loop lag > 500ms. Investigate blocking operations."
      );
    }

    if (averageUtilization > 80) {
      recommendations.push(
        "High CPU utilization detected. Consider load balancing or optimization."
      );
    }

    if (p95Lag > 200) {
      recommendations.push(
        "95th percentile lag is high. Review worst-case performance scenarios."
      );
    }

    return {
      status,
      averageLag,
      maxLag,
      p95Lag,
      averageUtilization,
      recommendations
    };
  }
}

// Global profiler instance
export const globalEventLoopProfiler = new EventLoopProfiler();
```

### 5. Comprehensive Debug CLI

```typescript
// Debug command-line interface
export class OrchestrationDebugCLI {
  /**
   * Run comprehensive debug analysis
   */
  static async runDiagnostics(): Promise<void> {
    console.log("\n🔬 ORCHESTRATION PACKAGE DIAGNOSTICS");
    console.log("====================================");

    // Node.js feature support
    console.log("\n📋 Node.js Feature Support:");
    const featureSupport = this.checkFeatureSupport();
    console.table(featureSupport.features);

    if (featureSupport.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      featureSupport.recommendations.forEach((rec) =>
        console.log(`   - ${rec}`)
      );
    }

    // Memory analysis
    console.log("\n💾 Memory Analysis:");
    await globalMemoryDebugger.takeSnapshot("diagnostic");

    // Performance analysis
    console.log("\n⚡ Performance Analysis:");
    globalEventLoopProfiler.startMonitoring({ interval: 50 });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Monitor for 1 second
    globalEventLoopProfiler.stopMonitoring();

    const healthReport = globalEventLoopProfiler.getHealthReport();
    console.log(`   Status: ${healthReport.status.toUpperCase()}`);
    console.log(`   Average Lag: ${healthReport.averageLag.toFixed(2)}ms`);
    console.log(`   Max Lag: ${healthReport.maxLag.toFixed(2)}ms`);
    console.log(
      `   CPU Utilization: ${healthReport.averageUtilization.toFixed(1)}%`
    );

    // Timing analysis
    console.log("\n⏱️ Timing Analysis:");
    globalTimingDebugger.printTimingReport();

    // Integration tests
    console.log("\n🔗 Integration Tests:");
    await this.runIntegrationTests();

    console.log("\n✅ Diagnostics complete!");
  }

  private static checkFeatureSupport() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
    const recommendations: string[] = [];

    const features = {
      "Node.js Version": nodeVersion,
      "process.hrtime.bigint()": typeof process.hrtime?.bigint === "function",
      "structuredClone()": typeof structuredClone === "function",
      "Object.hasOwn()": typeof Object.hasOwn === "function",
      "Promise.withResolvers()": typeof Promise.withResolvers === "function",
      "Performance Observer": typeof PerformanceObserver !== "undefined",
      "Event Loop Utilization":
        typeof performance.eventLoopUtilization === "function",
      "Global GC": typeof global.gc === "function"
    };

    if (majorVersion < 22) {
      recommendations.push(
        `Consider upgrading to Node.js 22+ (current: ${nodeVersion})`
      );
    }

    if (!features["Global GC"]) {
      recommendations.push(
        "Run with --expose-gc for advanced memory debugging"
      );
    }

    return { features, recommendations };
  }

  private static async runIntegrationTests(): Promise<void> {
    const tests = [
      {
        name: "High-Resolution Timing",
        test: () => {
          const start = process.hrtime.bigint();
          for (let i = 0; i < 1000; i++) {
            Math.random();
          }
          const end = process.hrtime.bigint();
          const durationMs = Number(end - start) / 1_000_000;
          return {
            success: durationMs > 0,
            details: `${durationMs.toFixed(3)}ms`
          };
        }
      },
      {
        name: "Structured Clone",
        test: () => {
          const testObj = { a: 1, b: [2, 3], c: { d: 4 } };
          try {
            const cloned = structuredClone(testObj);
            return {
              success: JSON.stringify(cloned) === JSON.stringify(testObj),
              details: "Clone successful"
            };
          } catch (error) {
            return { success: false, details: String(error) };
          }
        }
      },
      {
        name: "Object.hasOwn",
        test: () => {
          const obj = { prop: "value" };
          try {
            const result = Object.hasOwn(obj, "prop");
            return {
              success: result === true,
              details: "Property detection works"
            };
          } catch (error) {
            return { success: false, details: String(error) };
          }
        }
      },
      {
        name: "Promise.withResolvers",
        test: () => {
          try {
            const { promise, resolve, reject } =
              createPromiseWithResolvers<number>();
            resolve(42);
            return { success: true, details: "Promise resolvers created" };
          } catch (error) {
            return { success: false, details: String(error) };
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = test.test();
        const status = result.success ? "✅" : "❌";
        console.log(`   ${status} ${test.name}: ${result.details}`);
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error}`);
      }
    }
  }

  /**
   * Interactive debugging session
   */
  static startInteractiveSession(): void {
    console.log("\n🛠️ Interactive Debug Session Started");
    console.log("Available commands:");
    console.log("  - memory: Take memory snapshot");
    console.log("  - gc: Force garbage collection");
    console.log("  - timing: Show timing report");
    console.log("  - eventloop: Monitor event loop for 5 seconds");
    console.log("  - health: Show system health report");
    console.log("  - exit: Exit debug session");

    // In a real implementation, this would set up a REPL or command interface
    // For now, we'll just demonstrate the concept
    console.log(
      "\n💡 Use globalTimingDebugger, globalMemoryDebugger, and globalEventLoopProfiler"
    );
    console.log('   Example: globalMemoryDebugger.takeSnapshot("manual")');
  }
}

// Polyfill for Promise.withResolvers if not available
function createPromiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
} {
  if (typeof Promise.withResolvers === "function") {
    return Promise.withResolvers<T>();
  }

  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
```

## Quick Debug Commands

### Convenience Functions

```typescript
// Global debug functions for easy access
declare global {
  var debugOrchestration: {
    runDiagnostics: () => Promise<void>;
    takeMemorySnapshot: (label?: string) => Promise<void>;
    forceGC: () => void;
    showTimingReport: () => void;
    monitorEventLoop: (seconds?: number) => Promise<void>;
    analyzeCloneability: (obj: any) => void;
    startInteractiveDebug: () => void;
  };
}

// Initialize global debug utilities
if (typeof globalThis !== "undefined") {
  (globalThis as any).debugOrchestration = {
    async runDiagnostics() {
      await OrchestrationDebugCLI.runDiagnostics();
    },

    async takeMemorySnapshot(label = `snapshot_${Date.now()}`) {
      await globalMemoryDebugger.takeSnapshot(label);
    },

    forceGC() {
      const result = globalMemoryDebugger.forceGC();
      if (!result) {
        console.log("💡 Run with --expose-gc to enable garbage collection");
      }
    },

    showTimingReport() {
      globalTimingDebugger.printTimingReport();
    },

    async monitorEventLoop(seconds = 5) {
      console.log(`🔄 Monitoring event loop for ${seconds} seconds...`);
      globalEventLoopProfiler.startMonitoring({ interval: 100 });
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
      globalEventLoopProfiler.stopMonitoring();

      const report = globalEventLoopProfiler.getHealthReport();
      console.log(`✅ Monitoring complete. Status: ${report.status}`);
      console.log(`   Average lag: ${report.averageLag.toFixed(2)}ms`);
      console.log(`   Max lag: ${report.maxLag.toFixed(2)}ms`);
    },

    analyzeCloneability(obj: any) {
      const analysis = StructuredCloneDebugger.analyzeCloneability(obj);
      console.log("🔍 Cloneability Analysis:");
      console.log(`   Is cloneable: ${analysis.isCloneable ? "✅" : "❌"}`);
      console.log(`   Total properties: ${analysis.summary.totalProperties}`);
      console.log(`   Issues: ${analysis.summary.uncloneableProperties}`);

      if (analysis.issues.length > 0) {
        console.log("   Problems found:");
        analysis.issues.forEach((issue) => {
          console.log(`     - ${issue.path}: ${issue.issue}`);
        });
      }
    },

    startInteractiveDebug() {
      OrchestrationDebugCLI.startInteractiveSession();
    }
  };
}

// Export everything for module use
export {
  TimingDebugger,
  MemoryDebugger,
  StructuredCloneDebugger,
  EventLoopProfiler,
  OrchestrationDebugCLI,
  globalTimingDebugger,
  globalMemoryDebugger,
  globalEventLoopProfiler
};
```

## Usage Examples

### Debug a Slow Function

```typescript
import { debugAsyncTiming } from "./node22-debugging-techniques";

async function slowDatabaseQuery() {
  return debugAsyncTiming("database-query", async () => {
    // Your database query here
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { users: [] };
  });
}
```

### Monitor Memory During Operations

```typescript
import { globalMemoryDebugger } from "./node22-debugging-techniques";

async function processLargeDataset() {
  await globalMemoryDebugger.takeSnapshot("before-processing");

  const data = new Array(1000000).fill(0).map(() => ({ id: Math.random() }));
  globalMemoryDebugger.trackObject(data, "large-dataset");

  // Process data...

  await globalMemoryDebugger.takeSnapshot("after-processing");
  globalMemoryDebugger.compareSnapshots(
    "before-processing",
    "after-processing"
  );
}
```

### Quick System Health Check

```typescript
// In development console or REPL
debugOrchestration.runDiagnostics();

// Or individual checks
debugOrchestration.takeMemorySnapshot();
debugOrchestration.showTimingReport();
debugOrchestration.monitorEventLoop(10);
```

This comprehensive debugging toolkit provides deep insights into Node 22+
feature usage and performance characteristics in the orchestration package.
