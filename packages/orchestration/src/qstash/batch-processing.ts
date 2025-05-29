import type { WorkflowContext } from '@upstash/workflow';

/**
 * Batch processing configuration
 */
export interface BatchConfig {
  /** Size of each batch */
  batchSize: number;
  /** Timeout for each batch in milliseconds */
  batchTimeout?: number;
  /** Whether to continue processing if a batch fails */
  continueOnError?: boolean;
  /** Delay between batches in milliseconds */
  delayBetweenBatches?: number;
  /** Maximum concurrent batches */
  maxConcurrentBatches?: number;
}

/**
 * Batch processing result
 */
export interface BatchResult<T> {
  batchIndex: number;
  batchSize: number;
  completedAt: string;
  duration: number;
  errors: { index: number; error: string }[];
  failedItems: number;
  processedItems: number;
  results: T[];
  startedAt: string;
  successfulItems: number;
}

/**
 * Overall batch processing result
 */
export interface BatchProcessingResult<T> {
  batches: BatchResult<T>[];
  completedAt: string;
  duration: number;
  failedBatches: number;
  processedBatches: number;
  startedAt: string;
  successfulBatches: number;
  totalBatches: number;
  totalFailedItems: number;
  totalItems: number;
  totalProcessedItems: number;
  totalSuccessfulItems: number;
}

/**
 * Process items in batches with parallel execution
 */
export async function processBatches<TInput, TOutput>(
  context: WorkflowContext<any>,
  stepName: string,
  items: TInput[],
  processor: (item: TInput, index: number, batchIndex: number) => Promise<TOutput>,
  config: BatchConfig,
): Promise<BatchProcessingResult<TOutput>> {
  return context.run(stepName, async () => {
    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    const {
      batchSize,
      batchTimeout = 30000,
      continueOnError = true,
      delayBetweenBatches = 0,
      maxConcurrentBatches = 3,
    } = config;

    // Split items into batches
    const batches: TInput[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    console.log(
      `[BATCH] Processing ${items.length} items in ${batches.length} batches (size: ${batchSize})`,
    );

    const batchResults: BatchResult<TOutput>[] = [];
    let processedBatches = 0;
    let successfulBatches = 0;
    let failedBatches = 0;

    // Process batches with concurrency control
    for (let i = 0; i < batches.length; i += maxConcurrentBatches) {
      const concurrentBatches = batches.slice(i, i + maxConcurrentBatches);

      const batchPromises = concurrentBatches.map(async (batch, concurrentIndex) => {
        const batchIndex = i + concurrentIndex;
        return processSingleBatch(context, batch, processor, batchIndex, batchTimeout);
      });

      try {
        const concurrentResults = await Promise.allSettled(batchPromises);

        for (const result of concurrentResults) {
          if (result.status === 'fulfilled') {
            batchResults.push(result.value);
            successfulBatches++;
          } else {
            failedBatches++;
            if (!continueOnError) {
              throw new Error(`Batch processing failed: ${result.reason}`);
            }

            // Create a failure result
            const failedBatch: BatchResult<TOutput> = {
              batchIndex: processedBatches,
              batchSize: 0,
              completedAt: new Date().toISOString(),
              duration: 0,
              errors: [{ error: result.reason?.message || 'Unknown error', index: 0 }],
              failedItems: 0,
              processedItems: 0,
              results: [],
              startedAt: new Date().toISOString(),
              successfulItems: 0,
            };
            batchResults.push(failedBatch);
          }
          processedBatches++;
        }
      } catch (error) {
        if (!continueOnError) {
          throw error;
        }
        console.error(`[BATCH] Error processing batch group: ${error}`);
      }

      // Delay between batch groups
      if (i + maxConcurrentBatches < batches.length && delayBetweenBatches > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
      }
    }

    const completedAt = new Date().toISOString();
    const duration = Date.now() - startTime;

    // Calculate totals
    const totalProcessedItems = batchResults.reduce((sum, batch) => sum + batch.processedItems, 0);
    const totalSuccessfulItems = batchResults.reduce(
      (sum, batch) => sum + batch.successfulItems,
      0,
    );
    const totalFailedItems = batchResults.reduce((sum, batch) => sum + batch.failedItems, 0);

    const result: BatchProcessingResult<TOutput> = {
      batches: batchResults,
      completedAt,
      duration,
      failedBatches,
      processedBatches,
      startedAt,
      successfulBatches,
      totalBatches: batches.length,
      totalFailedItems,
      totalItems: items.length,
      totalProcessedItems,
      totalSuccessfulItems,
    };

    console.log(`[BATCH] Completed: ${totalSuccessfulItems}/${items.length} items successful`);
    return result;
  });
}

/**
 * Process a single batch
 */
async function processSingleBatch<TInput, TOutput>(
  context: WorkflowContext<any>,
  batch: TInput[],
  processor: (item: TInput, index: number, batchIndex: number) => Promise<TOutput>,
  batchIndex: number,
  timeout: number,
): Promise<BatchResult<TOutput>> {
  const batchStartTime = Date.now();
  const startedAt = new Date().toISOString();

  const results: TOutput[] = [];
  const errors: { index: number; error: string }[] = [];
  let successfulItems = 0;
  let failedItems = 0;

  // Process items in the batch concurrently
  const itemPromises = batch.map(async (item, itemIndex) => {
    try {
      const result = await Promise.race([
        processor(item, itemIndex, batchIndex),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Batch item timeout')), timeout),
        ),
      ]);

      results[itemIndex] = result;
      successfulItems++;
      return { index: itemIndex, result, success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ error: errorMessage, index: itemIndex });
      failedItems++;
      return { error: errorMessage, index: itemIndex, success: false };
    }
  });

  await Promise.allSettled(itemPromises);

  const completedAt = new Date().toISOString();
  const duration = Date.now() - batchStartTime;

  return {
    batchIndex,
    batchSize: batch.length,
    completedAt,
    duration,
    errors,
    failedItems,
    processedItems: batch.length,
    results: results.filter((r) => r !== undefined),
    startedAt,
    successfulItems,
  };
}

/**
 * Batch HTTP requests with QStash
 */
export async function batchHTTPRequests(
  context: WorkflowContext<any>,
  stepName: string,
  requests: {
    id: string;
    url: string;
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }[],
  config: BatchConfig,
): Promise<BatchProcessingResult<{ id: string; response?: any; error?: string }>> {
  return processBatches(
    context,
    stepName,
    requests,
    async (request) => {
      try {
        const response = await context.call(`batch-request-${request.id}`, {
          url: request.url,
          body: request.body,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers,
          },
          method: request.method || 'POST',
          retries: 2,
        });

        return {
          id: request.id,
          response: response.body,
        };
      } catch (error) {
        return {
          id: request.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    config,
  );
}

/**
 * Batch webhook notifications
 */
export async function batchWebhookNotifications(
  context: WorkflowContext<any>,
  stepName: string,
  notifications: {
    id: string;
    url: string;
    payload: any;
    headers?: Record<string, string>;
  }[],
  config: BatchConfig,
): Promise<
  BatchProcessingResult<{ id: string; success: boolean; response?: any; error?: string }>
> {
  return processBatches(
    context,
    stepName,
    notifications,
    async (notification) => {
      try {
        const response = await context.call(`batch-webhook-${notification.id}`, {
          url: notification.url,
          body: notification.payload,
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': 'batch-notification',
            ...notification.headers,
          },
          method: 'POST',
          retries: 3,
        });

        return {
          id: notification.id,
          response: response.body,
          success: true,
        };
      } catch (error) {
        return {
          id: notification.id,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
        };
      }
    },
    config,
  );
}

/**
 * Create optimal batch configuration based on data size
 */
export function createOptimalBatchConfig(
  itemCount: number,
  estimatedProcessingTimePerItem = 1000,
): BatchConfig {
  // Adjust batch size based on processing time and item count
  let batchSize;
  if (estimatedProcessingTimePerItem < 500) {
    batchSize = Math.min(20, Math.max(5, Math.floor(itemCount / 10)));
  } else if (estimatedProcessingTimePerItem < 2000) {
    batchSize = Math.min(10, Math.max(3, Math.floor(itemCount / 15)));
  } else {
    batchSize = Math.min(5, Math.max(2, Math.floor(itemCount / 20)));
  }

  const maxConcurrentBatches = Math.min(5, Math.max(2, Math.floor(itemCount / batchSize / 3)));
  const delayBetweenBatches = estimatedProcessingTimePerItem > 3000 ? 2000 : 1000;

  return {
    batchSize,
    batchTimeout: Math.max(30000, estimatedProcessingTimePerItem * batchSize * 2),
    continueOnError: true,
    delayBetweenBatches,
    maxConcurrentBatches,
  };
}

/**
 * Aggregate batch results for reporting
 */
export function aggregateBatchResults<T>(batchResult: BatchProcessingResult<T>): {
  summary: {
    successRate: string;
    averageBatchDuration: number;
    totalDuration: number;
    itemsPerSecond: number;
  };
  errorSummary: Record<string, number>;
} {
  const { batches, duration, totalItems, totalSuccessfulItems } = batchResult;
  const successRate = ((totalSuccessfulItems / totalItems) * 100).toFixed(2);
  const averageBatchDuration =
    batches.reduce((sum, batch) => sum + batch.duration, 0) / batches.length;
  const itemsPerSecond = (totalItems / duration) * 1000;

  // Group errors by type
  const errorSummary: Record<string, number> = {};
  batches.forEach((batch) => {
    batch.errors.forEach((error) => {
      errorSummary[error.error] = (errorSummary[error.error] || 0) + 1;
    });
  });

  return {
    errorSummary,
    summary: {
      averageBatchDuration: Math.round(averageBatchDuration),
      itemsPerSecond: Math.round(itemsPerSecond * 100) / 100,
      successRate: `${successRate}%`,
      totalDuration: duration,
    },
  };
}
