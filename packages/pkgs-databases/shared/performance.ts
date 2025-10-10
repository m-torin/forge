/**
 * Performance optimization utilities for database operations
 */

import { CircuitBreaker, ConnectionError, DatabaseError } from './errors';
import { PerformanceTimer, detectRuntime, exponentialBackoff } from './utils';

/**
 * Performance metrics for database operations
 */
export interface DatabaseMetrics {
  operationType: string;
  duration: number;
  success: boolean;
  errorCode?: string;
  runtime: string;
  timestamp: number;
}

/**
 * Performance monitoring service
 */
export class PerformanceMonitor {
  private metrics: DatabaseMetrics[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Record a database operation
   */
  record(metric: DatabaseMetrics): void {
    this.metrics.push(metric);

    // Keep only the most recent metrics to avoid memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(operationType?: string): {
    totalOperations: number;
    successRate: number;
    averageDuration: number;
    p95Duration: number;
    errorCounts: Record<string, number>;
  } {
    let filteredMetrics = this.metrics;

    if (operationType) {
      filteredMetrics = this.metrics.filter(m => m.operationType === operationType);
    }

    if (filteredMetrics.length === 0) {
      return {
        totalOperations: 0,
        successRate: 0,
        averageDuration: 0,
        p95Duration: 0,
        errorCounts: {},
      };
    }

    const successfulOps = filteredMetrics.filter(m => m.success);
    const durations = filteredMetrics.map(m => m.duration).sort((a, b) => a - b);
    const p95Index = Math.floor(durations.length * 0.95);

    const errorCounts: Record<string, number> = {};
    filteredMetrics.forEach(m => {
      if (!m.success && m.errorCode) {
        errorCounts[m.errorCode] = (errorCounts[m.errorCode] || 0) + 1;
      }
    });

    return {
      totalOperations: filteredMetrics.length,
      successRate: successfulOps.length / filteredMetrics.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p95Duration: durations[p95Index] || 0,
      errorCounts,
    };
  }

  /**
   * Clear metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Database operation wrapper with performance monitoring and resilience
 */
export async function withPerformanceMonitoring<T>(
  operationType: string,
  operation: () => Promise<T>,
  options: {
    circuitBreaker?: CircuitBreaker;
    retryAttempts?: number;
    timeoutMs?: number;
  } = {},
): Promise<{ success: true; data: T } | { success: false; error: DatabaseError }> {
  const timer = new PerformanceTimer();
  const runtime = detectRuntime();
  const startTime = Date.now();

  let lastError: DatabaseError | null = null;
  const maxAttempts = options.retryAttempts || 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Execute operation (circuit breaker logic would be implemented in the operation itself)
      // if (options.circuitBreaker) {
      //   await options.circuitBreaker.call(operationType, operation);
      // }

      // Add timeout if specified
      let result: T;
      if (options.timeoutMs) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Operation timed out after ${options.timeoutMs}ms`)),
            options.timeoutMs,
          );
        });
        result = await Promise.race([operation(), timeoutPromise]);
      } else {
        result = await operation();
      }

      // Record successful operation
      performanceMonitor.record({
        operationType,
        duration: timer.getDuration(),
        success: true,
        runtime,
        timestamp: startTime,
      });

      return { success: true, data: result };
    } catch (error) {
      const dbError =
        error instanceof Error
          ? new ConnectionError(error.message, 'database', operationType)
          : new ConnectionError('Unknown error occurred', 'database', operationType);

      lastError = dbError;

      // If this is the last attempt or error is not retryable, record and return
      if (attempt === maxAttempts - 1 || !dbError.retryable) {
        performanceMonitor.record({
          operationType,
          duration: timer.getDuration(),
          success: false,
          errorCode: dbError.code,
          runtime,
          timestamp: startTime,
        });

        return { success: false, error: dbError };
      }

      // Wait before retry with exponential backoff
      if (attempt < maxAttempts - 1) {
        const delay = exponentialBackoff(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error:
      lastError ||
      new ConnectionError('Operation failed after all retries', 'database', operationType),
  };
}

/**
 * Batch operations with performance tracking
 */
export async function executeBatchOperations<T>(
  operationType: string,
  operations: Array<() => Promise<T>>,
  options: {
    batchSize?: number;
    delayBetweenBatches?: number;
    failFast?: boolean;
  } = {},
): Promise<Array<{ success: true; data: T } | { success: false; error: DatabaseError }>> {
  const { batchSize = 10, delayBetweenBatches = 0, failFast = false } = options;
  const results: Array<{ success: true; data: T } | { success: false; error: DatabaseError }> = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);

    const batchPromises = batch.map(operation =>
      withPerformanceMonitoring(`${operationType}_batch`, operation),
    );

    if (failFast) {
      // If any operation fails, stop processing
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Check if any failed and stop if failFast is enabled
        if (batchResults.some(result => !result.success)) {
          break;
        }
      } catch (error) {
        // This shouldn't happen with our error handling, but just in case
        const dbError = new ConnectionError(
          error instanceof Error ? error.message : 'Batch operation failed',
          'database',
          operationType,
        );
        results.push({ success: false, error: dbError });
        break;
      }
    } else {
      // Execute all operations regardless of failures
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(
        ...batchResults.map(result =>
          result.status === 'fulfilled'
            ? result.value
            : {
                success: false as const,
                error: new ConnectionError(
                  result.reason instanceof Error ? result.reason.message : 'Operation failed',
                  'database',
                  operationType,
                ),
              },
        ),
      );
    }

    // Add delay between batches if specified
    if (delayBetweenBatches > 0 && i + batchSize < operations.length) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}

/**
 * Cache with performance-aware TTL based on operation latency
 */
export class PerformanceAwareCache<T> {
  private cache = new Map<string, { data: T; expires: number; hitCount: number }>();
  private readonly defaultTtlMs: number = 60000; // 1 minute

  constructor(
    private options: {
      maxSize?: number;
      defaultTtl?: number;
      adaptiveTtl?: boolean;
    } = {},
  ) {
    this.defaultTtlMs = options.defaultTtl || this.defaultTtlMs;
  }

  /**
   * Get cached value with performance tracking
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry || Date.now() > entry.expires) {
      if (entry) {
        this.cache.delete(key);
      }
      return null;
    }

    entry.hitCount++;
    return entry.data;
  }

  /**
   * Set cached value with adaptive TTL based on operation performance
   */
  set(key: string, data: T, operationDuration?: number): void {
    let ttl = this.defaultTtlMs;

    if (this.options.adaptiveTtl && operationDuration) {
      // Longer TTL for slower operations to reduce repeated expensive calls
      if (operationDuration > 1000) {
        ttl = this.defaultTtlMs * 3; // 3x TTL for operations > 1s
      } else if (operationDuration > 500) {
        ttl = this.defaultTtlMs * 2; // 2x TTL for operations > 500ms
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
      hitCount: 0,
    });

    // Cleanup old entries if cache is too large
    if (this.options.maxSize && this.cache.size > this.options.maxSize) {
      this.cleanup();
    }
  }

  /**
   * Clean up expired or least used entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());

    // Remove expired entries first
    entries.forEach(([key, entry]) => {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    });

    // If still too large, remove least used entries
    if (this.options.maxSize && this.cache.size > this.options.maxSize) {
      const sortedEntries = entries
        .filter(([_, entry]) => now <= entry.expires)
        .sort(([, a], [, b]) => a.hitCount - b.hitCount);

      const toRemove = this.cache.size - this.options.maxSize;
      for (let i = 0; i < toRemove; i++) {
        if (sortedEntries[i]) {
          this.cache.delete(sortedEntries[i][0]);
        }
      }
    }
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    totalHits: number;
    averageHitCount: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);

    return {
      size: this.cache.size,
      totalHits,
      averageHitCount: entries.length > 0 ? totalHits / entries.length : 0,
    };
  }
}
