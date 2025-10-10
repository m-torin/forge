/**
 * Base tool creation utilities that work with AI SDK v5
 * Provides DRY patterns while preserving provider-specific features
 */
import { tool } from 'ai';
import { z } from 'zod/v3';

/**
 * Base configuration for all tools
 */
export interface BaseToolConfig<TSchema extends z.ZodTypeAny> {
  description: string;
  inputSchema: TSchema;
  execute: (args: z.infer<TSchema>) => Promise<unknown> | unknown;
}

/**
 * Extended configuration with provider-specific options
 */
export interface ExtendedToolConfig<TSchema extends z.ZodTypeAny> extends BaseToolConfig<TSchema> {
  /** Provider-specific extensions */
  providerExtensions?: {
    anthropic?: {
      cacheControl?: boolean;
      reasoningText?: boolean;
    };
    openai?: {
      strictMode?: boolean;
      responseFormat?: 'auto' | 'json_object' | 'json_schema';
    };
    google?: {
      thinking?: boolean;
      safetySettings?: boolean;
    };
  };
  /** Execution context */
  context?: Record<string, unknown>;
  /** Error handling strategy */
  errorStrategy?: 'throw' | 'return' | 'log';
}

/**
 * Result wrapper for consistent tool responses
 */
export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  metadata?: {
    executionTime?: number;
    provider?: string;
    model?: string;
    tokens?: {
      input?: number;
      output?: number;
    };
  };
}

/**
 * Creates a base AI tool with consistent patterns
 * Uses AI SDK v5 native tool() function as foundation
 */
export function createBaseAITool<TSchema extends z.ZodTypeAny>(config: BaseToolConfig<TSchema>) {
  return tool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: config.execute,
  } as any);
}

/**
 * Creates an enhanced tool with provider extensions and error handling
 */
export function createEnhancedTool<TSchema extends z.ZodTypeAny>(
  config: ExtendedToolConfig<TSchema>,
) {
  const baseTool = tool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: z.infer<TSchema>) => {
      const startTime = Date.now();

      try {
        const result = await config.execute(args);

        return {
          success: true,
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        } satisfies ToolResult;
      } catch (error) {
        const errorResult: ToolResult = {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error,
          },
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };

        switch (config.errorStrategy) {
          case 'return':
            return errorResult;
          case 'log':
            console.error('Tool execution failed:', errorResult);
            return errorResult;
          case 'throw':
          default:
            throw error;
        }
      }
    },
  } as any);

  // Apply provider-specific extensions if needed
  // This would be extended in actual provider implementations
  return baseTool;
}

/**
 * Creates a tool with built-in validation and transformation
 */
export function createValidatedTool<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny,
>(config: {
  description: string;
  inputSchema: TInputSchema;
  outputSchema: TOutputSchema;
  execute: (
    args: z.infer<TInputSchema>,
  ) => Promise<z.infer<TOutputSchema>> | z.infer<TOutputSchema>;
}) {
  return tool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: z.infer<TInputSchema>) => {
      const result = await config.execute(args);

      // Validate output against schema
      try {
        return config.outputSchema.parse(result);
      } catch (validationError) {
        throw new Error(`Tool output validation failed: ${validationError}`);
      }
    },
  } as any);
}

/**
 * Creates a tool with automatic retry logic
 */
export function createRetryableTool<TSchema extends z.ZodTypeAny>(
  config: BaseToolConfig<TSchema> & {
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  },
) {
  const maxRetries = config.maxRetries ?? 3;
  const retryDelay = config.retryDelay ?? 1000;
  const shouldRetry = config.shouldRetry ?? (error => error instanceof Error);

  return tool({
    description: config.description,
    inputSchema: config.inputSchema,
    execute: async (args: z.infer<TSchema>) => {
      let lastError: unknown;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await config.execute(args);
        } catch (error) {
          lastError = error;

          if (attempt === maxRetries || !shouldRetry(error)) {
            throw error;
          }

          // Wait before retrying
          if (retryDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      throw lastError;
    },
  } as any);
}

/**
 * Tool factory for creating tools with consistent patterns
 */
export class ToolFactory {
  constructor(
    private readonly defaultConfig: {
      errorStrategy?: ExtendedToolConfig<any>['errorStrategy'];
      context?: Record<string, unknown>;
      providerExtensions?: ExtendedToolConfig<any>['providerExtensions'];
    } = {},
  ) {}

  /**
   * Create a basic tool
   */
  create<TSchema extends z.ZodTypeAny>(config: BaseToolConfig<TSchema>) {
    return createBaseAITool(config);
  }

  /**
   * Create an enhanced tool with factory defaults
   */
  createEnhanced<TSchema extends z.ZodTypeAny>(
    config: Omit<ExtendedToolConfig<TSchema>, keyof typeof this.defaultConfig> &
      Partial<Pick<ExtendedToolConfig<TSchema>, keyof typeof this.defaultConfig>>,
  ) {
    return createEnhancedTool({
      ...this.defaultConfig,
      ...config,
    });
  }

  /**
   * Create a validated tool
   */
  createValidated<TInputSchema extends z.ZodTypeAny, TOutputSchema extends z.ZodTypeAny>(
    config: Parameters<typeof createValidatedTool<TInputSchema, TOutputSchema>>[0],
  ) {
    return createValidatedTool(config);
  }

  /**
   * Create a retryable tool
   */
  createRetryable<TSchema extends z.ZodTypeAny>(
    config: Parameters<typeof createRetryableTool<TSchema>>[0],
  ) {
    return createRetryableTool(config);
  }
}

/**
 * Default factory instance
 */
export const toolFactory = new ToolFactory();

/**
 * Utility types for tool inference
 */
export type InferToolInput<T> = T extends { inputSchema: infer S }
  ? S extends z.ZodTypeAny
    ? z.infer<S>
    : never
  : never;

export type InferToolOutput<T> = T extends { execute: (...args: any[]) => infer R }
  ? Awaited<R>
  : never;
