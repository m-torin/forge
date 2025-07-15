/**
 * Enhanced Upstash Vector integration with AI SDK tools
 * Implements the patterns from Vercel AI SDK documentation
 */

import { openai } from '@ai-sdk/openai';
import { logWarn } from '@repo/observability/server/next';
import { Index } from '@upstash/vector';
import { embed, embedMany, tool } from 'ai';
import { z } from 'zod/v4';

// Enhanced configuration with AI SDK embedding models
export interface UpstashAIConfig {
  vectorUrl: string;
  vectorToken: string;
  embeddingModel?: 'text-embedding-3-small' | 'text-embedding-3-large' | 'text-embedding-ada-002';
  namespace?: string;
  dimensions?: number;
}

export class UpstashAIVector {
  private index: Index;
  private embeddingModel: any;
  private namespace?: string;
  private dimensions: number;

  constructor(config: UpstashAIConfig) {
    this.index = new Index({
      url: config.vectorUrl,
      token: config.vectorToken,
    });

    this.embeddingModel = openai.embedding(config.embeddingModel || 'text-embedding-3-small');

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
    // Generate embeddings using AI SDK
    const { embeddings } = await embedMany({
      model: this.embeddingModel,
      values: data.map(item => item.content),
    });

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
    // Generate query embedding
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: query,
    });

    // Query vector store
    const queryOptions = {
      vector: embedding,
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
  addToKnowledgeBase: any;
  addDocument: any;
  searchKnowledgeBase: any;
} {
  const vectorStore = new UpstashAIVector(config);

  return {
    addToKnowledgeBase: tool({
      description: 'Add content to the vector knowledge base',
      parameters: z.object({
        content: z.string().describe('The content to add to the knowledge base'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the content'),
      }),
      execute: async ({ content, metadata }) => {
        const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (useUpstashEmbedding) {
          await vectorStore.upsertWithUpstashEmbedding([{ id, content, metadata }]);
        } else {
          await vectorStore.upsertWithEmbedding([{ id, content, metadata }]);
        }

        return `Added content to knowledge base with ID: ${id}`;
      },
    }),

    addDocument: tool({
      description: 'Add a large document to the knowledge base with automatic chunking',
      parameters: z.object({
        content: z.string().describe('The document content to add'),
        title: z.string().optional().describe('Document title'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the document'),
      }),
      execute: async ({ content, title, metadata }) => {
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

    searchKnowledgeBase: tool({
      description: 'Search the vector knowledge base for relevant information',
      parameters: z.object({
        query: z.string().describe('The search query'),
        topK: z.number().optional().describe('Number of results to return (default: 5)'),
      }),
      execute: async ({ query, topK }) => {
        let results;
        if (useUpstashEmbedding) {
          results = await vectorStore.queryWithUpstashEmbedding(query, { topK });
        } else {
          results = await vectorStore.queryWithEmbedding(query, { topK });
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
