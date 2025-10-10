/**
 * Provider Module Architecture - Balanced Spectrum Approach
 * =========================================================
 *
 * ARCHITECTURAL PHILOSOPHY: Provider Spectrum Positioning
 *
 * We've successfully positioned our providers across the balanced spectrum:
 *
 *   OpenAI/Custom ←──── Anthropic ←──── Google ←──── xAI ←──── Perplexity | Claude Code | Cloudflare Gateway | Vercel Gateway
 *   (LM Studio)         (Balanced)    (Balanced+)  (SDK-First)  (Min SDK)    (Community)   (Infrastructure)    (Unified API)
 *   (Max SDK)
 *
 * DESIGN PRINCIPLES:
 *
 * 🔵 OpenAI/Custom (Maximum SDK Usage):
 *    - OpenAI: Trust the SDK completely, minimal custom abstractions
 *    - LM Studio: OpenAI-compatible local models, pure SDK trust
 *    - Use native SDK features: openai.tools.*, openai.image(), etc.
 *    - Only add configuration convenience functions for local setups
 *
 * 🟢 Anthropic (Balanced Middle):
 *    - Selective SDK usage with targeted enhancements
 *    - Keep unique features: reasoning, cache control, computer use
 *    - Remove redundant wrappers where SDK is sufficient
 *    - Rich capability detection for provider-specific features
 *
 * 🟢 Google (Balanced Plus):
 *    - Enhanced balance with comprehensive thinking + multimodal + safety
 *    - Trust AI SDK v5 for core features, add unique Google capabilities
 *    - Comprehensive composition helpers: thinking, safety, multimodal, search
 *    - Native tool integration: googleSearch, urlContext, codeExecution
 *    - Positioned between Anthropic and xAI - more features than xAI, safety-first approach
 *    - Superior multimodal excellence: PDFs, videos, images, YouTube context
 *
 * 🟡 xAI (SDK-First Approach):
 *    - Like OpenAI: Trust the SDK, minimal custom abstractions
 *    - Like Perplexity: Keep helpers for genuinely unique features only
 *    - Better than Both: Clear migration path and extensive documentation
 *    - Focus on xAI-unique: Live Search system and reasoning effort control
 *
 * 🟠 Perplexity (Minimal SDK Support):
 *    - Fill gaps where SDK support is limited
 *    - Custom helpers for provider-unique features (return_images, research mode)
 *    - Simple response extraction for provider-specific formats
 *    - Targeted abstractions that add genuine value
 *
 * 🔴 Claude Code (Custom/Alternative - Community Provider):
 *    - Community provider with unique CLI-based architecture
 *    - Built-in tools access (Bash, Edit, Read, Write, WebFetch, etc.)
 *    - MCP server integration for extended functionality
 *    - Dual authentication (subscription + API key support)
 *    - Extended thinking support with proper timeout management
 *    - Beyond main spectrum due to unique community provider nature
 *
 * 🟣 Cloudflare Gateway (Infrastructure Provider):
 *    - Gateway/proxy provider routing through Cloudflare's AI Gateway
 *    - Multi-provider automatic fallback for high availability
 *    - Enterprise features: caching, rate limiting, request management
 *    - Runtime agnostic: Node.js, Edge Runtime, Cloudflare Workers
 *    - Provider abstraction layer with unified interface
 *    - Beyond main spectrum due to infrastructure/gateway nature
 *
 * 🔷 Vercel Gateway (Unified API Provider):
 *    - Official Vercel AI Gateway with access to 250+ models
 *    - Unified API for multiple providers through single endpoint
 *    - Built-in budgeting, usage monitoring, and load balancing
 *    - Dynamic model discovery with pricing information
 *    - Both API key and OIDC token authentication support
 *    - Provider-specific options passthrough (e.g., Anthropic thinking)
 *    - Beyond main spectrum due to unified API gateway nature
 *
 * OUTCOME: Each provider is optimized for its level of AI SDK v5 integration,
 * creating a coherent ecosystem where users get consistent patterns while
 * preserving access to unique provider capabilities.
 *
 * LM Studio represents the purest form of Maximum SDK Usage - it's essentially
 * OpenAI SDK pointed at localhost, demonstrating how local models can integrate
 * seamlessly with the same patterns as cloud providers.
 *
 * Claude Code represents a new category beyond the main spectrum - community
 * providers that offer unique architectures and capabilities not available
 * through standard cloud providers.
 *
 * The dual gateway architecture (Cloudflare + Vercel) provides complementary
 * infrastructure solutions: Cloudflare focuses on enterprise caching and
 * multi-provider fallback, while Vercel offers unified API access with
 * built-in monitoring and budgeting across 250+ models.
 *
 * LAYERED ARCHITECTURE - Orthogonal Composition Design:
 *
 * ┌─────────────────────────────────────────┐
 * │           Application Code              │
 * ├─────────────────────────────────────────┤
 * │         Composition Layer               │
 * │ withGatewayRouting() | withReasoning()  │
 * │  withThinking() | withImages()          │
 * ├─────────────────────────────────────────┤
 * │         Gateway Infrastructure          │
 * │    routing, monitoring, attribution     │
 * ├─────────────────────────────────────────┤
 * │           Provider Layer                │
 * │  OpenAI | Anthropic | Google | xAI     │
 * └─────────────────────────────────────────┘
 *
 * COMPOSITION PHILOSOPHY:
 * - Infrastructure concerns (routing, monitoring) are completely separate from provider concerns (AI capabilities)
 * - All helpers return flat configuration objects that compose without interference
 * - Provider helpers work whether using direct providers OR gateway routing
 * - Clean orthogonal composition: generateText({ model: gateway('google/gemini-2.5-pro'), ...withGatewayRouting({order: ['google']}), ...withThinking(12000) })
 */

// Lazy-loaded provider registry for better tree shaking
export const lazyRegistry = () => import('./registry').then(m => m.registry);

// Direct exports for immediate use (tree-shakeable) - AI SDK v5 native
export type { ProviderConfig } from '../core/types';
export { getDefaultModel, models, registry } from './registry';
export type { LanguageModelId } from './registry';

// Re-export commonly used AI SDK types for convenience
export type {
  // Error types
  AISDKError,
  APICallError,
  EmbeddingModelV2,
  InvalidArgumentError,
  JSONArray,
  JSONObject,
  JSONValue,
  LanguageModelV2,
  LanguageModelV2CallOptions,
  LanguageModelV2CallWarning,
  LanguageModelV2Message,
  LanguageModelV2Prompt,
  LanguageModelV2ResponseMetadata,
  LanguageModelV2Usage,
  LoadAPIKeyError,
  NoSuchModelError,
  // Core types from @ai-sdk/provider
  SharedV2ProviderMetadata,
  SharedV2ProviderOptions,
} from '@ai-sdk/provider';

// Re-export provider-specific option types
export type { AnthropicProviderOptions } from '@ai-sdk/anthropic';
export type { OpenAIResponsesProviderOptions } from '@ai-sdk/openai';

// Export utilities
export * from './provider-factories';
export * from './utilities';

// Export provider-specific metadata types for better type safety in apps
export type { AnthropicMetadata, CacheMetadata, ToolError } from './anthropic';
export type { CloudflareAiGatewayConfig, CloudflareMetadata } from './cloudflare-ai-gateway';
export type { GoogleMetadata, SafetyRating, ThinkingDetails } from './google';
export type { XAISearchMetadata, XAISource } from './grok';
export type { OpenAIMetadata } from './openai';
export type {
  PerplexityImage,
  PerplexityMetadata,
  PerplexitySource,
  PerplexityUsageMetadata,
} from './perplexity';
