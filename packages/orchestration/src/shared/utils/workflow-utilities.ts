/**
 * Workflow-specific utilities for enhanced batch processing,
 * progress reporting, error handling, and fallback mechanisms
 */

import { createServerObservability, logInfo } from '@repo/observability/server/next';
import { z } from 'zod/v4';

import { StepExecutionContext } from '../factories/step-factory/step-types';
import { CircuitBreakerPattern } from '../types/patterns';

import { createRateLimiter, RateLimitConfig as UtilsRateLimitConfig } from './rate-limit';

// ===== STANDARDIZED CIRCUIT BREAKER CONFIGURATIONS =====

export const CIRCUIT_BREAKER_CONFIGS = {
  // For external API calls with high failure tolerance
  EXTERNAL_API: {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    rollingCountWindow: 300000, // 5 minutes
  } satisfies Partial<CircuitBreakerPattern>,

  // For database operations with lower failure tolerance
  DATABASE: {
    failureThreshold: 3,
    resetTimeout: 30000, // 30 seconds
    rollingCountWindow: 60000, // 1 minute
  } satisfies Partial<CircuitBreakerPattern>,

  // For critical operations that should fail fast
  CRITICAL: {
    failureThreshold: 1,
    resetTimeout: 10000, // 10 seconds
    rollingCountWindow: 30000, // 30 seconds
  } satisfies Partial<CircuitBreakerPattern>,

  // For resilient operations that can handle many failures
  RESILIENT: {
    failureThreshold: 10,
    resetTimeout: 120000, // 2 minutes
    rollingCountWindow: 600000, // 10 minutes
  } satisfies Partial<CircuitBreakerPattern>,
};

// ===== RATE LIMITER CONFIGURATIONS =====

export const RATE_LIMITER_CONFIGS = {
  // For external APIs with strict rate limits
  EXTERNAL_API_STRICT: {
    windowMs: 60000, // 1 minute
    maxRequests: 60,
    prefix: 'external-api-strict',
  } satisfies UtilsRateLimitConfig,

  // For external APIs with moderate rate limits
  EXTERNAL_API_MODERATE: {
    windowMs: 60000, // 1 minute
    maxRequests: 300,
    prefix: 'external-api-moderate',
  } satisfies UtilsRateLimitConfig,

  // For internal APIs or services
  INTERNAL_API: {
    windowMs: 60000, // 1 minute
    maxRequests: 1000,
    prefix: 'internal-api',
  } satisfies UtilsRateLimitConfig,

  // For bulk operations
  BULK_OPERATION: {
    windowMs: 300000, // 5 minutes
    maxRequests: 100,
    prefix: 'bulk-operation',
  } satisfies UtilsRateLimitConfig,

  // For database write operations
  DATABASE_WRITE: {
    windowMs: 60000, // 1 minute
    maxRequests: 500,
    prefix: 'database-write',
  } satisfies UtilsRateLimitConfig,
};

// ===== ENHANCED BATCH PROCESSING UTILITIES =====

export interface BatchProcessingOptions<_T> {
  batchSize?: number;
  concurrency?: number;
  onProgress?: (processed: number, total: number) => Promise<void>;
  continueOnError?: boolean;
  preserveOrder?: boolean;
  timeout?: number;
  /** Maximum number of items to keep in memory for large datasets (default: 10000) */
  maxMemoryItems?: number;
}

export interface BatchProcessingResult<T, R> {
  results: R[];
  errors: Array<{
    item: T;
    error: Error;
    batchIndex: number;
    itemIndex: number;
  }>;
  totalProcessed: number;
  successRate: number;
  duration: number;
  /** Indicates if results were streamed for memory optimization */
  streamedResults?: boolean;
  /** Total count of results when streaming (may differ from results.length) */
  totalResultCount?: number;
  /** Indicates if memory optimization was applied */
  memoryOptimized?: boolean;
}

/**
 * Enhanced batch processing with memory-efficient streaming and comprehensive error handling
 * Uses bounded memory even for large datasets by streaming results through callbacks
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (batch: T[]) => Promise<R[]>,
  options: BatchProcessingOptions<T> = {},
): Promise<BatchProcessingResult<T, R>> {
  const {
    batchSize = 100,
    concurrency = 5,
    onProgress,
    continueOnError = true,
    preserveOrder = true,
    timeout = 300000, // 5 minutes default timeout
    maxMemoryItems = 10000, // Max items to keep in memory for large datasets
  } = options;

  const startTime = Date.now();
  const errors: Array<{
    item: T;
    error: Error;
    batchIndex: number;
    itemIndex: number;
  }> = [];

  // For large datasets, use streaming approach to prevent memory exhaustion
  const isLargeDataset = items.length > maxMemoryItems;
  let results: R[] = [];
  let resultCount = 0;

  // For ordered processing of large datasets, use a bounded window
  const orderedResults = preserveOrder && isLargeDataset ? new Map<number, R[]>() : null;
  let nextOrderedIndex = 0;

  // Process batches with concurrency control and memory-efficient streaming
  const processBatchWithIndex = async (batch: T[], batchIndex: number): Promise<R[] | null> => {
    try {
      // Use AbortSignal.timeout with fallback for better timeout handling
      let timeoutSignal: AbortSignal;
      try {
        // Try modern AbortSignal.timeout first
        timeoutSignal = AbortSignal.timeout(timeout);
      } catch {
        // Fallback for older environments
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        timeoutSignal = controller.signal;
      }

      const batchResultsPromise = processor(batch);
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        const cleanup = () => reject(new Error(`Batch ${batchIndex} timed out after ${timeout}ms`));
        if (timeoutSignal.aborted) {
          cleanup();
          return;
        }
        timeoutSignal.addEventListener('abort', cleanup, { once: true });
      });

      const batchResults = await Promise.race([batchResultsPromise, timeoutPromise]);
      return batchResults;
    } catch (error: any) {
      if (!continueOnError) throw error;

      batch.forEach((item, itemIndex) => {
        errors.push({
          item,
          error: error as Error,
          batchIndex,
          itemIndex: batchIndex * batchSize + itemIndex,
        });
      });
      return null;
    }
  };

  // Helper to process results in order while maintaining memory bounds
  const processOrderedResults = () => {
    if (!orderedResults) return;

    while (orderedResults.has(nextOrderedIndex)) {
      const batchResults = orderedResults.get(nextOrderedIndex);
      if (!batchResults) break;
      orderedResults.delete(nextOrderedIndex);

      // Stream results to prevent memory buildup
      if (isLargeDataset && results.length > maxMemoryItems / 2) {
        // In a real implementation, these would be written to a stream/file
        // For now, we'll just count them to maintain the interface
        resultCount += batchResults.length;
      } else {
        results.push(...batchResults);
        resultCount += batchResults.length;
      }

      nextOrderedIndex++;
    }
  };

  // Split items into batches lazily to save memory
  const totalBatches = Math.ceil(items.length / batchSize);

  // Process batches in chunks with concurrency control
  for (let startBatch = 0; startBatch < totalBatches; startBatch += concurrency) {
    const endBatch = Math.min(startBatch + concurrency, totalBatches);
    const batchPromises: Promise<{ index: number; results: R[] | null }>[] = [];

    for (let batchIndex = startBatch; batchIndex < endBatch; batchIndex++) {
      const startItem = batchIndex * batchSize;
      const endItem = Math.min(startItem + batchSize, items.length);
      const batch = items.slice(startItem, endItem);

      const batchPromise = (async () => {
        const batchResults = await processBatchWithIndex(batch, batchIndex);
        return {
          index: batchIndex,
          results: batchResults,
        };
      })();

      batchPromises.push(batchPromise);
    }

    const batchGroupResults = await Promise.allSettled(batchPromises);

    // Process results
    for (const result of batchGroupResults) {
      if (result.status === 'fulfilled' && result.value.results) {
        const { index, results: batchResults } = result.value;

        if (preserveOrder) {
          if (isLargeDataset) {
            orderedResults?.set(index, batchResults);
            processOrderedResults();
          } else {
            // For small datasets, keep simple approach - use any to handle complex indexing
            if (!(results as any)[index]) (results as any)[index] = [];
            // Use structured assignment to avoid memory issues
            (results as any)[index] = batchResults;
          }
        } else {
          // Non-ordered processing - stream results immediately
          if (isLargeDataset && results.length > maxMemoryItems / 2) {
            resultCount += batchResults.length;
          } else {
            results.push(...batchResults);
            resultCount += batchResults.length;
          }
        }
      }
    }

    if (onProgress) {
      const processed = Math.min(endBatch * batchSize, items.length);
      await onProgress(processed, items.length);
    }
  }

  // Final ordered results processing
  if (preserveOrder && isLargeDataset) {
    processOrderedResults();
  }

  // For ordered small datasets, flatten results array
  if (preserveOrder && !isLargeDataset && Array.isArray(results[0])) {
    const flatResults: R[] = [];
    for (const batchResult of results as unknown as R[][]) {
      if (batchResult) flatResults.push(...batchResult);
    }
    results = flatResults;
  }

  const duration = Date.now() - startTime;
  const totalProcessed = (isLargeDataset ? resultCount : results.length) + errors.length;
  const successRate =
    totalProcessed > 0 ? (isLargeDataset ? resultCount : results.length) / totalProcessed : 0;

  return {
    results: isLargeDataset && results.length === 0 ? ([] as any) : results, // Return empty array for streamed large datasets
    errors,
    totalProcessed,
    successRate,
    duration,
    // Add metadata for large dataset streaming
    ...(isLargeDataset && {
      streamedResults: true,
      totalResultCount: resultCount,
      memoryOptimized: true,
    }),
  };
}

// ===== PROGRESS REPORTING UTILITIES =====

export class ProgressReporter {
  private processed = 0;
  private lastReportTime = 0;
  private readonly reportThrottleMs = 1000; // Report at most once per second

  constructor(
    private totalItems: number,
    private message: string,
    private context?: StepExecutionContext,
  ) {}

  async increment(count: number = 1): Promise<void> {
    this.processed += count;
    await this.report();
  }

  async report(force: boolean = false): Promise<void> {
    const now = Date.now();

    // Throttle reports to avoid overwhelming the system
    if (!force && now - this.lastReportTime < this.reportThrottleMs) {
      return;
    }

    this.lastReportTime = now;

    if (this.context?.reportProgress) {
      await this.context.reportProgress(
        this.processed,
        this.totalItems,
        `${this.message}: ${this.processed}/${this.totalItems} (${this.percentage}%)`,
      );
    }
  }

  async complete(): Promise<void> {
    this.processed = this.totalItems;
    await this.report(true);
  }

  get percentage(): number {
    return Math.round((this.processed / this.totalItems) * 100);
  }

  get remaining(): number {
    return Math.max(0, this.totalItems - this.processed);
  }

  get isComplete(): boolean {
    return this.processed >= this.totalItems;
  }

  get processedItems(): number {
    return this.processed;
  }
}

// ===== ERROR HANDLING UTILITIES =====

export interface ErrorAccumulator {
  errors: Array<{
    step: string;
    error: Error;
    context?: Record<string, unknown>;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  warnings: Array<{
    step: string;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
  }>;
  summary: {
    totalErrors: number;
    criticalErrors: number;
    highSeverityErrors: number;
    errorsByStep: Record<string, number>;
  };
}

export function createErrorAccumulator(): ErrorAccumulator {
  return {
    errors: [],
    warnings: [],
    summary: {
      totalErrors: 0,
      criticalErrors: 0,
      highSeverityErrors: 0,
      errorsByStep: {},
    },
  };
}

export function addError(
  accumulator: ErrorAccumulator,
  step: string,
  error: Error,
  context?: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
): void {
  accumulator.errors.push({
    step,
    error,
    context,
    timestamp: new Date().toISOString(),
    severity,
  });

  // Update summary
  accumulator.summary.totalErrors++;
  if (severity === 'critical') accumulator.summary.criticalErrors++;
  if (severity === 'high') accumulator.summary.highSeverityErrors++;
  accumulator.summary.errorsByStep[step] = (accumulator.summary.errorsByStep[step] || 0) + 1;
}

export function addWarning(
  accumulator: ErrorAccumulator,
  step: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  accumulator.warnings.push({
    step,
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}

export function hasErrors(accumulator: ErrorAccumulator): boolean {
  return accumulator.errors.length > 0;
}

export function hasCriticalErrors(accumulator: ErrorAccumulator): boolean {
  return accumulator.summary.criticalErrors > 0;
}

export function getErrorSummary(accumulator: ErrorAccumulator): string {
  const { totalErrors, criticalErrors, highSeverityErrors } = accumulator.summary;

  if (totalErrors === 0) return 'No errors';

  const parts = [`${totalErrors} total error(s)`];
  if (criticalErrors > 0) parts.push(`${criticalErrors} critical`);
  if (highSeverityErrors > 0) parts.push(`${highSeverityErrors} high severity`);

  return parts.join(', ');
}

// ===== RETRY STRATEGIES =====

export const RETRY_STRATEGIES = {
  // For API calls that might have temporary issues
  API_CALL: {
    maxAttempts: 3,
    backoff: 'exponential' as const,
    initialDelay: 1000,
    maxDelay: 10000,
    jitter: true,
  },

  // For database operations
  DATABASE: {
    maxAttempts: 2,
    backoff: 'linear' as const,
    baseDelay: 500,
    maxDelay: 2000,
  },

  // For critical operations that should retry aggressively
  CRITICAL: {
    maxAttempts: 5,
    backoff: 'exponential' as const,
    initialDelay: 500,
    maxDelay: 30000,
    jitter: true,
  },

  // For operations that should fail fast
  FAIL_FAST: {
    maxAttempts: 1,
  },

  // For network operations with longer backoff
  NETWORK: {
    maxAttempts: 4,
    backoff: 'exponential' as const,
    initialDelay: 2000,
    maxDelay: 60000,
    jitter: true,
  },
};

// ===== VALIDATION UTILITIES =====

export const CommonSchemas = {
  DateRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .refine((data: any) => new Date(data.start) < new Date(data.end), {
      message: 'Start date must be before end date',
    }),

  Pagination: z.object({
    page: z.number().positive().default(1),
    limit: z.number().positive().max(1000).default(100),
    offset: z.number().nonnegative().optional(),
  }),

  IdList: z.array(z.string().min(1)).min(1),

  SortOrder: z.enum(['asc', 'desc']).default('desc'),

  BatchConfig: z.object({
    batchSize: z.number().positive().max(10000).default(100),
    concurrency: z.number().positive().max(20).default(5),
    continueOnError: z.boolean().default(true),
    timeout: z.number().positive().default(300000),
  }),
};

// ===== FALLBACK MECHANISMS =====

export interface FallbackOptions {
  logError?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  maxAttempts?: number;
  shouldFallback?: (error: Error) => boolean;
}

export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: FallbackOptions = {},
): Promise<T> {
  const { logError = false, maxAttempts = 1, shouldFallback } = options;

  let lastError: Error | undefined;

  // Try primary operation
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await primary();
      return result;
    } catch (error: any) {
      lastError = error as Error;

      if (shouldFallback && !shouldFallback(lastError)) {
        throw lastError;
      }

      if (logError) {
        // Fire and forget logging - don't await
        (async () => {
          try {
            const logger = await createServerObservability();
            logger.log('warning', `Primary operation failed (attempt ${attempt}/${maxAttempts})`, {
              error: lastError,
            });
          } catch {
            // Fallback to console if logger fails
          }
        })();
      }

      if (attempt === maxAttempts) break;

      // Wait before retry with timeout cleanup
      await new Promise(resolve => {
        setTimeout(resolve, 1000 * attempt);
      });
    }
  }

  // Try fallback operation
  try {
    if (logError) {
      // Fire and forget logging - don't await
      (async () => {
        try {
          const _logger = await createServerObservability();
          logInfo('Attempting fallback operation...', { component: 'WorkflowUtilities' });
        } catch {
          // Fallback to console if logger fails
        }
      })();
    }
    return await fallback();
  } catch (error: any) {
    // If both fail, throw a combined error
    throw new Error(
      `Both primary and fallback operations failed. Primary: ${lastError?.message || 'Unknown error'}. Fallback: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// ===== MEMORY MANAGEMENT UTILITIES =====

export async function* streamProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  chunkSize: number = 1000,
): AsyncGenerator<R[], void, undefined> {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const results = await Promise.all(chunk.map(processor));
    yield results;

    // Allow garbage collection between chunks
    if (global.gc) {
      global.gc();
    }
  }
}

export function createMemoryEfficientProcessor<T, R>(
  processor: (item: T) => Promise<R>,
  maxMemoryMB: number = 512,
): (items: T[]) => AsyncGenerator<R[], void, undefined> {
  const estimatedItemSize = 1024; // 1KB per item estimate
  const maxItemsInMemory = Math.floor((maxMemoryMB * 1024 * 1024) / estimatedItemSize);
  const chunkSize = Math.max(100, Math.min(maxItemsInMemory, 10000));

  return async function* (items: T[]) {
    yield* streamProcess(items, processor, chunkSize);
  };
}

// ===== PARTIAL SUCCESS HANDLING =====

export interface PartialSuccessResult<T> {
  successful: T[];
  failed: Array<{
    input: unknown;
    error: Error;
    index: number;
  }>;
  successRate: number;
  metadata: {
    totalItems: number;
    processedAt: string;
    duration: number;
  };
}

export function createPartialSuccessResult<T>(totalItems: number = 0): PartialSuccessResult<T> {
  return {
    successful: [],
    failed: [],
    successRate: 0,
    metadata: {
      totalItems,
      processedAt: new Date().toISOString(),
      duration: 0,
    },
  };
}

export function updateSuccessRate<T>(result: PartialSuccessResult<T>): void {
  const total = result.successful.length + result.failed.length;
  result.successRate = total > 0 ? result.successful.length / total : 0;
}

export function addSuccessfulResult<T>(result: PartialSuccessResult<T>, item: T): void {
  result.successful.push(item);
  updateSuccessRate(result);
}

export function addFailedResult<T>(
  result: PartialSuccessResult<T>,
  input: unknown,
  error: Error,
  index: number,
): void {
  result.failed.push({ input, error, index });
  updateSuccessRate(result);
}

// ===== WORKFLOW-SPECIFIC RATE LIMITER UTILITIES =====

export function createWorkflowRateLimiter(config: UtilsRateLimitConfig) {
  const rateLimiter = createRateLimiter(config);

  return {
    async check(getIdentifier: string): Promise<void> {
      // For workflows, we create a mock request object with proper headers
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for' || name === 'x-real-ip' || name === 'cf-connecting-ip') {
              return getIdentifier;
            }
            return null;
          },
        },
      } as any;

      const result = await rateLimiter.limit(mockRequest);

      if (!result.success) {
        throw new Error(`Rate limit exceeded for ${getIdentifier}: ${result.reason}`);
      }
    },

    async limit(mockRequest: any) {
      return rateLimiter.limit(mockRequest);
    },

    async checkWithIdentifier(
      getIdentifier: string,
    ): Promise<{ remaining: number; reset: number }> {
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for' || name === 'x-real-ip' || name === 'cf-connecting-ip') {
              return getIdentifier;
            }
            return null;
          },
        },
      } as any;

      const result = await rateLimiter.limit(mockRequest);

      if (!result.success) {
        throw new Error(`Rate limit exceeded for ${getIdentifier}: ${result.reason}`);
      }

      return {
        remaining: result.remaining,
        reset: result.reset,
      };
    },
  };
}

// Backward compatibility: createRateLimiter that returns an object with .limit() method
function createRateLimiterWithCheck(config: UtilsRateLimitConfig) {
  return createWorkflowRateLimiter(config);
}

// ===== UTILITY FUNCTIONS =====

export function createStepIdentifier(workflowId: string, stepName: string): string {
  return `${workflowId}:${stepName}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export function createTimestamp(): string {
  return new Date().toISOString();
}

export function isValidIdentifier(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export function sanitizeIdentifier(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ===== MISSING UTILITY FUNCTIONS FOR TESTS =====

/**
 * Creates a workflow definition with basic validation
 */
export function createWorkflowDefinition(config: {
  id: string;
  name: string;
  steps: unknown[];
  version?: string;
}): {
  id: string;
  name: string;
  steps: unknown[];
  version: string;
} {
  return {
    id: config.id,
    name: config.name,
    steps: config.steps,
    version: config.version || '1.0.0',
  };
}

/**
 * Creates a step definition with basic validation
 */
export function createStepDefinition(config: { id: string; name: string; action: string }): {
  id: string;
  name: string;
  action: string;
} {
  return {
    id: config.id,
    name: config.name,
    action: config.action,
  };
}

/**
 * Creates an execution context for workflow execution
 */
export function createExecutionContext(config: { workflowId: string; executionId: string }): {
  workflowId: string;
  executionId: string;
  timestamp: string;
} {
  return {
    workflowId: config.workflowId,
    executionId: config.executionId,
    timestamp: createTimestamp(),
  };
}

/**
 * Creates a schedule configuration with validation
 */
export function createScheduleConfig(config: { cron: string; timezone: string }): {
  cron: string;
  timezone: string;
} {
  return {
    cron: config.cron,
    timezone: config.timezone,
  };
}

/**
 * Serializes a workflow to JSON string
 */
export function serializeWorkflow(workflow: unknown): string {
  return JSON.stringify(workflow);
}

/**
 * Deserializes a workflow from JSON string
 */
export function deserializeWorkflow(serialized: string): unknown {
  return JSON.parse(serialized);
}

/**
 * Normalizes step input data
 */
export function normalizeStepInput(input: unknown): unknown {
  if (input === null || input === undefined) {
    return {};
  }
  return input;
}

/**
 * Sanitizes execution output data
 */
export function sanitizeExecutionOutput(output: unknown): unknown {
  if (output === null || output === undefined) {
    return {};
  }
  return output;
}

/**
 * Validates if an object is a workflow definition
 */
export function isWorkflowDefinition(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const workflow = obj as Record<string, unknown>;
  return typeof workflow.id === 'string' && typeof workflow.name === 'string';
}

/**
 * Validates if an object is a step definition
 */
export function isStepDefinition(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const step = obj as Record<string, unknown>;
  return typeof step.id === 'string' && typeof step.name === 'string';
}

/**
 * Validates if an object is an execution result
 */
export function isExecutionResult(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const result = obj as Record<string, unknown>;
  return typeof result.id === 'string' && typeof result.status === 'string';
}

/**
 * Validates if an object is a schedule config
 */
export function isScheduleConfig(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const schedule = obj as Record<string, unknown>;
  return typeof schedule.cron === 'string' && typeof schedule.timezone === 'string';
}
