/**
 * @fileoverview Core Upstash Vector Integration for RAG Operations
 *
 * **Primary Use**: Production RAG implementation with basic vector operations
 *
 * **Key Features**:
 * - Basic UpstashAIVector class for core vector operations
 * - Simple embedding generation with AI SDK v5
 * - Text chunking utilities for document processing
 * - Graceful config handling with environment fallbacks
 *
 * **Usage Pattern**:
 * Actively imported by RAG modules (ai-sdk-rag.ts, message-processing.ts,
 * middleware.ts, structured-rag.ts) for production vector operations.
 *
 * **Architecture**: Basic implementation focused on core functionality,
 * minimal dependencies, suitable for direct RAG system integration.
 *
 * @example
 * ```typescript
 * import { UpstashAIVector, createUpstashVectorTools } from '../vector/ai-sdk-integration';
 *
 * const vectorStore = new UpstashAIVector(config);
 * const tools = createUpstashVectorTools(config);
 * ```
 */

import { openai } from '@ai-sdk/openai';
import { logWarn } from '@repo/observability/server';
import { Index } from '@upstash/vector';
import type { EmbeddingModel } from 'ai';
import { embed, embedMany, tool } from 'ai';
import { z } from 'zod/v3';

/**
 * Upstash Vector configuration
 */
export interface UpstashAIConfig {
  vectorUrl?: string;
  vectorToken?: string;
  url?: string;
  token?: string;
  embeddingModel?: EmbeddingModel<string>;
  namespace?: string;
}

/**
 * Vector record with metadata
 */
interface VectorRecord {
  id: string | number;
  vector?: number[];
  data?: string;
  metadata?: Record<string, any>;
  score?: number;
}

/**
 * Query options for vector search
 */
interface QueryOptions {
  topK?: number;
  includeMetadata?: boolean;
  includeVectors?: boolean;
  includeData?: boolean;
  filter?: string;
  namespace?: string;
}

/**
 * Upstash Vector AI Integration Class
 */
export class UpstashAIVector {
  private index: Index | null = null;
  private embeddingModel: EmbeddingModel<string>;
  private hasWarnedAboutMissingConfig = false;

  constructor(config: UpstashAIConfig = {}) {
    const url = config.vectorUrl || config.url || process.env.UPSTASH_VECTOR_REST_URL || '';
    const token = config.vectorToken || config.token || process.env.UPSTASH_VECTOR_REST_TOKEN || '';

    // Gracefully handle missing or empty credentials - silent during build
    if (!url || !token) {
      // Silently handle missing config during build time
      this.index = null;
    } else {
      this.index = new Index({
        url,
        token,
      });
    }

    this.embeddingModel = config.embeddingModel || openai.embedding('text-embedding-ada-002');
  }

  /**
   * Generate single embedding using AI SDK
   */
  async generateEmbedding(value: string): Promise<number[]> {
    const input = value.replaceAll('\n', ' ');
    const { embedding } = await embed({
      model: this.embeddingModel,
      value: input,
    });
    return embedding;
  }

  /**
   * Generate multiple embeddings using AI SDK
   */
  async generateEmbeddings(values: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: this.embeddingModel,
      values: values.map(v => v.replaceAll('\n', ' ')),
    });
    return embeddings;
  }

  /**
   * Upsert single vector with custom embedding
   */
  async upsertVector(record: VectorRecord, options?: { namespace?: string }): Promise<void> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    // Ensure data is provided for upsert
    const upsertRecord = { ...record, data: record.data || '' };
    await this.index.upsert(upsertRecord, options);
  }

  /**
   * Upsert multiple vectors with custom embeddings
   */
  async upsertVectors(records: VectorRecord[], options?: { namespace?: string }): Promise<void> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    // Ensure data is provided for each record
    const upsertRecords = records.map(record => ({ ...record, data: record.data || '' }));
    await this.index.upsert(upsertRecords, options);
  }

  /**
   * Upsert data with automatic embedding generation
   */
  async upsertData(
    id: string,
    data: string,
    metadata?: Record<string, any>,
    options?: { namespace?: string },
  ): Promise<void> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    await this.index.upsert(
      {
        id,
        data,
        metadata,
      },
      options,
    );
  }

  /**
   * Upsert multiple data entries with automatic embedding generation
   */
  async upsertDataBatch(
    entries: Array<{ id: string; data: string; metadata?: Record<string, any> }>,
    options?: { namespace?: string },
  ): Promise<void> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    await this.index.upsert(entries, options);
  }

  /**
   * Query vectors using custom embedding
   */
  async queryVector(vector: number[], queryOptions: QueryOptions = {}): Promise<VectorRecord[]> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    const {
      topK = 4,
      includeMetadata = true,
      includeVectors = false,
      filter,
      namespace,
    } = queryOptions;

    const results = await this.index.query(
      {
        vector,
        topK,
        includeMetadata,
        includeVectors,
        filter,
      },
      namespace ? { namespace } : undefined,
    );

    return results.map(result => ({
      id: String(result.id),
      vector: result.vector,
      metadata: result.metadata,
      score: result.score,
    }));
  }

  /**
   * Query using data string (automatic embedding generation)
   */
  async queryData(data: string, queryOptions: QueryOptions = {}): Promise<VectorRecord[]> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    const {
      topK = 4,
      includeMetadata = true,
      includeVectors = false,
      includeData = false,
      filter,
      namespace,
    } = queryOptions;

    const results = await this.index.query(
      {
        data,
        topK,
        includeMetadata,
        includeVectors,
        includeData,
        filter,
      },
      namespace ? { namespace } : undefined,
    );

    return results.map(result => ({
      id: String(result.id),
      vector: result.vector,
      data: result.data,
      metadata: result.metadata,
      score: result.score,
    }));
  }

  /**
   * Fetch vectors by IDs
   */
  async fetch(ids: string[], options?: { namespace?: string }): Promise<VectorRecord[]> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    const results = await this.index.fetch(ids, options);
    return results
      .map(result =>
        result
          ? {
              id: result.id,
              vector: result.vector,
              data: result.data,
              metadata: result.metadata,
            }
          : null,
      )
      .filter(Boolean) as VectorRecord[];
  }

  /**
   * Delete vectors by IDs
   */
  async delete(
    ids: string | string[],
    options?: { namespace?: string },
  ): Promise<{ deleted: number }> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    return await this.index.delete(ids, options);
  }

  /**
   * Get index information
   */
  async info(): Promise<any> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    return await this.index.info();
  }

  /**
   * Reset namespace (clear all vectors)
   */
  async reset(options?: { namespace?: string }): Promise<string> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    return await this.index.reset(options);
  }

  /**
   * Range query for pagination
   */
  async range(options: {
    cursor: number;
    limit: number;
    includeMetadata?: boolean;
    includeVectors?: boolean;
    prefix?: string;
    namespace?: string;
  }): Promise<{ nextCursor: string; vectors: VectorRecord[] }> {
    if (!this.index) {
      this.warnAboutMissingConfig();
      throw new Error('Vector index not initialized - credentials missing or invalid');
    }
    const { namespace, ...rangeOptions } = options;
    return await this.index.range(rangeOptions, namespace ? { namespace } : undefined);
  }

  /**
   * Warn once about missing configuration at runtime
   */
  private warnAboutMissingConfig(): void {
    if (!this.hasWarnedAboutMissingConfig) {
      logWarn('[UpstashAIVector] Client not configured: Vector operations will be disabled.', {
        message:
          'Please set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables.',
      });
      this.hasWarnedAboutMissingConfig = true;
    }
  }
}

/**
 * Create Upstash Vector tools for AI SDK
 */
export function createUpstashVectorTools(config: UpstashAIConfig = {}) {
  const vectorStore = new UpstashAIVector(config);

  return {
    // AI SDK v5 compliant tools
    addResource: tool({
      description: 'Add a resource to the vector database for retrieval',
      inputSchema: z.object({
        content: z.string().describe('The content to embed and store'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the resource'),
      }),
      execute: async ({ content, metadata }) => {
        const id = crypto.randomUUID();
        await vectorStore.upsertData(id, content, metadata);
        return `Resource ${id} created and embedded.`;
      },
    }),

    addDocument: tool({
      description: 'Add a document to the vector database with title and metadata',
      inputSchema: z.object({
        content: z.string().describe('The document content to embed and store'),
        title: z.string().optional().describe('Optional title for the document'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Optional metadata for the document'),
      }),
      execute: async ({ content, title, metadata }) => {
        const id = crypto.randomUUID();
        const docMetadata = { ...metadata, title };
        await vectorStore.upsertData(id, content, docMetadata);
        return `Document ${id} created and embedded.`;
      },
    }),

    getInformation: tool({
      description: 'Query the vector database for relevant information',
      inputSchema: z.object({
        question: z.string().describe('The query to search for in the vector database'),
        topK: z.number().optional().default(4).describe('Number of top results to return'),
      }),
      execute: async ({ question, topK = 4 }) => {
        const results = await vectorStore.queryData(question, {
          topK,
          includeMetadata: true,
          includeData: true,
        });
        return results.map(result => ({
          id: result.id,
          data: result.data,
          score: result.score,
          metadata: result.metadata,
        }));
      },
    }),
  };
}

/**
 * Helper function to chunk text for embedding
 */
function generateChunks(input: string, splitOn = '.'): string[] {
  return input
    .trim()
    .split(splitOn)
    .filter(chunk => chunk.trim() !== '');
}

/**
 * Generate embeddings for text chunks
 */
async function generateEmbeddingsForChunks(
  content: string,
  embeddingModel?: EmbeddingModel<string>,
): Promise<Array<{ content: string; embedding: number[] }>> {
  const chunks = generateChunks(content);
  const model = embeddingModel || openai.embedding('text-embedding-ada-002');

  const { embeddings } = await embedMany({
    model,
    values: chunks,
  });

  return embeddings.map((embedding, i) => ({
    content: chunks[i],
    embedding,
  }));
}

// Export singleton instance for convenience
const upstashVector = new UpstashAIVector();
