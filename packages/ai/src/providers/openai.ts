/**
 * OpenAI Provider Module
 * Centralized location for OpenAI-specific features and configurations
 * OpenAI uniquely provides reasoning models, service tiers, and native tools
 *
 * DRY Principle: Only defines features unique to OpenAI
 * Generic patterns use AI SDK v5 and shared utilities
 *
 * ARCHITECTURAL DECISION: OpenAI vs Perplexity Pattern
 * ====================================================
 *
 * This module demonstrates the OPPOSITE end of the spectrum from Perplexity:
 *
 * PERPLEXITY (Minimal AI SDK v5 Support):
 * - Keeps custom helpers because AI SDK v5 has limited native support
 * - withImages(), withResearchMode() provide unique value
 * - Custom helpers fill gaps in AI SDK v5 functionality
 *
 * OPENAI (Maximum AI SDK v5 Support):
 * - Removes custom tool wrappers because AI SDK v5 has COMPLETE native support
 * - openai.tools.* provides full executable implementations
 * - Custom wrappers would duplicate well-implemented native functionality
 *
 * Result: Each provider is optimized for its level of AI SDK v5 integration
 */

import {
  createOpenAI,
  openai as openaiProvider,
  type OpenAIResponsesProviderOptions,
} from '@ai-sdk/openai';
import type { JSONObject, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { commonModes } from './shared';

// Type alias for cleaner usage
type OpenAIProviderOptions = OpenAIResponsesProviderOptions;

// Type definitions for OpenAI-specific features
interface GenerationResult {
  providerOptions?: SharedV2ProviderMetadata;
}

// Re-export the provider itself and createOpenAI function
// VERIFIED: All AI SDK v5 native methods are accessible through our re-export:
// - openai.image() - Image generation
// - openai.textEmbedding() - Text embeddings
// - openai.transcription() - Speech-to-text
// - openai.speech() - Text-to-speech
// - openai.responses() - Responses API
// - openai.tools.* - Native tools (webSearchPreview, fileSearch, codeInterpreter)
export { createOpenAI, openaiProvider as openai };

/**
 * Single source of truth for OpenAI model IDs
 * Used by both registry and direct imports
 */
export const OPENAI_MODEL_IDS = {
  // GPT-5 models
  GPT_5: 'gpt-5',
  GPT_5_MINI: 'gpt-5-mini',
  GPT_5_NANO: 'gpt-5-nano',
  GPT_5_CHAT_LATEST: 'gpt-5-chat-latest',

  // GPT-4.1 models
  GPT_41: 'gpt-4.1',
  GPT_41_MINI: 'gpt-4.1-mini',
  GPT_41_NANO: 'gpt-4.1-nano',

  // GPT-4 models
  GPT_4O: 'gpt-4o',
  GPT_4O_LATEST: 'chatgpt-4o-latest',
  GPT_4O_MINI: 'gpt-4o-mini',
  GPT_4O_AUDIO: 'gpt-4o-audio-preview',
  GPT_4O_REALTIME: 'gpt-4o-realtime-preview',
  GPT_4_TURBO: 'gpt-4-turbo',
  GPT_4: 'gpt-4',
  GPT_4_32K: 'gpt-4-32k',

  // GPT-3.5 models
  GPT_35_TURBO: 'gpt-3.5-turbo',
  GPT_35_TURBO_INSTRUCT: 'gpt-3.5-turbo-instruct',

  // O1 reasoning models
  O1: 'o1',
  O1_MINI: 'o1-mini',
  O1_PREVIEW: 'o1-preview',

  // O3 models
  O3: 'o3',
  O3_MINI: 'o3-mini',

  // O4 models
  O4_MINI: 'o4-mini',

  // Specialized reasoning models
  CODEX_MINI_LATEST: 'codex-mini-latest',
  COMPUTER_USE_PREVIEW: 'computer-use-preview',

  // Audio models - Transcription
  WHISPER_1: 'whisper-1',
  GPT_4O_MINI_TRANSCRIBE: 'gpt-4o-mini-transcribe',
  GPT_4O_TRANSCRIBE: 'gpt-4o-transcribe',

  // Audio models - TTS
  TTS_1: 'tts-1',
  TTS_1_HD: 'tts-1-hd',
  GPT_4O_MINI_TTS: 'gpt-4o-mini-tts',

  // Image models
  GPT_IMAGE_1: 'gpt-image-1',
  DALL_E_3: 'dall-e-3',
  DALL_E_2: 'dall-e-2',

  // Embedding models
  EMBEDDING_3_SMALL: 'text-embedding-3-small',
  EMBEDDING_3_LARGE: 'text-embedding-3-large',
  EMBEDDING_ADA_002: 'text-embedding-ada-002',

  // Moderation model
  MODERATION_LATEST: 'text-moderation-latest',
  MODERATION_STABLE: 'text-moderation-stable',
} as const;

/**
 * Model groups for categorization
 * Helps identify capabilities and use cases
 *
 * KEEP REASON: These are OpenAI-specific categorizations based on OpenAI's model families.
 * AI SDK v5 has no knowledge of OpenAI's specific model categorizations and capabilities.
 * Not generic - these are OpenAI's own model classifications and architectural differences.
 */
const OPENAI_MODEL_GROUPS = {
  // KEEP REASON: OpenAI defines specific reasoning models with unique capabilities
  REASONING_MODELS: [
    OPENAI_MODEL_IDS.O1,
    OPENAI_MODEL_IDS.O1_MINI,
    OPENAI_MODEL_IDS.O1_PREVIEW,
    OPENAI_MODEL_IDS.O3,
    OPENAI_MODEL_IDS.O3_MINI,
    OPENAI_MODEL_IDS.O4_MINI,
    OPENAI_MODEL_IDS.CODEX_MINI_LATEST,
    OPENAI_MODEL_IDS.COMPUTER_USE_PREVIEW,
  ] as const,

  // KEEP REASON: OpenAI's GPT-5 family represents their latest architecture
  GPT5_FAMILY: [
    OPENAI_MODEL_IDS.GPT_5,
    OPENAI_MODEL_IDS.GPT_5_MINI,
    OPENAI_MODEL_IDS.GPT_5_NANO,
    OPENAI_MODEL_IDS.GPT_5_CHAT_LATEST,
  ] as const,

  // KEEP REASON: OpenAI-specific multimodal models with vision/audio capabilities
  MULTIMODAL_MODELS: [
    OPENAI_MODEL_IDS.GPT_4O,
    OPENAI_MODEL_IDS.GPT_4O_MINI,
    OPENAI_MODEL_IDS.GPT_4O_AUDIO,
    OPENAI_MODEL_IDS.GPT_4_TURBO,
    OPENAI_MODEL_IDS.GPT_41,
    OPENAI_MODEL_IDS.GPT_41_MINI,
    OPENAI_MODEL_IDS.GPT_5,
    OPENAI_MODEL_IDS.GPT_5_MINI,
  ] as const,

  // KEEP REASON: OpenAI's specialized audio model family
  AUDIO_MODELS: [
    OPENAI_MODEL_IDS.WHISPER_1,
    OPENAI_MODEL_IDS.GPT_4O_MINI_TRANSCRIBE,
    OPENAI_MODEL_IDS.GPT_4O_TRANSCRIBE,
    OPENAI_MODEL_IDS.TTS_1,
    OPENAI_MODEL_IDS.TTS_1_HD,
    OPENAI_MODEL_IDS.GPT_4O_MINI_TTS,
  ] as const,

  // KEEP REASON: OpenAI chat models for capability detection
  CHAT_MODELS: [
    OPENAI_MODEL_IDS.GPT_5,
    OPENAI_MODEL_IDS.GPT_5_MINI,
    OPENAI_MODEL_IDS.GPT_5_NANO,
    OPENAI_MODEL_IDS.GPT_5_CHAT_LATEST,
    OPENAI_MODEL_IDS.GPT_4O,
    OPENAI_MODEL_IDS.GPT_4O_MINI,
    OPENAI_MODEL_IDS.GPT_4_TURBO,
    OPENAI_MODEL_IDS.GPT_41,
    OPENAI_MODEL_IDS.GPT_41_MINI,
    OPENAI_MODEL_IDS.GPT_4,
    OPENAI_MODEL_IDS.GPT_4_32K,
    OPENAI_MODEL_IDS.GPT_35_TURBO,
  ] as const,

  // KEEP REASON: OpenAI vision models for capability detection
  VISION_MODELS: [
    OPENAI_MODEL_IDS.GPT_4O,
    OPENAI_MODEL_IDS.GPT_4O_MINI,
    OPENAI_MODEL_IDS.GPT_4_TURBO,
    OPENAI_MODEL_IDS.GPT_41,
    OPENAI_MODEL_IDS.GPT_41_MINI,
    OPENAI_MODEL_IDS.GPT_5,
    OPENAI_MODEL_IDS.GPT_5_MINI,
  ] as const,

  // KEEP REASON: OpenAI legacy models for feature support detection
  LEGACY_MODELS: [
    OPENAI_MODEL_IDS.GPT_4,
    OPENAI_MODEL_IDS.GPT_4_32K,
    OPENAI_MODEL_IDS.GPT_35_TURBO,
    OPENAI_MODEL_IDS.GPT_35_TURBO_INSTRUCT,
  ] as const,
} as const;

// Pre-configured models REMOVED for DRY compliance
// REASON: These were just syntactic sugar with no unique value.
// AI SDK v5 pattern is direct provider invocation: openai('model-id')
// Users should use: openai('gpt-5') instead of openaiModels.gpt5

// Factory methods REMOVED for DRY compliance
// REASON: AI SDK v5 provides these natively as openai.chat(), openai.image(), etc.
// Users should use: openai.chat('gpt-5') instead of openaiFactories.chat('gpt-5')

// OpenAI embeddings REMOVED for DRY compliance
// REASON: These were pre-configured instances with no unique value.
// AI SDK v5 pattern: openai.textEmbedding('text-embedding-3-large')

// Generic OpenAIProviderOptions type REMOVED for DRY compliance
// REASON: This was just Record<string, any> - not OpenAI-specific.
// Use AI SDK v5 native OpenAIProviderOptions from @ai-sdk/openai or specific OpenAI types defined in this module.

// Middleware creators REMOVED for DRY compliance
// REASON: These were unnecessary abstractions over AI SDK v5 patterns.
// Direct objects in providerOptions are more efficient and DRY-compliant.
// Helper functions now return direct objects instead of middleware wrappers.

/**
 * Helper for structured output mode
 * UNIQUE TO OPENAI: strictJsonSchema mode for strict structured outputs
 *
 * KEEP REASON: OpenAI has unique 'strictJsonSchema' validation mode.
 * AI SDK v5 doesn't know about OpenAI's strict JSON schema validation.
 * This is OpenAI-specific structured output configuration, not generic.
 */
export function withStructuredOutput(
  responseFormat: 'json_object' | 'json_schema' = 'json_object',
  strictJsonSchema: boolean = false,
) {
  return {
    openai: {
      responseFormat: { type: responseFormat },
      strictJsonSchema,
    },
  };
}

/**
 * Helper for compatibility mode
 * UNIQUE TO OPENAI: 'strict' compatibility parameter
 *
 * KEEP REASON: OpenAI has a specific 'compatibility' parameter for older models.
 * AI SDK v5 doesn't know about OpenAI's compatibility mode settings.
 * This is OpenAI-specific backward compatibility configuration.
 */
function withCompatibilityMode() {
  return {
    openai: {
      compatibility: 'strict',
    },
  };
}

/**
 * Helper for reasoning models (O1, O3, O4 series) - Provider Agnostic
 * UNIQUE TO OPENAI: reasoningEffort parameter for reasoning models
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: openai('o1-preview'), ...withReasoningMode(25000, 'high') })
 *
 * // Works with gateway
 * generateText({ model: gateway('openai/o1-preview'), ...withReasoningMode(25000, 'high') })
 * ```
 */
export function withReasoningMode(
  maxCompletionTokens: number = 25000,
  reasoningEffort: 'minimal' | 'low' | 'medium' | 'high' = 'medium',
) {
  return {
    providerOptions: {
      openai: {
        maxCompletionTokens,
        reasoningEffort,
      },
    },
  };
}

/**
 * Helper for reasoning summaries - Provider Agnostic
 * UNIQUE TO OPENAI: reasoningSummary for debugging reasoning models
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: openai('o1-preview'), ...withReasoningSummary('detailed') })
 *
 * // Works with gateway
 * generateText({ model: gateway('openai/o1-preview'), ...withReasoningSummary('detailed') })
 * ```
 */
function withReasoningSummary(mode: 'auto' | 'detailed' = 'auto') {
  return {
    providerOptions: {
      openai: {
        reasoningSummary: mode,
      },
    },
  };
}

/**
 * Helper for function calling mode
 * Optimizes for tool/function usage
 */
/**
 * Helper for function calling configuration
 * UNIQUE TO OPENAI: parallelToolCalls parameter
 *
 * KEEP REASON: OpenAI has unique 'parallelToolCalls' parameter for tool execution.
 * AI SDK v5 doesn't know about OpenAI's parallel tool calling configuration.
 * This is OpenAI-specific tool execution optimization.
 */
function withFunctionCalling(
  mode: 'auto' | 'none' | 'required' = 'auto',
  parallelToolCalls: boolean = true,
) {
  return {
    openai: {
      toolChoice: mode,
      parallelToolCalls,
    },
  };
}

/**
 * Helper for user identification
 * UNIQUE TO OPENAI: user and safetyIdentifier for abuse monitoring
 *
 * KEEP REASON: OpenAI has unique user tracking parameters for abuse monitoring.
 * AI SDK v5 doesn't know about OpenAI's user identification system.
 * This is OpenAI-specific safety and monitoring feature.
 */
function withUserIdentification(userId?: string, safetyIdentifier?: string) {
  return {
    openai: {
      user: userId,
      safetyIdentifier,
    },
  };
}

/**
 * Helper for logit bias
 * UNIQUE TO OPENAI: logitBias for token likelihood modification
 *
 * KEEP REASON: OpenAI has unique 'logitBias' parameter for token probability control.
 * AI SDK v5 doesn't know about OpenAI's logit bias system.
 * This is OpenAI-specific token likelihood modification feature.
 */
function withLogitBias(bias: Record<number, number>) {
  return {
    openai: {
      logitBias: bias,
    },
  };
}

/**
 * Helper for metadata
 * UNIQUE TO OPENAI: metadata parameter for request tracking
 *
 * KEEP REASON: OpenAI has unique 'metadata' parameter for request labeling.
 * AI SDK v5 doesn't know about OpenAI's metadata tracking system.
 * This is OpenAI-specific request metadata feature.
 */
function withMetadata(metadata: Record<string, string>) {
  return {
    openai: {
      metadata,
    },
  };
}

/**
 * Helper for continuing conversations (Responses API)
 * UNIQUE TO OPENAI: previousResponseId for conversation continuation
 *
 * KEEP REASON: OpenAI's Responses API has unique conversation continuation.
 * AI SDK v5 doesn't know about OpenAI's response ID linking system.
 * This is OpenAI-specific conversation state management.
 */
function withPreviousResponseId(responseId: string, instructions?: string) {
  const openaiOptions: OpenAIProviderOptions = {
    previousResponseId: responseId,
  };

  if (instructions !== undefined) {
    openaiOptions.instructions = instructions;
  }

  return { openai: openaiOptions };
}

/**
 * Helper for including additional content (Responses API)
 * UNIQUE TO OPENAI: include parameter for additional response content
 *
 * KEEP REASON: OpenAI's Responses API has unique 'include' parameter.
 * AI SDK v5 doesn't know about OpenAI's content inclusion options.
 * This is OpenAI-specific response content control.
 */
function withInclude(content: string[]) {
  return {
    openai: {
      include: content,
    },
  };
}

// Native OpenAI tools REMOVED for DRY compliance
// REASON: AI SDK v5 provides FULL NATIVE IMPLEMENTATIONS as executable tool instances.
//
// CRITICAL DIFFERENCE FROM PERPLEXITY PATTERN:
// ================================================
// OpenAI and Perplexity represent OPPOSITE ENDS of AI SDK v5 support:
//
// PERPLEXITY (minimal support):
// - No native tool support in AI SDK v5
// - Custom helpers provide unique value for provider-specific parameters
// - Helpers return configuration objects for provider options
// - Example: withImages() returns { perplexity: { return_images: true } }
//
// OPENAI (maximum support):
// - COMPLETE native tool implementations in AI SDK v5
// - openai.tools.webSearchPreview = full executable tool with execute(), inputSchema, outputSchema
// - openai.tools.fileSearch = full executable tool for RAG with vector stores
// - openai.tools.codeInterpreter = full executable tool for Python execution
// - These are NOT configuration objects, they are actual tool instances
//
// WHY THE DIFFERENCE:
// - Perplexity: Keeps helpers because AI SDK v5 doesn't provide native tools
// - OpenAI: Removes helpers because AI SDK v5 provides COMPLETE native implementations
// - Keeping both would violate DRY and create confusion between configuration vs execution
//
// CORRECT USAGE:
// ```typescript
// import { openai } from '@ai-sdk/openai';
// import { generateText } from 'ai';
//
// // Use native tools directly - they're fully implemented
// const result = await generateText({
//   model: openai('gpt-4o'),
//   prompt: 'Search for latest AI developments',
//   tools: {
//     webSearch: openai.tools.webSearchPreview,  // Native executable tool
//     fileSearch: openai.tools.fileSearch,        // Native executable tool
//     codeInterp: openai.tools.codeInterpreter,   // Native executable tool
//   }
// });
// ```
//
// Our removed custom implementation returned: { type: 'openai:webSearchPreview', enabled: true, ...options }
// AI SDK v5 native returns: Full tool object with execute() function and schemas
// These serve completely different architectural purposes.

/**
 * Helper for enabling logprobs
 * UNIQUE TO OPENAI: logprobs and topLogprobs for token probabilities
 *
 * KEEP REASON: OpenAI has unique 'logprobs' and 'topLogprobs' parameters.
 * AI SDK v5 doesn't know about OpenAI's token probability debugging.
 * This is OpenAI-specific token probability analysis feature.
 */
function withLogprobs(logprobs: boolean | number = true, topLogprobs?: number) {
  const options: OpenAIProviderOptions = { logprobs };
  if (typeof logprobs === 'boolean' && topLogprobs !== undefined) {
    options.logprobs = topLogprobs;
  }
  return { openai: options };
}

/**
 * Helper for predicted outputs
 * UNIQUE TO OPENAI: prediction parameter for latency optimization
 *
 * KEEP REASON: OpenAI has unique 'prediction' parameter for latency optimization.
 * AI SDK v5 doesn't know about OpenAI's predicted outputs feature.
 * This is OpenAI-specific performance optimization for known content.
 */
export function withPredictedOutput(prediction: string) {
  return {
    openai: {
      prediction: {
        type: 'content',
        content: prediction,
      },
    },
  };
}

/**
 * Helper for prompt caching
 * UNIQUE TO OPENAI: promptCacheKey and store for caching control
 *
 * KEEP REASON: OpenAI has unique prompt caching with 'promptCacheKey'.
 * AI SDK v5 doesn't know about OpenAI's prompt caching system.
 * This is OpenAI-specific caching optimization feature.
 */
export function withPromptCache(cacheEnabled: boolean = true, promptCacheKey?: string) {
  const options: OpenAIProviderOptions = { store: cacheEnabled };
  if (promptCacheKey) {
    (options as OpenAIProviderOptions & { promptCacheKey: string }).promptCacheKey = promptCacheKey;
  }
  return { openai: options };
}

/**
 * Helper for distillation
 * UNIQUE TO OPENAI: store and storeName for model training data
 *
 * KEEP REASON: OpenAI has unique distillation system with 'store' and 'storeName'.
 * AI SDK v5 doesn't know about OpenAI's distillation/fine-tuning data collection.
 * This is OpenAI-specific model training data storage feature.
 */
function withDistillation(enabled: boolean = true, metadata?: Record<string, string>) {
  const options: OpenAIProviderOptions & { storeName?: string } = {
    store: enabled,
    storeName: enabled ? 'default' : undefined,
  };
  if (metadata) {
    options.metadata = metadata;
  }
  return { openai: options };
}

/**
 * Helper for service tier
 * UNIQUE TO OPENAI: serviceTier for latency/cost tradeoffs
 *
 * KEEP REASON: OpenAI has unique 'serviceTier' parameter with 'flex' and 'priority' options.
 * AI SDK v5 doesn't know about OpenAI's service tier pricing/latency system.
 * This is OpenAI-specific performance and cost optimization feature.
 */
export function withServiceTier(tier: 'auto' | 'flex' | 'priority' | 'default' = 'auto') {
  return {
    openai: {
      serviceTier: tier,
    },
  };
}

/**
 * Helper for text verbosity
 * UNIQUE TO OPENAI: textVerbosity parameter for response length control
 *
 * KEEP REASON: OpenAI has unique 'textVerbosity' parameter for response length.
 * AI SDK v5 doesn't know about OpenAI's verbosity control system.
 * This is OpenAI-specific response length optimization feature.
 */
function withVerbosity(
  style: 'low' | 'medium' | 'high' | 'concise' | 'balanced' | 'verbose' = 'medium',
) {
  // Map legacy names to new format
  const verbosityMap = {
    concise: 'low',
    balanced: 'medium',
    verbose: 'high',
  };

  const textVerbosity = (verbosityMap as Record<string, string>)[style] || style;

  return {
    openai: {
      textVerbosity,
    },
  };
}

/**
 * Helper for audio generation
 * UNIQUE TO OPENAI: voice, speed, and instructions for TTS models
 *
 * KEEP REASON: OpenAI TTS has unique voice selection and speed parameters.
 * AI SDK v5 doesn't know about OpenAI's TTS voice and speed settings.
 * This is OpenAI-specific audio generation configuration.
 */
function withAudioOutput(voice: string = 'alloy', speed: number = 1.0, instructions?: string) {
  const options: any = {
    audio: { voice, speed },
  };
  if (instructions) {
    options.instructions = instructions;
  }
  return { openai: options };
}

/**
 * Helper for audio transcription
 * UNIQUE TO OPENAI: timestampGranularities and Whisper-specific options
 *
 * KEEP REASON: OpenAI Whisper has unique 'timestampGranularities' parameter.
 * AI SDK v5 doesn't know about OpenAI's timestamp granularity options.
 * This is OpenAI-specific transcription configuration.
 */
function withTranscriptionOptions(options: {
  language?: string;
  prompt?: string;
  temperature?: number;
  timestampGranularities?: ('word' | 'segment')[];
}) {
  const openaiOptions: JSONObject = {};

  if (options.language !== undefined) {
    openaiOptions.language = options.language;
  }

  if (options.prompt !== undefined) {
    openaiOptions.prompt = options.prompt;
  }

  if (options.timestampGranularities !== undefined) {
    openaiOptions.timestampGranularities = options.timestampGranularities;
  }

  const result: { openai: JSONObject; temperature?: number } = { openai: openaiOptions };

  if (options.temperature !== undefined) {
    result.temperature = options.temperature;
  }

  return result;
}

/**
 * Helper for image generation
 * UNIQUE TO OPENAI: size and quality parameters for DALL-E models
 *
 * KEEP REASON: OpenAI DALL-E has unique size and quality parameters.
 * AI SDK v5 doesn't know about OpenAI's image generation size/quality options.
 * This is OpenAI-specific image generation configuration.
 */
function withImageGeneration(
  size:
    | '256x256'
    | '512x512'
    | '1024x1024'
    | '1792x1024'
    | '1024x1792'
    | '1536x1024'
    | '1024x1536' = '1024x1024',
  quality: 'standard' | 'hd' | 'high' = 'standard',
) {
  // Map 'high' to 'hd' for consistency
  const mappedQuality = quality === 'high' ? 'hd' : quality;
  return {
    openai: {
      size,
      quality: mappedQuality,
    },
  };
}

/**
 * Helper for image detail level
 * UNIQUE TO OPENAI: imageDetail parameter for vision model processing
 *
 * KEEP REASON: OpenAI vision models have unique 'imageDetail' parameter.
 * AI SDK v5 doesn't know about OpenAI's image detail processing levels.
 * This is OpenAI-specific vision model configuration.
 */
function withImageDetail(detail: 'low' | 'high' | 'auto' = 'auto') {
  return {
    openai: {
      imageDetail: detail,
    },
  };
}

/**
 * Helper for strict mode
 * UNIQUE TO OPENAI: strict parameter for structured output validation
 *
 * KEEP REASON: OpenAI has unique 'strict' parameter for structured outputs.
 * AI SDK v5 doesn't know about OpenAI's strict validation mode.
 * This is OpenAI-specific structured output enforcement.
 */
export function withStrictMode(enabled: boolean = true) {
  return {
    openai: {
      strict: enabled,
    },
  };
}

/**
 * Helper for custom instructions
 * UNIQUE TO OPENAI: instructions parameter for system-level guidance
 *
 * KEEP REASON: OpenAI has unique 'instructions' parameter for system guidance.
 * AI SDK v5 doesn't know about OpenAI's instructions parameter.
 * This is OpenAI-specific system instruction configuration.
 */
function withInstructions(instructions: string) {
  return {
    openai: {
      instructions,
    },
  };
}

/**
 * Configuration presets for OpenAI-specific use cases
 * UNIQUE TO OPENAI: Presets optimized for OpenAI's specific features
 *
 * KEEP REASON: These combine generic settings WITH OpenAI-specific parameters.
 * serviceTier, reasoningEffort, and responseFormat are OpenAI-unique features.
 * These presets provide value by combining shared modes with OpenAI-specific options.
 */
export const OPENAI_PRESETS = {
  /**
   * Fast mode for quick responses - combines shared quick mode with OpenAI's flex tier
   */
  FAST: {
    ...commonModes.quick(),
    openai: {
      serviceTier: 'flex', // OpenAI-specific cost optimization
    },
  },

  /**
   * Accurate mode for factual responses - combines shared precise mode with priority tier
   */
  ACCURATE: {
    ...commonModes.precise(),
    openai: {
      serviceTier: 'priority', // OpenAI-specific performance optimization
    },
  },

  /**
   * Creative mode for imaginative content - uses shared creative mode
   */
  CREATIVE: {
    ...commonModes.creative(),
    frequencyPenalty: 0.5,
    presencePenalty: 0.5,
  },

  /**
   * Reasoning mode for complex problem solving - OpenAI reasoning models
   */
  REASONING: {
    ...commonModes.research(),
    maxOutputTokens: 30000,
    openai: {
      reasoningEffort: 'high', // OpenAI-specific reasoning parameter
      reasoningSummary: 'auto', // OpenAI-specific debugging feature
    },
  },

  /**
   * Coding mode for programming tasks - combines code mode with OpenAI features
   */
  CODING: {
    ...commonModes.code(),
    maxOutputTokens: 8192,
    openai: {
      responseFormat: { type: 'json_object' }, // OpenAI-specific structured output
      logprobs: true, // OpenAI-specific debugging feature
      topLogprobs: 3,
    },
  },
} as const;

// Testing-only export to exercise internal helpers without exposing them as API
export const __test = {
  withCompatibilityMode,
  withReasoningSummary,
  withFunctionCalling,
  withUserIdentification,
  withLogitBias,
  withMetadata,
  withPreviousResponseId,
  withInclude,
  withLogprobs,
  withAudioOutput,
  withTranscriptionOptions,
  withImageGeneration,
  withImageDetail,
  withInstructions,
  withVerbosity,
  // internal capability checks
  supportsNativeTools,
  supportsPredictedOutputs,
  withDistillation,
} as const;

// Token utilities REMOVED for DRY compliance
// REASON: These are generic utilities, not OpenAI-specific features.
// Token estimation, cost calculation, and context windows are generic patterns.
// Use shared utility packages for these features instead.

// Error handling helpers REMOVED for DRY compliance
// REASON: These are generic error handling patterns, not OpenAI-specific.
// Retry strategies and fallback models are generic patterns.
// Use shared error handling packages for these features instead.

/**
 * OPENAI-UNIQUE RESPONSE PROCESSING
 *
 * KEEP REASON: These are OpenAI-unique response structures and metadata.
 * AI SDK v5 doesn't standardize provider-specific metadata formats.
 */

/**
 * Extract reasoning tokens from OpenAI reasoning models
 * UNIQUE TO OPENAI: Reasoning models return reasoning token usage
 *
 * KEEP REASON: OpenAI reasoning models return unique 'reasoningTokens' usage.
 * AI SDK v5 doesn't know about OpenAI's reasoning token counting.
 */
export function extractReasoningTokens(result: GenerationResult): number | undefined {
  const tokens = result.providerOptions?.openai?.reasoningTokens;
  return typeof tokens === 'number' ? tokens : undefined;
}

/**
 * Extract cached prompt tokens from OpenAI responses
 * UNIQUE TO OPENAI: Prompt caching returns cache hit token counts
 *
 * KEEP REASON: OpenAI's prompt caching returns 'cachedPromptTokens' usage.
 * AI SDK v5 doesn't standardize cache hit metrics across providers.
 */
export function extractCachedPromptTokens(result: GenerationResult): number | undefined {
  const tokens = result.providerOptions?.openai?.cachedPromptTokens;
  return typeof tokens === 'number' ? tokens : undefined;
}

/**
 * Extract prediction tokens from OpenAI predicted outputs
 * UNIQUE TO OPENAI: Predicted outputs return accepted/rejected token counts
 *
 * KEEP REASON: OpenAI's predicted outputs feature returns unique token metrics.
 * AI SDK v5 doesn't know about OpenAI's prediction token counting.
 */
export function extractPredictionTokens(
  result: GenerationResult,
): { accepted?: number; rejected?: number } | undefined {
  const metadata = result.providerOptions?.openai;
  if (!metadata) return undefined;

  const accepted = metadata.acceptedPredictionTokens;
  const rejected = metadata.rejectedPredictionTokens;

  return {
    accepted: typeof accepted === 'number' ? accepted : undefined,
    rejected: typeof rejected === 'number' ? rejected : undefined,
  };
}

/**
 * Extract complete OpenAI provider metadata
 * Comprehensive extraction of all OpenAI-specific data
 *
 * KEEP REASON: Combines all OpenAI-specific metadata in one function.
 * Structure is unique to OpenAI's response format and features.
 */
export function extractOpenAIMetadata(result: GenerationResult): OpenAIMetadata | null {
  const openaiMeta = result.providerOptions?.openai;
  if (!openaiMeta || typeof openaiMeta !== 'object' || Array.isArray(openaiMeta)) return null;

  const meta = openaiMeta as JSONObject;

  return {
    responseId: typeof meta.responseId === 'string' ? meta.responseId : undefined,
    reasoningTokens: typeof meta.reasoningTokens === 'number' ? meta.reasoningTokens : undefined,
    cachedPromptTokens:
      typeof meta.cachedPromptTokens === 'number' ? meta.cachedPromptTokens : undefined,
    acceptedPredictionTokens:
      typeof meta.acceptedPredictionTokens === 'number' ? meta.acceptedPredictionTokens : undefined,
    rejectedPredictionTokens:
      typeof meta.rejectedPredictionTokens === 'number' ? meta.rejectedPredictionTokens : undefined,
    logprobs: meta.logprobs as OpenAIMetadata['logprobs'],
  };
}

// Configuration builders REMOVED for DRY compliance
// REASON: These combine generic patterns, not OpenAI-specific features.
// RAG, chat, and content generation configurations are generic use cases.
// Use shared configuration patterns and compose them as needed.

// Provider option types REMOVED for DRY compliance
// REASON: These were just generic type wrappers without OpenAI-specific value.
// AI SDK v5 provides native OpenAI types. Use AI SDK v5 native provider option types or inline types as needed.
// For OpenAI-specific parameters, use the helper functions that return direct objects.

/**
 * OpenAI-specific metadata type - unique response data
 */
export interface OpenAIMetadata {
  responseId?: string;
  reasoningTokens?: number;
  cachedPromptTokens?: number;
  acceptedPredictionTokens?: number;
  rejectedPredictionTokens?: number;
  logprobs?: Array<{
    token: string;
    logprob: number;
    bytes?: number[];
    top_logprobs?: Array<{
      token: string;
      logprob: number;
      bytes?: number[];
    }>;
  }>;
}

/**
 * OPENAI-UNIQUE CAPABILITY DETECTION
 */

/**
 * Check if model supports reasoning mode
 * UNIQUE TO OPENAI: Reasoning models with reasoningEffort parameter
 *
 * KEEP REASON: This checks for OpenAI's specific reasoning model capabilities.
 * AI SDK v5 can't know which OpenAI models support reasoningEffort parameter.
 */
export function supportsReasoningMode(modelId: string): boolean {
  return OPENAI_MODEL_GROUPS.REASONING_MODELS.includes(
    modelId as (typeof OPENAI_MODEL_GROUPS.REASONING_MODELS)[number],
  );
}

/**
 * Check if model supports service tier selection
 * UNIQUE TO OPENAI: Service tier parameter for dedicated capacity
 *
 * KEEP REASON: OpenAI's service tier system is unique to their platform.
 * AI SDK v5 doesn't know about OpenAI's tier-based capacity allocation.
 */
export function supportsServiceTier(modelId: string): boolean {
  // Most chat models support service tiers, reasoning models typically don't
  const isReasoning = OPENAI_MODEL_GROUPS.REASONING_MODELS.includes(
    modelId as (typeof OPENAI_MODEL_GROUPS.REASONING_MODELS)[number],
  );

  // Combine sets to avoid short-circuit branch ambiguity for coverage
  const supported =
    OPENAI_MODEL_GROUPS.CHAT_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.CHAT_MODELS)[number],
    ) ||
    OPENAI_MODEL_GROUPS.VISION_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.VISION_MODELS)[number],
    );

  return !isReasoning && supported;
}

/**
 * Check if model supports structured outputs
 * UNIQUE TO OPENAI: Structured output with strict validation
 *
 * KEEP REASON: OpenAI's structured outputs have unique 'strict' parameter.
 * AI SDK v5 handles generic structured outputs, but not OpenAI's strict mode.
 */
export function supportsStructuredOutputs(modelId: string): boolean {
  // Most modern OpenAI models support structured outputs
  return (
    OPENAI_MODEL_GROUPS.CHAT_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.CHAT_MODELS)[number],
    ) ||
    OPENAI_MODEL_GROUPS.VISION_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.VISION_MODELS)[number],
    )
  );
}

/**
 * Check if model supports native tools
 * UNIQUE TO OPENAI: Native browser, python, dalle tools
 *
 * KEEP REASON: OpenAI's native tools are unique to their platform.
 * AI SDK v5 handles custom tools, but not OpenAI's built-in native tools.
 */
function supportsNativeTools(modelId: string): boolean {
  return (
    OPENAI_MODEL_GROUPS.CHAT_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.CHAT_MODELS)[number],
    ) ||
    OPENAI_MODEL_GROUPS.VISION_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.VISION_MODELS)[number],
    )
  );
}

/**
 * Check if model supports prompt caching
 * UNIQUE TO OPENAI: Prompt caching with cached token metrics
 *
 * KEEP REASON: OpenAI's prompt caching returns unique cached token metrics.
 * AI SDK v5 doesn't know about OpenAI's cached token counting system.
 */
export function supportsPromptCaching(modelId: string): boolean {
  // Most OpenAI models support prompt caching
  return !OPENAI_MODEL_GROUPS.LEGACY_MODELS.includes(
    modelId as (typeof OPENAI_MODEL_GROUPS.LEGACY_MODELS)[number],
  );
}

/**
 * Check if model supports predicted outputs
 * UNIQUE TO OPENAI: Predicted outputs with accepted/rejected token metrics
 *
 * KEEP REASON: OpenAI's predicted outputs feature is unique to their platform.
 * Returns accepted/rejected prediction token counts not found elsewhere.
 */
function supportsPredictedOutputs(modelId: string): boolean {
  // Newer chat models typically support predicted outputs
  return (
    OPENAI_MODEL_GROUPS.CHAT_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.CHAT_MODELS)[number],
    ) &&
    !OPENAI_MODEL_GROUPS.LEGACY_MODELS.includes(
      modelId as (typeof OPENAI_MODEL_GROUPS.LEGACY_MODELS)[number],
    )
  );
}

// buildProviderOptions REMOVED for DRY compliance
// REASON: This was a generic helper wrapper, not OpenAI-specific.
// Users should compose provider options directly using helper functions or direct objects.
// Also fixes runtime error from undefined defaultSettingsMiddleware reference.

// Model capabilities REMOVED for DRY compliance
// REASON: AI SDK v5 detects model capabilities natively.
// Generic capabilities (imageInput, objectGeneration, toolUsage) are handled by AI SDK v5.
// Use AI SDK v5's native capability detection instead of hardcoded maps.

// Generic type exports REMOVED for DRY compliance
// REASON: OpenAIProviderSettings was just Record<string, any> - not OpenAI-specific.
// Use AI SDK v5 native types or specific OpenAI types defined in this module.

/**
 * USAGE EXAMPLES - OpenAI-Unique Features with AI SDK v5 Patterns
 *
 * Basic text generation (AI SDK v5 pattern):
 * ```typescript
 * const { text } = await generateText({
 *   model: openai('gpt-5'),  // Direct AI SDK v5 pattern
 *   prompt: 'Write a story about...',
 * });
 * ```
 *
 * Custom provider instance:
 * ```typescript
 * const customOpenAI = createOpenAI({
 *   apiKey: 'custom-key',
 *   organization: 'org-id',
 *   project: 'project-id',
 * });
 * const result = await generateText({
 *   model: customOpenAI('gpt-5'),
 *   prompt: 'Hello world',
 * });
 * ```
 *
 * Responses API with reasoning (OpenAI-unique):
 * ```typescript
 * const result = await generateText({
 *   model: openai.responses('gpt-5'),  // AI SDK v5 native method
 *   prompt: 'Complex problem solving...',
 *   providerOptions: {
 *     ...withReasoningMode(30000, 'high'),       // Direct object
 *     ...withReasoningSummary('detailed'),       // Direct object
 *   },
 * });
 * ```
 *
 * Image generation (AI SDK v5 pattern):
 * ```typescript
 * const result = await generateImage({
 *   model: openai.image('dall-e-3'),  // AI SDK v5 native method
 *   prompt: 'A beautiful sunset over mountains',
 *   providerOptions: withImageGeneration('1792x1024', 'hd'),  // Direct object
 * });
 * ```
 *
 * Speech generation (AI SDK v5 pattern):
 * ```typescript
 * const result = await generateSpeech({
 *   model: openai.speech('tts-1-hd'),  // AI SDK v5 native method
 *   text: 'Hello world',
 *   providerOptions: withAudioOutput('nova', 1.2, 'Speak slowly'),  // Direct object
 * });
 * ```
 *
 * Transcription with OpenAI-specific options:
 * ```typescript
 * const result = await transcribe({
 *   model: openai.transcription('whisper-1'),  // AI SDK v5 native method
 *   audio: audioBuffer,
 *   providerOptions: withTranscriptionOptions({
 *     language: 'en',
 *     timestampGranularities: ['word', 'segment'],  // OpenAI-unique feature
 *   }),
 * });
 * ```
 *
 * Native OpenAI tools (AI SDK v5 native support):
 * ```typescript
 * const result = await generateText({
 *   model: openai('gpt-5'),  // AI SDK v5 pattern
 *   prompt: 'Search for latest AI developments',
 *   tools: {
 *     webSearch: openai.tools.webSearchPreview,   // Native AI SDK v5 tool
 *     fileSearch: openai.tools.fileSearch,         // Native AI SDK v5 tool
 *     codeInterp: openai.tools.codeInterpreter,    // Native AI SDK v5 tool
 *   },
 * });
 *
 * // Note: Unlike Perplexity which needs custom helpers for provider options,
 * // OpenAI tools are fully implemented in AI SDK v5 with complete execution logic
 * ```
 *
 * Structured output with OpenAI strict mode:
 * ```typescript
 * const result = await generateObject({
 *   model: openai('gpt-5'),  // AI SDK v5 pattern
 *   schema: z.object({ name: z.string(), age: z.number() }),
 *   providerOptions: withStructuredOutput('json_schema', true),  // OpenAI strictJsonSchema
 * });
 * ```
 *
 * Conversation continuation (Responses API):
 * ```typescript
 * const result = await generateText({
 *   model: openai.responses('gpt-5'),  // AI SDK v5 native method
 *   prompt: 'Continue our discussion...',
 *   providerOptions: withPreviousResponseId('resp_123', 'Updated context'),
 * });
 * ```
 *
 * Combining multiple OpenAI-unique features:
 * ```typescript
 * const result = await generateText({
 *   model: openai('gpt-5'),  // AI SDK v5 pattern
 *   prompt: 'Analyze this complex dataset...',
 *   providerOptions: {
 *     ...withLogprobs(true, 3),                    // OpenAI token debugging
 *     ...withUserIdentification('user-123'),       // OpenAI abuse monitoring
 *     ...withMetadata({ type: 'analysis' }),       // OpenAI request metadata
 *     ...withPromptCache(true, 'cache-key-123'),   // OpenAI caching system
 *     ...withServiceTier('priority'),              // OpenAI performance tier
 *     ...withVerbosity('low'),                     // OpenAI response length control
 *   },
 * });
 * ```
 *
 * Direct provider options (alternative to helpers):
 * ```typescript
 * const result = await generateText({
 *   model: openai('gpt-5'),
 *   prompt: 'Generate structured data...',
 *   providerOptions: {
 *     openai: {
 *       strictJsonSchema: true,    // Direct OpenAI parameter
 *       serviceTier: 'flex',       // Direct OpenAI parameter
 *       logprobs: true,           // Direct OpenAI parameter
 *       reasoningEffort: 'high',  // Direct OpenAI parameter
 *     }
 *   }
 * });
 * ```
 */
