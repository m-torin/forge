import { CoreTool, tool } from 'ai';
import { z } from 'zod/v4';

// Define ToolContext locally for now
export interface ToolContext {
  // Add any context properties needed
  [key: string]: any;
}

/**
 * Enhanced tool factory with common patterns for AI SDK tools
 */

export interface ToolMetadata {
  category?: string;
  tags?: string[];
  version?: string;
  experimental?: boolean;
  deprecated?: boolean;
  rateLimit?: {
    maxCallsPerMinute?: number;
    maxCallsPerHour?: number;
  };
}

export interface ToolFactoryConfig<TParams extends z.ZodTypeAny = z.ZodTypeAny, TResult = any> {
  name: string;
  description: string;
  parameters: TParams;
  metadata?: ToolMetadata;
  // Middleware functions
  beforeExecute?: (params: z.infer<TParams>, context: ToolContext) => Promise<void> | void;
  afterExecute?: (
    result: TResult,
    params: z.infer<TParams>,
    context: ToolContext,
  ) => Promise<void> | void;
  onError?: (
    error: Error,
    params: z.infer<TParams>,
    context: ToolContext,
  ) => Promise<TResult> | TResult;
  // Validation
  validateParams?: (params: z.infer<TParams>) => Promise<boolean> | boolean;
  // Transform functions
  transformParams?: (params: z.infer<TParams>) => Promise<z.infer<TParams>> | z.infer<TParams>;
  transformResult?: (result: TResult) => Promise<any> | any;
}

/**
 * Create an enhanced tool with middleware and lifecycle hooks
 */
export function createEnhancedTool<TParams extends z.ZodTypeAny, TResult>(
  config: ToolFactoryConfig<TParams, TResult>,
  execute: (params: z.infer<TParams>, context: ToolContext) => Promise<TResult> | TResult,
): CoreTool<TParams, TResult> & { metadata?: ToolMetadata } {
  const wrappedTool = tool({
    description: config.description,
    parameters: config.parameters,
    execute: async (params: z.infer<TParams>, context: ToolContext) => {
      try {
        // Custom validation
        if (config.validateParams) {
          const isValid = await config.validateParams(params);
          if (!isValid) {
            throw new Error('Parameter validation failed');
          }
        }

        // Transform parameters
        let transformedParams = params;
        if (config.transformParams) {
          transformedParams = await config.transformParams(params);
        }

        // Before execute hook
        if (config.beforeExecute) {
          await config.beforeExecute(transformedParams, context);
        }

        // Execute the main function
        const result = await execute(transformedParams, context);

        // After execute hook
        if (config.afterExecute) {
          await config.afterExecute(result, transformedParams, context);
        }

        // Transform result
        if (config.transformResult) {
          return await config.transformResult(result);
        }

        return result;
      } catch (error) {
        // Error handling
        if (config.onError && error instanceof Error) {
          return await config.onError(error, params, context);
        }
        throw error;
      }
    },
  });

  // Attach metadata
  return Object.assign(wrappedTool, { metadata: config.metadata });
}

/**
 * Common tool schemas for reuse
 */
export const commonToolSchemas = {
  query: z.string().min(1).describe('The search query'),
  topK: z.number().min(1).max(100).default(5).describe('Number of results to return'),
  threshold: z.number().min(0).max(1).default(0.7).describe('Similarity threshold'),
  userId: z.string().optional().describe('User ID for filtering'),
  namespace: z.string().optional().describe('Namespace for organization'),
  metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata'),
  pagination: z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(10),
  }),
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  sortBy: z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
};

/**
 * Tool factory for creating search tools
 */
export function createSearchTool<T = any>(config: {
  name: string;
  description: string;
  searchFunction: (query: string, options: any) => Promise<T[]>;
  metadata?: ToolMetadata;
}) {
  return createEnhancedTool(
    {
      name: config.name,
      description: config.description,
      parameters: z.object({
        query: commonToolSchemas.query,
        topK: commonToolSchemas.topK,
        threshold: commonToolSchemas.threshold,
        metadata: commonToolSchemas.metadata,
      }),
      metadata: {
        category: 'search',
        ...config.metadata,
      },
    },
    async ({ query, topK, threshold, metadata }) => {
      const results = await config.searchFunction(query, {
        topK,
        threshold,
        metadata,
      });

      return {
        success: true,
        query,
        results,
        count: results.length,
        timestamp: new Date().toISOString(),
      };
    },
  );
}

/**
 * Tool factory for creating CRUD tools
 */
export function createCRUDTools<T extends { id: string }>(config: {
  resourceName: string;
  schemas: {
    create: z.ZodSchema<Omit<T, 'id'>>;
    update: z.ZodSchema<Partial<T>>;
  };
  operations: {
    create: (data: Omit<T, 'id'>) => Promise<T>;
    read: (id: string) => Promise<T | null>;
    update: (id: string, data: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<boolean>;
    list?: (options: {
      page?: number;
      pageSize?: number;
    }) => Promise<{ items: T[]; total: number }>;
  };
  metadata?: ToolMetadata;
}) {
  const baseMetadata = {
    category: 'crud',
    tags: [config.resourceName],
    ...config.metadata,
  };

  const tools: any = {
    create: createEnhancedTool(
      {
        name: `create_${config.resourceName}`,
        description: `Create a new ${config.resourceName}`,
        parameters: config.schemas.create,
        metadata: { ...baseMetadata, tags: [...(baseMetadata.tags || []), 'create'] },
      },
      async data => {
        const result = await config.operations.create(data);
        return {
          success: true,
          data: result,
          message: `${config.resourceName} created successfully`,
        };
      },
    ),

    read: createEnhancedTool(
      {
        name: `get_${config.resourceName}`,
        description: `Get a ${config.resourceName} by ID`,
        parameters: z.object({ id: z.string() }),
        metadata: { ...baseMetadata, tags: [...(baseMetadata.tags || []), 'read'] },
      },
      async ({ id }) => {
        const result = await config.operations.read(id);
        if (!result) {
          return {
            success: false,
            data: null,
            message: `${config.resourceName} not found`,
          };
        }
        return {
          success: true,
          data: result,
          message: `${config.resourceName} retrieved successfully`,
        };
      },
    ),

    update: createEnhancedTool(
      {
        name: `update_${config.resourceName}`,
        description: `Update a ${config.resourceName}`,
        parameters: z.object({
          id: z.string(),
          data: config.schemas.update,
        }),
        metadata: { ...baseMetadata, tags: [...(baseMetadata.tags || []), 'update'] },
      },
      async ({ id, data }) => {
        if (!data) throw new Error('Update data is required');
        const result = await config.operations.update(id, data);
        return {
          success: true,
          data: result,
          message: `${config.resourceName} updated successfully`,
        };
      },
    ),

    delete: createEnhancedTool(
      {
        name: `delete_${config.resourceName}`,
        description: `Delete a ${config.resourceName}`,
        parameters: z.object({ id: z.string() }),
        metadata: { ...baseMetadata, tags: [...(baseMetadata.tags || []), 'delete'] },
      },
      async ({ id }) => {
        const success = await config.operations.delete(id);
        return {
          success,
          message: success
            ? `${config.resourceName} deleted successfully`
            : `Failed to delete ${config.resourceName}`,
        };
      },
    ),
  };

  // Add list operation if provided
  if (config.operations.list) {
    tools.list = createEnhancedTool(
      {
        name: `list_${config.resourceName}s`,
        description: `List ${config.resourceName}s with pagination`,
        parameters: z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
        }),
        metadata: { ...baseMetadata, tags: [...(baseMetadata.tags || []), 'list'] },
      },
      async ({ page, pageSize }) => {
        if (!config.operations.list) throw new Error('List operation not available');
        const result = await config.operations.list({ page, pageSize });
        return {
          success: true,
          data: result.items,
          pagination: {
            page,
            pageSize,
            total: result.total,
            totalPages: Math.ceil(result.total / pageSize),
          },
          message: `Retrieved ${result.items.length} ${config.resourceName}s`,
        };
      },
    );
  }

  return tools;
}

/**
 * Tool factory for async operations with progress tracking
 */
export function createAsyncTool<TParams extends z.ZodTypeAny, TResult>(config: {
  name: string;
  description: string;
  parameters: TParams;
  execute: (
    params: z.infer<TParams>,
    progress: (update: { progress: number; message?: string }) => void,
  ) => Promise<TResult>;
  metadata?: ToolMetadata;
}) {
  return createEnhancedTool(
    {
      name: config.name,
      description: config.description,
      parameters: config.parameters,
      metadata: {
        ...config.metadata,
        tags: [...(config.metadata?.tags || []), 'async'],
      },
    },
    async (params, _context) => {
      const progressUpdates: Array<{ progress: number; message?: string; timestamp: string }> = [];

      const progress = (update: { progress: number; message?: string }) => {
        progressUpdates.push({
          ...update,
          timestamp: new Date().toISOString(),
        });
        // In a real implementation, this could send updates via WebSocket or SSE
      };

      const startTime = Date.now();
      const result = await config.execute(params, progress);
      const endTime = Date.now();

      return {
        result,
        execution: {
          duration: endTime - startTime,
          progressUpdates,
          completed: true,
        },
      };
    },
  );
}

/**
 * Tool factory for batch operations
 */
export function createBatchTool<TItem, TResult>(config: {
  name: string;
  description: string;
  itemSchema: z.ZodSchema<TItem>;
  processItem: (item: TItem, index: number) => Promise<TResult>;
  maxBatchSize?: number;
  metadata?: ToolMetadata;
}) {
  return createEnhancedTool(
    {
      name: config.name,
      description: config.description,
      parameters: z.object({
        items: z.array(config.itemSchema).max(config.maxBatchSize || 100),
        parallel: z.boolean().default(false).describe('Process items in parallel'),
      }),
      metadata: {
        ...config.metadata,
        tags: [...(config.metadata?.tags || []), 'batch'],
      },
    },
    async ({ items, parallel }) => {
      const results: Array<{ index: number; success: boolean; result?: TResult; error?: string }> =
        [];

      if (parallel) {
        const promises = items.map(async (item, index) => {
          try {
            const result = await config.processItem(item, index);
            return { index, success: true, result };
          } catch (error) {
            return {
              index,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
      } else {
        for (let i = 0; i < items.length; i++) {
          try {
            const result = await config.processItem(items[i], i);
            results.push({ index: i, success: true, result });
          } catch (error) {
            results.push({
              index: i,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      return {
        totalItems: items.length,
        successful,
        failed,
        results,
        summary: `Processed ${items.length} items: ${successful} successful, ${failed} failed`,
      };
    },
  );
}
