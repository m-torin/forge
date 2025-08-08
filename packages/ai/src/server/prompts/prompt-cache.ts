/**
 * Prompt Caching System
 * Efficient caching for prompts and responses
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
import { createHash } from 'node:crypto';

/**
 * Prompt cache entry
 */
export interface PromptCacheEntry {
  key: string;
  prompt: string;
  response?: any;
  metadata: {
    model?: string;
    temperature?: number;
    maxOutputTokens?: number;
    timestamp: number;
    hits: number;
    lastAccessed: number;
  };
  ttl?: number;
}

/**
 * Prompt cache configuration
 */
export interface PromptCacheConfig {
  maxSize?: number;
  defaultTTL?: number;
  evictionPolicy?: 'lru' | 'lfu' | 'fifo';
  persistToFile?: string;
}

/**
 * In-memory prompt cache implementation
 */
export class PromptCache {
  private cache: Map<string, PromptCacheEntry> = new Map();
  private accessOrder: string[] = [];
  private readonly config: Required<PromptCacheConfig>;

  constructor(config: PromptCacheConfig = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      defaultTTL: config.defaultTTL || 3600000, // 1 hour
      evictionPolicy: config.evictionPolicy || 'lru',
      persistToFile: config.persistToFile || '',
    };
  }

  /**
   * Generate cache key from prompt and parameters
   */
  generateKey(
    prompt: string,
    params?: {
      model?: string;
      temperature?: number;
      maxOutputTokens?: number;
      [key: string]: any;
    },
  ): string {
    const data = JSON.stringify({ prompt, ...params });
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached prompt response
   */
  get(key: string): PromptCacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check TTL
    if (entry.ttl && Date.now() - entry.metadata.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access metadata
    entry.metadata.hits++;
    entry.metadata.lastAccessed = Date.now();

    // Update access order for LRU
    if (this.config.evictionPolicy === 'lru') {
      this.updateAccessOrder(key);
    }

    logInfo('Prompt Cache: Hit', {
      operation: 'prompt_cache_hit',
      metadata: {
        key,
        hits: entry.metadata.hits,
      },
    });

    return entry;
  }

  /**
   * Set cached prompt response
   */
  set(
    key: string,
    prompt: string,
    response?: any,
    metadata?: Partial<PromptCacheEntry['metadata']>,
    ttl?: number,
  ): void {
    // Check cache size and evict if necessary
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    const entry: PromptCacheEntry = {
      key,
      prompt,
      response,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        hits: 0,
        lastAccessed: Date.now(),
      },
      ttl: ttl || this.config.defaultTTL,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);

    logInfo('Prompt Cache: Set', {
      operation: 'prompt_cache_set',
      metadata: {
        key,
        ttl: entry.ttl,
      },
    });
  }

  /**
   * Remove entry from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];

    logInfo('Prompt Cache: Cleared', {
      operation: 'prompt_cache_clear',
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    evictions: number;
    avgHitRate: number;
  } {
    let totalHits = 0;
    let totalAccesses = 0;

    this.cache.forEach(entry => {
      totalHits += entry.metadata.hits;
      totalAccesses += entry.metadata.hits + 1; // +1 for initial set
    });

    return {
      size: this.cache.size,
      hits: totalHits,
      misses: totalAccesses - totalHits,
      evictions: 0, // Would need to track this
      avgHitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
    };
  }

  /**
   * Evict entries based on policy
   */
  private evict(): void {
    let keyToEvict: string | undefined;

    switch (this.config.evictionPolicy) {
      case 'lru':
        keyToEvict = this.accessOrder[0];
        break;

      case 'lfu':
        keyToEvict = this.findLeastFrequentlyUsed();
        break;

      case 'fifo':
        keyToEvict = this.accessOrder[0];
        break;
    }

    if (keyToEvict) {
      this.delete(keyToEvict);

      logWarn('Prompt Cache: Evicted entry', {
        operation: 'prompt_cache_evict',
        metadata: {
          key: keyToEvict,
          policy: this.config.evictionPolicy,
        },
      });
    }
  }

  /**
   * Find least frequently used key
   */
  private findLeastFrequentlyUsed(): string | undefined {
    let minHits = Infinity;
    let lfuKey: string | undefined;

    this.cache.forEach((entry, key) => {
      if (entry.metadata.hits < minHits) {
        minHits = entry.metadata.hits;
        lfuKey = key;
      }
    });

    return lfuKey;
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }
}

/**
 * Global prompt cache instance
 */
export const globalPromptCache = new PromptCache();

/**
 * Prompt cache decorator
 */
export function withPromptCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
    cache?: PromptCache;
  },
): T {
  const cache = options?.cache || globalPromptCache;

  return (async (...args: Parameters<T>) => {
    // Generate cache key
    const key = options?.keyGenerator
      ? options.keyGenerator(...args)
      : cache.generateKey(JSON.stringify(args));

    // Check cache
    const cached = cache.get(key);
    if (cached?.response) {
      return cached.response;
    }

    // Execute function
    const result = await fn(...args);

    // Cache result
    cache.set(key, JSON.stringify(args), result, undefined, options?.ttl);

    return result;
  }) as T;
}

/**
 * Cache patterns for common use cases
 */
export const promptCachePatterns = {
  /**
   * Semantic similarity cache
   */
  createSemanticCache: (
    similarityThreshold = 0.9,
    embedFunction: (text: string) => Promise<number[]>,
  ) => {
    const embeddings = new Map<string, number[]>();
    const cache = new PromptCache();

    return {
      async get(prompt: string): Promise<PromptCacheEntry | null> {
        const promptEmbedding = await embedFunction(prompt);

        // Find similar prompts
        for (const [key, cachedEmbedding] of embeddings) {
          const similarity = cosineSimilarity(promptEmbedding, cachedEmbedding);
          if (similarity >= similarityThreshold) {
            return cache.get(key);
          }
        }

        return null;
      },

      async set(
        prompt: string,
        response: any,
        metadata?: Partial<PromptCacheEntry['metadata']>,
      ): Promise<void> {
        const key = cache.generateKey(prompt);
        const embedding = await embedFunction(prompt);

        embeddings.set(key, embedding);
        cache.set(key, prompt, response, metadata);
      },
    };
  },

  /**
   * Tiered cache with different TTLs
   */
  createTieredCache: (tiers: Array<{ pattern: RegExp; ttl: number }>) => {
    const cache = new PromptCache();

    return {
      set(prompt: string, response: any): void {
        const key = cache.generateKey(prompt);

        // Find matching tier
        const tier = tiers.find(t => t.pattern.test(prompt));
        const ttl = tier?.ttl || cache['config'].defaultTTL;

        cache.set(key, prompt, response, undefined, ttl);
      },

      get(prompt: string): PromptCacheEntry | null {
        const key = cache.generateKey(prompt);
        return cache.get(key);
      },
    };
  },
};

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
