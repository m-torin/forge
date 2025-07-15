/**
 * Client-side AI exports (non-Next.js)
 *
 * This file provides client-side AI functionality for non-Next.js environments.
 * For Next.js applications, use '@repo/ai/client/next' instead.
 */

// Client-side exports
/**
 * Browser Client for AI Package with Vector Support
 * For use in browser environments (non-Next.js)
 *
 * Enhanced with AI SDK vector integrations:
 * - Embedding-First Design
 * - Type-Safe Vector Operations
 * - Multi-Provider Flexibility
 */

// Import error classes as regular imports
import { EmbeddingError, VectorOperationError, VectorSearchError } from './shared/types/vector';

// Import types directly from vector file
import type {
  ClientVectorConfig,
  TypedVectorSearch,
  TypedVectorUpsert,
  VectorizedContent,
  VectorSearchResult,
} from './shared/types/vector';

export * from './client/index';
export * from './shared/types';

// Enhanced Vector AI SDK Integration (New Features)
export type {
  BatchEmbeddingOperation,
  ChatWithVectorContext,
  ClientVectorConfig,
  EmbeddingError,
  EmbeddingOperation,
  RAGContext,
  RecommendationContext,
  TypedVectorSearch,
  TypedVectorUpsert,
  VectorDB,
  VectorEnrichedMessage,
  VectorizedContent,
  VectorOperationError,
  VectorRecord,
  VectorSearchError,
  VectorSearchOptions,
  VectorSearchResult,
  VectorSearchToolResult,
  VectorToolResult,
  VectorUpsertToolResult,
} from './shared/types/vector';

// Client-specific vector utilities
export interface ClientVectorTools {
  search: TypedVectorSearch<any>;
  upsert: TypedVectorUpsert<any>;
  recommend: (targetId: string, options?: { topK?: number }) => Promise<VectorSearchResult[]>;
}

/**
 * Create vector tools for browser environment
 * Communicates with vector database through API endpoints
 */
export function createClientVectorTools(config: ClientVectorConfig): ClientVectorTools {
  const {
    apiEndpoint,
    apiKey,
    timeout = 30000,
    embeddingModel = 'text-embedding-3-small',
    defaultTopK = 5,
    similarityThreshold = 0.7,
  } = config;

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  };

  return {
    async search(query: string, options?: any) {
      const response = await fetch(`${apiEndpoint}/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          topK: options?.topK || defaultTopK,
          filter: options?.filter,
          threshold: similarityThreshold,
          embeddingModel,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new VectorSearchError(`Search failed: ${response.statusText}`, query, response);
      }

      const data = await response.json();
      return data.results || [];
    },

    async upsert(content: VectorizedContent[]) {
      const response = await fetch(`${apiEndpoint}/upsert`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content,
          embeddingModel,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new VectorOperationError(`Upsert failed: ${response.statusText}`, 'upsert', response);
      }

      return await response.json();
    },

    async recommend(targetId: string, options = {}) {
      const response = await fetch(`${apiEndpoint}/recommend`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          targetId,
          topK: options.topK || defaultTopK,
          threshold: similarityThreshold,
        }),
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new VectorSearchError(
          `Recommendation failed: ${response.statusText}`,
          targetId,
          response,
        );
      }

      const data = await response.json();
      return data.results || [];
    },
  };
}

/**
 * Embedding-First API for browser clients
 * Prioritizes embedding generation in all operations
 */
export class BrowserEmbeddingWorkflow {
  constructor(
    private apiEndpoint: string,
    private apiKey?: string,
    private embeddingModel: string = 'text-embedding-3-small',
  ) {}

  async generateEmbeddings(
    content: string | string[],
  ): Promise<{ embeddings: number[][]; model: string; dimensions: number }> {
    const contents = Array.isArray(content) ? content : [content];

    const response = await fetch(`${this.apiEndpoint}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        content: contents,
        model: this.embeddingModel,
      }),
    });

    if (!response.ok) {
      throw new EmbeddingError(
        `Embedding generation failed: ${response.statusText}`,
        this.embeddingModel,
        Array.isArray(content) ? content.join(', ') : content,
        response,
      );
    }

    return await response.json();
  }

  async semanticSearch(
    query: string,
    options: { topK?: number; threshold?: number } = {},
  ): Promise<VectorSearchResult[]> {
    const { topK = 5, threshold = 0.7 } = options;

    const response = await fetch(`${this.apiEndpoint}/semantic-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        query,
        model: this.embeddingModel,
        topK,
        threshold,
      }),
    });

    if (!response.ok) {
      throw new VectorSearchError(
        `Semantic search failed: ${response.statusText}`,
        query,
        response,
      );
    }

    const data = await response.json();
    return data.results || [];
  }
}
