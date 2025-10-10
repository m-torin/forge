/**
 * Client-side Upstash Vector functionality
 * Browser-compatible vector operations
 */

import { getDefaultConfig, validateConfig } from './config';
import type {
  AIModelConfig,
  AIProvider,
  EmbeddingResult,
  SimilarityResult,
  SimilaritySearchOptions,
  UpstashVectorConfig,
  VectorIndexStats,
  VectorQuery,
  VectorRecord,
  VectorResult,
} from './types';

/**
 * Browser-compatible Vector client (limited functionality)
 * Uses Upstash Vector REST API for browser compatibility
 */
class BrowserVectorClient {
  private config: UpstashVectorConfig;
  private baseUrl: string;

  constructor(config: Partial<UpstashVectorConfig> = {}) {
    const defaultConfig = getDefaultConfig();
    this.config = { ...defaultConfig, ...config } as UpstashVectorConfig;
    if (!this.config.url || !this.config.token) {
      throw new Error('Upstash Vector URL and token are required');
    }
    this.baseUrl = this.config.url.replace('/v1', '').replace(/\/$/, '');
  }

  /**
   * Make authenticated request to Upstash Vector REST API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Vector API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Upsert vectors
   */
  async upsert<T extends Record<string, any> = Record<string, any>>(
    vectors: VectorRecord<T>[],
  ): Promise<void> {
    await this.makeRequest('/upsert', {
      method: 'POST',
      body: JSON.stringify({ vectors }),
    });
  }

  /**
   * Query vectors
   */
  async query<T extends Record<string, any> = Record<string, any>>(
    options: VectorQuery,
  ): Promise<SimilarityResult<T>[]> {
    if (options.data && !options.vector) {
      throw new Error(
        'Text embedding not supported in browser client. Use vector directly or server-side client.',
      );
    }

    const result = await this.makeRequest('/query', {
      method: 'POST',
      body: JSON.stringify({
        vector: options.vector,
        topK: options.topK || 10,
        includeMetadata: options.includeMetadata !== false,
        includeVectors: options.includeVectors || false,
        includeData: options.includeData !== false,
        filter: options.filter,
        namespace: options.namespace,
      }),
    });

    return result.matches || [];
  }

  /**
   * Fetch vectors by IDs
   */
  async fetch<T extends Record<string, any> = Record<string, any>>(
    ids: string[],
    namespace?: string,
  ): Promise<VectorRecord<T>[]> {
    const params = new URLSearchParams({ ids: ids.join(',') });
    if (namespace) params.set('namespace', namespace);

    const result = await this.makeRequest(`/fetch?${params.toString()}`);

    return Object.entries(result.vectors || {}).map(([id, vector]: [string, any]) => ({
      id,
      vector: vector.values || [],
      metadata: vector.metadata,
      data: vector.data,
    }));
  }

  /**
   * Delete vectors
   */
  async delete(ids: string[], namespace?: string): Promise<void> {
    await this.makeRequest('/delete', {
      method: 'POST',
      body: JSON.stringify({
        ids,
        namespace,
      }),
    });
  }

  /**
   * Similarity search with vector
   */
  async similaritySearch<T extends Record<string, any> = Record<string, any>>(
    vector: number[],
    options: SimilaritySearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    return this.query({
      vector,
      topK: options.topK,
      filter: options.filter,
      includeVectors: options.includeVectors,
      includeMetadata: options.includeMetadata,
      includeData: options.includeData,
      namespace: options.namespace,
    });
  }

  /**
   * Get index information
   */
  async info(): Promise<VectorIndexStats> {
    const result = await this.makeRequest('/describe');

    return {
      vectorCount: result.vectorCount || 0,
      pendingVectorCount: result.pendingVectorCount || 0,
      indexSize: result.indexSize || 0,
      dimension: result.dimension || 0,
      similarityFunction: result.similarityFunction || 'cosine',
      namespaces: result.namespaces || {},
    };
  }

  /**
   * Reset index (browser warning)
   */
  async reset(): Promise<void> {
    if (!confirm('Are you sure you want to reset the vector index? This cannot be undone.')) {
      throw new Error('Reset cancelled by user');
    }

    await this.makeRequest('/reset', { method: 'POST' });
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      await this.makeRequest('/ping');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Client-side caching layer for vectors
 */
class VectorCache {
  private cache = new Map<string, any>();
  private ttl = new Map<string, number>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, value: any, ttlMs = 5 * 60 * 1000): void {
    // Remove oldest entries if at max size
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.ttl.delete(oldestKey);
    }

    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key: string): any | null {
    const expiry = this.ttl.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  clear(): void {
    this.cache.clear();
    this.ttl.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Browser-optimized vector operations
 */
export class ClientVectorOperations {
  private client: BrowserVectorClient;
  private cache: VectorCache;

  constructor(config: Partial<UpstashVectorConfig> = {}) {
    this.client = new BrowserVectorClient(config);
    this.cache = new VectorCache();
  }

  /**
   * Cached similarity search
   */
  async cachedSimilaritySearch<T = any>(
    vector: number[],
    options: SimilaritySearchOptions & { useCache?: boolean } = {},
  ): Promise<SimilarityResult<T>[]> {
    const cacheKey = `search:${JSON.stringify({ vector: vector.slice(0, 5), ...options })}`;

    if (options.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const results = await this.client.similaritySearch<T>(vector, options);

    if (options.useCache !== false) {
      this.cache.set(cacheKey, results);
    }

    return results;
  }

  /**
   * Batch operations with progress tracking
   */
  async batchUpsert<T = any>(
    vectors: VectorRecord<T>[],
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
    } = {},
  ): Promise<void> {
    const { batchSize = 100, onProgress } = options;
    const batches = [];

    for (let i = 0; i < vectors.length; i += batchSize) {
      batches.push(vectors.slice(i, i + batchSize));
    }

    for (let i = 0; i < batches.length; i++) {
      await this.client.upsert(batches[i]);

      if (onProgress) {
        onProgress((i + 1) * batchSize, vectors.length);
      }
    }
  }

  /**
   * Search with client-side filtering
   */
  async searchWithFilter<T = any>(
    vector: number[],
    filterFn: (result: SimilarityResult<T>) => boolean,
    options: SimilaritySearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    // Get more results to account for filtering
    const searchOptions = {
      ...options,
      topK: (options.topK || 10) * 3,
    };

    const results = await this.client.similaritySearch<T>(vector, searchOptions);
    const filtered = results.filter(filterFn);

    return filtered.slice(0, options.topK || 10);
  }

  /**
   * Get client instance
   */
  getClient(): BrowserVectorClient {
    return this.client;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Safe client operation wrapper
 */
export async function safeClientOperation<T>(
  operation: () => Promise<T>,
): Promise<VectorResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Create browser vector client
 */
export function createClient(config?: Partial<UpstashVectorConfig>): BrowserVectorClient {
  return new BrowserVectorClient(config);
}

/**
 * Create client operations helper
 */
export function createClientOperations(
  config?: Partial<UpstashVectorConfig>,
): ClientVectorOperations {
  return new ClientVectorOperations(config);
}

/**
 * Browser vector similarity utilities
 */
export const vectorUtils = {
  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
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
  },

  /**
   * Calculate Euclidean distance
   */
  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(sum);
  },

  /**
   * Normalize vector to unit length
   */
  normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude === 0 ? vector : vector.map(val => val / magnitude);
  },

  /**
   * Check if browser supports required features
   */
  browserSupport(): {
    fetch: boolean;
    localStorage: boolean;
    webWorkers: boolean;
  } {
    return {
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
    };
  },
};

// Default client
let defaultClient: BrowserVectorClient | null = null;

/**
 * Get or create default client
 */
export function getClient(config?: Partial<UpstashVectorConfig>): BrowserVectorClient {
  if (!defaultClient || config) {
    defaultClient = createClient(config);
  }
  return defaultClient;
}

// Re-export types
export { getDefaultConfig, validateConfig };
export type {
  AIModelConfig,
  AIProvider,
  EmbeddingResult,
  SimilarityResult,
  UpstashVectorConfig,
  VectorRecord,
  VectorResult,
};
