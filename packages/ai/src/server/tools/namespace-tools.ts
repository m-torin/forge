/**
 * Namespace Management Tools for Upstash Vector
 * Enables multi-tenant applications with isolated vector namespaces
 */

import { logWarn } from '@repo/observability/server/next';
import { tool } from 'ai';
import { z } from 'zod/v4';
import type { VectorDB } from '../../shared/types/vector';

export interface NamespaceToolsConfig {
  vectorDB: VectorDB;
  defaultNamespace?: string;
  allowedNamespaces?: string[];
  maxNamespaces?: number;
}

/**
 * Create namespace management tools for AI SDK
 */
export function createNamespaceTools(config: NamespaceToolsConfig) {
  const { vectorDB, defaultNamespace = 'default', allowedNamespaces, maxNamespaces = 100 } = config;

  return {
    createNamespace: tool({
      description: 'Create or switch to a vector namespace for multi-tenant applications',
      parameters: z.object({
        namespace: z.string().describe('Namespace name to create or use'),
        description: z.string().optional().describe('Optional description for the namespace'),
        metadata: z.record(z.string(), z.any()).optional().describe('Optional namespace metadata'),
      }),
      execute: async ({
        namespace,
        description,
        metadata,
      }: {
        namespace: string;
        description?: string;
        metadata?: Record<string, any>;
      }) => {
        // Validate namespace name
        if (!namespace || namespace.length === 0) {
          throw new Error('Namespace name cannot be empty');
        }

        // Check against allowed namespaces if configured
        if (allowedNamespaces && !allowedNamespaces.includes(namespace)) {
          throw new Error(`Namespace '${namespace}' is not in the allowed list`);
        }

        // Get current namespaces to check limits
        const existingNamespaces = (await vectorDB.listNamespaces?.()) || [];

        if (!existingNamespaces.includes(namespace) && existingNamespaces.length >= maxNamespaces) {
          throw new Error(`Maximum number of namespaces (${maxNamespaces}) reached`);
        }

        // Create namespace by upserting a temporary vector (Upstash creates namespace on first use)
        const tempId = `__namespace_init_${Date.now()}`;
        await vectorDB.upsert([
          {
            id: tempId,
            values: [0.1], // Minimal vector to create namespace
            metadata: {
              __temp: true,
              __namespace_created: new Date().toISOString(),
              description,
              ...metadata,
            },
          },
        ]);

        // Clean up temporary vector
        await vectorDB.delete([tempId]);

        return {
          namespace,
          created: true,
          description,
          metadata,
          message: `Namespace '${namespace}' is ready for use`,
        };
      },
    }),

    listNamespaces: tool({
      description: 'List all available namespaces in the vector database',
      parameters: z.object({
        includeStats: z
          .boolean()
          .default(false)
          .describe('Include vector count and other stats for each namespace'),
      }),
      execute: async ({ includeStats }: { includeStats?: boolean }) => {
        try {
          const namespaces = (await vectorDB.listNamespaces?.()) || [];

          if (!includeStats) {
            return {
              namespaces,
              total: namespaces.length,
              default: defaultNamespace,
            };
          }

          // Get stats for each namespace if requested
          const namespacesWithStats = await Promise.all(
            namespaces.map(async ns => {
              try {
                const info = await vectorDB.describe?.();
                return {
                  name: ns,
                  vectorCount: info?.totalVectorCount || 0,
                  isDefault: ns === defaultNamespace,
                };
              } catch (_error) {
                return {
                  name: ns,
                  vectorCount: 0,
                  isDefault: ns === defaultNamespace,
                  error: 'Could not fetch stats',
                };
              }
            }),
          );

          return {
            namespaces: namespacesWithStats,
            total: namespaces.length,
            default: defaultNamespace,
          };
        } catch (error) {
          return {
            namespaces: [],
            total: 0,
            error: error instanceof Error ? error.message : 'Failed to list namespaces',
          };
        }
      },
    }),

    switchNamespace: tool({
      description: 'Switch the current working namespace context',
      parameters: z.object({
        namespace: z.string().describe('Namespace to switch to'),
        createIfMissing: z
          .boolean()
          .default(false)
          .describe('Create namespace if it does not exist'),
      }),
      execute: async ({
        namespace,
        createIfMissing,
      }: {
        namespace: string;
        createIfMissing?: boolean;
      }) => {
        const existingNamespaces = (await vectorDB.listNamespaces?.()) || [];

        if (!existingNamespaces.includes(namespace)) {
          if (createIfMissing) {
            // Create the namespace
            const tempId = `__namespace_init_${Date.now()}`;
            await vectorDB.upsert([
              {
                id: tempId,
                values: [0.1],
                metadata: { __temp: true },
              },
            ]);
            await vectorDB.delete([tempId]);

            return {
              namespace,
              switched: true,
              created: true,
              message: `Created and switched to namespace '${namespace}'`,
            };
          } else {
            throw new Error(
              `Namespace '${namespace}' does not exist. Set createIfMissing=true to create it.`,
            );
          }
        }

        return {
          namespace,
          switched: true,
          created: false,
          message: `Switched to namespace '${namespace}'`,
        };
      },
    }),

    deleteNamespace: tool({
      description: 'Delete an entire namespace and all its vectors (DANGEROUS)',
      parameters: z.object({
        namespace: z.string().describe('Namespace to delete'),
        confirm: z.boolean().describe('Confirmation flag to prevent accidental deletion'),
        backup: z.boolean().default(false).describe('Create backup before deletion'),
      }),
      execute: async ({
        namespace,
        confirm,
        backup,
      }: {
        namespace: string;
        confirm?: boolean;
        backup?: boolean;
      }) => {
        if (!confirm) {
          throw new Error('Deletion not confirmed. Set confirm=true to proceed.');
        }

        if (namespace === defaultNamespace) {
          throw new Error('Cannot delete the default namespace');
        }

        const existingNamespaces = (await vectorDB.listNamespaces?.()) || [];
        if (!existingNamespaces.includes(namespace)) {
          return {
            namespace,
            deleted: false,
            message: `Namespace '${namespace}' does not exist`,
          };
        }

        let backupData = null;
        if (backup) {
          // Create backup by fetching all vectors in the namespace
          try {
            const vectors = [];
            let cursor = '';

            do {
              const result = await vectorDB.range?.({
                cursor,
                limit: 1000,
                includeVectors: true,
                includeMetadata: true,
              });

              if (result?.vectors) {
                vectors.push(...result.vectors);
                cursor = result.nextCursor || '';
              } else {
                break;
              }
            } while (cursor);

            backupData = {
              namespace,
              vectors,
              timestamp: new Date().toISOString(),
              totalVectors: vectors.length,
            };
          } catch (error) {
            logWarn('Failed to create backup', {
              error: error instanceof Error ? error.message : String(error),
              operation: 'namespace_backup_creation',
              namespace,
            });
          }
        }

        // Delete the namespace
        await vectorDB.deleteNamespace?.(namespace);

        return {
          namespace,
          deleted: true,
          backup: backupData,
          message: `Namespace '${namespace}' has been deleted`,
        };
      },
    }),

    getNamespaceInfo: tool({
      description: 'Get detailed information about a specific namespace',
      parameters: z.object({
        namespace: z.string().describe('Namespace to get information about'),
      }),
      execute: async ({ namespace }: { namespace: string }) => {
        try {
          const existingNamespaces = (await vectorDB.listNamespaces?.()) || [];

          if (!existingNamespaces.includes(namespace)) {
            return {
              namespace,
              exists: false,
              error: 'Namespace does not exist',
            };
          }

          const info = await vectorDB.describe?.();

          return {
            namespace,
            exists: true,
            vectorCount: info?.totalVectorCount || 0,
            dimension: info?.dimension || 0,
            isDefault: namespace === defaultNamespace,
            info,
          };
        } catch (error) {
          return {
            namespace,
            exists: false,
            error: error instanceof Error ? error.message : 'Failed to get namespace info',
          };
        }
      },
    }),

    migrateNamespace: tool({
      description: 'Migrate vectors from one namespace to another',
      parameters: z.object({
        sourceNamespace: z.string().describe('Source namespace to migrate from'),
        targetNamespace: z.string().describe('Target namespace to migrate to'),
        batchSize: z.number().default(100).describe('Number of vectors to migrate per batch'),
        deleteSource: z
          .boolean()
          .default(false)
          .describe('Delete source namespace after migration'),
      }),
      execute: async ({
        sourceNamespace,
        targetNamespace,
        batchSize,
        deleteSource,
      }: {
        sourceNamespace: string;
        targetNamespace: string;
        batchSize?: number;
        deleteSource?: boolean;
      }) => {
        const existingNamespaces = (await vectorDB.listNamespaces?.()) || [];

        if (!existingNamespaces.includes(sourceNamespace)) {
          throw new Error(`Source namespace '${sourceNamespace}' does not exist`);
        }

        let totalMigrated = 0;
        let cursor = '';

        do {
          const result = await vectorDB.range?.({
            cursor,
            limit: batchSize,
            includeVectors: true,
            includeMetadata: true,
          });

          if (result?.vectors && result.vectors.length > 0) {
            // Migrate batch to target namespace
            const vectorsToMigrate = result.vectors.map(v => ({
              id: v.id,
              values: v.values || [],
              metadata: v.metadata,
            }));

            await vectorDB.upsert(vectorsToMigrate);
            totalMigrated += vectorsToMigrate.length;

            cursor = result.nextCursor || '';
          } else {
            break;
          }
        } while (cursor);

        if (deleteSource && totalMigrated > 0) {
          await vectorDB.deleteNamespace?.(sourceNamespace);
        }

        return {
          sourceNamespace,
          targetNamespace,
          totalMigrated,
          sourceDeleted: deleteSource,
          message: `Migrated ${totalMigrated} vectors from '${sourceNamespace}' to '${targetNamespace}'`,
        };
      },
    }),
  };
}

export type NamespaceTools = ReturnType<typeof createNamespaceTools>;
