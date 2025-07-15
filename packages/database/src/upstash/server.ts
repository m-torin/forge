/**
 * Upstash Vector server implementation for semantic search and AI applications
 * Provides singleton Vector client with comprehensive operations for server environments
 *
 * @example
 * ```typescript
 * import { upstash, vectorOps, upsert, query } from '@repo/database/upstash/server';
 *
 * // Direct client usage
 * const vectors = await upstash.upsert([
 *   { id: 'doc1', vector: [0.1, 0.2, 0.3], metadata: { title: 'Document 1' } }
 * ]);
 *
 * // Using convenience functions
 * await upsert([
 *   { id: 'embedding1', data: 'Text to embed', metadata: { type: 'document' } }
 * ]);
 *
 * // Semantic search
 * const results = await query({
 *   data: 'search query text',
 *   topK: 5,
 *   includeMetadata: true
 * });
 *
 * // Using VectorOperations class
 * const ops = new VectorOperations();
 * const similar = await ops.findSimilar('doc1', { topK: 10, threshold: 0.8 });
 *
 * // Bulk operations
 * await ops.bulkUpsert(largeVectorArray, { batchSize: 100, namespace: 'documents' });
 * ```
 *
 * Features:
 * - Singleton pattern for connection pooling
 * - Hot-reload support in development
 * - Comprehensive vector operations (CRUD, search, similarity)
 * - Batch processing for large datasets
 * - Namespace support for multi-tenant applications
 * - Environment-based configuration
 */

import 'server-only';

import { FetchResult, Index, QueryResult } from '@upstash/vector';

type Dict = Record<string, unknown>;

// ============================================================================
// TYPES
// ============================================================================

// Global type for Upstash Vector client singleton
const globalForUpstash = global as unknown as { upstash?: Index };

// ============================================================================
// SINGLETON FACTORY
// ============================================================================

/**
 * Create a singleton instance of the Upstash Vector client
 * Ensures only one connection pool per application
 */
export const upstashVectorClientSingleton = (): Index => {
  if (!globalForUpstash.upstash) {
    const UPSTASH_VECTOR_REST_URL = process.env.UPSTASH_VECTOR_REST_URL;
    const UPSTASH_VECTOR_REST_TOKEN = process.env.UPSTASH_VECTOR_REST_TOKEN;

    if (!UPSTASH_VECTOR_REST_URL || !UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error(
        'Missing Upstash Vector environment variables. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN.',
      );
    }

    globalForUpstash.upstash = new Index({
      token: UPSTASH_VECTOR_REST_TOKEN,
      url: UPSTASH_VECTOR_REST_URL,
    });
  }

  return globalForUpstash.upstash;
};

/**
 * Upstash Vector client singleton instance
 * Use this for direct vector operations in server environments
 */
export const upstash: any = upstashVectorClientSingleton();

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export all Upstash Vector types and functions
export * from '@upstash/vector';

// ============================================================================
// CLIENT FACTORY
// ============================================================================

/**
 * Environment-based Upstash Vector client creation
 * Creates new Vector index instance from environment variables with validation
 */
export function createUpstashVectorFromEnv(): Index {
  const url = process.env.UPSTASH_VECTOR_REST_URL;
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing Upstash Vector configuration. Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables.',
    );
  }

  return new Index({ url, token });
}

// ============================================================================
// VECTOR OPERATIONS CLASS
// ============================================================================

/**
 * Comprehensive Vector operations wrapper with advanced search capabilities
 * Provides high-level methods for all vector operations and batch processing
 */
export class VectorOperations {
  private client: Index;

  constructor(client?: Index) {
    this.client = client || upstash;
  }

  /**
   * Upsert vectors into the index
   */
  async upsert(
    vectors: Array<{
      id: string | number;
      vector?: number[];
      metadata?: Dict;
      data?: string;
    }>,
    namespace?: string,
  ): Promise<string> {
    const ns = this.client.namespace(namespace || '');
    return await ns.upsert(vectors as any);
  }

  /**
   * Query vectors by vector similarity
   */
  async query(options: {
    vector?: number[];
    data?: string;
    topK?: number;
    filter?: string;
    includeVectors?: boolean;
    includeMetadata?: boolean;
    includeData?: boolean;
    namespace?: string;
  }): Promise<QueryResult<Dict>[]> {
    const { namespace, ...queryOptions } = options;
    const ns = this.client.namespace(namespace || '');
    return await ns.query({
      ...queryOptions,
      topK: queryOptions.topK || 10,
    } as any);
  }

  /**
   * Query vectors using text
   */
  async queryByText(
    data: string,
    options?: {
      topK?: number;
      filter?: string;
      includeVectors?: boolean;
      includeMetadata?: boolean;
      includeData?: boolean;
      namespace?: string;
    },
  ): Promise<QueryResult<Dict>[]> {
    const { namespace, ...queryOptions } = options || {};
    const ns = this.client.namespace(namespace || '');
    return await ns.query({
      data,
      topK: queryOptions?.topK || 10,
      ...queryOptions,
    } as any);
  }

  /**
   * Fetch vectors by IDs
   */
  async fetch(
    ids: string | string[],
    options?: {
      includeVectors?: boolean;
      includeMetadata?: boolean;
      includeData?: boolean;
      namespace?: string;
    },
  ): Promise<FetchResult<Dict>[]> {
    const fetchIds = Array.isArray(ids) ? ids : [ids];
    const { namespace, ...fetchOptions } = options || {};
    const ns = this.client.namespace(namespace || '');
    return (await ns.fetch(fetchIds as any, fetchOptions)) as any;
  }

  /**
   * Delete vectors by IDs
   */
  async delete(
    ids: string | string[],
    options?: {
      namespace?: string;
    },
  ): Promise<{ deleted: number }> {
    const deleteIds = Array.isArray(ids) ? ids : [ids];
    const { namespace } = options || {};
    const ns = this.client.namespace(namespace || '');
    return await ns.delete(deleteIds);
  }

  /**
   * Update vector metadata
   */
  async update(
    id: string,
    options: {
      metadata?: Dict;
      data?: string;
      namespace?: string;
    },
  ): Promise<string> {
    const { namespace, ...updateData } = options;
    const ns = this.client.namespace(namespace || '');
    return await ns.upsert([{ id, ...updateData } as any]);
  }

  /**
   * Get index information
   */
  async info(): Promise<any> {
    return await this.client.info();
  }

  /**
   * List all namespaces
   */
  async listNamespaces(): Promise<string[]> {
    return await this.client.listNamespaces();
  }

  /**
   * Reset the entire index
   */
  async reset(): Promise<string> {
    return await this.client.reset();
  }

  /**
   * Bulk upsert operations with batching
   */
  async bulkUpsert(
    vectors: Array<{
      id: string | number;
      vector?: number[];
      metadata?: Dict;
      data?: string;
    }>,
    options?: {
      namespace?: string;
      batchSize?: number;
    },
  ): Promise<string[]> {
    const batchSize = options?.batchSize || 100;
    const results: string[] = [];

    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      const result = await this.upsert(batch, options?.namespace);
      results.push(result);
    }

    return results;
  }

  /**
   * Bulk delete operations
   */
  async bulkDelete(
    ids: string[],
    options?: {
      namespace?: string;
      batchSize?: number;
    },
  ): Promise<Array<{ deleted: number }>> {
    const batchSize = options?.batchSize || 100;
    const results: Array<{ deleted: number }> = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const result = await this.delete(batch, { namespace: options?.namespace });
      results.push(result);
    }

    return results;
  }

  /**
   * Search with pagination
   */
  async searchWithPagination(
    query: {
      vector?: number[];
      data?: string;
      filter?: string;
      namespace?: string;
    },
    options: {
      pageSize: number;
      maxResults?: number;
    },
  ): Promise<QueryResult<Dict>[]> {
    const maxResults = options.maxResults || 1000;
    const results: QueryResult<Dict>[] = [];
    let lastScore = 1.0;

    while (results.length < maxResults) {
      const remainingCount = Math.min(options.pageSize, maxResults - results.length);

      const response = await this.query({
        ...query,
        topK: remainingCount,
        includeVectors: true,
        includeMetadata: true,
        includeData: true,
      });

      if (!response || response.length === 0) {
        break;
      }

      // Filter out results we've already seen
      const newResults = response.filter((match: QueryResult<Dict>) => match.score < lastScore);

      if (newResults.length === 0) {
        break;
      }

      results.push(...newResults);
      lastScore = newResults[newResults.length - 1].score;
    }

    return results.slice(0, maxResults);
  }

  /**
   * Find similar vectors
   */
  async findSimilar(
    referenceId: string,
    options?: {
      topK?: number;
      filter?: string;
      namespace?: string;
      threshold?: number;
    },
  ): Promise<
    Array<{
      id: string | number;
      score: number;
      metadata?: Dict;
    }>
  > {
    // First fetch the reference vector
    const referenceVector = await this.fetch(referenceId, {
      includeVectors: true,
      namespace: options?.namespace,
    });

    if (!referenceVector || !referenceVector[0]?.vector) {
      throw new Error(`Reference vector ${referenceId} not found`);
    }

    const vector = referenceVector[0].vector;

    // Query for similar vectors
    const response = await this.query({
      vector,
      topK: options?.topK || 10,
      filter: options?.filter,
      namespace: options?.namespace,
      includeMetadata: true,
    });

    if (!response || response.length === 0) {
      return [];
    }

    // Filter by threshold if provided and exclude the reference vector itself
    let results = response.filter((match: QueryResult<Dict>) => match.id !== referenceId);

    if (options?.threshold !== undefined) {
      const threshold = options.threshold;
      results = results.filter((match: QueryResult<Dict>) => match.score >= threshold);
    }

    return results.map((match: QueryResult<Dict>) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  }

  /**
   * Get raw client access
   */
  getClient(): Index {
    return this.client;
  }
}

// Create a default instance
export const vectorOps = new VectorOperations();

// Export convenience functions
export const {
  upsert,
  query,
  queryByText,
  fetch,
  delete: deleteVectors,
  update,
  info,
  listNamespaces,
  reset,
  bulkUpsert,
  bulkDelete,
  searchWithPagination,
  findSimilar,
  getClient,
} = vectorOps;
