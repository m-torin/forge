import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = Boolean(
  process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Upstash Vector configuration
    UPSTASH_VECTOR_REST_URL: requireInProduction ? z.string().url() : z.string().url().optional(),
    UPSTASH_VECTOR_REST_TOKEN: requireInProduction
      ? z.string().min(1)
      : z.string().min(1).optional(),

    // AI/Embeddings configuration
    VECTOR_EMBEDDING_MODEL: z.string().optional().default('text-embedding-ada-002'),
    VECTOR_EMBEDDING_DIMENSIONS: z.string().optional().default('1536'),
    VECTOR_SIMILARITY_THRESHOLD: z.string().optional().default('0.8'),

    // Vector database configuration
    VECTOR_NAMESPACE: z.string().optional().default('default'),
    VECTOR_BATCH_SIZE: z.string().optional().default('100'),

    // OpenAI configuration (for embeddings)
    OPENAI_API_KEY: z.string().optional(),

    // Vector logging configuration
    VECTOR_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('error'),
    VECTOR_LOG_PERFORMANCE: z.string().optional().default('false'),
  },
  runtimeEnv: {
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
    VECTOR_EMBEDDING_MODEL: process.env.VECTOR_EMBEDDING_MODEL,
    VECTOR_EMBEDDING_DIMENSIONS: process.env.VECTOR_EMBEDDING_DIMENSIONS,
    VECTOR_SIMILARITY_THRESHOLD: process.env.VECTOR_SIMILARITY_THRESHOLD,
    VECTOR_NAMESPACE: process.env.VECTOR_NAMESPACE,
    VECTOR_BATCH_SIZE: process.env.VECTOR_BATCH_SIZE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    VECTOR_LOG_LEVEL: process.env.VECTOR_LOG_LEVEL,
    VECTOR_LOG_PERFORMANCE: process.env.VECTOR_LOG_PERFORMANCE,
  },
  onValidationError: error => {
    console.warn('Upstash Vector environment validation failed:', error);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL || '',
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
    VECTOR_EMBEDDING_MODEL: process.env.VECTOR_EMBEDDING_MODEL || 'text-embedding-ada-002',
    VECTOR_EMBEDDING_DIMENSIONS: process.env.VECTOR_EMBEDDING_DIMENSIONS || '1536',
    VECTOR_SIMILARITY_THRESHOLD: process.env.VECTOR_SIMILARITY_THRESHOLD || '0.8',
    VECTOR_NAMESPACE: process.env.VECTOR_NAMESPACE || 'default',
    VECTOR_BATCH_SIZE: process.env.VECTOR_BATCH_SIZE || '100',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    VECTOR_LOG_LEVEL: process.env.VECTOR_LOG_LEVEL || 'error',
    VECTOR_LOG_PERFORMANCE: process.env.VECTOR_LOG_PERFORMANCE === 'true',
  };
}

// Export type for better DX
export type Env = typeof env;
