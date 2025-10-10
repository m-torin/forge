/**
 * Memory-Optimized Batch Processor for Large File Sets
 *
 * This utility prevents out-of-memory crashes when processing large numbers of files
 * by splitting work into manageable batches with memory pressure monitoring.
 */

import { randomUUID } from 'crypto';
import { AbortSignal } from 'node-abort-controller';
import { cpus, freemem, totalmem } from 'os';
import { performance } from 'perf_hooks';

export interface BatchProcessorOptions {
  /** Maximum files per batch (default: 100) */
  batchSize?: number;
  /** Maximum memory usage percentage before pausing (default: 80) */
  memoryThreshold?: number;
  /** Enable automatic garbage collection (default: true) */
  enableGC?: boolean;
  /** Delay between batches in milliseconds (default: 1000) */
  batchDelay?: number;
  /** Maximum concurrent batches (default: 1) */
  maxConcurrency?: number;
  /** Enable progress reporting (default: true) */
  enableProgress?: boolean;
  /** Session ID for tracking (default: auto-generated) */
  sessionId?: string;
}

export interface BatchProgress {
  sessionId: string;
  totalBatches: number;
  completedBatches: number;
  totalItems: number;
  processedItems: number;
  currentBatch: number;
  startTime: number;
  estimatedEndTime?: number;
  memoryUsage: MemoryUsage;
  averageBatchTime: number;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  free: number;
  heapUsed: number;
  heapTotal: number;
}

export interface BatchResult<T> {
  success: boolean;
  results: T[];
  errors: Error[];
  progress: BatchProgress;
  metrics: ProcessingMetrics;
}

export interface ProcessingMetrics {
  totalProcessingTime: number;
  averageItemTime: number;
  memoryPeak: number;
  gcTriggerCount: number;
  pauseCount: number;
  totalPauseTime: number;
}

export type BatchProcessor<T, R> = (
  items: T[],
  batchIndex: number,
  signal?: AbortSignal,
) => Promise<R[]>;

export type ProgressCallback = (progress: BatchProgress) => void;

export class BatchProcessorEngine<T, R> {
  private options: Required<BatchProcessorOptions>;
  private progress: BatchProgress;
  private metrics: ProcessingMetrics;
  private progressCallbacks: Set<ProgressCallback> = new Set();
  private batchTimes: number[] = [];

  constructor(options: BatchProcessorOptions = {}) {
    const totalMemoryMB = Math.round(totalmem() / 1024 / 1024);

    this.options = {
      batchSize: options.batchSize ?? Math.min(100, Math.max(10, Math.floor(totalMemoryMB / 50))),
      memoryThreshold: options.memoryThreshold ?? 80,
      enableGC: options.enableGC ?? true,
      batchDelay: options.batchDelay ?? 1000,
      maxConcurrency: options.maxConcurrency ?? 1,
      enableProgress: options.enableProgress ?? true,
      sessionId: options.sessionId ?? `batch_${randomUUID().slice(0, 8)}`,
    };

    this.progress = {
      sessionId: this.options.sessionId,
      totalBatches: 0,
      completedBatches: 0,
      totalItems: 0,
      processedItems: 0,
      currentBatch: 0,
      startTime: Date.now(),
      memoryUsage: this.getMemoryUsage(),
      averageBatchTime: 0,
    };

    this.metrics = {
      totalProcessingTime: 0,
      averageItemTime: 0,
      memoryPeak: 0,
      gcTriggerCount: 0,
      pauseCount: 0,
      totalPauseTime: 0,
    };
  }

  /**
   * Register a callback for progress updates
   */
  public onProgress(callback: ProgressCallback): void {
    this.progressCallbacks.add(callback);
  }

  /**
   * Remove a progress callback
   */
  public offProgress(callback: ProgressCallback): void {
    this.progressCallbacks.delete(callback);
  }

  /**
   * Process items in optimized batches
   */
  public async process(
    items: T[],
    processor: BatchProcessor<T, R>,
    signal?: AbortSignal,
  ): Promise<BatchResult<R>> {
    const startTime = performance.now();
    const batches = this.splitIntoBatches(items);
    const allResults: R[] = [];
    const allErrors: Error[] = [];

    // Initialize progress
    this.progress.totalBatches = batches.length;
    this.progress.totalItems = items.length;
    this.progress.startTime = Date.now();

    try {
      // Process batches with concurrency control
      if (this.options.maxConcurrency === 1) {
        // Sequential processing for memory efficiency
        for (let i = 0; i < batches.length; i++) {
          if (signal?.aborted) {
            throw new Error('Processing was aborted');
          }

          const batchResult = await this.processBatch(batches[i], i, processor, signal);

          allResults.push(...batchResult.results);
          allErrors.push(...batchResult.errors);
        }
      } else {
        // Concurrent processing with limited concurrency
        const semaphore = new Semaphore(this.options.maxConcurrency);
        const promises = batches.map(async (batch, index) => {
          const release = await semaphore.acquire();
          try {
            return await this.processBatch(batch, index, processor, signal);
          } finally {
            release();
          }
        });

        const results = await Promise.allSettled(promises);

        for (const result of results) {
          if (result.status === 'fulfilled') {
            allResults.push(...result.value.results);
            allErrors.push(...result.value.errors);
          } else {
            allErrors.push(new Error(`Batch failed: ${result.reason}`));
          }
        }
      }

      const endTime = performance.now();
      this.metrics.totalProcessingTime = endTime - startTime;
      this.metrics.averageItemTime = this.metrics.totalProcessingTime / items.length;

      // Final progress update
      this.progress.completedBatches = batches.length;
      this.progress.processedItems = items.length;
      this.emitProgress();

      return {
        success: allErrors.length === 0,
        results: allResults,
        errors: allErrors,
        progress: { ...this.progress },
        metrics: { ...this.metrics },
      };
    } catch (error) {
      allErrors.push(error instanceof Error ? error : new Error(String(error)));

      return {
        success: false,
        results: allResults,
        errors: allErrors,
        progress: { ...this.progress },
        metrics: { ...this.metrics },
      };
    }
  }

  /**
   * Split items into optimized batches
   */
  private splitIntoBatches(items: T[]): T[][] {
    const batches: T[][] = [];
    const batchSize = this.options.batchSize;

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Process a single batch with memory monitoring
   */
  private async processBatch(
    batch: T[],
    batchIndex: number,
    processor: BatchProcessor<T, R>,
    signal?: AbortSignal,
  ): Promise<{ results: R[]; errors: Error[] }> {
    const batchStartTime = performance.now();
    this.progress.currentBatch = batchIndex + 1;

    try {
      // Check memory pressure before processing
      await this.checkMemoryPressure();

      // Update progress
      this.emitProgress();

      // Process the batch
      const results = await processor(batch, batchIndex, signal);

      // Record batch completion time
      const batchTime = performance.now() - batchStartTime;
      this.batchTimes.push(batchTime);
      this.progress.averageBatchTime =
        this.batchTimes.reduce((a, b) => a + b, 0) / this.batchTimes.length;

      // Update progress
      this.progress.completedBatches++;
      this.progress.processedItems += batch.length;

      // Estimate completion time
      const remainingBatches = this.progress.totalBatches - this.progress.completedBatches;
      const estimatedRemainingTime = remainingBatches * this.progress.averageBatchTime;
      this.progress.estimatedEndTime = Date.now() + estimatedRemainingTime;

      this.emitProgress();

      // Optional delay between batches
      if (this.options.batchDelay > 0 && batchIndex < this.progress.totalBatches - 1) {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), this.options.batchDelay);
        });
      }

      return { results, errors: [] };
    } catch (error) {
      return {
        results: [],
        errors: [error instanceof Error ? error : new Error(String(error))],
      };
    }
  }

  /**
   * Check memory pressure and take action if needed
   */
  private async checkMemoryPressure(): Promise<void> {
    const memoryUsage = this.getMemoryUsage();
    this.progress.memoryUsage = memoryUsage;

    // Track memory peak
    if (memoryUsage.heapUsed > this.metrics.memoryPeak) {
      this.metrics.memoryPeak = memoryUsage.heapUsed;
    }

    // If memory usage is high, try to free memory
    if (memoryUsage.percentage > this.options.memoryThreshold) {
      const pauseStart = performance.now();

      // Trigger garbage collection if available and enabled
      if (this.options.enableGC && global.gc) {
        global.gc();
        this.metrics.gcTriggerCount++;
      }

      // Wait a bit for GC to complete
      await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 500);
      });

      // Check memory again
      const newMemoryUsage = this.getMemoryUsage();

      // If still high, pause longer
      if (newMemoryUsage.percentage > this.options.memoryThreshold) {
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 2000);
        });
        this.metrics.pauseCount++;
      }

      const pauseTime = performance.now() - pauseStart;
      this.metrics.totalPauseTime += pauseTime;
    }
  }

  /**
   * Get current memory usage statistics
   */
  private getMemoryUsage(): MemoryUsage {
    const nodeMemory = process.memoryUsage();
    const systemTotal = totalmem();
    const systemFree = freemem();
    const systemUsed = systemTotal - systemFree;

    return {
      used: Math.round(systemUsed / 1024 / 1024), // MB
      total: Math.round(systemTotal / 1024 / 1024), // MB
      percentage: Math.round((systemUsed / systemTotal) * 100),
      free: Math.round(systemFree / 1024 / 1024), // MB
      heapUsed: Math.round(nodeMemory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(nodeMemory.heapTotal / 1024 / 1024), // MB
    };
  }

  /**
   * Emit progress to all registered callbacks
   */
  private emitProgress(): void {
    if (!this.options.enableProgress) return;

    this.progressCallbacks.forEach(callback => {
      try {
        callback({ ...this.progress });
      } catch (error) {
        // Ignore callback errors to prevent disrupting processing
        console.warn('Progress callback error:', error);
      }
    });
  }

  /**
   * Get current progress
   */
  public getProgress(): BatchProgress {
    return { ...this.progress };
  }

  /**
   * Get current metrics
   */
  public getMetrics(): ProcessingMetrics {
    return { ...this.metrics };
  }
}

/**
 * Simple semaphore for controlling concurrency
 */
class Semaphore {
  private permits: number;
  private waitQueue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<() => void> {
    return new Promise(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve(() => this.release());
      } else {
        this.waitQueue.push(() => {
          this.permits--;
          resolve(() => this.release());
        });
      }
    });
  }

  private release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const next = this.waitQueue.shift();
      if (next) next();
    }
  }
}

/**
 * Convenience function to create and run batch processor
 */
export async function processBatches<T, R>(
  items: T[],
  processor: BatchProcessor<T, R>,
  options: BatchProcessorOptions = {},
  signal?: AbortSignal,
): Promise<BatchResult<R>> {
  const engine = new BatchProcessorEngine<T, R>(options);
  return engine.process(items, processor, signal);
}

/**
 * Estimate optimal batch size based on available memory and item complexity
 */
export function estimateOptimalBatchSize(
  itemSizeEstimate: number = 1024, // bytes
  maxMemoryUsageMB: number = 1024,
): number {
  const availableMemoryBytes = maxMemoryUsageMB * 1024 * 1024;
  const estimatedBatchSize = Math.floor(availableMemoryBytes / (itemSizeEstimate * 10)); // 10x safety factor

  // Clamp between reasonable bounds
  return Math.min(Math.max(estimatedBatchSize, 10), 500);
}

/**
 * Get system memory recommendations
 */
export function getMemoryRecommendations(): {
  totalMemoryMB: number;
  recommendedBatchSize: number;
  recommendedMemoryLimit: number;
  recommendedConcurrency: number;
} {
  const totalMemoryMB = Math.round(totalmem() / 1024 / 1024);
  const cpuCount = cpus().length;

  return {
    totalMemoryMB,
    recommendedBatchSize: Math.min(200, Math.max(50, Math.floor(totalMemoryMB / 100))),
    recommendedMemoryLimit: Math.floor(totalMemoryMB * 0.75),
    recommendedConcurrency: Math.min(cpuCount, Math.floor(totalMemoryMB / 2048)),
  };
}
