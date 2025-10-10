/**
 * Upstash Vector database type definitions and interfaces
 */

// Re-export Upstash Vector types
export type {
  DeleteOptions,
  FetchOptions,
  Index,
  InfoResult,
  Metadata,
  QueryOptions,
  QueryResult,
  StatsResult,
  UpsertOptions,
  Vector,
} from '@upstash/vector';

/**
 * Upstash Vector configuration
 */
export interface UpstashVectorConfig {
  url: string;
  token: string;
  cache?: boolean;
  retries?: number;
  retryDelay?: number;
}

/**
 * Vector embedding configuration
 */
export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  maxTokens?: number;
  provider: 'openai' | 'cohere' | 'huggingface' | 'custom';
  apiKey?: string;
  baseURL?: string;
}

/**
 * Vector with metadata and content
 */
export interface VectorRecord<T extends Record<string, any> = Record<string, any>> {
  id: string;
  vector: number[];
  metadata?: T;
  data?: string;
}

/**
 * Similarity search options
 */
export interface SimilaritySearchOptions {
  topK?: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
  namespace?: string;
  threshold?: number; // Minimum similarity score
}

/**
 * Similarity search result
 */
export interface SimilarityResult<T extends Record<string, any> = Record<string, any>> {
  id: string;
  score: number;
  vector?: number[];
  metadata?: T;
  data?: string;
}

/**
 * Batch upsert operation
 */
export interface BatchUpsertOperation<T extends Record<string, any> = Record<string, any>> {
  vectors: VectorRecord<T>[];
  namespace?: string;
  batchSize?: number;
}

/**
 * Vector search query
 */
export interface VectorQuery {
  vector?: number[];
  data?: string; // Text to embed and search
  topK?: number;
  filter?: string;
  includeVectors?: boolean;
  includeMetadata?: boolean;
  includeData?: boolean;
  namespace?: string;
}

/**
 * Embedding generation options
 */
export interface EmbeddingOptions {
  text: string | string[];
  model?: string;
  dimensions?: number;
  normalize?: boolean;
  truncate?: boolean;
}

/**
 * Embedding result
 */
export interface EmbeddingResult {
  embeddings: number[][];
  usage?: {
    promptTokens: number;
    totalTokens: number;
  };
  model: string;
  dimensions: number;
}

/**
 * Vector index statistics
 */
export interface VectorIndexStats {
  vectorCount: number;
  pendingVectorCount: number;
  indexSize: number;
  dimension: number;
  similarityFunction: string;
  namespaces: Record<
    string,
    {
      vectorCount: number;
      pendingVectorCount: number;
    }
  >;
}

/**
 * Vector operation result wrapper
 */
export type VectorResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Namespace management
 */
export interface NamespaceInfo {
  name: string;
  vectorCount: number;
  dimension: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vector clustering options
 */
export interface ClusteringOptions {
  k: number; // Number of clusters
  maxIterations?: number;
  tolerance?: number;
  initMethod?: 'random' | 'kmeans++';
  namespace?: string;
}

/**
 * Clustering result
 */
export interface ClusteringResult {
  clusters: Array<{
    centroid: number[];
    vectorIds: string[];
    size: number;
  }>;
  iterations: number;
  converged: boolean;
}

/**
 * Vector analytics and insights
 */
export interface VectorAnalytics {
  totalVectors: number;
  averageQueryTime: number;
  popularQueries: Array<{
    query: string;
    frequency: number;
  }>;
  dimensionStats: {
    min: number;
    max: number;
    avg: number;
    std: number;
  };
}

/**
 * Semantic search configuration
 */
export interface SemanticSearchConfig {
  embeddingModel: string;
  chunkSize?: number;
  chunkOverlap?: number;
  maxResults?: number;
  threshold?: number;
  rerank?: boolean;
  rerankModel?: string;
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
    startChar: number;
    endChar: number;
    title?: string;
    url?: string;
    [key: string]: any;
  };
}

/**
 * Hybrid search (vector + keyword) options
 */
export interface HybridSearchOptions extends SimilaritySearchOptions {
  keywords?: string[];
  keywordWeight?: number; // 0-1, weight for keyword vs vector search
  boostFields?: Record<string, number>; // Field boosting for metadata
}

/**
 * Vector index configuration
 */
export interface VectorIndexConfig {
  dimension: number;
  metric: 'cosine' | 'euclidean' | 'dotproduct';
  replicas?: number;
  podType?: 'p1' | 'p2' | 's1';
  pods?: number;
  metadataConfig?: {
    indexed: string[];
  };
}

/**
 * Backup and restore operations
 */
export interface BackupOptions {
  namespace?: string;
  includeMetadata?: boolean;
  includeVectors?: boolean;
  format?: 'json' | 'parquet' | 'csv';
  compression?: 'gzip' | 'brotli';
}

/**
 * Vector database client interface
 */
export interface VectorClient {
  // Basic operations
  upsert(vectors: VectorRecord[]): Promise<void>;
  query(options: VectorQuery): Promise<SimilarityResult[]>;
  fetch(ids: string[], namespace?: string): Promise<VectorRecord[]>;
  delete(ids: string[], namespace?: string): Promise<void>;

  // Advanced operations
  similaritySearch(
    vector: number[],
    options?: SimilaritySearchOptions,
  ): Promise<SimilarityResult[]>;
  semanticSearch(text: string, options?: SimilaritySearchOptions): Promise<SimilarityResult[]>;
  hybridSearch(query: string, options?: HybridSearchOptions): Promise<SimilarityResult[]>;

  // Management
  info(): Promise<VectorIndexStats>;
  reset(): Promise<void>;
  listNamespaces(): Promise<NamespaceInfo[]>;

  // Analytics
  getAnalytics(): Promise<VectorAnalytics>;
  cluster(options: ClusteringOptions): Promise<ClusteringResult>;
}

/**
 * Runtime environment detection
 */
export type RuntimeEnvironment = 'nodejs' | 'browser' | 'edge' | 'worker';

/**
 * AI model providers
 */
export type AIProvider = 'openai' | 'anthropic' | 'cohere' | 'huggingface' | 'custom';

/**
 * AI model configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
  dimensions?: number;
}
