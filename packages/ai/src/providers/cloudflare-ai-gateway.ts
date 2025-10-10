/**
 * Cloudflare AI Gateway Provider Module
 * Gateway/Infrastructure Provider - Multi-Provider Fallback System
 *
 * ARCHITECTURAL DECISION: Gateway/Infrastructure Category Pattern
 * ============================================================
 *
 * Cloudflare AI Gateway represents a unique category in our provider ecosystem:
 *
 * PROVIDER SPECTRUM:
 * OpenAI/Custom ←────── Anthropic ←────── xAI ←────── Perplexity | Claude Code | Cloudflare Gateway
 * (LM Studio)           (Balanced)      (SDK-First)  (Min SDK)   (Community)   (Infrastructure)
 * (Max SDK)
 *
 * WHY GATEWAY/INFRASTRUCTURE:
 * 1. Gateway Provider - Routes requests through Cloudflare's AI Gateway infrastructure
 * 2. Multi-Provider Fallback - Automatic failover between different AI providers
 * 3. Enterprise Features - Caching, rate limiting, request management, analytics
 * 4. Runtime Agnostic - Works in Node.js, Edge Runtime, Cloudflare Workers
 * 5. Cloudflare Integration - Uses Cloudflare bindings or API key authentication
 * 6. Provider Abstraction - Can wrap any AI SDK provider with gateway features
 *
 * USAGE EXAMPLES:
 *
 * Basic API key authentication usage:
 * ```typescript
 * import { createAiGateway } from 'ai-gateway-provider';
 * import { createOpenAI } from '@ai-sdk/openai';
 * import { generateText } from 'ai';
 *
 * const aigateway = createAiGateway({
 *   accountId: 'your-cloudflare-account-id',
 *   gateway: 'your-gateway-name',
 *   apiKey: 'your-cloudflare-api-key', // Only required if your gateway has authentication enabled
 *   options: {
 *     skipCache: true, // Optional request-level settings
 *   },
 * });
 *
 * const openai = createOpenAI({ apiKey: 'openai-api-key' });
 *
 * const { text } = await generateText({
 *   model: aigateway([openai('gpt-4o-mini')]),
 *   prompt: 'Write a greeting.',
 * });
 *
 * console.log(text); // Output: "Hello"
 * ```
 *
 * Multi-provider fallback with automatic failover:
 * ```typescript
 * import { createAiGateway } from 'ai-gateway-provider';
 * import { createOpenAI } from '@ai-sdk/openai';
 * import { createAnthropic } from '@ai-sdk/anthropic';
 * import { generateText } from 'ai';
 *
 * const aigateway = createAiGateway({
 *   accountId: 'your-cloudflare-account-id',
 *   gateway: 'your-gateway-name',
 *   apiKey: 'your-cloudflare-api-key',
 * });
 *
 * const openai = createOpenAI({ apiKey: 'openai-api-key' });
 * const anthropic = createAnthropic({ apiKey: 'anthropic-api-key' });
 *
 * const model = aigateway([
 *   anthropic('claude-3-5-haiku-20241022'), // Primary model
 *   openai('gpt-4o-mini'), // Fallback model
 * ]);
 *
 * const { text } = await generateText({
 *   model,
 *   prompt: 'Write a multi-part greeting.',
 * });
 * ```
 *
 * Cloudflare Workers binding (Workers environment only):
 * ```typescript
 * import { createAiGateway } from 'ai-gateway-provider';
 *
 * // Configure an AI binding in your wrangler.toml:
 * // [AI]
 * // binding = "AI"
 *
 * const aigateway = createAiGateway({
 *   binding: env.AI.gateway('my-gateway'),
 *   options: {
 *     skipCache: true, // Optional request-level settings
 *   },
 * });
 * ```
 *
 * Stream text responses with fallback:
 * ```typescript
 * import { createAiGateway } from 'ai-gateway-provider';
 * import { createOpenAI } from '@ai-sdk/openai';
 * import { streamText } from 'ai';
 *
 * const aigateway = createAiGateway({
 *   accountId: 'your-cloudflare-account-id',
 *   gateway: 'your-gateway-name',
 *   apiKey: 'your-cloudflare-api-key',
 * });
 *
 * const openai = createOpenAI({ apiKey: 'openai-api-key' });
 *
 * const result = await streamText({
 *   model: aigateway([openai('gpt-4o-mini')]),
 *   prompt: 'Write a multi-part greeting.',
 * });
 *
 * let accumulatedText = '';
 * for await (const chunk of result.textStream) {
 *   accumulatedText += chunk;
 * }
 *
 * console.log(accumulatedText); // Output: "Hello world!"
 * ```
 *
 * Request options customization:
 * ```typescript
 * import { createAiGateway } from 'ai-gateway-provider';
 *
 * const aigateway = createAiGateway({
 *   accountId: 'your-cloudflare-account-id',
 *   gateway: 'your-gateway-name',
 *   apiKey: 'your-cloudflare-api-key',
 *   options: {
 *     cacheTtl: 3600, // Cache for 1 hour
 *     metadata: { userId: 'user123' },
 *     retries: {
 *       maxAttempts: 3,
 *       retryDelayMs: 1000,
 *       backoff: 'exponential',
 *     },
 *   },
 * });
 * ```
 *
 * Registry integration (convenience access):
 * ```typescript
 * import { registry } from '@repo/ai';
 * import { generateText } from 'ai';
 *
 * // Use pre-configured gateway fallback models
 * const result = await generateText({
 *   model: registry.languageModel('gateway-fallback'), // Claude Haiku -> GPT-4o-mini
 *   prompt: 'Write a greeting.',
 * });
 * ```
 *
 * Configuration presets for common scenarios:
 * ```typescript
 * import { getPresetConfig } from '@repo/ai';
 *
 * // Fast mode - minimal caching, quick responses
 * const fastConfig = getPresetConfig('FAST_MODE');
 *
 * // Reliable mode - aggressive caching and retries
 * const reliableConfig = getPresetConfig('RELIABLE_MODE');
 *
 * // Development mode - no caching, detailed logging
 * const devConfig = getPresetConfig('DEVELOPMENT');
 *
 * // Production mode - balanced performance
 * const prodConfig = getPresetConfig('PRODUCTION');
 * ```
 *
 * SPECTRUM POSITIONING: Gateway/Infrastructure (Multi-Provider Proxy)
 *
 * OpenAI/Custom ←────── Anthropic ←────── xAI ←────── Perplexity | Claude Code | Cloudflare Gateway
 * (LM Studio)           (Balanced)      (SDK-First)  (Min SDK)   (Community)   (Infrastructure)
 * (Max SDK)
 *
 * RATIONALE: Cloudflare AI Gateway provides unique infrastructure features like multi-provider
 * fallback, enterprise caching, rate limiting, and request management that no other provider
 * offers, warranting its own category as a gateway/infrastructure solution.
 */

import type { JSONObject, LanguageModelV2, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { InvalidArgumentError } from '@ai-sdk/provider';
import { createAiGateway } from 'ai-gateway-provider';

// Type definitions for Cloudflare-specific features
interface CloudflareWorkerBinding {
  run: (model: string, inputs: unknown) => Promise<unknown>;
  // Add other methods as needed based on actual Cloudflare Workers AI binding
}

interface GenerationResult {
  providerOptions?: SharedV2ProviderMetadata;
}

// Re-export the main provider factory
export { createAiGateway };

/**
 * Single source of truth for Cloudflare AI Gateway configuration constants
 */
export const CLOUDFLARE_AI_GATEWAY_DEFAULTS = {
  // Default request timeout (30 seconds)
  REQUEST_TIMEOUT_MS: 30000,

  // Default cache TTL (1 hour)
  CACHE_TTL_SECONDS: 3600,

  // Default retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF: 'exponential' as const,
} as const;

/**
 * Supported retry strategies
 */
const CLOUDFLARE_AI_GATEWAY_RETRY_STRATEGIES = {
  CONSTANT: 'constant',
  LINEAR: 'linear',
  EXPONENTIAL: 'exponential',
} as const;

/**
 * Common gateway configuration presets
 */
const CLOUDFLARE_AI_GATEWAY_PRESETS = {
  // Fast mode - minimal caching, quick responses
  FAST_MODE: {
    skipCache: true,
    requestTimeoutMs: 10000,
    retries: {
      maxAttempts: 1,
      retryDelayMs: 500,
      backoff: 'constant' as const,
    },
  },

  // Reliable mode - aggressive caching and retries
  RELIABLE_MODE: {
    cacheTtl: 7200, // 2 hours
    requestTimeoutMs: 60000, // 1 minute
    retries: {
      maxAttempts: 5,
      retryDelayMs: 2000,
      backoff: 'exponential' as const,
    },
  },

  // Development mode - no caching, detailed logging
  DEVELOPMENT: {
    skipCache: true,
    collectLog: true,
    metadata: { environment: 'development' },
    retries: {
      maxAttempts: 1,
      retryDelayMs: 100,
      backoff: 'constant' as const,
    },
  },

  // Production mode - balanced performance
  PRODUCTION: {
    cacheTtl: 3600,
    requestTimeoutMs: 30000,
    collectLog: false,
    retries: {
      maxAttempts: 3,
      retryDelayMs: 1000,
      backoff: 'exponential' as const,
    },
  },
} as const;

/**
 * Supported AI providers that work with Cloudflare AI Gateway
 */
const CLOUDFLARE_AI_GATEWAY_SUPPORTED_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'DeepSeek',
  'Google AI Studio',
  'Grok',
  'Mistral',
  'Perplexity AI',
  'Replicate',
  'Groq',
] as const;

/**
 * Type definitions for Cloudflare AI Gateway usage
 */
export interface CloudflareAiGatewayConfig {
  accountId?: string;
  gateway?: string;
  apiKey?: string; // Only required if your gateway has authentication enabled
  binding?: CloudflareWorkerBinding; // Cloudflare Workers AI binding (Workers environment only)
  options?: CloudflareAiGatewayRequestOptions;
}

interface CloudflareAiGatewayRequestOptions {
  cacheKey?: string; // Custom cache key for the request
  cacheTtl?: number; // Cache time-to-live in seconds
  skipCache?: boolean; // Bypass caching
  metadata?: Record<string, string | number | bigint | boolean | null>; // Custom metadata for the request
  collectLog?: boolean; // Enable/disable log collection
  eventId?: string; // Custom event identifier
  requestTimeoutMs?: number; // Request timeout in milliseconds
  retries?: {
    maxAttempts?: 1 | 2 | 3 | 4 | 5; // Number of retry attempts (1-5)
    retryDelayMs?: number; // Delay between retries
    backoff?: 'constant' | 'linear' | 'exponential'; // Retry strategy
  };
}

type CloudflareAiGatewayPreset =
  (typeof CLOUDFLARE_AI_GATEWAY_PRESETS)[keyof typeof CLOUDFLARE_AI_GATEWAY_PRESETS];
type CloudflareAiGatewayRetryStrategy =
  (typeof CLOUDFLARE_AI_GATEWAY_RETRY_STRATEGIES)[keyof typeof CLOUDFLARE_AI_GATEWAY_RETRY_STRATEGIES];

/**
 * Error types from ai-gateway-provider
 * Re-exported for convenience - these are the actual error classes from the provider
 */
/**
 * Create Cloudflare AI Gateway configuration from environment variables
 * Supports both API key authentication and Cloudflare Workers binding
 */
function getCloudflareAiGatewayConfig(): CloudflareAiGatewayConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const gateway = process.env.CLOUDFLARE_AI_GATEWAY_NAME;
  const apiKey = process.env.CLOUDFLARE_API_KEY;

  // Parse optional configuration from environment
  const cacheTtl = process.env.CLOUDFLARE_AI_GATEWAY_CACHE_TTL;
  const skipCache = process.env.CLOUDFLARE_AI_GATEWAY_SKIP_CACHE;
  const maxRetries = process.env.CLOUDFLARE_AI_GATEWAY_MAX_RETRIES;

  const options: CloudflareAiGatewayRequestOptions = {};

  if (cacheTtl) {
    options.cacheTtl = parseInt(cacheTtl, 10);
  }

  if (skipCache !== undefined) {
    options.skipCache = skipCache === 'true';
  }

  if (maxRetries) {
    const attempts = parseInt(maxRetries, 10);
    // Ensure maxAttempts is one of the allowed literal values
    const validAttempts = [1, 2, 3, 4, 5] as const;
    const maxAttempts = validAttempts.includes(attempts as (typeof validAttempts)[number])
      ? (attempts as 1 | 2 | 3 | 4 | 5)
      : 3;

    options.retries = {
      maxAttempts,
      retryDelayMs: CLOUDFLARE_AI_GATEWAY_DEFAULTS.RETRY_DELAY_MS,
      backoff: CLOUDFLARE_AI_GATEWAY_DEFAULTS.RETRY_BACKOFF,
    };
  }

  return {
    accountId,
    gateway,
    apiKey,
    options: Object.keys(options).length > 0 ? options : undefined,
  };
}

/**
 * Check if Cloudflare AI Gateway is properly configured
 * Returns configuration status and helpful error messages
 */
function checkCloudflareAiGatewayConfig(): {
  configured: boolean;
  error?: string;
  config?: CloudflareAiGatewayConfig;
} {
  const config = getCloudflareAiGatewayConfig();

  if (!config.accountId) {
    return {
      configured: false,
      error: 'CLOUDFLARE_ACCOUNT_ID environment variable is required',
    };
  }

  if (!config.gateway) {
    return {
      configured: false,
      error: 'CLOUDFLARE_AI_GATEWAY_NAME environment variable is required',
    };
  }

  return {
    configured: true,
    config,
  };
}

/**
 * Validate retry configuration
 */
function validateRetryConfig(retries?: CloudflareAiGatewayRequestOptions['retries']): boolean {
  if (!retries) return true;

  const { maxAttempts, retryDelayMs, backoff } = retries;

  if (maxAttempts && ![1, 2, 3, 4, 5].includes(maxAttempts)) {
    throw new InvalidArgumentError({
      argument: 'maxAttempts',
      message: 'maxAttempts must be one of: 1, 2, 3, 4, 5',
    });
  }

  if (retryDelayMs && retryDelayMs < 0) {
    throw new InvalidArgumentError({
      argument: 'retryDelayMs',
      message: 'retryDelayMs must be non-negative',
    });
  }

  if (backoff && !Object.values(CLOUDFLARE_AI_GATEWAY_RETRY_STRATEGIES).includes(backoff)) {
    throw new InvalidArgumentError({
      argument: 'backoff',
      message: `backoff must be one of: ${Object.values(CLOUDFLARE_AI_GATEWAY_RETRY_STRATEGIES).join(', ')}`,
    });
  }

  return true;
}

/**
 * Create Cloudflare AI Gateway instance with environment-based configuration
 * Works in both Node.js and Cloudflare Workers environments
 */
function createCloudflareAiGatewayFromEnv() {
  const configCheck = checkCloudflareAiGatewayConfig();

  if (!configCheck.configured) {
    throw new InvalidArgumentError({
      argument: 'config',
      message: `Cloudflare AI Gateway configuration error: ${configCheck.error}`,
    });
  }

  const config = configCheck.config!;

  // Validate retry configuration if present
  if (config.options?.retries) {
    validateRetryConfig(config.options.retries);
  }

  // Ensure required properties are present (TypeScript type guard)
  if (!config.accountId || !config.gateway) {
    throw new InvalidArgumentError({
      argument: 'config',
      message: 'Cloudflare AI Gateway requires both accountId and gateway to be configured',
    });
  }

  // Create properly typed configuration
  const gatewayConfig = {
    accountId: config.accountId,
    gateway: config.gateway,
    ...(config.apiKey && { apiKey: config.apiKey }),
    ...(config.options && { options: config.options }),
  };

  return createAiGateway(gatewayConfig);
}

/**
 * Create Cloudflare AI Gateway instance with Workers binding
 * This method is only available inside Cloudflare Workers
 */
function createCloudflareAiGatewayFromBinding(
  binding: CloudflareWorkerBinding,
  options?: CloudflareAiGatewayRequestOptions,
) {
  return createAiGateway({
    binding: binding as any,
    options,
  });
}

/**
 * Get the Cloudflare AI Gateway provider from the registry
 * Returns the configured gateway instance for direct usage
 */
function getCloudflareGateway(): LanguageModelV2 | null {
  try {
    const { registry } = require('./registry');
    return registry.provider('cloudflareGateway') || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if a provider is supported by Cloudflare AI Gateway
 */
function isProviderSupported(providerName: string): boolean {
  return CLOUDFLARE_AI_GATEWAY_SUPPORTED_PROVIDERS.includes(
    providerName as (typeof CLOUDFLARE_AI_GATEWAY_SUPPORTED_PROVIDERS)[number],
  );
}

/**
 * Get recommended configuration for a specific use case
 */
function getPresetConfig(
  preset: keyof typeof CLOUDFLARE_AI_GATEWAY_PRESETS,
): CloudflareAiGatewayRequestOptions {
  return { ...CLOUDFLARE_AI_GATEWAY_PRESETS[preset] };
}

/**
 * Cloudflare AI Gateway setup instructions and configuration examples
 */
const CLOUDFLARE_AI_GATEWAY_INFO = {
  SETUP_STEPS: [
    '1. Install ai-gateway-provider: pnpm add ai-gateway-provider',
    '2. Set up Cloudflare AI Gateway in Cloudflare dashboard',
    '3. Configure environment variables or Workers binding',
    '4. Import createAiGateway from ai-gateway-provider',
    '5. Create models with fallback: aigateway([primary, fallback])',
  ],
  AUTHENTICATION_METHODS: [
    'API key authentication (accountId + gateway + apiKey)',
    'Cloudflare Workers AI binding (binding + options)',
  ],
  SUPPORTED_PROVIDERS: CLOUDFLARE_AI_GATEWAY_SUPPORTED_PROVIDERS,
  REQUEST_OPTIONS: [
    'cacheKey: Custom cache key for the request',
    'cacheTtl: Cache time-to-live in seconds',
    'skipCache: Bypass caching',
    'metadata: Custom metadata for the request',
    'collectLog: Enable/disable log collection',
    'eventId: Custom event identifier',
    'requestTimeoutMs: Request timeout in milliseconds',
    'retries: { maxAttempts, retryDelayMs, backoff }',
  ],
  ENVIRONMENT_VARIABLES: {
    ACCOUNT_ID: 'CLOUDFLARE_ACCOUNT_ID="your-account-id"',
    GATEWAY_NAME: 'CLOUDFLARE_AI_GATEWAY_NAME="your-gateway-name"',
    API_KEY: 'CLOUDFLARE_API_KEY="your-api-key" # Only if auth enabled',
    CACHE_TTL: 'CLOUDFLARE_AI_GATEWAY_CACHE_TTL="3600"',
    SKIP_CACHE: 'CLOUDFLARE_AI_GATEWAY_SKIP_CACHE="false"',
    MAX_RETRIES: 'CLOUDFLARE_AI_GATEWAY_MAX_RETRIES="3"',
  },
  ERROR_TYPES: [
    'AiGatewayUnauthorizedError: Invalid/missing API key',
    'AiGatewayDoesNotExist: Gateway does not exist',
  ],
  UNIQUE_FEATURES: [
    'Runtime Agnostic: Node.js, Edge Runtime, Cloudflare Workers',
    'Automatic Fallback: Switches to next model if one fails',
    'Multi-Provider Support: OpenAI, Anthropic, DeepSeek, Grok, etc.',
    'Cloudflare AI Gateway Integration: Request management & caching',
    'Simplified Configuration: API key or Workers binding',
    'Orthogonal Composition: Infrastructure helpers work with provider helpers',
  ],
} as const;

/**
 * CLOUDFLARE AI GATEWAY INFRASTRUCTURE COMPOSITION HELPERS
 * ========================================================
 *
 * These helpers provide orthogonal composition for Cloudflare AI Gateway infrastructure features.
 * They focus on infrastructure concerns (caching, retries, failover) that are unique to Cloudflare.
 * They compose cleanly with provider-specific helpers (withReasoning, withImages, etc.).
 *
 * ARCHITECTURAL DESIGN:
 * - Infrastructure Layer: Cloudflare-specific features (caching, workers, failover)
 * - Provider Layer: AI capabilities (reasoning, vision, structured output)
 * - Orthogonal Composition: Infrastructure + Provider helpers work together
 *
 * USAGE PATTERN:
 * ```typescript
 * const result = await generateText({
 *   model: aigateway([anthropic('claude-4'), openai('gpt-4')]),
 *   ...withCaching({ ttl: 3600 }),
 *   ...withRetryStrategy({ maxAttempts: 3, backoff: 'exponential' }),
 *   ...withReasoning(20000), // Provider helper passes through
 * });
 * ```
 */

/**
 * Helper for Cloudflare AI Gateway caching configuration - Infrastructure Layer
 * Provides caching control unique to Cloudflare's infrastructure
 * Works with both direct providers and other gateway routing
 *
 * @example
 * ```typescript
 * // Works with Cloudflare Gateway
 * generateText({ model: aigateway([anthropic('claude-4')]), ...withCaching({ ttl: 3600 }) })
 *
 * // Composes with provider helpers
 * generateText({
 *   model: aigateway([anthropic('claude-4')]),
 *   ...withCaching({ ttl: 3600 }),
 *   ...withReasoning(20000)
 * })
 * ```
 */
export function withCaching(options: { ttl?: number; skipCache?: boolean; cacheKey?: string }) {
  return {
    providerOptions: {
      cloudflare: {
        ...(options.ttl && { cacheTtl: options.ttl }),
        ...(options.skipCache !== undefined && { skipCache: options.skipCache }),
        ...(options.cacheKey && { cacheKey: options.cacheKey }),
      },
    },
  };
}

/**
 * Helper for Cloudflare AI Gateway retry strategy - Infrastructure Layer
 * Provides retry configuration unique to Cloudflare's infrastructure
 * Works with both direct providers and other gateway routing
 *
 * @example
 * ```typescript
 * // Works with Cloudflare Gateway
 * generateText({
 *   model: aigateway([openai('gpt-4')]),
 *   ...withRetryStrategy({ maxAttempts: 5, backoff: 'exponential' })
 * })
 *
 * // Composes with provider helpers
 * generateText({
 *   model: aigateway([openai('gpt-4')]),
 *   ...withRetryStrategy({ maxAttempts: 3 }),
 *   ...withStructuredOutput('json_object')
 * })
 * ```
 */
export function withRetryStrategy(options: {
  maxAttempts?: 1 | 2 | 3 | 4 | 5;
  retryDelayMs?: number;
  backoff?: 'constant' | 'linear' | 'exponential';
}) {
  return {
    providerOptions: {
      cloudflare: {
        retries: {
          ...(options.maxAttempts && { maxAttempts: options.maxAttempts }),
          ...(options.retryDelayMs && { retryDelayMs: options.retryDelayMs }),
          ...(options.backoff && { backoff: options.backoff }),
        },
      },
    },
  };
}

/**
 * Helper for Cloudflare Workers binding configuration - Infrastructure Layer
 * Provides Workers-specific configuration unique to Cloudflare's platform
 * Works with both direct providers and other gateway routing
 *
 * @example
 * ```typescript
 * // Workers environment
 * generateText({
 *   model: aigateway([anthropic('claude-4')]),
 *   ...withWorkersBinding(env.AI.gateway('my-gateway'))
 * })
 * ```
 */
function withWorkersBinding(
  binding: CloudflareWorkerBinding,
  options?: CloudflareAiGatewayRequestOptions,
) {
  return {
    providerOptions: {
      cloudflare: {
        binding,
        ...(options && options),
      },
    },
  };
}

/**
 * Helper for request-level metadata configuration - Infrastructure Layer
 * Provides metadata and logging control unique to Cloudflare's infrastructure
 * Works with both direct providers and other gateway routing
 *
 * @example
 * ```typescript
 * generateText({
 *   model: aigateway([perplexity('sonar-pro')]),
 *   ...withRequestMetadata({ userId: 'user123', environment: 'production' })
 * })
 * ```
 */
function withRequestMetadata(options: {
  metadata?: JSONObject;
  collectLog?: boolean;
  eventId?: string;
  requestTimeoutMs?: number;
}) {
  return {
    providerOptions: {
      cloudflare: {
        ...(options.metadata && { metadata: options.metadata }),
        ...(options.collectLog !== undefined && { collectLog: options.collectLog }),
        ...(options.eventId && { eventId: options.eventId }),
        ...(options.requestTimeoutMs && { requestTimeoutMs: options.requestTimeoutMs }),
      },
    },
  };
}

/**
 * Helper for configuration presets - Infrastructure Layer
 * Provides quick access to Cloudflare-optimized configurations
 * Works with both direct providers and other gateway routing
 *
 * @example
 * ```typescript
 * // Fast mode for real-time applications
 * generateText({
 *   model: aigateway([openai('gpt-4o-mini')]),
 *   ...withCloudflarePreset('fast')
 * })
 *
 * // Production mode with reliability
 * generateText({
 *   model: aigateway([anthropic('claude-4')]),
 *   ...withCloudflarePreset('production')
 * })
 * ```
 */
function withCloudflarePreset(preset: keyof typeof CLOUDFLARE_AI_GATEWAY_PRESETS) {
  const presetConfig = CLOUDFLARE_AI_GATEWAY_PRESETS[preset];
  if (!presetConfig) {
    throw new InvalidArgumentError({
      argument: 'preset',
      message: `Unknown Cloudflare AI Gateway preset: ${preset}`,
    });
  }

  return {
    providerOptions: {
      cloudflare: presetConfig,
    },
  };
}

/**
 * Extract Cloudflare AI Gateway metadata from responses
 * Provides access to Cloudflare-specific response metadata
 *
 * @example
 * ```typescript
 * const result = await generateText({
 *   model: aigateway([anthropic('claude-4')]),
 *   prompt: 'Hello'
 * });
 *
 * const metadata = extractCloudflareMetadata(result);
 * console.log('Cache hit:', metadata?.cacheHit);
 * console.log('Retry count:', metadata?.retryCount);
 * ```
 */
export function extractCloudflareMetadata(result: GenerationResult): CloudflareMetadata | null {
  const metadata = result.providerOptions?.cloudflare;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;

  const meta = metadata as JSONObject;

  return {
    cacheHit: typeof meta.cacheHit === 'boolean' ? meta.cacheHit : false,
    retryCount: typeof meta.retryCount === 'number' ? meta.retryCount : 0,
    finalProvider: typeof meta.finalProvider === 'string' ? meta.finalProvider : null,
    requestId: typeof meta.requestId === 'string' ? meta.requestId : null,
    gatewayLatencyMs: typeof meta.gatewayLatencyMs === 'number' ? meta.gatewayLatencyMs : null,
  };
}

/**
 * PROVIDER OPTION PASSTHROUGH SUPPORT
 * ===================================
 *
 * Cloudflare AI Gateway now supports provider option passthrough, allowing
 * composition with provider-specific helpers (e.g., withReasoning, withImages).
 *
 * ARCHITECTURAL PRINCIPLE:
 * Cloudflare handles infrastructure (caching, retries, fallback) while provider
 * options pass through to the underlying models for AI capabilities.
 *
 * PASSTHROUGH PATTERN:
 * ```typescript
 * // Infrastructure + Provider composition
 * const result = await generateText({
 *   model: aigateway([
 *     anthropic('claude-sonnet-4-20250514'),
 *     openai('gpt-4o')
 *   ]),
 *   // Infrastructure layer (handled by Cloudflare)
 *   ...withCaching({ ttl: 3600 }),
 *   ...withRetryStrategy({ maxAttempts: 3, backoff: 'exponential' }),
 *
 *   // Provider layer (passes through to underlying models)
 *   ...withReasoning(20000), // → Anthropic provider options
 *   ...withStructuredOutput('json_object'), // → OpenAI provider options
 * });
 * ```
 *
 * COMPLEMENTARY USAGE WITH VERCEL AI GATEWAY:
 * ```typescript
 * // Vercel for model discovery and routing
 * import { discoverModels, withGatewayRouting } from './vercel-ai-gateway';
 *
 * // Cloudflare for infrastructure reliability
 * import { withCaching, withRetryStrategy } from './cloudflare-ai-gateway';
 *
 * const models = await discoverModels();
 * const cheapestModel = models.find(m => m.pricing.inputCost < 0.001);
 *
 * // Use both gateways for different strengths
 * const result = await generateText({
 *   model: aigateway([
 *     vercelGateway(`${cheapestModel.provider}/${cheapestModel.id}`),
 *     anthropic('claude-sonnet-4-20250514') // Fallback
 *   ]),
 *   ...withCaching({ ttl: 7200 }), // Cloudflare caching
 *   ...withGatewayRouting({ order: ['anthropic', 'openai'] }), // Vercel routing
 * });
 * ```
 */

// Type definitions for new composition helpers
export interface CloudflareMetadata {
  cacheHit: boolean;
  retryCount: number;
  finalProvider: string | null;
  requestId: string | null;
  gatewayLatencyMs: number | null;
}

/**
 * USAGE EXAMPLES - Cloudflare AI Gateway with Orthogonal Composition
 *
 * Infrastructure-focused caching and retry:
 * ```typescript
 * const { text } = await generateText({
 *   model: aigateway([anthropic('claude-4'), openai('gpt-4')]),
 *   ...withCaching({ ttl: 3600, cacheKey: 'user-greeting' }),
 *   ...withRetryStrategy({ maxAttempts: 3, backoff: 'exponential' }),
 *   prompt: 'Hello world',
 * });
 * ```
 *
 * Cloudflare Workers integration:
 * ```typescript
 * const { text } = await generateText({
 *   model: aigateway([perplexity('sonar-pro')]),
 *   ...withWorkersBinding(env.AI.gateway('my-gateway')),
 *   ...withRequestMetadata({ userId: 'user123', environment: 'production' }),
 *   ...withImages(), // Perplexity provider helper passes through
 *   prompt: 'Latest AI developments with images',
 * });
 * ```
 *
 * Fast mode for real-time applications:
 * ```typescript
 * const { text } = await generateText({
 *   model: aigateway([openai('gpt-4o-mini'), anthropic('claude-haiku')]),
 *   ...withCloudflarePreset('FAST_MODE'),
 *   ...withStructuredOutput('json_object'), // OpenAI provider helper
 *   prompt: 'Quick analysis in JSON format',
 * });
 * ```
 *
 * Production mode with comprehensive monitoring:
 * ```typescript
 * const result = await generateText({
 *   model: aigateway([anthropic('claude-4'), openai('gpt-4')]),
 *   ...withCloudflarePreset('PRODUCTION'),
 *   ...withRequestMetadata({
 *     metadata: { feature: 'content-generation', version: '1.0' },
 *     collectLog: true
 *   }),
 *   ...withReasoning(25000), // Anthropic provider helper passes through
 *   prompt: 'Generate comprehensive content analysis',
 * });
 *
 * // Extract comprehensive metadata
 * const cfMetadata = extractCloudflareMetadata(result);
 * const reasoning = extractReasoningDetails(result); // From Anthropic provider
 * console.log('Cache hit:', cfMetadata?.cacheHit);
 * console.log('Retry count:', cfMetadata?.retryCount);
 * console.log('Reasoning tokens:', reasoning?.usage?.reasoningTokens);
 * ```
 */
