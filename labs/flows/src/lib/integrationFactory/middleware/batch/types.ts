// middleware/batch/types.ts
import type { MiddlewareOptions } from '../base';

export interface BatchOptions extends MiddlewareOptions {
  maxBatchSize?: number; // Maximum items per batch
  maxBatchBytes?: number; // Maximum batch size in bytes
  flushInterval?: number; // Force flush after interval (ms)
  concurrency?: number; // Max concurrent batch processing
  retryFailedItems?: boolean; // Retry failed items individually
  estimateSizeFn?: (item: unknown) => number; // Custom size estimation
}

export interface BatchContext {
  batchId: string;
  itemCount: number;
  byteSize: number;
  startTime: number;
}

export interface BatchMetrics {
  totalProcessingTime: number;
  totalBatches: number;
  totalItems: number;
  averageBatchSize: number;
  averageProcessingTime: number;
  failedItems: number;
  retries: number;
}

export interface BatchResult<T = unknown> {
  successful: T[];
  failed: Array<{ item: T; error: Error }>;
  metrics: BatchMetrics;
}
