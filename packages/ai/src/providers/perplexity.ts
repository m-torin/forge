/**
 * Perplexity Provider Module
 * Centralized location for Perplexity-specific features and configurations
 * Perplexity uniquely combines real-time web search with LLM responses
 *
 * DRY Principle: Only defines features unique to Perplexity
 * Generic patterns use AI SDK v5 and shared utilities
 */

import { perplexity as perplexityProvider } from '@ai-sdk/perplexity';
import type { JSONObject, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { commonModes } from './shared';

// Type definitions for Perplexity-specific features
interface GenerationResult {
  providerOptions?: SharedV2ProviderMetadata;
  sources?: PerplexitySource[];
}

// Re-export the provider itself
export { perplexityProvider as perplexity };

/**
 * Single source of truth for Perplexity model IDs
 * Used by both registry and direct imports
 */
export const PERPLEXITY_MODEL_IDS = {
  // Sonar models with web search
  SONAR_PRO: 'sonar-pro',
  SONAR: 'sonar',

  // Reasoning models
  SONAR_REASONING_PRO: 'sonar-reasoning-pro',
  SONAR_REASONING: 'sonar-reasoning',

  // Deep research model (no images, extensive research)
  SONAR_DEEP_RESEARCH: 'sonar-deep-research',
} as const;

/**
 * Model groups for categorization
 * Helps identify capabilities and use cases
 *
 * KEEP REASON: These are Perplexity-specific categorizations.
 * AI SDK v5 has no knowledge of Perplexity's model categorizations.
 * Not generic - these are Perplexity's own model classifications.
 */
export const PERPLEXITY_MODEL_GROUPS = {
  // KEEP REASON: Perplexity defines what makes a model "research-optimized"
  RESEARCH_MODELS: [
    PERPLEXITY_MODEL_IDS.SONAR_DEEP_RESEARCH,
    PERPLEXITY_MODEL_IDS.SONAR_PRO,
    PERPLEXITY_MODEL_IDS.SONAR,
  ] as const,

  // KEEP REASON: Perplexity-specific grouping for their reasoning models
  REASONING_MODELS: [
    PERPLEXITY_MODEL_IDS.SONAR_REASONING_PRO,
    PERPLEXITY_MODEL_IDS.SONAR_REASONING,
  ] as const,

  // KEEP REASON: While AI SDK v5 detects multimodal, this list
  // specifically identifies which PERPLEXITY models support images
  MULTIMODAL_MODELS: [
    PERPLEXITY_MODEL_IDS.SONAR_REASONING_PRO,
    PERPLEXITY_MODEL_IDS.SONAR_REASONING,
    PERPLEXITY_MODEL_IDS.SONAR_PRO,
    PERPLEXITY_MODEL_IDS.SONAR,
  ] as const,
} as const;

/**
 * Model capabilities mapping - PERPLEXITY-UNIQUE FEATURES ONLY
 * Based on official Perplexity documentation
 * Generic capabilities (imageInput, objectGeneration, etc.) handled by AI SDK v5
 */
const PERPLEXITY_MODEL_CAPABILITIES = {
  [PERPLEXITY_MODEL_IDS.SONAR_DEEP_RESEARCH]: {
    webSearch: true,
    citations: true,
    tierRequirement: 'basic',
    imageResponses: false, // Deep research doesn't return images
  },
  [PERPLEXITY_MODEL_IDS.SONAR_REASONING_PRO]: {
    webSearch: true,
    citations: true,
    tierRequirement: 'basic',
    imageResponses: true, // Tier-2+ feature
  },
  [PERPLEXITY_MODEL_IDS.SONAR_REASONING]: {
    webSearch: true,
    citations: true,
    tierRequirement: 'basic',
    imageResponses: true, // Tier-2+ feature
  },
  [PERPLEXITY_MODEL_IDS.SONAR_PRO]: {
    webSearch: true,
    citations: true,
    tierRequirement: 'basic',
    imageResponses: true, // Tier-2+ feature
  },
  [PERPLEXITY_MODEL_IDS.SONAR]: {
    webSearch: true,
    citations: true,
    tierRequirement: 'basic',
    imageResponses: true, // Tier-2+ feature
  },
} as const;

// Pre-configured models REMOVED for DRY compliance
// REASON: These were just syntactic sugar with no unique value.
// AI SDK v5 pattern is direct provider invocation: perplexity('model-id')
// Users should use: perplexity('sonar-pro') instead of perplexityModels.sonarPro

/**
 * PERPLEXITY-UNIQUE FEATURES
 */

/**
 * Helper for enabling image responses - Provider Agnostic
 * UNIQUE TO PERPLEXITY: Only available for Tier-2 users and above
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: perplexity('sonar-pro'), ...withImages() })
 *
 * // Works with gateway
 * generateText({ model: gateway('perplexity/sonar-pro'), ...withImages() })
 * ```
 */
export function withImages() {
  return {
    providerOptions: {
      perplexity: { return_images: true },
    },
  };
}

/**
 * Helper for research mode with Perplexity-specific options - Provider Agnostic
 * Combines shared research mode with Perplexity's unique image capability
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: perplexity('sonar-pro'), ...withResearchMode(true) })
 *
 * // Works with gateway
 * generateText({ model: gateway('perplexity/sonar-pro'), ...withResearchMode(true) })
 * ```
 */
export function withResearchMode(returnImages: boolean = false) {
  return {
    ...commonModes.research(), // Generic part (from shared)
    providerOptions: {
      perplexity: { return_images: returnImages }, // Perplexity-unique part
    },
  };
}

/**
 * PERPLEXITY-UNIQUE RESPONSE PROCESSING
 *
 * KEEP REASON: These are Perplexity-unique response structures.
 * AI SDK v5 doesn't standardize citation formats or provider-specific metadata.
 */

/**
 * Extract sources from Perplexity responses
 * UNIQUE TO PERPLEXITY: Built-in citation system with web sources
 *
 * KEEP REASON: Perplexity returns 'sources' in a unique format.
 * AI SDK v5 doesn't standardize citation formats.
 */
export function extractSources(result: GenerationResult): PerplexitySource[] {
  if (Array.isArray(result.sources)) {
    return result.sources as PerplexitySource[];
  }

  const perplexityMetadata = result.providerOptions?.perplexity;
  if (!perplexityMetadata || typeof perplexityMetadata !== 'object') return [];

  const sources = (perplexityMetadata as JSONObject).sources;
  if (!Array.isArray(sources)) return [];

  return sources as unknown as PerplexitySource[];
}

/**
 * Extract image responses from Perplexity
 * UNIQUE TO PERPLEXITY: Image URLs with origin tracking (Tier-2+ only)
 *
 * KEEP REASON: Perplexity's image response structure is unique.
 * Includes 'imageUrl' + 'originUrl' - specific to their API.
 */
export function extractImages(result: GenerationResult): PerplexityImage[] {
  const perplexityMetadata = result.providerOptions?.perplexity;
  if (!perplexityMetadata || typeof perplexityMetadata !== 'object') return [];

  const images = (perplexityMetadata as JSONObject).images;
  if (!Array.isArray(images)) return [];

  return images as unknown as PerplexityImage[];
}

/**
 * Extract usage metadata from Perplexity
 * UNIQUE TO PERPLEXITY: Citation tokens and search query counts
 *
 * KEEP REASON: 'citationTokens' and 'numSearchQueries' are
 * Perplexity-specific metrics not found in other providers.
 */
export function extractUsageMetadata(result: GenerationResult): PerplexityUsageMetadata | null {
  const perplexityMetadata = result.providerOptions?.perplexity;
  if (
    !perplexityMetadata ||
    typeof perplexityMetadata !== 'object' ||
    Array.isArray(perplexityMetadata)
  )
    return null;

  const meta = perplexityMetadata as JSONObject;
  const usage = meta.usage;
  if (!usage || typeof usage !== 'object' || Array.isArray(usage)) return null;

  const usageData = usage as JSONObject;

  return {
    citationTokens: typeof usageData.citationTokens === 'number' ? usageData.citationTokens : 0,
    numSearchQueries:
      typeof usageData.numSearchQueries === 'number' ? usageData.numSearchQueries : 0,
  };
}

/**
 * Extract complete Perplexity provider metadata
 * Comprehensive extraction of all Perplexity-specific data
 *
 * KEEP REASON: Combines all Perplexity-specific metadata.
 * Structure is unique to Perplexity's response format.
 */
export function extractProviderMetadata(result: GenerationResult): PerplexityMetadata | null {
  const perplexityMetadata = result.providerOptions?.perplexity;
  if (!perplexityMetadata || typeof perplexityMetadata !== 'object') return null;

  const meta = perplexityMetadata as JSONObject;
  const usage = meta.usage;
  const images = meta.images;
  const sourcesFromMetadata = meta.sources;
  const sourcesFromResult = Array.isArray(result.sources)
    ? (result.sources as PerplexitySource[])
    : undefined;

  return {
    usage:
      usage && typeof usage === 'object' && !Array.isArray(usage)
        ? {
            citationTokens:
              typeof (usage as any).citationTokens === 'number' ? (usage as any).citationTokens : 0,
            numSearchQueries:
              typeof (usage as any).numSearchQueries === 'number'
                ? (usage as any).numSearchQueries
                : 0,
          }
        : undefined,
    images: Array.isArray(images) ? (images as unknown as PerplexityImage[]) : [],
    sources:
      sourcesFromResult && sourcesFromResult.length > 0
        ? sourcesFromResult
        : Array.isArray(sourcesFromMetadata)
          ? (sourcesFromMetadata as unknown as PerplexitySource[])
          : [],
  };
}

/**
 * PERPLEXITY-UNIQUE CAPABILITY DETECTION
 */

/**
 * Get model capabilities - Perplexity-specific features only
 * For generic capabilities (imageInput, objectGeneration, etc.), use AI SDK v5 native methods
 */
function getModelCapabilities(modelId: string): PerplexityModelCapabilities | undefined {
  return PERPLEXITY_MODEL_CAPABILITIES[modelId as keyof typeof PERPLEXITY_MODEL_CAPABILITIES];
}

/**
 * Check if model supports image responses (Tier-2+ feature)
 * UNIQUE TO PERPLEXITY: return_images provider option
 *
 * KEEP REASON: This checks for Perplexity's specific 'return_images'
 * feature, not generic image input (which AI SDK v5 handles).
 */
export function supportsImageResponses(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.imageResponses ?? false;
}

/**
 * Check if model supports web search
 * UNIQUE TO PERPLEXITY: All models have built-in web search
 *
 * KEEP REASON: Perplexity is the ONLY provider with built-in web search.
 * This is their core differentiator - not generic at all.
 */
export function supportsWebSearch(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.webSearch ?? false;
}

/**
 * Check if model supports citations
 * UNIQUE TO PERPLEXITY: Built-in citation system
 *
 * KEEP REASON: Perplexity's citation system is unique.
 * Other providers don't return 'sources' with web citations.
 */
export function supportsCitations(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.citations ?? false;
}

/**
 * Check if model has reasoning capabilities
 *
 * KEEP REASON: Checks against Perplexity's specific reasoning model list.
 * AI SDK v5 can't know which Perplexity models have reasoning.
 */
export function isReasoningModel(modelId: string): boolean {
  return PERPLEXITY_MODEL_GROUPS.REASONING_MODELS.includes(
    modelId as (typeof PERPLEXITY_MODEL_GROUPS.REASONING_MODELS)[number],
  );
}

/**
 * Check if model is optimized for research
 *
 * KEEP REASON: Identifies Perplexity's research-optimized models.
 * This is Perplexity's own categorization, not a generic concept.
 */
export function isResearchModel(modelId: string): boolean {
  return PERPLEXITY_MODEL_GROUPS.RESEARCH_MODELS.includes(
    modelId as (typeof PERPLEXITY_MODEL_GROUPS.RESEARCH_MODELS)[number],
  );
}

/**
 * PERPLEXITY-UNIQUE TYPE DEFINITIONS
 */

// Source type for Perplexity citations - unique format
export interface PerplexitySource {
  url: string;
  title?: string;
  snippet?: string;
}

// Image type for Perplexity image responses - unique to Perplexity format
export interface PerplexityImage {
  imageUrl: string;
  originUrl: string;
  height?: number;
  width?: number;
}

// Usage metadata type - unique Perplexity metrics
export interface PerplexityUsageMetadata {
  citationTokens: number;
  numSearchQueries: number;
}

// Complete metadata type - Perplexity-specific structure
export interface PerplexityMetadata {
  usage?: PerplexityUsageMetadata;
  images?: PerplexityImage[];
  sources?: PerplexitySource[];
}

// Model capabilities type - PERPLEXITY-UNIQUE features only
// Generic capabilities (imageInput, objectGeneration, etc.) handled by AI SDK v5
interface PerplexityModelCapabilities {
  webSearch: boolean; // Unique: Built-in web search
  citations: boolean; // Unique: Built-in citation system
  imageResponses: boolean; // Unique: return_images provider option
  tierRequirement: 'basic' | 'tier-2' | 'tier-3'; // Unique: Tier-based features
}

/**
 * USAGE EXAMPLES - Perplexity-Unique Features
 *
 * Basic web search with citations:
 * ```typescript
 * const { text, sources } = await generateText({
 *   model: perplexity('sonar-pro'),  // AI SDK v5 pattern
 *   prompt: 'Latest AI developments',
 * });
 * console.log('Sources:', sources);
 * ```
 *
 * Research with images (Tier-2+ only):
 * ```typescript
 * const result = await generateText({
 *   model: perplexity('sonar-pro'),  // AI SDK v5 pattern
 *   prompt: 'Modern architecture examples',
 *   providerOptions: withImages(),  // Simplified helper - returns direct object
 * });
 * const images = extractImages(result);
 * ```
 *
 * Deep research mode:
 * ```typescript
 * const result = await generateText({
 *   model: perplexity('sonar-deep-research'),  // AI SDK v5 pattern
 *   prompt: 'Climate change solutions analysis',
 *   providerOptions: withResearchMode(),  // Simplified helper - returns direct object
 * });
 * ```
 *
 * Direct provider options (alternative to helpers):
 * ```typescript
 * const result = await generateText({
 *   model: perplexity('sonar-pro'),
 *   prompt: 'Architecture with images',
 *   providerOptions: {
 *     perplexity: { return_images: true }  // Direct AI SDK v5 pattern
 *   }
 * });
 * ```
 */
