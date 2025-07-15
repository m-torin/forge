/**
 * Workflow-specific utilities for enhanced batch processing,
 * progress reporting, error handling, and fallback mechanisms
 */

import { createServerObservability } from '@repo/observability/shared-env';
import { z } from 'zod/v4';

import { StepExecutionContext } from '../factories/step-factory/step-types';
import { CircuitBreakerPattern } from '../types/patterns';

import { logInfo } from '@repo/observability/server/next';
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
}

/**
 * Enhanced batch processing with comprehensive error handling and progress tracking
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
  } = options;

  const startTime = Date.now();
  const results: R[] = [];
  const errors: Array<{
    item: T;
    error: Error;
    batchIndex: number;
    itemIndex: number;
  }> = [];

  // Split items into batches
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  // Track results by batch index if order preservation is needed
  const batchResults: (R[] | null)[] = preserveOrder ? new Array(batches.length).fill(null) : [];

  // Process batches with concurrency control
  const processBatchWithIndex = async (batch: T[], batchIndex: number): Promise<void> => {
    try {
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        setTimeout(
          () => reject(new Error(`Batch ${batchIndex} timed out after ${timeout}ms`)),
          timeout,
        );
      });

      const batchResults = await Promise.race([processor(batch), timeoutPromise]);

      if (preserveOrder) {
        (batchResults as (R[] | null)[])[batchIndex] = batchResults;
      } else {
        results.push(...batchResults);
      }
    } catch (error: any) {
      if (!continueOnError) throw error;

      batch.forEach((item, itemIndex: any) => {
        errors.push({
          item,
          error: error as Error,
          batchIndex,
          itemIndex: batchIndex * batchSize + itemIndex,
        });
      });
    }
  };

  // Process batches in chunks with concurrency control
  for (let i = 0; i < batches.length; i += concurrency) {
    const batchGroup = batches.slice(i, i + concurrency);
    const batchIndices = Array.from({ length: batchGroup.length }, (_, idx: any) => i + idx);

    const batchPromises = batchGroup.map((batch, idx: any) =>
      processBatchWithIndex(batch, batchIndices[idx]),
    );

    await Promise.all(batchPromises);

    if (onProgress) {
      const processed = Math.min((i + batchGroup.length) * batchSize, items.length);
      await onProgress(processed, items.length);
    }
  }

  // Flatten ordered results if needed
  if (preserveOrder) {
    for (const batchResult of batchResults as (R[] | null)[]) {
      if (batchResult) {
        results.push(...batchResult);
      }
    }
  }

  const duration = Date.now() - startTime;
  const totalProcessed = results.length + errors.length;
  const successRate = totalProcessed > 0 ? results.length / totalProcessed : 0;

  return {
    results,
    errors,
    totalProcessed,
    successRate,
    duration,
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
            const logger = await createServerObservability({
              providers: {
                console: { enabled: true },
              },
            });
            logger.log(
              'warn',
              `Primary operation failed (attempt ${attempt}/${maxAttempts})`,
              lastError,
            );
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
          const _logger = await createServerObservability({
            providers: {
              console: { enabled: true },
            },
          });
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
export function createRateLimiterWithCheck(config: UtilsRateLimitConfig) {
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
