/**
 * AI SDK v5 Enhanced Lifecycle Hooks
 * Provides granular control over AI model interactions with advanced lifecycle management
 */

import { logError, logInfo } from '@repo/observability';
import type {
  CoreToolMessage,
  GenerateObjectResult,
  GenerateTextResult,
  LanguageModel,
  LanguageModelUsage,
  StreamTextResult,
} from 'ai';
import { wrapLanguageModel } from 'ai';

// Type alias for backward compatibility
type ToolResult = CoreToolMessage;

export interface LifecycleContext {
  modelId: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  requestId: string;
  metadata?: Record<string, any>;
}

export interface GenerationHookContext extends LifecycleContext {
  prompt: string; // Simplified prompt type for v5 compatibility
  temperature?: number;
  maxOutputTokens?: number;
  tools?: Record<string, any>;
}

export interface GenerationHookResult {
  continue: boolean;
  modifiedPrompt?: string;
  modifiedSettings?: Record<string, any>;
  metadata?: Record<string, any>;
  skipGeneration?: boolean;
  cachedResponse?: any;
}

export interface CompletionHookContext extends LifecycleContext {
  result: GenerateTextResult<any, any> | GenerateObjectResult<any> | StreamTextResult<any, any>;
  usage?: LanguageModelUsage;
  duration: number;
  cached?: boolean;
}

export interface ErrorHookContext extends LifecycleContext {
  error: Error;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
}

export interface ToolCallHookContext extends LifecycleContext {
  toolName: string;
  toolArgs: Record<string, any>;
  toolResult?: ToolResult;
}

/**
 * Lifecycle hook definitions
 */
export interface LifecycleHooks {
  onGenerationStart?: (
    context: GenerationHookContext,
  ) => Promise<GenerationHookResult> | GenerationHookResult;
  onGenerationComplete?: (context: CompletionHookContext) => Promise<void> | void;
  onGenerationError?: (context: ErrorHookContext) => Promise<boolean> | boolean;
  onToolCallStart?: (context: ToolCallHookContext) => Promise<boolean> | boolean;
  onToolCallComplete?: (context: ToolCallHookContext) => Promise<void> | void;
  onCacheHit?: (
    context: LifecycleContext & { cacheKey: string; value: any },
  ) => Promise<void> | void;
  onCacheMiss?: (context: LifecycleContext & { cacheKey: string }) => Promise<void> | void;
  onTokenUsage?: (
    context: LifecycleContext & { usage: LanguageModelUsage; cost?: number },
  ) => Promise<void> | void;
  onRateLimit?: (context: LifecycleContext & { retryAfter: number }) => Promise<void> | void;
}

/**
 * Enhanced lifecycle manager
 */
export class LifecycleManager {
  private hooks: LifecycleHooks = {};
  private globalContext: Partial<LifecycleContext> = {};

  constructor(hooks?: LifecycleHooks, globalContext?: Partial<LifecycleContext>) {
    if (hooks) this.hooks = hooks;
    if (globalContext) this.globalContext = globalContext;
  }

  /**
   * Register lifecycle hooks
   */
  registerHooks(hooks: Partial<LifecycleHooks>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Set global context that will be merged with all hook contexts
   */
  setGlobalContext(context: Partial<LifecycleContext>): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Create context for hooks
   */
  private createContext<T extends LifecycleContext>(
    base: Omit<T, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): T {
    return {
      ...base,
      modelId,
      timestamp: Date.now(),
      requestId: this.generateRequestId(),
      ...this.globalContext,
      ...overrides,
    } as T;
  }

  /**
   * Execute generation start hooks
   */
  async executeGenerationStart(
    context: Omit<GenerationHookContext, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<GenerationHookResult> {
    if (!this.hooks.onGenerationStart) {
      return { continue: true };
    }

    const fullContext = this.createContext<GenerationHookContext>(context, modelId, overrides);

    try {
      return await this.hooks.onGenerationStart(fullContext);
    } catch (error) {
      logError('Error in onGenerationStart hook:', error);
      return { continue: true };
    }
  }

  /**
   * Execute completion hooks
   */
  async executeGenerationComplete(
    context: Omit<CompletionHookContext, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onGenerationComplete) return;

    const fullContext = this.createContext<CompletionHookContext>(context, modelId, overrides);

    try {
      await this.hooks.onGenerationComplete(fullContext);
    } catch (error) {
      logError('Error in onGenerationComplete hook:', error);
    }
  }

  /**
   * Execute error hooks
   */
  async executeGenerationError(
    context: Omit<ErrorHookContext, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<boolean> {
    if (!this.hooks.onGenerationError) return false;

    const fullContext = this.createContext<ErrorHookContext>(context, modelId, overrides);

    try {
      return await this.hooks.onGenerationError(fullContext);
    } catch (error) {
      logError('Error in onGenerationError hook:', error);
      return false;
    }
  }

  /**
   * Execute tool call start hooks
   */
  async executeToolCallStart(
    context: Omit<ToolCallHookContext, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<boolean> {
    if (!this.hooks.onToolCallStart) return true;

    const fullContext = this.createContext<ToolCallHookContext>(context, modelId, overrides);

    try {
      return await this.hooks.onToolCallStart(fullContext);
    } catch (error) {
      logError('Error in onToolCallStart hook:', error);
      return true;
    }
  }

  /**
   * Execute tool call complete hooks
   */
  async executeToolCallComplete(
    context: Omit<ToolCallHookContext, keyof LifecycleContext>,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onToolCallComplete) return;

    const fullContext = this.createContext<ToolCallHookContext>(context, modelId, overrides);

    try {
      await this.hooks.onToolCallComplete(fullContext);
    } catch (error) {
      logError('Error in onToolCallComplete hook:', error);
    }
  }

  /**
   * Execute cache hit hooks
   */
  async executeCacheHit(
    cacheKey: string,
    value: any,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onCacheHit) return;

    const context = this.createContext<LifecycleContext & { cacheKey: string; value: any }>(
      { cacheKey, value },
      modelId,
      overrides,
    );

    try {
      await this.hooks.onCacheHit(context);
    } catch (error) {
      logError('Error in onCacheHit hook:', error);
    }
  }

  /**
   * Execute cache miss hooks
   */
  async executeCacheMiss(
    cacheKey: string,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onCacheMiss) return;

    const context = this.createContext<LifecycleContext & { cacheKey: string }>(
      { cacheKey },
      modelId,
      overrides,
    );

    try {
      await this.hooks.onCacheMiss(context);
    } catch (error) {
      logError('Error in onCacheMiss hook:', error);
    }
  }

  /**
   * Execute token usage hooks
   */
  async executeTokenUsage(
    usage: LanguageModelUsage,
    modelId: string,
    cost?: number,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onTokenUsage) return;

    const context = this.createContext<
      LifecycleContext & { usage: LanguageModelUsage; cost?: number }
    >({ usage, cost }, modelId, overrides);

    try {
      await this.hooks.onTokenUsage(context);
    } catch (error) {
      logError('Error in onTokenUsage hook:', error);
    }
  }

  /**
   * Execute rate limit hooks
   */
  async executeRateLimit(
    retryAfter: number,
    modelId: string,
    overrides?: Partial<LifecycleContext>,
  ): Promise<void> {
    if (!this.hooks.onRateLimit) return;

    const context = this.createContext<LifecycleContext & { retryAfter: number }>(
      { retryAfter },
      modelId,
      overrides,
    );

    try {
      await this.hooks.onRateLimit(context);
    } catch (error) {
      logError('Error in onRateLimit hook:', error);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Wrapper for language models with lifecycle hooks
 */
export function wrapModelWithLifecycle(
  model: LanguageModel,
  lifecycleManager: LifecycleManager,
): LanguageModel {
  return wrapLanguageModel({
    model: model as any,
    middleware: {
      async wrapGenerate({ doGenerate, params, model: wrappedModel }) {
        const startTime = Date.now();
        const context = {
          prompt: String(params.prompt), // Convert to string for compatibility
          temperature: params.temperature,
          maxOutputTokens: params.maxOutputTokens,
        };

        // Execute start hooks
        const hookResult = await lifecycleManager.executeGenerationStart(
          context,
          (model as any).modelId || 'unknown-model',
        );

        if (!hookResult.continue) {
          throw new Error('Generation cancelled by lifecycle hook');
        }

        if (hookResult.skipGeneration && hookResult.cachedResponse) {
          return hookResult.cachedResponse;
        }

        // Modify params if needed
        const modifiedParams = hookResult.modifiedSettings
          ? { ...params, ...hookResult.modifiedSettings }
          : params;

        if (hookResult.modifiedPrompt) {
          // Convert string prompt to proper LanguageModelPrompt format
          modifiedParams.prompt =
            typeof hookResult.modifiedPrompt === 'string'
              ? (hookResult.modifiedPrompt as any)
              : hookResult.modifiedPrompt;
        }

        try {
          const result = await doGenerate();
          const duration = Date.now() - startTime;

          // Execute completion hooks with simplified result mapping
          await lifecycleManager.executeGenerationComplete(
            { result: result as any, duration, usage: result.usage },
            (wrappedModel as any).modelId || 'unknown-model',
          );

          // Execute token usage hooks
          if (result.usage) {
            await lifecycleManager.executeTokenUsage(
              result.usage,
              (wrappedModel as any).modelId || 'unknown-model',
            );
          }

          return result;
        } catch (error) {
          const shouldRetry = await lifecycleManager.executeGenerationError(
            {
              error: error as Error,
              retryCount: 0,
              maxRetries: 3,
              canRetry: true,
            },
            (wrappedModel as any).modelId || 'unknown-model',
          );

          if (shouldRetry) {
            // Implement retry logic here if needed
            logInfo('Retry requested by error hook');
          }

          throw error;
        }
      },

      async wrapStream({ doStream, params, model: wrappedModel }) {
        const startTime = Date.now();
        const context = {
          prompt: String(params.prompt), // Convert to string for compatibility
          temperature: params.temperature,
          maxOutputTokens: params.maxOutputTokens,
        };

        // Execute start hooks
        const hookResult = await lifecycleManager.executeGenerationStart(
          context,
          (model as any).modelId || 'unknown-model',
        );

        if (!hookResult.continue) {
          throw new Error('Streaming cancelled by lifecycle hook');
        }

        // Modify params if needed
        const modifiedParams = hookResult.modifiedSettings
          ? { ...params, ...hookResult.modifiedSettings }
          : params;

        if (hookResult.modifiedPrompt) {
          // Convert string prompt to proper LanguageModelPrompt format
          modifiedParams.prompt =
            typeof hookResult.modifiedPrompt === 'string'
              ? (hookResult.modifiedPrompt as any)
              : hookResult.modifiedPrompt;
        }

        const result = await doStream();

        // Wrap the stream to capture completion
        const originalStream = result.stream;
        let usage: LanguageModelUsage | undefined;

        result.stream = originalStream.pipeThrough(
          new TransformStream({
            transform(chunk, controller) {
              if (chunk.type === 'finish' && chunk.usage) {
                usage = chunk.usage;
              }
              controller.enqueue(chunk);
            },
            flush: async () => {
              const duration = Date.now() - startTime;

              // Execute completion hooks with simplified stream result
              await lifecycleManager.executeGenerationComplete(
                { result: result as any, duration, usage },
                (wrappedModel as any).modelId || 'unknown-model',
              );

              // Execute token usage hooks
              if (usage) {
                await lifecycleManager.executeTokenUsage(
                  usage,
                  (wrappedModel as any).modelId || 'unknown-model',
                );
              }
            },
          }),
        );

        return result;
      },
    },
  });
}

/**
 * Pre-configured lifecycle managers for common use cases
 */
export const lifecyclePresets = {
  /**
   * Development lifecycle with comprehensive logging
   */
  development: () =>
    new LifecycleManager({
      onGenerationStart: async context => {
        logInfo(`🚀 Generation started: ${context.modelId}`, {
          prompt: context.prompt?.slice(0, 100) + '...',
          temperature: context.temperature,
        });
        return { continue: true };
      },
      onGenerationComplete: async context => {
        logInfo(`✅ Generation completed: ${context.modelId}`, {
          duration: `${context.duration}ms`,
          usage: context.usage,
        });
      },
      onGenerationError: async context => {
        logError(`❌ Generation error: ${context.modelId}`, {
          error: context.error.message,
          retryCount: context.retryCount,
        });
        return context.retryCount < context.maxRetries;
      },
      onTokenUsage: async context => {
        logInfo(`💰 Token usage: ${context.modelId}`, context.usage);
      },
    }),

  /**
   * Production lifecycle with minimal logging and metrics
   */
  production: () =>
    new LifecycleManager({
      onGenerationComplete: async context => {
        // Send metrics to monitoring system
        logInfo(`Generation metrics: ${context.modelId} - ${context.duration}ms`);
      },
      onGenerationError: async context => {
        // Send error to error tracking system
        logError(`Generation error: ${context.error.message}`);
        return false; // Don't retry in production by default
      },
      onTokenUsage: async context => {
        // Track token usage for billing
        logInfo(`Token usage: ${JSON.stringify(context.usage)}`);
      },
    }),

  /**
   * Debug lifecycle with detailed inspection
   */
  debug: () =>
    new LifecycleManager({
      onGenerationStart: async context => {
        logInfo('🔍 DEBUG: Generation start', JSON.stringify(context, null, 2));
        return { continue: true };
      },
      onGenerationComplete: async context => {
        logInfo('🔍 DEBUG: Generation complete', JSON.stringify(context, null, 2));
      },
      onToolCallStart: async context => {
        logInfo('🔍 DEBUG: Tool call start', JSON.stringify(context, null, 2));
        return true;
      },
      onToolCallComplete: async context => {
        logInfo('🔍 DEBUG: Tool call complete', JSON.stringify(context, null, 2));
      },
      onCacheHit: async context => {
        logInfo('🔍 DEBUG: Cache hit', { cacheKey: context.cacheKey });
      },
      onCacheMiss: async context => {
        logInfo('🔍 DEBUG: Cache miss', { cacheKey: context.cacheKey });
      },
    }),
} as const;

/**
 * Factory functions
 */
export function createLifecycleManager(
  hooks?: LifecycleHooks,
  globalContext?: Partial<LifecycleContext>,
): LifecycleManager {
  return new LifecycleManager(hooks, globalContext);
}

export function createLifecycleWrapper(
  model: LanguageModel,
  hooks?: LifecycleHooks,
): LanguageModel {
  const manager = new LifecycleManager(hooks);
  return wrapModelWithLifecycle(model, manager);
}

/**
 * Utility for creating custom hook chains
 */
export function chainHooks(...hookSets: Partial<LifecycleHooks>[]): LifecycleHooks {
  const combined: LifecycleHooks = {};

  for (const hookType of [
    'onGenerationStart',
    'onGenerationComplete',
    'onGenerationError',
    'onToolCallStart',
    'onToolCallComplete',
    'onCacheHit',
    'onCacheMiss',
    'onTokenUsage',
    'onRateLimit',
  ] as const) {
    const hooks = hookSets.map(set => set[hookType]).filter(Boolean);

    if (hooks.length > 0) {
      if (hookType === 'onGenerationStart') {
        combined[hookType] = async context => {
          let result: GenerationHookResult = { continue: true };
          for (const hook of hooks) {
            if (hook) {
              const hookResult = await hook(context as any);
              // Handle different return types
              if (typeof hookResult === 'boolean') {
                if (!hookResult) {
                  return { continue: false };
                }
              } else if (hookResult && typeof hookResult === 'object') {
                if (!hookResult.continue) {
                  return hookResult;
                }
                result = { ...result, ...hookResult };
              }
            }
          }
          return result;
        };
      } else if (hookType === 'onGenerationError') {
        combined[hookType] = async context => {
          for (const hook of hooks) {
            if (hook) {
              const shouldRetry = await hook(context as any);
              if (shouldRetry) return true;
            }
          }
          return false;
        };
      } else if (hookType === 'onToolCallStart') {
        combined[hookType] = async context => {
          for (const hook of hooks) {
            const shouldContinue = await hook?.(context as any);
            if (!shouldContinue) return false;
          }
          return true;
        };
      } else {
        // For void-returning hooks, execute all in sequence
        combined[hookType] = async context => {
          for (const hook of hooks) {
            await hook?.(context as any);
          }
        };
      }
    }
  }

  return combined;
}
