import { models, type LanguageModelId } from '../providers/registry';

/**
 * Runtime options support for AI SDK tools
 *
 * NOTE: These utilities may be unnecessary with AI SDK v5's native configuration.
 * Consider using direct AI SDK patterns instead of these wrappers.
 *
 * @deprecated Consider using AI SDK v5 native configuration instead
 */

export interface RuntimeOptions {
  modelId?: LanguageModelId;
  model?: any; // Direct model override (for custom models not in registry)
  settings?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    seed?: number;
    // Any other AI SDK setting
    [key: string]: any;
  };
  headers?: Record<string, string>;
  abortSignal?: AbortSignal;
  maxRetries?: number;
}

/**
 * Wrap a tool to accept runtime options
 * Maintains DRY while allowing full consumer control
 */
export function withRuntimeOptions<T extends { execute: Function }>(
  tool: T,
  defaultModelId?: string,
): T & { executeWithOptions(input: any, options?: RuntimeOptions): Promise<any> } {
  return {
    ...tool,

    // Original execute for backward compatibility
    execute: tool.execute,

    // New execute with runtime options
    async executeWithOptions(input: any, options?: RuntimeOptions): Promise<any> {
      // Resolve model: runtime > registry > default
      const model =
        options?.model ||
        (options?.modelId && models.language(options.modelId)) ||
        (defaultModelId && models.language(defaultModelId));

      // Merge settings: defaults < tool settings < runtime options
      const mergedSettings = {
        ...(tool as any).settings,
        ...options?.settings,
        ...(model && { model }),
        ...(options?.headers && { headers: options.headers }),
        ...(options?.abortSignal && { abortSignal: options.abortSignal }),
        ...(options?.maxRetries !== undefined && { maxRetries: options.maxRetries }),
      };

      // For AI SDK tools, we need to call execute with input and options
      // The AI SDK tool will use its own model and settings configuration
      if (typeof tool.execute === 'function') {
        return await tool.execute(input, mergedSettings);
      }

      throw new Error('Tool execute method is not callable');
    },
  };
}

/**
 * Helper to create a tool with runtime options enabled by default
 */
export function createFlexibleTool(config: any) {
  const tool = (globalThis as any).createTool(config);
  return withRuntimeOptions(tool, config.modelId);
}
