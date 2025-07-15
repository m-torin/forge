/**
 * Enhanced AI SDK Tools for Vector Operations
 * Integrates deeply with AI SDK streamText and provides embedding-first patterns
 */

import { openai } from '@ai-sdk/openai';
import { embed, embedMany, tool } from 'ai';
import { z } from 'zod/v4';
import type { VectorDB } from '../../shared/types/vector';

export interface VectorToolsConfig {
  vectorDB: VectorDB;
  embeddingModel?: string;
  defaultTopK?: number;
  similarityThreshold?: number;
  cacheEmbeddings?: boolean;
}

/**
 * Enhanced Tool Integration (Feature 1)
 * Tools that feel native to AI SDK with proper streaming and context
 */
export function createVectorTools(config: VectorToolsConfig) {
  const {
    vectorDB,
    embeddingModel = 'text-embedding-3-small',
    defaultTopK = 5,
    similarityThreshold = 0.7,
    cacheEmbeddings = true,
  } = config;

  const model = openai.embedding(embeddingModel);
  const embeddingCache = cacheEmbeddings ? new Map<string, number[]>() : null;

  return {
    searchVectorContext: tool({
      description: 'Search vector database for relevant context to answer user questions',
      parameters: z.object({
        query: z.string().describe('The search query to find relevant information'),
        topK: z
          .number()
          .optional()
          .describe(`Number of results to return (default: ${defaultTopK})`),
        filter: z.record(z.string(), z.any()).optional().describe('Optional metadata filters'),
        includeScores: z.boolean().default(true).describe('Include similarity scores in results'),
      }),
      execute: async ({ query, topK = defaultTopK, filter, includeScores }) => {
        // Embedding-First Design (Feature 2) - Always generate embeddings
        const cacheKey = `${query}:${embeddingModel}`;
        let queryEmbedding: number[];

        if (embeddingCache?.has(cacheKey)) {
          queryEmbedding = embeddingCache.get(cacheKey) || [];
        } else {
          const { embedding } = await embed({ model, value: query });
          queryEmbedding = embedding;
          if (embeddingCache) {
            embeddingCache.set(cacheKey, embedding);
          }
        }

        const results = await vectorDB.query(queryEmbedding, {
          topK,
          filter,
          includeMetadata: true,
          includeValues: false,
        });

        // Filter by similarity threshold
        const filteredResults = results.filter(
          result => !similarityThreshold || result.score >= similarityThreshold,
        );

        return {
          query,
          results: filteredResults.map(result => ({
            id: result.id,
            content: result.metadata?.content || '',
            score: includeScores ? result.score : undefined,
            metadata: result.metadata,
          })),
          foundRelevant: filteredResults.length > 0,
          totalResults: filteredResults.length,
          threshold: similarityThreshold,
        };
      },
    }),

    addToVectorStore: tool({
      description: 'Add content to the vector database with automatic embedding generation',
      parameters: z.object({
        content: z.string().describe('The content to embed and store'),
        id: z
          .string()
          .optional()
          .describe('Optional ID for the content (auto-generated if not provided)'),
        metadata: z
          .record(z.string(), z.any())
          .optional()
          .describe('Additional metadata to store with the content'),
        chunk: z.boolean().default(false).describe('Whether to chunk large content automatically'),
      }),
      execute: async ({ content, id, metadata, chunk }) => {
        const contentId = id || `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Handle chunking for large content
        const chunks = chunk ? chunkContent(content) : [content];
        const records = [];

        // Batch embedding generation for efficiency
        const { embeddings } = await embedMany({
          model,
          values: chunks,
        });

        for (let i = 0; i < chunks.length; i++) {
          const chunkId = chunks.length > 1 ? `${contentId}_chunk_${i}` : contentId;
          records.push({
            id: chunkId,
            values: embeddings[i],
            metadata: {
              ...metadata,
              content: chunks[i],
              originalId: contentId,
              chunkIndex: chunks.length > 1 ? i : undefined,
              totalChunks: chunks.length > 1 ? chunks.length : undefined,
              timestamp: new Date().toISOString(),
            },
          });
        }

        await vectorDB.upsert(records);

        return {
          id: contentId,
          chunksCreated: chunks.length,
          success: true,
          message: `Added content "${contentId}" with ${chunks.length} chunk(s) to vector store`,
        };
      },
    }),

    findSimilarContent: tool({
      description: 'Find content similar to a given text or existing content ID',
      parameters: z.object({
        input: z.string().describe('Text to find similar content for, or existing content ID'),
        isId: z.boolean().default(false).describe('Whether input is a content ID rather than text'),
        topK: z
          .number()
          .optional()
          .describe(`Number of similar items to return (default: ${defaultTopK})`),
        excludeOriginal: z
          .boolean()
          .default(true)
          .describe('Exclude the original content from results'),
      }),
      execute: async ({ input, isId, topK = defaultTopK, excludeOriginal }) => {
        let queryEmbedding: number[];

        if (isId) {
          // Fetch existing content's embedding
          const existing = await vectorDB.fetch([input]);
          if (existing.length === 0) {
            return {
              error: `Content with ID "${input}" not found`,
              results: [],
            };
          }
          queryEmbedding = existing[0].values;
        } else {
          // Generate embedding for new text
          const { embedding } = await embed({ model, value: input });
          queryEmbedding = embedding;
        }

        const results = await vectorDB.query(queryEmbedding, {
          topK: excludeOriginal ? topK + 1 : topK,
          includeMetadata: true,
        });

        // Filter out the original if needed
        const filteredResults =
          excludeOriginal && isId ? results.filter(r => r.id !== input) : results;

        return {
          input,
          results: filteredResults.slice(0, topK).map(result => ({
            id: result.id,
            content: result.metadata?.content || '',
            similarity: result.score,
            metadata: result.metadata,
          })),
          foundSimilar: filteredResults.length > 0,
        };
      },
    }),

    removeFromVectorStore: tool({
      description: 'Remove content from the vector database',
      parameters: z.object({
        ids: z.array(z.string()).describe('IDs of content to remove'),
        pattern: z
          .string()
          .optional()
          .describe('Optional pattern to match IDs (e.g., "user_123_*")'),
      }),
      execute: async ({ ids, pattern }) => {
        let idsToDelete = ids;

        if (pattern) {
          // This is a simplified pattern matching - in production you'd want more robust pattern matching
          const allIds = await getAllContentIds(vectorDB); // You'd need to implement this
          // eslint-disable-next-line security/detect-non-literal-regexp -- Dynamic pattern matching for content IDs
          const patternRegex = new RegExp(pattern.replace('*', '.*'));
          const matchingIds = allIds.filter(id => patternRegex.test(id));
          idsToDelete = [...ids, ...matchingIds];
        }

        await vectorDB.delete(idsToDelete);

        return {
          removedIds: idsToDelete,
          count: idsToDelete.length,
          success: true,
          message: `Removed ${idsToDelete.length} items from vector store`,
        };
      },
    }),
  };
}

/**
 * Real-time Vector Context Integration (Feature 3)
 * Middleware for streaming responses with vector context
 */
export function createVectorContextMiddleware(config: VectorToolsConfig) {
  return {
    async enrichContext(
      messages: any[],
      options: { autoSearch?: boolean; contextWindow?: number } = {},
    ) {
      const { autoSearch = true, contextWindow = 3 } = options;

      if (!autoSearch || messages.length === 0) {
        return { messages, vectorContext: [] };
      }

      // Get the last few messages for context
      const recentMessages = messages.slice(-contextWindow);
      const searchQueries = recentMessages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');

      if (!searchQueries.trim()) {
        return { messages, vectorContext: [] };
      }

      // Generate embedding for context search
      const model = openai.embedding(config.embeddingModel || 'text-embedding-3-small');
      const { embedding } = await embed({ model, value: searchQueries });

      // Search for relevant context
      const contextResults = await config.vectorDB.query(embedding, {
        topK: config.defaultTopK || 5,
        includeMetadata: true,
      });

      const relevantContext = contextResults
        .filter(r => r.score >= (config.similarityThreshold || 0.7))
        .map(r => ({
          content: r.metadata?.content || '',
          score: r.score,
          id: r.id,
        }));

      return {
        messages,
        vectorContext: relevantContext,
      };
    },
  };
}

/**
 * Type-Safe Vector Integration (Feature 14)
 * Enhanced TypeScript support for vector operations
 */
export interface VectorizedMessage<T = any> {
  role: 'user' | 'assistant' | 'system';
  content: string;
  vectorContext?: VectorContext<T>[];
  similarity?: number;
}

export interface VectorContext<T = any> {
  id: string;
  content: string;
  score: number;
  metadata: T;
}

export type VectorEnrichedStream<T = any> = {
  messages: VectorizedMessage<T>[];
  vectorContext: VectorContext<T>[];
  searchQuery?: string;
  contextFound: boolean;
};

/**
 * Embedding-First API Design (Feature 10 Example)
 * Workflow that prioritizes embeddings in all operations
 */
export class EmbeddingWorkflow<T = any> {
  constructor(
    private vectorDB: VectorDB,
    private embeddingModel: string = 'text-embedding-3-small',
  ) {}

  async processContent(
    content: string | string[],
    metadata?: T,
  ): Promise<{
    embeddings: number[][];
    ids: string[];
    success: boolean;
  }> {
    const contents = Array.isArray(content) ? content : [content];
    const model = openai.embedding(this.embeddingModel);

    // Batch embedding generation
    const { embeddings } = await embedMany({
      model,
      values: contents,
    });

    // Create records
    const records = contents.map((text, index) => ({
      id: `workflow_${Date.now()}_${index}`,
      values: embeddings[index],
      metadata: {
        ...metadata,
        content: text,
        timestamp: new Date().toISOString(),
      } as T & { content: string; timestamp: string },
    }));

    // Store in vector DB
    await this.vectorDB.upsert(records);

    return {
      embeddings,
      ids: records.map(r => r.id),
      success: true,
    };
  }

  async findSemanticallyRelated(
    query: string,
    options: { topK?: number; threshold?: number } = {},
  ): Promise<VectorContext<T>[]> {
    const { topK = 5, threshold = 0.7 } = options;
    const model = openai.embedding(this.embeddingModel);

    const { embedding } = await embed({ model, value: query });
    const results = await this.vectorDB.query(embedding, {
      topK,
      includeMetadata: true,
    });

    return results
      .filter(r => r.score >= threshold)
      .map(r => ({
        id: r.id,
        content: r.metadata?.content || '',
        score: r.score,
        metadata: r.metadata as T,
      }));
  }
}

// Helper function for content chunking
function chunkContent(content: string, maxChunkSize: number = 1000): string[] {
  if (content.length <= maxChunkSize) {
    return [content];
  }

  const chunks = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [content];
}

// Helper function to get all content IDs (implementation would depend on vector DB capabilities)
async function getAllContentIds(_vectorDB: VectorDB): Promise<string[]> {
  // This is a placeholder - actual implementation would depend on vector DB capabilities
  // You might need to maintain a separate index of IDs or use metadata queries
  return [];
}

// VectorToolsConfig is already exported above
