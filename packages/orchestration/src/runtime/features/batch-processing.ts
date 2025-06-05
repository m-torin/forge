import { type BatchConfig as BaseBatchConfig, BatchProcessor } from '../../utils/batch-processor';
import { createErrorMessage } from '../../utils/helpers';
import { formatTimestamp } from '../../utils/time';

import type { BaseOperationResult } from '../../utils/results';
import type { WorkflowContext } from '@upstash/workflow';

/**
 * Batch processing configuration (extends base config for workflow-specific features)
 */
export interface BatchConfig extends BaseBatchConfig {
  /** Workflow-specific batch timeout */
  batchTimeout?: number;
}

export interface BatchResult<T> extends BaseOperationResult {
  batchIndex: number;
  batchSize: number;
  completedAt: string;
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
export interface BatchProcessingResult<T> extends BaseOperationResult {
  batches: BatchResult<T>[];
  completedAt: string;
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
 * Delegates to the centralized BatchProcessor with workflow context
 */
export async function processBatches<TInput, TOutput>(
  context: WorkflowContext<unknown>,
  stepName: string,
  items: TInput[],
  processor: (item: TInput, index: number, batchIndex: number) => Promise<TOutput>,
  config: BatchConfig,
): Promise<BatchProcessingResult<TOutput>> {
  return context.run(stepName, async () => {
    // Adapt the processor to work with BatchProcessor (which doesn't pass batchIndex)
    const adaptedProcessor = (item: TInput, index: number) => {
      // Calculate batch index from item index
      const batchIndex = Math.floor(index / config.batchSize);
      return processor(item, index, batchIndex);
    };

    // Use centralized BatchProcessor
    const result = await BatchProcessor.process(items, adaptedProcessor, config, {
      onProgress: (processed, total) => {
        if (processed % 10 === 0 || processed === total) {
          console.log(`[${stepName}] Progress: ${processed}/${total}`);
        }
      },
    });

    // Transform the result to match the expected interface
    const transformedBatches: BatchResult<TOutput>[] = result.batches.map((batch) => ({
      batchIndex: batch.batchIndex,
      batchSize: batch.batchSize,
      completedAt: formatTimestamp(Date.now()),
      duration: batch.duration,
      errors: batch.errors,
      failedItems: batch.failed,
      processedItems: batch.items,
      results: batch.results,
      startedAt: formatTimestamp(Date.now() - (batch.duration || 0)),
      success: batch.success,
      successfulItems: batch.successful,
    }));

    return {
      batches: transformedBatches,
      completedAt: formatTimestamp(Date.now()),
      duration: result.duration,
      failedBatches: result.failedBatches,
      processedBatches: result.processedBatches,
      startedAt: formatTimestamp(Date.now() - (result.duration || 0)),
      success: result.success,
      successfulBatches: result.successfulBatches,
      totalBatches: result.totalBatches,
      totalFailedItems: result.totalFailed,
      totalItems: result.totalItems,
      totalProcessedItems: result.totalSuccessful + result.totalFailed,
      totalSuccessfulItems: result.totalSuccessful,
    };
  });
}

/**
 * Process a single batch
 */
async function _processSingleBatch<TInput, TOutput>(
  context: WorkflowContext<unknown>,
  batch: TInput[],
  processor: (item: TInput, index: number, batchIndex: number) => Promise<TOutput>,
  batchIndex: number,
  timeout: number,
): Promise<BatchResult<TOutput>> {
  const batchStartTime = Date.now();
  const startedAt = formatTimestamp(batchStartTime);

  const results: TOutput[] = [];
  const errors: { index: number; error: string }[] = [];
  let successfulItems = 0;
  let failedItems = 0;

  // Process items in the batch concurrently
  const itemPromises = batch.map(async (item, itemIndex) => {
    try {
      const result = await Promise.race([
        processor(item, itemIndex, batchIndex),
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Batch item timeout')), timeout),
        ),
      ]);

      results[itemIndex] = result;
      successfulItems++;
      return { index: itemIndex, result, success: true };
    } catch (error) {
      const errorMessage = createErrorMessage('Batch item processing failed', error);
      errors.push({ error: errorMessage, index: itemIndex });
      failedItems++;
      return { error: errorMessage, index: itemIndex, success: false };
    }
  });

  await Promise.allSettled(itemPromises);

  const completedAt = formatTimestamp(Date.now());
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
    success: failedItems === 0,
    successfulItems,
  };
}

/**
 * Batch HTTP requests with QStash
 */
export async function batchHTTPRequests<TResponse = unknown>(
  context: WorkflowContext<unknown>,
  stepName: string,
  requests: {
    id: string;
    url: string;
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }[],
  config: BatchConfig,
): Promise<BatchProcessingResult<{ id: string; response?: TResponse; error?: string }>> {
  return processBatches(
    context,
    stepName,
    requests,
    async (request) => {
      try {
        const response = await context.call('batch-http-request', {
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
          error: createErrorMessage('Batch HTTP request failed', error),
        };
      }
    },
    config,
  );
}

/**
 * Batch webhook notifications
 */
export async function batchWebhookNotifications<TResponse = unknown>(
  context: WorkflowContext<unknown>,
  stepName: string,
  notifications: {
    id: string;
    url: string;
    payload: unknown;
    headers?: Record<string, string>;
  }[],
  config: BatchConfig,
): Promise<
  BatchProcessingResult<{ id: string; success: boolean; response?: TResponse; error?: string }>
> {
  return processBatches(
    context,
    stepName,
    notifications,
    async (notification) => {
      try {
        const response = await context.call('batch-webhook-notification', {
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
          error: createErrorMessage('Batch webhook notification failed', error),
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
    batches.reduce((sum, batch) => sum + (batch.duration || 0), 0) / batches.length;
  const itemsPerSecond = duration ? (totalItems / duration) * 1000 : 0;

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
      totalDuration: duration || 0,
    },
  };
}
