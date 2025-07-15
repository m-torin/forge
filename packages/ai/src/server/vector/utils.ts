import { createEmbeddingManager } from '../embedding/utils';
import type { VectorDB, VectorRecord, VectorSearchResult } from './types';

/**
 * Vector utility functions for common operations
 */
export class VectorUtils {
  private db: VectorDB;
  private embedder: any;

  constructor(db: VectorDB, embeddingModel?: string) {
    this.db = db;
    this.embedder = createEmbeddingManager(embeddingModel);
  }

  /**
   * Store text documents with automatic embedding
   */
  async storeTexts(
    texts: Array<{ id: string; content: string; metadata?: Record<string, any> }>,
  ): Promise<void> {
    // Generate embeddings for all texts
    const contents = texts.map(t => t.content);
    const embeddings = await this.embedder.embedBatch(contents);

    // Create vector records
    const records: VectorRecord[] = texts.map((text, index) => ({
      id: text.id,
      values: embeddings[index],
      metadata: {
        content: text.content,
        ...text.metadata,
      },
    }));

    // Store in vector database
    await this.db.upsert(records);
  }

  /**
   * Search for similar texts
   */
  async searchSimilar(
    query: string,
    options: {
      topK?: number;
      includeContent?: boolean;
      filter?: Record<string, any>;
    } = {},
  ): Promise<Array<VectorSearchResult & { content?: string }>> {
    // Generate embedding for query
    const queryEmbedding = await this.embedder.embed(query);

    // Search vector database
    const results = await this.db.query(queryEmbedding, {
      topK: options.topK ?? 5,
      includeMetadata: true,
      filter: options.filter,
    });

    // Include content if requested
    if (options.includeContent) {
      return results.map(result => ({
        ...result,
        content: result.metadata?.content as string,
      }));
    }

    return results;
  }

  /**
   * Update existing documents
   */
  async updateTexts(
    updates: Array<{ id: string; content: string; metadata?: Record<string, any> }>,
  ): Promise<void> {
    // Same as storeTexts - upsert will update existing records
    await this.storeTexts(updates);
  }

  /**
   * Delete documents by IDs
   */
  async deleteTexts(ids: string[]): Promise<void> {
    await this.db.delete(ids);
  }

  /**
   * Get document statistics
   */
  async getStats(): Promise<{ dimension: number; totalDocuments: number }> {
    const stats = await this.db.describe?.();
    if (!stats) {
      throw new Error('Vector database does not support describe operation');
    }
    return {
      dimension: stats.dimension,
      totalDocuments: stats.totalVectorCount,
    };
  }

  /**
   * Batch similarity search for multiple queries
   */
  async batchSearch(
    queries: string[],
    options: {
      topK?: number;
      includeContent?: boolean;
      filter?: Record<string, any>;
    } = {},
  ): Promise<Array<Array<VectorSearchResult & { content?: string }>>> {
    // Generate embeddings for all queries
    const queryEmbeddings = await this.embedder.embedBatch(queries);

    // Perform searches
    const results = await Promise.all(
      queryEmbeddings.map((embedding: number[]) =>
        this.db.query(embedding, {
          topK: options.topK ?? 5,
          includeMetadata: true,
          filter: options.filter,
        }),
      ),
    );

    // Include content if requested
    if (options.includeContent) {
      return results.map((queryResults: any[]) =>
        queryResults.map((result: any) => ({
          ...result,
          content: result.metadata?.content as string,
        })),
      );
    }

    return results;
  }
}

/**
 * Create vector utilities instance
 */
export function createVectorUtils(db: VectorDB, embeddingModel?: string): VectorUtils {
  return new VectorUtils(db, embeddingModel);
}

/**
 * Convenience functions for common vector operations
 */
export const vectorOps = {
  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
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
   * Normalize a vector to unit length
   */
  normalize(vector: number[]): number[] {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / norm);
  },

  /**
   * Calculate Euclidean distance between two vectors
   */
  euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  },

  /**
   * Find the centroid of a set of vectors
   */
  centroid(vectors: number[][]): number[] {
    if (vectors.length === 0) {
      throw new Error('Cannot calculate centroid of empty vector set');
    }

    const dimension = vectors[0].length;
    const centroid = new Array(dimension).fill(0);

    for (const vector of vectors) {
      if (vector.length !== dimension) {
        throw new Error('All vectors must have the same dimension');
      }
      for (let i = 0; i < dimension; i++) {
        centroid[i] += vector[i];
      }
    }

    return centroid.map(val => val / vectors.length);
  },
};
