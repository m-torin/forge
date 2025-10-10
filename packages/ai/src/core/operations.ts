import { logDebug, logError, logInfo } from '@repo/observability';
import { generateObject, generateText, stepCountIs, streamObject, streamText } from 'ai';
import { safeEnv } from '../../env';
import { debugUtils } from '../tools/debug-utils';
import type { AIOperationConfig, AIOperationResult, LanguageModelV2 } from './types';
import { calculateCost, messageUtils } from './utils';
// Removed unused schema import

/**
 * Get model instance from string or return existing model
 */
export function getModel(model: string | LanguageModelV2 | undefined): LanguageModelV2 {
  if (!model) {
    // Import registry dynamically to avoid circular dependencies
    const { getDefaultModel } = require('../providers/registry');
    return getDefaultModel();
  }

  // If already a model instance, return it
  if (typeof model === 'object' && model !== null) {
    return model as LanguageModelV2;
  }

  // Resolve model string through registry
  try {
    // Import registry dynamically to avoid circular dependencies
    const { models } = require('../providers/registry');

    // Normalize provider/model -> provider:model format
    const normalizedModel = typeof model === 'string' ? model.replace('/', ':') : String(model);

    // Use registry to resolve model
    logDebug('Resolving model via registry', { model: normalizedModel });
    return models.language(normalizedModel);
  } catch (error) {
    logError('Model resolution failed, falling back to default', {
      model,
      error: error instanceof Error ? error.message : String(error),
    });

    // Fallback to default model
    const { getDefaultModel } = require('../providers/registry');
    return getDefaultModel();
  }
}

/**
 * Universal AI operation executor (similar to database executeOperation)
 * Enhanced with monorepo integrations
 */
export async function executeAIOperation<T = any>(
  operation: 'generateText' | 'streamText' | 'generateObject' | 'streamObject',
  config: AIOperationConfig,
): Promise<AIOperationResult<T>> {
  const startTime = Date.now();
  const env = safeEnv();

  try {
    // Auto-apply prompt engineering best practices
    const finalConfig = { ...config };

    // Apply temperature: 0 for deterministic operations (tools and structured output)
    if (
      config.temperature === undefined &&
      (operation.includes('tool') || operation.includes('Object') || config.tools)
    ) {
      finalConfig.temperature = 0; // Deterministic for tools and structured output
      logDebug('[AI] Auto-applied temperature: 0 for deterministic operation');
    }

    // Optional tool validation (non-blocking warnings)
    if (config.tools && typeof config.tools === 'object') {
      const validation = debugUtils.validateToolSetup(config.tools);
      if (!validation.isOptimal && env.AI_TELEMETRY) {
        logDebug(
          '[AI] Tool setup suggestions available - run debugUtils.validateToolSetup() for details',
        );
      }
    }

    // Schema handling removed - no compatibility transform needed

    // Normalize messages if provided
    const messages = finalConfig.messages
      ? messageUtils.normalize(finalConfig.messages)
      : undefined;

    // Determine stop conditions (prefers explicit stopWhen, falls back to legacy maxSteps)
    const stopCondition =
      finalConfig.stopWhen ??
      (typeof finalConfig.maxSteps === 'number' ? stepCountIs(finalConfig.maxSteps) : undefined);

    // Build operation args with final config
    const args: any = {
      model: finalConfig.model,
      messages,
      tools: finalConfig.tools,
      temperature: finalConfig.temperature,
      maxOutputTokens: finalConfig.maxOutputTokens,
      topP: finalConfig.topP,
      frequencyPenalty: finalConfig.frequencyPenalty,
      presencePenalty: finalConfig.presencePenalty,
      seed: finalConfig.seed,
      stop: (finalConfig as any).stop,
      stopSequences: (finalConfig as any).stopSequences,
      stopWhen: stopCondition,
      activeTools: (finalConfig as any).activeTools,
      toolChoice: (finalConfig as any).toolChoice,
      providerOptions: (finalConfig as any).providerOptions,
      prompt: (finalConfig as any).prompt,
      system: (finalConfig as any).system,
      experimental_telemetry: (finalConfig as any).experimental_telemetry,
      // AI SDK v5 Callback Support
      onError: config.onError ?? finalConfig.onError,
      onFinish: config.onFinish ?? finalConfig.onFinish,
      onChunk: config.onChunk ?? finalConfig.onChunk,
      // AI SDK v5 Stream Features
      experimental_transform: config.experimental_transform ?? finalConfig.experimental_transform,
      experimental_streamHooks:
        config.experimental_streamHooks ?? finalConfig.experimental_streamHooks,
    };

    // Add telemetry if enabled (monorepo integration)
    if (env.AI_TELEMETRY && config.telemetry !== false) {
      args.telemetry = {
        isEnabled: true,
        functionId: `ai-operation-${operation}`,
        metadata: {
          operation,
          model: typeof config.model === 'string' ? config.model : config.model?.modelId,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Remove undefined values using modern approach
    const cleanArgs = { ...args };
    for (const [key, value] of Object.entries(cleanArgs)) {
      if (value === undefined) {
        delete cleanArgs[key];
      }
    }

    // Log operation start (for @repo/observability integration)
    const operationId = `${operation}-${Date.now()}`;
    if (env.AI_TELEMETRY) {
      logDebug(`[AI] Starting ${operation}`, {
        operationId,
        model: typeof config.model === 'string' ? config.model : config.model?.modelId,
        hasTools: !!config.tools,
      });
    }

    // Execute operation (retry logic handled by middleware)
    let result;
    switch (operation) {
      case 'generateText':
        result = await generateText(cleanArgs);
        break;
      case 'streamText':
        result = streamText(cleanArgs);
        break;
      case 'generateObject':
        result = await generateObject(cleanArgs);
        break;
      case 'streamObject':
        result = streamObject(cleanArgs);
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const metrics = { duration: Date.now() - startTime };
    const usage = await (result as any).usage;

    // Cost tracking (if enabled)
    if (env.AI_COST_TRACKING && usage) {
      const modelId = typeof config.model === 'string' ? config.model : config.model?.modelId;
      const cost = calculateCost(modelId, usage);
      logInfo(`[AI] Operation cost: $${cost.toFixed(6)}`, { operationId, usage });
    }

    // Success logging
    if (env.AI_TELEMETRY) {
      logDebug(`[AI] Completed ${operation}`, {
        operationId,
        duration: metrics.duration,
        tokens: usage?.totalTokens,
      });
    }

    return {
      success: true,
      data: result as T,
      usage,
      metrics,
      operationId, // For tracking/debugging
      // AI SDK v5 Enhanced Result Properties
      text: (result as any).text,
      finishReason: (result as any).finishReason,
      // AI SDK v5 Response Access
      response: {
        headers: (result as any).response?.headers,
        body: (result as any).response?.body,
        messages: (result as any).response?.messages,
      },
      // AI SDK v5 Additional Properties
      content: (result as any).content,
      reasoningText: (result as any).reasoningText,
      files: (result as any).files,
      sources: (result as any).sources,
      toolCalls: (result as any).toolCalls,
      toolResults: (result as any).toolResults,
      warnings: (result as any).warnings,
      request: (result as any).request,
      providerOptions: (result as any).providerOptions,
      steps: (result as any).steps,
      totalUsage: (result as any).totalUsage,
      experimental_output: (result as any).experimental_output,
      // Streaming specific properties
      textStream: (result as any).textStream,
      fullStream: (result as any).fullStream,
      toUIMessageStreamResponse: (result as any).toUIMessageStreamResponse,
      pipeTextStreamToResponse: (result as any).pipeTextStreamToResponse,
      pipeUIMessageStreamToResponse: (result as any).pipeUIMessageStreamToResponse,
      toTextStreamResponse: (result as any).toTextStreamResponse,
    };
  } catch (error) {
    const metrics = { duration: Date.now() - startTime };
    const formattedError = {
      message: error instanceof Error ? error.message : String(error),
      error,
    };

    // Error logging (for @repo/observability integration)
    if (env.AI_TELEMETRY) {
      logError(`[AI] Failed ${operation}`, {
        error: formattedError.message,
        duration: metrics.duration,
      });
    }

    return {
      success: false,
      error: formattedError,
      metrics,
    };
  }
}

// calculateCost is imported from utils.ts

/**
 * Smart streaming helper
 */
export async function executeWithStreaming<T>(
  config: AIOperationConfig & {
    onChunk?: (chunk: any) => void;
  },
): Promise<AIOperationResult<T>> {
  return executeAIOperation('streamText', config);
}
