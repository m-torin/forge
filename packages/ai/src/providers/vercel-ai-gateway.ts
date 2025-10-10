/**
 * Vercel AI Gateway Provider Integration
 *
 * Official integration with Vercel's AI Gateway, providing:
 * - Unified API access to 250+ models from multiple providers
 * - Built-in budgeting, monitoring, and load balancing
 * - Both API key and OIDC token authentication
 * - Dynamic model discovery and pricing information
 * - Provider-specific options support (e.g., Anthropic thinking)
 *
 * @see https://vercel.com/ai-gateway
 * @see https://ai-sdk.dev/docs/providers/ai-gateway
 */

import type { EmbeddingModelV2, LanguageModelV2, ProviderV2 } from '@ai-sdk/provider';

// Import types from @ai-sdk/gateway for use
import type { GatewayLanguageModelEntry } from '@ai-sdk/gateway';

// Re-export for convenience
export type { GatewayLanguageModelEntry, GatewayModelId } from '@ai-sdk/gateway';

// Define the missing type locally
export interface GatewayEmbeddingModelEntry {
  provider: string;
  modelId: string;
  dimensions?: number;
}

/**
 * Configuration options for Vercel AI Gateway provider instances
 */
export interface VercelAiGatewayConfig {
  /**
   * API key for authentication. If not provided, will use AI_GATEWAY_API_KEY environment variable.
   */
  apiKey?: string;

  /**
   * Base URL for the AI Gateway API.
   * @default 'https://ai-gateway.vercel.sh/v1/ai'
   */
  baseURL?: string;

  /**
   * Custom headers to include with requests
   */
  headers?: Record<string, string>;

  /**
   * Request timeout in milliseconds
   */
  timeout?: number;

  /**
   * Custom fetch implementation
   */
  fetch?: typeof fetch;
}

/**
 * Settings for language model configuration
 */
export interface ModelSettings {
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  seed?: number;
  providerOptions?: Record<string, Record<string, unknown>>;
}

/**
 * Enhanced provider wrapper that includes metadata about the gateway
 */
export interface VercelAiGatewayProvider {
  /** Official @ai-sdk/gateway provider instance */
  readonly provider: ProviderV2; // Properly typed as ProviderV2

  /** Create a language model instance */
  languageModel: (modelId: string, settings?: ModelSettings) => LanguageModelV2;

  /** Create a text embedding model instance */
  textEmbeddingModel: (modelId: string, settings?: ModelSettings) => EmbeddingModelV2<string>;

  /** Get available models with pricing and metadata */
  getAvailableModels: () => Promise<{ models: GatewayLanguageModelEntry[] }>;

  /** Provider metadata */
  readonly metadata: {
    name: 'vercel-ai-gateway';
    type: 'gateway-infrastructure';
    features: string[];
    authentication: string[];
  };
}

/**
 * Popular model configurations for quick access
 */
export const VERCEL_GATEWAY_MODEL_PRESETS = {
  // Balanced cost/performance models
  balanced: {
    primary: 'openai/gpt-4o-mini',
    fallback: 'anthropic/claude-3-haiku-20240307',
    description: 'Cost-effective models with good performance',
  },

  // Premium high-performance models
  premium: {
    primary: 'openai/gpt-4o',
    fallback: 'anthropic/claude-3-5-sonnet-20241022',
    description: 'High-performance models for complex tasks',
  },

  // Models optimized for reasoning
  reasoningText: {
    primary: 'anthropic/claude-3-5-sonnet-20241022',
    fallback: 'openai/gpt-4o',
    description: 'Models optimized for complex reasoning and analysis',
  },

  // Fast response models
  speed: {
    primary: 'openai/gpt-4o-mini',
    fallback: 'groq/llama-3.1-8b-instant',
    description: 'Models optimized for fast response times',
  },

  // Embedding models
  embedding: {
    primary: 'openai/text-embedding-3-small',
    fallback: 'openai/text-embedding-ada-002',
    description: 'Text embedding models for semantic search',
  },
} as const;

/**
 * Create a Vercel AI Gateway provider instance
 *
 * @example
 * ```typescript
 * // Basic usage with environment variables
 * const gateway = createVercelAiGateway();
 *
 * // Custom configuration
 * const customGateway = createVercelAiGateway({
 *   apiKey: 'your-api-key',
 *   baseURL: 'https://custom-gateway.com/v1',
 *   timeout: 30000
 * });
 *
 * // Use with generateText
 * import { generateText } from 'ai';
 *
 * const result = await generateText({
 *   model: gateway.languageModel('openai/gpt-4o'),
 *   prompt: 'Hello world'
 * });
 * ```
 */
export function createVercelAiGateway(config: VercelAiGatewayConfig = {}): VercelAiGatewayProvider {
  let gatewayProvider: ProviderV2;

  try {
    // Dynamic import to handle optional dependency
    const { createGateway } = require('@ai-sdk/gateway');

    gatewayProvider = createGateway({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      headers: config.headers,
      ...(config.fetch && { fetch: config.fetch }),
    });
  } catch (error) {
    throw new Error(
      `@ai-sdk/gateway is required for Vercel AI Gateway support. Install it with: pnpm add @ai-sdk/gateway`,
    );
  }

  return {
    provider: gatewayProvider,

    languageModel: (modelId: string, settings?: ModelSettings) => {
      return gatewayProvider.languageModel(modelId);
    },

    textEmbeddingModel: (modelId: string, settings?: ModelSettings) => {
      return gatewayProvider.textEmbeddingModel(modelId);
    },

    getAvailableModels: async () => {
      // Note: This is a stub implementation since ProviderV2 doesn't have getAvailableModels
      // But the interface expects it. Real implementation would need to query the gateway API
      return { models: [] };
    },

    metadata: {
      name: 'vercel-ai-gateway',
      type: 'gateway-infrastructure',
      features: [
        'unified-api',
        'budget-monitoring',
        'usage-analytics',
        'load-balancing',
        'model-discovery',
        'provider-options',
        'multiple-providers',
      ],
      authentication: ['api-key', 'oidc-token'],
    },
  };
}

/**
 * Get the default Vercel AI Gateway provider instance
 * Uses environment variables for configuration
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 *
 * const result = await generateText({
 *   model: gateway.languageModel('anthropic/claude-3-5-sonnet'),
 *   prompt: 'Explain quantum computing'
 * });
 * ```
 */
export function getDefaultVercelAiGateway(): VercelAiGatewayProvider {
  try {
    // Use the default gateway instance from @ai-sdk/gateway
    const { gateway } = require('@ai-sdk/gateway');

    return {
      provider: gateway,

      languageModel: (modelId: string, settings?: ModelSettings) => {
        return gateway(modelId, settings);
      },

      textEmbeddingModel: (modelId: string, settings?: ModelSettings) => {
        return gateway.textEmbeddingModel(modelId, settings);
      },

      getAvailableModels: async () => {
        return gateway.getAvailableModels();
      },

      metadata: {
        name: 'vercel-ai-gateway',
        type: 'gateway-infrastructure',
        features: [
          'unified-api',
          'budget-monitoring',
          'usage-analytics',
          'load-balancing',
          'model-discovery',
          'provider-options',
          'multiple-providers',
        ],
        authentication: ['api-key', 'oidc-token'],
      },
    };
  } catch (error) {
    throw new Error(
      `@ai-sdk/gateway is required for Vercel AI Gateway support. Install it with: pnpm add @ai-sdk/gateway`,
    );
  }
}

/**
 * Create a model preset configuration for common use cases
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 * const balancedModel = createModelPreset(gateway, 'balanced');
 *
 * const result = await generateText({
 *   model: balancedModel,
 *   prompt: 'Hello world'
 * });
 * ```
 */
export function createModelPreset(
  gateway: VercelAiGatewayProvider,
  preset: keyof typeof VERCEL_GATEWAY_MODEL_PRESETS,
  customSettings?: ModelSettings,
): LanguageModelV2 {
  const presetConfig = VERCEL_GATEWAY_MODEL_PRESETS[preset];

  if (preset === 'embedding') {
    throw new Error('Use createEmbeddingPreset for embedding models');
  }

  return gateway.languageModel(presetConfig.primary, customSettings);
}

/**
 * Create an embedding model preset
 */
export function createEmbeddingPreset(
  gateway: VercelAiGatewayProvider,
  preset: 'embedding' = 'embedding',
  customSettings?: ModelSettings,
): EmbeddingModelV2<string> {
  const presetConfig = VERCEL_GATEWAY_MODEL_PRESETS.embedding;
  return gateway.textEmbeddingModel(presetConfig.primary, customSettings);
}

/**
 * Helper to discover and filter available models
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 *
 * // Get all language models
 * const languageModels = await discoverModels(gateway, { type: 'language' });
 *
 * // Get affordable models under $0.001 per token
 * const affordableModels = await discoverModels(gateway, {
 *   maxInputPrice: 0.001,
 *   maxOutputPrice: 0.001
 * });
 * ```
 */
export async function discoverModels(
  gateway: VercelAiGatewayProvider,
  filters: {
    type?: 'language' | 'embedding';
    provider?: string;
    maxInputPrice?: number;
    maxOutputPrice?: number;
    namePattern?: RegExp;
  } = {},
) {
  const available = await gateway.getAvailableModels();

  return available.models.filter(model => {
    if (filters.type && model.modelType !== filters.type) return false;

    if (filters.provider && !model.id.startsWith(filters.provider + '/')) return false;

    if (filters.namePattern && !filters.namePattern.test(model.id)) return false;

    if (
      filters.maxInputPrice &&
      model.pricing?.input &&
      typeof model.pricing.input === 'number' &&
      model.pricing.input > filters.maxInputPrice
    )
      return false;
    if (
      filters.maxOutputPrice &&
      model.pricing?.output &&
      typeof model.pricing.output === 'number' &&
      model.pricing.output > filters.maxOutputPrice
    )
      return false;

    return true;
  });
}

/**
 * Discover models by capability across all providers
 * Leverages the gateway's cross-provider visibility to find models with specific capabilities
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 *
 * // Find all reasoning-capable models
 * const reasoningModels = await discoverModelsByCapability(gateway, 'reasoning');
 *
 * // Find vision models for image processing
 * const visionModels = await discoverModelsByCapability(gateway, 'vision');
 * ```
 */
export async function discoverModelsByCapability(
  gateway: VercelAiGatewayProvider,
  capability: 'reasoning' | 'vision' | 'function-calling' | 'image-generation' | 'embeddings',
) {
  const models = await gateway.getAvailableModels();

  // Capability detection patterns
  const capabilityPatterns: Record<string, RegExp[]> = {
    reasoningText: [/reasoning|think|o[13]|deepseek-r1|qwen.*think/i],
    vision: [/vision|gpt-4[ov]|claude-3|gemini.*pro|llava/i],
    'function-calling': [/gpt-[34]|claude-3|gemini.*pro|mistral.*large|llama.*tool/i],
    'image-generation': [/dall-e|imagen|midjourney|stable.*diffusion|flux/i],
    embeddings: [/embed|ada-002|text-.*-3|e5-|bge-/i],
  };

  const patterns = capabilityPatterns[capability] || [];

  return models.models.filter(model => {
    // Filter by model type first
    if (capability === 'embeddings' && model.modelType !== 'embedding') return false;
    if (capability !== 'embeddings' && model.modelType !== 'language') return false;

    // Check if model name matches capability patterns
    return patterns.some(pattern => pattern.test(model.id) || pattern.test(model.name || ''));
  });
}

/**
 * Find the most cost-effective model that meets specific requirements
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 *
 * // Find cheapest reasoning model
 * const cheapestReasoning = await findCheapestModel(gateway, {
 *   capability: 'reasoning',
 *   maxInputPrice: 0.01
 * });
 *
 * // Find most affordable general model
 * const cheapestGeneral = await findCheapestModel(gateway, {
 *   providers: ['openai', 'anthropic']
 * });
 * ```
 */
export async function findCheapestModel(
  gateway: VercelAiGatewayProvider,
  requirements: {
    capability?: 'reasoning' | 'vision' | 'function-calling' | 'image-generation' | 'embeddings';
    providers?: string[];
    maxInputPrice?: number;
    maxOutputPrice?: number;
  } = {},
) {
  let models;

  if (requirements.capability) {
    models = await discoverModelsByCapability(gateway, requirements.capability);
  } else {
    const allModels = await gateway.getAvailableModels();
    models = allModels.models;
  }

  // Apply filters
  const filtered = models.filter(model => {
    if (requirements.providers) {
      const hasProvider = requirements.providers.some(provider =>
        model.id.startsWith(provider + '/'),
      );
      if (!hasProvider) return false;
    }

    if (
      requirements.maxInputPrice &&
      model.pricing?.input &&
      typeof model.pricing.input === 'number' &&
      model.pricing.input > requirements.maxInputPrice
    )
      return false;
    if (
      requirements.maxOutputPrice &&
      model.pricing?.output &&
      typeof model.pricing.output === 'number' &&
      model.pricing.output > requirements.maxOutputPrice
    )
      return false;

    return true;
  });

  // Sort by input price (primary cost factor)
  const sorted = filtered.sort((a, b) => {
    const priceA = typeof a.pricing?.input === 'number' ? a.pricing.input : Infinity;
    const priceB = typeof b.pricing?.input === 'number' ? b.pricing.input : Infinity;
    return priceA - priceB;
  });

  return sorted[0] || null;
}

/**
 * Find models optimized for cost vs performance balance
 *
 * @example
 * ```typescript
 * const gateway = getDefaultVercelAiGateway();
 * const balancedModels = await findBalancedModels(gateway, { maxBudget: 0.02 });
 * ```
 */
export async function findBalancedModels(
  gateway: VercelAiGatewayProvider,
  options: {
    maxBudget?: number;
    preferredProviders?: string[];
  } = {},
) {
  const models = await discoverModels(gateway, {
    type: 'language',
    ...(options.maxBudget && { maxInputPrice: options.maxBudget }),
  });

  // Score models based on cost-effectiveness
  const scored = models.map(model => {
    const inputPrice = typeof model.pricing?.input === 'number' ? model.pricing.input : 0;
    const outputPrice = typeof model.pricing?.output === 'number' ? model.pricing.output : 0;

    // Simple scoring: lower price = higher score, with provider preference boost
    let score = 1 / (inputPrice + 0.001); // Avoid division by zero

    if (options.preferredProviders) {
      const isPreferred = options.preferredProviders.some(provider =>
        model.id.startsWith(provider + '/'),
      );
      if (isPreferred) score *= 1.5; // 50% boost for preferred providers
    }

    return { ...model, score };
  });

  // Return top 5 balanced models
  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Model variant configuration options
 */
export interface ModelVariantOptions {
  /** Claude Sonnet 4 1M token context window */
  'anthropic-1m-context'?: boolean;
  /** Custom variant headers */
  custom?: Record<string, string>;
}

/**
 * Composable helper for model variants and special features
 * Supports provider-specific model variants like Claude's 1M context window
 *
 * @example
 * ```typescript
 * generateText({
 *   model: gateway('anthropic/claude-sonnet-4'),
 *   ...withModelVariant('anthropic-1m-context'),
 *   ...withGatewayRouting({ only: ['anthropic'] }),
 *   prompt: 'Large document analysis...'
 * });
 * ```
 */
export function withModelVariant(
  variant: keyof ModelVariantOptions | string,
  customHeaders?: Record<string, string>,
) {
  // Map known variants to their required headers
  const variantHeaders: Record<string, Record<string, string>> = {
    'anthropic-1m-context': {
      'anthropic-beta': 'context-1m-2025-08-07',
    },
  };

  const headers = variantHeaders[variant] || customHeaders || {};

  return { headers };
}

/**
 * Specialized helper for Claude Sonnet 4 with 1M token context
 *
 * @example
 * ```typescript
 * generateText({
 *   model: gateway('anthropic/claude-sonnet-4'),
 *   ...withClaudeContext1M(),
 *   prompt: 'Analyze this very large document...'
 * });
 * ```
 */
export function withClaudeContext1M() {
  return {
    headers: {
      'anthropic-beta': 'context-1m-2025-08-07',
    },
    providerOptions: {
      gateway: {
        only: ['anthropic'], // Ensure we use Anthropic provider for this variant
      },
    },
  };
}

/**
 * Authentication helper - check if OIDC token is available
 */
export function hasOidcAuthentication(): boolean {
  return !!(
    process.env.VERCEL_OIDC_TOKEN ||
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL
  );
}

/**
 * Authentication helper - check if API key is available
 */
export function hasApiKeyAuthentication(): boolean {
  return !!process.env.AI_GATEWAY_API_KEY;
}

/**
 * Get authentication status and recommendations
 */
export function getAuthenticationStatus() {
  const hasOidc = hasOidcAuthentication();
  const hasApiKey = hasApiKeyAuthentication();

  return {
    hasOidc,
    hasApiKey,
    isAuthenticated: hasOidc || hasApiKey,
    preferredMethod: hasOidc ? 'oidc' : hasApiKey ? 'api-key' : null,
    recommendations:
      !hasOidc && !hasApiKey
        ? [
            'Set AI_GATEWAY_API_KEY environment variable',
            'Or deploy to Vercel for OIDC authentication',
          ]
        : [],
  };
}

/**
 * Gateway routing configuration options
 */
export interface GatewayRoutingOptions {
  /** Provider order for routing attempts */
  order?: string[];
  /** Restrict routing to only these providers */
  only?: string[];
}

/**
 * App attribution configuration for Vercel ecosystem integration
 */
export interface AppAttributionOptions {
  /** HTTP referer header for app attribution */
  referer?: string;
  /** Human-readable app title */
  title?: string;
}

/**
 * Gateway cost management options
 */
export interface GatewayCostOptions {
  /** Maximum cost per request in dollars */
  maxCost?: number;
  /** Cost tracking callback */
  onCostExceeded?: (cost: number, limit: number) => void;
}

/**
 * Composable helper for gateway provider routing control
 * Returns configuration object that can be spread into generateText/streamText calls
 *
 * @example
 * ```typescript
 * generateText({
 *   model: gateway('anthropic/claude-sonnet'),
 *   ...withGatewayRouting({ order: ['anthropic', 'bedrock'] }),
 *   prompt: 'Hello world'
 * });
 * ```
 */
export function withGatewayRouting(options: GatewayRoutingOptions) {
  return {
    providerOptions: {
      gateway: options,
    },
  };
}

/**
 * Composable helper for app attribution headers
 * Enables Vercel ecosystem integration and app featuring
 *
 * @example
 * ```typescript
 * generateText({
 *   model: gateway('openai/gpt-4o'),
 *   ...withAppAttribution({ referer: 'https://myapp.vercel.app', title: 'MyApp' }),
 *   prompt: 'Hello world'
 * });
 * ```
 */
export function withAppAttribution(options: AppAttributionOptions) {
  const headers: Record<string, string> = {};

  if (options.referer) {
    headers['http-referer'] = options.referer;
  }

  if (options.title) {
    headers['x-title'] = options.title;
  }

  return { headers };
}

/**
 * Composable helper for gateway cost management
 *
 * @example
 * ```typescript
 * generateText({
 *   model: gateway('openai/gpt-4o'),
 *   ...withCostLimit({ maxCost: 0.05 }),
 *   prompt: 'Hello world'
 * });
 * ```
 */
export function withCostLimit(options: GatewayCostOptions) {
  return {
    providerOptions: {
      gateway: {
        ...(options.maxCost && { maxCost: options.maxCost }),
      },
    },
  };
}

interface GatewayMetadataResult {
  providerOptions?: {
    gateway?: {
      routing?: {
        finalProvider?: string;
        attempts?: unknown[];
      };
      cost?: string;
    };
  };
}

/**
 * Extract gateway routing metadata from AI SDK result
 * Provides insights into which provider was used, routing decisions, and costs
 *
 * @example
 * ```typescript
 * const result = await generateText({ model: gateway('anthropic/claude') });
 * const metadata = extractGatewayMetadata(result);
 * console.log(`Used provider: ${metadata.provider}, Cost: ${metadata.cost}`);
 * ```
 */
export function extractGatewayMetadata(result: GatewayMetadataResult) {
  const gatewayMeta = result.providerOptions?.gateway;

  if (!gatewayMeta) {
    return {
      provider: null,
      cost: null,
      routing: null,
      attempts: [],
    };
  }

  return {
    provider: gatewayMeta.routing?.finalProvider || null,
    cost: gatewayMeta.cost ? parseFloat(gatewayMeta.cost) : null,
    routing: gatewayMeta.routing || null,
    attempts: gatewayMeta.routing?.attempts || [],
  };
}

/**
 * Provider configuration constants
 */
export const VERCEL_AI_GATEWAY_CONSTANTS = {
  DEFAULT_BASE_URL: 'https://ai-gateway.vercel.sh/v1/ai',
  DEFAULT_TIMEOUT: 30000,
  ENV_VAR_API_KEY: 'AI_GATEWAY_API_KEY',
  ENV_VAR_BASE_URL: 'AI_GATEWAY_BASE_URL',

  // Popular model IDs for quick reference
  POPULAR_MODELS: {
    // OpenAI
    GPT_4O: 'openai/gpt-4o',
    GPT_4O_MINI: 'openai/gpt-4o-mini',

    // Anthropic
    CLAUDE_3_5_SONNET: 'anthropic/claude-3-5-sonnet-20241022',
    CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku-20240307',

    // xAI
    GROK_BETA: 'xai/grok-beta',

    // Perplexity
    LLAMA_3_1_SONAR_LARGE: 'perplexity/llama-3.1-sonar-large-128k-online',

    // Embedding models
    TEXT_EMBEDDING_3_SMALL: 'openai/text-embedding-3-small',
    TEXT_EMBEDDING_ADA_002: 'openai/text-embedding-ada-002',
  },
} as const;

// Default export for convenience
export const vercelAiGateway = {
  // Core gateway functionality
  create: createVercelAiGateway,
  getDefault: getDefaultVercelAiGateway,
  createPreset: createModelPreset,
  createEmbeddingPreset,

  // Enhanced model discovery
  discoverModels,
  discoverModelsByCapability,
  findCheapestModel,
  findBalancedModels,

  // Composition helpers (orthogonal to provider helpers)
  withGatewayRouting,
  withAppAttribution,
  withCostLimit,
  extractGatewayMetadata,

  // Model variants
  withModelVariant,
  withClaudeContext1M,

  // Constants and presets
  constants: VERCEL_AI_GATEWAY_CONSTANTS,
  presets: VERCEL_GATEWAY_MODEL_PRESETS,

  // Authentication helpers
  auth: {
    hasOidc: hasOidcAuthentication,
    hasApiKey: hasApiKeyAuthentication,
    getStatus: getAuthenticationStatus,
  },
};
