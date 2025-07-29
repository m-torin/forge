/**
 * Metadata Management Tools for Upstash Vector
 * Advanced filtering, organization, and metadata operations
 */

import { tool } from 'ai';
import { z } from 'zod/v4';
import type { VectorDB } from '../../shared/types/vector';

export interface MetadataToolsConfig {
  vectorDB: VectorDB;
  defaultNamespace?: string;
  enableIndexing?: boolean;
  maxBatchSize?: number;
}

/**
 * Create metadata management tools for AI SDK
 */
export function createMetadataTools(config: MetadataToolsConfig) {
  const { vectorDB, defaultNamespace = 'default', maxBatchSize = 100 } = config;

  return {
    updateMetadata: tool({
      description: 'Update metadata for specific vectors without changing embeddings',
      parameters: z.object({
        vectorId: z.string().describe('Vector ID to update'),
        metadata: z.record(z.string(), z.any()).describe('New metadata to set'),
        mergeMode: z
          .enum(['replace', 'merge', 'append'])
          .default('merge')
          .describe('How to handle existing metadata'),
        namespace: z.string().optional().describe('Target namespace'),
      }),
      execute: async ({
        vectorId,
        metadata,
        mergeMode,
      }: {
        vectorId: string;
        metadata: Record<string, any>;
        mergeMode?: 'replace' | 'merge' | 'append';
      }) => {
        try {
          // First fetch the existing vector to get current metadata
          const existing = await vectorDB.fetch([vectorId]);

          if (!existing || existing.length === 0) {
            throw new Error(`Vector with ID '${vectorId}' not found`);
          }

          const currentVector = existing[0];
          let newMetadata = metadata;

          // Handle merge modes
          if (mergeMode === 'merge' && currentVector.metadata) {
            newMetadata = { ...currentVector.metadata, ...metadata };
          } else if (mergeMode === 'append' && currentVector.metadata) {
            newMetadata = { ...currentVector.metadata };
            for (const [key, value] of Object.entries(metadata)) {
              if (Array.isArray(newMetadata[key]) && Array.isArray(value)) {
                newMetadata[key] = [...newMetadata[key], ...value];
              } else if (typeof newMetadata[key] === 'string' && typeof value === 'string') {
                newMetadata[key] = newMetadata[key] + value;
              } else {
                newMetadata[key] = value;
              }
            }
          }

          // Update the vector with new metadata
          await vectorDB.upsert([
            {
              id: vectorId,
              values: currentVector.values,
              metadata: newMetadata,
            },
          ]);

          return {
            vectorId,
            updated: true,
            mergeMode,
            oldMetadata: currentVector.metadata,
            newMetadata,
            message: `Metadata updated for vector '${vectorId}'`,
          };
        } catch (error) {
          throw new Error(
            `Failed to update metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    bulkUpdateMetadata: tool({
      description: 'Update metadata for multiple vectors efficiently',
      parameters: z.object({
        updates: z
          .array(
            z.object({
              vectorId: z.string(),
              metadata: z.record(z.string(), z.any()),
              mergeMode: z.enum(['replace', 'merge', 'append']).default('merge'),
            }),
          )
          .describe('Array of metadata updates'),
        namespace: z.string().optional().describe('Target namespace'),
        batchSize: z.number().optional().describe('Batch size for processing'),
      }),
      execute: async ({
        updates,
        batchSize = maxBatchSize,
      }: {
        updates: Array<{
          vectorId: string;
          metadata: Record<string, any>;
          mergeMode?: 'replace' | 'merge' | 'append';
        }>;
        batchSize?: number;
      }) => {
        const results = [];
        const errors = [];

        // Process in batches
        for (let i = 0; i < updates.length; i += batchSize) {
          const batch = updates.slice(i, i + batchSize);
          const vectorIds = batch.map(u => u.vectorId);

          try {
            // Fetch existing vectors
            const existing = await vectorDB.fetch(vectorIds);

            const existingMap = new Map(existing.map(v => [v.id, v]));
            const updateBatch = [];

            for (const update of batch) {
              const currentVector = existingMap.get(update.vectorId);
              if (!currentVector) {
                errors.push({ vectorId: update.vectorId, error: 'Vector not found' });
                continue;
              }

              let newMetadata = update.metadata;

              // Handle merge modes
              if (update.mergeMode === 'merge' && currentVector.metadata) {
                newMetadata = { ...currentVector.metadata, ...update.metadata };
              } else if (update.mergeMode === 'append' && currentVector.metadata) {
                newMetadata = { ...currentVector.metadata };
                for (const [key, value] of Object.entries(update.metadata)) {
                  if (Array.isArray(newMetadata[key]) && Array.isArray(value)) {
                    newMetadata[key] = [...newMetadata[key], ...value];
                  } else if (typeof newMetadata[key] === 'string' && typeof value === 'string') {
                    newMetadata[key] = newMetadata[key] + value;
                  } else {
                    newMetadata[key] = value;
                  }
                }
              }

              updateBatch.push({
                id: update.vectorId,
                values: currentVector.values,
                metadata: newMetadata,
              });

              results.push({
                vectorId: update.vectorId,
                updated: true,
                mergeMode: update.mergeMode,
              });
            }

            // Batch update
            if (updateBatch.length > 0) {
              await vectorDB.upsert(updateBatch);
            }
          } catch (error) {
            batch.forEach(update => {
              errors.push({
                vectorId: update.vectorId,
                error: error instanceof Error ? error.message : 'Unknown error',
              });
            });
          }
        }

        return {
          totalUpdates: updates.length,
          successful: results.length,
          failed: errors.length,
          results,
          errors,
          message: `Updated metadata for ${results.length} out of ${updates.length} vectors`,
        };
      },
    }),

    queryByMetadata: tool({
      description: 'Query vectors based on metadata filters without semantic search',
      parameters: z.object({
        filter: z.record(z.string(), z.any()).describe('Metadata filter criteria'),
        limit: z.number().default(10).describe('Maximum number of results'),
        includeVectors: z.boolean().default(false).describe('Include vector values'),
        includeMetadata: z.boolean().default(true).describe('Include metadata'),
        namespace: z.string().optional().describe('Target namespace'),
      }),
      execute: async ({
        filter,
        limit,
        includeVectors,
        includeMetadata,
        namespace,
      }: {
        filter?: Record<string, any>;
        limit?: number;
        includeVectors?: boolean;
        includeMetadata?: boolean;
        namespace?: string;
      }) => {
        try {
          // Use range scan with filter since there's no direct metadata query
          const results = [];
          let cursor = '';

          do {
            const scanResult = await vectorDB.range?.({
              cursor,
              limit: Math.min((limit || 10) * 2, 1000),
              includeVectors,
              includeMetadata: true,
            });

            if (!scanResult?.vectors) break;

            // Apply metadata filter
            const filtered = scanResult.vectors.filter(vector => {
              if (!vector.metadata) return false;

              return Object.entries(filter || {}).every(([key, value]) => {
                const vectorValue = vector.metadata?.[key];

                if (typeof value === 'object' && value !== null) {
                  // Handle complex filters
                  if ('$eq' in value) return vectorValue === value.$eq;
                  if ('$ne' in value) return vectorValue !== value.$ne;
                  if ('$in' in value)
                    return Array.isArray(value.$in) && value.$in.includes(vectorValue);
                  if ('$nin' in value)
                    return Array.isArray(value.$nin) && !value.$nin.includes(vectorValue);
                  if ('$gt' in value)
                    return (
                      typeof vectorValue === 'number' &&
                      typeof (value as any).$gt === 'number' &&
                      vectorValue > (value as any).$gt
                    );
                  if ('$gte' in value)
                    return (
                      typeof vectorValue === 'number' &&
                      typeof (value as any).$gte === 'number' &&
                      vectorValue >= (value as any).$gte
                    );
                  if ('$lt' in value)
                    return (
                      typeof vectorValue === 'number' &&
                      typeof (value as any).$lt === 'number' &&
                      vectorValue < (value as any).$lt
                    );
                  if ('$lte' in value)
                    return (
                      typeof vectorValue === 'number' &&
                      typeof (value as any).$lte === 'number' &&
                      vectorValue <= (value as any).$lte
                    );
                  if ('$regex' in value)
                    return (
                      typeof vectorValue === 'string' &&
                      typeof (value as any).$regex === 'string' &&
                      (() => {
                        try {
                          // Validate regex pattern before using it
                          const regexPattern = (value as any).$regex;
                          if (typeof regexPattern !== 'string' || regexPattern.length === 0) {
                            return false;
                          }
                          // Use a safe regex constructor with validation
                          // eslint-disable-next-line security/detect-non-literal-regexp
                          const safeRegex = new RegExp(regexPattern);
                          return safeRegex.test(vectorValue);
                        } catch {
                          // Invalid regex pattern, treat as no match
                          return false;
                        }
                      })()
                    );
                  if ('$exists' in value)
                    return value.$exists ? vectorValue !== undefined : vectorValue === undefined;
                }

                return vectorValue === value;
              });
            });

            results.push(...filtered);
            cursor = scanResult?.nextCursor || '';

            if (results.length >= (limit || 10)) break;
          } while (cursor);

          const finalResults = results.slice(0, limit).map(vector => ({
            ...vector,
            metadata: includeMetadata ? vector.metadata : undefined,
          }));

          return {
            vectors: finalResults,
            totalFound: finalResults.length,
            filter,
            namespace: namespace || defaultNamespace,
            message: `Found ${finalResults.length} vectors matching metadata filter`,
          };
        } catch (error) {
          throw new Error(
            `Failed to query by metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    getMetadataStats: tool({
      description: 'Get statistics about metadata fields across all vectors',
      parameters: z.object({
        namespace: z.string().optional().describe('Target namespace'),
        sampleSize: z.number().default(1000).describe('Number of vectors to sample for stats'),
        fields: z
          .array(z.string())
          .optional()
          .describe('Specific fields to analyze (all if not specified)'),
      }),
      execute: async ({
        namespace,
        sampleSize,
        fields,
      }: {
        namespace?: string;
        sampleSize?: number;
        fields?: string[];
      }) => {
        try {
          const stats: Record<string, any> = {};
          let totalVectors = 0;
          let cursor = '';

          do {
            const scanResult = await vectorDB.range?.({
              cursor,
              limit: Math.min(sampleSize || 100, 1000),
              includeMetadata: true,
            });

            if (!scanResult?.vectors) break;

            scanResult.vectors.forEach(vector => {
              if (!vector.metadata) return;

              totalVectors++;

              Object.entries(vector.metadata).forEach(([key, value]) => {
                if (fields && !fields.includes(key)) return;

                if (!stats[key]) {
                  stats[key] = {
                    count: 0,
                    types: new Set(),
                    values: new Set(),
                    nullCount: 0,
                  };
                }

                stats[key].count++;

                if (value === null || value === undefined) {
                  stats[key].nullCount++;
                } else {
                  stats[key].types.add(typeof value);

                  // Collect unique values for small sets
                  if (stats[key].values.size < 100) {
                    stats[key].values.add(JSON.stringify(value));
                  }
                }
              });
            });

            cursor = scanResult.nextCursor || '';

            if (totalVectors >= (sampleSize || 1000)) break;
          } while (cursor);

          // Convert sets to arrays for JSON serialization
          const finalStats = Object.entries(stats).reduce(
            (acc, [key, stat]) => {
              acc[key] = {
                count: stat.count,
                coverage: (stat.count / totalVectors) * 100,
                types: Array.from(stat.types),
                nullCount: stat.nullCount,
                uniqueValues:
                  stat.values.size < 100
                    ? Array.from(stat.values).map(v => (typeof v === 'string' ? JSON.parse(v) : v))
                    : `${stat.values.size}+ unique values`,
              };
              return acc;
            },
            {} as Record<string, any>,
          );

          return {
            totalVectors,
            fieldsAnalyzed: Object.keys(finalStats).length,
            stats: finalStats,
            namespace: namespace || defaultNamespace,
            sampleSize: Math.min(totalVectors, sampleSize || 100),
            message: `Analyzed metadata for ${totalVectors} vectors`,
          };
        } catch (error) {
          throw new Error(
            `Failed to get metadata stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),

    cleanupMetadata: tool({
      description: 'Clean up and optimize metadata across vectors',
      parameters: z.object({
        operations: z
          .array(z.enum(['remove_null', 'remove_empty', 'normalize_types', 'deduplicate_arrays']))
          .describe('Cleanup operations to perform'),
        namespace: z.string().optional().describe('Target namespace'),
        dryRun: z.boolean().default(true).describe('Preview changes without applying them'),
        batchSize: z.number().optional().describe('Batch size for processing'),
      }),
      execute: async ({
        operations,
        namespace,
        dryRun,
        batchSize = maxBatchSize,
      }: {
        operations: Array<
          'remove_null' | 'remove_empty' | 'normalize_types' | 'deduplicate_arrays'
        >;
        namespace?: string;
        dryRun?: boolean;
        batchSize?: number;
      }) => {
        const changes = [];
        let totalVectors = 0;
        let cursor = '';

        try {
          do {
            const scanResult = await vectorDB.range?.({
              cursor,
              limit: batchSize,
              includeVectors: true,
              includeMetadata: true,
            });

            if (!scanResult?.vectors) break;

            const updateBatch = [];

            for (const vector of scanResult.vectors) {
              if (!vector.metadata) continue;

              totalVectors++;
              let newMetadata = { ...vector.metadata };
              let hasChanges = false;

              // Apply cleanup operations
              if (operations.includes('remove_null')) {
                Object.keys(newMetadata).forEach(key => {
                  if (newMetadata[key] === null || newMetadata[key] === undefined) {
                    delete newMetadata[key];
                    hasChanges = true;
                  }
                });
              }

              if (operations.includes('remove_empty')) {
                Object.keys(newMetadata).forEach(key => {
                  const value = newMetadata[key];
                  if (
                    value === '' ||
                    (Array.isArray(value) && value.length === 0) ||
                    (typeof value === 'object' && Object.keys(value).length === 0)
                  ) {
                    delete newMetadata[key];
                    hasChanges = true;
                  }
                });
              }

              if (operations.includes('normalize_types')) {
                Object.keys(newMetadata).forEach(key => {
                  const value = newMetadata[key];
                  if (typeof value === 'string') {
                    // Try to normalize string numbers
                    const num = Number(value);
                    if (!isNaN(num) && isFinite(num) && value.trim() !== '') {
                      newMetadata[key] = num;
                      hasChanges = true;
                    }
                    // Normalize booleans
                    else if (value.toLowerCase() === 'true') {
                      newMetadata[key] = true;
                      hasChanges = true;
                    } else if (value.toLowerCase() === 'false') {
                      newMetadata[key] = false;
                      hasChanges = true;
                    }
                  }
                });
              }

              if (operations.includes('deduplicate_arrays')) {
                Object.keys(newMetadata).forEach(key => {
                  const value = newMetadata[key];
                  if (Array.isArray(value)) {
                    const deduped = [...new Set(value)];
                    if (deduped.length !== value.length) {
                      newMetadata[key] = deduped;
                      hasChanges = true;
                    }
                  }
                });
              }

              if (hasChanges) {
                changes.push({
                  vectorId: vector.id,
                  oldMetadata: vector.metadata,
                  newMetadata,
                });

                if (!dryRun) {
                  updateBatch.push({
                    id: vector.id,
                    values: vector.values,
                    metadata: newMetadata,
                  });
                }
              }
            }

            // Apply updates if not dry run
            if (!dryRun && updateBatch.length > 0) {
              await vectorDB.upsert(updateBatch);
            }

            cursor = scanResult.nextCursor || '';
          } while (cursor);

          return {
            totalVectors,
            changesFound: changes.length,
            operations,
            dryRun,
            changes: dryRun ? changes.slice(0, 10) : [], // Show preview in dry run
            namespace: namespace || defaultNamespace,
            message: dryRun
              ? `Found ${changes.length} vectors that would be modified (dry run)`
              : `Updated metadata for ${changes.length} vectors`,
          };
        } catch (error) {
          throw new Error(
            `Failed to cleanup metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),
  };
}

export type MetadataTools = ReturnType<typeof createMetadataTools>;
