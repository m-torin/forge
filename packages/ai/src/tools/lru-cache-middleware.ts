import type { LanguageModelV2Middleware, LanguageModelV2StreamPart } from '@ai-sdk/provider';
import { logDebug } from '@repo/observability';
import { simulateReadableStream } from 'ai';
import { LRUCache } from 'lru-cache';

/**
 * LRU Cache Middleware Factory for AI SDK v5
 * Provides in-memory caching using lru-cache package
 * Following package philosophy: light standardization without abstraction
 */

export interface LRUCacheOptions {
  maxSize: number;
  ttl: number;
  updateAgeOnGet?: boolean;
}

/**
 * Create LRU cache middleware with custom options
 * Supports both generateText and streamText operations
 */
interface CachedGenerateResult {
  response?: {
    timestamp?: Date | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function createLRUCacheMiddleware(options: LRUCacheOptions): LanguageModelV2Middleware {
  const cache = new LRUCache<string, CachedGenerateResult | LanguageModelV2StreamPart[]>(options);

  return {
    wrapGenerate: async (options: { doGenerate: () => PromiseLike<any>; params: any }) => {
      const { doGenerate, params } = options;
      const cacheKey = JSON.stringify(params);

      const cached = cache.get(cacheKey);
      if (cached) {
        logDebug('[AI LRU Cache] Generate cache hit:', cacheKey.slice(0, 100));
        // Type guard: check if cached is a result object (not array)
        if (Array.isArray(cached)) {
          // Handle stream parts array case
          return {
            content: [],
            finishReason: 'stop',
            usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
            warnings: [],
          } as any;
        }
        return {
          ...cached,
          response: {
            ...(cached as any).response,
            timestamp: (cached as any)?.response?.timestamp
              ? new Date((cached as any)?.response?.timestamp)
              : undefined,
          },
        };
      }

      logDebug('[AI LRU Cache] Generate cache miss, calling model');
      const result = await doGenerate();

      cache.set(cacheKey, result as CachedGenerateResult);
      return result;
    },

    wrapStream: async ({ doStream, params }) => {
      const cacheKey = JSON.stringify(params);

      const cached = cache.get(cacheKey);
      if (cached) {
        logDebug('[AI LRU Cache] Stream cache hit:', cacheKey.slice(0, 100));

        // Format timestamps and simulate stream replay
        const formattedChunks = (cached as LanguageModelV2StreamPart[]).map(part => {
          if (part.type === 'response-metadata' && part.timestamp) {
            return { ...part, timestamp: new Date(part.timestamp) };
          }
          return part;
        });

        return {
          stream: simulateReadableStream({
            initialDelayInMs: 0,
            chunkDelayInMs: 10,
            chunks: formattedChunks,
          }),
        };
      }

      logDebug('[AI LRU Cache] Stream cache miss, calling model');
      const { stream, ...rest } = await doStream();

      const fullResponse: LanguageModelV2StreamPart[] = [];

      const transformStream = new TransformStream<
        LanguageModelV2StreamPart,
        LanguageModelV2StreamPart
      >({
        transform(chunk, controller) {
          fullResponse.push(chunk);
          controller.enqueue(chunk);
        },
        flush() {
          cache.set(cacheKey, fullResponse);
          logDebug('[AI LRU Cache] Cached stream response');
        },
      });

      return {
        stream: stream.pipeThrough(transformStream),
        ...rest,
      };
    },
  };
}
