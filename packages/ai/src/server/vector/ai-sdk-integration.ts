/**
 * Upstash Vector AI SDK Integration
 * Integration between Upstash Vector and Vercel AI SDK v5
 */

import { openai } from '@ai-sdk/openai';
import { Index } from '@upstash/vector';
import type { EmbeddingModel } from 'ai';
import { embed, embedMany } from 'ai';

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
export interface VectorRecord {
  id: string | number;
  vector?: number[];
  data?: string;
  metadata?: Record<string, any>;
  score?: number;
}

/**
 * Query options for vector search
 */
export interface QueryOptions {
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
  private index: Index;
  private embeddingModel: EmbeddingModel<string>;

  constructor(config: UpstashAIConfig = {}) {
    this.index = new Index({
      url: config.vectorUrl || config.url || process.env.UPSTASH_VECTOR_REST_URL || '',
      token: config.vectorToken || config.token || process.env.UPSTASH_VECTOR_REST_TOKEN || '',
    });

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
    // Ensure data is provided for upsert
    const upsertRecord = { ...record, data: record.data || '' };
    await this.index.upsert(upsertRecord, options);
  }

  /**
   * Upsert multiple vectors with custom embeddings
   */
  async upsertVectors(records: VectorRecord[], options?: { namespace?: string }): Promise<void> {
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
    await this.index.upsert(entries, options);
  }

  /**
   * Query vectors using custom embedding
   */
  async queryVector(vector: number[], queryOptions: QueryOptions = {}): Promise<VectorRecord[]> {
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
    return await this.index.delete(ids, options);
  }

  /**
   * Get index information
   */
  async info(): Promise<any> {
    return await this.index.info();
  }

  /**
   * Reset namespace (clear all vectors)
   */
  async reset(options?: { namespace?: string }): Promise<string> {
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
    const { namespace, ...rangeOptions } = options;
    return await this.index.range(rangeOptions, namespace ? { namespace } : undefined);
  }
}

/**
 * Create Upstash Vector tools for AI SDK
 */
export function createUpstashVectorTools(config: UpstashAIConfig = {}) {
  const vectorStore = new UpstashAIVector(config);

  return {
    // Expected tool interfaces for RAG integration
    addResource: {
      async execute({ content, metadata }: { content: string; metadata?: Record<string, any> }) {
        const id = crypto.randomUUID();
        await vectorStore.upsertData(id, content, metadata);
        return `Resource ${id} created and embedded.`;
      },
    },

    addDocument: {
      async execute({
        content,
        title,
        metadata,
      }: {
        content: string;
        title?: string;
        metadata?: Record<string, any>;
      }) {
        const id = crypto.randomUUID();
        const docMetadata = { ...metadata, title };
        await vectorStore.upsertData(id, content, docMetadata);
        return `Document ${id} created and embedded.`;
      },
    },

    getInformation: {
      async execute({ question, topK = 4 }: { question: string; topK?: number }) {
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
    },
  };
}

/**
 * Helper function to chunk text for embedding
 */
export function generateChunks(input: string, splitOn = '.'): string[] {
  return input
    .trim()
    .split(splitOn)
    .filter(chunk => chunk.trim() !== '');
}

/**
 * Generate embeddings for text chunks
 */
export async function generateEmbeddingsForChunks(
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
export const upstashVector = new UpstashAIVector();
