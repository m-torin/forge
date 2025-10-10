import type { VectorSearchResult } from '../types/vector';

// Base types for RAG operations
export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
}

export interface CompletionResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  startIndex: number;
  endIndex: number;
}

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
    maxOutputTokens?: number;
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
