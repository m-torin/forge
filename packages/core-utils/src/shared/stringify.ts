/**
 * Pure, environment-neutral JSON stringification utilities
 * Safe for browser, edge, and Node.js environments
 */

export interface SafeStringifyOptions {
  maxLength?: number;
  maxDepth?: number;
  prettify?: boolean;
}

/**
 * Safe JSON stringification with circular reference handling and size limits
 * Pure implementation without Node.js dependencies
 */
export function safeStringify(obj: any, maxLength = 75000): string {
  const startTime = performance.now();
  let circularRefsMap = new WeakMap<object, boolean>();
  let circularRefCount = 0;
  const maxDepth = 20;

  try {
    if (obj === undefined) {
      return '"[undefined]"';
    }

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
        if (circularRefsMap.has(value)) {
          circularRefCount++;
          return '[Circular Reference]';
        }
        circularRefsMap.set(value, true);

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

    const processedObj = customStringify(obj);
    const result = JSON.stringify(processedObj, null, 0);

    return result.length > maxLength ? result.substring(0, maxLength) + '...[Truncated]' : result;
  } catch (error) {
    return `[Stringify Error: ${(error as Error).message}]`;
  }
}

/**
 * Advanced safe stringify with all options exposed (pure version)
 */
export function safeStringifyPure(
  obj: any,
  options: SafeStringifyOptions = {},
): {
  result: string;
  metadata?: {
    executionTime: number;
    originalLength: number;
    truncated: boolean;
    circularRefs: number;
  };
} {
  const { maxLength = 75000, maxDepth = 20, prettify = false } = options;
  const startTime = performance.now();
  let circularRefsMap = new WeakMap<object, boolean>();
  let circularRefCount = 0;

  try {
    if (obj === undefined) {
      const result = '"[undefined]"';
      return {
        result,
        metadata: {
          executionTime: performance.now() - startTime,
          originalLength: result.length,
          truncated: false,
          circularRefs: 0,
        },
      };
    }

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
        if (circularRefsMap.has(value)) {
          circularRefCount++;
          return '[Circular Reference]';
        }
        circularRefsMap.set(value, true);

        if (value instanceof Date) {
          return value.toISOString();
        }

        if (value instanceof RegExp) {
          return value.toString();
        }

        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }

        if (value instanceof Map) {
          const mapObj: any = {};
          for (const [k, v] of value.entries()) {
            mapObj[k] = customStringify(v, depth + 1);
          }
          return mapObj;
        }

        if (value instanceof Set) {
          return Array.from(value).map(v => customStringify(v, depth + 1));
        }

        if (value instanceof WeakMap) {
          return '[WeakMap]';
        }
        if (value instanceof WeakSet) {
          return '[WeakSet]';
        }

        if (Array.isArray(value)) {
          return value.map(v => customStringify(v, depth + 1));
        }

        const result: any = {};
        for (const key of Object.keys(value)) {
          result[key] = customStringify(value[key], depth + 1);
        }

        for (const sym of Object.getOwnPropertySymbols(value)) {
          result[sym.toString()] = customStringify(value[sym], depth + 1);
        }

        return result;
      }

      return value;
    };

    const processedObj = customStringify(obj);
    const result = JSON.stringify(processedObj, null, prettify ? 2 : 0);

    const truncated =
      result.length > maxLength ? result.substring(0, maxLength) + '...[Truncated]' : result;

    return {
      result: truncated,
      metadata: {
        executionTime: performance.now() - startTime,
        originalLength: result.length,
        truncated: result.length > maxLength,
        circularRefs: circularRefCount,
      },
    };
  } catch (error) {
    const errorMessage = `[Stringify Error: ${(error as Error).message}]`;
    return {
      result: errorMessage,
      metadata: {
        executionTime: performance.now() - startTime,
        originalLength: 0,
        truncated: false,
        circularRefs: 0,
      },
    };
  }
}
