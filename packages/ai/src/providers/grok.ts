/**
 * xAI Grok Provider Module
 * Centralized location for xAI-specific features and configurations
 * xAI uniquely provides Live Search, reasoning effort controls, and image generation
 *
 * DRY Principle: Only defines features unique to xAI
 * Generic patterns use AI SDK v5 and shared utilities
 */

import type { JSONObject, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { createXai, xai } from '@ai-sdk/xai';

// Type definitions for xAI/Grok-specific features
interface GenerationResult {
  sources?: Array<{
    url: string;
    title: string;
    snippet: string;
    publishedDate?: string;
    author?: string;
  }>;
  providerOptions?: SharedV2ProviderMetadata;
}

interface XAISourceItem {
  url: string;
  title: string;
  snippet: string;
  publishedDate?: string;
  author?: string;
}

// Re-export the provider and factory function
export { createXai, xai as grok };

// Re-export image generation support
export const grokImage = xai.image;

/**
 * Single source of truth for xAI Grok model IDs
 * Used by both registry and direct imports
 * Based on official xAI documentation
 */
export const GROK_MODEL_IDS = {
  // Grok 4 models
  GROK_4: 'grok-4',

  // Grok 3 models
  GROK_3: 'grok-3',
  GROK_3_LATEST: 'grok-3-latest',
  GROK_3_FAST: 'grok-3-fast',
  GROK_3_FAST_LATEST: 'grok-3-fast-latest',

  // Grok 3 Mini (reasoning models)
  GROK_3_MINI: 'grok-3-mini',
  GROK_3_MINI_LATEST: 'grok-3-mini-latest',
  GROK_3_MINI_FAST: 'grok-3-mini-fast',
  GROK_3_MINI_FAST_LATEST: 'grok-3-mini-fast-latest',

  // Grok 2 models
  GROK_2: 'grok-2',
  GROK_2_LATEST: 'grok-2-latest',
  GROK_2_1212: 'grok-2-1212',

  // Vision models
  GROK_2_VISION: 'grok-2-vision',
  GROK_2_VISION_LATEST: 'grok-2-vision-latest',
  GROK_2_VISION_1212: 'grok-2-vision-1212',

  // Code model
  GROK_CODE_FAST_1: 'grok-code-fast-1',

  // Beta models
  GROK_BETA: 'grok-beta',
  GROK_VISION_BETA: 'grok-vision-beta',

  // Image generation
  GROK_2_IMAGE: 'grok-2-image',
} as const;

// Pre-configured models REMOVED for DRY compliance
// REASON: These were just syntactic sugar with no unique value.
// AI SDK v5 pattern is direct provider invocation: xai('model-id')
// Users should use: xai(GROK_MODEL_IDS.GROK_3) instead of grokModels.grok3

/**
 * xAI-UNIQUE FEATURES
 * Only features that are specific to xAI and not available in AI SDK v5
 *
 * ARCHITECTURAL DECISION: SDK-First Approach (Rebalanced October 2025)
 * ================================================================
 *
 * After analyzing established provider patterns across OpenAI, Anthropic, and Perplexity,
 * we identified that our xAI implementation was over-engineered with too many helpers.
 *
 * REBALANCING RATIONALE:
 * 1. OpenAI maximizes SDK usage - minimal custom helpers
 * 2. Perplexity adds 2 helpers for genuinely unique features
 * 3. Our original 5+ helpers violated DRY principles
 * 4. Documentation already shows the right abstraction level
 *
 * NEW APPROACH:
 * - Primary: withSearchParameters() - matches documentation exactly
 * - Convenience: withSearchSources() - for complex multi-source scenarios
 * - Deprecated: Individual helpers maintained as aliases for backward compatibility
 */

/**
 * Primary helper for xAI's Live Search system
 * UNIQUE TO XAI: Real-time web search with multiple source types
 *
 * DESIGN DECISION: This function matches the documented API structure exactly.
 * Rather than abstracting away the `searchParameters` object, we expose it directly
 * to maintain transparency with the underlying AI SDK v5 patterns.
 *
 * @param options Complete search configuration matching documented API
 * @returns Provider options for xAI search
 */
export function withSearchParameters(
  options: {
    mode?: 'auto' | 'on' | 'off';
    returnCitations?: boolean;
    fromDate?: string; // ISO8601 format YYYY-MM-DD
    toDate?: string; // ISO8601 format YYYY-MM-DD
    maxSearchResults?: number; // Max 50
    sources?: Array<WebSearchSource | XSearchSource | NewsSearchSource | RSSSearchSource>;
  } = {},
) {
  return {
    xai: {
      searchParameters: {
        mode: options.mode || 'auto',
        returnCitations: options.returnCitations ?? true,
        fromDate: options.fromDate,
        toDate: options.toDate,
        maxSearchResults: options.maxSearchResults || 20,
        sources: options.sources || ['web', 'x'],
      },
    },
  };
}

/**
 * Convenience helper for complex multi-source search scenarios
 * UNIQUE TO XAI: Simplified API for combining multiple search sources
 *
 * DESIGN DECISION: This provides value by simplifying the common pattern
 * of combining multiple search sources without requiring knowledge of the
 * full searchParameters structure.
 */
export function withSearchSources(
  ...sources: Array<WebSearchSource | XSearchSource | NewsSearchSource | RSSSearchSource>
) {
  return withSearchParameters({
    mode: 'on',
    returnCitations: true,
    sources,
  });
}

/**
 * LEGACY FUNCTIONS REMOVED
 *
 * ARCHITECTURAL DECISION: Clean Break from Over-Abstraction
 * ========================================================
 *
 * REMOVED FUNCTIONS:
 * - withLiveSearch() → Use withSearchParameters()
 * - withWebSearch() → Use withSearchSources({ type: 'web', ...options })
 * - withXSearch() → Use withSearchSources({ type: 'x', xHandles })
 * - withNewsSearch() → Use withSearchSources({ type: 'news', ...options })
 * - withRSSSearch() → Use withSearchSources({ type: 'rss', links })
 *
 * RATIONALE:
 * 1. These were over-abstractions that added confusion
 * 2. The new API is clearer and matches documentation patterns
 * 3. Two functions are sufficient for all use cases
 * 4. Clean break prevents API bloat
 *
 * MIGRATION PATH:
 * - Simple searches: withSearchParameters({ mode, sources })
 * - Multi-source: withSearchSources(source1, source2, ...)
 */

/**
 * Helper for reasoning effort configuration
 * UNIQUE TO XAI: Reasoning effort control for mini models
 * Only supported by grok-3-mini and grok-3-mini-fast models
 */
export function withReasoningEffort(effort: 'low' | 'high') {
  return {
    xai: {
      reasoningEffort: effort,
    },
  };
}

/**
 * xAI-UNIQUE RESPONSE PROCESSING
 * Functions for extracting xAI-specific response data
 */

/**
 * xAI-UNIQUE RESPONSE PROCESSING - SIMPLIFIED APPROACH
 *
 * ARCHITECTURAL DECISION: Perplexity-Style Simplicity (Rebalanced October 2025)
 * =========================================================================
 *
 * REMOVED COMPLEXITY:
 * - Excessive try-catch blocks and error handling
 * - Multiple fallback paths for hypothetical edge cases
 * - Over-defensive programming patterns
 * - Console warnings and complex metadata extraction
 *
 * RATIONALE:
 * 1. Following Perplexity's clean 3-line extraction pattern
 * 2. xAI's response format is straightforward - simple extraction is sufficient
 * 3. AI SDK v5 handles errors at its level
 * 4. Less code = fewer bugs and easier maintenance
 *
 * NEW APPROACH: Simple, direct extraction matching response format
 */

/**
 * Extract search sources from xAI responses
 * UNIQUE TO XAI: Built-in Live Search citations
 *
 * Following Perplexity's pattern: simple, direct extraction
 */
export function extractSources(result: GenerationResult): XAISource[] {
  if (!result?.sources) return [];

  return result.sources.map((source: XAISourceItem) => ({
    url: source.url || '',
    title: source.title,
    snippet: source.snippet,
    sourceType: 'url' as const,
  }));
}

/**
 * Extract search metadata from xAI responses
 * UNIQUE TO XAI: Search-specific metadata and statistics
 *
 * Simple extraction - if metadata isn't available, return null
 */
export function extractSearchMetadata(result: GenerationResult): XAISearchMetadata | null {
  const xaiMeta = result?.providerOptions?.xai;
  if (!xaiMeta || typeof xaiMeta !== 'object' || Array.isArray(xaiMeta)) return null;

  const meta = xaiMeta as JSONObject;
  const search = meta.search;
  if (!search || typeof search !== 'object' || Array.isArray(search)) return null;

  const searchData = search as JSONObject;

  return {
    queriesUsed: typeof searchData.queriesUsed === 'number' ? searchData.queriesUsed : 0,
    sourcesFound: typeof searchData.sourcesFound === 'number' ? searchData.sourcesFound : 0,
    searchTime: typeof searchData.searchTime === 'number' ? searchData.searchTime : 0,
  };
}

/**
 * MODEL CAPABILITIES AND GROUPS
 * xAI-specific model categorization and capability detection
 */

/**
 * Model groups for categorization - MEANINGFUL DISTINCTIONS ONLY
 *
 * ARCHITECTURAL DECISION: Focused Model Grouping (Rebalanced October 2025)
 * =====================================================================
 *
 * REMOVED GROUPS:
 * - LIVE_SEARCH_MODELS: Listed ALL models - completely redundant (default capability)
 * - IMAGE_GENERATION_MODELS: Single model array is pointless
 *
 * RATIONALE:
 * 1. Following Anthropic's selective grouping approach
 * 2. Only group models when the distinction matters for capability detection
 * 3. Default capabilities don't need explicit lists
 * 4. Single-item arrays provide no organizational value
 *
 * KEPT GROUPS: Only those that help differentiate xAI-unique features
 */
export const GROK_MODEL_GROUPS = {
  // Models supporting reasoning effort control (xAI-unique feature)
  REASONING_EFFORT_MODELS: [
    GROK_MODEL_IDS.GROK_3_MINI,
    GROK_MODEL_IDS.GROK_3_MINI_LATEST,
    GROK_MODEL_IDS.GROK_3_MINI_FAST,
    GROK_MODEL_IDS.GROK_3_MINI_FAST_LATEST,
    GROK_MODEL_IDS.GROK_CODE_FAST_1,
  ] as const,

  // Vision-capable models (for xAI-specific vision features)
  VISION_MODELS: [
    GROK_MODEL_IDS.GROK_2_VISION,
    GROK_MODEL_IDS.GROK_2_VISION_LATEST,
    GROK_MODEL_IDS.GROK_2_VISION_1212,
    GROK_MODEL_IDS.GROK_VISION_BETA,
  ] as const,
} as const;

/**
 * DESIGN NOTES:
 *
 * Live Search Support:
 * - Default capability for all models except GROK_2_IMAGE and GROK_VISION_BETA
 * - No explicit list needed - check via supportsLiveSearch(modelId) function
 *
 * Image Generation Support:
 * - Only GROK_2_IMAGE - single model doesn't need a group array
 * - Check via supportsImageGeneration(modelId) or use AI SDK native detection
 */

/**
 * Model capabilities mapping - xAI-UNIQUE FEATURES ONLY
 *
 * ARCHITECTURAL DECISION: Capability Reduction (Rebalanced October 2025)
 * ====================================================================
 *
 * REMOVED CAPABILITIES:
 * - vision: AI SDK v5 provides supportsImageInput() natively
 * - imageGeneration: AI SDK v5 provides supportsImageGeneration() natively
 * - objectGeneration: AI SDK v5 provides supportsObjectGeneration() natively
 * - toolUsage: AI SDK v5 provides supportsToolUsage() natively
 *
 * RATIONALE:
 * 1. Following Perplexity's minimal capability pattern
 * 2. AI SDK v5 already provides standard capability detection
 * 3. We only track what's UNIQUE to xAI that SDK doesn't know about
 * 4. Reduces redundancy and maintenance burden
 *
 * KEPT CAPABILITIES:
 * - liveSearch: xAI's unique built-in web search system
 * - reasoningEffort: xAI's unique reasoning effort control for mini models
 */
const GROK_MODEL_CAPABILITIES = {
  // Standard models - Live Search only
  [GROK_MODEL_IDS.GROK_4]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_3]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_3_LATEST]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_3_FAST]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_3_FAST_LATEST]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_LATEST]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_1212]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_VISION]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_VISION_LATEST]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_VISION_1212]: {
    liveSearch: true,
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_BETA]: {
    liveSearch: true,
    reasoningEffort: false,
  },

  // Mini models - Support reasoning effort control
  [GROK_MODEL_IDS.GROK_3_MINI]: {
    liveSearch: true,
    reasoningEffort: true, // Unique: reasoningEffort parameter support
  },
  [GROK_MODEL_IDS.GROK_3_MINI_LATEST]: {
    liveSearch: true,
    reasoningEffort: true,
  },
  [GROK_MODEL_IDS.GROK_3_MINI_FAST]: {
    liveSearch: true,
    reasoningEffort: true,
  },
  [GROK_MODEL_IDS.GROK_3_MINI_FAST_LATEST]: {
    liveSearch: true,
    reasoningEffort: true,
  },

  // Code model - Has reasoning capabilities
  [GROK_MODEL_IDS.GROK_CODE_FAST_1]: {
    liveSearch: true,
    reasoningEffort: true, // Per documentation table
  },

  // Special cases - Limited capabilities
  [GROK_MODEL_IDS.GROK_VISION_BETA]: {
    liveSearch: false, // Beta vision model has limited search
    reasoningEffort: false,
  },
  [GROK_MODEL_IDS.GROK_2_IMAGE]: {
    liveSearch: false, // Image generation model doesn't have search
    reasoningEffort: false,
  },
} as const;

/**
 * xAI-UNIQUE CAPABILITY DETECTION
 */

/**
 * Get model capabilities - xAI-specific features only
 */
function getModelCapabilities(modelId: string): GrokModelCapabilities | undefined {
  return GROK_MODEL_CAPABILITIES[modelId as keyof typeof GROK_MODEL_CAPABILITIES];
}

/**
 * Check if model supports Live Search
 * UNIQUE TO XAI: Built-in real-time web search
 */
export function supportsLiveSearch(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.liveSearch ?? false;
}

/**
 * Check if model supports reasoning effort control
 * UNIQUE TO XAI: Reasoning effort parameter for mini models
 */
export function supportsReasoningEffort(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.reasoningEffort ?? false;
}

/**
 * Check if model supports vision input
 *
 * DESIGN NOTE: This is a convenience function for xAI-specific logic.
 * For general vision detection, prefer AI SDK v5's native supportsImageInput()
 */
export function supportsVision(modelId: string): boolean {
  return GROK_MODEL_GROUPS.VISION_MODELS.includes(
    modelId as (typeof GROK_MODEL_GROUPS.VISION_MODELS)[number],
  );
}

/**
 * Check if model supports image generation
 *
 * DESIGN NOTE: Simple check since only one model supports it.
 * For general image generation detection, prefer AI SDK v5's native functions.
 */
export function supportsImageGeneration(modelId: string): boolean {
  return modelId === GROK_MODEL_IDS.GROK_2_IMAGE;
}

/**
 * Check if model is a reasoning effort capable model
 */
export function isReasoningEffortModel(modelId: string): boolean {
  return GROK_MODEL_GROUPS.REASONING_EFFORT_MODELS.includes(
    modelId as (typeof GROK_MODEL_GROUPS.REASONING_EFFORT_MODELS)[number],
  );
}

/**
 * Check if model is a vision model
 */
export function isVisionModel(modelId: string): boolean {
  return GROK_MODEL_GROUPS.VISION_MODELS.includes(
    modelId as (typeof GROK_MODEL_GROUPS.VISION_MODELS)[number],
  );
}

/**
 * xAI-UNIQUE TYPE DEFINITIONS
 */

// Search source types for Live Search - matching documented API
export interface WebSearchSource {
  type: 'web';
  country?: string; // ISO alpha-2 country code
  allowedWebsites?: string[]; // Max 5 allowed websites
  excludedWebsites?: string[]; // Max 5 excluded websites
  safeSearch?: boolean; // Enable safe search (default: true)
}

export interface XSearchSource {
  type: 'x';
  xHandles: string[]; // Array of X handles to search (without @ symbol)
}

interface NewsSearchSource {
  type: 'news';
  country?: string; // ISO alpha-2 country code
  excludedWebsites?: string[]; // Max 5 excluded websites
  safeSearch?: boolean; // Enable safe search (default: true)
}

interface RSSSearchSource {
  type: 'rss';
  links: string[]; // Array of RSS feed URLs (max 1 currently supported)
}

// Source type for xAI search results - matches documented format
export interface XAISource {
  url: string;
  title?: string;
  snippet?: string;
  sourceType: 'url'; // As documented in AI SDK
}

// Search metadata type - unique xAI metrics
export interface XAISearchMetadata {
  queriesUsed: number; // Number of search queries executed
  sourcesFound: number; // Number of sources found
  searchTime: number; // Time taken for search in milliseconds
}

/**
 * Model capabilities type - xAI-UNIQUE FEATURES ONLY
 *
 * ARCHITECTURAL DECISION: Simplified capability interface
 * ====================================================
 *
 * This interface now only tracks features that are:
 * 1. UNIQUE to xAI (not available in other providers)
 * 2. NOT handled by AI SDK v5 natively
 *
 * For standard capabilities (vision, object generation, etc.),
 * use AI SDK v5 native functions like:
 * - supportsImageInput(model)
 * - supportsObjectGeneration(model)
 * - supportsToolUsage(model)
 */
export interface GrokModelCapabilities {
  liveSearch: boolean; // Unique: Built-in Live Search system
  reasoningEffort: boolean; // Unique: reasoningEffort parameter for mini models
}

/**
 * Type exports for better IDE support
 */
// Note: createXai is already exported above as a function

/**
 * USAGE EXAMPLES - SDK-First Patterns (Rebalanced October 2025)
 *
 * ARCHITECTURAL PHILOSOPHY:
 * =============================
 *
 * PRIMARY: Show direct SDK usage - this is what users should prefer
 * SECONDARY: Show our helpers as conveniences, not requirements
 *
 * This approach follows OpenAI's pattern of trusting the SDK while
 * providing targeted helpers for genuinely unique features.
 *
 * SDK-First: Direct provider options (RECOMMENDED)
 * ```typescript
 * const { text, sources } = await generateText({
 *   model: xai('grok-3-latest'),  // Direct AI SDK v5 pattern
 *   prompt: 'Latest developments in AI research',
 *   providerOptions: {
 *     xai: {
 *       searchParameters: {
 *         mode: 'on',
 *         returnCitations: true,
 *         maxSearchResults: 10,
 *         sources: [{ type: 'web' }, { type: 'news' }]
 *       }
 *     }
 *   }
 * });
 * console.log('Sources found:', sources.length);
 * ```
 *
 * Helper: Convenience wrapper for common patterns
 * ```typescript
 * const result = await generateText({
 *   model: xai('grok-3'),
 *   prompt: 'Latest AI research papers',
 *   providerOptions: withSearchParameters({
 *     mode: 'on',
 *     sources: [{ type: 'web', allowedWebsites: ['arxiv.org'] }]
 *   })
 * });
 * ```
 *
 * Multi-source convenience helper:
 * ```typescript
 * const result = await generateText({
 *   model: xai('grok-3-latest'),
 *   prompt: 'Comprehensive tech news overview',
 *   providerOptions: withSearchSources(
 *     { type: 'web', country: 'US' },
 *     { type: 'news', safeSearch: true },
 *     { type: 'x', xHandles: ['techcrunch', 'theverge'] }
 *   )
 * });
 * ```
 *
 * Reasoning effort (SDK-first vs helper):
 * ```typescript
 * // SDK-first (recommended)
 * const result = await generateText({
 *   model: xai('grok-3-mini'),
 *   prompt: 'Complex reasoning task',
 *   providerOptions: {
 *     xai: { reasoningEffort: 'high' }
 *   }
 * });
 *
 * // Helper (convenience)
 * const result2 = await generateText({
 *   model: xai('grok-3-mini'),
 *   prompt: 'Another reasoning task',
 *   providerOptions: withReasoningEffort('high')
 * });
 * ```
 *
 * Vision analysis (standard AI SDK pattern):
 * ```typescript
 * const result = await generateText({
 *   model: xai('grok-2-vision-latest'),
 *   messages: [{
 *     role: 'user',
 *     content: [
 *       { type: 'text', text: 'What is in this image?' },
 *       { type: 'image', image: imageBase64 },
 *     ],
 *   }],
 * });
 * ```
 *
 * Image generation (following OpenAI pattern):
 * ```typescript
 * const { image } = await generateImage({
 *   model: xai.image('grok-2-image'),  // SDK native pattern
 *   prompt: 'A futuristic cityscape at sunset',
 * });
 * ```
 *
 * Streaming with search (SDK-first):
 * ```typescript
 * const result = streamText({
 *   model: xai('grok-3-latest'),
 *   prompt: 'What has happened in tech recently?',
 *   providerOptions: {
 *     xai: {
 *       searchParameters: {
 *         mode: 'auto',
 *         returnCitations: true
 *       }
 *     }
 *   }
 * });
 *
 * for await (const textPart of result.textStream) {
 *   process.stdout.write(textPart);
 * }
 *
 * const sources = await result.sources;
 * const metadata = extractSearchMetadata(result);
 * ```
 *
 * MIGRATION GUIDANCE:
 * ==================
 *
 * OLD (over-abstracted): withWebSearch({ country: 'US' })
 * NEW (SDK-first): { xai: { searchParameters: { sources: [{ type: 'web', country: 'US' }] } } }
 * NEW (helper): withSearchSources({ type: 'web', country: 'US' })
 *
 * This approach provides:
 * ✅ Clear SDK usage patterns
 * ✅ Reduced API surface area
 * ✅ Better alignment with AI SDK v5 philosophy
 * ✅ Easier maintenance and debugging
 */
