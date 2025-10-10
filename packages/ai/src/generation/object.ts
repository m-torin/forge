import { logWarn } from '@repo/observability';
import type { ModelMessage, UIMessage } from 'ai';
import { z } from 'zod/v3';
import { chatFragments } from '../core/fragments';
import { executeAIOperation } from '../core/operations';
import type {
  ArrayGenerationResult,
  ChatConfig,
  EnumGenerationResult,
  NoSchemaGenerationResult,
  ObjectGenerationResult,
  StructuredDataConfig,
  StructuredDataError,
} from '../core/types';
import { getDefaultModel } from '../providers/registry';

/**
 * Standardized structured output generation for monorepo
 * Type-safe object generation with Zod schemas
 */

/**
 * Generate structured object from prompt - Enhanced with AI SDK v5 features
 * Supports multiple output strategies: object, array, enum, no-schema
 */
export async function generateObject<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schemaOrConfig: z.ZodType<T> | StructuredDataConfig<T>,
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<
  | ObjectGenerationResult<T>
  | ArrayGenerationResult<T>
  | EnumGenerationResult<string>
  | NoSchemaGenerationResult
> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  // Handle both old API (schema as 2nd param) and new API (config as 2nd param)
  let config: StructuredDataConfig<T>;
  if (
    'output' in schemaOrConfig ||
    'schemaName' in schemaOrConfig ||
    !schemaOrConfig ||
    (typeof schemaOrConfig === 'object' && !('_def' in schemaOrConfig))
  ) {
    // New API: full config object
    config = schemaOrConfig as StructuredDataConfig<T>;
  } else {
    // Old API: schema as second parameter
    config = {
      schema: schemaOrConfig,
      output: 'object',
      ...options,
    };
  }

  // Apply defaults and fragments
  const finalConfig = {
    ...chatFragments.structured,
    model: config.model || options.model || getDefaultModel(),
    messages,
    output: 'object' as const,
    ...config,
    ...options,
  };

  try {
    const result = await executeAIOperation('generateObject', finalConfig);

    // Handle AI_NoObjectGeneratedError case
    if (!result.success && result.error) {
      const structuredError: StructuredDataError = {
        ...new Error(result.error.message),
        name: 'AI_NoObjectGeneratedError',
        text: result.text,
        response: result.response
          ? {
              id: result.response.messages?.[0]?.id || 'unknown',
              modelId:
                typeof finalConfig.model === 'string'
                  ? finalConfig.model
                  : finalConfig.model?.modelId || 'unknown',
              timestamp: new Date(),
            }
          : undefined,
        usage: result.usage,
        cause: result.error.error,
      };

      // Try repair if configured
      if (finalConfig.experimental_repairText && result.text) {
        try {
          const repairedText = await finalConfig.experimental_repairText({
            text: result.text,
            error: result.error.error,
          });

          logWarn('[AI Object] Attempting to repair malformed response');
          // Try to parse repaired text
          try {
            const parsed = JSON.parse(repairedText);
            return {
              ...result,
              success: true,
              object: parsed,
              data: parsed,
            } as ObjectGenerationResult<T>;
          } catch {
            logWarn('[AI Object] Repair failed, throwing original error');
          }
        } catch (repairError) {
          logWarn('[AI Object] Repair function failed', repairError);
        }
      }

      throw structuredError;
    }

    return result as ObjectGenerationResult<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AI_NoObjectGeneratedError') {
      throw error;
    }

    // Wrap other errors
    const structuredError: StructuredDataError = {
      ...new Error(error instanceof Error ? error.message : String(error)),
      name: 'AI_NoObjectGeneratedError',
      cause: error instanceof Error ? error : new Error(String(error)),
    };

    throw structuredError;
  }
}

/**
 * Generate array of objects with element streaming support
 */
export async function generateArray<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  elementSchema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<ArrayGenerationResult<T>> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const config = {
    ...chatFragments.structured,
    model: options.model || getDefaultModel(),
    messages,
    schema: elementSchema,
    output: 'array' as const,
    ...options,
  };

  const result = await executeAIOperation('generateObject', config);
  return result as ArrayGenerationResult<T>;
}

/**
 * Generate enum value for classification
 */
export async function generateEnum<T extends string>(
  prompt: string | UIMessage[] | ModelMessage[],
  enumValues: readonly T[] | T[],
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<EnumGenerationResult<T>> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const config = {
    ...chatFragments.structured,
    model: options.model || getDefaultModel(),
    messages,
    output: 'enum' as const,
    enum: enumValues,
    ...options,
  };

  const result = await executeAIOperation('generateObject', config);
  return result as EnumGenerationResult<T>;
}

/**
 * Generate unstructured object (no schema validation)
 */
export async function generateNoSchema(
  prompt: string | UIMessage[] | ModelMessage[],
  options: Partial<StructuredDataConfig<any>> = {},
): Promise<NoSchemaGenerationResult> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const config = {
    ...chatFragments.structured,
    model: options.model || getDefaultModel(),
    messages,
    output: 'no-schema' as const,
    ...options,
  };

  const result = await executeAIOperation('generateObject', config);
  return result as NoSchemaGenerationResult;
}

/**
 * Generate object with error handling and validation (backwards compatibility)
 */
export async function generateValidatedObject<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<T> {
  const result = await generateObject(prompt, schema, options);

  if (!result.success) {
    throw result.error;
  }

  if (!result.object) {
    throw new Error('No object generated');
  }

  return result.object;
}

/**
 * Generate object with specific model
 */
export async function generateObjectWithModel<T>(
  modelPath: string,
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<ChatConfig> = {},
): Promise<T> {
  return generateValidatedObject(prompt, schema, {
    ...options,
    model: getDefaultModel(),
  });
}

/**
 * Common structured output schemas for monorepo
 */
export const commonSchemas = {
  // Simple data extraction
  extraction: z.object({
    data: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),

  // Classification result
  classification: z.object({
    category: z.string(),
    confidence: z.number().min(0).max(1),
    reasoningText: z.string(),
  }),

  // Sentiment analysis
  sentiment: z.object({
    sentiment: z.enum(['positive', 'negative', 'neutral']),
    score: z.number().min(-1).max(1),
    reasoningText: z.string(),
  }),

  // Summary with key points
  summary: z.object({
    summary: z.string(),
    keyPoints: z.array(z.string()),
    wordCount: z.number(),
  }),

  // Task breakdown
  taskBreakdown: z.object({
    tasks: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
        estimatedTime: z.string(),
      }),
    ),
    totalTasks: z.number(),
  }),
} as const;

/**
 * Helper functions for common structured outputs
 */
export const generateCommon = {
  async extract(prompt: string, options: Partial<ChatConfig> = {}) {
    return generateValidatedObject(prompt, commonSchemas.extraction, options);
  },

  async classify(text: string, categories: string[], options: Partial<ChatConfig> = {}) {
    const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}\n\nText: ${text}`;
    return generateValidatedObject(prompt, commonSchemas.classification, options);
  },

  async analyzeSentiment(text: string, options: Partial<ChatConfig> = {}) {
    const prompt = `Analyze the sentiment of this text: ${text}`;
    return generateValidatedObject(prompt, commonSchemas.sentiment, options);
  },

  async summarize(text: string, options: Partial<ChatConfig> = {}) {
    const prompt = `Summarize this text with key points: ${text}`;
    return generateValidatedObject(prompt, commonSchemas.summary, options);
  },

  async breakdownTasks(project: string, options: Partial<ChatConfig> = {}) {
    const prompt = `Break down this project into specific tasks: ${project}`;
    return generateValidatedObject(prompt, commonSchemas.taskBreakdown, options);
  },
};

/**
 * Stream structured objects with AI SDK v5 features
 * Supports partialObjectStream and elementStream for arrays
 */
export async function streamObject<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schemaOrConfig: z.ZodType<T> | StructuredDataConfig<T>,
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<ObjectGenerationResult<T> | ArrayGenerationResult<T> | NoSchemaGenerationResult> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  // Handle both old API (schema as 2nd param) and new API (config as 2nd param)
  let config: StructuredDataConfig<T>;
  if (
    'output' in schemaOrConfig ||
    'schemaName' in schemaOrConfig ||
    !schemaOrConfig ||
    (typeof schemaOrConfig === 'object' && !('_def' in schemaOrConfig))
  ) {
    // New API: full config object
    config = schemaOrConfig as StructuredDataConfig<T>;
  } else {
    // Old API: schema as second parameter
    config = {
      schema: schemaOrConfig,
      output: 'object',
      ...options,
    };
  }

  // Apply defaults and fragments with streaming enabled
  const finalConfig = {
    ...chatFragments.structured,
    model: config.model || options.model || getDefaultModel(),
    messages,
    output: 'object' as const,
    // Add AI SDK v5 streaming error callback
    onError:
      options.onError ||
      config.onError ||
      ((error: { error: Error }) => {
        logWarn('[AI StreamObject] Error occurred:', error.error.message);
      }),
    ...config,
    ...options,
  };

  try {
    const result = await executeAIOperation('streamObject', finalConfig);

    // Handle streaming-specific error cases
    if (!result.success && result.error) {
      const structuredError: StructuredDataError = {
        ...new Error(result.error.message),
        name: 'AI_NoObjectGeneratedError',
        text: result.text,
        response: result.response
          ? {
              id: result.response.messages?.[0]?.id || 'unknown',
              modelId:
                typeof finalConfig.model === 'string'
                  ? finalConfig.model
                  : finalConfig.model?.modelId || 'unknown',
              timestamp: new Date(),
            }
          : undefined,
        usage: result.usage,
        cause: result.error.error,
      };

      throw structuredError;
    }

    return result as ObjectGenerationResult<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AI_NoObjectGeneratedError') {
      throw error;
    }

    // Wrap other errors
    const structuredError: StructuredDataError = {
      ...new Error(error instanceof Error ? error.message : String(error)),
      name: 'AI_NoObjectGeneratedError',
      cause: error instanceof Error ? error : new Error(String(error)),
    };

    throw structuredError;
  }
}

/**
 * Stream array of objects with element-by-element streaming
 */
export async function streamArray<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  elementSchema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T>> = {},
): Promise<ArrayGenerationResult<T>> {
  const messages =
    typeof prompt === 'string' ? [{ role: 'user' as const, content: prompt }] : prompt;

  const config = {
    ...chatFragments.structured,
    model: options.model || getDefaultModel(),
    messages,
    schema: elementSchema,
    output: 'array' as const,
    onError:
      options.onError ||
      ((error: { error: Error }) => {
        logWarn('[AI StreamArray] Error occurred:', error.error.message);
      }),
    ...options,
  };

  const result = await executeAIOperation('streamObject', config);
  return result as ArrayGenerationResult<T>;
}

/**
 * Stream object with access to partial updates
 * Convenience wrapper that exposes partialObjectStream for real-time updates
 */
export async function streamObjectWithPartials<T>(
  prompt: string | UIMessage[] | ModelMessage[],
  schema: z.ZodType<T>,
  options: Partial<StructuredDataConfig<T>> & {
    onPartialUpdate?: (partial: T) => void;
  } = {},
): Promise<{
  result: ObjectGenerationResult<T>;
  partialObjectStream: ReadableStream<T>;
}> {
  const { onPartialUpdate, ...streamOptions } = options;

  const result = (await streamObject(prompt, schema, streamOptions)) as ObjectGenerationResult<T>;

  if (!result.partialObjectStream) {
    throw new Error('partialObjectStream not available - ensure model supports streaming');
  }

  // Set up partial update handling if callback provided
  if (onPartialUpdate && result.partialObjectStream) {
    const reader = result.partialObjectStream.getReader();

    // Process stream in background
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          onPartialUpdate(value);
        }
      } catch (error) {
        logWarn('[AI StreamObject] Partial stream error:', error);
      } finally {
        reader.releaseLock();
      }
    })();
  }

  return {
    result,
    partialObjectStream: result.partialObjectStream,
  };
}
