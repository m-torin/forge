/**
 * Simplified Tool System for AI SDK v5
 *
 * One import, progressive enhancement, clear patterns
 */

import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod';
import {
  ToolRegistry,
  createAdvancedToolRegistry,
  createSimpleToolRegistry,
  createStandardToolRegistry,
  type ToolContext,
  type ToolMetadata,
} from './tool-registry';

// Re-export the Tool type for convenience
export type { Tool };

/**
 * Global registry instance - single source of truth
 */
export const globalRegistry = createStandardToolRegistry();

/**
 * Options for createTools function
 */
export interface CreateToolsOptions {
  /** Enable performance tracking */
  track?: boolean;
  /** Enable caching */
  cache?:
    | boolean
    | {
        ttl?: number;
        maxSize?: number;
      };
  /** Enable dynamic loading */
  dynamic?: boolean;
  /** Tool context for factories */
  context?: ToolContext;
}

/**
 * Create a tool collection with optional features
 *
 * @example
 * ```typescript
 * // Basic usage
 * const tools = createTools({
 *   weather: weatherTool,
 *   search: searchTool
 * });
 *
 * // With tracking
 * const tools = createTools({
 *   weather: weatherTool,
 *   search: searchTool
 * }, { track: true });
 * ```
 */
export function createTools(
  tools: Record<string, Tool>,
  options: CreateToolsOptions = {},
): Record<string, Tool> {
  // Use global registry for standard cases, create new for advanced
  let registry: ToolRegistry;
  let isTemporary = false;

  if (options.dynamic || (options.cache && options.cache !== true)) {
    // Advanced features need their own registry
    registry = createAdvancedToolRegistry();
    isTemporary = true;
  } else if (!options.track && !options.cache) {
    // Simple case - create temporary registry
    registry = createSimpleToolRegistry();
    isTemporary = true;
  } else {
    // Standard case - use global registry
    registry = globalRegistry;
  }

  // Register all tools
  for (const [name, tool] of Object.entries(tools)) {
    registry.register(name, tool);
  }

  // Return tools (with context if provided)
  const result = registry.getAll(options.context);

  // If using temporary registry, clear it after getting tools
  if (isTemporary) {
    registry.clear();
  }

  return result;
}

/**
 * Tool creation helpers
 */
export const createTool = {
  /**
   * Create a simple tool
   *
   * @example
   * ```typescript
   * const weatherTool = createTool.simple({
   *   description: 'Get weather information',
   *   inputSchema: z.object({
   *     location: z.string()
   *   }),
   *   execute: async ({ location }) => {
   *     return { temp: 72, location };
   *   }
   * });
   * ```
   */
  simple<TParams extends z.ZodTypeAny, TResult>(config: {
    description: string;
    parameters: TParams;
    execute: (args: z.infer<TParams>) => Promise<TResult> | TResult;
  }): Tool {
    return aiTool({
      description: config.description,
      inputSchema: config.parameters,
      execute: async (args: any, _options: any) => config.execute(args),
    } as any) as Tool;
  },

  /**
   * Create a tool with context
   *
   * @example
   * ```typescript
   * const dbTool = createTool.withContext({
   *   description: 'Query database',
   *   inputSchema: z.object({
   *     query: z.string()
   *   }),
   *   execute: async ({ query }, context) => {
   *     return context.db.query(query);
   *   }
   * }, { db: myDatabase });
   * ```
   */
  withContext<TParams extends z.ZodTypeAny, TResult>(
    config: {
      description: string;
      parameters: TParams;
      execute: (args: z.infer<TParams>, context: ToolContext) => Promise<TResult> | TResult;
    },
    context: ToolContext,
  ): Tool {
    return aiTool({
      description: config.description,
      inputSchema: config.parameters,
      execute: async (args: any, _options: any) => config.execute(args, context),
    } as any) as Tool;
  },

  /**
   * Create a tool with metadata
   *
   * @example
   * ```typescript
   * const securedTool = createTool.withMetadata({
   *   tool: myTool,
   *   metadata: {
   *     name: 'secured-tool',
   *     category: 'security',
   *     security: 'high',
   *     tags: ['auth', 'sensitive']
   *   }
   * });
   * ```
   */
  withMetadata(config: {
    tool: Tool;
    metadata: Partial<ToolMetadata>;
  }): Tool & { metadata: Partial<ToolMetadata> } {
    return Object.assign(config.tool, { metadata: config.metadata });
  },
};

/**
 * Common tool schemas for reuse
 */
export const schemas = {
  id: z.string().describe('Unique identifier'),
  query: z.string().describe('Search query'),
  limit: z.number().optional().default(10).describe('Maximum results'),
  content: z.string().describe('Content to process'),
  location: z.string().describe('Location or place'),
  metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata'),
} as const;

/**
 * Preset tool collections
 */
export const toolsets = {
  /**
   * Standard tools (weather, search, calculator, etc.)
   *
   * @example
   * ```typescript
   * const tools = toolsets.standard();
   * ```
   */
  standard(): Record<string, Tool> {
    // Check if standard tools are already in global registry
    if (
      globalRegistry.get('weather') &&
      globalRegistry.get('search') &&
      globalRegistry.get('calculator')
    ) {
      return {
        weather: globalRegistry.get('weather') as Tool,
        search: globalRegistry.get('search') as Tool,
        calculator: globalRegistry.get('calculator') as Tool,
      };
    }

    // Register standard tools in global registry
    globalRegistry.register(
      'weather',
      createTool.simple({
        description: 'Get weather information',
        parameters: z.object({
          location: schemas.location,
          units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
        }),
        execute: async args => {
          const { location, units } = args;
          const temp = units === 'fahrenheit' ? 72 : 22;
          return {
            location,
            temperature: temp,
            unit: units === 'fahrenheit' ? '°F' : '°C',
            conditions: 'Partly cloudy',
          };
        },
      }),
    );

    globalRegistry.register(
      'search',
      createTool.simple({
        description: 'Search for information',
        parameters: z.object({
          query: schemas.query,
          limit: schemas.limit,
        }),
        execute: async args => {
          const { query, limit } = args;
          return {
            query,
            results: Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
              title: `Result ${i + 1}`,
              content: `Content for ${query}`,
              relevance: 0.9 - i * 0.1,
            })),
          };
        },
      }),
    );

    globalRegistry.register(
      'calculator',
      createTool.simple({
        description: 'Perform calculations',
        parameters: z.object({
          expression: z.string().describe('Mathematical expression'),
        }),
        execute: async args => {
          const { expression } = args;
          try {
            // Simple safe eval for demo
            const result = Function(`"use strict"; return (${expression})`)();
            return { expression, result };
          } catch (_error) {
            return { expression, error: 'Invalid expression' };
          }
        },
      }),
    );

    return {
      weather: globalRegistry.get('weather') as Tool,
      search: globalRegistry.get('search') as Tool,
      calculator: globalRegistry.get('calculator') as Tool,
    };
  },

  /**
   * RAG tools for vector search
   *
   * @example
   * ```typescript
   * const ragTools = toolsets.rag({ vectorStore: myVectorDB });
   * ```
   */
  rag(config: { vectorStore: any; namespace?: string }): Record<string, Tool> {
    // Create temporary registry for context-specific tools
    const registry = createSimpleToolRegistry();

    registry.register(
      'addKnowledge',
      createTool.withContext(
        {
          description: 'Add knowledge to vector store',
          parameters: z.object({
            content: schemas.content,
            metadata: schemas.metadata,
          }),
          execute: async (args, context) => {
            const { content, metadata } = args;
            const { vectorStore } = context;
            const id = `doc_${Date.now()}`;
            await vectorStore.upsert({
              id,
              data: content,
              metadata: { ...metadata, timestamp: new Date().toISOString() },
            });
            return { id, success: true };
          },
        },
        config,
      ),
    );

    registry.register(
      'searchKnowledge',
      createTool.withContext(
        {
          description: 'Search knowledge base',
          parameters: z.object({
            query: schemas.query,
            limit: schemas.limit,
          }),
          execute: async (args, context) => {
            const { query, limit } = args;
            const { vectorStore } = context;
            const results = await vectorStore.query({
              data: query,
              topK: limit,
              includeMetadata: true,
            });
            return results;
          },
        },
        config,
      ),
    );

    registry.register(
      'updateKnowledge',
      createTool.withContext(
        {
          description: 'Update existing knowledge',
          parameters: z.object({
            id: schemas.id,
            content: schemas.content,
            metadata: schemas.metadata,
          }),
          execute: async (args, context) => {
            const { id, content, metadata } = args;
            const { vectorStore } = context;
            await vectorStore.update({
              id,
              data: content,
              metadata,
            });
            return { id, success: true };
          },
        },
        config,
      ),
    );

    return registry.getAll(config);
  },

  /**
   * Document processing tools
   *
   * @example
   * ```typescript
   * const docTools = toolsets.documents();
   * ```
   */
  documents(): Record<string, Tool> {
    const registry = createSimpleToolRegistry();

    registry.register(
      'createDocument',
      createTool.simple({
        description: 'Create a new document',
        parameters: z.object({
          title: z.string(),
          content: schemas.content,
          format: z.enum(['markdown', 'text', 'html']).optional().default('markdown'),
        }),
        execute: async args => {
          const { title, content, format } = args;
          return {
            id: `doc_${Date.now()}`,
            title,
            content,
            format,
            createdAt: new Date().toISOString(),
          };
        },
      }),
    );

    registry.register(
      'summarizeDocument',
      createTool.simple({
        description: 'Summarize document content',
        parameters: z.object({
          content: schemas.content,
          maxLength: z.number().optional().default(200),
        }),
        execute: async args => {
          const { content, maxLength } = args;
          const summary = content.slice(0, maxLength) + '...';
          return {
            summary,
            wordCount: content.split(/\s+/).length,
            charCount: content.length,
          };
        },
      }),
    );

    return registry.getAll();
  },

  /**
   * Combine multiple toolsets
   *
   * @example
   * ```typescript
   * const allTools = toolsets.combine(
   *   toolsets.standard(),
   *   toolsets.documents(),
   *   customTools
   * );
   * ```
   */
  combine(...toolCollections: Record<string, Tool>[]): Record<string, Tool> {
    const combined: Record<string, Tool> = {};
    for (const collection of toolCollections) {
      Object.assign(combined, collection);
    }
    return combined;
  },
};

/**
 * Default export for convenience
 */
export const tools = {
  create: createTools,
  make: createTool,
  schemas,
  sets: toolsets,
  registry: globalRegistry,
};

/**
 * Export unified ToolRegistry for advanced use cases
 */
export { ToolRegistry, createToolsFromRegistry } from './tool-registry';
