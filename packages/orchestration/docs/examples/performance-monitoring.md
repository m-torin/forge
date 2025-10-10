# Performance Monitoring Examples

This document provides comprehensive examples of using Node 22+ high-resolution
timing features for performance monitoring in the `@repo/orchestration` package.

## Basic High-Resolution Timing

### Simple Operation Timing

```typescript
import { globalPerformanceMonitor } from "@repo/orchestration";

// Example 1: Basic timing with nanosecond precision
async function timedDatabaseQuery(query: string) {
  const start = process.hrtime.bigint();

  try {
    const result = await database.execute(query);

    const end = process.hrtime.bigint();
    const durationNs = end - start;
    const durationMs = Number(durationNs) / 1_000_000;

    console.log(
      `Query executed in ${durationMs.toFixed(3)}ms (${durationNs}ns)`
    );

    return result;
  } catch (error) {
    const end = process.hrtime.bigint();
    const durationNs = end - start;
    const durationMs = Number(durationNs) / 1_000_000;

    console.error(`Query failed after ${durationMs.toFixed(3)}ms:`, error);
    throw error;
  }
}
```

### Integrated Performance Monitoring

```typescript
import { globalPerformanceMonitor, AuditUtils } from "@repo/orchestration";

// Example 2: Comprehensive monitoring with audit logging
async function monitoredApiCall(endpoint: string, data: any, userId: string) {
  const timingId = globalPerformanceMonitor.startTiming(`api-call-${endpoint}`);
  const operationStart = process.hrtime.bigint();

  try {
    // Simulate API call
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    const metrics = globalPerformanceMonitor.endTiming(timingId);
    const totalDurationNs = process.hrtime.bigint() - operationStart;

    // Log successful operation with detailed metrics
    await AuditUtils.logDataAccess(
      "api_call",
      `${endpoint}-${Date.now()}`,
      "execute",
      userId,
      true,
      {
        endpoint,
        statusCode: response.status,
        responseTime: metrics.durationMs,
        totalDurationNs: Number(totalDurationNs),
        performanceMetrics: {
          monitoredDuration: metrics.durationMs,
          hrtimeDuration: Number(totalDurationNs) / 1_000_000,
          difference: Math.abs(
            metrics.durationMs - Number(totalDurationNs) / 1_000_000
          )
        }
      }
    );

    return result;
  } catch (error) {
    const metrics = globalPerformanceMonitor.endTiming(timingId);
    const totalDurationNs = process.hrtime.bigint() - operationStart;

    await AuditUtils.logSecurityEvent(
      "API call failed",
      "high",
      ["api_failure", "performance_issue"],
      {
        endpoint,
        error: (error as Error).message,
        failureTime: metrics.durationMs,
        totalDurationNs: Number(totalDurationNs)
      }
    );

    throw error;
  }
}
```

## Advanced Performance Patterns

### Concurrent Operations with Performance Tracking

```typescript
import {
  globalPerformanceMonitor,
  globalMemoryMonitor
} from "@repo/orchestration";

// Example 3: Monitor concurrent operations
async function performConcurrentOperations(
  operations: Array<() => Promise<any>>
) {
  const overallStart = process.hrtime.bigint();
  const concurrencyTimingId = globalPerformanceMonitor.startTiming(
    "concurrent-operations"
  );

  // Track memory usage before operations
  const initialMemory = globalMemoryMonitor.getCurrentMetrics();

  try {
    // Execute operations concurrently with individual timing
    const results = await Promise.allSettled(
      operations.map(async (operation, index) => {
        const operationStart = process.hrtime.bigint();
        const timingId = globalPerformanceMonitor.startTiming(
          `operation-${index}`
        );

        try {
          const result = await operation();
          const operationMetrics = globalPerformanceMonitor.endTiming(timingId);
          const operationDurationNs = process.hrtime.bigint() - operationStart;

          return {
            success: true,
            result,
            metrics: {
              index,
              monitoredDuration: operationMetrics.durationMs,
              preciseDuration: Number(operationDurationNs) / 1_000_000,
              precisionNs: Number(operationDurationNs)
            }
          };
        } catch (error) {
          const operationMetrics = globalPerformanceMonitor.endTiming(timingId);
          const operationDurationNs = process.hrtime.bigint() - operationStart;

          return {
            success: false,
            error: (error as Error).message,
            metrics: {
              index,
              failedAfter: operationMetrics.durationMs,
              preciseDuration: Number(operationDurationNs) / 1_000_000
            }
          };
        }
      })
    );

    // Calculate overall metrics
    const overallMetrics =
      globalPerformanceMonitor.endTiming(concurrencyTimingId);
    const totalDurationNs = process.hrtime.bigint() - overallStart;
    const finalMemory = globalMemoryMonitor.getCurrentMetrics();

    // Analyze results
    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    );
    const failed = results.filter(
      (r) => r.status === "rejected" || !r.value?.success
    );

    const performanceAnalysis = {
      totalOperations: operations.length,
      successful: successful.length,
      failed: failed.length,
      overallDuration: {
        monitored: overallMetrics.durationMs,
        precise: Number(totalDurationNs) / 1_000_000,
        precisionNs: Number(totalDurationNs)
      },
      memoryImpact: {
        initial: initialMemory?.heapUsed || 0,
        final: finalMemory?.heapUsed || 0,
        increase: (finalMemory?.heapUsed || 0) - (initialMemory?.heapUsed || 0)
      },
      operationMetrics: successful
        .map((r) => (r.status === "fulfilled" ? r.value.metrics : null))
        .filter(Boolean)
    };

    console.log(
      "Concurrent Operations Performance Analysis:",
      performanceAnalysis
    );

    return {
      results,
      performance: performanceAnalysis
    };
  } catch (error) {
    const overallMetrics =
      globalPerformanceMonitor.endTiming(concurrencyTimingId);

    await AuditUtils.logSecurityEvent(
      "Concurrent operations failed",
      "critical",
      ["concurrency_failure", "system_error"],
      {
        error: (error as Error).message,
        operationCount: operations.length,
        failureTime: overallMetrics.durationMs
      }
    );

    throw error;
  }
}
```

### Performance Benchmarking

```typescript
// Example 4: Comprehensive performance benchmarking
class PerformanceBenchmark {
  private results: Array<{
    operation: string;
    durationNs: bigint;
    durationMs: number;
    memoryBefore: number;
    memoryAfter: number;
    timestamp: Date;
  }> = [];

  async benchmark<T>(
    operationName: string,
    operation: () => Promise<T>,
    iterations: number = 10
  ): Promise<{
    result: T;
    statistics: {
      mean: number;
      median: number;
      min: number;
      max: number;
      standardDeviation: number;
      totalIterations: number;
      memoryImpact: number;
    };
  }> {
    const iterationResults: number[] = [];
    let result: T;
    let totalMemoryImpact = 0;

    console.log(
      `Benchmarking ${operationName} over ${iterations} iterations...`
    );

    for (let i = 0; i < iterations; i++) {
      // Force garbage collection if available (for accurate memory measurements)
      if (global.gc) {
        global.gc();
      }

      const memoryBefore = process.memoryUsage().heapUsed;
      const start = process.hrtime.bigint();

      try {
        result = await operation();

        const end = process.hrtime.bigint();
        const durationNs = end - start;
        const durationMs = Number(durationNs) / 1_000_000;
        const memoryAfter = process.memoryUsage().heapUsed;
        const memoryDelta = memoryAfter - memoryBefore;

        iterationResults.push(durationMs);
        totalMemoryImpact += memoryDelta;

        this.results.push({
          operation: operationName,
          durationNs,
          durationMs,
          memoryBefore,
          memoryAfter,
          timestamp: new Date()
        });

        // Log progress every 10% of iterations
        if ((i + 1) % Math.ceil(iterations / 10) === 0) {
          console.log(
            `Progress: ${(((i + 1) / iterations) * 100).toFixed(0)}% - Latest: ${durationMs.toFixed(3)}ms`
          );
        }
      } catch (error) {
        console.error(`Benchmark iteration ${i + 1} failed:`, error);
        throw error;
      }
    }

    // Calculate statistics
    const sortedResults = [...iterationResults].sort((a, b) => a - b);
    const mean =
      iterationResults.reduce((sum, val) => sum + val, 0) /
      iterationResults.length;
    const median = sortedResults[Math.floor(sortedResults.length / 2)];
    const min = Math.min(...iterationResults);
    const max = Math.max(...iterationResults);

    const variance =
      iterationResults.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      iterationResults.length;
    const standardDeviation = Math.sqrt(variance);

    const statistics = {
      mean,
      median,
      min,
      max,
      standardDeviation,
      totalIterations: iterations,
      memoryImpact: totalMemoryImpact / iterations // Average memory impact per iteration
    };

    // Log comprehensive benchmark results
    await AuditUtils.logDataAccess(
      "performance_benchmark",
      `benchmark-${operationName}-${Date.now()}`,
      "execute",
      "system",
      true,
      {
        operation: operationName,
        statistics,
        rawResults: iterationResults,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    );

    console.log(`Benchmark ${operationName} completed:`);
    console.log(`  Mean: ${mean.toFixed(3)}ms`);
    console.log(`  Median: ${median.toFixed(3)}ms`);
    console.log(`  Min: ${min.toFixed(3)}ms`);
    console.log(`  Max: ${max.toFixed(3)}ms`);
    console.log(`  Std Dev: ${standardDeviation.toFixed(3)}ms`);
    console.log(
      `  Avg Memory Impact: ${(totalMemoryImpact / iterations / 1024).toFixed(2)}KB`
    );

    return {
      result: result!,
      statistics
    };
  }

  getHistoricalResults(operationName?: string) {
    return operationName
      ? this.results.filter((r) => r.operation === operationName)
      : this.results;
  }

  async compareBenchmarks(
    operationA: { name: string; fn: () => Promise<any> },
    operationB: { name: string; fn: () => Promise<any> },
    iterations: number = 50
  ) {
    console.log(`Comparing ${operationA.name} vs ${operationB.name}...`);

    const benchmarkA = await this.benchmark(
      operationA.name,
      operationA.fn,
      iterations
    );
    const benchmarkB = await this.benchmark(
      operationB.name,
      operationB.fn,
      iterations
    );

    const comparison = {
      winner:
        benchmarkA.statistics.mean < benchmarkB.statistics.mean
          ? operationA.name
          : operationB.name,
      performance: {
        [operationA.name]: benchmarkA.statistics,
        [operationB.name]: benchmarkB.statistics
      },
      speedup: Math.abs(
        benchmarkA.statistics.mean / benchmarkB.statistics.mean
      ),
      memoryEfficiency: Math.abs(
        benchmarkA.statistics.memoryImpact / benchmarkB.statistics.memoryImpact
      )
    };

    console.log(`Winner: ${comparison.winner}`);
    console.log(`Speedup: ${comparison.speedup.toFixed(2)}x`);
    console.log(
      `Memory Efficiency: ${comparison.memoryEfficiency.toFixed(2)}x`
    );

    return comparison;
  }
}
```

## Real-World Examples

### E-commerce Order Processing

```typescript
// Example 5: E-commerce order processing with performance monitoring
async function processOrderWithMetrics(order: Order, userId: string) {
  const orderProcessingStart = process.hrtime.bigint();
  const timingId = globalPerformanceMonitor.startTiming("order-processing");

  try {
    // Step 1: Validate inventory
    const inventoryStart = process.hrtime.bigint();
    const inventoryTimingId = globalPerformanceMonitor.startTiming(
      "inventory-validation"
    );

    const inventoryValid = await validateInventory(order.items);

    const inventoryMetrics =
      globalPerformanceMonitor.endTiming(inventoryTimingId);
    const inventoryDurationNs = process.hrtime.bigint() - inventoryStart;

    if (!inventoryValid) {
      throw new Error("Insufficient inventory");
    }

    // Step 2: Process payment
    const paymentStart = process.hrtime.bigint();
    const paymentTimingId =
      globalPerformanceMonitor.startTiming("payment-processing");

    const paymentResult = await processPayment(order.paymentInfo);

    const paymentMetrics = globalPerformanceMonitor.endTiming(paymentTimingId);
    const paymentDurationNs = process.hrtime.bigint() - paymentStart;

    // Step 3: Reserve inventory
    const reservationStart = process.hrtime.bigint();
    const reservationTimingId = globalPerformanceMonitor.startTiming(
      "inventory-reservation"
    );

    await reserveInventory(order.items);

    const reservationMetrics =
      globalPerformanceMonitor.endTiming(reservationTimingId);
    const reservationDurationNs = process.hrtime.bigint() - reservationStart;

    // Step 4: Create shipment
    const shipmentStart = process.hrtime.bigint();
    const shipmentTimingId =
      globalPerformanceMonitor.startTiming("shipment-creation");

    const shipment = await createShipment(order);

    const shipmentMetrics =
      globalPerformanceMonitor.endTiming(shipmentTimingId);
    const shipmentDurationNs = process.hrtime.bigint() - shipmentStart;

    const overallMetrics = globalPerformanceMonitor.endTiming(timingId);
    const totalDurationNs = process.hrtime.bigint() - orderProcessingStart;

    // Comprehensive performance audit
    await AuditUtils.logDataAccess(
      "order_processing",
      order.id,
      "create",
      userId,
      true,
      {
        orderId: order.id,
        totalValue: order.totalAmount,
        itemCount: order.items.length,
        performanceBreakdown: {
          inventory: {
            monitored: inventoryMetrics.durationMs,
            precise: Number(inventoryDurationNs) / 1_000_000
          },
          payment: {
            monitored: paymentMetrics.durationMs,
            precise: Number(paymentDurationNs) / 1_000_000
          },
          reservation: {
            monitored: reservationMetrics.durationMs,
            precise: Number(reservationDurationNs) / 1_000_000
          },
          shipment: {
            monitored: shipmentMetrics.durationMs,
            precise: Number(shipmentDurationNs) / 1_000_000
          },
          overall: {
            monitored: overallMetrics.durationMs,
            precise: Number(totalDurationNs) / 1_000_000,
            precisionNs: Number(totalDurationNs)
          }
        },
        slaCompliance: {
          target: 5000, // 5 second SLA
          actual: overallMetrics.durationMs,
          met: overallMetrics.durationMs < 5000
        }
      }
    );

    return {
      orderId: order.id,
      paymentResult,
      shipment,
      performance: {
        totalDuration: overallMetrics.durationMs,
        breakdown: {
          inventory: inventoryMetrics.durationMs,
          payment: paymentMetrics.durationMs,
          reservation: reservationMetrics.durationMs,
          shipment: shipmentMetrics.durationMs
        }
      }
    };
  } catch (error) {
    const overallMetrics = globalPerformanceMonitor.endTiming(timingId);
    const totalDurationNs = process.hrtime.bigint() - orderProcessingStart;

    await AuditUtils.logSecurityEvent(
      "Order processing failed",
      "high",
      ["order_failure", "performance_issue"],
      {
        orderId: order.id,
        error: (error as Error).message,
        failureTime: overallMetrics.durationMs,
        preciseDurationNs: Number(totalDurationNs)
      }
    );

    throw error;
  }
}
```

### Performance Dashboard Data Collection

```typescript
// Example 6: Real-time performance dashboard
class PerformanceDashboard {
  private metrics: Array<{
    timestamp: Date;
    operation: string;
    durationMs: number;
    precisionNs: bigint;
    memoryUsed: number;
    cpuUsage?: number;
    userId?: string;
  }> = [];

  async collectMetrics() {
    const collectionStart = process.hrtime.bigint();

    // Get current system metrics
    const memoryUsage = process.memoryUsage();
    const performanceMetrics = globalPerformanceMonitor.getCurrentMetrics();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    const collectionEnd = process.hrtime.bigint();
    const collectionDurationNs = collectionEnd - collectionStart;

    const dashboardMetrics = {
      timestamp: new Date(),
      system: {
        memory: {
          heapUsed: memoryUsage.heapUsed,
          heapTotal: memoryUsage.heapTotal,
          external: memoryUsage.external,
          rss: memoryUsage.rss,
          arrayBuffers: memoryUsage.arrayBuffers
        },
        performance: performanceMetrics
          ? {
              cpu: performanceMetrics.cpu.usage,
              eventLoop: performanceMetrics.eventLoop.lag,
              memory: performanceMetrics.memory
            }
          : null,
        monitoredObjects: memoryMetrics?.objectCount || 0,
        potentialLeaks: globalMemoryMonitor.getPotentialLeaks().length
      },
      collection: {
        durationMs: Number(collectionDurationNs) / 1_000_000,
        precisionNs: collectionDurationNs
      },
      operations: this.getRecentOperationStats(),
      alerts: this.checkPerformanceAlerts()
    };

    // Store for historical analysis
    this.metrics.push({
      timestamp: new Date(),
      operation: "dashboard_collection",
      durationMs: Number(collectionDurationNs) / 1_000_000,
      precisionNs: collectionDurationNs,
      memoryUsed: memoryUsage.heapUsed
    });

    // Keep only last 1000 metrics to prevent memory growth
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    return dashboardMetrics;
  }

  private getRecentOperationStats(minutes: number = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    const operationGroups = recentMetrics.reduce(
      (groups, metric) => {
        if (!groups[metric.operation]) {
          groups[metric.operation] = [];
        }
        groups[metric.operation].push(metric.durationMs);
        return groups;
      },
      {} as Record<string, number[]>
    );

    return Object.entries(operationGroups).map(([operation, durations]) => ({
      operation,
      count: durations.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99)
    }));
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private checkPerformanceAlerts() {
    const alerts = [];
    const recentMetrics = this.getRecentOperationStats(1); // Last minute

    for (const metric of recentMetrics) {
      if (metric.avgDuration > 1000) {
        // 1 second threshold
        alerts.push({
          type: "slow_operation",
          operation: metric.operation,
          value: metric.avgDuration,
          threshold: 1000
        });
      }

      if (metric.p99Duration > 5000) {
        // 5 second P99 threshold
        alerts.push({
          type: "p99_breach",
          operation: metric.operation,
          value: metric.p99Duration,
          threshold: 5000
        });
      }
    }

    return alerts;
  }

  async generateReport(hours: number = 24) {
    const reportStart = process.hrtime.bigint();

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const reportMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    const report = {
      period: `${hours} hours`,
      summary: {
        totalOperations: reportMetrics.length,
        uniqueOperations: [...new Set(reportMetrics.map((m) => m.operation))]
          .length,
        avgDuration:
          reportMetrics.reduce((sum, m) => sum + m.durationMs, 0) /
          reportMetrics.length,
        totalDuration: reportMetrics.reduce((sum, m) => sum + m.durationMs, 0)
      },
      operationBreakdown: this.getRecentOperationStats(hours * 60),
      performanceTrends: this.calculateTrends(reportMetrics),
      recommendations: this.generateRecommendations(reportMetrics)
    };

    const reportEnd = process.hrtime.bigint();
    const reportDurationNs = reportEnd - reportStart;

    await AuditUtils.logDataAccess(
      "performance_report",
      `report-${Date.now()}`,
      "read",
      "system",
      true,
      {
        reportPeriod: hours,
        generationTime: Number(reportDurationNs) / 1_000_000,
        metricsAnalyzed: reportMetrics.length,
        report
      }
    );

    return report;
  }

  private calculateTrends(metrics: typeof this.metrics) {
    // Calculate hourly averages
    const hourlyGroups = metrics.reduce(
      (groups, metric) => {
        const hour = new Date(metric.timestamp).getHours();
        if (!groups[hour]) groups[hour] = [];
        groups[hour].push(metric.durationMs);
        return groups;
      },
      {} as Record<number, number[]>
    );

    const hourlyAverages = Object.entries(hourlyGroups).map(
      ([hour, durations]) => ({
        hour: parseInt(hour),
        avgDuration:
          durations.reduce((sum, d) => sum + d, 0) / durations.length,
        operationCount: durations.length
      })
    );

    return {
      hourlyAverages,
      peakHour: hourlyAverages.reduce((peak, current) =>
        current.avgDuration > peak.avgDuration ? current : peak
      ),
      quietHour: hourlyAverages.reduce((quiet, current) =>
        current.avgDuration < quiet.avgDuration ? current : quiet
      )
    };
  }

  private generateRecommendations(metrics: typeof this.metrics) {
    const recommendations = [];
    const avgDuration =
      metrics.reduce((sum, m) => sum + m.durationMs, 0) / metrics.length;

    if (avgDuration > 500) {
      recommendations.push({
        type: "performance",
        message: `Average operation duration (${avgDuration.toFixed(2)}ms) exceeds 500ms threshold`,
        severity: "medium",
        suggestion:
          "Consider optimizing slow operations or implementing caching"
      });
    }

    const memoryTrend = this.calculateMemoryTrend(metrics);
    if (memoryTrend > 0.1) {
      recommendations.push({
        type: "memory",
        message: "Memory usage shows upward trend, possible memory leak",
        severity: "high",
        suggestion:
          "Investigate potential memory leaks using memory monitoring tools"
      });
    }

    return recommendations;
  }

  private calculateMemoryTrend(metrics: typeof this.metrics): number {
    if (metrics.length < 2) return 0;

    const first = metrics[0].memoryUsed;
    const last = metrics[metrics.length - 1].memoryUsed;

    return (last - first) / first; // Percentage change
  }
}
```

## Testing Performance Features

```typescript
// Example 7: Testing Node 22+ performance features
import { describe, test, expect, beforeEach, afterEach } from "vitest";

describe("Node 22+ Performance Features", () => {
  let benchmark: PerformanceBenchmark;

  beforeEach(async () => {
    benchmark = new PerformanceBenchmark();
    await globalPerformanceMonitor.start();
  });

  afterEach(async () => {
    await globalPerformanceMonitor.stop();
  });

  test("should provide nanosecond precision timing", () => {
    const start = process.hrtime.bigint();

    // Perform minimal operation
    const data = { test: "value" };
    const cloned = structuredClone(data);

    const end = process.hrtime.bigint();
    const durationNs = end - start;

    // Should have measurable nanosecond precision
    expect(durationNs).toBeGreaterThan(0n);
    expect(Number(durationNs)).toBeGreaterThan(0);

    // Convert to milliseconds
    const durationMs = Number(durationNs) / 1_000_000;
    expect(durationMs).toBeGreaterThan(0);
    expect(durationMs).toBeLessThan(10); // Should be very fast
  });

  test("should accurately measure async operation timing", async () => {
    const delayMs = 100;
    const tolerance = 5; // 5ms tolerance

    const start = process.hrtime.bigint();

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const end = process.hrtime.bigint();
    const actualMs = Number(end - start) / 1_000_000;

    expect(actualMs).toBeGreaterThanOrEqual(delayMs - tolerance);
    expect(actualMs).toBeLessThanOrEqual(delayMs + tolerance * 2);
  });

  test("should integrate with performance monitor", async () => {
    const operation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return "completed";
    };

    const timingId = globalPerformanceMonitor.startTiming("test-operation");
    const result = await operation();
    const metrics = globalPerformanceMonitor.endTiming(timingId);

    expect(result).toBe("completed");
    expect(metrics).toBeDefined();
    expect(metrics.durationMs).toBeGreaterThan(45);
    expect(metrics.durationMs).toBeLessThan(100);
    expect(metrics.operation).toBe("test-operation");
  });

  test("should benchmark operations accurately", async () => {
    const operation = async () => {
      // Simulate some work
      const data = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        value: Math.random()
      }));
      return data.filter((item) => item.value > 0.5);
    };

    const result = await benchmark.benchmark("array-filtering", operation, 20);

    expect(result.result).toBeDefined();
    expect(Array.isArray(result.result)).toBe(true);
    expect(result.statistics.totalIterations).toBe(20);
    expect(result.statistics.mean).toBeGreaterThan(0);
    expect(result.statistics.standardDeviation).toBeGreaterThanOrEqual(0);
    expect(result.statistics.min).toBeLessThanOrEqual(result.statistics.max);
  });

  test("should compare operation performance", async () => {
    const slowOperation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return "slow";
    };

    const fastOperation = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return "fast";
    };

    const comparison = await benchmark.compareBenchmarks(
      { name: "slow", fn: slowOperation },
      { name: "fast", fn: fastOperation },
      10
    );

    expect(comparison.winner).toBe("fast");
    expect(comparison.speedup).toBeGreaterThan(1);
    expect(comparison.performance.slow.mean).toBeGreaterThan(
      comparison.performance.fast.mean
    );
  });
});
```

## Best Practices Summary

1. **Use `process.hrtime.bigint()`** for high-precision timing
2. **Convert BigInt to Number** for JSON serialization:
   `Number(bigint) / 1_000_000`
3. **Integrate with monitoring systems** for comprehensive observability
4. **Include memory metrics** alongside timing data
5. **Log performance data** for audit trails and analysis
6. **Set up alerts** for performance threshold breaches
7. **Benchmark regularly** to detect performance regressions
8. **Monitor trends** over time to identify patterns
9. **Use structured data** for dashboard consumption
10. **Include error timing** to understand failure performance impact

These examples demonstrate the power of Node 22+ high-resolution timing features
for comprehensive performance monitoring in production systems.
