/**
 * Advanced Caching Middleware for AI SDK v5
 * Intelligent caching of model responses with TTL and invalidation strategies
 */

// Define middleware types locally since they may not be exported in current AI SDK v5 build
import { logInfo, logWarn } from '@repo/observability';
import { createHash } from 'crypto';
interface LanguageModelMiddleware {
  wrapGenerate?: (args: { doGenerate: any; params: any }) => Promise<any>;
  wrapStream?: (args: { doStream: any; params: any }) => Promise<any>;
}

export interface CacheEntry {
  result: any;
  timestamp: number;
  ttl: number;
  metadata?: {
    modelId?: string;
    promptHash?: string;
    tokenCount?: number;
  };
}

export interface CachingOptions {
  enabled?: boolean;
  ttl?: number;
  maxSize?: number;
  skipStreaming?: boolean;
  keyGenerator?: (params: any) => string;
  shouldCache?: (params: any, result?: any) => boolean;
  onHit?: (key: string, entry: CacheEntry) => void;
  onMiss?: (key: string) => void;
  onEvict?: (key: string, entry: CacheEntry) => void;
}

const defaultOptions: Required<CachingOptions> = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 1000,
  skipStreaming: true,
  keyGenerator: params => {
    // Create a hash from relevant parameters
    const keyData = {
      modelId: params.model?.modelId,
      prompt: params.prompt,
      messages: params.messages,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
      tools: params.tools ? Object.keys(params.tools) : undefined,
    };

    const hash = createHash('sha256').update(JSON.stringify(keyData)).digest('hex');

    return `ai-cache:${hash}`;
  },
  shouldCache: (params, result) => {
    // Don't cache if there were errors or tool calls
    if (result?.error || (result?.toolCalls && result.toolCalls.length > 0)) {
      return false;
    }

    // Don't cache very short responses (likely errors or incomplete)
    if (result?.text && result.text.length < 10) {
      return false;
    }

    return true;
  },
  onHit: () => {},
  onMiss: () => {},
  onEvict: () => {},
};

/**
 * In-memory cache implementation with LRU eviction
 */
class InMemoryCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;

  constructor(private maxSize: number) {}

  get(key: string): CacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check TTL
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return undefined;
    }

    // Update access order
    this.accessOrder.set(key, ++this.accessCounter);
    return entry;
  }

  set(key: string, entry: CacheEntry, onEvict?: (key: string, entry: CacheEntry) => void): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        const evictedEntry = this.cache.get(oldestKey);
        this.cache.delete(oldestKey);
        this.accessOrder.delete(oldestKey);
        if (onEvict && evictedEntry) {
          onEvict(oldestKey, evictedEntry);
        }
      }
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
  }

  delete(key: string): boolean {
    this.accessOrder.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  size(): number {
    return this.cache.size;
  }

  private findOldestKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestAccess = Infinity;

    for (const [key, access] of this.accessOrder.entries()) {
      if (access < oldestAccess) {
        oldestAccess = access;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{ key: string; timestamp: number; ttl: number }>;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
      })),
    };
  }
}

/**
 * Create caching middleware for AI model interactions
 */
export function createCachingMiddleware(options: CachingOptions = {}): LanguageModelMiddleware {
  const opts = { ...defaultOptions, ...options };

  if (!opts.enabled) {
    return {};
  }

  const cache = new InMemoryCache(opts.maxSize);

  return {
    wrapGenerate: async ({ doGenerate, params }) => {
      // Generate cache key
      const cacheKey = opts.keyGenerator(params);

      // Check cache first
      const cachedEntry = cache.get(cacheKey);
      if (cachedEntry) {
        opts.onHit(cacheKey, cachedEntry);
        return cachedEntry.result;
      }

      opts.onMiss(cacheKey);

      // Generate new result
      const result = await doGenerate();

      // Cache the result if it meets criteria
      if (opts.shouldCache(params, result)) {
        const entry: CacheEntry = {
          result,
          timestamp: Date.now(),
          ttl: opts.ttl,
          metadata: {
            modelId: params.model?.modelId,
            promptHash: createHash('sha256')
              .update(params.prompt || '')
              .digest('hex')
              .slice(0, 8),
            tokenCount: result.usage?.totalTokens,
          },
        };

        cache.set(cacheKey, entry, opts.onEvict);
      }

      return result;
    },

    // Note: Streaming is typically not cached due to its dynamic nature
    // But we can provide a hook for custom streaming cache strategies
    wrapStream: opts.skipStreaming
      ? undefined
      : async ({ doStream, params }) => {
          // For streaming, we might cache the final accumulated result
          const cacheKey = opts.keyGenerator(params);
          let accumulatedText = '';
          let finalResult: any = null;

          const streamResult = await doStream();
          const transformedStream = streamResult.stream.pipeThrough(
            new TransformStream({
              transform(chunk, controller) {
                if (chunk.type === 'text-delta' && chunk.delta) {
                  accumulatedText += chunk.delta;
                } else if (chunk.type === 'finish') {
                  finalResult = chunk;
                }
                controller.enqueue(chunk);
              },

              flush() {
                // Cache the accumulated result
                if (
                  finalResult &&
                  accumulatedText &&
                  opts.shouldCache(params, { text: accumulatedText, ...finalResult })
                ) {
                  const entry: CacheEntry = {
                    result: { text: accumulatedText, ...finalResult },
                    timestamp: Date.now(),
                    ttl: opts.ttl,
                    metadata: {
                      modelId: params.model?.modelId,
                      promptHash: createHash('sha256')
                        .update(params.prompt || '')
                        .digest('hex')
                        .slice(0, 8),
                    },
                  };

                  cache.set(cacheKey, entry, opts.onEvict);
                }
              },
            }),
          );

          return {
            stream: transformedStream,
            warnings: await streamResult.warnings,
          };
        },
  };
}

/**
 * Pre-configured caching middleware for different use cases
 */
export const cachingMiddleware = {
  /**
   * Short-term caching for rapid iterations
   */
  shortTerm: () =>
    createCachingMiddleware({
      ttl: 2 * 60 * 1000, // 2 minutes
      maxSize: 100,
    }),

  /**
   * Long-term caching for stable content
   */
  longTerm: () =>
    createCachingMiddleware({
      ttl: 60 * 60 * 1000, // 1 hour
      maxSize: 500,
    }),

  /**
   * Development caching with detailed logging
   */
  development: () =>
    createCachingMiddleware({
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 50,
      onHit: (key, entry) => {
        logInfo(`[Cache HIT] ${key.slice(-8)} (age: ${Date.now() - entry.timestamp}ms)`);
      },
      onMiss: key => {
        logInfo(`[Cache MISS] ${key.slice(-8)}`);
      },
      onEvict: (key, entry) => {
        logWarn(`[Cache EVICT] ${key.slice(-8)} (age: ${Date.now() - entry.timestamp}ms)`);
      },
    }),

  /**
   * Aggressive caching for expensive models
   */
  aggressive: () =>
    createCachingMiddleware({
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      maxSize: 2000,
      skipStreaming: false,
    }),

  /**
   * Conservative caching that only caches successful, substantial responses
   */
  conservative: () =>
    createCachingMiddleware({
      ttl: 10 * 60 * 1000, // 10 minutes
      maxSize: 200,
      shouldCache: (params, result) => {
        // Only cache successful responses with substantial content
        return (
          !result?.error &&
          result?.text &&
          result.text.length > 100 &&
          !result.toolCalls?.length &&
          result.finishReason === 'stop'
        );
      },
    }),
} as const;

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Create a cache key from common parameters
   */
  createKey: (params: { model?: string; prompt?: string; temperature?: number }) => {
    const hash = createHash('sha256').update(JSON.stringify(params)).digest('hex');
    return `custom:${hash}`;
  },

  /**
   * Check if a response should be cached based on quality metrics
   */
  shouldCacheResponse: (result: any, minLength: number = 50) => {
    return (
      result &&
      !result.error &&
      result.text &&
      result.text.length >= minLength &&
      result.finishReason === 'stop'
    );
  },
} as const;
