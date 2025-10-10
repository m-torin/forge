/**
 * Anthropic Provider Module
 * Centralized location for Anthropic-specific features and configurations
 * Claude uniquely provides reasoning models, computer use tools, and advanced caching
 *
 * DRY Principle: Only defines features unique to Anthropic
 * Generic patterns use AI SDK v5 and shared utilities
 *
 * ARCHITECTURAL DECISION: Anthropic "Middle Position" Pattern
 * ========================================================
 *
 * Anthropic represents the MIDDLE of the AI SDK v5 support spectrum:
 *
 * LIKE OPENAI (Remove Redundant):
 * - Removes anthropicModels because AI SDK v5 provides anthropic('model-id') natively
 * - Removes simple tool wrappers where AI SDK v5 has complete native support
 * - anthropic.tools.* provides full executable implementations
 *
 * LIKE PERPLEXITY (Keep Unique Value):
 * - Keeps capability detection functions because AI SDK v5 doesn't provide Anthropic-specific capability detection
 * - Keeps reasoning/cache middleware because these are complex provider-specific configurations
 * - Keeps model constants and groupings for semantic organization and capability mapping
 *
 * Result: Balanced DRY approach that removes duplication while preserving
 * genuine Anthropic-specific features that add value beyond what AI SDK v5 provides.
 */

import { anthropic as anthropicProvider } from '@ai-sdk/anthropic';
import type { JSONObject, SharedV2ProviderMetadata } from '@ai-sdk/provider';
import { defaultSettingsMiddleware } from 'ai';
import { TEMPS, TOKENS, TOP_P } from './shared';

// Type definitions for Anthropic-specific features
interface ComputerToolConfig {
  displayWidth: number;
  displayHeight: number;
  screenshotFormat?: 'png' | 'jpeg';
}

interface GenerationResult {
  reasoningText?: string;
  content?: Array<{ type: string; text?: string; error?: unknown }>;
  providerOptions?: SharedV2ProviderMetadata;
}

// Re-export the provider itself
export { anthropicProvider as anthropic };

/**
 * Single source of truth for Anthropic model IDs
 * Used by both registry and direct imports
 */
export const ANTHROPIC_MODEL_IDS = {
  // Claude 4 models with reasoning
  OPUS_4: 'claude-opus-4-20250514',
  SONNET_4: 'claude-sonnet-4-20250514',

  // Claude 3.7 with reasoning
  SONNET_37: 'claude-3-7-sonnet-20250219',

  // Claude 3.5 models
  SONNET_35: 'claude-3-5-sonnet-20241022',
  SONNET_35_OLD: 'claude-3-5-sonnet-20240620', // Legacy version
  HAIKU_35: 'claude-3-5-haiku-20241022',

  // Claude 3 models (legacy)
  OPUS_3: 'claude-3-opus-20240229',
  SONNET_3: 'claude-3-sonnet-20240229',
  HAIKU_3: 'claude-3-haiku-20240307',
} as const;

/**
 * Model groups for categorization
 * Helps identify capabilities and use cases
 */
export const ANTHROPIC_MODEL_GROUPS = {
  // Models with reasoning/thinking capabilities
  REASONING_MODELS: [
    ANTHROPIC_MODEL_IDS.OPUS_4,
    ANTHROPIC_MODEL_IDS.SONNET_4,
    ANTHROPIC_MODEL_IDS.SONNET_37,
  ] as const,

  // Models supporting image input
  MULTIMODAL_MODELS: [
    ANTHROPIC_MODEL_IDS.OPUS_4,
    ANTHROPIC_MODEL_IDS.SONNET_4,
    ANTHROPIC_MODEL_IDS.SONNET_37,
    ANTHROPIC_MODEL_IDS.SONNET_35,
    ANTHROPIC_MODEL_IDS.SONNET_35_OLD,
    ANTHROPIC_MODEL_IDS.HAIKU_35,
    ANTHROPIC_MODEL_IDS.OPUS_3,
    ANTHROPIC_MODEL_IDS.SONNET_3,
    ANTHROPIC_MODEL_IDS.HAIKU_3,
  ] as const,

  // Models supporting PDF input
  PDF_CAPABLE_MODELS: [ANTHROPIC_MODEL_IDS.SONNET_35] as const,

  // Models supporting computer use tools
  COMPUTER_USE_MODELS: [
    ANTHROPIC_MODEL_IDS.OPUS_4,
    ANTHROPIC_MODEL_IDS.SONNET_4,
    ANTHROPIC_MODEL_IDS.SONNET_37,
    ANTHROPIC_MODEL_IDS.SONNET_35,
  ] as const,

  // Models supporting web search
  WEB_SEARCH_MODELS: [
    ANTHROPIC_MODEL_IDS.OPUS_4,
    ANTHROPIC_MODEL_IDS.SONNET_4,
    ANTHROPIC_MODEL_IDS.SONNET_37,
    ANTHROPIC_MODEL_IDS.SONNET_35,
    ANTHROPIC_MODEL_IDS.SONNET_35_OLD,
    ANTHROPIC_MODEL_IDS.HAIKU_35,
  ] as const,

  // Models supporting code execution
  CODE_EXECUTION_MODELS: [
    ANTHROPIC_MODEL_IDS.OPUS_4,
    ANTHROPIC_MODEL_IDS.SONNET_4,
    ANTHROPIC_MODEL_IDS.SONNET_37,
    ANTHROPIC_MODEL_IDS.SONNET_35,
    ANTHROPIC_MODEL_IDS.SONNET_35_OLD,
    ANTHROPIC_MODEL_IDS.HAIKU_35,
  ] as const,
} as const;

/**
 * Model capabilities mapping
 * Based on official Anthropic documentation
 */
export const ANTHROPIC_MODEL_CAPABILITIES = {
  [ANTHROPIC_MODEL_IDS.OPUS_4]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: true,
    webSearch: true,
    codeExecution: true,
    pdfSupport: false,
    reasoningText: true,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['reasoning', 'computer-use', 'web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.SONNET_4]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: true,
    webSearch: true,
    codeExecution: true,
    pdfSupport: false,
    reasoningText: true,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['reasoning', 'computer-use', 'web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.SONNET_37]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: true,
    webSearch: true,
    codeExecution: true,
    pdfSupport: false,
    reasoningText: true,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['reasoning', 'computer-use', 'web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.SONNET_35]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: true,
    webSearch: true,
    codeExecution: true,
    pdfSupport: true,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['pdf-support', 'computer-use', 'web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.SONNET_35_OLD]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: false,
    webSearch: true,
    codeExecution: true,
    pdfSupport: false,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.HAIKU_35]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: false,
    webSearch: true,
    codeExecution: true,
    pdfSupport: false,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 2048, // Higher minimum for Haiku
    specialFeatures: ['fast', 'web-search', 'code-execution'],
  },
  [ANTHROPIC_MODEL_IDS.OPUS_3]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: false,
    webSearch: false,
    codeExecution: false,
    pdfSupport: false,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['legacy'],
  },
  [ANTHROPIC_MODEL_IDS.SONNET_3]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: false,
    webSearch: false,
    codeExecution: false,
    pdfSupport: false,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 1024,
    specialFeatures: ['legacy'],
  },
  [ANTHROPIC_MODEL_IDS.HAIKU_3]: {
    imageInput: true,
    objectGeneration: true,
    toolUsage: true,
    computerUse: false,
    webSearch: false,
    codeExecution: false,
    pdfSupport: false,
    reasoningText: false,
    maxContextTokens: 200000,
    cacheMinTokens: 2048, // Higher minimum for Haiku
    specialFeatures: ['legacy', 'fast'],
  },
} as const;

/**
 * Configuration presets for common use cases
 * Optimized for different Claude model scenarios
 */
export const ANTHROPIC_PRESETS = {
  // Reasoning tasks requiring logical thinking
  REASONING: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.LONG,
    topP: TOP_P.FOCUSED,
    anthropic: {
      sendReasoning: true,
    },
  },

  // Creative writing and brainstorming
  CREATIVE: {
    temperature: TEMPS.CREATIVE,
    maxOutputTokens: TOKENS.MEDIUM,
    topP: TOP_P.BALANCED,
  },

  // Code generation and technical tasks
  CODING: {
    temperature: TEMPS.BALANCED,
    maxOutputTokens: TOKENS.EXTENDED,
    topP: TOP_P.DETERMINISTIC,
  },

  // Document and data analysis
  ANALYSIS: {
    temperature: TEMPS.VERY_LOW,
    maxOutputTokens: TOKENS.LONG,
    topP: TOP_P.FOCUSED,
  },

  // Image and vision tasks
  VISION: {
    temperature: TEMPS.BALANCED,
    maxOutputTokens: TOKENS.MEDIUM,
    topP: TOP_P.BALANCED,
  },

  // Fast responses with lower quality
  QUICK: {
    temperature: TEMPS.VERY_LOW,
    maxOutputTokens: TOKENS.SHORT,
    topP: TOP_P.DETERMINISTIC,
  },
} as const;

/**
 * Tool name constants for correct usage
 * Different models may require different tool names
 */
const ANTHROPIC_TOOL_NAMES = {
  WEB_SEARCH: 'web_search',
  CODE_EXECUTION: 'code_execution',
  COMPUTER: 'computer',
  BASH: 'bash',
  TEXT_EDITOR: 'str_replace_editor', // Claude 3.5 and earlier
  TEXT_EDITOR_V2: 'str_replace_based_edit_tool', // Claude 4 models
} as const;

/**
 * ANTHROPIC-UNIQUE TOOL HELPERS - KEPT for Middle Position Strategy
 *
 * REASON: Unlike OpenAI's simple configuration wrappers, these tools:
 * - Require complex execute() function implementations
 * - Have model-specific variations (textEditor vs textEditorV2)
 * - Provide semantic organization and helpful defaults
 * - Add genuine DX value beyond raw AI SDK v5 access
 *
 * These represent the "middle position": more complex than simple wrappers,
 * but still thin abstractions over AI SDK v5 native tools.
 */
export const anthropicTools: {
  webSearch: (options?: {
    maxUses?: number;
    allowedDomains?: string[];
    blockedDomains?: string[];
    userLocation?: {
      type: 'approximate';
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
  }) => ReturnType<typeof anthropicProvider.tools.webSearch_20250305>;
  codeExecution: () => ReturnType<typeof anthropicProvider.tools.codeExecution_20250522>;
  computer: (
    config: ComputerToolConfig,
  ) => ReturnType<typeof anthropicProvider.tools.computer_20241022>;
  bash: () => ReturnType<typeof anthropicProvider.tools.bash_20241022>;
  textEditor: () => ReturnType<typeof anthropicProvider.tools.textEditor_20241022>;
  textEditorV2: () => ReturnType<typeof anthropicProvider.tools.textEditor_20250429>;
} = {
  /**
   * Web Search Tool - Real-time web access for Claude models
   * Requires web search to be enabled in Anthropic Console settings
   */
  webSearch: (options?: {
    maxUses?: number;
    allowedDomains?: string[];
    blockedDomains?: string[];
    userLocation?: {
      type: 'approximate';
      country?: string;
      region?: string;
      city?: string;
      timezone?: string;
    };
  }) => anthropicProvider.tools.webSearch_20250305(options || { maxUses: 5 }),

  /**
   * Code Execution Tool - Sandboxed Python environment
   * Available for Claude 4 models
   */
  codeExecution: () => anthropicProvider.tools.codeExecution_20250522(),

  /**
   * Computer Use Tool - Control keyboard and mouse actions
   * Available for select Claude models
   */
  computer: (config: ComputerToolConfig) =>
    anthropicProvider.tools.computer_20241022({
      displayWidthPx: config.displayWidth || 1920,
      displayHeightPx: config.displayHeight || 1080,
    }),

  /**
   * Bash Tool - Execute bash commands
   * Available for select Claude models
   */
  bash: () => anthropicProvider.tools.bash_20241022({}),

  /**
   * Text Editor Tool - View and edit text files
   * Different versions for different Claude models
   */
  textEditor: () => anthropicProvider.tools.textEditor_20241022({}),

  /**
   * Text Editor for Claude 4 models
   * Uses different command structure
   */
  textEditorV2: () => anthropicProvider.tools.textEditor_20250429({}),
};

/**
 * AI SDK v5 Middleware: Anthropic Reasoning Mode
 * Enables reasoning/thinking mode for Claude 4 and Claude 3.7 models
 */
function createAnthropicReasoningMiddleware(budgetTokens: number = 12000) {
  return defaultSettingsMiddleware({
    settings: {
      providerOptions: {
        anthropic: {
          thinking: { type: 'enabled', budgetTokens },
        },
      },
    },
  });
}

/**
 * AI SDK v5 Middleware: Anthropic Cache Control
 * Reduces costs by caching frequently used prompts
 */
function createAnthropicCacheMiddleware(ttl?: '5m' | '1h') {
  return defaultSettingsMiddleware({
    settings: {
      providerOptions: {
        anthropic: {
          cacheControl: {
            type: 'ephemeral',
            ...(ttl && { ttl }),
          },
        },
      },
    },
  });
}

/**
 * AI SDK v5 Middleware: Anthropic Send Reasoning
 * Controls whether reasoning content is sent in requests
 */
function createAnthropicSendReasoningMiddleware(send: boolean = true) {
  return defaultSettingsMiddleware({
    settings: {
      providerOptions: {
        anthropic: {
          sendReasoning: send,
        },
      },
    },
  });
}

/**
 * AI SDK v5 Middleware: Anthropic Extended Cache
 * Extended cache with 1-hour TTL (requires beta header)
 */
function createAnthropicExtendedCacheMiddleware() {
  return defaultSettingsMiddleware({
    settings: {
      providerOptions: {
        anthropic: {
          cacheControl: {
            type: 'ephemeral',
            ttl: '1h',
          },
        },
      },
    },
  });
}

/**
 * AI SDK v5 Middleware: Anthropic PDF Support
 * Enables PDF document processing for Claude 3.5 Sonnet
 */
function createAnthropicPDFMiddleware() {
  return defaultSettingsMiddleware({
    settings: {
      providerOptions: {
        anthropic: {
          // PDF support is automatic when using file content type
          // This middleware is for documentation purposes
        },
      },
    },
  });
}

/**
 * Helper for enabling reasoning/thinking mode - Provider Agnostic
 * Available for Claude 4 and Claude 3.7 models
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: anthropic('claude-sonnet-4'), ...withReasoning(25000) })
 *
 * // Works with gateway
 * generateText({ model: gateway('anthropic/claude-sonnet-4'), ...withReasoning(25000) })
 * ```
 */
export function withReasoning(budgetTokens: number = 12000) {
  return {
    providerOptions: {
      anthropic: {
        thinking: { type: 'enabled' as const, budgetTokens },
      },
    },
  };
}

/**
 * Helper for cache control configuration - Provider Agnostic
 * Reduces costs by caching frequently used prompts
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: anthropic('claude-3-5-sonnet'), ...withCacheControl('1h') })
 *
 * // Works with gateway
 * generateText({ model: gateway('anthropic/claude-3-5-sonnet'), ...withCacheControl('1h') })
 * ```
 */
export function withCacheControl(ttl?: '5m' | '1h') {
  return {
    providerOptions: {
      anthropic: {
        cacheControl: {
          type: 'ephemeral' as const,
          ...(ttl && { ttl }),
        },
      },
    },
  };
}

/**
 * Helper for controlling reasoning content in requests - Provider Agnostic
 * Set to false if experiencing issues with reasoning content
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: anthropic('claude-sonnet-4'), ...withSendReasoning(false) })
 *
 * // Works with gateway
 * generateText({ model: gateway('anthropic/claude-sonnet-4'), ...withSendReasoning(false) })
 * ```
 */
export function withSendReasoning(send: boolean = true) {
  return {
    providerOptions: {
      anthropic: {
        sendReasoning: send,
      },
    },
  };
}

/**
 * Helper for extended cache with 1-hour TTL - Provider Agnostic
 * Includes required beta headers and provider options
 * Works with both direct providers and gateway routing
 *
 * @example
 * ```typescript
 * // Works with direct provider
 * generateText({ model: anthropic('claude-3-5-sonnet'), ...withExtendedCache() })
 *
 * // Works with gateway
 * generateText({ model: gateway('anthropic/claude-3-5-sonnet'), ...withExtendedCache() })
 * ```
 */
export function withExtendedCache() {
  return {
    headers: {
      'anthropic-beta': 'extended-cache-ttl-2025-04-11',
    },
    providerOptions: {
      anthropic: {
        cacheControl: {
          type: 'ephemeral' as const,
          ttl: '1h',
        },
      },
    },
  };
}

/**
 * Helper for PDF support configuration
 * Only available for Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
 * Now uses AI SDK v5 middleware pattern
 * Note: PDF support is automatic when using file content type
 */
export function withPDFSupport() {
  return createAnthropicPDFMiddleware();
}

/**
 * Helper for computer use configuration
 * Available for Claude 4 and select Claude 3.5 models
 * Note: Computer use is configured via tools, not provider options
 */
export function withComputerUse(displayConfig?: {
  widthPx?: number;
  heightPx?: number;
  displayNumber?: number;
}): {
  widthPx?: number;
  heightPx?: number;
  displayNumber?: number;
} {
  // Computer use is configured via tools, not provider options
  // This helper returns display configuration for tool setup
  return displayConfig || {};
}

/**
 * Get model capabilities
 * Check what features a specific model supports
 */
function getModelCapabilities(modelId: string): ModelCapabilities | undefined {
  return ANTHROPIC_MODEL_CAPABILITIES[modelId as keyof typeof ANTHROPIC_MODEL_CAPABILITIES];
}

/**
 * Check if model supports reasoning/thinking
 */
export function supportsReasoning(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.reasoningText ?? false;
}

/**
 * Check if model supports PDF input
 */
export function supportsPDF(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.pdfSupport ?? false;
}

/**
 * Check if model supports computer use
 */
export function supportsComputerUse(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.computerUse ?? false;
}

/**
 * Check if model supports web search
 */
export function supportsWebSearch(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.webSearch ?? false;
}

/**
 * Check if model supports code execution
 */
export function supportsCodeExecution(modelId: string): boolean {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.codeExecution ?? false;
}

/**
 * Get minimum cacheable tokens for a model
 */
export function getCacheMinTokens(modelId: string): number {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.cacheMinTokens ?? 1024; // Default minimum
}

/**
 * Get maximum context tokens for a model
 */
export function getMaxContextTokens(modelId: string): number {
  const capabilities = getModelCapabilities(modelId);
  return capabilities?.maxContextTokens ?? 200000; // Default context size
}

/**
 * Check if model is a reasoning model
 */
export function isReasoningModel(modelId: string): boolean {
  return ANTHROPIC_MODEL_GROUPS.REASONING_MODELS.includes(
    modelId as (typeof ANTHROPIC_MODEL_GROUPS.REASONING_MODELS)[number],
  );
}

/**
 * Check if model is multimodal (supports images)
 */
export function isMultimodalModel(modelId: string): boolean {
  return ANTHROPIC_MODEL_GROUPS.MULTIMODAL_MODELS.includes(
    modelId as (typeof ANTHROPIC_MODEL_GROUPS.MULTIMODAL_MODELS)[number],
  );
}

/**
 * Extract reasoning details from result
 * Available for reasoning-capable models
 */
export function extractReasoningDetails(result: GenerationResult): ReasoningDetails | null {
  const anthropicMeta = result.providerOptions?.anthropic;
  if (!anthropicMeta || typeof anthropicMeta !== 'object' || Array.isArray(anthropicMeta))
    return null;

  const reasoningDetails = anthropicMeta.reasoningText;
  if (!reasoningDetails || typeof reasoningDetails !== 'object' || Array.isArray(reasoningDetails))
    return null;

  const reasoningContent = (reasoningDetails as JSONObject).reasoningContent;

  return {
    reasoningText: typeof reasoningContent === 'string' ? reasoningContent : '',
    reasoningDetails: reasoningDetails as JSONObject,
  };
}

/**
 * Extract cache metadata from result
 * Includes cache creation input tokens
 */
export function extractCacheMetadata(result: GenerationResult): CacheMetadata | null {
  const anthropicMeta = result.providerOptions?.anthropic;
  if (!anthropicMeta || typeof anthropicMeta !== 'object' || Array.isArray(anthropicMeta))
    return null;

  const cacheCreationInputTokens = (anthropicMeta as JSONObject).cacheCreationInputTokens;
  const cacheReadInputTokens = (anthropicMeta as JSONObject).cacheReadInputTokens;

  return {
    cacheCreationInputTokens:
      typeof cacheCreationInputTokens === 'number' ? cacheCreationInputTokens : 0,
    cacheReadInputTokens: typeof cacheReadInputTokens === 'number' ? cacheReadInputTokens : 0,
  };
}

/**
 * Extract complete provider metadata
 * Comprehensive extraction of all Anthropic-specific data
 */
export function extractProviderMetadata(result: GenerationResult): AnthropicMetadata | null {
  const anthropicMeta = result.providerOptions?.anthropic;
  if (!anthropicMeta || typeof anthropicMeta !== 'object' || Array.isArray(anthropicMeta))
    return null;

  const meta = anthropicMeta as JSONObject;
  const reasoningDetails = meta.reasoningText;
  const cacheCreationInputTokens = meta.cacheCreationInputTokens;
  const cacheReadInputTokens = meta.cacheReadInputTokens;

  return {
    cacheCreationInputTokens:
      typeof cacheCreationInputTokens === 'number' ? cacheCreationInputTokens : 0,
    cacheReadInputTokens: typeof cacheReadInputTokens === 'number' ? cacheReadInputTokens : 0,
    reasoningText: result.reasoningText,
    reasoningDetails:
      reasoningDetails && typeof reasoningDetails === 'object' && !Array.isArray(reasoningDetails)
        ? (reasoningDetails as JSONObject)
        : undefined,
  };
}

/**
 * Extract tool errors from streaming or non-streaming results
 * Handles different error formats for different response types
 */
export function extractToolErrors(result: GenerationResult): ToolError[] {
  const errors: ToolError[] = [];

  // Non-streaming: Check content for tool-error parts
  if (result.content && Array.isArray(result.content)) {
    result.content.forEach((part: any) => {
      if (part.type === 'tool-error') {
        errors.push({
          toolName: (part as any).toolName || 'unknown',
          toolCallId: (part as any).toolCallId || '',
          error: part.error,
        });
      }
    });
  }

  // Streaming: Errors come through the stream
  // This would be handled in the stream processing

  return errors;
}

/**
 * Pre-configured Anthropic models for convenience
 * All models are raw (no caching) - use registry for cached versions
 */
// Pre-configured models REMOVED for DRY compliance
// REASON: These were just syntactic sugar with no unique value.
// AI SDK v5 pattern is direct provider invocation: anthropic('model-id')
// Users should use: anthropic('claude-opus-4-20250514') instead of anthropicModels.opus4

/**
 * TypeScript type definitions
 */

// Model capabilities type
export interface ModelCapabilities {
  imageInput: boolean;
  objectGeneration: boolean;
  toolUsage: boolean;
  computerUse: boolean;
  webSearch: boolean;
  codeExecution: boolean;
  pdfSupport: boolean;
  reasoningText: boolean;
  maxContextTokens: number;
  cacheMinTokens: number;
  specialFeatures: readonly string[];
}

// Reasoning details type
export interface ReasoningDetails {
  reasoningText: string;
  reasoningDetails?: {
    reasoningContent?: string;
    reasoningTokenCount?: number;
  };
}

// Cache metadata type
export interface CacheMetadata {
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
}

// Complete Anthropic metadata type
export interface AnthropicMetadata {
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  reasoningText?: string;
  reasoningDetails?: {
    reasoningContent?: string;
    reasoningTokenCount?: number;
  };
}

// Tool error type
export interface ToolError {
  toolName: string;
  toolCallId: string;
  error: unknown;
}

/**
 * Type exports for better IDE support
 */
export type { AnthropicProviderOptions } from '@ai-sdk/anthropic';

// Testing-only bundle to exercise internal middleware creators without
// exposing them as part of the public API surface.
export const __test = {
  createAnthropicReasoningMiddleware,
  createAnthropicCacheMiddleware,
  createAnthropicSendReasoningMiddleware,
  createAnthropicExtendedCacheMiddleware,
  createAnthropicPDFMiddleware,
} as const;

/**
 * Example usage documentation
 *
 * Example 1: Text generation with reasoning
 * ```typescript
 * const { text, reasoning } = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.OPUS_4),  // AI SDK v5 pattern
 *   prompt: 'Solve this complex problem...',
 *   providerOptions: withReasoning(15000),
 * });
 * console.log('Reasoning:', reasoning);
 * console.log('Answer:', text);
 * ```
 *
 * Example 2: Using web search tool
 * ```typescript
 * const webSearchTool = anthropicTools.webSearch({
 *   maxUses: 3,
 *   allowedDomains: ['arxiv.org', 'nature.com']
 * });
 * const result = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.OPUS_4),  // AI SDK v5 pattern
 *   prompt: 'What are the latest quantum computing breakthroughs?',
 *   tools: { [ANTHROPIC_TOOL_NAMES.WEB_SEARCH]: webSearchTool },
 * });
 * ```
 *
 * Example 3: Extended cache control (1-hour TTL)
 * ```typescript
 * const { providerOptions, headers } = withExtendedCache();
 * const result = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.SONNET_35),  // AI SDK v5 pattern
 *   headers,
 *   messages: [{
 *     role: 'user',
 *     content: [
 *       {
 *         type: 'text',
 *         text: 'Long reference document...',
 *         providerOptions: {
 *           anthropic: { cacheControl: { type: 'ephemeral' } }
 *         }
 *       },
 *       { type: 'text', text: 'Analyze this document' }
 *     ],
 *   }],
 *   providerOptions,
 * });
 * const cacheMeta = extractCacheMetadata(result);
 * console.log('Cache tokens:', cacheMeta);
 * ```
 *
 * Example 4: PDF processing (Claude 3.5 Sonnet only)
 * ```typescript
 * if (supportsPDF(ANTHROPIC_MODEL_IDS.SONNET_35)) {
 *   const result = await generateText({
 *     model: anthropic(ANTHROPIC_MODEL_IDS.SONNET_35),  // AI SDK v5 pattern
 *     messages: [{
 *       role: 'user',
 *       content: [
 *         { type: 'text', text: 'Summarize this PDF' },
 *         {
 *           type: 'file',
 *           data: fs.readFileSync('./document.pdf'),
 *           mediaType: 'application/pdf',
 *         }
 *       ],
 *     }],
 *   });
 * }
 * ```
 *
 * Example 5: Computer use with screenshot
 * ```typescript
 * const computerTool = anthropicTools.computer({
 *   displayWidthPx: 1920,
 *   displayHeightPx: 1080,
 *   execute: async ({ action, coordinate, text }) => {
 *     if (action === 'screenshot') {
 *       return {
 *         type: 'image',
 *         data: getScreenshot().toString('base64')
 *       };
 *     }
 *     // Handle other actions...
 *   },
 *   toModelOutput: (result) =>
 *     typeof result === 'string'
 *       ? [{ type: 'text', text: result }]
 *       : [{ type: 'image', data: result.data, mediaType: 'image/png' }]
 * });
 *
 * const result = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.OPUS_4),  // AI SDK v5 pattern
 *   prompt: 'Click on the submit button',
 *   tools: { [ANTHROPIC_TOOL_NAMES.COMPUTER]: computerTool },
 * });
 * ```
 *
 * Example 6: Code execution
 * ```typescript
 * const codeExecutionTool = anthropicTools.codeExecution();
 * const result = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.SONNET_4),  // AI SDK v5 pattern
 *   prompt: 'Calculate the factorial of 20',
 *   tools: { [ANTHROPIC_TOOL_NAMES.CODE_EXECUTION]: codeExecutionTool },
 * });
 *
 * // Handle errors
 * const toolErrors = extractToolErrors(result);
 * if (toolErrors.length > 0) {
 *   console.error('Tool errors:', toolErrors);
 * }
 * ```
 *
 * Example 7: Using configuration presets
 * ```typescript
 * // Creative writing
 * const creative = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.SONNET_35),  // AI SDK v5 pattern
 *   prompt: 'Write a short story about time travel',
 *   ...ANTHROPIC_PRESETS.CREATIVE,
 * });
 *
 * // Code generation
 * const code = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.OPUS_4),  // AI SDK v5 pattern
 *   prompt: 'Implement a binary search tree in TypeScript',
 *   ...ANTHROPIC_PRESETS.CODING,
 * });
 *
 * // Document analysis
 * const analysis = await generateText({
 *   model: anthropic(ANTHROPIC_MODEL_IDS.SONNET_37),  // AI SDK v5 pattern
 *   prompt: 'Analyze this financial report',
 *   ...ANTHROPIC_PRESETS.ANALYSIS,
 * });
 * ```
 *
 * Example 8: Model capability checking
 * ```typescript
 * const modelId = ANTHROPIC_MODEL_IDS.OPUS_4;
 *
 * if (supportsReasoning(modelId)) {
 *   console.log('Model supports reasoning');
 * }
 *
 * if (supportsWebSearch(modelId)) {
 *   console.log('Model supports web search');
 * }
 *
 * const minTokens = getCacheMinTokens(modelId);
 * console.log(`Minimum cacheable tokens: ${minTokens}`);
 *
 * const maxContext = getMaxContextTokens(modelId);
 * console.log(`Maximum context: ${maxContext} tokens`);
 * ```
 */
