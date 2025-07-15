import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // API Keys for AI providers
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    DEEP_INFRA_API_KEY: z.string().optional(),
    PERPLEXITY_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),

    // Upstash Vector Database
    UPSTASH_VECTOR_REST_URL: z.string().url().optional(),
    UPSTASH_VECTOR_REST_TOKEN: z.string().optional(),
    UPSTASH_VECTOR_NAMESPACE: z.string().optional(),

    // Upstash Redis (for rate limiting)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // MCP Configuration
    MCP_SERVERS: z.string().optional(),
    MCP_FILESYSTEM_PATH: z.string().optional(),
    MCP_SQLITE_DB: z.string().optional(),

    // Environment variables
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    SKIP_ENV_VALIDATION: z.string().optional(),

    // Runtime detection
    NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),

    // AI Logging Configuration
    AI_LOGGING_ENABLED: z
      .string()
      .transform(val => val === 'true')
      .default(true),
    AI_LOG_REQUESTS: z
      .string()
      .transform(val => val === 'true')
      .default(true),
    AI_LOG_RESPONSES: z
      .string()
      .transform(val => val === 'true')
      .default(false),
    AI_LOG_PERFORMANCE: z
      .string()
      .transform(val => val === 'true')
      .default(true),
  },
  client: {
    // Feature flags
    NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED: z.string().optional(),
    NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED: z.string().optional(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    // Server environment variables
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    DEEP_INFRA_API_KEY: process.env.DEEP_INFRA_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
    UPSTASH_VECTOR_NAMESPACE: process.env.UPSTASH_VECTOR_NAMESPACE,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    MCP_SERVERS: process.env.MCP_SERVERS,
    MCP_FILESYSTEM_PATH: process.env.MCP_FILESYSTEM_PATH,
    MCP_SQLITE_DB: process.env.MCP_SQLITE_DB,
    NODE_ENV: process.env.NODE_ENV,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    AI_LOGGING_ENABLED: process.env.AI_LOGGING_ENABLED,
    AI_LOG_REQUESTS: process.env.AI_LOG_REQUESTS,
    AI_LOG_RESPONSES: process.env.AI_LOG_RESPONSES,
    AI_LOG_PERFORMANCE: process.env.AI_LOG_PERFORMANCE,

    // Client environment variables
    NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED: process.env.NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED,
    NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED: process.env.NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  onValidationError: error => {
    console.warn('AI environment validation failed:', error);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server variables
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY || '',
    DEEP_INFRA_API_KEY: process.env.DEEP_INFRA_API_KEY || '',
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
    XAI_API_KEY: process.env.XAI_API_KEY || '',
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL || '',
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
    UPSTASH_VECTOR_NAMESPACE: process.env.UPSTASH_VECTOR_NAMESPACE || '',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    MCP_SERVERS: process.env.MCP_SERVERS || '',
    MCP_FILESYSTEM_PATH: process.env.MCP_FILESYSTEM_PATH || '',
    MCP_SQLITE_DB: process.env.MCP_SQLITE_DB || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION || '',
    NEXT_RUNTIME: process.env.NEXT_RUNTIME as 'nodejs' | 'edge' | undefined,
    AI_LOGGING_ENABLED: process.env.AI_LOGGING_ENABLED === 'true',
    AI_LOG_REQUESTS: process.env.AI_LOG_REQUESTS !== 'false',
    AI_LOG_RESPONSES: process.env.AI_LOG_RESPONSES === 'true',
    AI_LOG_PERFORMANCE: process.env.AI_LOG_PERFORMANCE !== 'false',

    // Client variables
    NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED: process.env.NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED || '',
    NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED:
      process.env.NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED || '',
    NEXT_PUBLIC_NODE_ENV:
      (process.env.NEXT_PUBLIC_NODE_ENV as 'development' | 'test' | 'production') || 'development',
  };
}

// Export type for better DX
export type Env = typeof env;

/**
 * Helper function to get raw environment variables (for special cases)
 * Prefer using safeEnv() functions for type safety
 */
export function getRawEnv(): Record<string, string | undefined> {
  return typeof process !== 'undefined' ? process.env : {};
}

/**
 * Environment detection helpers
 */
export function isProduction(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'development';
}

export function isTest(): boolean {
  const envVars = safeEnv();
  return envVars.NODE_ENV === 'test';
}

export function isEdgeRuntime(): boolean {
  const envVars = safeEnv();
  return envVars.NEXT_RUNTIME === 'edge';
}

/**
 * Feature flag helpers
 */
export function isPerplexitySearchEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.NEXT_PUBLIC_PERPLEXITY_SEARCH_ENABLED === 'true';
}

export function isPerplexityCitationsEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.NEXT_PUBLIC_PERPLEXITY_CITATIONS_ENABLED === 'true';
}

/**
 * Helper functions for checking if API keys are configured
 */
export function hasAnthropicConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.ANTHROPIC_API_KEY);
}

export function hasOpenAIConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.OPENAI_API_KEY);
}

export function hasGoogleAIConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.GOOGLE_AI_API_KEY);
}

export function hasDeepInfraConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.DEEP_INFRA_API_KEY);
}

export function hasPerplexityConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.PERPLEXITY_API_KEY);
}

export function hasXAIConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.XAI_API_KEY);
}

export function hasUpstashVectorConfig(): boolean {
  const envVars = safeEnv();
  return Boolean(envVars.UPSTASH_VECTOR_REST_URL && envVars.UPSTASH_VECTOR_REST_TOKEN);
}

/**
 * AI Logging feature flag helpers
 */
export function isAILoggingEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.AI_LOGGING_ENABLED;
}

export function isAIRequestLoggingEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.AI_LOGGING_ENABLED && envVars.AI_LOG_REQUESTS;
}

export function isAIResponseLoggingEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.AI_LOGGING_ENABLED && envVars.AI_LOG_RESPONSES;
}

export function isAIPerformanceLoggingEnabled(): boolean {
  const envVars = safeEnv();
  return envVars.AI_LOGGING_ENABLED && envVars.AI_LOG_PERFORMANCE;
}
