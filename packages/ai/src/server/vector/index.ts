/**
 * Vector Database Module
 * Exports for vector database functionality
 */

// Core vector integration
export * from './ai-sdk-integration';
export * from './types';

// Re-export for convenience
export {
  UpstashAIVector,
  createUpstashVectorTools,
  generateChunks,
  generateEmbeddingsForChunks,
  upstashVector,
} from './ai-sdk-integration';

export type {
  DocumentChunk,
  DocumentVectorStore,
  VectorDB,
  VectorDBConfig,
  VectorQueryOptions,
  VectorRangeOptions,
  VectorRecord,
  VectorUpsertOptions,
} from './types';
