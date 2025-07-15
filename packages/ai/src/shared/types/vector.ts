/**
 * Type-Safe Vector Integration for AI SDK
 * Enhanced TypeScript support for vector operations across environments
 */

import type { z } from 'zod';

// Core vector types that work across all environments
export interface BaseVectorRecord<TMetadata = Record<string, any>> {
  id: string;
  values: number[];
  metadata?: TMetadata;
}

export interface BaseVectorSearchOptions {
  topK?: number;
  includeValues?: boolean;
  includeMetadata?: boolean;
  filter?: Record<string, any>;
}

export interface BaseVectorSearchResult<TMetadata = Record<string, any>> {
  id: string;
  score: number;
  values?: number[];
  metadata?: TMetadata;
}

// Enhanced AI SDK integration types
export interface VectorizedContent<TMetadata = Record<string, any>> {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: TMetadata;
  timestamp?: string;
}

export interface VectorContext<TMetadata = Record<string, any>> {
  id: string;
  content: string;
  score: number;
  metadata?: TMetadata;
}

export interface VectorizedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  vectorContext?: VectorContext[];
}

export interface VectorEnrichedMessage<TMetadata = Record<string, any>>
  extends Omit<VectorizedMessage, 'vectorContext'> {
  enrichedContent?: string;
  contextScore?: number;
  vectorContext?: VectorSearchResult<TMetadata>[];
  contextQuery?: string;
}

export interface VectorSearchContext<TMetadata = Record<string, any>> {
  query: string;
  results: VectorSearchResult<TMetadata>[];
  totalFound: number;
  searchTime: number;
  threshold?: number;
}

export interface VectorSearchResult<TMetadata = Record<string, any>> {
  id: string;
  content: string;
  score: number;
  metadata: TMetadata;
  embedding?: number[];
}

// AI SDK Chat integration types - merged with the one above
// export interface VectorEnrichedMessage<TMetadata = Record<string, any>> {
//     role: 'user' | 'assistant' | 'system' | 'tool';
//     content: string;
//     vectorContext?: VectorSearchResult<TMetadata>[];
//     contextQuery?: string;
//     contextScore?: number;
// }

export interface ChatWithVectorContext<TMetadata = Record<string, any>> {
  messages: VectorEnrichedMessage<TMetadata>[];
  vectorContext: VectorSearchContext<TMetadata>;
  hasRelevantContext: boolean;
  confidenceScore: number;
}

// Embedding workflow types
export interface EmbeddingOperation<TInput = string, TMetadata = Record<string, any>> {
  input: TInput;
  embedding: number[];
  metadata?: TMetadata;
  model: string;
  dimensions: number;
  processingTime: number;
}

export interface BatchEmbeddingOperation<TInput = string, TMetadata = Record<string, any>> {
  inputs: TInput[];
  embeddings: number[][];
  metadata?: TMetadata[];
  model: string;
  dimensions: number;
  totalProcessingTime: number;
  averagePerItem: number;
}

// Vector database abstraction types
export interface VectorDBOperations<TMetadata = Record<string, any>> {
  upsert(records: BaseVectorRecord<TMetadata>[]): Promise<UpsertResult>;
  query(
    vector: number[],
    options?: BaseVectorSearchOptions,
  ): Promise<BaseVectorSearchResult<TMetadata>[]>;
  delete(ids: string[]): Promise<DeleteResult>;
  fetch(ids: string[]): Promise<BaseVectorRecord<TMetadata>[]>;
  describe?(): Promise<VectorDBStats>;

  // Additional methods for advanced vector operations
  range?(options: {
    cursor?: string;
    limit?: number;
    includeMetadata?: boolean;
    includeVectors?: boolean;
    includeData?: boolean;
  }): Promise<{
    nextCursor: string;
    vectors: BaseVectorRecord<TMetadata>[];
  }>;

  listNamespaces?(): Promise<string[]>;

  deleteNamespace?(namespace: string): Promise<boolean>;

  update?(
    id: string,
    updates: {
      vector?: number[];
      metadata?: TMetadata;
      data?: string;
      metadataUpdateMode?: 'PATCH' | 'OVERWRITE';
    },
  ): Promise<boolean>;

  reset?(options?: { all?: boolean }): Promise<boolean>;
}

export interface UpsertResult {
  success: boolean;
  count: number;
  ids: string[];
  errors?: Array<{ id: string; error: string }>;
}

export interface DeleteResult {
  success: boolean;
  deletedCount: number;
  deletedIds: string[];
  errors?: Array<{ id: string; error: string }>;
}

export interface VectorDBStats {
  dimension: number;
  totalVectorCount: number;
  indexType?: string;
  similarityFunction?: 'cosine' | 'euclidean' | 'dotproduct';
}

// AI SDK tool integration types
export interface VectorToolResult<TData = any> {
  success: boolean;
  data?: TData;
  error?: string;
  metadata?: Record<string, any>;
  processingTime?: number;
}

export interface VectorSearchToolResult<TMetadata = Record<string, any>>
  extends VectorToolResult<VectorSearchResult<TMetadata>[]> {
  query: string;
  totalResults: number;
  hasRelevantResults: boolean;
  averageScore: number;
  threshold: number;
}

export interface VectorUpsertToolResult extends VectorToolResult<{ ids: string[]; count: number }> {
  chunksCreated: number;
  embeddingModel: string;
  dimensions: number;
}

// Configuration types for different environments
export interface BaseVectorConfig {
  embeddingModel?: string;
  dimensions?: number;
  similarityThreshold?: number;
  defaultTopK?: number;
  cacheEmbeddings?: boolean;
}

export interface ServerVectorConfig extends BaseVectorConfig {
  vectorDB: VectorDBOperations;
  batchSize?: number;
  concurrency?: number;
  retryAttempts?: number;
}

export interface ClientVectorConfig extends BaseVectorConfig {
  apiEndpoint: string;
  apiKey?: string;
  timeout?: number;
}

export interface NextJSVectorConfig extends BaseVectorConfig {
  vectorDB?: VectorDBOperations;
  apiRoute?: string;
  revalidation?: number | false;
}

// Advanced typing for specific use cases
export interface RAGContext<TMetadata = Record<string, any>> {
  documents: VectorizedContent<TMetadata>[];
  query: string;
  relevantContext: VectorSearchResult<TMetadata>[];
  confidence: number;
  sources: string[];
}

export interface RecommendationContext<TItem = any, TMetadata = Record<string, any>> {
  targetItem: TItem;
  similarities: Array<{
    item: TItem;
    score: number;
    reasons: string[];
    metadata: TMetadata;
  }>;
  algorithm: 'cosine' | 'collaborative' | 'content-based' | 'hybrid';
}

// Utility types for better DX
export type VectorizedChat<TMetadata = Record<string, any>> = {
  [K in keyof ChatWithVectorContext<TMetadata>]: ChatWithVectorContext<TMetadata>[K];
};

export type TypedVectorSearch<TMetadata> = (
  query: string,
  options?: BaseVectorSearchOptions,
) => Promise<VectorSearchResult<TMetadata>[]>;

export type TypedVectorUpsert<TMetadata> = (
  content: VectorizedContent<TMetadata>[],
) => Promise<VectorUpsertToolResult>;

// Schema validation types (for runtime type checking)
export interface VectorSchemas {
  metadata: z.ZodSchema;
  content: z.ZodSchema;
  search: z.ZodSchema;
}

// Error types
export class VectorOperationError extends Error {
  constructor(
    message: string,
    public operation: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'VectorOperationError';
  }
}

export class EmbeddingError extends Error {
  constructor(
    message: string,
    public model: string,
    public input: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'EmbeddingError';
  }
}

export class VectorSearchError extends Error {
  constructor(
    message: string,
    public query: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'VectorSearchError';
  }
}

// Re-export commonly used types
export type {
  VectorDBOperations as VectorDB,
  BaseVectorRecord as VectorRecord,
  BaseVectorSearchResult as VectorSearchBaseResult,
  BaseVectorSearchOptions as VectorSearchOptions,
};
