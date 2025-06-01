import 'server-only';

import { upstashVectorClientSingleton } from './client';

import type { VectorDatabaseAdapter } from '../types';
// Import only the types that exist in @upstash/vector
import type { Vector } from '@upstash/vector';

/**
 * Upstash Vector adapter implementing the common DatabaseAdapter interface
 * Note: Vector databases have different semantics than traditional databases,
 * so some methods are adapted to work with vector operations
 */
export class UpstashVectorAdapter implements VectorDatabaseAdapter {
  private client = upstashVectorClientSingleton();

  async initialize(): Promise<void> {
    // Upstash Vector doesn't require explicit initialization
    // The client is ready to use once instantiated
  }

  async disconnect(): Promise<void> {
    // Upstash Vector is stateless and doesn't require explicit disconnection
  }

  getClient() {
    return this.client;
  }

  /**
   * Create/Upsert a vector in the specified namespace
   * @param collection - Used as namespace in Upstash Vector
   * @param data - Vector data with id, values, and optional metadata
   */
  async create<T>(collection: string, data: Vector): Promise<T> {
    const result = await this.client.upsert(data, { namespace: collection });
    return result as T;
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
    
    const result = await this.client.upsert(vectorData, { namespace: collection });
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
   * Find a unique vector by id
   * @param collection - Used as namespace
   * @param query - Object with id property
   */
  async findUnique<T>(collection: string, query: { id: string }): Promise<T | null> {
    const result = await this.client.fetch([query.id], { 
      namespace: collection,
      includeMetadata: true 
    });
    
    return result.length > 0 ? (result[0] as T) : null;
  }

  /**
   * Find many vectors by query
   * For vector databases, this performs a similarity search
   * @param collection - Used as namespace
   * @param query - Query parameters including vector values and optional filters
   */
  async findMany<T>(collection: string, query?: {
    vector?: number[];
    topK?: number;
    filter?: string;
    includeMetadata?: boolean;
  }): Promise<T[]> {
    if (!query?.vector) {
      throw new Error('Vector query requires a vector for similarity search');
    }

    const result = await this.client.query({
      filter: query.filter,
      includeMetadata: query.includeMetadata ?? true,
      topK: query.topK || 10,
      vector: query.vector,
    }, { namespace: collection });

    return result as T[];
  }

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
      return info.vectorCount || 0;
    } catch {
      return 0;
    }
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

  // Additional vector-specific methods not in the base adapter interface

  /**
   * Perform a similarity search with full options support
   */
  async query<T = VectorScore>(
    options: {
      vector?: number[];
      data?: string;
      sparseVector?: {
        indices: number[];
        values: number[];
      };
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    },
    queryOptions?: QueryOptions
  ): Promise<T[]> {
    const result = await this.client.query(options as QueryData, queryOptions);
    return result as T[];
  }

  /**
   * Fetch vectors by IDs with full options support
   */
  async fetch<T = Vector>(
    ids: string | string[],
    options?: {
      namespace?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
    }
  ): Promise<T[]> {
    const result = await this.client.fetch(ids, options);
    return result as T[];
  }

  /**
   * Upsert vectors with full data support (dense, sparse, hybrid, text)
   */
  async upsertData<T = any>(
    data: any | any[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.upsert(data, options);
    return result as T;
  }

  /**
   * Upsert multiple vectors (alias for backward compatibility)
   */
  async upsertMany<T = any>(
    vectors: Vector[] | any[],
    namespace?: string
  ): Promise<T> {
    const result = await this.client.upsert(vectors, namespace ? { namespace } : undefined);
    return result as T;
  }

  /**
   * Update vector metadata
   */
  async updateMetadata<T = UpsertResult>(
    id: string,
    metadata: Record<string, any>,
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const updateData = {
      id,
      metadata,
    };
    const result = await this.client.upsert(updateData, options);
    return result as T;
  }

  /**
   * Delete multiple vectors by IDs
   */
  async deleteMany<T = DeleteResult>(
    ids: string | string[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.delete(ids, options);
    return result as T;
  }

  /**
   * Get index information and statistics
   */
  async getInfo(): Promise<InfoResult> {
    return await this.client.info();
  }

  /**
   * Reset the entire index (use with caution!)
   */
  async reset(): Promise<ResetResult> {
    return await this.client.reset();
  }

  /**
   * Query with text data (uses built-in embedding)
   */
  async queryByText<T = VectorScore>(
    text: string,
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      includeData?: boolean;
      namespace?: string;
    }
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options || {};
    const result = await this.client.query(
      {
        data: text,
        ...queryOptions,
      },
      namespace ? { namespace } : undefined
    );
    return result as T[];
  }

  /**
   * Upsert data with automatic embedding generation
   */
  async upsertText<T = UpsertResult>(
    data: {
      id: string;
      data: string;
      metadata?: Record<string, any>;
    }[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.upsert(data, options);
    return result as T;
  }

  /**
   * Upsert dense vectors
   */
  async upsertDense<T = UpsertResult>(
    vectors: {
      id: string;
      vector: number[];
      metadata?: Record<string, any>;
    }[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Upsert sparse vectors
   */
  async upsertSparse<T = UpsertResult>(
    vectors: {
      id: string;
      sparseVector: {
        indices: number[];
        values: number[];
      };
      metadata?: Record<string, any>;
    }[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Upsert hybrid vectors (both dense and sparse)
   */
  async upsertHybrid<T = UpsertResult>(
    vectors: {
      id: string;
      vector: number[];
      sparseVector: {
        indices: number[];
        values: number[];
      };
      metadata?: Record<string, any>;
    }[],
    options?: {
      namespace?: string;
    }
  ): Promise<T> {
    const result = await this.client.upsert(vectors, options);
    return result as T;
  }

  /**
   * Query with sparse vector
   */
  async querySparse<T = VectorScore>(
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    }
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options || {};
    const result = await this.client.query(
      {
        sparseVector,
        ...queryOptions,
      },
      namespace ? { namespace } : undefined
    );
    return result as T[];
  }

  /**
   * Query with hybrid vector (both dense and sparse)
   */
  async queryHybrid<T = VectorScore>(
    vector: number[],
    sparseVector: {
      indices: number[];
      values: number[];
    },
    options?: {
      topK?: number;
      filter?: string;
      includeMetadata?: boolean;
      includeVectors?: boolean;
      namespace?: string;
    }
  ): Promise<T[]> {
    const { namespace, ...queryOptions } = options || {};
    const result = await this.client.query(
      {
        sparseVector,
        vector,
        ...queryOptions,
      },
      namespace ? { namespace } : undefined
    );
    return result as T[];
  }

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

  /**
   * List all namespaces (helper method)
   * Note: This requires custom tracking as Upstash Vector doesn't expose namespace listing
   */
  async listNamespaces(): Promise<string[]> {
    // This would need to be implemented with custom tracking
    // For now, return empty array as Upstash Vector doesn't expose namespace listing
    return [];
  }
}