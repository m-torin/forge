/**
 * AI SDK Provider Utilities
 * Helper functions for working with AI SDK providers while adding enhanced features
 * Follows Vercel AI SDK patterns directly instead of custom abstractions
 */

import { anthropic } from '@ai-sdk/anthropic';
import { deepinfra } from '@ai-sdk/deepinfra';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import type { LanguageModel } from 'ai';
import { CoreMessage, generateObject, generateText, streamText } from 'ai';

/**
 * Enhanced model configuration with provider-specific options
 */
export interface ModelConfig {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  // Provider-specific options (following AI SDK patterns)
  anthropic?: {
    sendReasoning?: boolean;
    cacheControl?: boolean;
  };
  google?: {
    useSearchGrounding?: boolean;
    safetySettings?: Array<{
      category: string;
      threshold: string;
    }>;
  };
  perplexity?: {
    return_images?: boolean;
    // Add other Perplexity provider options as needed
  };
}

/**
 * Provider factory configuration
 */
export interface ProviderConfig {
  anthropic?: ModelConfig;
  openai?: ModelConfig;
  google?: ModelConfig;
  perplexity?: ModelConfig;
  deepinfra?: ModelConfig;
}

/**
 * Enhanced generation options that work with AI SDK patterns
 */
export interface EnhancedGenerateOptions {
  model: LanguageModel;
  messages?: CoreMessage[];
  prompt?: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Record<string, any>;
  providerOptions?: Record<string, any>;
}

/**
 * Error formatting utility (preserves useful BaseProvider functionality)
 */
export function formatProviderError(error: unknown, providerName: string, context?: string): Error {
  if (error instanceof Error) {
    const contextStr = context ? `${context}: ` : '';
    const formattedError = new Error(`[${providerName}] ${contextStr}${error.message}`);

    // Preserve original stack trace
    if (error.stack) {
      formattedError.stack = error.stack;
    }

    // Preserve any custom properties
    if ('code' in error) {
      (formattedError as any).code = (error as any).code;
    }
    if ('status' in error) {
      (formattedError as any).status = (error as any).status;
    }

    return formattedError;
  }

  // Handle non-Error objects
  if (typeof error === 'object' && error !== null) {
    const message = 'message' in error ? String((error as any).message) : JSON.stringify(error);
    return new Error(`[${providerName}] ${context ? `${context}: ` : ''}${message}`);
  }

  return new Error(`[${providerName}] ${context ? `${context}: ` : ''}${String(error)}`);
}

/**
 * Input validation utility (preserves useful BaseProvider functionality)
 */
export function validateGenerateOptions(options: EnhancedGenerateOptions): void {
  // Either prompt or messages must be provided
  if (!options.prompt && (!options.messages || options.messages.length === 0)) {
    throw new Error('Either prompt or messages must be provided');
  }

  if (options.prompt && typeof options.prompt !== 'string') {
    throw new Error('Prompt must be a string');
  }

  if (options.messages) {
    if (!Array.isArray(options.messages)) {
      throw new Error('Messages must be an array');
    }

    for (const message of options.messages) {
      if (!message.role || !message.content) {
        throw new Error('Each message must have role and content');
      }
      if (!['system', 'user', 'assistant', 'tool'].includes(message.role)) {
        throw new Error('Message role must be system, user, assistant, or tool');
      }
    }
  }
}

/**
 * Create Anthropic model with enhanced features (including sendReasoning)
 */
export function createAnthropicModel(config: Partial<ModelConfig> = {}) {
  const modelName = config.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  // Build model settings following AI SDK patterns
  const settings: any = {};

  if (config.anthropic?.sendReasoning !== undefined) {
    settings.sendReasoning = config.anthropic.sendReasoning;
  }

  // Use AI SDK's anthropic provider directly with settings
  return Object.keys(settings).length > 0 ? anthropic(modelName, settings) : anthropic(modelName);
}

/**
 * Create OpenAI model with enhanced features
 */
export function createOpenAIModel(config: Partial<ModelConfig> = {}) {
  const modelName = config.model || process.env.OPENAI_MODEL || 'gpt-4';

  return openai(modelName);
}

/**
 * Create Google model with enhanced features (including web search grounding)
 */
export function createGoogleModel(config: Partial<ModelConfig> = {}) {
  const modelName = config.model || process.env.GOOGLE_MODEL || 'gemini-1.5-pro';

  // Build provider options following AI SDK patterns
  const providerOptions: any = {};

  if (config.google?.useSearchGrounding) {
    providerOptions.useSearchGrounding = true;
  }

  if (config.google?.safetySettings) {
    providerOptions.safetySettings = config.google.safetySettings;
  }

  // Use AI SDK's google provider directly with options
  return google(modelName, providerOptions);
}

/**
 * Create Perplexity model with enhanced features
 * Note: Perplexity provider options are handled via generateText/streamText providerOptions
 */
export function createPerplexityModel(config: Partial<ModelConfig> = {}) {
  const modelName = config.model || process.env.PERPLEXITY_MODEL || 'sonar-pro';

  // Use AI SDK's perplexity provider directly
  // Provider options like return_images are passed in generateText/streamText calls
  return perplexity(modelName);
}

/**
 * Create DeepInfra model with enhanced features
 */
export function createDeepInfraModel(config: Partial<ModelConfig> = {}) {
  const modelName =
    config.model || process.env.DEEPINFRA_MODEL || 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B';

  return deepinfra(modelName);
}

/**
 * Enhanced generateText that preserves advanced features like reasoning
 */
export async function enhancedGenerateText(options: EnhancedGenerateOptions) {
  try {
    validateGenerateOptions(options);

    const generateOptions: any = {
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      tools: options.tools,
      providerOptions: options.providerOptions,
    };

    // Handle messages vs prompt pattern
    if (options.messages) {
      generateOptions.messages = options.messages;
    } else if (options.prompt) {
      generateOptions.prompt = options.prompt;
      if (options.system) {
        generateOptions.system = options.system;
      }
    }

    const result = await generateText(generateOptions);
    return result;
  } catch (error) {
    throw formatProviderError(error, options.model.modelId || 'unknown', 'generation');
  }
}

/**
 * Enhanced streamText that preserves advanced features
 */
export async function enhancedStreamText(options: EnhancedGenerateOptions) {
  try {
    validateGenerateOptions(options);

    const streamOptions: any = {
      model: options.model,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      tools: options.tools,
      providerOptions: options.providerOptions,
    };

    // Handle messages vs prompt pattern
    if (options.messages) {
      streamOptions.messages = options.messages;
    } else if (options.prompt) {
      streamOptions.prompt = options.prompt;
      if (options.system) {
        streamOptions.system = options.system;
      }
    }

    const result = await streamText(streamOptions);
    return result;
  } catch (error) {
    throw formatProviderError(error, options.model.modelId || 'unknown', 'streaming');
  }
}

/**
 * Enhanced generateObject that preserves advanced features
 */
export async function enhancedGenerateObject<T>(
  options: EnhancedGenerateOptions & {
    schema: any;
    output?: 'object' | 'array';
  },
): Promise<T> {
  try {
    const generateOptions: any = {
      model: options.model,
      prompt: options.prompt,
      system: options.system,
      schema: options.schema,
      maxTokens: options.maxTokens,
      temperature: options.temperature,
      output: options.output,
      providerOptions: options.providerOptions,
    };

    const result = await generateObject(generateOptions);
    return result.object as T;
  } catch (error) {
    throw formatProviderError(error, options.model.modelId || 'unknown', 'object generation');
  }
}

/**
 * Model factory that returns AI SDK models directly
 */
export function createModel(provider: string, config: Partial<ModelConfig> = {}): LanguageModel {
  switch (provider.toLowerCase()) {
    case 'anthropic':
      return createAnthropicModel(config);
    case 'openai':
      return createOpenAIModel(config);
    case 'google':
      return createGoogleModel(config);
    case 'perplexity':
      return createPerplexityModel(config);
    case 'deepinfra':
      return createDeepInfraModel(config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Batch model creation for multiple providers
 */
export function createModels(config: ProviderConfig): Record<string, LanguageModel> {
  const models: Record<string, LanguageModel> = {};

  if (config.anthropic) {
    models.anthropic = createAnthropicModel(config.anthropic);
  }
  if (config.openai) {
    models.openai = createOpenAIModel(config.openai);
  }
  if (config.google) {
    models.google = createGoogleModel(config.google);
  }
  if (config.perplexity) {
    models.perplexity = createPerplexityModel(config.perplexity);
  }
  if (config.deepinfra) {
    models.deepinfra = createDeepInfraModel(config.deepinfra);
  }

  return models;
}

/**
 * Web Search Agent Helper Functions (Pure AI SDK Patterns)
 * These follow the Vercel AI SDK documentation exactly
 */

/**
 * Create a Perplexity model configured for web search (sonar models have native web search)
 * Follows AI SDK pattern: perplexity('sonar-pro') automatically includes web search
 * Note: Provider options like return_images are passed via generateText providerOptions
 */
export function createWebSearchPerplexityModel(
  modelName: 'sonar-pro' | 'sonar' | 'sonar-deep-research' = 'sonar-pro',
) {
  // Perplexity provider options are handled at the generateText level
  return perplexity(modelName);
}

/**
 * Create a Google model configured for web search with search grounding
 * Follows AI SDK pattern: google('gemini-1.5-pro', { useSearchGrounding: true })
 */
export function createWebSearchGoogleModel(
  modelName: string = 'gemini-1.5-pro',
  options?: {
    useSearchGrounding?: boolean;
    safetySettings?: Array<{ category: string; threshold: string }>;
  },
) {
  const providerOptions: any = {
    useSearchGrounding: options?.useSearchGrounding ?? true, // Default to enabled for web search
  };

  if (options?.safetySettings) {
    providerOptions.safetySettings = options.safetySettings;
  }

  return google(modelName, providerOptions);
}

/**
 * Quick web search generation with Perplexity (sources included automatically)
 * Pure AI SDK pattern - no custom abstractions
 */
export async function webSearchWithPerplexity(
  prompt: string,
  options?: {
    model?: 'sonar-pro' | 'sonar' | 'sonar-deep-research';
    return_images?: boolean;
    maxTokens?: number;
    temperature?: number;
  },
) {
  const model = createWebSearchPerplexityModel(options?.model);

  // Provider options are passed via providerOptions (AI SDK pattern)
  const providerOptions: any = {};
  if (options?.return_images) {
    providerOptions.perplexity = { return_images: true };
  }

  return await generateText({
    model,
    prompt,
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
    providerOptions: Object.keys(providerOptions).length > 0 ? providerOptions : undefined,
  });
}

/**
 * Quick web search generation with Google Gemini (with search grounding)
 * Pure AI SDK pattern - no custom abstractions
 */
export async function webSearchWithGemini(
  prompt: string,
  options?: {
    model?: string;
    useSearchGrounding?: boolean;
    maxTokens?: number;
    temperature?: number;
  },
) {
  const model = createWebSearchGoogleModel(options?.model, {
    useSearchGrounding: options?.useSearchGrounding,
  });

  return await generateText({
    model,
    prompt,
    maxTokens: options?.maxTokens,
    temperature: options?.temperature,
  });
}
