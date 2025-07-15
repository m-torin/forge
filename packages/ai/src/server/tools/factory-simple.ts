import { tool as aiTool, type ToolExecutionOptions } from 'ai';
import 'server-only';
import { z } from 'zod/v4';

/**
 * Simple tool factory that follows AI SDK v5 patterns exactly
 * This replaces the complex factories with straightforward wrappers
 */

export interface SimpleToolContext {
  session?: any;
  dataStream?: any;
  [key: string]: any;
}

// Type alias for backward compatibility
export type ToolContext = SimpleToolContext;

/**
 * Creates a simple tool with AI SDK v5 pattern
 * The execute function receives destructured parameters from the schema
 */
export function createSimpleTool<TParams extends z.ZodTypeAny, TResult>(config: {
  description: string;
  parameters: TParams;
  execute: (args: z.infer<TParams>, options?: ToolExecutionOptions) => Promise<TResult> | TResult;
}) {
  return aiTool({
    description: config.description,
    parameters: config.parameters,
    execute: async (args: any, options: ToolExecutionOptions) => {
      return config.execute(args as z.infer<TParams>, options);
    },
  } as any);
}

/**
 * Creates a tool with context injection
 */
export function createContextTool<TParams extends z.ZodTypeAny, TResult>(
  config: {
    description: string;
    parameters: TParams;
    execute: (
      args: z.infer<TParams>,
      context: SimpleToolContext,
      options?: ToolExecutionOptions,
    ) => Promise<TResult> | TResult;
  },
  context: SimpleToolContext = {},
) {
  return aiTool({
    description: config.description,
    parameters: config.parameters,
    execute: async (args: any, options: ToolExecutionOptions) => {
      return config.execute(args as z.infer<TParams>, context, options);
    },
  } as any);
}

/**
 * Creates a tool factory with pre-configured context
 */
export function createToolFactory(defaultContext: SimpleToolContext = {}) {
  return <TParams extends z.ZodTypeAny, TResult>(config: {
    description: string;
    parameters: TParams;
    execute: (
      args: z.infer<TParams>,
      context: SimpleToolContext,
      options?: ToolExecutionOptions,
    ) => Promise<TResult> | TResult;
  }) => {
    return createContextTool(config, defaultContext);
  };
}

/**
 * Example usage and common schemas
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
} as const;

/**
 * Example tool using the simple factory
 */
export const exampleWeatherTool = createSimpleTool({
  description: 'Get weather information for a location',
  parameters: z.object({
    location: z.string().describe('The location to get weather for'),
    units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
  execute: async (args: { location: string; units?: 'celsius' | 'fahrenheit' }) => {
    const { location, units } = args;
    // Simulate weather API call
    const temperature = units === 'fahrenheit' ? 72 : 22;
    const unit = units === 'fahrenheit' ? '°F' : '°C';

    return {
      location,
      temperature: `${temperature}${unit}`,
      conditions: 'Partly cloudy',
      humidity: '65%',
      windSpeed: '10 mph',
    };
  },
});
