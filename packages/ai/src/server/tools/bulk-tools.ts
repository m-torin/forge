/**
 * Bulk Operations Tools for Upstash Vector
 * Efficient batch processing with intelligent batching and error recovery
 */

import { openai } from '@ai-sdk/openai';
import { embed, embedMany, tool } from 'ai';
import { z } from 'zod/v4';
import type { VectorDB } from '../../shared/types/vector';

export interface BulkToolsConfig {
  vectorDB: VectorDB;
  embeddingModel?: string;
  defaultBatchSize?: number;
  maxConcurrency?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface BulkOperationProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: Array<{ batch: number; error: string; ids?: string[] }>;
}

/**
 * Create bulk operation tools for AI SDK
 */
export function createBulkTools(config: BulkToolsConfig) {
  const {
    vectorDB,
    embeddingModel = 'text-embedding-3-small',
    defaultBatchSize = 100,
    maxConcurrency = 3,
    retryAttempts = 2,
    retryDelay = 1000,
  } = config;

  const model = openai.embedding(embeddingModel);

  return {
    bulkUpsert: tool({
      description:
        'Efficiently upsert large batches of vectors with automatic batching and error recovery',
      parameters: z.object({
        vectors: z
          .array(
            z.object({
              id: z.string(),
              content: z.string(),
              metadata: z.record(z.string(), z.any()).optional(),
            }),
          )
          .describe('Array of vectors to upsert'),
        batchSize: z
          .number()
          .optional()
          .describe(`Batch size for processing (default: ${defaultBatchSize})`),
        namespace: z.string().optional().describe('Target namespace'),
        generateEmbeddings: z.boolean().default(true).describe('Generate embeddings from content'),
        concurrency: z
          .number()
          .optional()
          .describe(`Max concurrent batches (default: ${maxConcurrency})`),
      }),
      execute: async ({
        vectors,
        batchSize = defaultBatchSize,
        namespace: _namespace,
        generateEmbeddings,
        concurrency = maxConcurrency,
      }: {
        vectors: Array<{ id: string; content: string; metadata?: Record<string, any> }>;
        batchSize?: number;
        namespace?: string;
        generateEmbeddings?: boolean;
        concurrency?: number;
      }) => {
        const progress: BulkOperationProgress = {
          total: vectors.length,
          processed: 0,
          successful: 0,
          failed: 0,
          currentBatch: 0,
          totalBatches: Math.ceil(vectors.length / batchSize),
          errors: [],
        };

        // Process in batches with controlled concurrency
        const batches: (typeof vectors)[] = [];
        for (let i = 0; i < vectors.length; i += batchSize) {
          batches.push(vectors.slice(i, i + batchSize));
        }

        const processBatch = async (
          batch: typeof vectors,
          batchIndex: number,
        ): Promise<{ success: boolean; count: number; error?: string }> => {
          try {
            let embeddings: number[][] = [];

            if (generateEmbeddings) {
              const contents = batch.map(v => v.content);
              const embeddingResult = await embedMany({
                model,
                values: contents,
              });
              embeddings = embeddingResult.embeddings;
            }

            const vectorRecords = batch.map((vector, index) => ({
              id: vector.id,
              values: generateEmbeddings ? embeddings[index] : [0], // Placeholder if no embeddings
              metadata: {
                ...vector.metadata,
                content: vector.content,
                timestamp: new Date().toISOString(),
                batchIndex,
              },
            }));

            const result = await vectorDB.upsert(vectorRecords);
            return { success: result.success, count: result.count };
          } catch (error) {
            return {
              success: false,
              count: 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        };

        const processWithRetry = async (
          batch: typeof vectors,
          batchIndex: number,
        ): Promise<void> => {
          let attempts = 0;
          let lastError: string | undefined;

          while (attempts <= retryAttempts) {
            const result = await processBatch(batch, batchIndex);

            if (result.success) {
              progress.successful += result.count;
              progress.processed += batch.length;
              progress.currentBatch = batchIndex + 1;
              return;
            } else {
              attempts++;
              lastError = result.error;

              if (attempts <= retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
              }
            }
          }

          // All retries failed
          progress.failed += batch.length;
          progress.processed += batch.length;
          progress.currentBatch = batchIndex + 1;
          progress.errors.push({
            batch: batchIndex,
            error: lastError || 'Unknown error',
            ids: batch.map(v => v.id),
          });
        };

        // Process batches with concurrency control
        const semaphore = new Array(concurrency).fill(null);
        let batchIndex = 0;

        await Promise.all(
          semaphore.map(async () => {
            while (batchIndex < batches.length) {
              const currentIndex = batchIndex++;
              const batch = batches[currentIndex];
              await processWithRetry(batch, currentIndex);
            }
          }),
        );

        return {
          ...progress,
          success: progress.failed === 0,
          successRate: (progress.successful / progress.total) * 100,
          message: `Processed ${progress.total} vectors: ${progress.successful} successful, ${progress.failed} failed`,
        };
      },
    }),

    bulkDelete: tool({
      description: 'Delete multiple vectors efficiently in batches with error recovery',
      parameters: z.object({
        ids: z.array(z.string()).describe('Vector IDs to delete'),
        batchSize: z
          .number()
          .optional()
          .describe(`Batch size for deletion (default: ${defaultBatchSize})`),
        namespace: z.string().optional().describe('Target namespace'),
        concurrency: z
          .number()
          .optional()
          .describe(`Max concurrent batches (default: ${maxConcurrency})`),
      }),
      execute: async ({
        ids,
        batchSize = defaultBatchSize,
        namespace: _namespace,
        concurrency = maxConcurrency,
      }: {
        ids: string[];
        batchSize?: number;
        namespace?: string;
        concurrency?: number;
      }) => {
        const progress: BulkOperationProgress = {
          total: ids.length,
          processed: 0,
          successful: 0,
          failed: 0,
          currentBatch: 0,
          totalBatches: Math.ceil(ids.length / batchSize),
          errors: [],
        };

        const batches: string[][] = [];
        for (let i = 0; i < ids.length; i += batchSize) {
          batches.push(ids.slice(i, i + batchSize));
        }

        const processBatch = async (
          batch: string[],
          _batchIndex: number,
        ): Promise<{ success: boolean; count: number; error?: string }> => {
          try {
            const result = await vectorDB.delete(batch);
            return { success: result.success, count: result.deletedCount };
          } catch (error) {
            return {
              success: false,
              count: 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        };

        const processWithRetry = async (batch: string[], batchIndex: number): Promise<void> => {
          let attempts = 0;
          let lastError: string | undefined;

          while (attempts <= retryAttempts) {
            const result = await processBatch(batch, batchIndex);

            if (result.success) {
              progress.successful += result.count;
              progress.processed += batch.length;
              progress.currentBatch = batchIndex + 1;
              return;
            } else {
              attempts++;
              lastError = result.error;

              if (attempts <= retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
              }
            }
          }

          progress.failed += batch.length;
          progress.processed += batch.length;
          progress.currentBatch = batchIndex + 1;
          progress.errors.push({
            batch: batchIndex,
            error: lastError || 'Unknown error',
            ids: batch,
          });
        };

        // Process with concurrency control
        const semaphore = new Array(concurrency).fill(null);
        let batchIndex = 0;

        await Promise.all(
          semaphore.map(async () => {
            while (batchIndex < batches.length) {
              const currentIndex = batchIndex++;
              const batch = batches[currentIndex];
              await processWithRetry(batch, currentIndex);
            }
          }),
        );

        return {
          ...progress,
          success: progress.failed === 0,
          successRate: (progress.successful / progress.total) * 100,
          message: `Deleted ${progress.successful} out of ${progress.total} vectors`,
        };
      },
    }),

    bulkQuery: tool({
      description: 'Perform multiple vector queries in parallel with batching',
      parameters: z.object({
        queries: z
          .array(
            z.object({
              id: z.string().optional().describe('Optional query ID for tracking'),
              content: z.string().describe('Query content'),
              topK: z.number().default(5).describe('Number of results per query'),
              filter: z.string().optional().describe('Metadata filter'),
            }),
          )
          .describe('Array of queries to execute'),
        namespace: z.string().optional().describe('Target namespace'),
        concurrency: z
          .number()
          .optional()
          .describe(`Max concurrent queries (default: ${maxConcurrency})`),
        aggregateResults: z
          .boolean()
          .default(false)
          .describe('Aggregate and deduplicate results across queries'),
      }),
      execute: async ({
        queries,
        concurrency = maxConcurrency,
        aggregateResults,
      }: {
        queries: Array<{ id?: string; content: string; topK?: number; filter?: string }>;
        concurrency?: number;
        aggregateResults?: boolean;
      }) => {
        const results = new Map<string, any>();
        const errors: Array<{ queryId?: string; query: string; error: string }> = [];

        const processQuery = async (query: (typeof queries)[0], index: number) => {
          try {
            const queryId = query.id || `query_${index}`;

            // Generate embedding for the query
            const { embedding } = await embed({
              model,
              value: query.content,
            });

            // Execute vector search
            const searchResults = await vectorDB.query(embedding, {
              topK: query.topK,
              filter: query.filter ? { filter: query.filter } : undefined,
              includeMetadata: true,
              includeValues: false,
            });

            results.set(queryId, {
              queryId,
              query: query.content,
              results: searchResults,
              resultCount: searchResults.length,
            });
          } catch (error) {
            errors.push({
              queryId: query.id,
              query: query.content,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        };

        // Process queries with concurrency control
        const semaphore = new Array(concurrency).fill(null);
        let queryIndex = 0;

        await Promise.all(
          semaphore.map(async () => {
            while (queryIndex < queries.length) {
              const currentIndex = queryIndex++;
              const query = queries[currentIndex];
              await processQuery(query, currentIndex);
            }
          }),
        );

        let finalResults = Array.from(results.values());

        if (aggregateResults) {
          // Aggregate and deduplicate results
          const allResults = new Map<string, any>();
          const scoreMap = new Map<string, number>();

          finalResults.forEach(queryResult => {
            queryResult.results.forEach((result: any) => {
              const existingScore = scoreMap.get(result.id) || 0;
              if (result.score > existingScore) {
                allResults.set(result.id, result);
                scoreMap.set(result.id, result.score);
              }
            });
          });

          const aggregated = Array.from(allResults.values()).sort((a, b) => b.score - a.score);

          finalResults = [
            {
              queryId: 'aggregated',
              query: 'Multiple queries aggregated',
              results: aggregated,
              resultCount: aggregated.length,
            },
          ];
        }

        return {
          queries: finalResults,
          totalQueries: queries.length,
          successfulQueries: results.size,
          failedQueries: errors.length,
          errors,
          aggregated: aggregateResults,
          message: `Processed ${queries.length} queries: ${results.size} successful, ${errors.length} failed`,
        };
      },
    }),

    bulkUpdate: tool({
      description: 'Update multiple vectors efficiently with batching',
      parameters: z.object({
        updates: z
          .array(
            z.object({
              id: z.string(),
              metadata: z.record(z.string(), z.any()).optional(),
              content: z.string().optional(),
              reEmbed: z.boolean().default(false),
            }),
          )
          .describe('Array of vector updates'),
        batchSize: z
          .number()
          .optional()
          .describe(`Batch size for updates (default: ${defaultBatchSize})`),
        namespace: z.string().optional().describe('Target namespace'),
        concurrency: z
          .number()
          .optional()
          .describe(`Max concurrent batches (default: ${maxConcurrency})`),
      }),
      execute: async ({
        updates,
        batchSize = defaultBatchSize,
        concurrency = maxConcurrency,
      }: {
        updates: Array<{
          id: string;
          metadata?: Record<string, any>;
          content?: string;
          reEmbed?: boolean;
        }>;
        batchSize?: number;
        concurrency?: number;
      }) => {
        const progress: BulkOperationProgress = {
          total: updates.length,
          processed: 0,
          successful: 0,
          failed: 0,
          currentBatch: 0,
          totalBatches: Math.ceil(updates.length / batchSize),
          errors: [],
        };

        const batches: (typeof updates)[] = [];
        for (let i = 0; i < updates.length; i += batchSize) {
          batches.push(updates.slice(i, i + batchSize));
        }

        const processBatch = async (
          batch: typeof updates,
          _batchIndex: number,
        ): Promise<{ success: boolean; count: number; error?: string }> => {
          try {
            const results = await Promise.all(
              batch.map(update => {
                const updateData: any = { id: update.id };
                if (update.metadata) updateData.metadata = update.metadata;
                if (update.content) updateData.data = update.content;
                return vectorDB.update?.(update.id, updateData) || Promise.resolve(false);
              }),
            );
            const successCount = results.filter(Boolean).length;
            return { success: successCount > 0, count: successCount };
          } catch (error) {
            return {
              success: false,
              count: 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        };

        const processWithRetry = async (
          batch: typeof updates,
          batchIndex: number,
        ): Promise<void> => {
          let attempts = 0;
          let lastError: string | undefined;

          while (attempts <= retryAttempts) {
            const result = await processBatch(batch, batchIndex);

            if (result.success) {
              progress.successful += result.count;
              progress.processed += batch.length;
              progress.currentBatch = batchIndex + 1;
              return;
            } else {
              attempts++;
              lastError = result.error;

              if (attempts <= retryAttempts) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
              }
            }
          }

          progress.failed += batch.length;
          progress.processed += batch.length;
          progress.currentBatch = batchIndex + 1;
          progress.errors.push({
            batch: batchIndex,
            error: lastError || 'Unknown error',
            ids: batch.map(u => u.id),
          });
        };

        // Process with concurrency control
        const semaphore = new Array(concurrency).fill(null);
        let batchIndex = 0;

        await Promise.all(
          semaphore.map(async () => {
            while (batchIndex < batches.length) {
              const currentIndex = batchIndex++;
              const batch = batches[currentIndex];
              await processWithRetry(batch, currentIndex);
            }
          }),
        );

        return {
          ...progress,
          success: progress.failed === 0,
          successRate: (progress.successful / progress.total) * 100,
          message: `Updated ${progress.successful} out of ${progress.total} vectors`,
        };
      },
    }),
  };
}

export type BulkTools = ReturnType<typeof createBulkTools>;
