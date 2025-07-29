/**
 * Range/Pagination Tools for Upstash Vector
 * Efficient scanning and pagination for large vector datasets
 */

import { logInfo } from '@repo/observability';
import { tool } from 'ai';
import { z } from 'zod/v4';
import type { VectorDB } from '../../shared/types/vector';

export interface RangeToolsConfig {
  vectorDB: VectorDB;
  defaultPageSize?: number;
  maxPageSize?: number;
  enableCaching?: boolean;
}

export interface PaginationState {
  cursor: string;
  hasMore: boolean;
  totalScanned: number;
  currentPage: number;
}

/**
 * Create range/pagination tools for AI SDK
 */
export function createRangeTools(config: RangeToolsConfig) {
  const { vectorDB, defaultPageSize = 100, maxPageSize = 1000, enableCaching = false } = config;

  // Simple in-memory cache for pagination results
  const cache = new Map<string, any>();

  return {
    scanVectors: tool({
      description: 'Scan through vectors with pagination for large datasets',
      parameters: z.object({
        cursor: z
          .string()
          .default('')
          .describe('Pagination cursor (empty string to start from beginning)'),
        limit: z
          .number()
          .optional()
          .describe(`Number of vectors to return per page (max: ${maxPageSize})`),
        includeVectors: z.boolean().default(false).describe('Include vector values in response'),
        includeMetadata: z.boolean().default(true).describe('Include metadata in response'),
        includeData: z.boolean().default(true).describe('Include data field in response'),
        namespace: z.string().optional().describe('Namespace to scan'),
        filter: z.string().optional().describe('Metadata filter to apply during scan'),
      }),
      execute: async ({
        cursor,
        limit = defaultPageSize,
        includeVectors,
        includeMetadata,
        includeData,
        namespace,
      }: {
        cursor?: string;
        limit?: number;
        includeVectors?: boolean;
        includeMetadata?: boolean;
        includeData?: boolean;
        namespace?: string;
      }) => {
        // Validate limit
        const actualLimit = Math.min(limit, maxPageSize);

        try {
          const result = await vectorDB.range?.({
            cursor,
            limit: actualLimit,
            includeVectors,
            includeMetadata,
            includeData,
          });

          if (!result) {
            return {
              vectors: [],
              nextCursor: '',
              hasMore: false,
              totalScanned: 0,
              currentPage: cursor ? parseInt(cursor.split('_')[1] || '1') : 1,
              pageSize: actualLimit,
              namespace: namespace || 'default',
            };
          }

          const currentPage = cursor ? parseInt(cursor.split('_')[1] || '1') : 1;

          return {
            vectors: result.vectors || [],
            nextCursor: result.nextCursor || '',
            hasMore: (result.nextCursor || '') !== '',
            totalScanned: (result.vectors || []).length,
            currentPage,
            pageSize: actualLimit,
            namespace: namespace || 'default',
          };
        } catch (error) {
          throw new Error(
            `Failed to scan vectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    scanAllVectors: tool({
      description: 'Scan all vectors in a namespace with automatic pagination',
      parameters: z.object({
        batchSize: z
          .number()
          .optional()
          .describe(`Batch size for each scan (default: ${defaultPageSize})`),
        maxVectors: z
          .number()
          .optional()
          .describe('Maximum number of vectors to scan (safety limit)'),
        includeVectors: z.boolean().default(false).describe('Include vector values in response'),
        includeMetadata: z.boolean().default(true).describe('Include metadata in response'),
        includeData: z.boolean().default(true).describe('Include data field in response'),
        namespace: z.string().optional().describe('Namespace to scan'),
        onProgress: z.boolean().default(false).describe('Return progress updates during scanning'),
      }),
      execute: async ({
        batchSize = defaultPageSize,
        maxVectors = 10000,
        includeVectors,
        includeMetadata,
        includeData,
        namespace,
        onProgress,
      }: {
        batchSize?: number;
        maxVectors?: number;
        includeVectors?: boolean;
        includeMetadata?: boolean;
        includeData?: boolean;
        namespace?: string;
        onProgress?: boolean;
      }) => {
        const allVectors = [];
        let cursor = '';
        let totalScanned = 0;
        let batchCount = 0;
        const actualBatchSize = Math.min(batchSize, maxPageSize);

        try {
          do {
            const result = await vectorDB.range?.({
              cursor,
              limit: actualBatchSize,
              includeVectors,
              includeMetadata,
              includeData,
            });

            if (!result || !result.vectors || result.vectors.length === 0) {
              break;
            }

            allVectors.push(...result.vectors);
            totalScanned += result.vectors.length;
            batchCount++;
            cursor = result.nextCursor || '';

            // Safety check to prevent infinite loops
            if (totalScanned >= maxVectors) {
              break;
            }

            // Optional progress callback
            if (onProgress && batchCount % 10 === 0) {
              logInfo(`Scanned ${totalScanned} vectors in ${batchCount} batches`, {
                operation: 'scan_all_vectors_progress',
                totalScanned,
                batchCount,
                namespace,
              });
            }
          } while (cursor && cursor !== '');

          return {
            vectors: allVectors,
            totalScanned,
            batchCount,
            completed: cursor === '' || cursor === undefined,
            truncated: totalScanned >= maxVectors,
            namespace: namespace || 'default',
            message: `Scanned ${totalScanned} vectors in ${batchCount} batches`,
          };
        } catch (error) {
          throw new Error(
            `Failed to scan all vectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    exportVectors: tool({
      description: 'Export vectors from a namespace with optional filtering and formatting',
      parameters: z.object({
        namespace: z.string().optional().describe('Namespace to export from'),
        format: z.enum(['json', 'csv', 'jsonl']).default('json').describe('Export format'),
        includeVectors: z.boolean().default(true).describe('Include vector values in export'),
        includeMetadata: z.boolean().default(true).describe('Include metadata in export'),
        includeData: z.boolean().default(true).describe('Include data field in export'),
        filter: z.string().optional().describe('Metadata filter to apply during export'),
        maxVectors: z.number().default(10000).describe('Maximum number of vectors to export'),
        batchSize: z.number().optional().describe('Batch size for export processing'),
      }),
      execute: async ({
        namespace,
        format,
        includeVectors,
        includeMetadata,
        includeData,
        maxVectors,
        batchSize = defaultPageSize,
      }: {
        namespace?: string;
        format?: 'json' | 'csv' | 'jsonl';
        includeVectors?: boolean;
        includeMetadata?: boolean;
        includeData?: boolean;
        maxVectors?: number;
        batchSize?: number;
      }) => {
        const exportedVectors = [];
        let cursor = '';
        let totalExported = 0;
        const startTime = Date.now();

        try {
          do {
            const result = await vectorDB.range?.({
              cursor,
              limit: Math.min(batchSize, maxPageSize),
              includeVectors,
              includeMetadata,
              includeData,
            });

            if (!result || !result.vectors || result.vectors.length === 0) {
              break;
            }

            exportedVectors.push(...result.vectors);
            totalExported += result.vectors.length;
            cursor = result.nextCursor || '';

            if (totalExported >= (maxVectors || 1000)) {
              break;
            }
          } while (cursor && cursor !== '');

          // Format the data based on requested format
          let formattedData: string;
          let mimeType: string;

          switch (format) {
            case 'csv':
              formattedData = formatAsCSV(exportedVectors);
              mimeType = 'text/csv';
              break;
            case 'jsonl':
              formattedData = exportedVectors.map(v => JSON.stringify(v)).join('\n');
              mimeType = 'application/jsonl';
              break;
            case 'json':
            default:
              formattedData = JSON.stringify(exportedVectors, null, 2);
              mimeType = 'application/json';
              break;
          }

          const exportTime = Date.now() - startTime;

          return {
            data: formattedData,
            metadata: {
              totalVectors: totalExported,
              namespace: namespace || 'default',
              format,
              exportTime,
              mimeType,
              size: formattedData.length,
              truncated: totalExported >= (maxVectors || 1000),
            },
            message: `Exported ${totalExported} vectors in ${format} format`,
          };
        } catch (error) {
          throw new Error(
            `Failed to export vectors: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    getVectorsByPrefix: tool({
      description: 'Get all vectors with IDs matching a specific prefix',
      parameters: z.object({
        prefix: z.string().describe('ID prefix to match'),
        limit: z
          .number()
          .optional()
          .describe(`Maximum number of vectors to return (default: ${defaultPageSize})`),
        includeVectors: z.boolean().default(false).describe('Include vector values in response'),
        includeMetadata: z.boolean().default(true).describe('Include metadata in response'),
        includeData: z.boolean().default(true).describe('Include data field in response'),
        namespace: z.string().optional().describe('Namespace to search in'),
      }),
      execute: async ({
        prefix,
        limit = defaultPageSize,
        includeVectors,
        includeMetadata,
        includeData,
        namespace,
      }: {
        prefix: string;
        limit?: number;
        includeVectors?: boolean;
        includeMetadata?: boolean;
        includeData?: boolean;
        namespace?: string;
      }) => {
        const matchingVectors = [];
        let cursor = '';
        let totalScanned = 0;
        const actualLimit = Math.min(limit, maxPageSize);

        try {
          do {
            const result = await vectorDB.range?.({
              cursor,
              limit: 100, // Use smaller batches for prefix scanning
              includeVectors,
              includeMetadata,
              includeData,
            });

            if (!result || !result.vectors || result.vectors.length === 0) {
              break;
            }

            // Filter vectors by prefix
            const prefixMatches = result.vectors.filter(v => v.id.startsWith(prefix));
            matchingVectors.push(...prefixMatches);
            totalScanned += result.vectors.length;
            cursor = result.nextCursor || '';

            // Stop if we have enough matches
            if (matchingVectors.length >= actualLimit) {
              break;
            }

            // Safety check to prevent scanning too many vectors
            if (totalScanned >= 10000) {
              break;
            }
          } while (cursor && cursor !== '');

          return {
            vectors: matchingVectors.slice(0, actualLimit),
            totalMatches: matchingVectors.length,
            totalScanned,
            prefix,
            truncated: matchingVectors.length > actualLimit,
            namespace: namespace || 'default',
            message: `Found ${matchingVectors.length} vectors with prefix '${prefix}'`,
          };
        } catch (error) {
          throw new Error(
            `Failed to get vectors by prefix: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    createPaginationSession: tool({
      description: 'Create a stateful pagination session for efficient browsing',
      parameters: z.object({
        sessionId: z.string().describe('Unique session identifier'),
        pageSize: z.number().optional().describe(`Vectors per page (default: ${defaultPageSize})`),
        namespace: z.string().optional().describe('Namespace to paginate'),
        includeVectors: z.boolean().default(false).describe('Include vector values'),
        includeMetadata: z.boolean().default(true).describe('Include metadata'),
        includeData: z.boolean().default(true).describe('Include data field'),
      }),
      execute: async ({
        sessionId,
        pageSize = defaultPageSize,
        namespace,
        includeVectors,
        includeMetadata,
        includeData,
      }: {
        sessionId: string;
        pageSize?: number;
        namespace?: string;
        includeVectors?: boolean;
        includeMetadata?: boolean;
        includeData?: boolean;
      }) => {
        const actualPageSize = Math.min(pageSize, maxPageSize);

        const session = {
          sessionId,
          cursor: '',
          pageSize: actualPageSize,
          namespace: namespace || 'default',
          includeVectors,
          includeMetadata,
          includeData,
          currentPage: 0,
          totalScanned: 0,
          createdAt: new Date().toISOString(),
        };

        if (enableCaching) {
          cache.set(sessionId, session);
        }

        return {
          sessionId,
          created: true,
          pageSize: actualPageSize,
          namespace: namespace || 'default',
          message: `Pagination session '${sessionId}' created`,
        };
      },
    }),

    getNextPage: tool({
      description: 'Get the next page of results for a pagination session',
      parameters: z.object({
        sessionId: z.string().describe('Session identifier'),
      }),
      execute: async ({ sessionId }: { sessionId: string }) => {
        let session = enableCaching ? cache.get(sessionId) : null;

        if (!session) {
          throw new Error(`Pagination session '${sessionId}' not found or caching disabled`);
        }

        try {
          const result = await vectorDB.range?.({
            cursor: session.cursor,
            limit: session.pageSize,
            includeVectors: session.includeVectors,
            includeMetadata: session.includeMetadata,
            includeData: session.includeData,
          });

          if (!result) {
            return {
              vectors: [],
              hasMore: false,
              currentPage: session.currentPage,
              sessionId,
            };
          }

          // Update session state
          session.cursor = result.nextCursor || '';
          session.currentPage++;
          session.totalScanned += (result.vectors || []).length;

          if (enableCaching) {
            cache.set(sessionId, session);
          }

          return {
            vectors: result.vectors || [],
            hasMore: (result.nextCursor || '') !== '',
            currentPage: session.currentPage,
            totalScanned: session.totalScanned,
            sessionId,
          };
        } catch (error) {
          throw new Error(
            `Failed to get next page: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),
  };
}

// Helper function to format vectors as CSV
function formatAsCSV(vectors: any[]): string {
  if (vectors.length === 0) return '';

  const headers = ['id', 'vector', 'metadata', 'data'];
  const rows = vectors.map(v => [
    v.id,
    v.vector ? JSON.stringify(v.vector) : '',
    v.metadata ? JSON.stringify(v.metadata) : '',
    v.data || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}

export type RangeTools = ReturnType<typeof createRangeTools>;
