import type { CompletionOptions, CompletionResponse } from '../../shared/types';
import type { DocumentChunk } from '../document/types';
import type { VectorSearchResult } from '../vector/types';

export interface RAGConfig {
  // Vector database settings
  vectorDB?: {
    url?: string;
    token?: string;
    namespace?: string;
  };

  // Embedding settings
  embedding?: {
    model?: string;
    provider?: 'openai' | 'ai-sdk';
  };

  // Chunking settings
  chunking?: {
    chunkSize?: number;
    chunkOverlap?: number;
    semantic?: boolean;
  };

  // Retrieval settings
  retrieval?: {
    topK?: number;
    similarityThreshold?: number;
    includeMetadata?: boolean;
  };

  // Generation settings
  generation?: {
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  source?: string;
}

export interface RAGSearchResult extends VectorSearchResult {
  content?: string;
  chunk?: DocumentChunk;
}

export interface RAGContext {
  query: string;
  retrievedChunks: RAGSearchResult[];
  totalResults: number;
  searchTime: number;
}

export interface RAGResponse extends CompletionResponse {
  context: RAGContext;
  retrievalMetadata?: {
    totalDocuments: number;
    avgSimilarity: number;
    sources: string[];
  };
}

export interface RAGPipeline {
  // Document management
  addDocuments(documents: RAGDocument[]): Promise<void>;
  removeDocuments(ids: string[]): Promise<void>;

  // Querying
  query(query: string, options?: Partial<CompletionOptions>): Promise<RAGResponse>;

  // Information
  getStats(): Promise<{ totalDocuments: number; dimension: number }>;
}
