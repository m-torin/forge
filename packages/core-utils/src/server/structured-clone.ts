/**
 * Node.js 22+ Structured Clone Utilities
 * Provides performance optimization using structuredClone() for object operations
 */

import { performance } from 'node:perf_hooks';

export interface StructuredCloneOptions {
  // Fallback options
  fallbackToJson?: boolean;
  validateClone?: boolean;

  // Performance tracking
  trackPerformance?: boolean;
  performanceMarker?: string;

  // Type safety
  expectedType?: string;

  // Transfer options (for transferable objects)
  transfer?: any[];

  // Error handling
  onError?: (error: unknown, fallbackUsed: boolean) => void;
}

export interface CloneResult<T> {
  data: T;
  method: 'structuredClone' | 'json' | 'failed';
  performance?: {
    durationMs: number;
    marker?: string;
  };
  warnings?: string[];
}

/**
 * Check if structuredClone is available
 */
export function isStructuredCloneAvailable(): boolean {
  try {
    return typeof structuredClone === 'function';
  } catch {
    return false;
  }
}

/**
 * Enhanced cloning with Node.js 22+ structuredClone
 */
export function enhancedClone<T>(data: T, options: StructuredCloneOptions = {}): CloneResult<T> {
  const {
    fallbackToJson = true,
    validateClone = false,
    trackPerformance = false,
    performanceMarker,
    expectedType,
    transfer,
    onError,
  } = options;

  const warnings: string[] = [];
  let startTime: number | undefined;
  let endTime: number | undefined;

  if (trackPerformance) {
    const marker = performanceMarker || `clone-${Date.now()}`;
    performance.mark(`${marker}-start`);
    startTime = performance.now();
  }

  try {
    // Try structuredClone first
    if (isStructuredCloneAvailable()) {
      const cloneOptions: StructuredCloneOptions & { transfer?: any[] } = {};
      if (transfer && transfer.length > 0) {
        cloneOptions.transfer = transfer;
      }

      const cloned = structuredClone(data, cloneOptions);

      // Validate clone if requested
      if (validateClone) {
        const validationResult = validateClonedData(data, cloned, expectedType);
        if (!validationResult.isValid) {
          warnings.push(`Clone validation failed: ${validationResult.reason}`);
        }
      }

      if (trackPerformance) {
        endTime = performance.now();
        const marker = performanceMarker || `clone-${Date.now()}`;
        performance.mark(`${marker}-end`);
        performance.measure(`${marker}-duration`, `${marker}-start`, `${marker}-end`);
      }

      return {
        data: cloned,
        method: 'structuredClone',
        performance:
          trackPerformance && startTime !== undefined && endTime !== undefined
            ? { durationMs: endTime - startTime, marker: performanceMarker }
            : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } else {
      warnings.push('structuredClone not available, using fallback');
    }
  } catch (error) {
    warnings.push(
      `structuredClone failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    if (onError) {
      onError(error, true);
    }
  }

  // Fallback to JSON if enabled
  if (fallbackToJson) {
    try {
      const jsonString = JSON.stringify(data);
      const cloned = JSON.parse(jsonString) as T;

      if (trackPerformance) {
        endTime = performance.now();
        const marker = performanceMarker || `clone-${Date.now()}`;
        performance.mark(`${marker}-end`);
        performance.measure(`${marker}-duration`, `${marker}-start`, `${marker}-end`);
      }

      return {
        data: cloned,
        method: 'json',
        performance:
          trackPerformance && startTime !== undefined && endTime !== undefined
            ? { durationMs: endTime - startTime, marker: performanceMarker }
            : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (jsonError) {
      warnings.push(
        `JSON fallback failed: ${jsonError instanceof Error ? jsonError.message : 'unknown error'}`,
      );

      if (onError) {
        onError(jsonError, true);
      }
    }
  }

  // Complete failure
  if (trackPerformance && startTime !== undefined) {
    endTime = performance.now();
  }

  return {
    data: data, // Return original data as last resort
    method: 'failed',
    performance:
      trackPerformance && startTime !== undefined && endTime !== undefined
        ? { durationMs: endTime - startTime, marker: performanceMarker }
        : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Validate cloned data
 */
function validateClonedData<T>(
  original: T,
  cloned: T,
  expectedType?: string,
): { isValid: boolean; reason?: string } {
  // Type check
  if (expectedType && typeof cloned !== expectedType) {
    return { isValid: false, reason: `Expected type ${expectedType}, got ${typeof cloned}` };
  }

  // Basic type check
  if (typeof original !== typeof cloned) {
    return {
      isValid: false,
      reason: `Type mismatch: original ${typeof original}, cloned ${typeof cloned}`,
    };
  }

  // Null/undefined check
  if (original === null || original === undefined) {
    return {
      isValid: original === cloned,
      reason: original !== cloned ? 'Null/undefined mismatch' : undefined,
    };
  }

  // For primitives
  if (typeof original !== 'object') {
    return {
      isValid: original === cloned,
      reason: original !== cloned ? 'Primitive value mismatch' : undefined,
    };
  }

  // For objects, check constructor if available
  if (
    typeof original === 'object' &&
    original !== null &&
    typeof cloned === 'object' &&
    cloned !== null
  ) {
    if ((original as any).constructor !== (cloned as any).constructor) {
      return { isValid: false, reason: 'Constructor mismatch' };
    }
  }

  // For arrays, check length
  if (Array.isArray(original) && Array.isArray(cloned)) {
    if (original.length !== cloned.length) {
      return { isValid: false, reason: 'Array length mismatch' };
    }
  }

  return { isValid: true };
}

/**
 * Deep clone array with performance optimization
 */
export async function* cloneArrayStream<T>(
  array: T[],
  options: StructuredCloneOptions & { batchSize?: number } = {},
): AsyncGenerator<CloneResult<T>, void, unknown> {
  const { batchSize = 100, ...cloneOptions } = options;

  for (let i = 0; i < array.length; i += batchSize) {
    const batch = array.slice(i, i + batchSize);

    for (const item of batch) {
      const result = enhancedClone(item, {
        ...cloneOptions,
        performanceMarker: `array-clone-${i}`,
      });

      yield result;

      // Yield to event loop periodically
      if (i % batchSize === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }
  }
}

/**
 * Performance comparison between structuredClone and JSON
 */
export function benchmarkCloneMethods<T>(
  data: T,
  iterations: number = 1000,
): {
  structuredClone?: { avgMs: number; totalMs: number; errors: number };
  json?: { avgMs: number; totalMs: number; errors: number };
  recommendation: 'structuredClone' | 'json' | 'inconclusive';
} {
  const results: any = {};

  // Test structuredClone
  if (isStructuredCloneAvailable()) {
    const structuredTimes: number[] = [];
    let structuredErrors = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        structuredClone(data);
        const end = performance.now();
        structuredTimes.push(end - start);
      } catch {
        structuredErrors++;
      }
    }

    if (structuredTimes.length > 0) {
      const total = structuredTimes.reduce((a, b) => a + b, 0);
      results.structuredClone = {
        avgMs: total / structuredTimes.length,
        totalMs: total,
        errors: structuredErrors,
      };
    }
  }

  // Test JSON
  const jsonTimes: number[] = [];
  let jsonErrors = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const start = performance.now();
      JSON.parse(JSON.stringify(data));
      const end = performance.now();
      jsonTimes.push(end - start);
    } catch {
      jsonErrors++;
    }
  }

  if (jsonTimes.length > 0) {
    const total = jsonTimes.reduce((a, b) => a + b, 0);
    results.json = {
      avgMs: total / jsonTimes.length,
      totalMs: total,
      errors: jsonErrors,
    };
  }

  // Determine recommendation
  let recommendation: 'structuredClone' | 'json' | 'inconclusive' = 'inconclusive';

  if (results.structuredClone && results.json) {
    if (results.structuredClone.errors === 0 && results.json.errors === 0) {
      recommendation =
        results.structuredClone.avgMs < results.json.avgMs ? 'structuredClone' : 'json';
    } else if (results.structuredClone.errors === 0) {
      recommendation = 'structuredClone';
    } else if (results.json.errors === 0) {
      recommendation = 'json';
    }
  } else if (results.structuredClone && results.structuredClone.errors === 0) {
    recommendation = 'structuredClone';
  } else if (results.json && results.json.errors === 0) {
    recommendation = 'json';
  }

  return { ...results, recommendation };
}

/**
 * Cache with structured clone optimization
 */
export class StructuredCloneCache<K, V> {
  private cache = new Map<K, V>();
  private cloneOptions: StructuredCloneOptions;

  constructor(options: StructuredCloneOptions = {}) {
    this.cloneOptions = {
      fallbackToJson: true,
      validateClone: false,
      trackPerformance: false,
      ...options,
    };
  }

  set(key: K, value: V): void {
    const cloneResult = enhancedClone(value, this.cloneOptions);
    this.cache.set(key, cloneResult.data);
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value === undefined) {
      return undefined;
    }

    const cloneResult = enhancedClone(value, this.cloneOptions);
    return cloneResult.data;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }

  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}

/**
 * Utility functions for common cloning scenarios
 */
export const CloneUtils = {
  /**
   * Clone configuration objects safely
   */
  cloneConfig<T extends Record<string, any>>(config: T): CloneResult<T> {
    return enhancedClone(config, {
      fallbackToJson: true,
      validateClone: true,
      expectedType: 'object',
      trackPerformance: false,
    });
  },

  /**
   * Clone data for serialization
   */
  cloneForSerialization<T>(data: T): CloneResult<T> {
    return enhancedClone(data, {
      fallbackToJson: true,
      validateClone: false,
      trackPerformance: false,
    });
  },

  /**
   * Clone with performance tracking
   */
  cloneWithMetrics<T>(data: T, marker: string): CloneResult<T> {
    return enhancedClone(data, {
      fallbackToJson: true,
      trackPerformance: true,
      performanceMarker: marker,
    });
  },

  /**
   * Safe clone that never throws
   */
  safeClone<T>(data: T, fallback: T): T {
    try {
      const result = enhancedClone(data, {
        fallbackToJson: true,
        validateClone: false,
      });

      return result.method !== 'failed' ? result.data : fallback;
    } catch {
      return fallback;
    }
  },

  /**
   * Benchmark and choose best method
   */
  async optimizedClone<T>(data: T): Promise<CloneResult<T>> {
    const benchmark = benchmarkCloneMethods(data, 10);

    const useStructured = benchmark.recommendation === 'structuredClone';

    return enhancedClone(data, {
      fallbackToJson: !useStructured,
      trackPerformance: true,
      performanceMarker: `optimized-clone-${useStructured ? 'structured' : 'json'}`,
    });
  },
};

/**
 * Export utility types for backward compatibility
 */

/**
 * Export main functions for backward compatibility
 */
export {
  benchmarkCloneMethods as benchmark,
  StructuredCloneCache as Cache,
  enhancedClone as clone,
  isStructuredCloneAvailable as isAvailable,
};
