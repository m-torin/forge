/**
 * Vector Database Types
 * Common types for vector database operations
 */

import type { EmbeddingModel } from 'ai';

/**
 * Vector record structure
 */
export interface VectorRecord {
  id: string;
  vector?: number[];
  data?: string;
  metadata?: Record<string, any>;
  score?: number;
}

/**
 * Vector database configuration
 */
export interface VectorDBConfig {
  url?: string;
  token?: string;
  embeddingModel?: EmbeddingModel<string>;
  namespace?: string;
  dimension?: number;
}

/**
 * Query options for vector search
 */
export interface VectorQueryOptions {
  topK?: number;
  threshold?: number;
  includeMetadata?: boolean;
  includeVectors?: boolean;
  includeData?: boolean;
  filter?: string;
  namespace?: string;
}

/**
 * Upsert options for vector insertion
 */
export interface VectorUpsertOptions {
  namespace?: string;
  batchSize?: number;
}

/**
 * Range query options for pagination
 */
export interface VectorRangeOptions {
  cursor: number | string;
  limit: number;
  includeMetadata?: boolean;
  includeVectors?: boolean;
  includeData?: boolean;
  prefix?: string;
  namespace?: string;
}

/**
 * Vector database operations interface
 */
export interface VectorDB {
  // Basic operations
  upsert(records: VectorRecord | VectorRecord[], options?: VectorUpsertOptions): Promise<void>;
  query(vector: number[] | string, options?: VectorQueryOptions): Promise<VectorRecord[]>;
  fetch(ids: string | string[], options?: { namespace?: string }): Promise<VectorRecord[]>;
  delete(ids: string | string[], options?: { namespace?: string }): Promise<{ deleted: number }>;

  // Utility operations
  info(): Promise<VectorIndexInfo>;
  reset(options?: { namespace?: string }): Promise<string>;
  range(options: VectorRangeOptions): Promise<VectorRangeResult>;
}

/**
 * Vector index information
 */
export interface VectorIndexInfo {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: 'COSINE' | 'EUCLIDEAN' | 'DOT_PRODUCT';
  namespaces?: Record<
    string,
    {
      vectorCount: number;
      pendingVectorCount: number;
    }
  >;
}

/**
 * Range query result
 */
export interface VectorRangeResult {
  nextCursor: string;
  vectors: VectorRecord[];
}

/**
 * Embedding generation result
 */
export interface EmbeddingResult {
  content: string;
  embedding: number[];
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  embeddings: EmbeddingResult[];
  totalTokens?: number;
}

/**
 * Vector store configuration for different providers
 */
export interface VectorStoreConfig {
  provider: 'upstash' | 'pinecone' | 'qdrant' | 'weaviate' | 'chroma';
  config: VectorDBConfig;
}

/**
 * Vector search result with similarity score
 */
export interface VectorSearchResult extends VectorRecord {
  score: number;
  distance?: number;
}

/**
 * Document chunk for vector storage
 */
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    documentId: string;
    chunkIndex: number;
    source?: string;
    title?: string;
    [key: string]: any;
  };
  embedding?: number[];
}

/**
 * Vector storage operations for documents
 */
export interface DocumentVectorStore {
  storeDocument(documentId: string, content: string, metadata?: Record<string, any>): Promise<void>;
  searchDocuments(query: string, options?: VectorQueryOptions): Promise<DocumentChunk[]>;
  deleteDocument(documentId: string): Promise<void>;
  getDocument(documentId: string): Promise<DocumentChunk[]>;
}

/**
 * Similarity functions supported by vector databases
 */
export type SimilarityFunction = 'cosine' | 'euclidean' | 'dot_product' | 'manhattan';

/**
 * Vector database metadata types
 */
export interface VectorMetadata {
  [key: string]: string | number | boolean | string[] | number[];
}

/**
 * Error types for vector operations
 */
export class VectorDBError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'VectorDBError';
  }
}

export class VectorNotFoundError extends VectorDBError {
  constructor(id: string) {
    super(`Vector with id "${id}" not found`, 'VECTOR_NOT_FOUND', { id });
    this.name = 'VectorNotFoundError';
  }
}

export class VectorDimensionMismatchError extends VectorDBError {
  constructor(expected: number, actual: number) {
    super(`Vector dimension mismatch: expected ${expected}, got ${actual}`, 'DIMENSION_MISMATCH', {
      expected,
      actual,
    });
    this.name = 'VectorDimensionMismatchError';
  }
}

/**
 * Vector database factory interface
 */
export interface VectorDBFactory {
  create(config: VectorStoreConfig): VectorDB;
  supports(provider: string): boolean;
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = any> {
  successful: number;
  failed: number;
  results: T[];
  errors: Array<{ index: number; error: Error }>;
}

/**
 * Vector database performance metrics
 */
export interface VectorPerformanceMetrics {
  queryLatency: number;
  upsertLatency: number;
  indexSize: number;
  memoryUsage: number;
  requestCount: number;
  errorRate: number;
}

/**
 * Type aliases for convenience
 */
export type VectorId = string;
export type Vector = number[];
export type VectorQuery = Vector | string;
export type VectorFilter = string;
export type Namespace = string;
