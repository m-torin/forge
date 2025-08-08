/**
 * Simplified Tool System for AI SDK v5
 *
 * One function, clear patterns, no confusion
 */

import { logInfo } from '@repo/observability';
import { tool as aiTool, type Tool } from 'ai';
import { z } from 'zod/v4';

/**
 * Tool configuration
 */
export interface ToolConfig<TParams = any, TResult = any> {
  description: string;
  inputSchema: z.ZodSchema<TParams>;
  execute: (args: TParams, context?: any) => Promise<TResult> | TResult;
  context?: any;
}

/**
 * API tool configuration
 */
export interface APIToolConfig<TParams = any, TResult = any>
  extends Omit<ToolConfig<TParams, TResult>, 'execute'> {
  url: string | ((input: TParams) => string);
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string> | ((input: TParams) => Record<string, string>);
  transformRequest?: (input: TParams) => any;
  transformResponse?: (response: any) => TResult;
  onError?: (error: unknown) => TResult;
  execute?: (args: TParams, context?: any) => Promise<TResult> | TResult;
}

/**
 * Streaming tool configuration
 */
export interface StreamingToolConfig<TParams = any, TResult = any>
  extends ToolConfig<TParams, TResult> {
  onStream?: (chunk: any, dataStream: any) => void;
}

/**
 * Secure tool configuration
 */
export interface SecureToolConfig<TParams = any, TResult = any>
  extends ToolConfig<TParams, TResult> {
  requiredPermissions?: string[];
  validator?: (input: TParams) => boolean | Promise<boolean>;
  sanitizer?: (input: TParams) => TParams;
  auditLog?: boolean;
}

/**
 * Tool collection options
 */
export interface ToolsOptions {
  /** Enable performance tracking */
  track?: boolean;
  /** Enable caching */
  cache?: boolean;
}

/**
 * Tool definition - can be a Tool or ToolConfig
 */
export type ToolDefinition = Tool | ToolConfig;

/**
 * Tools input - preset name or tool definitions
 */
export type ToolsInput =
  | 'standard'
  | 'documents'
  | Record<string, ToolDefinition>
  | {
      preset?: 'standard' | 'documents';
      custom?: Record<string, ToolDefinition>;
      options?: ToolsOptions;
    };

/**
 * Create a single tool with AI SDK v5 pattern
 *
 * @example
 * ```typescript
 * const weatherTool = tool({
 *   description: 'Get weather information',
 *   inputSchema: z.object({ location: z.string() }),
 *   execute: async ({ location }) => {
 *     return { temp: 72, location };
 *   }
 * });
 * ```
 */
export function tool<TParams, TResult>(config: ToolConfig<TParams, TResult>): Tool {
  const { context, ...toolConfig } = config;

  return aiTool({
    description: toolConfig.description,
    inputSchema: toolConfig.inputSchema,
    execute: async (args: any) => {
      return config.execute(args as TParams, context);
    },
  } as any) as Tool;
}

/**
 * Create an API tool that makes HTTP requests
 *
 * @example
 * ```typescript
 * const apiTool = tool.api({
 *   description: 'Fetch user data',
 *   inputSchema: z.object({ userId: z.string() }),
 *   url: (input) => `https://api.example.com/users/${input.userId}`,
 *   transformResponse: (data) => ({ name: data.name, email: data.email })
 * });
 * ```
 */
tool.api = function <TParams, TResult>(config: APIToolConfig<TParams, TResult>): Tool {
  return aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (input: any, _options: any) => {
      const typedInput = input as TParams;
      try {
        const url = typeof config.url === 'function' ? config.url(typedInput) : config.url;
        const headers =
          typeof config.headers === 'function' ? config.headers(typedInput) : config.headers || {};

        const requestOptions: RequestInit = {
          method: config.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
        };

        if (config.method && config.method !== 'GET' && config.transformRequest) {
          requestOptions.body = JSON.stringify(config.transformRequest(typedInput));
        }

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return config.transformResponse ? config.transformResponse(data) : data;
      } catch (error) {
        if (config.onError) {
          return config.onError(error);
        }
        throw error;
      }
    },
  } as any) as Tool;
};

/**
 * Create a streaming tool
 *
 * @example
 * ```typescript
 * const streamTool = tool.stream({
 *   description: 'Stream data',
 *   inputSchema: z.object({ query: z.string() }),
 *   execute: async ({ query }, context) => {
 *     // Stream implementation
 *     return { streaming: true };
 *   },
 *   onStream: (chunk, dataStream) => {
 *     dataStream.writeData(chunk);
 *   }
 * });
 * ```
 */
tool.stream = function <TParams, TResult>(config: StreamingToolConfig<TParams, TResult>): Tool {
  return tool(config); // Streaming is handled by context.dataStream if available
};

/**
 * Create a secure tool with validation
 *
 * @example
 * ```typescript
 * const secureTool = tool.secure({
 *   description: 'Delete resource',
 *   inputSchema: z.object({ id: z.string() }),
 *   requiredPermissions: ['admin', 'delete'],
 *   validator: async (input) => input.id !== 'protected',
 *   execute: async ({ id }) => {
 *     // Delete logic
 *     return { deleted: id };
 *   }
 * });
 * ```
 */
tool.secure = function <TParams, TResult>(config: SecureToolConfig<TParams, TResult>): Tool {
  return aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (input: any, _options: any) => {
      const typedInput = input as TParams;

      // Sanitize input if sanitizer provided
      const sanitized = config.sanitizer ? config.sanitizer(typedInput) : typedInput;

      // Validate if validator provided
      if (config.validator) {
        const isValid = await config.validator(sanitized);
        if (!isValid) {
          throw new Error('Validation failed');
        }
      }

      // Audit log if enabled
      if (config.auditLog) {
        logInfo('Tool execution audit:', {
          tool: config.description,
          input: sanitized,
          timestamp: new Date().toISOString(),
        });
      }

      return config.execute(sanitized, config.context);
    },
  } as any) as Tool;
};

/**
 * Common parameter schemas
 */
export const schemas = {
  id: z.string().describe('Unique identifier'),
  query: z.string().describe('Search query'),
  limit: z.number().optional().default(10).describe('Maximum results'),
  content: z.string().describe('Content to process'),
  location: z.string().describe('Location or place'),
  title: z.string().describe('Title or name'),
  metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata'),
  latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
  longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
} as const;

/**
 * Standard preset tools
 */
const standardTools = {
  weather: tool({
    description: 'Get weather information',
    inputSchema: z.object({
      location: schemas.location,
      units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
    }),
    execute: async ({ location, units }) => {
      const temp = units === 'fahrenheit' ? 72 : 22;
      return {
        location,
        temperature: temp,
        unit: units === 'fahrenheit' ? '°F' : '°C',
        conditions: 'Partly cloudy',
      };
    },
  }),

  search: tool({
    description: 'Search for information',
    inputSchema: z.object({
      query: schemas.query,
      limit: schemas.limit,
    }),
    execute: async ({ query, limit }) => {
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

  calculator: tool({
    description: 'Perform calculations',
    inputSchema: z.object({
      expression: z.string().describe('Mathematical expression'),
    }),
    execute: async ({ expression }) => {
      try {
        const result = Function(`"use strict"; return (${expression})`)();
        return { expression, result };
      } catch (_error) {
        return { expression, error: 'Invalid expression' };
      }
    },
  }),
};

/**
 * Document preset tools
 */
const documentTools = {
  createDocument: tool({
    description: 'Create a new document',
    inputSchema: z.object({
      title: schemas.title,
      content: schemas.content,
      format: z.enum(['markdown', 'text', 'html']).optional().default('markdown'),
    }),
    execute: async ({ title, content, format }) => {
      return {
        id: `doc_${Date.now()}`,
        title,
        content,
        format,
        createdAt: new Date().toISOString(),
      };
    },
  }),

  summarizeDocument: tool({
    description: 'Summarize document content',
    inputSchema: z.object({
      content: schemas.content,
      maxLength: z.number().optional().default(200),
    }),
    execute: async ({ content, maxLength }) => {
      const summary = content.slice(0, maxLength) + '...';
      return {
        summary,
        wordCount: content.split(/\s+/).length,
        charCount: content.length,
      };
    },
  }),
};

/**
 * Tool presets
 */
export const presets = {
  standard: standardTools,
  documents: documentTools,
  all: { ...standardTools, ...documentTools },
} as const;

/**
 * Create a RAG toolset for vector stores
 */
export function ragTools(vectorStore: any): Record<string, Tool> {
  return {
    addKnowledge: tool({
      description: 'Add knowledge to vector store',
      inputSchema: z.object({
        content: schemas.content,
        metadata: schemas.metadata,
      }),
      execute: async ({ content, metadata }) => {
        const id = `vec_${Date.now()}`;
        await vectorStore.upsert({ id, data: content, metadata });
        return { id, success: true };
      },
      context: vectorStore,
    }),

    searchKnowledge: tool({
      description: 'Search knowledge base',
      inputSchema: z.object({
        query: schemas.query,
        limit: schemas.limit,
      }),
      execute: async ({ query, limit }) => {
        const results = await vectorStore.query({
          data: query,
          topK: limit,
          includeMetadata: true,
        });
        return results;
      },
      context: vectorStore,
    }),
  };
}

// Internal tracking store (hidden from users)
const performanceStore = new Map<string, { calls: number; totalTime: number }>();

/**
 * Wrap tool with performance tracking
 */
function wrapWithTracking(name: string, tool: Tool): Tool {
  const originalExecute = tool.execute;

  return {
    ...tool,
    execute: async (args: any, options: any) => {
      const start = Date.now();
      try {
        const result = await originalExecute?.(args, options);
        const elapsed = Date.now() - start;

        const stats = performanceStore.get(name) || { calls: 0, totalTime: 0 };
        stats.calls++;
        stats.totalTime += elapsed;
        performanceStore.set(name, stats);

        return result;
      } catch (error) {
        const elapsed = Date.now() - start;

        const stats = performanceStore.get(name) || { calls: 0, totalTime: 0 };
        stats.calls++;
        stats.totalTime += elapsed;
        performanceStore.set(name, stats);

        throw error;
      }
    },
  };
}

/**
 * Process tool definitions into Tool objects
 */
function processTools(
  tools: Record<string, ToolDefinition>,
  options?: ToolsOptions,
): Record<string, Tool> {
  const processed: Record<string, Tool> = {};

  for (const [name, definition] of Object.entries(tools)) {
    // Convert ToolConfig to Tool if needed
    const toolInstance =
      'execute' in definition && !('description' in definition)
        ? (definition as Tool)
        : tool(definition as ToolConfig);

    // Wrap with tracking if enabled
    processed[name] = options?.track ? wrapWithTracking(name, toolInstance) : toolInstance;
  }

  return processed;
}

/**
 * Main function to create tools
 *
 * @example
 * ```typescript
 * // Use preset
 * const standardTools = tools('standard');
 *
 * // Custom tools
 * const myTools = tools({
 *   weather: weatherTool,
 *   search: searchTool
 * });
 *
 * // Mixed with options
 * const myTools = tools({
 *   preset: 'standard',
 *   custom: { myTool: customTool },
 *   options: { track: true }
 * });
 * ```
 */
export function tools(input: ToolsInput): Record<string, Tool> {
  // Handle string preset
  if (typeof input === 'string') {
    return processTools(presets[input as keyof typeof presets] || {});
  }

  // Handle object with preset/custom/options
  if (typeof input === 'object' && ('preset' in input || 'custom' in input || 'options' in input)) {
    const preset = (input as any).preset
      ? presets[(input as any).preset as keyof typeof presets]
      : {};
    const custom = (input as any).custom || {};
    const combined = { ...preset, ...custom };
    return processTools(combined, (input as any).options);
  }

  // Handle direct tool definitions
  return processTools(input as Record<string, ToolDefinition>);
}

/**
 * Get performance metrics (only available when tracking is enabled)
 */
export function getMetrics(): Record<string, { calls: number; avgTime: number }> {
  const metrics: Record<string, { calls: number; avgTime: number }> = {};

  for (const [name, stats] of performanceStore) {
    metrics[name] = {
      calls: stats.calls,
      avgTime: stats.calls > 0 ? stats.totalTime / stats.calls : 0,
    };
  }

  return metrics;
}

/**
 * Clear performance metrics
 */
export function clearMetrics(): void {
  performanceStore.clear();
}

/**
 * Combine multiple tool collections into one
 *
 * @example
 * ```typescript
 * const combined = combineTools(
 *   presets.standard,
 *   presets.documents,
 *   { custom: myTool }
 * );
 * ```
 */
export function combineTools(...collections: Array<Record<string, Tool>>): Record<string, Tool> {
  return Object.assign({}, ...collections);
}
