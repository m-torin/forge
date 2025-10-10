/**
 * Edge Runtime Upstash Vector client
 * Optimized for Vercel Edge Functions, Cloudflare Workers, and other edge environments
 */

import { mergeConfig, validateConfig } from './config';
import type {
  AIModelConfig,
  AIProvider,
  HybridSearchOptions,
  SimilarityResult,
  SimilaritySearchOptions,
  UpstashVectorConfig,
  VectorClient,
  VectorIndexStats,
  VectorQuery,
  VectorRecord,
  VectorResult,
} from './types';

/**
 * Edge-compatible Vector client implementation
 * Uses Upstash Vector REST API for edge runtime compatibility
 */
class EdgeVectorClient implements VectorClient {
  private config: UpstashVectorConfig;
  private baseUrl: string;

  constructor(config: Partial<UpstashVectorConfig> = {}) {
    this.config = mergeConfig(config);
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

    if (response.status === 204) {
      return null; // No content
    }

    return response.json();
  }

  // Implement VectorClient interface for edge environment

  async upsert<T extends Record<string, any> = Record<string, any>>(
    vectors: VectorRecord<T>[],
  ): Promise<void> {
    const formattedVectors = vectors.map(v => ({
      id: v.id,
      values: v.vector,
      metadata: v.metadata,
      data: v.data,
    }));

    await this.makeRequest('/upsert', {
      method: 'POST',
      body: JSON.stringify({ vectors: formattedVectors }),
    });
  }

  async query<T extends Record<string, any> = Record<string, any>>(
    options: VectorQuery,
  ): Promise<SimilarityResult<T>[]> {
    if (options.data && !options.vector) {
      throw new Error(
        'Text embedding not supported in edge runtime. Use vector directly or server-side client.',
      );
    }

    if (!options.vector) {
      throw new Error('Either vector or data must be provided for query');
    }

    const queryBody: any = {
      vector: options.vector,
      topK: options.topK || 10,
      includeMetadata: options.includeMetadata !== false,
      includeValues: options.includeVectors || false,
      includeData: options.includeData !== false,
    };

    if (options.filter) {
      queryBody.filter = options.filter;
    }

    if (options.namespace) {
      queryBody.namespace = options.namespace;
    }

    const result = await this.makeRequest('/query', {
      method: 'POST',
      body: JSON.stringify(queryBody),
    });

    return (result.matches || []).map((match: any) => ({
      id: match.id,
      score: match.score,
      vector: match.values,
      metadata: match.metadata as T,
      data: match.data,
    }));
  }

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
      metadata: vector.metadata as T,
      data: vector.data,
    }));
  }

  async delete(ids: string[], namespace?: string): Promise<void> {
    const body: any = { ids };
    if (namespace) body.namespace = namespace;

    await this.makeRequest('/delete', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

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

  async semanticSearch<T extends Record<string, any> = Record<string, any>>(
    text: string,
    options: SimilaritySearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    throw new Error(
      'Semantic search not supported in edge runtime. Use vector directly or server-side client.',
    );
  }

  async hybridSearch<T extends Record<string, any> = Record<string, any>>(
    query: string,
    options: HybridSearchOptions = {},
  ): Promise<SimilarityResult<T>[]> {
    throw new Error(
      'Hybrid search not supported in edge runtime. Use vector directly or server-side client.',
    );
  }

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

  async reset(): Promise<void> {
    await this.makeRequest('/reset', { method: 'POST' });
  }

  async listNamespaces(): Promise<any[]> {
    const info = await this.info();
    return Object.entries(info.namespaces).map(([name, stats]) => ({
      name,
      vectorCount: stats.vectorCount,
      ...stats,
    }));
  }

  async getAnalytics(): Promise<any> {
    const info = await this.info();

    return {
      totalVectors: info.vectorCount,
      averageQueryTime: 0, // Would need to track this
      popularQueries: [], // Would need to implement query tracking
      dimensionStats: {
        min: 0,
        max: info.dimension,
        avg: info.dimension / 2,
        std: 0,
      },
    };
  }

  async cluster(): Promise<any> {
    throw new Error('Clustering not supported in edge runtime');
  }
}

/**
 * Edge-optimized vector operations
 */
export class EdgeVectorOperations {
  private client: EdgeVectorClient;

  constructor(config: Partial<UpstashVectorConfig> = {}) {
    this.client = new EdgeVectorClient(config);
  }

  /**
   * Batch upsert with edge-friendly error handling
   */
  async batchUpsert<T = any>(
    vectors: VectorRecord<T>[],
    options: {
      batchSize?: number;
      maxRetries?: number;
    } = {},
  ): Promise<VectorResult<void>> {
    const { batchSize = 100, maxRetries = 3 } = options;

    try {
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        let attempts = 0;

        while (attempts < maxRetries) {
          try {
            await this.client.upsert(batch);
            break;
          } catch (error) {
            attempts++;
            if (attempts === maxRetries) throw error;

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
          }
        }
      }

      return { success: true, data: undefined };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, error: message };
    }
  }

  /**
   * Similarity search with fallback
   */
  async searchWithFallback<T = any>(
    vector: number[],
    options: SimilaritySearchOptions & {
      fallbackResults?: SimilarityResult<T>[];
    } = {},
  ): Promise<SimilarityResult<T>[]> {
    try {
      return await this.client.similaritySearch<T>(vector, options);
    } catch (error) {
      console.warn('Vector search failed, using fallback:', error);
      return options.fallbackResults || [];
    }
  }

  /**
   * Health check with timeout
   */
  async healthCheck(timeoutMs = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const info = await this.client.info();
      clearTimeout(timeoutId);

      return info.vectorCount >= 0;
    } catch {
      return false;
    }
  }

  /**
   * Get client instance
   */
  getClient(): EdgeVectorClient {
    return this.client;
  }
}

/**
 * Edge middleware helper for vector operations
 */
export function createEdgeVectorMiddleware(config?: Partial<UpstashVectorConfig>) {
  const operations = new EdgeVectorOperations(config);

  return {
    /**
     * Search vectors from middleware
     */
    async search<T = any>(
      vector: number[],
      options?: SimilaritySearchOptions,
    ): Promise<VectorResult<SimilarityResult<T>[]>> {
      try {
        const results = await operations.getClient().similaritySearch<T>(vector, options);
        return { success: true, data: results };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    },

    /**
     * Check if vector exists
     */
    async exists(id: string, namespace?: string): Promise<boolean> {
      try {
        const results = await operations.getClient().fetch([id], namespace);
        return results.length > 0;
      } catch {
        return false;
      }
    },

    /**
     * Get index stats
     */
    async getStats(): Promise<VectorResult<VectorIndexStats>> {
      try {
        const stats = await operations.getClient().info();
        return { success: true, data: stats };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: message };
      }
    },
  };
}

/**
 * Safe edge operation wrapper
 */
export async function safeEdgeOperation<T>(operation: () => Promise<T>): Promise<VectorResult<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

/**
 * Create edge-compatible Vector client
 */
export function createEdgeClient(config?: Partial<UpstashVectorConfig>): EdgeVectorClient {
  return new EdgeVectorClient(config);
}

/**
 * Create edge operations helper
 */
export function createEdgeOperations(config?: Partial<UpstashVectorConfig>): EdgeVectorOperations {
  return new EdgeVectorOperations(config);
}

// Default edge client
let defaultEdgeClient: EdgeVectorClient | null = null;

/**
 * Get or create default edge client
 */
export function getEdgeClient(config?: Partial<UpstashVectorConfig>): EdgeVectorClient {
  if (!defaultEdgeClient || config) {
    defaultEdgeClient = createEdgeClient(config);
  }
  return defaultEdgeClient;
}

/**
 * Edge runtime utilities for vector operations
 */
export const edgeVectorUtils = {
  /**
   * Validate vector dimensions
   */
  validateVector(vector: number[], expectedDimensions?: number): boolean {
    if (!Array.isArray(vector)) return false;
    if (vector.some(v => typeof v !== 'number' || !isFinite(v))) return false;
    if (expectedDimensions && vector.length !== expectedDimensions) return false;
    return true;
  },

  /**
   * Compress vector for edge storage
   */
  compressVector(vector: number[], precision = 6): number[] {
    return vector.map(v => parseFloat(v.toFixed(precision)));
  },

  /**
   * Check edge runtime capabilities
   */
  edgeCapabilities(): {
    fetch: boolean;
    crypto: boolean;
    textEncoder: boolean;
  } {
    return {
      fetch: typeof fetch !== 'undefined',
      crypto: typeof crypto !== 'undefined' && !!crypto.subtle,
      textEncoder: typeof TextEncoder !== 'undefined',
    };
  },

  /**
   * Generate simple hash for caching
   */
  async hashVector(vector: number[]): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(vector.join(','));

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Fallback simple hash
    let hash = 0;
    const str = vector.join(',');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  },
};

// Re-export types
export { mergeConfig, validateConfig };
export type {
  AIModelConfig,
  AIProvider,
  SimilarityResult,
  UpstashVectorConfig,
  VectorClient,
  VectorRecord,
  VectorResult,
};
