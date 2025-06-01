/**
 * Centralized parallel processing utilities
 * Single source of truth for all parallel execution patterns
 */

import { chunkArray, sleep } from './helpers';
import { devLog } from './observability';

/**
 * Configuration for parallel processing
 */
export interface ParallelConfig<T> {
  /** Maximum items to process in a single batch */
  batchSize?: number;
  /** Maximum concurrent operations */
  concurrency?: number;
  /** Continue processing if an item fails */
  continueOnError?: boolean;
  /** Delay between batches in milliseconds */
  delayBetweenBatches?: number;
  /** Items to process */
  items: T[];
  /** Callback when a batch completes */
  onBatchComplete?: (batchIndex: number, results: any[]) => void | Promise<void>;
  /** Callback when an item fails */
  onItemError?: (error: unknown, item: T, index: number) => void;
  /** Timeout for each operation in milliseconds */
  timeout?: number;
}

/**
 * Result of a parallel operation
 */
export interface ParallelResult<T, R> {
  /** Processing duration in milliseconds */
  duration: number;
  /** Errors that occurred during processing */
  errors: {
    index: number;
    item: T;
    error: unknown;
  }[];
  /** Number of failed operations */
  failed: number;
  /** Successfully processed results */
  results: R[];
  /** Number of successful operations */
  successful: number;
  /** Total number of items processed */
  total: number;
}

/**
 * Core parallel processing function
 *
 * @example
 * ```typescript
 * // Process items in batches
 * const result = await processParallel(
 *   { items: urls, batchSize: 10, concurrency: 3 },
 *   async (url) => fetch(url)
 * );
 *
 * // With error handling
 * const result = await processParallel(
 *   {
 *     items: tasks,
 *     continueOnError: true,
 *     onItemError: (error, task, index) => {
 *       console.error(`Task ${index} failed:`, error);
 *     }
 *   },
 *   async (task) => processTask(task)
 * );
 *
 * // With batch callbacks
 * const result = await processParallel(
 *   {
 *     items: records,
 *     batchSize: 100,
 *     delayBetweenBatches: 1000,
 *     onBatchComplete: async (batchIndex, results) => {
 *       await saveBatchResults(batchIndex, results);
 *     }
 *   },
 *   async (record) => transformRecord(record)
 * );
 * ```
 */
export async function processParallel<T, R>(
  config: ParallelConfig<T>,
  processor: (item: T, index: number) => Promise<R>,
): Promise<ParallelResult<T, R>> {
  const startTime = Date.now();
  const {
    items,
    batchSize = items.length, // Default to processing all at once
    concurrency = batchSize, // Default to batch size
    continueOnError = false,
    delayBetweenBatches = 0,
    onBatchComplete,
    onItemError,
    timeout,
  } = config;

  const results: R[] = [];
  const errors: { index: number; item: T; error: unknown }[] = [];

  // Split items into batches
  const batches = batchSize < items.length ? chunkArray(items, batchSize) : [items];

  devLog.info(`Processing ${items.length} items in ${batches.length} batches`);

  // Process each batch
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchStartIndex = batchIndex * batchSize;

    // Add delay between batches (except for the first batch)
    if (batchIndex > 0 && delayBetweenBatches > 0) {
      await sleep(delayBetweenBatches);
    }

    // Process items within the batch with concurrency control
    const batchResults: R[] = [];
    const batchErrors: typeof errors = [];

    // Split batch into concurrent chunks
    const concurrentChunks = concurrency < batch.length ? chunkArray(batch, concurrency) : [batch];

    for (const chunk of concurrentChunks) {
      const chunkPromises = chunk.map(async (item, chunkIndex) => {
        const itemIndex =
          batchStartIndex + concurrentChunks.indexOf(chunk) * concurrency + chunkIndex;

        try {
          // Create operation with optional timeout
          let operation = processor(item, itemIndex);

          if (timeout) {
            operation = Promise.race([
              operation,
              new Promise<never>((_resolve, reject) =>
                setTimeout(() => reject(new Error('Operation timeout')), timeout),
              ),
            ]);
          }

          const result = await operation;
          return { index: itemIndex, item, result, success: true } as const;
        } catch (error) {
          if (onItemError) {
            onItemError(error, item, itemIndex);
          }
          return { error, index: itemIndex, item, success: false } as const;
        }
      });

      // Wait for chunk to complete
      const chunkResults = await Promise.all(chunkPromises);

      // Collect results and errors
      for (const result of chunkResults) {
        if (result.success) {
          batchResults.push(result.result);
        } else {
          batchErrors.push({
            error: result.error,
            index: result.index,
            item: result.item,
          });

          if (!continueOnError) {
            // Stop processing on first error
            errors.push(...batchErrors);
            throw result.error;
          }
        }
      }
    }

    // Add batch results to overall results
    results.push(...batchResults);
    errors.push(...batchErrors);

    // Call batch complete callback
    if (onBatchComplete) {
      await onBatchComplete(batchIndex, batchResults);
    }
  }

  const duration = Date.now() - startTime;

  return {
    duration,
    errors,
    failed: errors.length,
    results,
    successful: results.length,
    total: items.length,
  };
}

/**
 * Process items in batches (backward compatible)
 * @deprecated Use processParallel() instead
 */
export async function processBatch<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T, index: number) => Promise<R>,
  options?: {
    delayBetweenBatches?: number;
    onBatchComplete?: (batchIndex: number, results: R[]) => Promise<void>;
  },
): Promise<R[]> {
  const result = await processParallel(
    {
      batchSize,
      delayBetweenBatches: options?.delayBetweenBatches,
      items,
      onBatchComplete: options?.onBatchComplete,
    },
    processor,
  );

  return result.results;
}

/**
 * Fan-out pattern - process items in parallel and collect results
 * @deprecated Use processParallel() instead
 */
export async function fanOut<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options?: {
    concurrency?: number;
    continueOnError?: boolean;
  },
): Promise<ParallelResult<T, R>> {
  return processParallel(
    {
      concurrency: options?.concurrency,
      continueOnError: options?.continueOnError,
      items,
    },
    processor,
  );
}

/**
 * Execute multiple operations in parallel
 *
 * @example
 * ```typescript
 * const results = await executeParallel({
 *   fetchUser: () => api.getUser(id),
 *   fetchPosts: () => api.getPosts(id),
 *   fetchComments: () => api.getComments(id),
 * });
 *
 * console.log(results.fetchUser); // User data
 * console.log(results.fetchPosts); // Posts array
 * ```
 */
export async function executeParallel<T extends Record<string, () => Promise<any>>>(
  operations: T,
  options?: {
    continueOnError?: boolean;
    timeout?: number;
  },
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> | Error }> {
  const { continueOnError = false, timeout } = options || {};

  const entries = Object.entries(operations) as [keyof T, T[keyof T]][];

  const results = await Promise.all(
    entries.map(async ([name, operation]) => {
      try {
        let op = operation();

        if (timeout) {
          op = Promise.race([
            op,
            new Promise<never>((_resolve, reject) =>
              setTimeout(() => reject(new Error(`Operation ${String(name)} timed out`)), timeout),
            ),
          ]);
        }

        const result = await op;
        return [name, result] as const;
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        return [name, error] as const;
      }
    }),
  );

  return Object.fromEntries(results) as any;
}

/**
 * Create a parallel processor with default configuration
 */
export function createParallelProcessor<T, R>(defaultConfig: Partial<ParallelConfig<T>>) {
  return (
    items: T[],
    processor: (item: T, index: number) => Promise<R>,
    overrides?: Partial<ParallelConfig<T>>,
  ): Promise<ParallelResult<T, R>> => {
    return processParallel(
      {
        ...defaultConfig,
        ...overrides,
        items,
      },
      processor,
    );
  };
}

/**
 * Process items with rate limiting
 */
export async function processWithRateLimit<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: {
    rateLimit: number; // items per second
    continueOnError?: boolean;
  },
): Promise<ParallelResult<T, R>> {
  const delayMs = 1000 / options.rateLimit;

  return processParallel(
    {
      batchSize: 1,
      continueOnError: options.continueOnError,
      delayBetweenBatches: delayMs,
      items,
    },
    processor,
  );
}
