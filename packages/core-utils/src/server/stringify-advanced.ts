/**
 * Advanced safe JSON stringification with Node.js-specific features
 * Includes memory usage tracking and Buffer handling
 * Server-only module - uses Node.js APIs
 */

export interface SafeStringifyOptions {
  maxLength?: number;
  maxDepth?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
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

    const startTime = performance.now();

    this.circularRefCount = 0;
    this.circularRefsMap = new WeakMap();

    try {
      // Handle undefined specially for legacy compatibility
      if (obj === undefined) {
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
      if (typeof obj === 'object' && obj !== null) {
        try {
          const descriptors = Object.getOwnPropertyDescriptors(obj);
          for (const [propKey, descriptor] of Object.entries(descriptors)) {
            if (descriptor.get && descriptor.enumerable === false) {
              // Try to access non-enumerable getters to trigger errors
              obj[propKey];
            }
          }
        } catch {
          // Ignore getter access errors
        }
      }

      const self = this;

      // Custom stringify function to handle all edge cases including Node.js specific types
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

          // Handle Buffer (Node.js specific)
          if (Buffer.isBuffer(value)) {
            try {
              return `[Buffer: ${value.toString('utf8', 0, Math.min(100, value.length))}${value.length > 100 ? '...' : ''}]`;
            } catch {
              return `[Buffer: ${value.length} bytes]`;
            }
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
            try {
              result[key] = customStringify(value[key], depth + 1);
            } catch (error) {
              result[key] = `[Property Error: ${(error as Error).message}]`;
            }
          }

          // Get symbol keys
          for (const sym of Object.getOwnPropertySymbols(value)) {
            try {
              result[sym.toString()] = customStringify(value[sym], depth + 1);
            } catch (error) {
              result[sym.toString()] = `[Symbol Property Error: ${(error as Error).message}]`;
            }
          }

          return result;
        }

        return value;
      };

      const processedObj = customStringify(obj);
      const result = JSON.stringify(processedObj, null, prettify ? 2 : 0);

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
}

/**
 * Advanced safeStringify with Node.js memory usage and Buffer support
 */
export function safeStringifyAdvanced(
  obj: any,
  options: SafeStringifyOptions = {},
): SafeStringifyResult {
  const stringifier = new SafeStringifier(options);
  return stringifier.stringify(obj, options);
}
