/**
 * Advanced safe JSON stringification with circular reference handling,
 * size limits, and performance optimizations.
 * Enhanced with Node.js 22+ streaming capabilities and structured clone for large objects.
 * Consolidates all variations found across agent files.
 */

import { throwIfAborted } from './abort-support';
import { enhancedClone, isStructuredCloneAvailable } from './structured-clone';

export interface SafeStringifyOptions {
  maxLength?: number;
  maxDepth?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
  streaming?: boolean;
  chunkSize?: number;
  signal?: AbortSignal;
  useStructuredClone?: boolean;
  preprocessClone?: boolean;
}

export interface SafeStringifyResult {
  result: string;
  content?: string;
  metadata?: {
    executionTime: number;
    originalLength: number;
    truncated: boolean;
    circularRefs: number;
    memoryUsage: number;
    errorType?: string;
  };
  error?: boolean;
}

export interface StreamingStringifyChunk {
  chunk: string;
  bytesProcessed: number;
  totalBytes?: number;
  progress: number;
  isComplete: boolean;
}

export class SafeStringifier {
  private maxLength: number;
  private maxDepth: number;
  private prettify: boolean;
  private includeMetadata: boolean;
  private circularRefsMap: WeakMap<object, boolean>;
  private circularRefCount: number;

  constructor(options: SafeStringifyOptions = {}) {
    this.maxLength = options.maxLength || 75000;
    this.maxDepth = options.maxDepth || 20;
    this.prettify = options.prettify || false;
    this.includeMetadata = options.includeMetadata || false;
    this.circularRefsMap = new WeakMap();
    this.circularRefCount = 0;
  }

  stringify(obj: any, options: SafeStringifyOptions = {}): SafeStringifyResult {
    const maxLength = options.maxLength ?? this.maxLength;
    const maxDepth = options.maxDepth ?? this.maxDepth;
    const prettify = options.prettify ?? this.prettify;
    const includeMetadata = options.includeMetadata ?? this.includeMetadata;
    const useStructuredClone = options.useStructuredClone !== false && isStructuredCloneAvailable();
    const preprocessClone = options.preprocessClone && useStructuredClone;

    const startTime = performance.now();

    this.circularRefCount = 0;
    this.circularRefsMap = new WeakMap();

    try {
      // Preprocessing with structured clone for better performance
      let processedObj = obj;
      if (preprocessClone && typeof obj === 'object' && obj !== null) {
        try {
          const cloneResult = enhancedClone(obj, {
            fallbackToJson: false, // Don't fallback to JSON as we'll handle that ourselves
            trackPerformance: false,
          });

          if (cloneResult.method === 'structuredClone') {
            processedObj = cloneResult.data;
          }
        } catch {
          // If structured clone fails, continue with original object
          processedObj = obj;
        }
      }
      // Handle undefined specially for legacy compatibility
      if (processedObj === undefined) {
        const result = '"[undefined]"';
        return {
          result,
          content: result,
          metadata: includeMetadata
            ? {
                executionTime: performance.now() - startTime,
                originalLength: result.length,
                truncated: false,
                circularRefs: 0,
                memoryUsage: process.memoryUsage().heapUsed,
              }
            : undefined,
        };
      }

      // Pre-access check for problematic getters
      if (typeof processedObj === 'object' && processedObj !== null) {
        // Try to access all own property descriptors to trigger any problematic getters
        const descriptors = Object.getOwnPropertyDescriptors(processedObj);
        for (const [propKey, descriptor] of Object.entries(descriptors)) {
          if (descriptor.get && descriptor.enumerable === false) {
            // Try to access non-enumerable getters to trigger errors
            processedObj[propKey];
          }
        }
      }

      const self = this;

      // Custom stringify function to handle all edge cases
      const customStringify = (value: any, depth = 0): any => {
        if (depth > maxDepth) {
          return '[Max Depth Exceeded]';
        }

        if (value === undefined) {
          return '[undefined]';
        }

        if (value === null) {
          return null;
        }

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          return value;
        }

        if (typeof value === 'symbol') {
          return value.toString();
        }

        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }

        if (typeof value === 'object') {
          // Check for circular references
          if (self.circularRefsMap.has(value)) {
            self.circularRefCount++;
            return '[Circular Reference]';
          }
          self.circularRefsMap.set(value, true);

          // Handle Buffer
          if (Buffer.isBuffer(value)) {
            return `[Buffer: ${value.toString('utf8')}]`;
          }

          // Handle Date
          if (value instanceof Date) {
            return value.toISOString();
          }

          // Handle RegExp
          if (value instanceof RegExp) {
            return value.toString();
          }

          // Handle Error
          if (value instanceof Error) {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
            };
          }

          // Handle Map
          if (value instanceof Map) {
            const mapObj: any = {};
            for (const [k, v] of value.entries()) {
              mapObj[k] = customStringify(v, depth + 1);
            }
            return mapObj;
          }

          // Handle Set
          if (value instanceof Set) {
            return Array.from(value).map(v => customStringify(v, depth + 1));
          }

          // Handle WeakMap and WeakSet
          if (value instanceof WeakMap) {
            return '[WeakMap]';
          }
          if (value instanceof WeakSet) {
            return '[WeakSet]';
          }

          // Handle arrays
          if (Array.isArray(value)) {
            return value.map(v => customStringify(v, depth + 1));
          }

          // Handle plain objects (including symbol properties)
          const result: any = {};

          // Get string keys
          for (const key of Object.keys(value)) {
            result[key] = customStringify(value[key], depth + 1);
          }

          // Get symbol keys
          for (const sym of Object.getOwnPropertySymbols(value)) {
            result[sym.toString()] = customStringify(value[sym], depth + 1);
          }

          return result;
        }

        return value;
      };

      const finalObj = customStringify(processedObj);
      const result = JSON.stringify(finalObj, null, prettify ? 2 : 0);

      const truncated =
        result.length > maxLength ? result.substring(0, maxLength) + '...[Truncated]' : result;

      const metadata = includeMetadata
        ? {
            executionTime: performance.now() - startTime,
            originalLength: result.length,
            truncated: result.length > maxLength,
            circularRefs: this.circularRefCount,
            memoryUsage: process.memoryUsage().heapUsed,
          }
        : undefined;

      return {
        result: truncated,
        content: truncated,
        metadata,
      };
    } catch (error) {
      const errorMessage = `[Stringify Error: ${(error as Error).message}]`;
      return {
        result: errorMessage,
        content: errorMessage,
        error: true,
        metadata: includeMetadata
          ? {
              executionTime: performance.now() - startTime,
              originalLength: 0,
              truncated: false,
              circularRefs: 0,
              memoryUsage: process.memoryUsage().heapUsed,
              errorType: (error as Error).name,
            }
          : undefined,
      };
    }
  }

  // Node.js 22+ Streaming JSON stringify using AsyncGenerator
  async *streamStringify(
    obj: any,
    options: SafeStringifyOptions & { chunkSize?: number; signal?: AbortSignal } = {},
  ): AsyncGenerator<StreamingStringifyChunk, void, unknown> {
    const { chunkSize = 1000, signal, ...stringifyOptions } = options;
    const startTime = performance.now();

    let bytesProcessed = 0;
    let circularRefCount = 0;
    const circularRefsMap = new WeakMap<object, boolean>();

    // Helper function to process objects/arrays incrementally
    const streamProcess = async function* (
      value: any,
      depth = 0,
      currentChunk = '',
    ): AsyncGenerator<string, void, unknown> {
      throwIfAborted(signal);

      if (depth > (stringifyOptions.maxDepth ?? 20)) {
        yield '[Max Depth Exceeded]';
        return;
      }

      if (value === null) {
        yield 'null';
        return;
      }

      if (value === undefined) {
        yield '"[undefined]"';
        return;
      }

      if (typeof value === 'string') {
        yield JSON.stringify(value);
        return;
      }

      if (typeof value === 'number' || typeof value === 'boolean') {
        yield String(value);
        return;
      }

      if (typeof value === 'object') {
        // Handle circular references
        if (circularRefsMap.has(value)) {
          circularRefCount++;
          yield '"[Circular Reference]"';
          return;
        }

        circularRefsMap.set(value, true);

        if (Array.isArray(value)) {
          yield '[';
          for (let i = 0; i < value.length; i++) {
            if (i > 0) yield ',';
            yield* streamProcess(value[i], depth + 1);

            // Yield control periodically
            if (i % 10 === 0) {
              await new Promise(resolve => setImmediate(resolve));
            }
          }
          yield ']';
        } else {
          yield '{';
          const entries = Object.entries(value);
          for (let i = 0; i < entries.length; i++) {
            const [key, val] = entries[i];
            if (i > 0) yield ',';
            yield `"${key}":`;
            yield* streamProcess(val, depth + 1);

            // Yield control periodically
            if (i % 5 === 0) {
              await new Promise(resolve => setImmediate(resolve));
            }
          }
          yield '}';
        }

        circularRefsMap.delete(value);
      } else {
        yield `"[${typeof value}]"`;
      }
    };

    try {
      let currentChunk = '';
      let isComplete = false;

      for await (const part of streamProcess(obj)) {
        currentChunk += part;
        bytesProcessed += Buffer.byteLength(part, 'utf8');

        // Emit chunk when it reaches the target size
        if (currentChunk.length >= chunkSize) {
          yield {
            chunk: currentChunk,
            bytesProcessed,
            progress: Math.min(
              99,
              Math.floor((bytesProcessed / (stringifyOptions.maxLength || 75000)) * 100),
            ),
            isComplete: false,
          };

          currentChunk = '';

          // Yield to event loop
          await new Promise(resolve => setImmediate(resolve));
        }

        // Check if we've exceeded max length
        if (stringifyOptions.maxLength && bytesProcessed > stringifyOptions.maxLength) {
          currentChunk += '...[truncated]';
          break;
        }
      }

      // Emit final chunk if there's remaining content
      if (currentChunk.length > 0 || bytesProcessed === 0) {
        yield {
          chunk: currentChunk || '""',
          bytesProcessed: bytesProcessed || 2,
          progress: 100,
          isComplete: true,
        };
      }
    } catch (error) {
      // Emit error chunk
      yield {
        chunk: `"[Stringify Error: ${error instanceof Error ? error.message : 'Unknown error'}]"`,
        bytesProcessed,
        progress: 100,
        isComplete: true,
      };
    }
  }
}

/**
 * Quick utility function that matches the original safeStringify pattern
 * used across agent files. Provides backward compatibility.
 */
export function safeStringify(obj: any, maxLength = 75000): string {
  const stringifier = new SafeStringifier({ maxLength });
  const result = stringifier.stringify(obj);
  return result.result;
}

/**
 * Enhanced safeStringify with all options exposed
 */
export function safeStringifyAdvanced(
  obj: any,
  options: SafeStringifyOptions = {},
): SafeStringifyResult {
  const stringifier = new SafeStringifier(options);
  return stringifier.stringify(obj);
}

/**
 * Node.js 22+ Streaming JSON stringify function
 * Returns an AsyncGenerator for processing large objects incrementally
 */
export function safeStringifyStream(
  obj: any,
  options: SafeStringifyOptions & { chunkSize?: number; signal?: AbortSignal } = {},
): AsyncGenerator<StreamingStringifyChunk, void, unknown> {
  const stringifier = new SafeStringifier(options);
  return stringifier.streamStringify(obj, options);
}
