import { logDebug, logError } from '@repo/observability';
import { tool } from 'ai';
import { z } from 'zod/v3';
import { embedText } from './embeddings';

/**
 * Flexible RAG integration utilities
 * Works with any vector store (Upstash, Pinecone, Weaviate, etc.)
 */

/**
 * Create a RAG tool for any vector store
 */
export function createRAGTool(vectorStore: any, options: RAGOptions = {}) {
  return tool({
    description: options.description || 'Search knowledge base for relevant information',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      limit: z
        .number()
        .optional()
        .default(options.defaultLimit || 5)
        .describe('Number of results to return'),
      threshold: z
        .number()
        .optional()
        .default(options.defaultThreshold || 0.7)
        .describe('Similarity threshold'),
      filter: z.record(z.string(), z.any()).optional().describe('Additional filters'),
    }),
    execute: async ({ query, limit, threshold, filter }: any) => {
      try {
        // This works with any vector store that has a query method
        const results = await vectorStore.query({
          vector: await embedQuery(query, options.embedModel),
          topK: limit,
          threshold,
          filter,
          includeMetadata: true,
          ...options.queryOptions,
        });

        return {
          results: results.matches || results.results || results,
          query,
          count: results.matches?.length || results.results?.length || 0,
        };
      } catch (error) {
        logError('[RAG] Search failed:', error);
        return {
          results: [],
          query,
          count: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

/**
 * Create a multi-source RAG tool
 */
export function createMultiRAGTool(sources: Record<string, any>, options: MultiRAGOptions = {}) {
  return tool({
    description: 'Search multiple knowledge bases',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      sources: z
        .array(z.enum(Object.keys(sources) as [string, ...string[]]))
        .optional()
        .default(Object.keys(sources))
        .describe('Which sources to search'),
      limit: z.number().optional().default(5).describe('Results per source'),
      threshold: z.number().optional().default(0.7).describe('Similarity threshold'),
    }),
    execute: async ({ query, sources: selectedSources, limit, threshold }: any) => {
      const results: Record<string, any> = {};

      await Promise.all(
        selectedSources.map(async (sourceName: string) => {
          const source = sources[sourceName];
          if (!source) return;

          try {
            const sourceResults = await source.query({
              vector: await embedQuery(query, options.embedModel),
              topK: limit,
              threshold,
              includeMetadata: true,
            });

            results[sourceName] = {
              results: sourceResults.matches || sourceResults.results || sourceResults,
              count: sourceResults.matches?.length || sourceResults.results?.length || 0,
            };
          } catch (error) {
            logError(`[RAG] Failed to search ${sourceName}:`, error);
            results[sourceName] = {
              results: [],
              count: 0,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );

      return {
        query,
        sources: results,
        totalResults: Object.values(results).reduce((sum: number, r: any) => sum + r.count, 0),
      };
    },
  });
}

/**
 * Create semantic search tool
 */
export function createSemanticSearchTool(vectorStore: any, options: SemanticSearchOptions = {}) {
  return tool({
    description: 'Perform semantic search with context analysis',
    inputSchema: z.object({
      query: z.string().describe('Search query'),
      context: z.string().optional().describe('Additional context for search'),
      limit: z.number().optional().default(5).describe('Number of results'),
      rerank: z.boolean().optional().default(false).describe('Whether to rerank results'),
    }),
    execute: async ({ query, context, limit, rerank }: any) => {
      try {
        // Enhanced query with context
        const enhancedQuery = context ? `${context}\n\nQuery: ${query}` : query;

        const results = await vectorStore.query({
          vector: await embedQuery(enhancedQuery, options.embedModel),
          topK: rerank ? limit * 2 : limit, // Get more for reranking
          includeMetadata: true,
        });

        let finalResults = results.matches || results.results || results;

        // Optional reranking based on semantic relevance
        if (rerank && finalResults.length > limit) {
          finalResults = await rerankResults(finalResults, query, limit);
        }

        return {
          results: finalResults.slice(0, limit),
          query: enhancedQuery,
          reranked: rerank,
          count: finalResults.length,
        };
      } catch (error) {
        logError('[RAG] Semantic search failed:', error);
        return {
          results: [],
          query,
          reranked: false,
          count: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

/**
 * RAG conversation memory tool
 */
export function createRAGMemoryTool(
  vectorStore: any,
  conversationId: string,
  options: RAGMemoryOptions = {},
) {
  return tool({
    description: 'Search conversation history and context',
    inputSchema: z.object({
      query: z.string().describe('What to search for in conversation history'),
      includeContext: z.boolean().optional().default(true).describe('Include related context'),
      timeRange: z.enum(['recent', 'all', 'session']).optional().default('recent'),
    }),
    execute: async ({ query, includeContext, timeRange }: any) => {
      try {
        const filter = {
          conversationId,
          ...(timeRange === 'recent' && { timestamp: { $gte: Date.now() - 3600000 } }), // Last hour
          ...(timeRange === 'session' && { sessionId: options.sessionId }),
        };

        const results = await vectorStore.query({
          vector: await embedQuery(query, options.embedModel),
          topK: options.memoryLimit || 10,
          filter,
          includeMetadata: true,
        });

        return {
          memories: results.matches || results.results || results,
          query,
          conversationId,
          timeRange,
          includeContext,
        };
      } catch (error) {
        logError('[RAG] Memory search failed:', error);
        return {
          memories: [],
          query,
          conversationId,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
}

/**
 * Helper function to embed queries using real AI SDK embeddings
 */
async function embedQuery(query: string, modelId?: string): Promise<number[]> {
  logDebug(`[RAG] Embedding query with model: ${modelId ? 'custom' : 'default'}`);
  const { embedding } = await embedText(query, modelId as any);
  return embedding;
}

/**
 * Helper function to rerank results (placeholder)
 */
async function rerankResults(results: any[], query: string, limit: number): Promise<any[]> {
  // This would use a reranking service/model
  logDebug(`[RAG] Reranking ${results.length} results for query: ${query}`);
  return results.sort(() => Math.random() - 0.5).slice(0, limit); // Mock reranking
}

// Types for configuration
export interface RAGOptions {
  description?: string;
  defaultLimit?: number;
  defaultThreshold?: number;
  embedModel?: string;
  queryOptions?: any;
}

export interface MultiRAGOptions {
  embedModel?: string;
}

export interface SemanticSearchOptions {
  embedModel?: string;
}

export interface RAGMemoryOptions {
  embedModel?: string;
  sessionId?: string;
  memoryLimit?: number;
}

// Example usage patterns for documentation
export const ragExamples = {
  // Upstash Vector example
  upstash: `
    import { Index } from '@upstash/vector';
    import { createRAGTool } from '@repo/ai/tools';
    
    const vectorStore = new Index({
      url: process.env.UPSTASH_VECTOR_URL!,
      token: process.env.UPSTASH_VECTOR_TOKEN!,
    });
    
    const ragTool = createRAGTool(vectorStore, {
      description: 'Search company documentation',
      defaultLimit: 3,
    });
  `,

  // Pinecone example
  pinecone: `
    import { Pinecone } from '@pinecone-database/pinecone';
    import { createRAGTool } from '@repo/ai/tools';
    
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.Index('my-index');
    
    const ragTool = createRAGTool(index, {
      description: 'Search knowledge base',
      defaultLimit: 5,
    });
  `,

  // Multiple sources example
  multiSource: `
    import { createMultiRAGTool } from '@repo/ai/tools';
    
    const sources = {
      docs: docsVectorStore,
      support: supportVectorStore,
      legal: legalVectorStore,
    };
    
    const multiRagTool = createMultiRAGTool(sources);
  `,
};
