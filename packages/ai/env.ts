import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
  server: {
    // Core providers
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    PERPLEXITY_API_KEY: z.string().optional(),
    XAI_API_KEY: z.string().optional(),

    // Additional providers - add as many as needed
    GOOGLE_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
    GOOGLE_GENERATIVE_AI_BASE_URL: z.string().url().optional(),
    MISTRAL_API_KEY: z.string().optional(),
    COHERE_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    TOGETHER_API_KEY: z.string().optional(),
    REPLICATE_API_KEY: z.string().optional(),
    FIREWORKS_API_KEY: z.string().optional(),
    DEEPSEEK_API_KEY: z.string().optional(),

    // AI configuration
    DEFAULT_AI_MODEL: z.string().optional(),
    AI_RETRY_ATTEMPTS: z.coerce.number().default(3),
    AI_TELEMETRY: z.boolean().default(true),
    AI_COST_TRACKING: z.boolean().default(false),

    // Provider-specific configs
    ANTHROPIC_BASE_URL: z.string().url().optional(),
    OPENAI_BASE_URL: z.string().url().optional(),
    OPENAI_ORGANIZATION: z.string().optional(),
    LM_STUDIO_BASE_URL: z.string().url().optional(),
    LM_STUDIO_MODEL: z.string().optional(),
    LM_STUDIO_MODELS: z.string().optional(), // JSON string of model configurations

    // Claude Code provider configuration
    CLAUDE_CODE_ANTHROPIC_DIR: z.string().optional(), // Matches docs: anthropicDir option
    CLAUDE_CODE_ALLOWED_TOOLS: z.string().optional(), // Comma-separated list
    CLAUDE_CODE_DISALLOWED_TOOLS: z.string().optional(), // Comma-separated list
    CLAUDE_CODE_MCP_SERVERS: z.string().optional(), // Comma-separated list

    // Cloudflare AI Gateway configuration
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(), // Required for gateway usage
    CLOUDFLARE_AI_GATEWAY_NAME: z.string().optional(), // Required gateway name
    CLOUDFLARE_API_KEY: z.string().optional(), // Optional - only if gateway auth enabled
    CLOUDFLARE_AI_GATEWAY_CACHE_TTL: z.coerce.number().optional(), // Cache TTL in seconds
    CLOUDFLARE_AI_GATEWAY_SKIP_CACHE: z.boolean().optional(), // Bypass caching
    CLOUDFLARE_AI_GATEWAY_MAX_RETRIES: z.coerce.number().optional(), // Max retry attempts (1-5)

    // Vercel AI Gateway configuration
    AI_GATEWAY_API_KEY: z.string().optional(), // API key for Vercel AI Gateway
    AI_GATEWAY_BASE_URL: z.string().optional(), // Custom base URL (defaults to Vercel's)
    AI_GATEWAY_TIMEOUT: z.coerce.number().optional(), // Request timeout in milliseconds

    // Upstash Vector configuration
    UPSTASH_VECTOR_REST_URL: z.string().url().optional(),
    UPSTASH_VECTOR_REST_TOKEN: z.string().min(1).optional(),

    // Vector/AI configuration
    VECTOR_EMBEDDING_MODEL: z.string().optional().default('text-embedding-ada-002'),
    VECTOR_EMBEDDING_DIMENSIONS: z.string().optional().default('1536'),
    VECTOR_SIMILARITY_THRESHOLD: z.string().optional().default('0.8'),
    VECTOR_NAMESPACE: z.string().optional().default('default'),
    VECTOR_BATCH_SIZE: z.string().optional().default('100'),
    VECTOR_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('error'),
    VECTOR_LOG_PERFORMANCE: z.string().optional().default('false'),
  },
  client: {},
  experimental__runtimeEnv: {},
  onValidationError: error => {
    console.warn('❌ Invalid environment variables:', error);
    return undefined as never; // Don't throw in packages
  },
});

export function safeEnv() {
  return (
    env || {
      // Fallback to process.env if validation fails
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || '',
      XAI_API_KEY: process.env.XAI_API_KEY || '',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
      COHERE_API_KEY: process.env.COHERE_API_KEY || '',
      GROQ_API_KEY: process.env.GROQ_API_KEY || '',
      TOGETHER_API_KEY: process.env.TOGETHER_API_KEY || '',
      REPLICATE_API_KEY: process.env.REPLICATE_API_KEY || '',
      FIREWORKS_API_KEY: process.env.FIREWORKS_API_KEY || '',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',

      DEFAULT_AI_MODEL: process.env.DEFAULT_AI_MODEL || '',
      AI_RETRY_ATTEMPTS: Number(process.env.AI_RETRY_ATTEMPTS) || 3,
      AI_TELEMETRY: process.env.AI_TELEMETRY !== 'false',
      AI_COST_TRACKING: process.env.AI_COST_TRACKING === 'true',

      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || '',
      OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || '',
      OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION || '',
      LM_STUDIO_BASE_URL: process.env.LM_STUDIO_BASE_URL || '',
      LM_STUDIO_MODEL: process.env.LM_STUDIO_MODEL || '',
      LM_STUDIO_MODELS: process.env.LM_STUDIO_MODELS || '',

      CLAUDE_CODE_ANTHROPIC_DIR: process.env.CLAUDE_CODE_ANTHROPIC_DIR || '',
      CLAUDE_CODE_ALLOWED_TOOLS: process.env.CLAUDE_CODE_ALLOWED_TOOLS || '',
      CLAUDE_CODE_DISALLOWED_TOOLS: process.env.CLAUDE_CODE_DISALLOWED_TOOLS || '',
      CLAUDE_CODE_MCP_SERVERS: process.env.CLAUDE_CODE_MCP_SERVERS || '',

      CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      CLOUDFLARE_AI_GATEWAY_NAME: process.env.CLOUDFLARE_AI_GATEWAY_NAME || '',
      CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY || '',
      CLOUDFLARE_AI_GATEWAY_CACHE_TTL:
        Number(process.env.CLOUDFLARE_AI_GATEWAY_CACHE_TTL) || undefined,
      CLOUDFLARE_AI_GATEWAY_SKIP_CACHE: process.env.CLOUDFLARE_AI_GATEWAY_SKIP_CACHE === 'true',
      CLOUDFLARE_AI_GATEWAY_MAX_RETRIES:
        Number(process.env.CLOUDFLARE_AI_GATEWAY_MAX_RETRIES) || undefined,

      AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY || '',
      AI_GATEWAY_BASE_URL: process.env.AI_GATEWAY_BASE_URL || '',
      AI_GATEWAY_TIMEOUT: Number(process.env.AI_GATEWAY_TIMEOUT) || undefined,

      GOOGLE_GENERATIVE_AI_API_KEY:
        process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
      GOOGLE_GENERATIVE_AI_BASE_URL: process.env.GOOGLE_GENERATIVE_AI_BASE_URL || '',

      // Upstash Vector fallbacks (from extended env)
      UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL || '',
      UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
      VECTOR_EMBEDDING_MODEL: process.env.VECTOR_EMBEDDING_MODEL || 'text-embedding-ada-002',
      VECTOR_EMBEDDING_DIMENSIONS: process.env.VECTOR_EMBEDDING_DIMENSIONS || '1536',
      VECTOR_SIMILARITY_THRESHOLD: process.env.VECTOR_SIMILARITY_THRESHOLD || '0.8',
      VECTOR_NAMESPACE: process.env.VECTOR_NAMESPACE || 'default',
      VECTOR_BATCH_SIZE: process.env.VECTOR_BATCH_SIZE || '100',
      VECTOR_LOG_LEVEL: process.env.VECTOR_LOG_LEVEL || 'error',
      VECTOR_LOG_PERFORMANCE: process.env.VECTOR_LOG_PERFORMANCE === 'true',
    }
  );
}
