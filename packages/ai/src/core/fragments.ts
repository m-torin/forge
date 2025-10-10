import { logDebug } from '@repo/observability';
import { stepCountIs } from 'ai';
import { TEMPS, TOKENS } from '../providers/shared';

/**
 * AI SDK v5 Configuration Fragments - DRY helpers only
 * Following package philosophy: "DRY helper functions that reduce boilerplate without adding complexity"
 *
 * Only includes fragments that are used 3+ times across the monorepo
 * Single-use configurations should be inline, not abstracted
 */

// Chat configuration fragments - frequently reused patterns only
export const chatFragments = {
  // Basic chat configuration - used 6+ times across generation functions
  basicChat: {
    temperature: TEMPS.BALANCED,
    maxOutputTokens: TOKENS.MEDIUM,
  },

  // Structured data chat - used 6+ times in object generation
  structured: {
    temperature: TEMPS.VERY_LOW,
    maxOutputTokens: TOKENS.LONG,
  },

  // Tool-enabled chat - used 3+ times
  withTools: {
    temperature: TEMPS.BALANCED,
    maxOutputTokens: TOKENS.MEDIUM,
    toolChoice: 'auto' as const,
  },
} as const;

// Structured data fragments - frequently reused patterns only
export const structuredFragments = {
  // Object generation - used 4+ times across structured data examples
  objectGeneration: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'object' as const,
  },

  // Array generation - used in examples
  arrayGeneration: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.LONG,
    output: 'array' as const,
  },

  // Large data extraction - used in examples
  largeDataExtraction: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.EXTENDED,
    output: 'array' as const,
  },

  // Enum classification - used in examples
  enumClassification: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.TINY,
    output: 'enum' as const,
  },

  // No schema generation - used in examples
  noSchemaGeneration: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'no-schema' as const,
  },

  // Streaming object - used in examples
  streamingObject: {
    temperature: TEMPS.VERY_LOW,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'object' as const,
    stream: true,
  },
} as const;

// Output strategy fragments - domain-specific patterns used 3+ times
export const outputStrategyFragments = {
  // Product data extraction - used 3+ times in structured examples
  productData: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.MEDIUM,
    output: 'object' as const,
    schemaName: 'ProductData',
    schemaDescription: 'E-commerce product information extraction',
  },

  // Content classification - used in examples
  contentClassification: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.SHORT / 2,
    output: 'enum' as const,
  },

  // Form extraction - used in examples
  formExtraction: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.SHORT,
    output: 'object' as const,
    schemaName: 'FormData',
    schemaDescription: 'Extract structured form data from text',
  },

  // Bulk processing - used in examples
  bulkProcessing: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.LONG,
    output: 'array' as const,
  },

  // Analytics data - used in examples
  analyticsData: {
    temperature: TEMPS.PRECISE,
    maxOutputTokens: TOKENS.SHORT,
    output: 'object' as const,
    schemaName: 'AnalyticsData',
    schemaDescription: 'Extract KPI and analytics data',
  },
} as const;

// Prompt engineering specific fragments - align with AI SDK best practices
export const promptEngineering = {
  // Tool calling best practices - deterministic execution
  toolCalling: {
    temperature: TEMPS.PRECISE, // Deterministic for tool execution per guidelines
    stopWhen: stepCountIs(5),
    toolChoice: 'auto' as const,
    maxOutputTokens: TOKENS.MEDIUM,
  },

  // Structured output best practices - zero temperature for schema adherence
  structuredOutput: {
    temperature: TEMPS.PRECISE, // Deterministic for schema adherence per guidelines
    maxOutputTokens: TOKENS.MEDIUM,
  },

  // Simple complexity limits from prompt engineering guidelines
  limits: {
    recommendedToolCount: 5, // Keep tools ≤ 5 for better performance
    maxSchemaDepth: 3, // Avoid deeply nested schemas
    maxSchemaProperties: 10, // Keep schemas simple
  },
} as const;

// Error handling fragments - AI SDK v5 streaming patterns
export const errorFragments = {
  // Simple stream error handling - basic try/catch pattern
  simpleStream: {
    onError: (error: any) => logDebug('[AI] Stream error:', error.message),
  },

  // Full stream with error parts support
  fullStream: {
    onError: (error: any) => logDebug('[AI] Stream error:', error.message),
    onAbort: (result: any) => logDebug('[AI] Stream aborted:', { steps: result.steps?.length }),
  },

  // UX-focused abort handling (chat stop button scenarios)
  withAbortSupport: {
    onAbort: (result: any) => {
      logDebug(`[AI] Stream aborted after ${result.steps?.length || 0} steps`);
      return { partialResults: result.steps || [] };
    },
    onFinish: () => logDebug('[AI] Stream completed normally'),
  },
} as const;

// Error configuration fragments - composable error strategies
export const errorConfigFragments = {
  // Basic retry configuration
  withRetry: {
    retry: {
      maxRetries: 3,
      backoffMs: 1000,
      retryOn: (error: any) => error.message.includes('rate limit'),
    },
  },

  // Model fallback using registry semantic names
  withFallback: {
    fallbackModels: ['tool-balanced', 'fast-precise'], // Uses your LanguageModelId types
  },

  // Combined robust configuration
  robust: {
    retry: { maxRetries: 2, backoffMs: 500 },
    fallbackModels: ['fast'],
  },
} as const;

// LRU Cache configuration fragments - common caching patterns
export const lruCacheFragments = {
  // Basic cache for general use - 15 minute TTL
  basic: {
    maxSize: 100,
    ttl: 1000 * 60 * 15, // 15 minutes
    updateAgeOnGet: true,
  },

  // Large cache for high-volume operations - 1 hour TTL
  large: {
    maxSize: 500,
    ttl: 1000 * 60 * 60, // 1 hour
    updateAgeOnGet: true,
  },

  // Development cache - short TTL for testing
  development: {
    maxSize: 50,
    ttl: 1000 * 60 * 5, // 5 minutes
    updateAgeOnGet: true,
  },

  // Long-term cache for stable operations - 24 hour TTL
  persistent: {
    maxSize: 200,
    ttl: 1000 * 60 * 60 * 24, // 24 hours
    updateAgeOnGet: false, // Don't reset age on access
  },
} as const;
