import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { createPerplexity } from '@ai-sdk/perplexity';
import type { LanguageModelV2 } from '@ai-sdk/provider';
import { InvalidArgumentError, NoSuchModelError } from '@ai-sdk/provider';
import { logDebug } from '@repo/observability';
import { createProviderRegistry, defaultSettingsMiddleware, wrapLanguageModel } from 'ai';
import { safeEnv } from '../../env';
import { lruCacheFragments } from '../core/fragments';
import { createLRUCacheMiddleware } from '../tools/lru-cache-middleware';

// OpenAI middleware removed for DRY compliance
// REASON: These were unnecessary abstractions over AI SDK v5 patterns.
// Use direct providerOptions with helper functions instead.

/**
 * AI SDK v5 Enhanced Provider Registry
 * Combines environment awareness with sophisticated model pre-configuration
 * All models include caching, semantic naming, and optimized settings
 */

// Helper to create models with settings and caching - ALL models have caching built-in by default
const modelWithSettings = (
  model: LanguageModelV2,
  [temperature, maxOutputTokens]: [number, number],
) =>
  wrapLanguageModel({
    model,
    middleware: [
      defaultSettingsMiddleware({
        settings: { temperature, maxOutputTokens },
      }),
      createLRUCacheMiddleware(lruCacheFragments.basic), // All models get basic caching
    ],
  });

// Helper for models without custom settings - still gets caching
const modelWithCache = (baseModel: LanguageModelV2) =>
  wrapLanguageModel({
    model: baseModel,
    middleware: createLRUCacheMiddleware(lruCacheFragments.basic), // All models get basic caching
  });

// Helper function for parsing LM Studio models (inline to avoid circular imports)
function parseLMStudioModelsSync(
  modelsEnv: string,
): Array<{ id: string; name: string; type: 'language' | 'embedding' }> {
  if (!modelsEnv) return [];

  try {
    // Try JSON format first
    const parsed = JSON.parse(modelsEnv);
    if (Array.isArray(parsed)) {
      return parsed.map((model: { id?: string; name?: string; type?: string }) => ({
        id: model.id || model.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'model',
        name: model.name || model.id || 'model',
        type: (model.type || 'language') as 'language' | 'embedding',
      }));
    }
  } catch {
    // Fall back to comma-separated format
    return modelsEnv
      .split(',')
      .map(modelName => {
        const trimmed = modelName.trim();
        return {
          id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: trimmed,
          type: 'language' as const,
        };
      })
      .filter(model => model.name);
  }

  return [];
}

// Create AI SDK v5 enhanced registry with environment awareness
function createRegistry() {
  const env = safeEnv();

  // Create providers object for registry
  const providers: Record<string, any> = {};

  // Core providers - only add if API keys are available
  if (env.ANTHROPIC_API_KEY) {
    providers.anthropic = createAnthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: env.ANTHROPIC_BASE_URL,
    });
  }

  if (env.OPENAI_API_KEY) {
    providers.openai = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
      organization: env.OPENAI_ORGANIZATION,
    });
  }

  if (env.PERPLEXITY_API_KEY) {
    providers.perplexity = createPerplexity({
      apiKey: env.PERPLEXITY_API_KEY,
    });
  }

  if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
    providers.google = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
      baseURL: env.GOOGLE_GENERATIVE_AI_BASE_URL,
    });
  }

  if (env.LM_STUDIO_BASE_URL) {
    providers.lmstudio = createOpenAICompatible({
      name: 'lmstudio',
      baseURL: env.LM_STUDIO_BASE_URL,
      // No API key required for local LM Studio server
    });
  }

  return createProviderRegistry(providers);
}

/**
 * Create registry with optional providers (async)
 */
export async function createRegistryOptionalAsync(): Promise<typeof registry> {
  const env = safeEnv();
  const baseRegistry = createRegistry();
  const additionalProviders: Record<string, any> = {};

  // Always attempt to add Claude Code provider (optional community provider)
  // Note: Claude Code handles authentication internally (claude login OR ANTHROPIC_API_KEY)
  try {
    // Import Claude Code provider dynamically
    const claudeCodeModule = await import('ai-sdk-provider-claude-code').catch(() => null);
    if (!claudeCodeModule) {
      logDebug('Claude Code provider not available');
      return baseRegistry;
    }

    const { createClaudeCode } = claudeCodeModule;

    // Get user configuration from environment (all optional)
    const claudeCodeConfig = {
      allowedTools: env.CLAUDE_CODE_ALLOWED_TOOLS?.split(',')
        .map(t => t.trim())
        .filter(Boolean),
      disallowedTools: env.CLAUDE_CODE_DISALLOWED_TOOLS?.split(',')
        .map(t => t.trim())
        .filter(Boolean),
      mcpServers: env.CLAUDE_CODE_MCP_SERVERS?.split(',')
        .map(s => s.trim())
        .filter(Boolean),
      anthropicDir: env.CLAUDE_CODE_ANTHROPIC_DIR,
    };

    // Remove undefined properties
    const cleanConfig = Object.fromEntries(
      Object.entries(claudeCodeConfig).filter(([_, value]) => value !== undefined),
    );

    // Create provider instance for both registry and direct use
    const claudeCodeProvider = createClaudeCode(
      Object.keys(cleanConfig).length > 0 ? cleanConfig : undefined,
    );

    // Let Claude Code provider handle authentication internally
    additionalProviders.claudeCode = claudeCodeProvider;
  } catch (error) {
    // Silently handle missing optional dependency
    // This allows the package to work without Claude Code installed
  }

  // Load Cloudflare AI Gateway provider (async)
  try {
    const aiGatewayModule = await import('ai-gateway-provider').catch(() => null);
    if (aiGatewayModule) {
      const { createAiGateway } = aiGatewayModule;

      // Get configuration from environment
      const gatewayConfig = {
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        gateway: env.CLOUDFLARE_AI_GATEWAY_NAME,
        apiKey: env.CLOUDFLARE_API_KEY,
      };

      // Remove undefined properties
      const cleanGatewayConfig = Object.fromEntries(
        Object.entries(gatewayConfig).filter(([_, value]) => value !== undefined),
      );

      // Only create if we have required config
      if (cleanGatewayConfig.accountId && cleanGatewayConfig.gateway) {
        additionalProviders.cloudflareAiGateway = createAiGateway({
          accountId: cleanGatewayConfig.accountId as string,
          gateway: cleanGatewayConfig.gateway as string,
          apiKey: cleanGatewayConfig.apiKey as string,
        });
      }
    }
  } catch (error) {
    // Silently handle missing optional dependency
  }

  // Load Vercel AI Gateway provider (async)
  try {
    const vercelGatewayModule = await import('@ai-sdk/gateway').catch(() => null);
    if (vercelGatewayModule) {
      const { createGateway } = vercelGatewayModule;

      // Get configuration from environment
      const gatewayConfig = {
        apiKey: env.AI_GATEWAY_API_KEY,
      };

      // Remove undefined properties
      const cleanGatewayConfig = Object.fromEntries(
        Object.entries(gatewayConfig).filter(([_, value]) => value !== undefined),
      );

      if (Object.keys(cleanGatewayConfig).length > 0) {
        additionalProviders.vercelAiGateway = createGateway(cleanGatewayConfig);
      }
    }
  } catch (error) {
    // Silently handle missing optional dependency
  }

  // If we have additional providers, create a new registry with combined providers
  if (Object.keys(additionalProviders).length > 0) {
    // Get base providers from the createRegistry function
    const env = safeEnv();
    const baseProviders: Record<string, any> = {};

    // Rebuild base providers (same logic as createRegistry)
    if (env.ANTHROPIC_API_KEY) {
      baseProviders.anthropic = createAnthropic({
        apiKey: env.ANTHROPIC_API_KEY,
        baseURL: env.ANTHROPIC_BASE_URL,
      });
    }

    if (env.OPENAI_API_KEY) {
      baseProviders.openai = createOpenAI({
        apiKey: env.OPENAI_API_KEY,
        baseURL: env.OPENAI_BASE_URL,
        organization: env.OPENAI_ORGANIZATION,
      });
    }

    if (env.PERPLEXITY_API_KEY) {
      baseProviders.perplexity = createPerplexity({
        apiKey: env.PERPLEXITY_API_KEY,
      });
    }

    if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
      baseProviders.google = createGoogleGenerativeAI({
        apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
        baseURL: env.GOOGLE_GENERATIVE_AI_BASE_URL,
      });
    }

    if (env.LM_STUDIO_BASE_URL) {
      baseProviders.lmstudio = createOpenAICompatible({
        name: 'lmstudio',
        baseURL: env.LM_STUDIO_BASE_URL,
      });
    }

    // Combine base and additional providers
    const allProviders = { ...baseProviders, ...additionalProviders };
    return createProviderRegistry(allProviders);
  }

  return baseRegistry;
}

// Primary registry instance
export const registry = createRegistry();

// Unified interface that matches AI SDK v5 patterns
export const models = {
  /**
   * Get language model using AI SDK v5 native registry
   * @param modelId Format: 'provider:model' (e.g., 'openai:gpt-4', 'anthropic:claude-3-5-sonnet') or semantic name
   */
  language: (modelId: LanguageModelId) => {
    // Handle semantic model mapping
    const resolvedModelId = semanticModels[modelId] || modelId;
    // Ensure proper provider:model format
    if (!resolvedModelId.includes(':')) {
      throw new InvalidArgumentError({
        argument: 'modelId',
        message: `Invalid model ID format: '${resolvedModelId}'. Expected 'provider:model' format`,
      });
    }
    return registry.languageModel(resolvedModelId as `${string}:${string}`);
  },

  /**
   * Get text embedding model using AI SDK v5 native registry
   * @param modelId Format: 'provider:model' (e.g., 'openai:text-embedding-3-small')
   */
  textEmbedding: (modelId: string) => {
    // Ensure proper provider:model format
    if (!modelId.includes(':')) {
      throw new InvalidArgumentError({
        argument: 'modelId',
        message: `Invalid model ID format: '${modelId}'. Expected 'provider:model' format`,
      });
    }
    return registry.textEmbeddingModel(modelId as `${string}:${string}`);
  },

  /**
   * Alias for textEmbedding - backward compatibility
   * @param modelId Format: 'provider:model' or semantic name like 'rag', 'similarity', 'large'
   */
  embedding: (modelId: EmbeddingModelId) => {
    // Handle semantic embedding model mapping
    const semanticEmbeddingModels: Record<string, string> = {
      rag: 'ai:rag',
      similarity: 'ai:similarity',
      large: 'ai:large',
    };

    const resolvedModelId = semanticEmbeddingModels[modelId] || modelId;

    // Ensure proper provider:model format
    if (!resolvedModelId.includes(':')) {
      throw new InvalidArgumentError({
        argument: 'modelId',
        message: `Invalid embedding model ID format: '${resolvedModelId}'. Expected 'provider:model' format`,
      });
    }
    return registry.textEmbeddingModel(resolvedModelId as `${string}:${string}`);
  },

  /**
   * Get image model using AI SDK v5 native registry
   * @param modelId Format: 'provider:model' (e.g., 'openai:dall-e-3')
   */
  image: (modelId: string) => {
    // Ensure proper provider:model format
    if (!modelId.includes(':')) {
      throw new InvalidArgumentError({
        argument: 'modelId',
        message: `Invalid model ID format: '${modelId}'. Expected 'provider:model' format`,
      });
    }
    return registry.imageModel(modelId as `${string}:${string}`);
  },
};

/**
 * Type definitions for semantic model names used in fragments and tools
 * These align with the existing semantic naming patterns in the codebase
 */
export type LanguageModelId =
  | 'fast' // Fast, low-cost models (gpt-4o-mini, claude-haiku)
  | 'balanced' // Balanced performance/cost (gpt-4o, claude-sonnet)
  | 'powerful' // Most capable models (gpt-4, claude-opus)
  | 'tool-optimized' // Optimized for tool calling
  | 'fast-precise' // Fast with high precision
  | 'tool-balanced' // Balanced tool calling
  | 'web-search' // Optimized for web search
  | 'database-query' // Optimized for database operations
  | string; // Allow custom model IDs

export type EmbeddingModelId =
  | 'rag' // Optimized for RAG applications
  | 'similarity' // General similarity tasks
  | 'large' // Large dimension embeddings
  | string; // Allow custom embedding model IDs

/**
 * Semantic model mapping - maps semantic names to enhanced AI custom provider models
 * This allows fragments and tools to use semantic names while getting full middleware benefits
 */
export const semanticModels: Record<string, string> = {
  // Fast models - optimized for speed and cost
  fast: 'ai:fast',
  'fast-precise': 'ai:fast-precise',

  // Balanced models - general purpose with middleware
  balanced: 'ai:tool-balanced',
  'tool-balanced': 'ai:tool-balanced',
  'tool-optimized': 'ai:function-calling',

  // Powerful models - enhanced with reasoning
  powerful: 'ai:claude-4-opus-reasoning',
  reasoningText: 'ai:reasoning',

  // Specialized models with middleware chains
  'web-search': 'ai:web-search',
  'deep-research': 'ai:deep-research',
  'reasoning-search': 'ai:reasoning-search',
  'database-query': 'ai:claude-3-5-sonnet',

  // Structured output models
  'structured-output': 'ai:structured-output',
  'extract-data': 'ai:extract-data',
  classify: 'ai:classify',

  // Creative models
  'tool-creative': 'ai:tool-creative',
  'generate-text': 'ai:generate-text',

  // Local models (LM Studio)
  local: 'ai:local',
  'local-model': 'ai:local-model',

  // Google-specific models
  'google-thinking': 'ai:google-thinking',
  'google-multimodal': 'ai:google-multimodal',
  'google-search': 'ai:google-search',
  'google-safe': 'ai:google-safe',
  'google-creative': 'ai:google-creative',

  // Google semantic aliases
  multimodal: 'ai:multimodal',
  'thinking-model': 'ai:thinking-model',
  'deep-reasoning': 'ai:deep-reasoning',
  'vision-model': 'ai:vision-model',
  'safe-model': 'ai:safe-model',
};

/**
 * Get the default/best available model
 * Maintains backward compatibility with registry.getModel()
 */
export function getDefaultModel() {
  // Return the best available model - prefer Anthropic if available, then Google, then OpenAI
  const env = safeEnv();
  if (env.ANTHROPIC_API_KEY) {
    return models.language('powerful');
  }
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return models.language('thinking-model');
  }
  if (env.OPENAI_API_KEY) {
    return models.language('balanced');
  }
  if (env.PERPLEXITY_API_KEY) {
    return models.language('web-search');
  }
  if (env.LM_STUDIO_BASE_URL) {
    return models.language('local');
  }

  throw new NoSuchModelError({
    message: 'No providers available - add API keys or configure LM Studio base URL',
    modelId: 'unknown',
    modelType: 'languageModel',
  });
}
