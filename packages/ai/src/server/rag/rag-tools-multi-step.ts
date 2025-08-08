/**
 * Enhanced RAG Tools with AI SDK v5 Features
 * Advanced tool patterns with multi-step capabilities, type safety, and source tracking
 */

import { logInfo } from '@repo/observability/server/next';
import { tool } from 'ai';
import { z } from 'zod/v4';
import { generateEmbeddings } from './ai-sdk-rag';
import type { RAGDatabaseBridge } from './database-bridge';
import { ragRetry } from './retry-strategies';

/**
 * Enhanced tool configuration with v5 features
 */
export interface RAGToolConfig {
  vectorStore: RAGDatabaseBridge;
  defaultTopK?: number;
  defaultThreshold?: number;
  enableSourceTracking?: boolean;
  enableBatchProcessing?: boolean;
  maxContextLength?: number;
}

/**
 * AI SDK v5 Source metadata type
 */
export const SourceSchema = z.object({
  url: z.string().optional().describe('Source URL if available'),
  title: z.string().optional().describe('Source title or name'),
  provider: z.string().optional().describe('Source provider'),
  description: z.string().optional().describe('Source description'),
});

/**
 * Enhanced knowledge retrieval tool with source tracking
 */
export function createKnowledgeSearchTool(config: RAGToolConfig) {
  return tool({
    description: 'Search knowledge base with advanced filtering and source tracking',
    inputSchema: z.object({
      question: z.string().describe('The question or query to search for'),
      topK: z.number().min(1).max(20).default(5).describe('Number of results to return'),
      threshold: z.number().min(0).max(1).default(0.7).describe('Minimum similarity threshold'),
      includeMetadata: z.boolean().default(true).describe('Include source metadata'),
      contextWindow: z.number().optional().describe('Maximum context length per result'),
    }),
    execute: async ({ question, topK, threshold, includeMetadata, contextWindow }, _context) => {
      const startTime = Date.now();

      try {
        const results = await ragRetry.vector(
          async () =>
            await config.vectorStore.queryDocuments(question, {
              topK,
              threshold,
              includeContent: true,
            }),
        );

        if (results.length === 0) {
          return [];
        }

        // Format results with AI SDK v5 pattern
        const formattedResults = results.map(result => {
          let content = result.content || '';

          // Apply context window if specified
          if (contextWindow && content.length > contextWindow) {
            content = content.substring(0, contextWindow) + '...';
          }

          const resultObj: any = {
            content,
            score: result.score,
            metadata: includeMetadata ? result.metadata : undefined,
          };

          // Add source metadata if tracking is enabled
          if (config.enableSourceTracking && result.metadata) {
            resultObj.source = {
              url: result.metadata.url || result.metadata.source_url,
              title: result.metadata.title || result.metadata.document_title,
              provider: result.metadata.provider || 'knowledge_base',
              description: result.metadata.description || result.metadata.summary,
            };
          }

          return resultObj;
        });

        logInfo('Enhanced knowledge search completed', {
          operation: 'enhanced_rag_tool_search',
          query: question.substring(0, 100),
          resultsFound: results.length,
          responseTime: Date.now() - startTime,
        });

        return formattedResults;
      } catch (error) {
        logInfo('Enhanced knowledge search failed', {
          operation: 'enhanced_rag_tool_search_error',
          error: error instanceof Error ? error.message : String(error),
        });
        return [];
      }
    },
  });
}

/**
 * Batch document processing tool
 */
export function createBatchDocumentTool(config: RAGToolConfig) {
  return tool({
    description: 'Process multiple documents in batch for efficient knowledge base updates',
    inputSchema: z.object({
      documents: z
        .array(
          z.object({
            content: z.string().describe('Document content'),
            title: z.string().optional().describe('Document title'),
            metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata'),
          }),
        )
        .describe('Array of documents to process'),
      chunkSize: z.number().min(1).max(50).default(10).describe('Batch processing chunk size'),
      generateEmbeddings: z.boolean().default(true).describe('Generate embeddings for documents'),
    }),
    execute: async (
      { documents, chunkSize, generateEmbeddings: shouldGenerateEmbeddings },
      _context,
    ) => {
      if (!config.enableBatchProcessing) {
        throw new Error('Batch processing not enabled for this tool configuration');
      }

      const results = {
        processed: 0,
        failed: 0,
        errors: [] as string[],
        embeddings: [] as number[][],
      };

      try {
        // Generate embeddings in batch if requested
        if (shouldGenerateEmbeddings) {
          const contents = documents.map(doc => doc.content);
          results.embeddings = await generateEmbeddings(contents);
        }

        // Process documents in chunks
        for (let i = 0; i < documents.length; i += chunkSize) {
          const chunk = documents.slice(i, i + chunkSize);

          try {
            for (const doc of chunk) {
              await config.vectorStore.addDocuments([
                {
                  id: `doc_${Date.now()}_${Math.random()}`,
                  content: doc.content,
                  metadata: {
                    title: doc.title,
                    ...doc.metadata,
                    processed_at: new Date().toISOString(),
                    batch_id: `batch_${Date.now()}_${i}`,
                  },
                },
              ]);
            }

            results.processed += chunk.length;
          } catch (error) {
            results.failed += chunk.length;
            results.errors.push(
              `Chunk ${i / chunkSize + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }

        logInfo('Batch document processing completed', {
          operation: 'enhanced_rag_tool_batch_process',
          totalDocuments: documents.length,
          processed: results.processed,
          failed: results.failed,
        });

        return results;
      } catch (error) {
        results.failed = documents.length;
        results.errors.push(error instanceof Error ? error.message : 'Unknown error');
        return results;
      }
    },
  });
}

/**
 * Multi-step reasoning tool with context accumulation
 */
export function createMultiStepReasoningTool(config: RAGToolConfig) {
  return tool({
    description: 'Perform multi-step reasoning by accumulating context from multiple searches',
    inputSchema: z.object({
      mainQuestion: z.string().describe('The main question to answer'),
      subQueries: z.array(z.string()).min(1).max(5).describe('Sub-queries to explore'),
      synthesizeResults: z.boolean().default(true).describe('Synthesize results from all queries'),
      maxContextPerQuery: z.number().default(3).describe('Maximum context items per sub-query'),
    }),
    execute: async ({ mainQuestion, subQueries, synthesizeResults, maxContextPerQuery }) => {
      const allContext: Array<{
        query: string;
        results: Array<{
          content: string;
          score: number;
          source?: any;
        }>;
      }> = [];

      // Execute each sub-query
      for (const subQuery of subQueries) {
        try {
          const results = await ragRetry.vector(
            async () =>
              await config.vectorStore.queryDocuments(subQuery, {
                topK: maxContextPerQuery,
                threshold: config.defaultThreshold || 0.7,
                includeContent: true,
              }),
          );

          const formattedResults = results.map(result => ({
            content: result.content || '',
            score: result.score,
            source:
              config.enableSourceTracking && result.metadata
                ? {
                    url: result.metadata.url,
                    title: result.metadata.title,
                    provider: result.metadata.provider || 'knowledge_base',
                  }
                : undefined,
          }));

          allContext.push({
            query: subQuery,
            results: formattedResults,
          });
        } catch (error) {
          logInfo('Sub-query failed in multi-step reasoning', {
            operation: 'multi_step_reasoning_subquery_error',
            subQuery,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      if (synthesizeResults) {
        // Collect all unique sources and high-scoring content
        const allSources = new Set<string>();
        const synthesizedContent: Array<{
          content: string;
          score: number;
          relevantQueries: string[];
        }> = [];

        // Process context and deduplicate
        const contentMap = new Map<string, { score: number; queries: string[] }>();

        allContext.forEach(({ query, results }) => {
          results.forEach(result => {
            if (result.source?.url) allSources.add(result.source.url);

            const contentKey = result.content.substring(0, 100); // Use first 100 chars as key
            if (contentMap.has(contentKey)) {
              const existing = contentMap.get(contentKey);
              if (existing) {
                existing.score = Math.max(existing.score, result.score);
                existing.queries.push(query);
              }
            } else {
              contentMap.set(contentKey, {
                score: result.score,
                queries: [query],
              });
            }
          });
        });

        // Convert to synthesized format
        contentMap.forEach((data, contentKey) => {
          const fullContent =
            allContext.flatMap(ctx => ctx.results).find(r => r.content.startsWith(contentKey))
              ?.content || contentKey;

          synthesizedContent.push({
            content: fullContent,
            score: data.score,
            relevantQueries: data.queries,
          });
        });

        return {
          mainQuestion,
          synthesizedResults: synthesizedContent.sort((a, b) => b.score - a.score).slice(0, 10), // Top 10 results
          totalSources: allSources.size,
          queriesProcessed: subQueries.length,
          contextItemsFound: allContext.reduce((sum, ctx) => sum + ctx.results.length, 0),
        };
      }

      return {
        mainQuestion,
        detailedResults: allContext,
        totalQueries: subQueries.length,
        contextItemsFound: allContext.reduce((sum, ctx) => sum + ctx.results.length, 0),
      };
    },
  });
}

/**
 * Context-aware summarization tool
 */
export function createContextSummarizationTool(config: RAGToolConfig) {
  return tool({
    description: 'Summarize content based on retrieved context with source attribution',
    inputSchema: z.object({
      topic: z.string().describe('Topic to summarize'),
      focusAreas: z.array(z.string()).optional().describe('Specific areas to focus on'),
      maxSources: z.number().default(10).describe('Maximum number of sources to use'),
      includeSourceList: z.boolean().default(true).describe('Include list of sources used'),
    }),
    execute: async ({ topic, focusAreas, maxSources, includeSourceList }) => {
      const searchQueries = [topic, ...(focusAreas || [])].slice(0, 5);
      const allContent: Array<{
        content: string;
        score: number;
        source?: any;
        query: string;
      }> = [];

      // Gather content from multiple search angles
      for (const query of searchQueries) {
        try {
          const results = await ragRetry.vector(
            async () =>
              await config.vectorStore.queryDocuments(query, {
                topK: Math.ceil(maxSources / searchQueries.length),
                threshold: config.defaultThreshold || 0.7,
                includeContent: true,
              }),
          );

          results.forEach(result => {
            allContent.push({
              content: result.content || '',
              score: result.score,
              source:
                config.enableSourceTracking && result.metadata
                  ? {
                      url: result.metadata.url,
                      title: result.metadata.title,
                      provider: result.metadata.provider || 'knowledge_base',
                    }
                  : undefined,
              query,
            });
          });
        } catch (_error) {
          // Continue with other queries if one fails
        }
      }

      // Sort by relevance and deduplicate
      const uniqueContent = allContent
        .sort((a, b) => b.score - a.score)
        .filter(
          (item, index, arr) =>
            arr.findIndex(
              other => other.content.substring(0, 100) === item.content.substring(0, 100),
            ) === index,
        )
        .slice(0, maxSources);

      const sources = includeSourceList
        ? Array.from(
            new Set(
              uniqueContent
                .filter(item => item.source)
                .map(
                  item =>
                    `${item.source?.title || 'Unknown'} (${item.source?.provider || 'knowledge_base'})`,
                ),
            ),
          )
        : [];

      return {
        topic,
        focusAreas: focusAreas || [],
        contentSummary: uniqueContent.map(item => ({
          excerpt: item.content.substring(0, 300) + (item.content.length > 300 ? '...' : ''),
          relevanceScore: item.score,
          searchQuery: item.query,
          source: item.source,
        })),
        sources,
        totalContentItems: uniqueContent.length,
        averageRelevance:
          uniqueContent.reduce((sum, item) => sum + item.score, 0) / uniqueContent.length,
      };
    },
  });
}

/**
 * Create a complete enhanced RAG toolset
 */
export function createRAGToolset(config: RAGToolConfig) {
  return {
    contextualKnowledgeSearch: createKnowledgeSearchTool(config),
    batchDocumentProcessor: createBatchDocumentTool(config),
    multiStepReasoning: createMultiStepReasoningTool(config),
    contextSummarization: createContextSummarizationTool(config),
  };
}

/**
 * Type-safe tool result types for AI SDK v5
 */
export type RAGToolResults = {
  contextualKnowledgeSearch: Array<{
    content: string;
    score: number;
    metadata?: any;
    source?: z.infer<typeof SourceSchema>;
  }>;
  batchDocumentProcessor: {
    processed: number;
    failed: number;
    errors: string[];
    embeddings: number[][];
  };
  multiStepReasoning: {
    mainQuestion: string;
    synthesizedResults?: Array<{
      content: string;
      score: number;
      relevantQueries: string[];
    }>;
    detailedResults?: Array<{
      query: string;
      results: Array<{
        content: string;
        score: number;
        source?: any;
      }>;
    }>;
    totalSources?: number;
    queriesProcessed: number;
    contextItemsFound: number;
  };
  contextSummarization: {
    topic: string;
    focusAreas: string[];
    contentSummary: Array<{
      excerpt: string;
      relevanceScore: number;
      searchQuery: string;
      source?: any;
    }>;
    sources: string[];
    totalContentItems: number;
    averageRelevance: number;
  };
};
