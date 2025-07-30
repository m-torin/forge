// middleware/batch/middleware.ts
import { randomUUID } from 'crypto';
import { createMiddleware, type Middleware } from '../base';
import type {
  BatchOptions,
  BatchContext,
  BatchResult,
  BatchMetrics,
} from './types';

const DEFAULT_OPTIONS: Required<BatchOptions> = {
  enabled: true,
  order: 0,
  maxBatchSize: 100,
  maxBatchBytes: 5 * 1024 * 1024, // 5MB
  flushInterval: 1000, // 1 second
  concurrency: 3,
  retryFailedItems: true,
  estimateSizeFn: (item: unknown) => JSON.stringify(item).length,
};

export const createBatchMiddleware = (
  options: BatchOptions = {},
): Middleware => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let _batch: unknown[] = [];
  let _currentBatchSize = 0;
  let _flushTimer: NodeJS.Timeout | undefined;

  const metrics: BatchMetrics = {
    totalBatches: 0,
    totalItems: 0,
    totalProcessingTime: 0,
    failedItems: 0,
    retries: 0,
    averageBatchSize: 0,
    averageProcessingTime: 0,
  };

  // Fix type error by explicitly typing the reduce accumulator
  const estimateBatchSize = (items: unknown[]): number =>
    items.reduce(
      (total: number, item: unknown) => total + opts.estimateSizeFn(item),
      0,
    );

  const getMetrics = (): BatchMetrics => ({
    ...metrics,
    averageBatchSize: metrics.totalItems / Math.max(metrics.totalBatches, 1),
    averageProcessingTime:
      metrics.totalProcessingTime / Math.max(metrics.totalBatches, 1),
  });

  const createBatches = (items: unknown[]): unknown[][] => {
    const batches: unknown[][] = [];
    let currentBatch: unknown[] = [];
    let currentBatchBytes = 0;

    for (const item of items) {
      const itemSize = opts.estimateSizeFn(item);

      if (
        currentBatch.length >= opts.maxBatchSize ||
        currentBatchBytes + itemSize > opts.maxBatchBytes
      ) {
        batches.push(currentBatch);
        currentBatch = [];
        currentBatchBytes = 0;
      }

      currentBatch.push(item);
      currentBatchBytes += itemSize;
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  };

  const processBatch = async (
    batch: unknown[],
    next: () => Promise<any>,
  ): Promise<BatchResult> => {
    const startTime = Date.now();

    try {
      await next();
      metrics.totalBatches++;
      metrics.totalItems += batch.length;
      metrics.totalProcessingTime += Date.now() - startTime;

      return {
        successful: batch,
        failed: [],
        metrics: getMetrics(),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        successful: [],
        failed: batch.map((item) => ({ item, error: err })),
        metrics: getMetrics(),
      };
    }
  };

  const retryFailedItems = async (
    items: unknown[],
    next: () => Promise<any>,
  ): Promise<BatchResult> => {
    const results: BatchResult = {
      successful: [],
      failed: [],
      metrics: getMetrics(),
    };

    for (const item of items) {
      try {
        await next();
        results.successful.push(item);
        metrics.retries++;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        results.failed.push({ item, error: err });
        metrics.failedItems++;
      }
    }

    return results;
  };

  const processBatches = async (
    items: unknown[],
    next: () => Promise<any>,
  ): Promise<BatchResult> => {
    const batches = createBatches(items);
    const results: BatchResult = {
      successful: [],
      failed: [],
      metrics: getMetrics(),
    };

    for (let i = 0; i < batches.length; i += opts.concurrency) {
      const batchGroup = batches.slice(i, i + opts.concurrency);
      const batchResults = await Promise.all(
        batchGroup.map((batch) => processBatch(batch, next)),
      );

      batchResults.forEach((result) => {
        results.successful.push(...result.successful);
        results.failed.push(...result.failed);
      });
    }

    if (opts.retryFailedItems && results.failed.length > 0) {
      const retriedItems = await retryFailedItems(
        results.failed.map((f) => f.item),
        next,
      );

      results.successful.push(...retriedItems.successful);
      results.failed = retriedItems.failed;
    }

    return results;
  };

  return createMiddleware(async (context, next) => {
    const items = context.metadata.items;
    if (!Array.isArray(items)) return next();

    const batchContext: BatchContext = {
      batchId: randomUUID(),
      itemCount: items.length,
      byteSize: estimateBatchSize(items),
      startTime: Date.now(),
    };

    try {
      const results = await processBatches(items, next);

      return {
        data: results,
        metadata: {
          batch: {
            id: batchContext.batchId,
            metrics: getMetrics(),
          },
        },
        duration: Date.now() - batchContext.startTime,
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }, options);
};
