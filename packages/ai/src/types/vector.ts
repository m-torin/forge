/**
 * Vector-related types for @repo/ai
 * Central definitions for vector operations and search results
 */

export interface VectorSearchResult {
  id: string;
  score: number;
  content?: string;
  metadata?: Record<string, any>;
  embedding?: number[];
}

export interface VectorEnrichedMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  vectorContext?: VectorSearchResult[];
  metadata?: Record<string, any>;
}

export interface ServerVectorConfig {
  dimension?: number;
  metric?: 'cosine' | 'euclidean' | 'dotproduct';
  namespace?: string;
  baseUrl?: string;
  apiKey?: string;
}

export interface VectorContext {
  results: VectorSearchResult[];
  query?: string;
  totalResults: number;
  searchTime?: number;
}

export interface VectorSearchToolResult {
  results: VectorSearchResult[];
  count: number;
  query: string;
}

export interface VectorUpsertToolResult {
  id: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface VectorToolResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface VectorizedContent {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface ChatWithVectorContext {
  messages: VectorEnrichedMessage[];
  vectorContext?: VectorContext;
}

// Vector Database interface
export interface VectorDB {
  query(
    embedding: number[],
    options?: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
      includeValues?: boolean;
    },
  ): Promise<VectorQueryResult[]>;

  upsert(records: VectorRecord[]): Promise<{ success: boolean }>;

  delete(ids: string[]): Promise<void>;

  fetch(ids: string[]): Promise<VectorRecord[]>;

  describe?(): Promise<any>;
}

export interface VectorQueryResult {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, any>;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

// RAG types
interface RAGContext {
  query: string;
  relevantDocuments: VectorContext[];
  confidence: number;
}

export interface RAGResponse {
  answer: string;
  context: RAGContext;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface RAGWorkflowConfig {
  vectorStore: VectorDB;
  embeddingModel?: string;
  languageModel?: any;
  topK?: number;
  similarityThreshold?: number;
  systemPrompt?: string;
}
