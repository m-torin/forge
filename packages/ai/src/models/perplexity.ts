/**
 * Perplexity model configurations
 * Following Vercel AI SDK patterns for consistency across apps
 */

import { perplexity } from '@ai-sdk/perplexity';

/**
 * Perplexity Model Capabilities
 * As per official documentation
 */

// Models that support image input
const IMAGE_INPUT_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-deep-research',
  'sonar-reasoning',
  'sonar-reasoning-pro',
  'r1-1776',
] as const;

// Models that support object generation
const OBJECT_GENERATION_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-deep-research',
  'sonar-reasoning',
  'sonar-reasoning-pro',
  'r1-1776',
] as const;

// Models that support tool usage
const TOOL_USAGE_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-deep-research',
  'sonar-reasoning',
  'sonar-reasoning-pro',
  'r1-1776',
] as const;

// Models that support tool streaming
const TOOL_STREAMING_MODELS = [
  'sonar-pro',
  'sonar',
  'sonar-deep-research',
  'sonar-reasoning',
  'sonar-reasoning-pro',
  'r1-1776',
] as const;

// Context length per model (as per official docs)
const MODEL_CONTEXT_LENGTHS = {
  'sonar-deep-research': 128000,
  'sonar-reasoning-pro': 128000,
  'sonar-reasoning': 128000,
  'sonar-pro': 200000,
  sonar: 128000,
  'r1-1776': 128000,
} as const;

// Max output token limits (as per official docs)
const MODEL_OUTPUT_LIMITS = {
  'sonar-pro': 8000,
  sonar: undefined, // No specific limit mentioned
  'sonar-deep-research': undefined, // No specific limit mentioned
  'sonar-reasoning': undefined, // No specific limit mentioned
  'sonar-reasoning-pro': undefined, // No specific limit mentioned
  'r1-1776': undefined, // No specific limit mentioned
} as const;

export const PERPLEXITY_MODELS = {
  // Search models (as per official docs)
  sonar: perplexity('sonar'),
  'sonar-pro': perplexity('sonar-pro'),
  'sonar-deep-research': perplexity('sonar-deep-research'),

  // Reasoning models (as per official docs)
  'sonar-reasoning': perplexity('sonar-reasoning'),
  'sonar-reasoning-pro': perplexity('sonar-reasoning-pro'),

  // Offline models (as per official docs)
  'r1-1776': perplexity('r1-1776'),
} as const;

type PerplexityModelId = keyof typeof PERPLEXITY_MODELS;

// Helper functions to check model capabilities (as per official docs)
export function isImageInputModel(modelId: string): boolean {
  return IMAGE_INPUT_MODELS.includes(modelId as (typeof IMAGE_INPUT_MODELS)[number]);
}

export function isObjectGenerationModel(modelId: string): boolean {
  return OBJECT_GENERATION_MODELS.includes(modelId as (typeof OBJECT_GENERATION_MODELS)[number]);
}

export function isToolUsageModel(modelId: string): boolean {
  return TOOL_USAGE_MODELS.includes(modelId as (typeof TOOL_USAGE_MODELS)[number]);
}

export function isToolStreamingModel(modelId: string): boolean {
  return TOOL_STREAMING_MODELS.includes(modelId as (typeof TOOL_STREAMING_MODELS)[number]);
}

function getModelContextLength(modelId: string): number | undefined {
  return MODEL_CONTEXT_LENGTHS[modelId as keyof typeof MODEL_CONTEXT_LENGTHS];
}

function getModelOutputLimit(modelId: string): number | undefined {
  return MODEL_OUTPUT_LIMITS[modelId as keyof typeof MODEL_OUTPUT_LIMITS];
}

// Get model capabilities as per official documentation
export function getModelCapabilities(modelId: string): {
  imageInput: boolean;
  objectGeneration: boolean;
  toolUsage: boolean;
  toolStreaming: boolean;
  contextLength: number | undefined;
  outputLimit: number | undefined;
} {
  return {
    imageInput: isImageInputModel(modelId),
    objectGeneration: isObjectGenerationModel(modelId),
    toolUsage: isToolUsageModel(modelId),
    toolStreaming: isToolStreamingModel(modelId),
    contextLength: getModelContextLength(modelId),
    outputLimit: getModelOutputLimit(modelId),
  };
}

// Tier 2 Perplexity configuration with sensible defaults
interface PerplexityTier2Config {
  tier2?: {
    enabled?: boolean; // Enable Tier 2 features (default: false)
    return_images?: boolean; // Enable image responses (default: false)
  };
  search?: {
    focus?: 'auto' | 'news' | 'academic' | 'writing' | 'programming'; // default: 'auto'
    recency_filter?: 'day' | 'week' | 'month' | 'year'; // default: undefined
    domain_filter?: string; // Specific domain to search
    country_filter?: string; // Country code for localized results
    language_filter?: string; // Language code for results
    safe_search?: boolean; // Enable safe search filtering (default: false)
    include_domains?: readonly string[]; // Domains to include
    exclude_domains?: readonly string[]; // Domains to exclude
    include_answer?: boolean; // Include answer in search results (default: true)
    include_raw_content?: boolean; // Include raw content in results (default: false)
    include_images?: boolean; // Include images in search (default: false)
    max_results?: number; // Maximum number of search results (default: 10)
    highlight?: boolean; // Highlight search terms in results (default: false)
    use_autoprompt?: boolean; // Use automatic prompt enhancement (default: true)
    use_cache?: boolean; // Use cached search results (default: true)
  };
  search_types?: {
    web_search?: boolean; // Enable web search (default: true)
    news_search?: boolean; // Enable news search (default: true)
    academic_search?: boolean; // Enable academic search (default: true)
    writing_search?: boolean; // Enable writing search (default: true)
    programming_search?: boolean; // Enable programming search (default: true)
  };
}

// Default configuration for Tier 2 Perplexity
const DEFAULT_PERPLEXITY_TIER2_CONFIG: PerplexityTier2Config = {
  tier2: {
    enabled: false,
    return_images: false,
  },
  search: {
    focus: 'auto',
    safe_search: false,
    include_answer: true,
    include_raw_content: false,
    include_images: false,
    max_results: 10,
    highlight: false,
    use_autoprompt: true,
    use_cache: true,
  },
  search_types: {
    web_search: true,
    news_search: true,
    academic_search: true,
    writing_search: true,
    programming_search: true,
  },
};

// Preset configurations for common use cases
const PERPLEXITY_PRESETS = {
  academic: {
    tier2: { enabled: true, return_images: false },
    search: {
      focus: 'academic',
      recency_filter: 'month',
      include_domains: [
        'arxiv.org',
        'researchgate.net',
        'scholar.google.com',
        'ieee.org',
        'acm.org',
      ],
      include_raw_content: true,
      max_results: 15,
      highlight: true,
    },
    search_types: {
      web_search: true,
      news_search: false,
      academic_search: true,
      writing_search: false,
      programming_search: false,
    },
  },
  news: {
    tier2: { enabled: true, return_images: true },
    search: {
      focus: 'news',
      recency_filter: 'day',
      include_domains: ['reuters.com', 'ap.org', 'bbc.com', 'cnn.com', 'nytimes.com'],
      max_results: 12,
      highlight: true,
    },
    search_types: {
      web_search: true,
      news_search: true,
      academic_search: false,
      writing_search: false,
      programming_search: false,
    },
  },
  programming: {
    tier2: { enabled: true, return_images: false },
    search: {
      focus: 'programming',
      include_domains: [
        'github.com',
        'stackoverflow.com',
        'docs.python.org',
        'developer.mozilla.org',
      ],
      include_raw_content: true,
      max_results: 8,
      highlight: true,
    },
    search_types: {
      web_search: true,
      news_search: false,
      academic_search: false,
      writing_search: false,
      programming_search: true,
    },
  },
  writing: {
    tier2: { enabled: true, return_images: false },
    search: {
      focus: 'writing',
      include_domains: ['medium.com', 'substack.com', 'wordpress.com'],
      max_results: 10,
      highlight: true,
    },
    search_types: {
      web_search: true,
      news_search: false,
      academic_search: false,
      writing_search: true,
      programming_search: false,
    },
  },
  general_with_images: {
    tier2: { enabled: true, return_images: true },
    search: {
      focus: 'auto',
      max_results: 10,
      highlight: false,
    },
    search_types: {
      web_search: true,
      news_search: true,
      academic_search: true,
      writing_search: true,
      programming_search: true,
    },
  },
} as const;

// Perplexity provider metadata interface
interface PerplexityProviderMetadata {
  usage?: {
    citationTokens: number;
    numSearchQueries: number;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  images?: Array<{
    imageUrl: string;
    originUrl: string;
    height: number;
    width: number;
    title?: string;
    description?: string;
  }>;
  searchResults?: Array<{
    url: string;
    title: string;
    snippet: string;
    publishedDate?: string;
    source?: string;
  }>;
  citations?: Array<{
    url: string;
    title: string;
    snippet: string;
    relevanceScore?: number;
  }>;
}

// Re-export metadata from shared location
export { PERPLEXITY_MODEL_METADATA } from './metadata';
