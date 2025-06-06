/**
 * Batch processing pattern implementation using p-queue
 */

import PQueue from 'p-queue';

import type { BatchPattern, PatternContext } from '../types/patterns';

export interface BatchOptions extends Partial<BatchPattern> {
  /** Context for the operation */
  context?: Partial<PatternContext>;
}

export interface BatchItem<T = any> {
  /** When the item was added to the batch */
  addedAt: Date;
  /** The data to process */
  data: T;
  /** Unique identifier for the item */
  id: string;
  /** Priority (higher numbers = higher priority) */
  priority?: number;
  /** Promise reject function */
  reject?: (reason: any) => void;
  /** Promise resolve function */
  resolve?: (value: any) => void;
}

export interface BatchProcessor<T, R> {
  /** Process a batch of items */
  processBatch(items: T[]): Promise<R[]>;
  /** Optional: Process a single item (fallback) */
  processItem?(item: T): Promise<R>;
}

/**
 * Batch processor class that accumulates items and processes them in batches
 */
export class BatchManager<T = any, R = any> {
  private pattern: Required<BatchPattern>;
  private processor: BatchProcessor<T, R>;
  private queue: PQueue;
  private batch: BatchItem<T>[] = [];
  private batchTimer?: NodeJS.Timeout;
  private processing = false;
  private results = new Map<string, Promise<R>>();

  constructor(processor: BatchProcessor<T, R>, options: BatchOptions = {}) {
    this.pattern = {
      concurrency: 1,
      errorHandling: 'fail-fast',
      maxBatchSize: 10,
      maxWaitTime: 1000,
      minBatchSize: 1,
      preserveOrder: true,
      processor: processor.processBatch.bind(processor),
      ...options,
    };

    this.processor = processor;
    this.queue = new PQueue({
      autoStart: true,
      concurrency: this.pattern.concurrency,
    });
  }

  /**
   * Add an item to the batch for processing
   */
  async add(data: T, id = `batch_${Date.now()}_${Math.random()}`): Promise<R> {
    const item: BatchItem<T> = {
      id,
      addedAt: new Date(),
      data,
    };

    // Create a promise for this item's result
    const resultPromise = new Promise<R>((resolve, reject) => {
      item.resolve = resolve;
      item.reject = reject;
    });

    this.results.set(id, resultPromise);
    this.batch.push(item as any);

    // Trigger processing if batch is full
    if (this.batch.length >= this.pattern.maxBatchSize) {
      this.triggerBatchProcessing();
    } else if (this.batch.length === 1) {
      // Start timer for first item in batch
      this.startBatchTimer();
    }

    return resultPromise;
  }

  /**
   * Add multiple items to the batch
   */
  async addMany(items: T[], idPrefix = 'batch'): Promise<R[]> {
    const promises = items.map((item, index) =>
      this.add(item, `${idPrefix}_${Date.now()}_${index}`),
    );

    return Promise.all(promises);
  }

  /**
   * Process the current batch immediately
   */
  async flush(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    this.triggerBatchProcessing();
    await this.queue.onIdle();
  }

  /**
   * Get the current batch size
   */
  getBatchSize(): number {
    return this.batch.length;
  }

  /**
   * Check if batch processing is currently active
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Wait for all pending operations to complete
   */
  async waitForIdle(): Promise<void> {
    await this.queue.onIdle();
  }

  /**
   * Clear the current batch (items will be rejected)
   */
  clear(): void {
    for (const item of this.batch) {
      if (item.reject) {
        item.reject(new Error('Batch was cleared'));
      }
    }

    this.batch = [];
    this.clearBatchTimer();
  }

  /**
   * Shutdown the batch manager
   */
  async shutdown(): Promise<void> {
    this.clearBatchTimer();
    this.queue.pause();
    this.clear();
    await this.queue.onIdle();
  }

  /**
   * Start the batch timer
   */
  private startBatchTimer(): void {
    if (this.batchTimer) {
      return;
    }

    this.batchTimer = setTimeout(() => {
      this.triggerBatchProcessing();
    }, this.pattern.maxWaitTime);
  }

  /**
   * Clear the batch timer
   */
  private clearBatchTimer(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
  }

  /**
   * Trigger batch processing
   */
  private triggerBatchProcessing(): void {
    if (this.batch.length === 0 || this.processing) {
      return;
    }

    this.clearBatchTimer();

    // Add batch processing to queue
    this.queue.add(() => this.processBatch());
  }

  /**
   * Process the current batch
   */
  private async processBatch(): Promise<void> {
    if (this.batch.length === 0) {
      return;
    }

    // Check minimum batch size
    if (this.batch.length < this.pattern.minBatchSize) {
      this.startBatchTimer();
      return;
    }

    this.processing = true;
    const currentBatch = this.batch.splice(0, this.pattern.maxBatchSize);

    try {
      const items = currentBatch.map((item) => item.data);
      let results: R[];

      try {
        results = await this.pattern.processor(items);
      } catch (error) {
        // Handle batch processing error
        await this.handleBatchError(currentBatch, error as Error);
        return;
      }

      // Distribute results back to items
      if (this.pattern.preserveOrder && results.length === currentBatch.length) {
        // Results match items order
        for (let i = 0; i < currentBatch.length; i++) {
          const item = currentBatch[i];
          if (item.resolve) {
            item.resolve(results[i]);
          }
        }
      } else {
        // Results don't match - this shouldn't happen with proper implementation
        throw new Error('Batch processing returned incorrect number of results');
      }
    } catch (error) {
      // Handle unexpected errors
      for (const item of currentBatch) {
        if (item.reject) {
          item.reject(error);
        }
      }
    } finally {
      this.processing = false;

      // Process remaining items if any
      if (this.batch.length > 0) {
        this.triggerBatchProcessing();
      }
    }
  }

  /**
   * Handle batch processing errors
   */
  private async handleBatchError(batch: BatchItem<T>[], error: Error): Promise<void> {
    switch (this.pattern.errorHandling) {
      case 'fail-fast':
        // Reject all items with the same error
        for (const item of batch) {
          if (item.reject) {
            item.reject(error);
          }
        }
        break;

      case 'continue':
        // Try to process items individually if processor supports it
        if (this.processor.processItem) {
          for (const item of batch) {
            try {
              const result = await this.processor.processItem(item.data);
              if (item.resolve) {
                item.resolve(result);
              }
            } catch (itemError) {
              if (item.reject) {
                item.reject(itemError);
              }
            }
          }
        } else {
          // No individual processor, reject all
          for (const item of batch) {
            if (item.reject) {
              item.reject(error);
            }
          }
        }
        break;

      case 'collect-errors':
        // Try individual processing and collect errors
        const errors: Error[] = [];

        if (this.processor.processItem) {
          for (const item of batch) {
            try {
              const result = await this.processor.processItem(item.data);
              if (item.resolve) {
                item.resolve(result);
              }
            } catch (itemError) {
              errors.push(itemError as Error);
              if (item.reject) {
                item.reject(itemError);
              }
            }
          }
        } else {
          // No individual processor, collect the batch error
          errors.push(error);
          for (const item of batch) {
            if (item.reject) {
              item.reject(error);
            }
          }
        }
        break;
    }
  }
}

/**
 * Create a batch processing function
 */
export function withBatch<T, R>(
  processor: BatchProcessor<T, R>,
  options: BatchOptions = {},
): (item: T, id?: string) => Promise<R> {
  const manager = new BatchManager(processor, options);

  return (item: T, id?: string) => manager.add(item, id);
}

/**
 * Create a batch processing decorator
 */
export function Batch<T, R>(options: BatchOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    let manager: BatchManager<T, R>;

    descriptor.value = function (this: any, item: T, id?: string) {
      if (!manager) {
        const processor: BatchProcessor<T, R> = {
          processBatch: (items: T[]) => originalMethod.call(this, items),
        };
        manager = new BatchManager(processor, options);
      }

      return manager.add(item, id);
    };

    return descriptor;
  };
}

// Types for test compatibility
export interface BatchItem<T = any> {
  data: T;
  id: string;
}

export interface BatchResult<T = any> {
  error?: string;
  id: string;
  result?: T;
  success: boolean;
}

export interface BatchContext {
  batchId: string;
  events: {
    emit: (event: string, data: any) => Promise<void> | void;
  };
  processedCount: number;
  totalCount: number;
  updateProgress: (progress: {
    processed: number;
    total: number;
    percentage: number;
    batchId: string;
  }) => Promise<void> | void;
  workflowId: string;
}

export interface BatchProcessorDefinition<T, R> {
  name: string;
  onComplete?: (summary: any, context: BatchContext) => Promise<void> | void;
  onProgress?: (progress: any, context: BatchContext) => Promise<void> | void;
  processBatch: (items: BatchItem<T>[], context: BatchContext) => Promise<BatchResult<R>[]>;
}

/**
 * Create a batch processor with the expected interface for tests
 */
export function createBatchProcessor<T, R>(config: {
  name: string;
  processBatch: (items: BatchItem<T>[], context?: BatchContext) => Promise<BatchResult<R>[]>;
  onProgress?: (progress: any, context: BatchContext) => Promise<void> | void;
  onComplete?: (summary: any, context: BatchContext) => Promise<void> | void;
}): BatchProcessorDefinition<T, R> {
  return {
    name: config.name,
    onComplete: config.onComplete,
    onProgress: config.onProgress,
    processBatch: config.processBatch,
  };
}

/**
 * Legacy utility function to create a simple batch processor
 */
export function createSimpleBatchProcessor<T, R>(
  batchFn: (items: T[]) => Promise<R[]>,
  itemFn?: (item: T) => Promise<R>,
): BatchProcessor<T, R> {
  return {
    processBatch: batchFn,
    processItem: itemFn,
  };
}
