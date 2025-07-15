/**
 * Advanced safe JSON stringification with circular reference handling,
 * size limits, and performance optimizations.
 * Consolidates all variations found across agent files.
 */

export interface SafeStringifyOptions {
  maxLength?: number;
  prettify?: boolean;
  includeMetadata?: boolean;
}

export interface SafeStringifyResult {
  content: string;
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
  private prettify: boolean;
  private includeMetadata: boolean;
  private circularRefsMap: WeakMap<object, boolean>;
  private circularRefCount: number;

  constructor(options: SafeStringifyOptions = {}) {
    this.maxLength = options.maxLength || 75000;
    this.prettify = options.prettify || false;
    this.includeMetadata = options.includeMetadata || false;
    this.circularRefsMap = new WeakMap();
    this.circularRefCount = 0;
  }

  stringify(obj: any, options: SafeStringifyOptions = {}): SafeStringifyResult {
    const maxLength = options.maxLength ?? this.maxLength;
    const prettify = options.prettify ?? this.prettify;
    const includeMetadata = options.includeMetadata ?? this.includeMetadata;
    
    const startTime = performance.now();
    
    this.circularRefCount = 0;
    this.circularRefsMap = new WeakMap();
    
    try {
      const result = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (this.circularRefsMap.has(value)) {
            this.circularRefCount++;
            return '[Circular Reference]';
          }
          this.circularRefsMap.set(value, true);
        }
        return value;
      }, prettify ? 2 : 0);

      const truncated = result.length > maxLength 
        ? result.substring(0, maxLength) + '...[truncated]'
        : result;

      const metadata = includeMetadata ? {
        executionTime: performance.now() - startTime,
        originalLength: result.length,
        truncated: result.length > maxLength,
        circularRefs: this.circularRefCount,
        memoryUsage: process.memoryUsage().heapUsed
      } : undefined;

      return {
        content: truncated,
        metadata
      };
    } catch (error) {
      return {
        content: `[Stringify Error: ${(error as Error).message}]`,
        error: true,
        metadata: includeMetadata ? {
          executionTime: performance.now() - startTime,
          originalLength: 0,
          truncated: false,
          circularRefs: 0,
          memoryUsage: process.memoryUsage().heapUsed,
          errorType: (error as Error).name
        } : undefined
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
  return result.content;
}

/**
 * Enhanced safeStringify with all options exposed
 */
export function safeStringifyAdvanced(obj: any, options: SafeStringifyOptions = {}): SafeStringifyResult {
  const stringifier = new SafeStringifier(options);
  return stringifier.stringify(obj);
}