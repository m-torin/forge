/**
 * Comprehensive utilities for Firestore operations
 */

import type { FirestoreResult } from './types';

/**
 * Data transformation utilities
 */
export const dataTransforms = {
  /**
   * Convert Firestore timestamp to Date
   */
  timestampToDate(timestamp: any): Date | null {
    if (!timestamp) return null;

    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }

    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }

    if (timestamp instanceof Date) {
      return timestamp;
    }

    return null;
  },

  /**
   * Convert Date to Firestore timestamp format
   */
  dateToTimestamp(date: Date): any {
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
    };
  },

  /**
   * Deep clean object for Firestore (remove undefined values)
   */
  cleanForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;

      if (value === null) {
        cleaned[key] = null;
      } else if (Array.isArray(value)) {
        cleaned[key] = value
          .map(item =>
            typeof item === 'object' && item !== null ? this.cleanForFirestore(item) : item,
          )
          .filter(item => item !== undefined);
      } else if (typeof value === 'object' && value !== null) {
        const cleanedNested = this.cleanForFirestore(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }

    return cleaned;
  },

  /**
   * Convert Firestore document to plain object with type safety
   */
  documentToObject<T = any>(doc: any): (T & { id: string }) | null {
    if (!doc || !doc.exists()) return null;

    const data = doc.data();
    if (!data) return null;

    return {
      id: doc.id,
      ...this.convertTimestamps(data),
    } as T & { id: string };
  },

  /**
   * Convert all timestamp fields in an object
   */
  convertTimestamps<T extends Record<string, any>>(obj: T): T {
    const converted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        converted[key] = value;
      } else if (Array.isArray(value)) {
        converted[key] = value.map(item =>
          typeof item === 'object' && item !== null ? this.convertTimestamps(item) : item,
        );
      } else if (typeof value === 'object') {
        // Check if it's a Firestore timestamp
        const converted_timestamp = this.timestampToDate(value);
        if (converted_timestamp) {
          converted[key] = converted_timestamp;
        } else {
          converted[key] = this.convertTimestamps(value);
        }
      } else {
        converted[key] = value;
      }
    }

    return converted;
  },

  /**
   * Flatten nested object for indexing
   */
  flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        flattened[newKey] = value;
      } else if (Array.isArray(value)) {
        flattened[newKey] = value;
        // Also index array elements
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(flattened, this.flattenObject(item, `${newKey}[${index}]`));
          } else {
            flattened[`${newKey}[${index}]`] = item;
          }
        });
      } else if (typeof value === 'object') {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }

    return flattened;
  },
};

/**
 * Query building utilities
 */
export const queryBuilder = {
  /**
   * Build complex where conditions
   */
  buildWhereConditions(
    conditions: Array<{
      field: string;
      operator:
        | '=='
        | '!='
        | '<'
        | '<='
        | '>'
        | '>='
        | 'in'
        | 'not-in'
        | 'array-contains'
        | 'array-contains-any';
      value: any;
    }>,
  ): any[] {
    return conditions.map(({ field, operator, value }) => ({
      field,
      operator,
      value: this.normalizeQueryValue(value),
    }));
  },

  /**
   * Normalize query values for Firestore
   */
  normalizeQueryValue(value: any): any {
    if (value instanceof Date) {
      return dataTransforms.dateToTimestamp(value);
    }

    if (Array.isArray(value)) {
      return value.map(v => this.normalizeQueryValue(v));
    }

    return value;
  },

  /**
   * Build pagination cursor
   */
  buildPaginationCursor(doc: any, orderByFields: string[]): any[] {
    const cursor = [];
    const data = doc.data();

    for (const field of orderByFields) {
      const value = this.getNestedValue(data, field);
      cursor.push(this.normalizeQueryValue(value));
    }

    return cursor;
  },

  /**
   * Get nested object value by dot notation
   */
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  },

  /**
   * Build full-text search terms
   */
  buildSearchTerms(text: string): string[] {
    if (!text) return [];

    // Clean and normalize text
    const cleaned = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace non-word chars with space
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    const words = cleaned.split(' ').filter(word => word.length > 2);
    const terms = new Set(words);

    // Add partial matches
    words.forEach(word => {
      if (word.length > 3) {
        for (let i = 3; i <= word.length; i++) {
          terms.add(word.substring(0, i));
        }
      }
    });

    return Array.from(terms);
  },
};

/**
 * Batch operation utilities
 */
export const batchOperations = {
  /**
   * Split array into batches
   */
  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  /**
   * Execute operations in parallel with concurrency limit
   */
  async parallelLimit<T, R>(
    items: T[],
    operation: (item: T, index: number) => Promise<R>,
    limit: number = 5,
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    const executing: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
      const promise = operation(items[i], i).then(result => {
        results[i] = result;
      });

      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(
          executing.findIndex(p => p === promise),
          1,
        );
      }
    }

    await Promise.all(executing);
    return results;
  },

  /**
   * Execute batch operations with progress tracking
   */
  async batchProcess<T, R>(
    items: T[],
    operation: (batch: T[], batchIndex: number) => Promise<R[]>,
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
      onBatchComplete?: (batchIndex: number, results: R[]) => void;
      onError?: (error: Error, batchIndex: number, batch: T[]) => void;
    } = {},
  ): Promise<R[]> {
    const { batchSize = 500, onProgress, onBatchComplete, onError } = options;

    const batches = this.chunk(items, batchSize);
    const results: R[] = [];

    for (let i = 0; i < batches.length; i++) {
      try {
        const batchResults = await operation(batches[i], i);
        results.push(...batchResults);

        if (onBatchComplete) {
          onBatchComplete(i, batchResults);
        }

        if (onProgress) {
          onProgress((i + 1) * batchSize, items.length);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error, i, batches[i]);
        } else {
          throw error;
        }
      }
    }

    return results;
  },
};

/**
 * Validation utilities
 */
export const validation = {
  /**
   * Validate document path format
   */
  isValidDocumentPath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;

    const segments = path.split('/');

    // Must have even number of segments (collection/doc/collection/doc/...)
    if (segments.length % 2 !== 0) return false;

    // Each segment must not be empty
    return segments.every(segment => segment.length > 0);
  },

  /**
   * Validate collection path format
   */
  isValidCollectionPath(path: string): boolean {
    if (!path || typeof path !== 'string') return false;

    const segments = path.split('/');

    // Must have odd number of segments (collection/doc/collection/...)
    if (segments.length % 2 === 0) return false;

    // Each segment must not be empty
    return segments.every(segment => segment.length > 0);
  },

  /**
   * Validate field name for Firestore
   */
  isValidFieldName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    // Cannot start with __
    if (name.startsWith('__')) return false;

    // Cannot contain certain characters
    const invalidChars = /[~*\/\[\]]/;
    return !invalidChars.test(name);
  },

  /**
   * Validate data for Firestore constraints
   */
  validateDataConstraints(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for undefined values
    const checkUndefined = (obj: any, path = ''): void => {
      if (obj === undefined) {
        errors.push(`Undefined value at ${path || 'root'}`);
        return;
      }

      if (obj === null || typeof obj !== 'object') return;

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkUndefined(item, `${path}[${index}]`);
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          if (!this.isValidFieldName(key)) {
            errors.push(`Invalid field name: ${key} at ${path}`);
          }
          checkUndefined(value, path ? `${path}.${key}` : key);
        });
      }
    };

    checkUndefined(data);

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Sanitize data for Firestore
   */
  sanitizeData<T extends Record<string, any>>(data: T): T {
    return dataTransforms.cleanForFirestore(data) as T;
  },
};

/**
 * Caching utilities
 */
export const cache = {
  /**
   * Create LRU cache
   */
  createLRUCache<K, V>(maxSize: number) {
    const cache = new Map<K, V>();

    return {
      get(key: K): V | undefined {
        const value = cache.get(key);
        if (value !== undefined) {
          // Move to end (most recently used)
          cache.delete(key);
          cache.set(key, value);
        }
        return value;
      },

      set(key: K, value: V): void {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          // Remove least recently used (first item)
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },

      has(key: K): boolean {
        return cache.has(key);
      },

      delete(key: K): boolean {
        return cache.delete(key);
      },

      clear(): void {
        cache.clear();
      },

      size(): number {
        return cache.size;
      },

      keys(): IterableIterator<K> {
        return cache.keys();
      },
    };
  },

  /**
   * Create TTL cache
   */
  createTTLCache<K, V>(defaultTtl: number) {
    const cache = new Map<K, { value: V; expires: number }>();

    return {
      get(key: K): V | undefined {
        const entry = cache.get(key);
        if (!entry) return undefined;

        if (Date.now() > entry.expires) {
          cache.delete(key);
          return undefined;
        }

        return entry.value;
      },

      set(key: K, value: V, ttl = defaultTtl): void {
        cache.set(key, {
          value,
          expires: Date.now() + ttl,
        });
      },

      has(key: K): boolean {
        const entry = cache.get(key);
        if (!entry) return false;

        if (Date.now() > entry.expires) {
          cache.delete(key);
          return false;
        }

        return true;
      },

      delete(key: K): boolean {
        return cache.delete(key);
      },

      clear(): void {
        cache.clear();
      },

      size(): number {
        return cache.size;
      },

      cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
          if (now > entry.expires) {
            cache.delete(key);
          }
        }
      },
    };
  },
};

/**
 * Performance monitoring utilities
 */
export const performance = {
  /**
   * Create operation timer
   */
  createTimer() {
    const start = Date.now();

    return {
      elapsed(): number {
        return Date.now() - start;
      },

      stop(): number {
        const elapsed = this.elapsed();
        return elapsed;
      },
    };
  },

  /**
   * Create performance monitor
   */
  createMonitor(windowSize = 100) {
    const operations: Array<{ name: string; duration: number; timestamp: number }> = [];

    return {
      record(name: string, duration: number): void {
        operations.push({
          name,
          duration,
          timestamp: Date.now(),
        });

        // Keep only recent operations
        if (operations.length > windowSize) {
          operations.shift();
        }
      },

      getStats(name?: string): {
        count: number;
        avg: number;
        min: number;
        max: number;
        p50: number;
        p95: number;
        p99: number;
      } {
        const filtered = name ? operations.filter(op => op.name === name) : operations;

        if (filtered.length === 0) {
          return {
            count: 0,
            avg: 0,
            min: 0,
            max: 0,
            p50: 0,
            p95: 0,
            p99: 0,
          };
        }

        const durations = filtered.map(op => op.duration).sort((a, b) => a - b);
        const sum = durations.reduce((a, b) => a + b, 0);

        return {
          count: filtered.length,
          avg: sum / filtered.length,
          min: durations[0],
          max: durations[durations.length - 1],
          p50: durations[Math.floor(durations.length * 0.5)],
          p95: durations[Math.floor(durations.length * 0.95)],
          p99: durations[Math.floor(durations.length * 0.99)],
        };
      },

      getOperationNames(): string[] {
        return Array.from(new Set(operations.map(op => op.name)));
      },

      clear(): void {
        operations.length = 0;
      },
    };
  },

  /**
   * Measure async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    monitor?: ReturnType<typeof performance.createMonitor>,
  ): Promise<{ result: T; duration: number }> {
    const timer = this.createTimer();

    try {
      const result = await operation();
      const duration = timer.stop();

      if (monitor) {
        monitor.record(name, duration);
      }

      return { result, duration };
    } catch (error) {
      const duration = timer.stop();

      if (monitor) {
        monitor.record(`${name}_error`, duration);
      }

      throw error;
    }
  },
};

/**
 * Debug utilities
 */
export const debug = {
  /**
   * Create debug logger
   */
  createLogger(namespace: string, enabled = false) {
    return {
      log: enabled
        ? (message: string, data?: any) => console.log(`[${namespace}] ${message}`, data)
        : () => {},

      warn: enabled
        ? (message: string, data?: any) => console.warn(`[${namespace}] ${message}`, data)
        : () => {},

      error: enabled
        ? (message: string, data?: any) => console.error(`[${namespace}] ${message}`, data)
        : () => {},
    };
  },

  /**
   * Pretty print Firestore data
   */
  prettyPrint(data: any, indent = 2): string {
    return JSON.stringify(dataTransforms.convertTimestamps(data), null, indent);
  },

  /**
   * Create operation tracer
   */
  createTracer() {
    const traces: Array<{
      operation: string;
      startTime: number;
      endTime?: number;
      duration?: number;
      error?: string;
    }> = [];

    return {
      start(operation: string): string {
        const traceId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        traces.push({
          operation: traceId,
          startTime: Date.now(),
        });
        return traceId;
      },

      end(traceId: string, error?: Error): void {
        const trace = traces.find(t => t.operation === traceId);
        if (trace) {
          trace.endTime = Date.now();
          trace.duration = trace.endTime - trace.startTime;
          if (error) {
            trace.error = error.message;
          }
        }
      },

      getTraces(): typeof traces {
        return [...traces];
      },

      clear(): void {
        traces.length = 0;
      },
    };
  },
};

/**
 * Safe operation wrapper
 */
export async function safeOperation<T>(
  operation: () => Promise<T>,
  fallback?: T,
): Promise<FirestoreResult<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    if (fallback !== undefined) {
      return { success: true, data: fallback };
    }

    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Compose multiple operations
 */
export function composeOperations<T>(...operations: Array<(input: T) => Promise<T> | T>) {
  return async (input: T): Promise<T> => {
    let result = input;

    for (const operation of operations) {
      result = await operation(result);
    }

    return result;
  };
}

/**
 * Create middleware pipeline
 */
export function createMiddleware<T, R>() {
  const middlewares: Array<(input: T, next: () => Promise<R>) => Promise<R>> = [];

  return {
    use(middleware: (input: T, next: () => Promise<R>) => Promise<R>): void {
      middlewares.push(middleware);
    },

    async execute(input: T, finalHandler: (input: T) => Promise<R>): Promise<R> {
      let index = 0;

      const next = async (): Promise<R> => {
        if (index >= middlewares.length) {
          return finalHandler(input);
        }

        const middleware = middlewares[index++];
        return middleware(input, next);
      };

      return next();
    },
  };
}
