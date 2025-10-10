/**
 * Event batching utilities for 3rd party analytics integrations
 */

import type { BatchItem, BatchingConfig, QueueMetrics } from '../types';

export class EventBatcher {
  private queue: BatchItem[] = [];
  private metrics: QueueMetrics = {
    queueSize: 0,
    processedCount: 0,
    errorCount: 0,
    lastFlushTime: new Date(),
  };
  private flushTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  constructor(
    private config: BatchingConfig,
    private processor: (batch: BatchItem[]) => Promise<boolean>,
  ) {
    if (config.enabled) {
      this.startFlushTimer();
    }
  }

  add(item: BatchItem): boolean {
    if (this.isDestroyed) {
      return false;
    }

    if (this.queue.length >= this.config.maxQueueSize) {
      // Queue is full, drop oldest items or reject
      this.queue.shift();
      this.metrics.errorCount++;
    }

    this.queue.push(item);
    this.metrics.queueSize = this.queue.length;

    // Flush immediately if batch size reached
    if (this.config.enabled && this.queue.length >= this.config.batchSize) {
      this.flush();
    }

    return true;
  }

  async flush(): Promise<boolean> {
    if (this.queue.length === 0 || this.isDestroyed) {
      return true;
    }

    const batch = this.queue.splice(0, this.config.batchSize);
    this.metrics.queueSize = this.queue.length;

    try {
      const success = await this.processor(batch);

      if (success) {
        this.metrics.processedCount += batch.length;
        this.metrics.lastFlushTime = new Date();
        return true;
      } else {
        // Re-queue failed items with retry count
        const retriedItems = batch.map(item => ({
          ...item,
          retryCount: (item.retryCount || 0) + 1,
        }));

        // Only re-queue if retry count is reasonable
        const itemsToRetry = retriedItems.filter(item => (item.retryCount || 0) < 3);
        this.queue.unshift(...itemsToRetry);
        this.metrics.queueSize = this.queue.length;
        this.metrics.errorCount += batch.length - itemsToRetry.length;

        return false;
      }
    } catch (error) {
      this.metrics.errorCount += batch.length;
      return false;
    }
  }

  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue.length = 0;
    this.metrics.queueSize = 0;
  }

  destroy(): void {
    this.isDestroyed = true;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Final flush
    if (this.queue.length > 0) {
      this.flush().catch(() => {
        // Ignore errors during cleanup
      });
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush().catch(() => {
          // Ignore timer-based flush errors
        });
      }
    }, this.config.flushInterval);
  }
}

export function createBatcher(
  config: BatchingConfig,
  processor: (batch: BatchItem[]) => Promise<boolean>,
): EventBatcher {
  return new EventBatcher(config, processor);
}

export function createTrackBatch(
  events: Array<{ name: string; properties?: Record<string, any>; userId?: string }>,
): BatchItem[] {
  return events.map(event => ({
    type: 'track' as const,
    payload: event,
    timestamp: new Date(),
  }));
}

export function createIdentifyBatch(
  identifies: Array<{ userId: string; traits?: Record<string, any> }>,
): BatchItem[] {
  return identifies.map(identify => ({
    type: 'identify' as const,
    payload: identify,
    timestamp: new Date(),
  }));
}

export function createPageBatch(
  pages: Array<{ name?: string; properties?: Record<string, any> }>,
): BatchItem[] {
  return pages.map(page => ({
    type: 'page' as const,
    payload: page,
    timestamp: new Date(),
  }));
}

export class BatchProcessor {
  private batchers = new Map<string, EventBatcher>();

  createBatcher(
    key: string,
    config: BatchingConfig,
    processor: (batch: BatchItem[]) => Promise<boolean>,
  ): EventBatcher {
    if (this.batchers.has(key)) {
      this.batchers.get(key)!.destroy();
    }

    const batcher = new EventBatcher(config, processor);
    this.batchers.set(key, batcher);
    return batcher;
  }

  getBatcher(key: string): EventBatcher | undefined {
    return this.batchers.get(key);
  }

  async flushAll(): Promise<boolean> {
    const results = await Promise.allSettled(
      Array.from(this.batchers.values()).map(batcher => batcher.flush()),
    );

    return results.every(result => result.status === 'fulfilled' && result.value === true);
  }

  getMetrics(): Record<string, QueueMetrics> {
    const metrics: Record<string, QueueMetrics> = {};

    for (const [key, batcher] of this.batchers) {
      metrics[key] = batcher.getMetrics();
    }

    return metrics;
  }

  destroy(): void {
    for (const batcher of this.batchers.values()) {
      batcher.destroy();
    }
    this.batchers.clear();
  }
}

export const globalBatchProcessor = new BatchProcessor();
