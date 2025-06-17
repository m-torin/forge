import 'server-only';

import { upstashVectorClientSingleton } from './client';

import { VectorDatabaseAdapter } from '../types';
// Import only the types that exist in @upstash/vector
import { Index, Vector } from '@upstash/vector';

/**
 * Upstash Vector adapter implementing the common DatabaseAdapter interface
 * Note: Vector databases have different semantics than traditional databases,
 * so some methods are adapted to work with vector operations
 */
export class UpstashVectorAdapter implements VectorDatabaseAdapter {
  private client = upstashVectorClientSingleton();

  /**
   * Count vectors in a namespace
   * Note: Upstash Vector doesn't have a direct count operation,
   * so this performs a query and returns the count
   */
  async count(_collection: string, _query?: any): Promise<number> {
    try {
      // Upstash Vector doesn't have a native count operation
      // We'll use info() to get index statistics
      const info = await this.client.info();

      // Note: This returns total vectors across all namespaces
      // For namespace-specific counts, you'd need to track this separately
      return info.vectorCount ?? 0;
    } catch {
      return 0;
    }
  }

  /**
   * Create/Upsert a vector in the specified namespace
   * @param collection - Used as namespace in Upstash Vector
   * @param data - Vector data with id, values, and optional metadata
   */
  async create<T>(collection: string, data: Vector): Promise<T> {
    const result = await this.client.upsert(data as any, { namespace: collection });
    return result as T;
  }

  /**
   * Delete a vector by id
   * @param collection - Used as namespace
   * @param id - Vector id to delete
   */
  async delete<T>(collection: string, id: string): Promise<T> {
    const result = await this.client.delete(id, { namespace: collection });
    return result as T;
  }

  /**
   * Delete multiple vectors by IDs
   */
  async deleteMany<T = any>(
    ids: string | string[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.delete(ids, options);
    return result as T;
  }

  async disconnect(): Promise<void> {
    // Upstash Vector is stateless and doesn't require explicit disconnection
  }

  /**
   * Fetch vectors by IDs with full options support
   */
  async fetch<T = Vector>(
    ids: string | string[],
    options?: {
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    },
  ): Promise<T[]> {
    const result = await this.client.fetch(ids as any, options);
    return result as T[];
  }

  /**
   * Find many vectors by query
   * For vector databases, this performs a similarity search
   * @param collection - Used as namespace
   * @param query - Query parameters including vector values and optional filters
   */
  async findMany<T>(
    collection: string,
    query?: {
      filter?: string;
      includeMetadata?: boolean;
      topK?: number;
      vector?: number[];
    },
  ): Promise<T[]> {
    if (!query?.vector) {
      throw new Error('Vector query requires a vector for similarity search');
    }

    const result = await this.client.query(
      {
        filter: query.filter,
        includeMetadata: query.includeMetadata ?? true,
        topK: query.topK ?? 10,
        vector: query.vector,
      },
      { namespace: collection },
    );

    return result as T[];
  }

  /**
   * Find a unique vector by id
   * @param collection - Used as namespace
   * @param query - Object with id property
   */
  async findUnique<T>(collection: string, query: { id: string }): Promise<null | T> {
    const result = await this.client.fetch([query.id], {
      includeMetadata: true,
      namespace: collection,
    });

    return result.length > 0 ? (result[0] as T) : null;
  }

  getClient(): Index {
    return this.client;
  }

  /**
   * Get index information and statistics
   */
  async getInfo(): Promise<any> {
    return await this.client.info();
  }

  // Additional vector-specific methods not in the base adapter interface

  /**
   * Get namespace-specific statistics (helper method)
   */
  async getNamespaceInfo(namespace: string) {
    // Note: Upstash Vector doesn't have native namespace stats
    // This is a helper method that could be extended with custom tracking
    const info = await this.client.info();
    return {
      ...info,
      namespace,
      // Add any namespace-specific metrics you track separately
    };
  }

  async initialize(): Promise<void> {
    // Upstash Vector doesn't require explicit initialization
    // The client is ready to use once instantiated
  }

  /**
   * List all namespaces (helper method)
   * Note: This requires custom tracking as Upstash Vector doesn't expose namespace listing
   */
  async listNamespaces(): Promise<string[]> {
    // This would need to be implemented with custom tracking
    // For now, return empty array as Upstash Vector doesn't expose namespace listing
    return [];
  }

  /**
   * Perform a similarity search with full options support
   */
  async query<T = any>(
    options: {
      data?: string;
      filter?: string;
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      sparseVector?: {
        indices: number[];
        values: number[];
      };
      topK?: number;
      vector?: number[];
    },
    queryOptions?: any,
  ): Promise<T[]> {
    const result = await this.client.query(options as any, queryOptions);
    return result as T[];
  }

  /**
   * Query with text data (uses built-in embedding)
   */
  async queryByText<T = any>(
    text: string,
    options?: {
      filter?: string;
      includeData?: boolean;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options ?? {};
    const result = await this.client.query(
      {
        data: text,
        topK: 10,
        ...queryOptions,
      } as any,
      namespace ? { namespace } : undefined,
    );
    return result as T[];
  }

  /**
   * Query with hybrid vector (both dense and sparse)
   */
  async queryHybrid<T = any>(
    vector: number[],
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options ?? {};
    const result = await this.client.query(
      {
        sparseVector,
        topK: 10,
        vector,
        ...queryOptions,
      } as any,
      namespace ? { namespace } : undefined,
    );
    return result as T[];
  }

  /**
   * Query with sparse vector
   */
  async querySparse<T = any>(
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
      topK?: number;
    },
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options ?? {};
    const result = await this.client.query(
      {
        sparseVector,
        topK: 10,
        ...queryOptions,
      } as any,
      namespace ? { namespace } : undefined,
    );
    return result as T[];
  }

  /**
   * Execute raw operations on the Upstash Vector client
   * @param operation - The operation name
   * @param params - Parameters for the operation
   */
  async raw<T = any>(operation: string, params: any): Promise<T> {
    const client = this.client as any;

    if (typeof client[operation] === 'function') {
      return await client[operation](params);
    }

    throw new Error(`Operation '${operation}' not supported on Upstash Vector client`);
  }

  /**
   * Reset the entire index (use with caution!)
   */
  async reset(): Promise<any> {
    return await this.client.reset();
  }

  /**
   * Update/Upsert a vector by id
   * @param collection - Used as namespace
   * @param id - Vector id
   * @param data - Updated vector data
   */
  async update<T>(collection: string, id: string, data: Partial<Vector>): Promise<T> {
    const vectorData = {
      id,
      ...data,
    } as Vector;

    const result = await this.client.upsert(vectorData as any, { namespace: collection });
    return result as T;
  }

  /**
   * Update vector metadata
   */
  async updateMetadata<T = any>(
    id: string,
    metadata: Record<string, any>,
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const updateData = {
      id,
      metadata,
    };
    const result = await this.client.upsert(updateData as any, options);
    return result as T;
  }

  /**
   * Upsert vectors with full data support (dense, sparse, hybrid, text)
   */
  async upsertData<T = any>(
    data: any | any[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.upsert(data, options);
    return result as T;
  }

  /**
   * Upsert dense vectors
   */
  async upsertDense<T = any>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      vector: number[];
    }[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Upsert hybrid vectors (both dense and sparse)
   */
  async upsertHybrid<T = any>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      sparseVector: {
        indices: number[];
        values: number[];
      };
      vector: number[];
    }[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Upsert multiple vectors (alias for backward compatibility)
   */
  async upsertMany<T = any>(vectors: any[] | Vector[], namespace?: string): Promise<T> {
    const result = await this.client.upsert(vectors as any, namespace ? { namespace } : undefined);
    return result as T;
  }

  /**
   * Upsert sparse vectors
   */
  async upsertSparse<T = any>(
    vectors: {
      id: string;
      metadata?: Record<string, any>;
      sparseVector: {
        indices: number[];
        values: number[];
      };
    }[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Upsert data with automatic embedding generation
   */
  async upsertText<T = any>(
    data: {
      data: string;
      id: string;
      metadata?: Record<string, any>;
    }[],
    options?: {
      namespace?: string;
    },
  ): Promise<T> {
    const result = await this.client.upsert(data, options);
    return result as T;
  }
}
