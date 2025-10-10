import { tool as aiTool } from 'ai';
import 'server-only';
import { z } from 'zod/v3';
import { commonSchemas } from '../../shared/common-schemas';

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
type ToolContext = SimpleToolContext;

/**
 * Creates a simple tool with AI SDK v5 pattern
 * The execute function receives destructured parameters from the schema
 */
export function createSimpleTool<TParams extends z.ZodTypeAny, TResult>(config: {
  description: string;
  inputSchema: TParams;
  execute: (args: z.infer<TParams>, options?: any) => Promise<TResult> | TResult;
}) {
  return aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: z.infer<TParams>) => {
      return config.execute(args);
    },
  } as any);
}

/**
 * Creates a tool with context injection
 */
function createContextTool<TParams extends z.ZodTypeAny, TResult>(
  config: {
    description: string;
    inputSchema: TParams;
    execute: (
      args: z.infer<TParams>,
      context: SimpleToolContext,
      options?: any,
    ) => Promise<TResult> | TResult;
  },
  context: SimpleToolContext = {},
) {
  return aiTool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: z.infer<TParams>) => {
      return config.execute(args, context);
    },
  } as any);
}

/**
 * Creates a tool factory with pre-configured context
 */
function createToolFactory(defaultContext: SimpleToolContext = {}) {
  return <TParams extends z.ZodTypeAny, TResult>(config: {
    description: string;
    inputSchema: TParams;
    execute: (
      args: z.infer<TParams>,
      context: SimpleToolContext,
      options?: any,
    ) => Promise<TResult> | TResult;
  }) => {
    return createContextTool(config, defaultContext);
  };
}

/**
 * Re-export common schemas for backward compatibility
 * Now uses centralized schemas from shared utilities
 */
/**
 * Example tool using the simple factory
 */
const exampleWeatherTool = createSimpleTool({
  description: 'Get weather information for a location',
  inputSchema: z.object({
    location: commonSchemas.location,
    units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
  }),
  execute: async args => {
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
