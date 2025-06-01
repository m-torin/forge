/**
 * Unified batch processing module
 * Single source of truth for all batch operations
 */

import { chunkArray } from './helpers';
import { devLog } from './observability';
import { sleep } from './time';

import type { BaseOperationResult } from './results';

/**
 * Configuration for batch processing
 */
export interface BatchConfig {
  /** Size of each batch */
  batchSize: number;
  /** Timeout for each batch in milliseconds */
  batchTimeout?: number;
  /** Maximum concurrent operations within a batch */
  concurrency?: number;
  /** Whether to continue processing if an item fails */
  continueOnError?: boolean;
  /** Delay between batches in milliseconds */
  delayBetweenBatches?: number;
  /** Timeout for each item in milliseconds */
  itemTimeout?: number;
  /** Maximum concurrent batches */
  maxConcurrentBatches?: number;
}

/**
 * Result for a single batch
 */
export interface BatchResult<T> extends BaseOperationResult {
  batchIndex: number;
  batchSize: number;
  errors: {
    index: number;
    error: string;
  }[];
  failed: number;
  items: number;
  results: T[];
  successful: number;
}

/**
 * Overall batch processing result
 */
export interface BatchProcessingResult<T> extends BaseOperationResult {
  batches: BatchResult<T>[];
  failedBatches: number;
  processedBatches: number;
  successfulBatches: number;
  successRate: number;
  totalBatches: number;
  totalFailed: number;
  totalItems: number;
  totalSuccessful: number;
}

/**
 * Callbacks for batch processing events
 */
export interface BatchCallbacks<T, R> {
  /** Called when a batch completes */
  onBatchComplete?: (batchIndex: number, results: R[], errors: any[]) => void | Promise<void>;
  /** Called when a batch starts processing */
  onBatchStart?: (batchIndex: number, items: T[]) => void | Promise<void>;
  /** Called when an item fails */
  onItemError?: (error: unknown, item: T, index: number) => void | Promise<void>;
  /** Called for progress updates */
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Unified batch processor class
 */
export class BatchProcessor {
  /**
   * Process items in batches with full control
   */
  static async process<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    config: BatchConfig,
    callbacks?: BatchCallbacks<T, R>,
  ): Promise<BatchProcessingResult<R>> {
    const startTime = Date.now();

    // Provide default config if null/undefined
    const safeConfig = config || {
      batchSize: 10,
      batchTimeout: 30000,
      continueOnError: true,
      delayBetweenBatches: 0,
      maxConcurrentBatches: 1,
    };

    const {
      batchSize,
      batchTimeout,
      concurrency = batchSize,
      continueOnError = true,
      delayBetweenBatches = 0,
      itemTimeout,
      maxConcurrentBatches = 1,
    } = safeConfig;

    if (items.length === 0) {
      return {
        batches: [],
        duration: 0,
        failedBatches: 0,
        processedBatches: 0,
        success: true,
        successfulBatches: 0,
        successRate: 100,
        totalBatches: 0,
        totalFailed: 0,
        totalItems: 0,
        totalSuccessful: 0,
      };
    }

    // Split items into batches
    const batches = chunkArray(items, batchSize);
    const batchResults: BatchResult<R>[] = [];

    devLog.info(
      `Processing ${items.length} items in ${batches.length} batches (size: ${batchSize})`,
    );

    let totalSuccessful = 0;
    let totalFailed = 0;
    let processedBatches = 0;
    let successfulBatches = 0;
    let failedBatches = 0;

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += maxConcurrentBatches) {
      const concurrentBatches = batches.slice(i, i + maxConcurrentBatches);

      const batchPromises = concurrentBatches.map(async (batch, concurrentIndex) => {
        const batchIndex = i + concurrentIndex;
        const batchStartIndex = batchIndex * batchSize;

        try {
          // Call onBatchStart callback
          if (callbacks?.onBatchStart) {
            await callbacks.onBatchStart(batchIndex, batch);
          }

          const result = await this.processSingleBatch(
            batch,
            processor,
            batchIndex,
            batchStartIndex,
            {
              concurrency,
              continueOnError,
              itemTimeout,
              timeout: batchTimeout,
            },
            callbacks,
          );

          // Call onBatchComplete callback
          if (callbacks?.onBatchComplete) {
            await callbacks.onBatchComplete(batchIndex, result.results, result.errors);
          }

          return result;
        } catch (error) {
          if (!continueOnError) {
            throw error;
          }

          // Create a failed batch result
          return {
            batchIndex,
            batchSize: batch.length,
            duration: 0,
            errors: [
              {
                error: error instanceof Error ? error.message : String(error),
                index: 0,
              },
            ],
            failed: batch.length,
            items: batch.length,
            results: [],
            success: false,
            successful: 0,
          } as BatchResult<R>;
        }
      });

      // Wait for concurrent batches to complete
      const concurrentResults = await Promise.allSettled(batchPromises);

      for (const result of concurrentResults) {
        processedBatches++;

        if (result.status === 'fulfilled') {
          const batchResult = result.value;
          batchResults.push(batchResult);

          totalSuccessful += batchResult.successful;
          totalFailed += batchResult.failed;

          if (batchResult.success) {
            successfulBatches++;
          } else {
            failedBatches++;
          }

          // Update progress
          if (callbacks?.onProgress) {
            callbacks.onProgress(totalSuccessful + totalFailed, items.length);
          }
        } else {
          failedBatches++;
          totalFailed += concurrentBatches[0].length; // Approximate

          if (!continueOnError) {
            throw result.reason;
          }
        }
      }

      // Delay between batch groups
      if (i + maxConcurrentBatches < batches.length && delayBetweenBatches > 0) {
        await sleep(delayBetweenBatches);
      }
    }

    const duration = Date.now() - startTime;
    const successRate = items.length > 0 ? (totalSuccessful / items.length) * 100 : 100;

    return {
      batches: batchResults,
      duration,
      failedBatches,
      processedBatches,
      success: failedBatches === 0,
      successfulBatches,
      successRate: Math.round(successRate * 100) / 100,
      totalBatches: batches.length,
      totalFailed,
      totalItems: items.length,
      totalSuccessful,
    };
  }

  /**
   * Process a single batch
   */
  private static async processSingleBatch<T, R>(
    batch: T[],
    processor: (item: T, index: number) => Promise<R>,
    batchIndex: number,
    batchStartIndex: number,
    options: {
      concurrency: number;
      continueOnError: boolean;
      itemTimeout?: number;
      timeout?: number;
    },
    callbacks?: BatchCallbacks<T, R>,
  ): Promise<BatchResult<R>> {
    const startTime = Date.now();
    const { concurrency, continueOnError, itemTimeout, timeout } = options;

    const results: R[] = [];
    const errors: { index: number; error: string }[] = [];
    let successful = 0;
    let failed = 0;

    // Process with concurrency control
    const chunks = concurrency < batch.length ? chunkArray(batch, concurrency) : [batch];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (item, chunkIndex) => {
        const itemIndex = batchStartIndex + chunks.indexOf(chunk) * concurrency + chunkIndex;

        try {
          let operation = processor(item, itemIndex);

          // Apply item timeout if specified
          if (itemTimeout) {
            operation = Promise.race([
              operation,
              new Promise<never>((_resolve, reject) =>
                setTimeout(() => reject(new Error('Item timeout')), itemTimeout),
              ),
            ]);
          }

          const result = await operation;
          return { index: chunkIndex, result, success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);

          // Call onItemError callback
          if (callbacks?.onItemError) {
            await callbacks.onItemError(error, item, itemIndex);
          }

          if (!continueOnError) {
            throw error;
          }

          return { error: errorMessage, index: chunkIndex, success: false };
        }
      });

      // Apply batch timeout if specified
      let chunkResults;
      if (timeout) {
        chunkResults = await Promise.race([
          Promise.allSettled(chunkPromises),
          new Promise<never>((_resolve, reject) =>
            setTimeout(() => reject(new Error('Batch timeout')), timeout),
          ),
        ]);
      } else {
        chunkResults = await Promise.allSettled(chunkPromises);
      }

      // Process chunk results
      for (const result of chunkResults) {
        if (result.status === 'fulfilled' && result.value.success) {
          results.push(result.value.result!);
          successful++;
        } else {
          failed++;
          let errorMessage = 'Unknown error';
          let errorIndex = 0;

          if (result.status === 'rejected') {
            errorMessage = result.reason?.message || 'Unknown error';
          } else if ('error' in result.value) {
            errorMessage = result.value.error || 'Unknown error';
            errorIndex = result.value.index;
          }

          errors.push({
            error: errorMessage,
            index: chunks.indexOf(chunk) * concurrency + errorIndex,
          });
        }
      }
    }

    const duration = Date.now() - startTime;

    return {
      batchIndex,
      batchSize: batch.length,
      duration,
      errors,
      failed,
      items: batch.length,
      results,
      success: failed === 0,
      successful,
    };
  }

  /**
   * Create optimal batch configuration based on item characteristics
   */
  static createOptimalConfig(
    itemCount: number,
    estimatedProcessingTimePerItem = 1000,
    options?: {
      maxMemoryPerItem?: number;
      availableMemory?: number;
      targetBatchDuration?: number;
    },
  ): BatchConfig {
    const { availableMemory, maxMemoryPerItem, targetBatchDuration = 30000 } = options || {};

    // Calculate batch size based on processing time
    let batchSize: number;
    if (estimatedProcessingTimePerItem < 500) {
      batchSize = Math.min(50, Math.max(10, Math.floor(itemCount / 10)));
    } else if (estimatedProcessingTimePerItem < 2000) {
      batchSize = Math.min(20, Math.max(5, Math.floor(itemCount / 20)));
    } else {
      batchSize = Math.min(10, Math.max(2, Math.floor(itemCount / 30)));
    }

    // Adjust for memory constraints if provided
    if (maxMemoryPerItem && availableMemory) {
      const maxItemsInMemory = Math.floor(availableMemory / maxMemoryPerItem);
      batchSize = Math.min(batchSize, maxItemsInMemory);
    }

    // Calculate concurrency based on batch size and processing time
    const concurrency = Math.min(
      batchSize,
      Math.max(1, Math.floor(targetBatchDuration / estimatedProcessingTimePerItem)),
    );

    // Calculate max concurrent batches
    const maxConcurrentBatches = Math.min(5, Math.max(1, Math.floor(itemCount / batchSize / 5)));

    // Add delay between batches for rate limiting
    const delayBetweenBatches = estimatedProcessingTimePerItem > 3000 ? 2000 : 1000;

    return {
      batchSize,
      batchTimeout: targetBatchDuration,
      concurrency,
      continueOnError: true,
      delayBetweenBatches,
      itemTimeout: estimatedProcessingTimePerItem * 3,
      maxConcurrentBatches,
    };
  }

  /**
   * Process items with rate limiting
   */
  static async processWithRateLimit<T, R>(
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    itemsPerSecond: number,
    options?: Partial<BatchConfig>,
  ): Promise<BatchProcessingResult<R>> {
    const delayMs = Math.ceil(1000 / itemsPerSecond);

    return this.process(items, processor, {
      batchSize: 1,
      concurrency: 1,
      continueOnError: true,
      delayBetweenBatches: delayMs,
      maxConcurrentBatches: 1,
      ...options,
    });
  }
}
