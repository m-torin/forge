import { tool as aiTool, type ToolExecutionOptions } from 'ai';
import 'server-only';
import { z } from 'zod/v4';

/**
 * Common context that tools might need
 */
export interface ToolContext {
  dataStream?: any; // DataStreamWriter type not available in AI SDK v5 public API
  session?: any; // Can be typed more specifically based on auth provider
  [key: string]: any; // Allow additional context
}

/**
 * Creates a tool with context injection
 * Follows Vercel AI SDK v5 tool pattern
 */
export function tool<TParameters extends z.ZodTypeAny, TResult>(
  definition: {
    description: string;
    parameters: TParameters;
    execute: (
      input: z.infer<TParameters>,
      context: ToolContext & ToolExecutionOptions,
    ) => TResult | Promise<TResult>;
  },
  context: ToolContext = {},
) {
  return aiTool({
    description: definition.description,
    parameters: definition.parameters,
    execute: async (input: unknown, options: ToolExecutionOptions) =>
      definition.execute(input as z.infer<TParameters>, { ...context, ...options }),
  } as any);
}

/**
 * Creates a tool factory with pre-configured context
 * Useful for creating multiple tools with the same context
 */
export function createToolFactory(defaultContext: ToolContext) {
  return <TParameters extends z.ZodTypeAny, TResult>(
    definition: {
      description: string;
      parameters: TParameters;
      execute: (
        input: z.infer<TParameters>,
        context: ToolContext & ToolExecutionOptions,
      ) => TResult | Promise<TResult>;
    },
    additionalContext?: Partial<ToolContext>,
  ) => {
    const mergedContext = { ...defaultContext, ...additionalContext };
    return aiTool({
      description: definition.description,
      parameters: definition.parameters,
      execute: async (input: unknown, options: ToolExecutionOptions) =>
        definition.execute(input as z.infer<TParameters>, { ...mergedContext, ...options }),
    } as any);
  };
}

/**
 * Creates an API-based tool with standardized error handling
 */
export function createAPITool<TParameters extends z.ZodTypeAny, TResult>(
  config: {
    description: string;
    parameters: TParameters;
    url: string | ((input: z.infer<TParameters>) => string);
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string> | ((input: z.infer<TParameters>) => Record<string, string>);
    transformRequest?: (input: z.infer<TParameters>) => any;
    transformResponse?: (response: any) => TResult;
    onError?: (error: unknown) => TResult;
  },
  _context: ToolContext = {},
) {
  return aiTool({
    description: config.description,
    parameters: config.parameters,
    execute: async (input: unknown, _options: ToolExecutionOptions) => {
      const typedInput = input as z.infer<TParameters>;
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
  } as any);
}

/**
 * Creates a streaming tool that writes data to the data stream
 */
export function createStreamingTool<TParameters extends z.ZodTypeAny, TResult>(
  config: {
    description: string;
    parameters: TParameters;
    execute: (
      input: z.infer<TParameters>,
      context: ToolContext & ToolExecutionOptions,
    ) => TResult | Promise<TResult>;
    streamTypes?: Array<'clear' | 'finish' | 'id' | 'title' | 'kind'>;
  },
  context: ToolContext = {},
) {
  return aiTool({
    description: config.description,
    parameters: config.parameters,
    execute: async (input: unknown, options: any) => {
      const typedInput = input as z.infer<TParameters>;
      if (!context.dataStream) {
        throw new Error('Data stream is required for streaming tools');
      }

      // Handle pre-execution stream events
      if (config.streamTypes?.includes('clear')) {
        context.dataStream.write({
          type: 'data-clear' as any,
          data: '',
        } as any);
      }

      const result = await config.execute(typedInput, { ...context, ...options });

      // Handle post-execution stream events
      if (config.streamTypes?.includes('finish')) {
        context.dataStream.write({
          type: 'data-finish' as any,
          data: '',
        } as any);
      }

      return result;
    },
  } as any);
}

/**
 * Creates a tool with permission checking
 */
export function createSecureTool<TParameters extends z.ZodTypeAny, TResult>(
  config: {
    description: string;
    parameters: TParameters;
    execute: (
      input: z.infer<TParameters>,
      context: ToolContext & ToolExecutionOptions,
    ) => TResult | Promise<TResult>;
    checkPermissions: (
      input: z.infer<TParameters>,
      context: ToolContext,
    ) => boolean | Promise<boolean>;
  },
  context: ToolContext = {},
) {
  return aiTool({
    description: config.description,
    parameters: config.parameters,
    execute: async (input: unknown, options: any) => {
      const typedInput = input as z.infer<TParameters>;
      const hasPermission = await config.checkPermissions(typedInput, context);
      if (!hasPermission) {
        throw new Error('Insufficient permissions for this operation');
      }
      return config.execute(typedInput, { ...context, ...options });
    },
  } as any);
}

/**
 * Utility to combine multiple tool factories with shared context
 */
export function combineTools<T extends Record<string, ReturnType<typeof aiTool>>>(
  toolFactories: Record<keyof T, (context: ToolContext) => ReturnType<typeof aiTool>>,
  context: ToolContext = {},
): T {
  const tools = {} as T;

  for (const [name, factory] of Object.entries(toolFactories)) {
    tools[name as keyof T] = factory(context) as T[keyof T];
  }

  return tools;
}

/**
 * Common tool parameter schemas
 */
export const commonSchemas = {
  id: z.string().describe('Unique identifier'),
  title: z.string().describe('Title or name'),
  description: z.string().describe('Description or details'),
  content: z.string().describe('Main content'),
  query: z.string().describe('Search query'),
  limit: z.number().optional().default(10).describe('Maximum results'),
  offset: z.number().optional().default(0).describe('Results offset'),
  latitude: z.number().describe('Latitude coordinate'),
  longitude: z.number().describe('Longitude coordinate'),
  documentId: z.string().describe('Document identifier'),
} as const;
