/**
 * @fileoverview Enterprise-Grade Upstash Vector Integration with Advanced Features
 *
 * **Primary Use**: Enhanced vector toolkit with observability, telemetry, and factory patterns
 *
 * **Key Features**:
 * - Enhanced UpstashAIVector class with comprehensive error handling
 * - Advanced telemetry integration (trackRAGOperation, 7 tracking points)
 * - Enterprise observability with structured logging (logWarn)
 * - Factory pattern functions for different initialization scenarios
 * - AI SDK tool generation with sophisticated configurations
 * - Registry pattern support for provider management
 *
 * **Usage Pattern**:
 * Exported through main package index for external consumption. Not directly
 * imported by internal modules - serves as enhanced toolkit for advanced use cases.
 *
 * **Architecture**: Enterprise-focused with observability, telemetry, and
 * registry patterns. Higher abstraction level than basic vector integration.
 *
 * **Factory Functions**:
 * - createUpstashVectorTools() - AI SDK tool generation
 * - createUpstashAIVectorFromEnv() - Environment-based initialization
 * - createUpstashAIVectorWithRegistry() - Registry pattern support
 *
 * @example
 * ```typescript
 * import { createUpstashAIVectorFromEnv, createUpstashVectorTools } from '@repo/ai/server';
 *
 * const vectorStore = createUpstashAIVectorFromEnv(config);
 * const tools = createUpstashVectorTools(enhancedConfig);
 * ```
 */

import { openai } from '@ai-sdk/openai';
import { logWarn } from '@repo/observability/server/next';
import { Index } from '@upstash/vector';
import type { EmbeddingModel } from 'ai';
import { embed, embedMany, tool } from 'ai';
import { z } from 'zod/v4';
import { trackRAGOperation } from '../../rag/telemetry';

// Enhanced configuration with AI SDK embedding models
export interface UpstashAIConfig {
  vectorUrl: string;
  vectorToken: string;
  embeddingModel?:
    | 'text-embedding-3-small'
    | 'text-embedding-3-large'
    | 'text-embedding-ada-002'
    | EmbeddingModel<string>;
  namespace?: string;
  dimensions?: number;
}

export class UpstashAIVector {
  private index: Index;
  private embeddingModel: EmbeddingModel<string>;
  private namespace?: string;
  private dimensions: number;

  constructor(config: UpstashAIConfig) {
    this.index = new Index({
      url: config.vectorUrl,
      token: config.vectorToken,
    });

    // Support both string model names and EmbeddingModel instances
    if (typeof config.embeddingModel === 'string' || !config.embeddingModel) {
      this.embeddingModel = openai.embedding(config.embeddingModel || 'text-embedding-3-small');
    } else {
      this.embeddingModel = config.embeddingModel;
    }

    this.namespace = config.namespace;
    this.dimensions = config.dimensions || 1536;
  }

  /**
   * Upsert data with AI SDK embedding generation
   */
  async upsertWithEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
  ) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for embedding');
      }

      // Generate embeddings using AI SDK
      const { embeddings } = await embedMany({
        model: this.embeddingModel,
        values: data.map(item => item.content),
      });

      if (embeddings.length !== data.length) {
        throw new Error('Embedding count mismatch with input data');
      }

      // Format for Upstash Vector
      const vectorData = data.map((item, index) => ({
        id: item.id,
        vector: embeddings[index],
        metadata: {
          ...item.metadata,
          content: item.content,
          timestamp: new Date().toISOString(),
        },
      }));

      // Upsert to vector store
      if (this.namespace) {
        await this.index.namespace(this.namespace).upsert(vectorData);
      } else {
        await this.index.upsert(vectorData);
      }

      return {
        success: true,
        count: vectorData.length,
        ids: vectorData.map(item => item.id),
      };
    } catch (error) {
      logWarn('Failed to upsert with embedding', {
        operation: 'upstash_ai_vector_upsert',
        error: error instanceof Error ? error.message : 'Unknown error',
        dataCount: data?.length || 0,
      });
      throw error;
    }
  }

  /**
   * Upsert data directly using Upstash hosted embeddings
   */
  async upsertWithUpstashEmbedding(
    data: Array<{
      id: string;
      content: string;
      metadata?: Record<string, any>;
    }>,
  ) {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data provided for Upstash embedding');
      }

      // Format for Upstash Vector with data field (for hosted embeddings)
      const vectorData = data.map(item => ({
        id: item.id,
        data: item.content, // Using data field for Upstash hosted embeddings
        metadata: {
          ...item.metadata,
          content: item.content,
          timestamp: new Date().toISOString(),
        },
      }));

      // Upsert to vector store
      if (this.namespace) {
        await this.index.namespace(this.namespace).upsert(vectorData);
      } else {
        await this.index.upsert(vectorData);
      }

      return {
        success: true,
        count: vectorData.length,
        ids: vectorData.map(item => item.id),
      };
    } catch (error) {
      logWarn('Failed to upsert with Upstash embedding', {
        operation: 'upstash_ai_vector_upsert_hosted',
        error: error instanceof Error ? error.message : 'Unknown error',
        dataCount: data?.length || 0,
      });
      throw error;
    }
  }

  /**
   * Query with AI SDK embedding generation
   */
  async queryWithEmbedding(
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, any>;
    } = {},
  ): Promise<
    Array<{
      id: string;
      score: number;
      content: string;
      metadata: any;
    }>
  > {
    return trackRAGOperation('vector_query_embedding', async tracker => {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty');
      }

      const topK = options.topK || 5;
      tracker.setQuery(query, 'embedding').setSearchParams(topK);

      // Generate query embedding
      const embeddingStart = Date.now();
      const { embedding } = await embed({
        model: this.embeddingModel,
        value: query,
      });
      const embeddingDuration = Date.now() - embeddingStart;

      // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
      const estimatedTokens = Math.ceil(query.length / 4);
      tracker.setEmbedding(estimatedTokens, 'text-embedding-3-small', embeddingDuration);

      // Query vector store
      const queryOptions = {
        vector: embedding,
        topK,
        includeMetadata: true,
        ...(options.filter && { filter: JSON.stringify(options.filter) }),
      };

      let results;
      if (this.namespace) {
        results = await this.index.namespace(this.namespace).query(queryOptions);
      } else {
        results = await this.index.query(queryOptions);
      }

      const formattedResults = results.map(result => ({
        id: String(result.id),
        score: result.score || 0,
        content: String(result.metadata?.content || ''),
        metadata: result.metadata,
      }));

      tracker.setSearchResults(formattedResults);
      return formattedResults;
    });
  }

  /**
   * Query using Upstash hosted embeddings
   */
  async queryWithUpstashEmbedding(
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, any>;
    } = {},
  ): Promise<
    Array<{
      id: string;
      score: number;
      content: string;
      metadata: any;
    }>
  > {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query cannot be empty for Upstash embedding');
      }

      // Query vector store using data field
      const queryOptions = {
        data: query, // Using data field for Upstash hosted embeddings
        topK: options.topK || 5,
        includeMetadata: true,
        ...(options.filter && { filter: JSON.stringify(options.filter) }),
      };

      let results;
      if (this.namespace) {
        results = await this.index.namespace(this.namespace).query(queryOptions);
      } else {
        results = await this.index.query(queryOptions);
      }

      return results.map(result => ({
        id: String(result.id),
        score: result.score || 0,
        content: String(result.metadata?.content || ''),
        metadata: result.metadata,
      }));
    } catch (error) {
      logWarn('Failed to query with Upstash embedding', {
        operation: 'upstash_ai_vector_query_hosted',
        error: error instanceof Error ? error.message : 'Unknown error',
        query: query?.substring(0, 100), // Log first 100 chars for debugging
      });
      throw error;
    }
  }

  /**
   * Delete vectors by IDs
   */
  async delete(ids: string[]) {
    if (this.namespace) {
      await this.index.namespace(this.namespace).delete(ids);
    } else {
      await this.index.delete(ids);
    }

    return {
      success: true,
      deletedIds: ids,
    };
  }

  /**
   * Chunk text into smaller pieces for better embeddings
   */
  private chunkText(text: string, maxLength: number = 1000): string[] {
    // Simple sentence-based chunking
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + sentence;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Add large documents with automatic chunking
   */
  async addDocument(
    document: {
      id: string;
      content: string;
      metadata?: Record<string, any>;
      chunkSize?: number;
    },
    useUpstashEmbedding: boolean = false,
  ) {
    const chunks = this.chunkText(document.content, document.chunkSize);

    const chunkData = chunks.map((chunk, index) => ({
      id: `${document.id}-chunk-${index}`,
      content: chunk,
      metadata: {
        ...document.metadata,
        documentId: document.id,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }));

    if (useUpstashEmbedding) {
      return this.upsertWithUpstashEmbedding(chunkData);
    } else {
      return this.upsertWithEmbedding(chunkData);
    }
  }
}

/**
 * AI SDK Tools for RAG operations
 */
export function createUpstashVectorTools(
  config: UpstashAIConfig,
  useUpstashEmbedding: boolean = false,
): {
  addResource: any;
  addDocument: any;
  getInformation: any;
} {
  const vectorStore = new UpstashAIVector(config);

  return {
    addResource: tool({
      description: `add a resource to your knowledge base.
        If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      inputSchema: z.object({
        content: z.string().describe('the content or resource to add to the knowledge base'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the content'),
      }),
      execute: async ({
        content,
        metadata,
      }: {
        content: string;
        metadata?: Record<string, any>;
      }) => {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (useUpstashEmbedding) {
          await vectorStore.upsertWithUpstashEmbedding([{ id, content, metadata }]);
        } else {
          await vectorStore.upsertWithEmbedding([{ id, content, metadata }]);
        }

        return `Resource successfully created and embedded.`;
      },
    }),

    addDocument: tool({
      description: 'Add a large document to the knowledge base with automatic chunking',
      inputSchema: z.object({
        content: z.string().describe('The document content to add'),
        title: z.string().optional().describe('Document title'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the document'),
      }),
      execute: async ({
        content,
        title,
        metadata,
      }: {
        content: string;
        title?: string;
        metadata?: Record<string, any>;
      }) => {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await vectorStore.addDocument(
          {
            id,
            content,
            metadata: {
              ...metadata,
              title,
            },
          },
          useUpstashEmbedding,
        );

        return `Added document "${title || id}" to knowledge base. Created ${result.count} chunks.`;
      },
    }),

    getInformation: tool({
      description: `get information from your knowledge base to answer questions.`,
      inputSchema: z.object({
        question: z.string().describe('the users question'),
        topK: z.number().optional().describe('Number of results to return (default: 5)'),
      }),
      execute: async ({ question, topK }: { question: string; topK?: number }) => {
        let results;
        if (useUpstashEmbedding) {
          results = await vectorStore.queryWithUpstashEmbedding(question, { topK });
        } else {
          results = await vectorStore.queryWithEmbedding(question, { topK });
        }

        return results.map(result => ({
          content: result.content,
          score: result.score,
          metadata: result.metadata,
        }));
      },
    }),
  };
}

/**
 * Create Upstash AI Vector instance from environment variables
 */
export function createUpstashAIVectorFromEnv(
  config?: Partial<UpstashAIConfig>,
): UpstashAIVector | null {
  const vectorUrl = config?.vectorUrl ?? process.env.UPSTASH_VECTOR_REST_URL;
  const vectorToken = config?.vectorToken ?? process.env.UPSTASH_VECTOR_REST_TOKEN;

  if (!vectorUrl || !vectorToken) {
    logWarn('UpstashAIVector missing environment variables', {
      operation: 'upstash_ai_vector_creation',
      hasVectorUrl: !!vectorUrl,
      hasVectorToken: !!vectorToken,
    });
    return null;
  }

  return new UpstashAIVector({
    vectorUrl,
    vectorToken,
    namespace: config?.namespace ?? process.env.UPSTASH_VECTOR_NAMESPACE,
    embeddingModel: config?.embeddingModel ?? 'text-embedding-3-small',
    dimensions: config?.dimensions ?? 1536,
  });
}

/**
 * Create Upstash AI Vector instance with provider registry support
 */
export function createUpstashAIVectorWithRegistry(config: {
  vectorUrl: string;
  vectorToken: string;
  embeddingModel: EmbeddingModel<string>;
  namespace?: string;
  dimensions?: number;
}): UpstashAIVector {
  return new UpstashAIVector(config);
}
