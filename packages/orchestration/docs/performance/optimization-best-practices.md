# Performance Optimization Best Practices

## Overview

This guide provides comprehensive best practices for optimizing performance
using Node 22+ features in the `@repo/orchestration` package. These patterns are
proven to deliver significant performance improvements in production
environments.

## Table of Contents

- [High-Resolution Timing Optimization](#high-resolution-timing-optimization)
- [Memory Management Best Practices](#memory-management-best-practices)
- [Streaming and Backpressure Control](#streaming-and-backpressure-control)
- [Async Operation Optimization](#async-operation-optimization)
- [CPU Usage Optimization](#cpu-usage-optimization)
- [I/O Performance Optimization](#io-performance-optimization)
- [Monitoring and Profiling](#monitoring-and-profiling)
- [Production Performance Tuning](#production-performance-tuning)

## High-Resolution Timing Optimization

### Use `process.hrtime.bigint()` for Precise Measurements

```typescript
import { globalPerformanceMonitor } from "@repo/orchestration";

// ❌ Poor: Low precision timing
function measureOperationBasic() {
  const start = Date.now();
  performOperation();
  const duration = Date.now() - start;
  console.log(`Took ${duration}ms`);
}

// ✅ Good: High precision timing
function measureOperationPrecise() {
  const start = process.hrtime.bigint();
  performOperation();
  const end = process.hrtime.bigint();
  const durationNs = end - start;
  const durationMs = Number(durationNs) / 1_000_000;
  console.log(`Took ${durationMs.toFixed(3)}ms`);
}

// ✅ Best: Centralized performance monitoring
async function measureOperationOptimal() {
  const timingId = globalPerformanceMonitor.startTiming("operation-name");
  await performOperation();
  const metrics = globalPerformanceMonitor.endTiming(timingId);

  // Automatic logging and aggregation
  console.log(`Took ${metrics.durationMs}ms`);
}
```

### Performance Timing Patterns

```typescript
// Pattern 1: Batch timing for high-frequency operations
class BatchTimer {
  private measurements: bigint[] = [];
  private readonly maxBatchSize = 1000;

  startMeasurement(): () => void {
    const start = process.hrtime.bigint();

    return () => {
      const end = process.hrtime.bigint();
      const duration = end - start;

      this.measurements.push(duration);

      // Process batch when full
      if (this.measurements.length >= this.maxBatchSize) {
        this.processBatch();
      }
    };
  }

  private processBatch(): void {
    if (this.measurements.length === 0) return;

    // Convert to milliseconds and calculate statistics
    const durationsMs = this.measurements.map((ns) => Number(ns) / 1_000_000);

    const stats = {
      count: durationsMs.length,
      min: Math.min(...durationsMs),
      max: Math.max(...durationsMs),
      avg: durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length,
      p95: this.percentile(durationsMs, 95),
      p99: this.percentile(durationsMs, 99)
    };

    // Log batch statistics
    console.log(`Batch timing stats:`, stats);

    // Clear for next batch
    this.measurements = [];
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Pattern 2: Timing with automatic alerting
async function timedOperationWithAlerting<T>(
  operation: () => Promise<T>,
  operationName: string,
  expectedMaxMs: number = 1000
): Promise<T> {
  const timingId = globalPerformanceMonitor.startTiming(operationName);

  try {
    const result = await operation();
    const metrics = globalPerformanceMonitor.endTiming(timingId);

    // Alert on slow operations
    if (metrics && metrics.durationMs > expectedMaxMs) {
      console.warn(
        `⚠️ Slow operation detected: ${operationName} took ${metrics.durationMs}ms (expected < ${expectedMaxMs}ms)`
      );

      // Log as performance issue
      await AuditUtils.logSecurityEvent(
        `Slow operation: ${operationName}`,
        "medium",
        ["performance_degradation"],
        {
          operationName,
          durationMs: metrics.durationMs,
          expectedMaxMs,
          performanceRatio: metrics.durationMs / expectedMaxMs
        }
      );
    }

    return result;
  } catch (error) {
    globalPerformanceMonitor.endTiming(timingId);
    throw error;
  }
}
```

## Memory Management Best Practices

### Use WeakMap for Automatic Cleanup

```typescript
// ❌ Poor: Manual memory management with potential leaks
class LegacyObjectTracker {
  private trackedObjects = new Map<string, any>();

  track(id: string, object: any) {
    this.trackedObjects.set(id, object);
  }

  untrack(id: string) {
    this.trackedObjects.delete(id); // Must remember to call this!
  }
}

// ✅ Good: Automatic memory management
class OptimalObjectTracker {
  private objectMetadata = new WeakMap<
    object,
    {
      id: string;
      createdAt: Date;
      metadata: any;
    }
  >();

  track(object: object, id: string, metadata: any) {
    this.objectMetadata.set(object, {
      id,
      createdAt: new Date(),
      metadata
    });
    // Automatic cleanup when object is garbage collected
  }

  getMetadata(object: object) {
    return this.objectMetadata.get(object);
  }
}
```

### Memory-Efficient Data Processing

```typescript
import { globalMemoryMonitor } from "@repo/orchestration";

// Pattern 1: Memory-aware processing with monitoring
async function processLargeDataMemoryEfficient<T, R>(
  data: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    memoryThresholdMB?: number;
    gcInterval?: number;
  } = {}
): Promise<R[]> {
  const batchSize = options.batchSize || 100;
  const memoryThresholdMB = options.memoryThresholdMB || 100;
  const gcInterval = options.gcInterval || 1000; // items between GC checks

  const results: R[] = [];
  const startMemory = globalMemoryMonitor.getCurrentMetrics();

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    // Process batch
    const batchResults = await Promise.all(
      batch.map((item) => processor(item))
    );

    results.push(...batchResults);

    // Memory monitoring and cleanup
    if ((i + batchSize) % gcInterval === 0) {
      const currentMemory = globalMemoryMonitor.getCurrentMetrics();

      if (currentMemory && startMemory) {
        const memoryIncreaseMB =
          (currentMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;

        if (memoryIncreaseMB > memoryThresholdMB) {
          console.warn(
            `Memory threshold exceeded: ${memoryIncreaseMB.toFixed(1)}MB increase`
          );

          // Force garbage collection if available
          if (global.gc) {
            const beforeGc = process.memoryUsage().heapUsed;
            global.gc();
            const afterGc = process.memoryUsage().heapUsed;
            const freedMB = (beforeGc - afterGc) / 1024 / 1024;
            console.log(`Garbage collection freed ${freedMB.toFixed(1)}MB`);
          }
        }
      }
    }
  }

  return results;
}

// Pattern 2: Memory pool for frequent allocations
class MemoryPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (item: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (item: T) => void,
    maxSize: number = 100
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(item: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(item);
      this.pool.push(item);
    }
    // Item will be garbage collected if pool is full
  }

  clear(): void {
    this.pool = [];
  }

  get poolSize(): number {
    return this.pool.length;
  }
}

// Example usage of memory pool
const bufferPool = new MemoryPool(
  () => Buffer.alloc(1024), // Create 1KB buffer
  (buffer) => buffer.fill(0), // Reset buffer
  50 // Keep max 50 buffers in pool
);

async function processWithBufferPool(data: Uint8Array[]): Promise<Buffer[]> {
  const results: Buffer[] = [];

  for (const item of data) {
    const buffer = bufferPool.acquire();

    try {
      // Use buffer for processing
      item.copy(buffer);
      results.push(Buffer.from(buffer));
    } finally {
      bufferPool.release(buffer); // Return to pool
    }
  }

  return results;
}
```

### Memory Leak Detection and Prevention

```typescript
// Pattern: Automatic memory leak detection
class MemoryLeakDetector {
  private checkInterval?: NodeJS.Timeout;
  private baselineMemory?: NodeJS.MemoryUsage;
  private measurements: Array<{
    timestamp: Date;
    heapUsed: number;
    heapTotal: number;
    external: number;
  }> = [];

  startMonitoring(intervalMs: number = 30000): void {
    this.baselineMemory = process.memoryUsage();

    this.checkInterval = setInterval(() => {
      this.recordMemoryUsage();
      this.analyzeForLeaks();
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  private recordMemoryUsage(): void {
    const memory = process.memoryUsage();

    this.measurements.push({
      timestamp: new Date(),
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external
    });

    // Keep only last 100 measurements
    if (this.measurements.length > 100) {
      this.measurements = this.measurements.slice(-100);
    }
  }

  private analyzeForLeaks(): void {
    if (this.measurements.length < 10 || !this.baselineMemory) {
      return;
    }

    const recent = this.measurements.slice(-10);
    const recentAverage =
      recent.reduce((sum, m) => sum + m.heapUsed, 0) / recent.length;
    const baselineHeap = this.baselineMemory.heapUsed;

    // Check for consistent memory growth
    const growthMB = (recentAverage - baselineHeap) / 1024 / 1024;
    const isGrowing = this.isMemoryGrowing(recent);

    if (growthMB > 50 && isGrowing) {
      // 50MB growth threshold
      console.warn(
        `🚨 Potential memory leak detected: ${growthMB.toFixed(1)}MB growth from baseline`
      );

      // Log potential leak
      AuditUtils.logSecurityEvent(
        "Potential memory leak detected",
        "high",
        ["memory_leak", "resource_management"],
        {
          growthMB: growthMB.toFixed(1),
          baselineHeapMB: (baselineHeap / 1024 / 1024).toFixed(1),
          currentHeapMB: (recentAverage / 1024 / 1024).toFixed(1),
          measurementCount: this.measurements.length,
          trend: "increasing"
        }
      );

      // Get potential leaks from global monitor
      const potentialLeaks = globalMemoryMonitor.getPotentialLeaks();
      if (potentialLeaks.length > 0) {
        console.warn(
          `Found ${potentialLeaks.length} potential leak sources:`,
          potentialLeaks.map((leak) => ({
            type: leak.type,
            age: Date.now() - leak.timestamp.getTime()
          }))
        );
      }
    }
  }

  private isMemoryGrowing(measurements: Array<{ heapUsed: number }>): boolean {
    if (measurements.length < 5) return false;

    // Check if there's a consistent upward trend
    let increasingCount = 0;
    for (let i = 1; i < measurements.length; i++) {
      if (measurements[i].heapUsed > measurements[i - 1].heapUsed) {
        increasingCount++;
      }
    }

    // Consider it growing if > 70% of measurements are increasing
    return increasingCount / (measurements.length - 1) > 0.7;
  }
}
```

## Streaming and Backpressure Control

### Optimal Streaming Patterns

```typescript
import { createStreamProcessor, StreamUtils } from "@repo/orchestration";

// Pattern 1: Memory-bounded streaming with adaptive concurrency
async function processStreamWithAdaptiveConcurrency<T, R>(
  data: T[],
  processor: (item: T) => Promise<R>,
  options: {
    initialConcurrency?: number;
    memoryThresholdMB?: number;
    performanceTarget?: number; // items per second
  } = {}
): Promise<R[]> {
  let concurrency = options.initialConcurrency || 10;
  const memoryThresholdMB = options.memoryThresholdMB || 100;
  const performanceTarget = options.performanceTarget || 100;

  const results: R[] = [];
  const startTime = process.hrtime.bigint();

  // Create adaptive stream processor
  let streamProcessor = createStreamProcessor(processor, {
    concurrency,
    backpressure: { memoryThresholdMB }
  });

  const stream = StreamUtils.arrayToAsyncIterable(data);
  let processedCount = 0;
  let lastAdaptation = Date.now();

  for await (const result of streamProcessor.processStream(stream)) {
    results.push(result);
    processedCount++;

    // Adapt concurrency every 1000 items
    if (processedCount % 1000 === 0 && Date.now() - lastAdaptation > 5000) {
      const currentTime = process.hrtime.bigint();
      const elapsedSeconds = Number(currentTime - startTime) / 1_000_000_000;
      const itemsPerSecond = processedCount / elapsedSeconds;

      // Adjust concurrency based on performance
      if (itemsPerSecond < performanceTarget * 0.8) {
        // Too slow, increase concurrency
        concurrency = Math.min(concurrency + 2, 50);
      } else if (itemsPerSecond > performanceTarget * 1.2) {
        // Too fast, might be using too many resources
        concurrency = Math.max(concurrency - 1, 1);
      }

      // Recreate stream processor with new concurrency
      streamProcessor = createStreamProcessor(processor, {
        concurrency,
        backpressure: { memoryThresholdMB }
      });

      lastAdaptation = Date.now();
      console.log(
        `Adapted concurrency to ${concurrency} (${itemsPerSecond.toFixed(1)} items/sec)`
      );
    }
  }

  return results;
}

// Pattern 2: Priority-based streaming
interface PriorityItem<T> {
  item: T;
  priority: number; // Higher number = higher priority
  timestamp: Date;
}

class PriorityStreamProcessor<T, R> {
  private queues: Map<number, PriorityItem<T>[]> = new Map();
  private processor: (item: T) => Promise<R>;
  private concurrency: number;
  private activePromises = new Set<Promise<void>>();

  constructor(processor: (item: T) => Promise<R>, concurrency: number = 10) {
    this.processor = processor;
    this.concurrency = concurrency;
  }

  async *processItems(
    items: AsyncIterable<PriorityItem<T>>
  ): AsyncGenerator<R> {
    // Fill initial queue
    const itemIterator = items[Symbol.asyncIterator]();

    // Start processing
    while (true) {
      // Fill queue up to concurrency limit
      while (this.activePromises.size < this.concurrency) {
        const nextItem = await this.getNextPriorityItem(itemIterator);
        if (!nextItem) break;

        const promise = this.processItem(nextItem);
        this.activePromises.add(promise);
      }

      if (this.activePromises.size === 0) break;

      // Wait for next item to complete
      const result = await Promise.race(this.activePromises);
      yield result;
    }
  }

  private async getNextPriorityItem(
    iterator: AsyncIterator<PriorityItem<T>>
  ): Promise<PriorityItem<T> | null> {
    // First check existing queues for highest priority item
    const priorities = Array.from(this.queues.keys()).sort((a, b) => b - a);

    for (const priority of priorities) {
      const queue = this.queues.get(priority)!;
      if (queue.length > 0) {
        return queue.shift()!;
      }
    }

    // Get next item from stream
    const next = await iterator.next();
    return next.done ? null : next.value;
  }

  private async processItem(item: PriorityItem<T>): Promise<R> {
    const promise = (async () => {
      try {
        const startTime = process.hrtime.bigint();
        const result = await this.processor(item.item);
        const processingTime =
          Number(process.hrtime.bigint() - startTime) / 1_000_000;

        // Log slow high-priority items
        if (item.priority > 8 && processingTime > 1000) {
          console.warn(
            `High-priority item took ${processingTime.toFixed(1)}ms to process`
          );
        }

        return result;
      } finally {
        this.activePromises.delete(promise);
      }
    })();

    return promise;
  }
}
```

## Async Operation Optimization

### Promise.withResolvers() Optimization Patterns

```typescript
// Pattern 1: Efficient timeout management
class TimeoutManager {
  private activeTimeouts = new Map<
    string,
    {
      timeoutId: NodeJS.Timeout;
      resolve: (value: any) => void;
      reject: (error: Error) => void;
    }
  >();

  createTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    const { promise, resolve, reject } = Promise.withResolvers<T>();

    const timeoutId = setTimeout(() => {
      this.activeTimeouts.delete(operationName);
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    this.activeTimeouts.set(operationName, { timeoutId, resolve, reject });

    operation
      .then((result) => {
        const timeout = this.activeTimeouts.get(operationName);
        if (timeout) {
          clearTimeout(timeout.timeoutId);
          this.activeTimeouts.delete(operationName);
          resolve(result);
        }
      })
      .catch((error) => {
        const timeout = this.activeTimeouts.get(operationName);
        if (timeout) {
          clearTimeout(timeout.timeoutId);
          this.activeTimeouts.delete(operationName);
          reject(error);
        }
      });

    return promise;
  }

  cancelTimeout(operationName: string): boolean {
    const timeout = this.activeTimeouts.get(operationName);
    if (timeout) {
      clearTimeout(timeout.timeoutId);
      timeout.reject(new Error(`${operationName} was cancelled`));
      this.activeTimeouts.delete(operationName);
      return true;
    }
    return false;
  }

  cancelAllTimeouts(): void {
    for (const [name, timeout] of this.activeTimeouts) {
      clearTimeout(timeout.timeoutId);
      timeout.reject(new Error(`${name} was cancelled during shutdown`));
    }
    this.activeTimeouts.clear();
  }

  getActiveTimeouts(): string[] {
    return Array.from(this.activeTimeouts.keys());
  }
}

// Pattern 2: Batched async operations
class BatchProcessor<T, R> {
  private pendingItems: Array<{
    item: T;
    resolve: (result: R) => void;
    reject: (error: Error) => void;
  }> = [];

  private batchTimer?: NodeJS.Timeout;
  private readonly batchSize: number;
  private readonly batchTimeoutMs: number;
  private readonly processor: (items: T[]) => Promise<R[]>;

  constructor(
    processor: (items: T[]) => Promise<R[]>,
    batchSize: number = 100,
    batchTimeoutMs: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.batchTimeoutMs = batchTimeoutMs;
  }

  async process(item: T): Promise<R> {
    const { promise, resolve, reject } = Promise.withResolvers<R>();

    this.pendingItems.push({ item, resolve, reject });

    // Process batch if full
    if (this.pendingItems.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.batchTimer) {
      // Set timer for partial batch
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.batchTimeoutMs);
    }

    return promise;
  }

  private async processBatch(): Promise<void> {
    if (this.pendingItems.length === 0) return;

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }

    // Take current batch
    const batch = this.pendingItems.splice(0);
    const items = batch.map((b) => b.item);

    try {
      const startTime = process.hrtime.bigint();
      const results = await this.processor(items);
      const processingTime =
        Number(process.hrtime.bigint() - startTime) / 1_000_000;

      // Resolve all promises
      batch.forEach((b, index) => {
        if (index < results.length) {
          b.resolve(results[index]);
        } else {
          b.reject(new Error("Insufficient results from batch processor"));
        }
      });

      // Log batch performance
      if (processingTime > 1000) {
        // Log slow batches
        console.warn(
          `Slow batch processing: ${batch.length} items took ${processingTime.toFixed(1)}ms`
        );
      }
    } catch (error) {
      // Reject all promises
      batch.forEach((b) => b.reject(error as Error));
    }
  }

  async flush(): Promise<void> {
    if (this.pendingItems.length > 0) {
      await this.processBatch();
    }
  }

  getPendingCount(): number {
    return this.pendingItems.length;
  }
}
```

## CPU Usage Optimization

### CPU-Intensive Operation Patterns

```typescript
// Pattern 1: CPU work distribution across event loop ticks
async function processCpuIntensiveWork<T, R>(
  items: T[],
  processor: (item: T) => R,
  options: {
    batchSize?: number;
    yieldInterval?: number;
  } = {}
): Promise<R[]> {
  const batchSize = options.batchSize || 100;
  const yieldInterval = options.yieldInterval || 10; // ms

  const results: R[] = [];
  let lastYield = Date.now();

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    // Process batch synchronously
    for (const item of batch) {
      results.push(processor(item));

      // Yield control periodically to prevent blocking
      if (Date.now() - lastYield > yieldInterval) {
        await new Promise((resolve) => setImmediate(resolve));
        lastYield = Date.now();
      }
    }
  }

  return results;
}

// Pattern 2: Worker thread pool for heavy CPU work
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";

class WorkerPool {
  private workers: Worker[] = [];
  private workQueue: Array<{
    data: any;
    resolve: (result: any) => void;
    reject: (error: Error) => void;
  }> = [];
  private availableWorkers: Worker[] = [];

  constructor(
    workerScript: string,
    poolSize: number = require("os").cpus().length
  ) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);

      worker.on("message", (result) => {
        // Worker is now available
        this.availableWorkers.push(worker);
        this.processQueue();
      });

      worker.on("error", (error) => {
        console.error("Worker error:", error);
        // Remove from available workers
        const index = this.availableWorkers.indexOf(worker);
        if (index !== -1) {
          this.availableWorkers.splice(index, 1);
        }
      });

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async execute<T, R>(data: T): Promise<R> {
    const { promise, resolve, reject } = Promise.withResolvers<R>();

    this.workQueue.push({ data, resolve, reject });
    this.processQueue();

    return promise;
  }

  private processQueue(): void {
    while (this.workQueue.length > 0 && this.availableWorkers.length > 0) {
      const work = this.workQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      // Set up one-time message handler
      const messageHandler = (result: any) => {
        worker.off("message", messageHandler);
        worker.off("error", errorHandler);
        work.resolve(result);
      };

      const errorHandler = (error: Error) => {
        worker.off("message", messageHandler);
        worker.off("error", errorHandler);
        work.reject(error);
      };

      worker.on("message", messageHandler);
      worker.on("error", errorHandler);

      // Send work to worker
      worker.postMessage(work.data);
    }
  }

  async terminate(): Promise<void> {
    await Promise.all(this.workers.map((worker) => worker.terminate()));
    this.workers = [];
    this.availableWorkers = [];
  }
}

// Example worker script (save as cpu-worker.js)
/*
const { parentPort, workerData } = require('worker_threads');

if (parentPort) {
  parentPort.on('message', (data) => {
    try {
      // Perform CPU-intensive work here
      const result = performCpuIntensiveTask(data);
      parentPort.postMessage(result);
    } catch (error) {
      parentPort.postMessage({ error: error.message });
    }
  });
}

function performCpuIntensiveTask(data) {
  // Example: Complex mathematical calculation
  let result = 0;
  for (let i = 0; i < data.iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  return { result, processed: data.iterations };
}
*/
```

## I/O Performance Optimization

### Database Query Optimization

```typescript
// Pattern 1: Connection pooling with performance monitoring
import { globalPerformanceMonitor } from "@repo/orchestration";

class OptimizedDatabaseConnection {
  private connectionPool: any; // Your database connection pool
  private queryMetrics = new Map<
    string,
    {
      count: number;
      totalTime: number;
      maxTime: number;
      minTime: number;
      errors: number;
    }
  >();

  async query<T>(
    sql: string,
    params: any[] = [],
    options: {
      timeout?: number;
      retries?: number;
      cacheTtl?: number;
    } = {}
  ): Promise<T> {
    const queryId = this.createQueryId(sql);
    const timingId = globalPerformanceMonitor.startTiming(
      `db-query-${queryId}`
    );

    const startTime = process.hrtime.bigint();
    let attempt = 0;
    const maxRetries = options.retries || 3;

    while (attempt < maxRetries) {
      try {
        // Add query timeout
        const timeoutMs = options.timeout || 30000;
        const queryPromise = this.connectionPool.query(sql, params);

        const result = await globalTimeoutManager.wrapWithTimeout(
          queryPromise,
          timeoutMs,
          { name: `db-query-${queryId}` }
        );

        // Record successful query metrics
        const metrics = globalPerformanceMonitor.endTiming(timingId);
        if (metrics) {
          this.recordQueryMetrics(queryId, metrics.durationMs, false);
        }

        return result;
      } catch (error) {
        attempt++;
        const durationMs =
          Number(process.hrtime.bigint() - startTime) / 1_000_000;

        // Record error metrics
        this.recordQueryMetrics(queryId, durationMs, true);

        if (attempt >= maxRetries) {
          globalPerformanceMonitor.endTiming(timingId);

          // Log query failure
          await AuditUtils.logSecurityEvent(
            "Database query failed",
            "high",
            ["database_error", "query_failure"],
            {
              queryId,
              sql: this.sanitizeSql(sql),
              attempts: attempt,
              durationMs,
              errorMessage: (error as Error).message
            }
          );

          throw error;
        }

        // Exponential backoff between retries
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
        );
      }
    }

    throw new Error("Query failed after all retries");
  }

  // Pattern 2: Query result caching
  private queryCache = new Map<
    string,
    {
      result: any;
      timestamp: Date;
      ttl: number;
    }
  >();

  async cachedQuery<T>(
    sql: string,
    params: any[] = [],
    cacheTtlMs: number = 60000
  ): Promise<T> {
    const cacheKey = this.createCacheKey(sql, params);
    const cached = this.queryCache.get(cacheKey);

    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp.getTime() < cached.ttl) {
      return cached.result;
    }

    // Execute query
    const result = await this.query<T>(sql, params);

    // Cache result
    this.queryCache.set(cacheKey, {
      result,
      timestamp: new Date(),
      ttl: cacheTtlMs
    });

    // Cleanup old cache entries periodically
    if (this.queryCache.size > 1000) {
      this.cleanupCache();
    }

    return result;
  }

  private createQueryId(sql: string): string {
    // Create consistent query ID for metrics
    return sql
      .replace(/\s+/g, " ")
      .replace(/\$\d+/g, "$?") // Replace params with placeholder
      .trim()
      .substring(0, 50);
  }

  private createCacheKey(sql: string, params: any[]): string {
    return `${this.createQueryId(sql)}:${JSON.stringify(params)}`;
  }

  private recordQueryMetrics(
    queryId: string,
    durationMs: number,
    isError: boolean
  ): void {
    const existing = this.queryMetrics.get(queryId) || {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      minTime: Infinity,
      errors: 0
    };

    existing.count++;
    existing.totalTime += durationMs;
    existing.maxTime = Math.max(existing.maxTime, durationMs);
    existing.minTime = Math.min(existing.minTime, durationMs);

    if (isError) {
      existing.errors++;
    }

    this.queryMetrics.set(queryId, existing);
  }

  private cleanupCache(): void {
    const now = Date.now();

    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp.getTime() > cached.ttl) {
        this.queryCache.delete(key);
      }
    }
  }

  private sanitizeSql(sql: string): string {
    // Remove sensitive data from SQL for logging
    return sql
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .substring(0, 200);
  }

  getQueryMetrics(): Array<{
    queryId: string;
    avgTime: number;
    count: number;
    errorRate: number;
    maxTime: number;
    minTime: number;
  }> {
    return Array.from(this.queryMetrics.entries()).map(
      ([queryId, metrics]) => ({
        queryId,
        avgTime: metrics.totalTime / metrics.count,
        count: metrics.count,
        errorRate: (metrics.errors / metrics.count) * 100,
        maxTime: metrics.maxTime,
        minTime: metrics.minTime === Infinity ? 0 : metrics.minTime
      })
    );
  }
}
```

## Monitoring and Profiling

### Comprehensive Performance Monitoring

```typescript
import {
  globalPerformanceMonitor,
  globalMemoryMonitor,
  AuditUtils
} from "@repo/orchestration";

class PerformanceProfiler {
  private profiles = new Map<
    string,
    {
      startTime: bigint;
      startMemory: NodeJS.MemoryUsage;
      samples: Array<{
        timestamp: Date;
        heapUsed: number;
        cpuUsage: NodeJS.CpuUsage;
        eventLoopLag: number;
      }>;
    }
  >();

  private samplingInterval?: NodeJS.Timeout;

  startProfiling(profileName: string): void {
    const profile = {
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage(),
      samples: []
    };

    this.profiles.set(profileName, profile);

    // Start sampling
    this.samplingInterval = setInterval(() => {
      const currentMetrics = globalPerformanceMonitor.getCurrentMetrics();

      profile.samples.push({
        timestamp: new Date(),
        heapUsed: process.memoryUsage().heapUsed,
        cpuUsage: process.cpuUsage(),
        eventLoopLag: currentMetrics?.eventLoop.lag || 0
      });
    }, 100); // Sample every 100ms
  }

  async stopProfiling(profileName: string): Promise<{
    totalDurationMs: number;
    memoryGrowthMB: number;
    avgCpuUsage: number;
    maxEventLoopLag: number;
    samples: number;
    recommendations: string[];
  }> {
    const profile = this.profiles.get(profileName);
    if (!profile) {
      throw new Error(`Profile '${profileName}' not found`);
    }

    if (this.samplingInterval) {
      clearInterval(this.samplingInterval);
      this.samplingInterval = undefined;
    }

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();

    // Calculate metrics
    const totalDurationMs = Number(endTime - profile.startTime) / 1_000_000;
    const memoryGrowthMB =
      (endMemory.heapUsed - profile.startMemory.heapUsed) / 1024 / 1024;

    const avgCpuUsage =
      profile.samples.length > 0
        ? profile.samples.reduce(
            (sum, s) => sum + (s.cpuUsage.user + s.cpuUsage.system),
            0
          ) / profile.samples.length
        : 0;

    const maxEventLoopLag =
      profile.samples.length > 0
        ? Math.max(...profile.samples.map((s) => s.eventLoopLag))
        : 0;

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalDurationMs,
      memoryGrowthMB,
      avgCpuUsage,
      maxEventLoopLag,
      sampleCount: profile.samples.length
    });

    const result = {
      totalDurationMs,
      memoryGrowthMB,
      avgCpuUsage,
      maxEventLoopLag,
      samples: profile.samples.length,
      recommendations
    };

    // Log profiling results
    await AuditUtils.logDataAccess(
      "performance_profile",
      profileName,
      "read",
      "system",
      true,
      {
        profileResult: result,
        profileDuration: totalDurationMs,
        memoryImpact: memoryGrowthMB,
        performanceIssues: recommendations.length > 0,
        detailedMetrics: {
          initialMemoryMB: profile.startMemory.heapUsed / 1024 / 1024,
          finalMemoryMB: endMemory.heapUsed / 1024 / 1024,
          sampleFrequency: "100ms"
        }
      }
    );

    // Cleanup
    this.profiles.delete(profileName);

    return result;
  }

  private generateRecommendations(metrics: {
    totalDurationMs: number;
    memoryGrowthMB: number;
    avgCpuUsage: number;
    maxEventLoopLag: number;
    sampleCount: number;
  }): string[] {
    const recommendations: string[] = [];

    // Duration recommendations
    if (metrics.totalDurationMs > 10000) {
      // 10 seconds
      recommendations.push(
        "Consider breaking down long-running operations into smaller chunks"
      );
    }

    // Memory recommendations
    if (metrics.memoryGrowthMB > 100) {
      recommendations.push(
        "High memory growth detected - check for memory leaks or optimize data structures"
      );
    }

    // CPU recommendations
    if (metrics.avgCpuUsage > 80) {
      recommendations.push(
        "High CPU usage - consider using worker threads for CPU-intensive tasks"
      );
    }

    // Event loop recommendations
    if (metrics.maxEventLoopLag > 100) {
      // 100ms
      recommendations.push(
        "Event loop lag detected - avoid synchronous operations and use async patterns"
      );
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "Performance looks good - no immediate optimizations needed"
      );
    }

    return recommendations;
  }
}

// Usage example
async function profiledOperation() {
  const profiler = new PerformanceProfiler();

  profiler.startProfiling("critical-operation");

  try {
    // Your operation here
    await performCriticalOperation();

    const results = await profiler.stopProfiling("critical-operation");

    console.log("Performance Results:", results);

    if (results.recommendations.length > 1) {
      console.warn("Performance Recommendations:", results.recommendations);
    }
  } catch (error) {
    await profiler.stopProfiling("critical-operation");
    throw error;
  }
}
```

## Production Performance Tuning

### Production-Ready Configuration

```typescript
// Production performance configuration
const PRODUCTION_CONFIG = {
  performance: {
    // Timing configuration
    highResolutionTiming: true,
    timingPrecision: "nanosecond",
    performanceMonitoringInterval: 30000, // 30 seconds

    // Memory configuration
    memoryMonitoringEnabled: true,
    memoryThresholdMB: 500, // Alert at 500MB
    gcOptimization: process.env.NODE_ENV === "production",
    weakMapOptimization: true,

    // Streaming configuration
    defaultConcurrency: 20,
    backpressureThresholdMB: 200,
    adaptiveConcurrency: true,

    // Async operation configuration
    defaultTimeoutMs: 30000,
    maxRetries: 3,
    exponentialBackoff: true,

    // I/O configuration
    connectionPoolSize: 20,
    queryTimeoutMs: 15000,
    cacheEnabled: true,
    cacheTtlMs: 300000 // 5 minutes
  },

  monitoring: {
    enableDetailedMetrics: true,
    enableProfiling: false, // Disable in production for performance
    alerting: {
      cpuThreshold: 80,
      memoryThreshold: 85,
      responseTimeThreshold: 2000,
      errorRateThreshold: 5
    }
  }
};

// Production performance initialization
export async function initializeProductionPerformance(): Promise<void> {
  // Start performance monitoring
  await globalPerformanceMonitor.start();
  await globalMemoryMonitor.start();

  // Configure GC optimization for production
  if (PRODUCTION_CONFIG.performance.gcOptimization && global.gc) {
    // Set up periodic GC for long-running processes
    setInterval(() => {
      const before = process.memoryUsage().heapUsed;
      global.gc();
      const after = process.memoryUsage().heapUsed;
      const freedMB = (before - after) / 1024 / 1024;

      if (freedMB > 50) {
        // Only log significant GC
        console.log(`Garbage collection freed ${freedMB.toFixed(1)}MB`);
      }
    }, 60000); // Every minute
  }

  // Set up performance alerting
  setInterval(async () => {
    const metrics = globalPerformanceMonitor.getCurrentMetrics();
    const memoryMetrics = globalMemoryMonitor.getCurrentMetrics();

    if (metrics && memoryMetrics) {
      await checkPerformanceAlerts(metrics, memoryMetrics);
    }
  }, PRODUCTION_CONFIG.performance.performanceMonitoringInterval);

  // Log initialization
  await AuditUtils.logDataAccess(
    "performance_initialization",
    "production-performance",
    "execute",
    "system",
    true,
    {
      config: PRODUCTION_CONFIG,
      nodeVersion: process.version,
      platform: process.platform,
      cpuCount: require("os").cpus().length,
      totalMemoryGB: require("os").totalmem() / 1024 / 1024 / 1024
    }
  );
}

async function checkPerformanceAlerts(
  performanceMetrics: any,
  memoryMetrics: any
): Promise<void> {
  const alerts = [];

  // CPU alerts
  if (
    performanceMetrics.cpu.usage >
    PRODUCTION_CONFIG.monitoring.alerting.cpuThreshold
  ) {
    alerts.push({
      type: "cpu_high",
      value: performanceMetrics.cpu.usage,
      threshold: PRODUCTION_CONFIG.monitoring.alerting.cpuThreshold
    });
  }

  // Memory alerts
  const memoryUsagePercent =
    (memoryMetrics.heapUsed / memoryMetrics.heapTotal) * 100;
  if (
    memoryUsagePercent > PRODUCTION_CONFIG.monitoring.alerting.memoryThreshold
  ) {
    alerts.push({
      type: "memory_high",
      value: memoryUsagePercent,
      threshold: PRODUCTION_CONFIG.monitoring.alerting.memoryThreshold
    });
  }

  // Event loop lag alerts
  if (
    performanceMetrics.eventLoop.lag >
    PRODUCTION_CONFIG.monitoring.alerting.responseTimeThreshold
  ) {
    alerts.push({
      type: "eventloop_lag",
      value: performanceMetrics.eventLoop.lag,
      threshold: PRODUCTION_CONFIG.monitoring.alerting.responseTimeThreshold
    });
  }

  // Send alerts
  for (const alert of alerts) {
    await AuditUtils.logSecurityEvent(
      `Production performance alert: ${alert.type}`,
      "high",
      ["production_alert", "performance_degradation"],
      {
        alertType: alert.type,
        currentValue: alert.value,
        threshold: alert.threshold,
        severity: alert.value > alert.threshold * 1.2 ? "critical" : "high",
        systemSnapshot: {
          cpuUsage: performanceMetrics.cpu.usage,
          memoryUsage: memoryUsagePercent,
          eventLoopLag: performanceMetrics.eventLoop.lag,
          uptime: process.uptime()
        }
      }
    );
  }
}
```

## Key Performance Takeaways

1. **Use High-Resolution Timing**: `process.hrtime.bigint()` provides nanosecond
   precision for accurate performance measurement
2. **Implement Memory Management**: WeakMap and proper tracking prevent memory
   leaks
3. **Control Backpressure**: Streaming with memory thresholds prevents resource
   exhaustion
4. **Optimize Async Operations**: `Promise.withResolvers()` enables better
   control flow
5. **Monitor Continuously**: Real-time metrics help identify performance issues
   early
6. **Profile in Development**: Use detailed profiling to identify bottlenecks
   before production
7. **Configure for Production**: Optimize settings for production workloads and
   monitoring

These patterns, when applied consistently, can deliver 30-50% performance
improvements while maintaining system stability and observability.
