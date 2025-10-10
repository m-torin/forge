/**
 * Next.js server-side Upstash Vector client
 * Optimized for Next.js server components and API routes
 */

import 'server-only';
import { createVectorClient, safeVectorOperation, type UpstashVectorClient } from './server';
import type { AIModelConfig, AIProvider, UpstashVectorConfig, VectorResult } from './types';

/**
 * Next.js optimized Vector client with singleton pattern
 */
class NextVectorClient {
  private static instance: UpstashVectorClient | null = null;
  private static embeddingProviders = new Map<string, any>();

  /**
   * Get singleton Vector client for Next.js
   */
  static getClient(config?: Partial<UpstashVectorConfig>): UpstashVectorClient {
    if (!this.instance) {
      this.instance = createVectorClient({
        // Next.js specific defaults
        url: process.env.UPSTASH_VECTOR_REST_URL,
        token: process.env.UPSTASH_VECTOR_REST_TOKEN,
        ...config,
      });
    }
    return this.instance;
  }

  /**
   * Configure embedding provider for Next.js
   */
  static async configureEmbedding(
    name: string,
    provider: AIProvider,
    config: AIModelConfig,
  ): Promise<void> {
    const client = this.getClient();
    await client.configureEmbeddingProvider(provider, config);
    this.embeddingProviders.set(name, { provider, config });
  }

  /**
   * Get configured embedding providers
   */
  static getEmbeddingProviders(): Map<string, any> {
    return this.embeddingProviders;
  }

  /**
   * Reset singleton (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.embeddingProviders.clear();
  }
}

/**
 * Get Next.js optimized Vector client
 */
export function getNextVector(config?: Partial<UpstashVectorConfig>): UpstashVectorClient {
  return NextVectorClient.getClient(config);
}

/**
 * Next.js server action for vector search
 */
export function createVectorSearchAction(config?: Partial<UpstashVectorConfig>) {
  const client = getNextVector(config);

  return async function searchVectors(
    query: string | number[],
    options: {
      topK?: number;
      filter?: string;
      namespace?: string;
      provider?: AIProvider;
    } = {},
  ): Promise<VectorResult<any[]>> {
    'use server';

    return safeVectorOperation(async () => {
      if (typeof query === 'string') {
        // Semantic search with text
        return await client.semanticSearch(query, {
          topK: options.topK,
          filter: options.filter,
          namespace: options.namespace,
        });
      } else {
        // Vector similarity search
        return await client.similaritySearch(query, {
          topK: options.topK,
          filter: options.filter,
          namespace: options.namespace,
        });
      }
    });
  };
}

/**
 * Next.js server action for document indexing
 */
export function createDocumentIndexAction(config?: Partial<UpstashVectorConfig>) {
  const client = getNextVector(config);

  return async function indexDocument(
    document: string,
    options: {
      documentId?: string;
      metadata?: Record<string, any>;
      chunkSize?: number;
      chunkOverlap?: number;
      provider?: AIProvider;
      namespace?: string;
    } = {},
  ): Promise<VectorResult<void>> {
    'use server';

    return safeVectorOperation(async () => {
      await client.indexDocument(document, {
        documentId: options.documentId,
        metadata: options.metadata,
        chunkSize: options.chunkSize,
        chunkOverlap: options.chunkOverlap,
        provider: options.provider,
        namespace: options.namespace,
      });
    });
  };
}

/**
 * Next.js cached vector operations
 */
export async function getCachedVectorSearch<T>(
  cacheKey: string,
  searchFn: () => Promise<T>,
  options: {
    ttl?: number;
    tags?: string[];
    revalidate?: number;
  } = {},
): Promise<T> {
  // In a real implementation, this would use Next.js cache
  // For now, we'll just execute the search function
  return await searchFn();
}

/**
 * Next.js vector middleware helpers
 */
export function createVectorMiddleware(config?: Partial<UpstashVectorConfig>) {
  const client = getNextVector(config);

  return {
    /**
     * Search similar content for recommendations
     */
    async findSimilarContent<T = any>(
      contentVector: number[],
      options: {
        topK?: number;
        threshold?: number;
        excludeIds?: string[];
      } = {},
    ): Promise<VectorResult<T[]>> {
      return safeVectorOperation(async () => {
        let filter = '';
        if (options.excludeIds?.length) {
          const excludeFilter = options.excludeIds.map(id => `id != "${id}"`).join(' AND ');
          filter = excludeFilter;
        }

        const results = await client.similaritySearch<T>(contentVector, {
          topK: options.topK || 10,
          filter,
          threshold: options.threshold,
        });

        // Filter by threshold if provided
        if (options.threshold) {
          return results.filter(result => result.score >= options.threshold!);
        }

        return results;
      });
    },

    /**
     * Search for duplicate or near-duplicate content
     */
    async findDuplicates<T = any>(
      contentVector: number[],
      threshold = 0.95,
    ): Promise<VectorResult<T[]>> {
      return safeVectorOperation(async () => {
        const results = await client.similaritySearch<T>(contentVector, {
          topK: 20,
          threshold,
        });

        return results.filter(result => result.score >= threshold);
      });
    },

    /**
     * Get content recommendations based on user vector
     */
    async getRecommendations<T = any>(
      userVector: number[],
      options: {
        topK?: number;
        diversityFactor?: number;
        categories?: string[];
      } = {},
    ): Promise<VectorResult<T[]>> {
      return safeVectorOperation(async () => {
        let filter = '';
        if (options.categories?.length) {
          const categoryFilter = options.categories.map(cat => `category == "${cat}"`).join(' OR ');
          filter = `(${categoryFilter})`;
        }

        const results = await client.similaritySearch<T>(userVector, {
          topK: options.topK || 10,
          filter,
        });

        // Apply diversity if requested
        if (options.diversityFactor && options.diversityFactor > 0) {
          return this.diversifyResults(results, options.diversityFactor);
        }

        return results;
      });
    },

    /**
     * Apply diversity to search results
     */
    diversifyResults<T = any>(results: T[], diversityFactor: number): T[] {
      // Simple diversity algorithm - in practice, you might want something more sophisticated
      const diversified = [];
      const used = new Set();

      for (const result of results) {
        // Simple category-based diversity (assuming metadata has category)
        const category = (result as any).metadata?.category || 'default';

        if (!used.has(category) || diversified.length < 3) {
          diversified.push(result);
          used.add(category);
        }

        if (diversified.length >= results.length * diversityFactor) {
          break;
        }
      }

      // Fill remaining slots with best matches
      for (const result of results) {
        if (!diversified.includes(result) && diversified.length < results.length) {
          diversified.push(result);
        }
      }

      return diversified;
    },
  };
}

/**
 * Next.js vector analytics helpers
 */
export function createVectorAnalytics(config?: Partial<UpstashVectorConfig>) {
  const client = getNextVector(config);

  return {
    /**
     * Get vector database statistics
     */
    async getVectorStats(): Promise<VectorResult<any>> {
      return safeVectorOperation(async () => {
        const [info, analytics] = await Promise.all([client.info(), client.getAnalytics()]);

        return {
          ...info,
          ...analytics,
          timestamp: new Date().toISOString(),
        };
      });
    },

    /**
     * Get namespace usage statistics
     */
    async getNamespaceStats(): Promise<VectorResult<any[]>> {
      return safeVectorOperation(async () => {
        const namespaces = await client.listNamespaces();

        return namespaces.map(ns => ({
          ...ns,
          utilizationPercent: ns.vectorCount > 0 ? (ns.vectorCount / 10000) * 100 : 0, // Assuming 10k limit
        }));
      });
    },

    /**
     * Track search patterns (placeholder for analytics)
     */
    async trackSearch(query: string | number[], results: any[], userId?: string): Promise<void> {
      // In a real implementation, this would log to analytics service
      console.log('Vector search tracked:', {
        query: typeof query === 'string' ? query.slice(0, 50) : '[vector]',
        resultCount: results.length,
        userId,
        timestamp: new Date().toISOString(),
      });
    },
  };
}

/**
 * Next.js API route helpers
 */
export const nextVectorApi = {
  /**
   * Handle vector search API requests
   */
  async handleSearch(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { query, options = {} } = body;

      const client = getNextVector();
      let results;

      if (typeof query === 'string') {
        results = await client.semanticSearch(query, options);
      } else {
        results = await client.similaritySearch(query, options);
      }

      return Response.json({ success: true, data: results });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  },

  /**
   * Handle vector upsert API requests
   */
  async handleUpsert(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { vectors } = body;

      const client = getNextVector();
      await client.upsert(vectors);

      return Response.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  },

  /**
   * Handle embedding generation API requests
   */
  async handleEmbed(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      const { text, provider = 'openai', model } = body;

      const client = getNextVector();
      const result = await client.generateEmbedding(text, provider);

      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Response.json({ success: false, error: message }, { status: 500 });
    }
  },
};

/**
 * Next.js vector configuration presets
 */
export const nextVectorPresets = {
  // Content recommendation system
  contentRecommendation: {
    chunkSize: 1000,
    chunkOverlap: 200,
    embeddingModel: 'text-embedding-3-small',
    provider: 'openai' as const,
  },

  // Document search system
  documentSearch: {
    chunkSize: 500,
    chunkOverlap: 100,
    embeddingModel: 'text-embedding-ada-002',
    provider: 'openai' as const,
  },

  // Code similarity
  codeSimilarity: {
    chunkSize: 2000,
    chunkOverlap: 500,
    embeddingModel: 'text-embedding-3-large',
    provider: 'openai' as const,
  },

  // Product matching
  productMatching: {
    chunkSize: 300,
    chunkOverlap: 50,
    embeddingModel: 'embed-english-v3.0',
    provider: 'cohere' as const,
  },
} as const;

/**
 * Default Next.js Vector client
 */
export const nextVector = getNextVector();

// Re-export server utilities
export { safeVectorOperation } from './server';

// Re-export types
export type { AIModelConfig, AIProvider, UpstashVectorConfig, VectorResult } from './server';
