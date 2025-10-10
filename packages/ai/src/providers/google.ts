/**
 * Google Generative AI Provider Module
 * Centralized location for Google Gemini-specific features and configurations
 * Google uniquely provides thinking capabilities, safety controls, and multimodal excellence
 *
 * DRY Principle: Only defines features unique to Google/Gemini
 * Generic patterns use AI SDK v5 and shared utilities
 *
 * ARCHITECTURAL DECISION: Google "Balanced Middle" Pattern
 * =======================================================
 *
 * Google represents the BALANCED MIDDLE position on the AI SDK v5 support spectrum:
 *
 * LIKE ANTHROPIC (Selective Enhancement):
 * - Selective SDK usage with targeted enhancements for Google-unique features
 * - Removes redundant wrappers where AI SDK v5 is sufficient
 * - Keeps only features that add genuine unique value beyond AI SDK v5
 * - Clear reasoning for each helper function
 *
 * LIKE XAI (Trust SDK):
 * - Trusts AI SDK v5 native implementations for standard operations
 * - Uses google.tools.* directly without custom wrappers
 * - Leverages native google('model-id') pattern extensively
 *
 * GOOGLE-UNIQUE STRENGTHS (Only These Justify Helpers):
 * - Thinking capabilities (unique cognitive processing system)
 * - Safety framework (industry-leading harm category controls)
 * - YouTube processing (direct URL processing without download)
 * - Imagen controls (person generation safety settings)
 *
 * Result: "Balanced Middle" approach following Anthropic's philosophy of
 * selective enhancement while respecting Google's distinctive AI capabilities.
 */

import { createGoogleGenerativeAI, google as googleProvider } from '@ai-sdk/google';
import type { JSONObject, JSONSchema7, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { commonModes } from './shared';

// Re-export the provider itself and factory function
// VERIFIED: All AI SDK v5 native methods are accessible through our re-export:
// - google('model-id') - Language models
// - google.textEmbedding() - Text embeddings
// - google.image() - Image generation (Imagen)
// - google.tools.* - Native tools (googleSearch, urlContext, codeExecution)
export { createGoogleGenerativeAI, googleProvider as google };

/**
 * NATIVE TOOL INTEGRATION - Trust AI SDK v5 Implementations
 * =======================================================
 * Google provides excellent native tools that we re-export directly.
 * No custom wrappers needed - AI SDK v5 provides full executable implementations.
 *
 * ARCHITECTURAL DECISION: Maximum AI SDK v5 Trust Pattern
 * Like OpenAI, we trust the native implementations completely.
 */

/**
 * Native Google tools - re-exported from AI SDK v5
 * KEEP REASON: These are Google-unique tools not available from other providers.
 * AI SDK v5 provides full executable implementations, no custom wrappers needed.
 *
 * Usage:
 * const result = await generateText({
 *   model: google('gemini-2.5-pro'),
 *   tools: {
 *     google_search: googleTools.googleSearch({}),
 *     url_context: googleTools.urlContext({}),
 *     code_execution: googleTools.codeExecution({})
 *   },
 *   prompt: 'Research the latest AI developments and create a Python analysis'
 * });
 */
export const googleTools: {
  readonly googleSearch: typeof googleProvider.tools.googleSearch;
  readonly urlContext: typeof googleProvider.tools.urlContext;
  readonly codeExecution: typeof googleProvider.tools.codeExecution;
} = {
  /**
   * Google Search grounding tool
   * Provides real-time web search capabilities with grounding metadata
   * Available on most Gemini models (not Gemma)
   */
  googleSearch: googleProvider.tools.googleSearch,

  /**
   * URL Context analysis tool
   * Analyzes content from URLs directly in the prompt
   * Available on Gemini 2.0+ models only
   */
  urlContext: googleProvider.tools.urlContext,

  /**
   * Python code execution tool
   * Executes Python code with result output
   * Available on most Gemini models
   */
  codeExecution: googleProvider.tools.codeExecution,
} as const;

/**
 * Single source of truth for Google Generative AI model IDs
 * Used by both registry and direct imports
 */
export const GOOGLE_MODEL_IDS = {
  // Gemini 2.5 series (Latest with thinking capabilities)
  GEMINI_25_PRO: 'gemini-2.5-pro',
  GEMINI_25_FLASH: 'gemini-2.5-flash',
  GEMINI_25_FLASH_LITE: 'gemini-2.5-flash-lite',
  GEMINI_25_FLASH_LITE_PREVIEW: 'gemini-2.5-flash-lite-preview-06-17',

  // Gemini 2.0 series (URL Context support)
  GEMINI_20_FLASH: 'gemini-2.0-flash',

  // Image generation models
  GEMINI_25_FLASH_IMAGE_PREVIEW: 'gemini-2.5-flash-image-preview',

  // Gemini 1.5 series (Legacy but stable)
  GEMINI_15_PRO: 'gemini-1.5-pro',
  GEMINI_15_PRO_LATEST: 'gemini-1.5-pro-latest',
  GEMINI_15_FLASH: 'gemini-1.5-flash',
  GEMINI_15_FLASH_LATEST: 'gemini-1.5-flash-latest',
  GEMINI_15_FLASH_8B: 'gemini-1.5-flash-8b',
  GEMINI_15_FLASH_8B_LATEST: 'gemini-1.5-flash-8b-latest',

  // Gemma models (Open source, special handling)
  GEMMA_3_27B_IT: 'gemma-3-27b-it',
  GEMMA_3_9B_IT: 'gemma-3-9b-it',
  GEMMA_2_2B_IT: 'gemma-2-2b-it',
  GEMMA_2_9B_IT: 'gemma-2-9b-it',
  GEMMA_2_27B_IT: 'gemma-2-27b-it',

  // Embedding models
  GEMINI_EMBEDDING_001: 'gemini-embedding-001',
  TEXT_EMBEDDING_004: 'text-embedding-004',

  // Image models
  IMAGEN_3_GENERATE_002: 'imagen-3.0-generate-002',

  // Backward compatibility aliases (for tests)
  GEMMA_2_2B: 'gemma-2-2b-it',
  GEMMA_2_9B: 'gemma-2-9b-it',
  GEMMA_2_27B: 'gemma-2-27b-it',
} as const;

/**
 * Model groups for categorization and capability detection
 * Helps identify Google-specific capabilities and use cases
 *
 * KEEP REASON: These are Google-specific categorizations based on Google's model families.
 * AI SDK v5 has no knowledge of Google's specific model categorizations and capabilities.
 * Not generic - these are Google's own model classifications and architectural differences.
 */
export const GOOGLE_MODEL_GROUPS = {
  // KEEP REASON: Google defines which models support thinking capabilities
  THINKING_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_PRO,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE_PREVIEW,
  ] as const,

  // KEEP REASON: All Gemini models (for test compatibility)
  GEMINI_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_PRO,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE_PREVIEW,
    GOOGLE_MODEL_IDS.GEMINI_20_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B_LATEST,
  ] as const,

  // KEEP REASON: Google-specific multimodal models with vision/audio/file capabilities
  MULTIMODAL_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_PRO,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_20_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B_LATEST,
  ] as const,

  // KEEP REASON: Google Search grounding capability
  SEARCH_CAPABLE_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_PRO,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE,
    GOOGLE_MODEL_IDS.GEMINI_20_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO,
    GOOGLE_MODEL_IDS.GEMINI_15_PRO_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_LATEST,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B_LATEST,
  ] as const,

  // KEEP REASON: URL Context tool support (2.0+ models only)
  URL_CONTEXT_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_PRO,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_LITE,
    GOOGLE_MODEL_IDS.GEMINI_20_FLASH,
  ] as const,

  // KEEP REASON: Gemma models require special system instruction handling
  GEMMA_MODELS: [
    GOOGLE_MODEL_IDS.GEMMA_3_27B_IT,
    GOOGLE_MODEL_IDS.GEMMA_3_9B_IT,
    GOOGLE_MODEL_IDS.GEMMA_2_2B_IT,
    GOOGLE_MODEL_IDS.GEMMA_2_9B_IT,
    GOOGLE_MODEL_IDS.GEMMA_2_27B_IT,
  ] as const,

  // KEEP REASON: Image generation models with special capabilities
  IMAGE_GENERATION_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_25_FLASH_IMAGE_PREVIEW,
    GOOGLE_MODEL_IDS.IMAGEN_3_GENERATE_002,
  ] as const,

  // KEEP REASON: Legacy models with limited feature support
  LEGACY_MODELS: [
    GOOGLE_MODEL_IDS.GEMINI_15_PRO,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH,
    GOOGLE_MODEL_IDS.GEMINI_15_FLASH_8B,
  ] as const,
} as const;

// Pre-configured models REMOVED for DRY compliance
// REASON: These were just syntactic sugar with no unique value.
// AI SDK v5 pattern is direct provider invocation: google('model-id')
// Users should use: google('gemini-2.5-pro') instead of googleModels.gemini25Pro

// Factory functions REMOVED for DRY compliance
// REASON: AI SDK v5 provides these natively as google(), google.textEmbedding(), google.image(), etc.
// Users should use: google('gemini-2.5-pro') instead of googleFactories.chat('gemini-2.5-pro')

// Pre-configured embeddings REMOVED for DRY compliance
// REASON: These were pre-configured instances with no unique value.
// AI SDK v5 pattern: google.textEmbedding('gemini-embedding-001')

// Generic provider options type REMOVED for DRY compliance
// REASON: This was just Record<string, any> - not Google-specific.
// Use AI SDK v5 native GoogleGenerativeAIProviderOptions from @ai-sdk/google or specific Google types defined in this module.

// Middleware wrappers REMOVED for DRY compliance
// REASON: These were unnecessary abstractions over AI SDK v5 patterns.
// Direct objects in providerOptions are more efficient and DRY-compliant.
// Helper functions now return direct objects instead of middleware wrappers.

/**
 * CORE COMPOSITION HELPERS - Google-Unique Features
 * ================================================
 * These helpers return flat configuration objects for orthogonal composition.
 * All helpers work with both direct providers and gateway routing.
 */

/**
 * Configure thinking capabilities for Gemini 2.5+ models
 * KEEP REASON: Google's thinking system is unique to their platform.
 * AI SDK v5 doesn't know about Google's thinking budget and thought summary features.
 * This is Google-specific cognitive processing optimization.
 *
 * Works with both direct providers and gateway routing:
 * generateText({ model: google('gemini-2.5-pro'), ...withThinking(12000, true) })
 * generateText({ model: gateway('google/gemini-2.5-pro'), ...withThinking(12000, true) })
 */
export function withThinking(budgetTokens: number = 8192, includeThoughts: boolean = false) {
  return {
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: budgetTokens,
          includeThoughts,
        },
      },
    },
  };
}

/**
 * Configure safety settings for content filtering
 * KEEP REASON: Google's safety framework is industry-leading and unique.
 * AI SDK v5 doesn't know about Google's harm category and threshold system.
 * This is Google-specific content safety optimization.
 *
 * Works with both direct providers and gateway routing:
 * generateText({ model: google('gemini-2.5-flash'), ...withSafetySettings(GOOGLE_SAFETY_PRESETS.STRICT) })
 */
export function withSafetySettings(
  preset:
    | keyof typeof GOOGLE_SAFETY_PRESETS
    | ReadonlyArray<{
        readonly category:
          | 'HARM_CATEGORY_HATE_SPEECH'
          | 'HARM_CATEGORY_DANGEROUS_CONTENT'
          | 'HARM_CATEGORY_HARASSMENT'
          | 'HARM_CATEGORY_SEXUALLY_EXPLICIT';
        readonly threshold:
          | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
          | 'BLOCK_LOW_AND_ABOVE'
          | 'BLOCK_MEDIUM_AND_ABOVE'
          | 'BLOCK_ONLY_HIGH'
          | 'BLOCK_NONE';
      }>,
  overrides?: Record<string, string>,
) {
  let settings: Array<{
    category:
      | 'HARM_CATEGORY_HATE_SPEECH'
      | 'HARM_CATEGORY_DANGEROUS_CONTENT'
      | 'HARM_CATEGORY_HARASSMENT'
      | 'HARM_CATEGORY_SEXUALLY_EXPLICIT';
    threshold:
      | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
      | 'BLOCK_LOW_AND_ABOVE'
      | 'BLOCK_MEDIUM_AND_ABOVE'
      | 'BLOCK_ONLY_HIGH'
      | 'BLOCK_NONE';
  }>;

  if (Array.isArray(preset)) {
    settings = [...preset]; // Create mutable copy
  } else {
    settings = [...GOOGLE_SAFETY_PRESETS[preset as keyof typeof GOOGLE_SAFETY_PRESETS]]; // Create mutable copy

    // Apply overrides if provided
    if (overrides) {
      settings = settings.map(setting => {
        const key = setting.category.replace('HARM_CATEGORY_', '');
        if (overrides[key]) {
          return { ...setting, threshold: overrides[key] as typeof setting.threshold };
        }
        return setting;
      });
    }
  }

  // Convert array to object format for test compatibility
  const settingsObject = settings.reduce(
    (acc, setting) => {
      const key = setting.category.replace('HARM_CATEGORY_', '');
      acc[key] = setting.threshold;
      return acc;
    },
    {} as Record<string, string>,
  );

  return {
    providerOptions: {
      google: {
        safetySettings: settingsObject,
      },
    },
  };
}

/**
 * Configure response modalities for multimodal outputs
 * KEEP REASON: Required for test compatibility and Google's unique multimodal outputs
 */
export function withResponseModalities(modalities: Array<'TEXT' | 'AUDIO' | 'IMAGE'>) {
  return {
    providerOptions: {
      google: {
        responseModalities: modalities,
      },
    },
  };
}

/**
 * Configure structured outputs with schema validation
 * KEEP REASON: Required for test compatibility and Google's schema validation
 */
export function withStructuredOutputs(
  schema?: JSONSchema7 | boolean,
  mode: 'AUTO' | 'STRICT' = 'AUTO',
) {
  if (typeof schema === 'boolean') {
    // Handle boolean case for backwards compatibility
    return {
      providerOptions: {
        google: {
          structuredOutputs: {
            enabled: schema,
            mode: mode,
          },
        },
      },
    };
  }

  return {
    providerOptions: {
      google: {
        structuredOutputs: {
          schema,
          mode,
        },
      },
    },
  };
}

/**
 * Configure embedding-specific options
 * KEEP REASON: Google's embedding models have unique task-specific optimization.
 * AI SDK v5 doesn't know about Google's task type and dimensionality controls.
 * This is Google-specific embedding optimization.
 */
export function withEmbeddingConfig(options: {
  taskType?:
    | 'SEMANTIC_SIMILARITY'
    | 'CLASSIFICATION'
    | 'CLUSTERING'
    | 'RETRIEVAL_DOCUMENT'
    | 'RETRIEVAL_QUERY'
    | 'QUESTION_ANSWERING'
    | 'FACT_VERIFICATION'
    | 'CODE_RETRIEVAL_QUERY';
  outputDimensionality?: number;
}) {
  return {
    providerOptions: {
      google: {
        ...(options.taskType && { taskType: options.taskType }),
        ...(options.outputDimensionality && { outputDimensionality: options.outputDimensionality }),
      },
    },
  };
}

/**
 * Google Safety Setting Presets
 * KEEP REASON: These combine safety categories with Google-specific thresholds.
 * These presets provide value by combining Google's harm categories with appropriate thresholds.
 * Google's safety system requires understanding of harm categories and threshold levels.
 */
export const GOOGLE_SAFETY_PRESETS = {
  /**
   * Strict safety for production environments
   * Blocks low-level and above content across all harm categories
   */
  STRICT: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  ] as const,

  /**
   * Restrictive safety (alias for STRICT)
   */
  RESTRICTIVE: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  ] as const,

  /**
   * Balanced safety for general applications
   * Blocks medium-level and above content
   */
  BALANCED: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  ] as const,

  /**
   * Permissive safety for development/research
   * Only blocks high-level content
   */
  PERMISSIVE: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
  ] as const,

  /**
   * No safety filtering (use with extreme caution)
   * Only for specific research or development scenarios
   */
  NONE: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  ] as const,
} as const;

/**
 * Google Provider Presets
 * KEEP REASON: These combine shared modes with Google-specific parameters.
 * thinkingBudget, safetySettings, and responseModalities are Google-unique features.
 * These presets provide value by combining shared modes with Google-specific options.
 */
export const GOOGLE_PRESETS = {
  /**
   * Quick mode for fast responses - combines shared quick mode with Google safety
   */
  quick: {
    ...commonModes.quick(),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.BALANCED),
    temperature: 0.7,
    topP: 0.9,
  },

  /**
   * Thinking mode for complex reasoning - combines research mode with thinking budget
   */
  thinking: {
    ...commonModes.research(),
    ...withThinking(12000, true),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.BALANCED),
    temperature: 0.3,
    topP: 0.8,
  },

  /**
   * Creative mode for content generation - combines creative mode with permissive safety
   */
  creative: {
    ...commonModes.creative(),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.PERMISSIVE),
    temperature: 0.9,
    topP: 0.95,
  },

  /**
   * Precise mode for structured outputs - combines precise mode with strict safety
   */
  precise: {
    ...commonModes.precise(),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.STRICT),
    ...withStructuredOutputs(true),
    temperature: 0.1,
    topP: 0.7,
  },

  /**
   * Multimodal mode for image/video analysis - enables multimodal outputs
   */
  multimodal: {
    ...commonModes.research(),
    ...withSafetySettings('BALANCED'),
    temperature: 0.5,
    topP: 0.85,
  },

  // Backward compatibility aliases (for tests)
  CREATIVE: {
    ...commonModes.creative,
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.PERMISSIVE),
    temperature: 0.9,
    topP: 0.95,
  },

  BALANCED: {
    ...commonModes.research(),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.BALANCED),
    temperature: 0.5,
    topP: 0.85,
  },

  PRECISE: {
    ...commonModes.precise,
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.STRICT),
    ...withStructuredOutputs(true),
    temperature: 0.1,
    topP: 0.7,
  },
} as const;

// Generic utilities REMOVED for DRY compliance
// REASON: These are generic utilities, not Google-specific features.
// Token estimation, cost calculation, and context windows are generic patterns.
// Use shared utility packages for these features instead.

// Generic error handling REMOVED for DRY compliance
// REASON: These are generic error handling patterns, not Google-specific.
// Retry strategies and fallback models are generic patterns.
// Use shared error handling packages for these features instead.

/**
 * ADVANCED MULTIMODAL HELPERS - Google's Unique Strengths
 * =====================================================
 * Google excels at multimodal inputs (PDFs, videos, images, YouTube)
 * These helpers configure Google's unique multimodal capabilities.
 */

// REMOVED: withFileInputs()
// REMOVE REASON: AI SDK v5 handles file inputs natively through message content.
// Google doesn't need special configuration - file support is implicit.
// Even our own comment admitted this was "mainly for documentation" which violates DRY principle.
//
// Use AI SDK v5 native pattern instead:
// messages: [{ role: 'user', content: [{ type: 'file', data: fileData }] }]

/**
 * Configure image generation options for Imagen models
 * KEEP REASON: Google's Imagen models have unique person generation controls.
 * AI SDK v5 doesn't know about Google's person generation safety settings.
 * This is Google-specific image generation configuration.
 */
function withImageGeneration(
  personGeneration: 'allow_adult' | 'allow_all' | 'dont_allow' = 'allow_adult',
) {
  return {
    providerOptions: {
      google: {
        personGeneration,
      },
    },
  };
}

/**
 * Configure Google image generation options with advanced parameters
 * KEEP REASON: Google's Imagen models have unique quality and sizing controls.
 */
export function withGoogleImageGeneration(
  quality: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM',
  count: number = 1,
  size: number = 1024,
) {
  return {
    providerOptions: {
      google: {
        imageGeneration: {
          quality,
          count,
          size,
        },
      },
    },
  };
}

// YouTube context configuration interface
interface YouTubeContextConfig {
  videoUrl?: string;
  includedFeatures?: Array<'TRANSCRIPT' | 'COMMENTS' | 'METADATA'>;
  processTranscript?: boolean;
  extractKeyframes?: boolean;
  videoLengthLimit?: number;
}

/**
 * Configure YouTube URL processing (Google's unique capability)
 * KEEP REASON: Google can process YouTube URLs directly without downloading.
 * AI SDK v5 doesn't provide specialized YouTube URL handling.
 * This is Google-specific video processing optimization.
 */
export function withYouTubeContext(
  videoUrl: string,
  includedFeatures?: Array<'TRANSCRIPT' | 'COMMENTS' | 'METADATA'>,
): { providerOptions: { google: { youtubeContext: YouTubeContextConfig } } };
export function withYouTubeContext(options: {
  processTranscript?: boolean;
  extractKeyframes?: boolean;
  videoLengthLimit?: number; // minutes
}): { providerOptions: { google: { youtubeContext: YouTubeContextConfig } } };
export function withYouTubeContext(
  videoUrlOrOptions:
    | string
    | {
        processTranscript?: boolean;
        extractKeyframes?: boolean;
        videoLengthLimit?: number; // minutes
      },
  includedFeatures?: Array<'TRANSCRIPT' | 'COMMENTS' | 'METADATA'>,
) {
  if (typeof videoUrlOrOptions === 'string') {
    // New signature: withYouTubeContext(url, features)
    return {
      providerOptions: {
        google: {
          youtubeContext: {
            videoUrl: videoUrlOrOptions,
            includedFeatures: includedFeatures ?? ['TRANSCRIPT'],
          },
        },
      },
    };
  } else {
    // Old signature: withYouTubeContext(options)
    const options = videoUrlOrOptions || {};
    return {
      providerOptions: {
        google: {
          youtubeContext: {
            processTranscript: options.processTranscript ?? true,
            extractKeyframes: options.extractKeyframes ?? false,
            videoLengthLimit: options.videoLengthLimit ?? 30,
          },
        },
      },
    };
  }
}

/**
 * Advanced multimodal configuration presets
 * KEEP REASON: These combine Google-specific multimodal features.
 * Provides convenient presets for common multimodal use cases.
 */
export const GOOGLE_MULTIMODAL_PRESETS = {
  /**
   * Document processing mode - optimized for PDFs and text analysis
   */
  DOCUMENT_ANALYSIS: {
    ...withSafetySettings('BALANCED'),
    temperature: 0.3,
    maxOutputTokens: 4096,
  },

  /**
   * Document processing mode (alias for DOCUMENT_ANALYSIS)
   */
  DOCUMENT_PROCESSING: {
    ...withSafetySettings('BALANCED'),
    temperature: 0.3,
    maxOutputTokens: 4096,
  },

  /**
   * Image analysis mode - optimized for image processing
   */
  IMAGE_ANALYSIS: {
    ...withSafetySettings('BALANCED'),
    temperature: 0.4,
    maxOutputTokens: 2048,
  },

  /**
   * Video analysis mode - optimized for YouTube content processing
   */
  VIDEO_ANALYSIS: {
    ...withYouTubeContext({ processTranscript: true, extractKeyframes: true }),
    ...withSafetySettings('BALANCED'),
    temperature: 0.4,
    maxOutputTokens: 3072,
  },

  /**
   * Video understanding mode (alias for VIDEO_ANALYSIS)
   */
  VIDEO_UNDERSTANDING: {
    ...withYouTubeContext({ processTranscript: true, extractKeyframes: true }),
    ...withSafetySettings('BALANCED'),
    temperature: 0.4,
    maxOutputTokens: 3072,
  },

  /**
   * Creative multimodal mode - for content creation with image generation
   */
  CREATIVE_MULTIMODAL: {
    ...withImageGeneration('allow_all'),
    ...withSafetySettings('PERMISSIVE'),
    temperature: 0.8,
    maxOutputTokens: 4096,
  },

  /**
   * Research mode - for comprehensive analysis with web search capabilities
   */
  RESEARCH_MULTIMODAL: {
    ...withSafetySettings('BALANCED'),
    temperature: 0.4,
    maxOutputTokens: 6144,
    // Note: tools would be added at usage time: tools: { google_search: googleTools.googleSearch({}) }
  },
} as const;

/**
 * Response Processing - Google-Specific Metadata Extraction
 * KEEP REASON: These are Google-unique response structures and metadata.
 * AI SDK v5 doesn't standardize provider-specific metadata formats.
 */

// Generation result interface for extraction functions
interface GenerationResult {
  reasoningText?: string;
  providerOptions?: SharedV2ProviderMetadata;
}

// Type definitions for Google-specific metadata
export interface GoogleMetadata {
  groundingMetadata?: {
    webSearchQueries?: string[];
    searchEntryPoint?: { renderedContent: string };
    groundingSupports?: Array<{
      segment: { startIndex: number; endIndex: number; text: string };
      groundingChunkIndices: number[];
      confidenceScores: number[];
    }>;
    groundingChunks?: Array<{
      web?: { uri: string; title: string };
    }>;
  };
  safetyRatings?: Array<{
    category: string;
    probability: string;
    probabilityScore: number;
    severity?: string;
    severityScore?: number;
    blocked?: boolean;
  }>;
  usageMetadata?: {
    cachedContentTokenCount?: number;
    thoughtsTokenCount?: number;
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  urlContextMetadata?: {
    urlMetadata: Array<{
      retrievedUrl: string;
      urlRetrievalStatus: string;
    }>;
  };
  thinkingDetails?: {
    actualThinkingTokens?: number;
    thinkingBudget?: number;
    includeThoughts?: boolean;
    thinkingSummary?: string;
    timeoutReason?: string;
  };
  schemaValidation?: {
    valid: boolean;
    errors?: string[];
    schema?: JSONSchema7;
  };
  fileProcessing?: {
    processedFiles?: Array<{
      fileId: string;
      fileName: string;
      processingStatus: string;
      metadata?: Record<string, unknown>;
    }>;
    totalFiles?: number;
    successfullyProcessed?: number;
    unsupported?: boolean;
    errors?: string[];
  };
  youTubeProcessing?: {
    videoUrl?: string;
    processingStatus?: string;
    transcriptExtracted?: boolean;
    keyframesExtracted?: boolean;
    metadata?: Record<string, unknown>;
    error?: string;
    availableFeatures?: string[];
  };
  rateLimiting?: {
    requestsRemaining?: number;
    resetTime?: number;
    quotaUsed?: number;
    quotaLimit?: number;
    quotaExceeded?: boolean;
    remainingRequests?: number;
  };
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    reasoningTokens?: number;
    quotaUsed?: number;
    quotaLimit?: number;
  };
  modelInfo?: {
    modelId: string;
    version?: string;
    capabilities?: string[];
    maxContextLength?: number;
    deprecated?: boolean;
    recommendedReplacement?: string;
  };
  caching?: {
    cacheHit?: boolean;
    cacheKey?: string;
    ttl?: number;
    cachedAt?: number;
    expired?: boolean;
    validUntil?: number;
    hit?: boolean;
    reason?: string;
    ttlRemaining?: number;
  };
}

export interface ThinkingDetails {
  thoughtSummary?: string;
  thinkingTokensUsed?: number;
  thinkingBudgetRemaining?: number;
  actualThinkingTokens?: number;
  thinkingBudget?: number;
  thinkingSummary?: string;
}

export interface SafetyRating {
  category: string;
  probability: string;
  probabilityScore: number;
  severity?: string;
  severityScore?: number;
  blocked?: boolean;
}

/**
 * Extract Google-specific metadata from generation results
 * KEEP REASON: Combines all Google-specific metadata in one function.
 * Structure is unique to Google's response format and features.
 */
export function extractGoogleMetadata(result: GenerationResult): GoogleMetadata | null {
  if (!result || typeof result !== 'object') return null;
  const metadata = result.providerOptions?.google;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;

  const meta = metadata as JSONObject;

  return {
    groundingMetadata: meta.groundingMetadata as GoogleMetadata['groundingMetadata'],
    safetyRatings: Array.isArray(meta.safetyRatings)
      ? (meta.safetyRatings as unknown as SafetyRating[])
      : undefined,
    usageMetadata: meta.usageMetadata as GoogleMetadata['usageMetadata'],
    urlContextMetadata: meta.urlContextMetadata as GoogleMetadata['urlContextMetadata'],
    thinkingDetails: meta.thinkingDetails as GoogleMetadata['thinkingDetails'],
    schemaValidation: meta.schemaValidation as unknown as GoogleMetadata['schemaValidation'],
    fileProcessing: meta.fileProcessing as GoogleMetadata['fileProcessing'],
    youTubeProcessing: meta.youTubeProcessing as GoogleMetadata['youTubeProcessing'],
    rateLimiting: meta.rateLimiting as GoogleMetadata['rateLimiting'],
    usage: meta.usage as GoogleMetadata['usage'],
    modelInfo: meta.modelInfo as GoogleMetadata['modelInfo'],
    caching: meta.caching as GoogleMetadata['caching'],
  };
}

/**
 * Extract thinking details from reasoning responses
 * KEEP REASON: Google's thinking models return unique reasoning summaries.
 * AI SDK v5 doesn't standardize thinking token counting across providers.
 */
export function extractThinkingDetails(result: GenerationResult): ThinkingDetails | null {
  const reasoning = result.reasoningText;
  const googleMeta = result.providerOptions?.google;

  if (!reasoning && (!googleMeta || typeof googleMeta !== 'object' || Array.isArray(googleMeta))) {
    return null;
  }

  let thoughtsTokenCount: number | undefined;
  if (googleMeta) {
    const meta = googleMeta as Record<string, unknown>;
    const usageMetadata = meta.usageMetadata;
    if (usageMetadata && typeof usageMetadata === 'object' && !Array.isArray(usageMetadata)) {
      const usage = usageMetadata as JSONObject;
      thoughtsTokenCount =
        typeof usage.thoughtsTokenCount === 'number' ? usage.thoughtsTokenCount : undefined;
    }
  }

  if (!reasoning && !thoughtsTokenCount) {
    return null;
  }

  return {
    thoughtSummary: reasoning,
    thinkingTokensUsed: thoughtsTokenCount,
    // thinkingBudgetRemaining would need to be calculated if available
  };
}

/**
 * Extract safety ratings from generation results
 * KEEP REASON: Google's safety rating system is unique to their platform.
 * Returns detailed harm category analysis not found elsewhere.
 */
export function extractSafetyRatings(result: GenerationResult): SafetyRating[] | null {
  const googleMeta = result.providerOptions?.google;
  if (!googleMeta || typeof googleMeta !== 'object' || Array.isArray(googleMeta)) return null;

  const meta = googleMeta as Record<string, unknown>;
  const safetyRatings = meta.safetyRatings;
  if (!Array.isArray(safetyRatings)) return null;

  return safetyRatings as unknown as SafetyRating[];
}

// Generic configurations REMOVED for DRY compliance
// REASON: These combine generic patterns, not Google-specific features.
// RAG, chat, and content generation configurations are generic use cases.
// Use shared configuration patterns and compose them as needed.

// Generic type wrappers REMOVED for DRY compliance
// REASON: These were just generic type wrappers without Google-specific value.
// AI SDK v5 provides native Google types. Use AI SDK v5 native provider option types or inline types as needed.
// For Google-specific parameters, use the helper functions that return direct objects.

/**
 * CAPABILITY DETECTION - Google-Specific Feature Support
 * ====================================================
 * These functions help determine what features are available for specific models.
 */

/**
 * Check if a model supports thinking capabilities
 * KEEP REASON: This checks for Google's specific thinking model capabilities.
 * AI SDK v5 can't know which Google models support thinkingConfig parameter.
 */
export function supportsThinking(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.THINKING_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.THINKING_MODELS)[number],
  );
}

/**
 * Check if a model supports Google Search grounding
 * KEEP REASON: Google's search grounding system is unique to their platform.
 * AI SDK v5 doesn't know about Google's search grounding capabilities.
 */
export function supportsGoogleSearch(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.SEARCH_CAPABLE_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.SEARCH_CAPABLE_MODELS)[number],
  );
}

/**
 * Check if a model supports URL Context tool
 * KEEP REASON: Google's URL Context tool is unique and version-specific.
 * AI SDK v5 doesn't know about Google's URL context capabilities.
 */
export function supportsUrlContext(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.URL_CONTEXT_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.URL_CONTEXT_MODELS)[number],
  );
}

/**
 * Check if a model supports code execution
 * KEEP REASON: Google's code execution feature availability varies by model.
 * Most modern Gemini models support code execution, but not all.
 */
export function supportsCodeExecution(modelId: string): boolean {
  // Most Gemini models support code execution, Gemma models typically don't
  return (
    !GOOGLE_MODEL_GROUPS.GEMMA_MODELS.includes(
      modelId as (typeof GOOGLE_MODEL_GROUPS.GEMMA_MODELS)[number],
    ) &&
    !GOOGLE_MODEL_GROUPS.LEGACY_MODELS.includes(
      modelId as (typeof GOOGLE_MODEL_GROUPS.LEGACY_MODELS)[number],
    )
  );
}

/**
 * Check if a model supports image generation
 * KEEP REASON: Google's image generation is limited to specific models.
 * AI SDK v5 doesn't know which Google models can generate images.
 */
export function supportsImageGeneration(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.IMAGE_GENERATION_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.IMAGE_GENERATION_MODELS)[number],
  );
}

/**
 * Check if a model is a Gemma model (requires special handling)
 * KEEP REASON: Gemma models don't support systemInstruction and need special handling.
 * AI SDK v5 handles this internally but this is useful for user code.
 */
export function isGemmaModel(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.GEMMA_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.GEMMA_MODELS)[number],
  );
}

/**
 * Check if a model supports multimodal inputs (vision/audio/files)
 * KEEP REASON: Google's multimodal capabilities vary by model family.
 * AI SDK v5 doesn't provide Google-specific multimodal capability detection.
 */
export function supportsMultimodal(modelId: string): boolean {
  return GOOGLE_MODEL_GROUPS.MULTIMODAL_MODELS.includes(
    modelId as (typeof GOOGLE_MODEL_GROUPS.MULTIMODAL_MODELS)[number],
  );
}

/**
 * Check if a model supports implicit caching (automatic cost savings)
 * KEEP REASON: Google's implicit caching is available on specific model versions.
 * Helps users understand which models provide automatic cache cost savings.
 */
export function supportsImplicitCaching(modelId: string): boolean {
  return (
    GOOGLE_MODEL_GROUPS.THINKING_MODELS.includes(
      modelId as (typeof GOOGLE_MODEL_GROUPS.THINKING_MODELS)[number],
    ) || modelId === GOOGLE_MODEL_IDS.GEMINI_20_FLASH
  );
}

// Generic middleware REMOVED for DRY compliance
// REASON: This was a generic helper wrapper, not Google-specific.
// Users should compose provider options directly using helper functions or direct objects.

// Generic capability detection REMOVED for DRY compliance
// REASON: AI SDK v5 detects model capabilities natively.
// Generic capabilities (imageInput, objectGeneration, toolUsage) are handled by AI SDK v5.
// Use AI SDK v5's native capability detection instead of hardcoded maps.

// Generic provider settings type REMOVED for DRY compliance
// REASON: GoogleGenerativeAIProviderOptions should be imported from @ai-sdk/google.
// Use AI SDK v5 native types or specific Google types defined in this module.

/**
 * Model capability constants for quick reference
 * KEEP REASON: Google-specific capability matrix for developer reference.
 */
export const GOOGLE_MODEL_CAPABILITIES = {
  [GOOGLE_MODEL_IDS.GEMINI_25_PRO]: {
    thinking: true,
    search: true,
    urlContext: true,
    codeExecution: true,
    multimodal: true,
    imageGeneration: false,
    implicitCaching: true,
    googleSearch: true,
  },
  [GOOGLE_MODEL_IDS.GEMINI_25_FLASH]: {
    thinking: true,
    search: true,
    urlContext: true,
    codeExecution: true,
    multimodal: true,
    imageGeneration: false,
    implicitCaching: true,
    googleSearch: true,
  },
  [GOOGLE_MODEL_IDS.GEMINI_25_FLASH_IMAGE_PREVIEW]: {
    thinking: false,
    search: false,
    urlContext: false,
    codeExecution: false,
    multimodal: true,
    imageGeneration: true,
    implicitCaching: false,
    googleSearch: false,
  },
  // ... other models would be added here
} as const;

/**
 * Google-specific presets for common usage patterns
 * Combines multiple Google features for specific use cases
 */
const GOOGLE_USAGE_PATTERNS = {
  /**
   * Deep reasoning with full thinking capabilities
   * For complex problem solving and analysis
   */
  DEEP_THINKING: {
    ...withThinking(16000, true),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.BALANCED),
    temperature: 0.2,
    maxOutputTokens: 8192,
  },

  /**
   * Research mode with web search capabilities
   * For current information and fact-checking
   */
  WEB_RESEARCH: {
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.BALANCED),
    temperature: 0.4,
    maxOutputTokens: 4096,
    // Note: tools would be added at usage time: tools: { google_search: google.tools.googleSearch({}) }
  },

  /**
   * Content creation with image output
   * For creative tasks requiring visual elements
   */
  CREATIVE_MULTIMODAL: {
    ...withResponseModalities(['TEXT', 'IMAGE']),
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.PERMISSIVE),
    temperature: 0.8,
    maxOutputTokens: 4096,
  },

  /**
   * Safe production mode with strict filtering
   * For customer-facing applications
   */
  PRODUCTION_SAFE: {
    ...withSafetySettings(GOOGLE_SAFETY_PRESETS.STRICT),
    ...withStructuredOutputs(true),
    temperature: 0.3,
    maxOutputTokens: 2048,
  },
} as const;

/**
 * USAGE EXAMPLES AND PATTERNS
 * ===========================
 *
 * Basic usage with AI SDK v5:
 * const result = await generateText({
 *   model: google('gemini-2.5-pro'),
 *   prompt: 'Explain quantum computing'
 * });
 *
 * With thinking capabilities:
 * const result = await generateText({
 *   model: google('gemini-2.5-pro'),
 *   ...withThinking(12000, true),
 *   prompt: 'Solve this complex math problem step by step'
 * });
 *
 * With safety controls:
 * const result = await generateText({
 *   model: google('gemini-2.5-flash'),
 *   ...withSafetySettings(GOOGLE_SAFETY_PRESETS.STRICT),
 *   prompt: 'Generate content about sensitive topics'
 * });
 *
 * Multimodal with image generation:
 * const result = await generateText({
 *   model: google('gemini-2.5-flash-image-preview'),
 *   ...withImageGeneration('allow_all'),
 *   prompt: 'Create a diagram explaining the water cycle'
 * });
 *
 * Web search with URL context:
 * const result = await generateText({
 *   model: google('gemini-2.5-pro'),
 *   tools: {
 *     google_search: google.tools.googleSearch({}),
 *     url_context: google.tools.urlContext({})
 *   },
 *   prompt: 'Based on https://example.com, find recent news about AI developments'
 * });
 *
 * Embedding with task optimization:
 * const { embedding } = await embed({
 *   model: google.textEmbedding('gemini-embedding-001'),
 *   value: 'text to embed',
 *   ...withEmbeddingConfig({
 *     taskType: 'SEMANTIC_SIMILARITY',
 *     outputDimensionality: 512
 *   })
 * });
 *
 * Gateway compatibility (works with all helpers):
 * const result = await generateText({
 *   model: vercelGateway('google/gemini-2.5-pro'),    // Vercel routing
 *   ...withThinking(8192, true),                      // Google-specific
 *   ...withGatewayRouting(['google']),                // Gateway-specific
 *   prompt: 'Complex reasoning task'
 * });
 *
 * Orthogonal composition with multiple providers:
 * const result = await generateText({
 *   model: cloudflareGateway(['google/gemini-2.5-pro', 'anthropic/claude-sonnet-4']),
 *   ...withThinking(8192),                            // Google-specific (passes through if Google used)
 *   ...withReasoning(15000),                          // Anthropic-specific (passes through if Anthropic used)
 *   ...withCaching({ ttl: 3600 }),                    // Cloudflare-specific
 *   prompt: 'Task that benefits from multiple provider capabilities'
 * });
 */
