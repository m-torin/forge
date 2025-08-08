/**
 * Upstash Vector Environment Configuration
 * Type-safe environment variables with validation
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Upstash Vector environment configuration
 */
export const upstashEnv = createEnv({
  server: {
    // Optional Upstash Vector credentials for graceful degradation
    UPSTASH_VECTOR_REST_URL: z.string().url('Invalid Upstash Vector URL').optional(),
    UPSTASH_VECTOR_REST_TOKEN: z.string().min(1, 'Upstash Vector token is required').optional(),

    // Optional configuration
    UPSTASH_VECTOR_NAMESPACE: z.string().optional(),

    // Embedding configuration
    UPSTASH_EMBEDDING_MODEL: z
      .enum(['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'])
      .default('text-embedding-3-small'),
    UPSTASH_EMBEDDING_DIMENSIONS: z
      .string()
      .default('1536')
      .transform(val => parseInt(val, 10))
      .pipe(z.number().positive()),

    // Use Upstash hosted embeddings instead of OpenAI
    UPSTASH_USE_HOSTED_EMBEDDINGS: z
      .string()
      .default('false')
      .transform(val => val === 'true')
      .pipe(z.boolean()),
  },
  client: {
    // Client-side environment variables (if needed)
  },
  runtimeEnv: {
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
    UPSTASH_VECTOR_NAMESPACE: process.env.UPSTASH_VECTOR_NAMESPACE,
    UPSTASH_EMBEDDING_MODEL: process.env.UPSTASH_EMBEDDING_MODEL,
    UPSTASH_EMBEDDING_DIMENSIONS: process.env.UPSTASH_EMBEDDING_DIMENSIONS,
    UPSTASH_USE_HOSTED_EMBEDDINGS: process.env.UPSTASH_USE_HOSTED_EMBEDDINGS,
  },
  skipValidation: process.env.NODE_ENV === 'test' || process.env.SKIP_ENV_VALIDATION === 'true',
});

/**
 * Utility to check if Upstash Vector is configured
 */
export function isUpstashVectorConfigured(): boolean {
  try {
    return !!(upstashEnv.UPSTASH_VECTOR_REST_URL && upstashEnv.UPSTASH_VECTOR_REST_TOKEN);
  } catch {
    return false;
  }
}

/**
 * Get Upstash Vector configuration object
 */
export function getUpstashVectorConfig() {
  if (!isUpstashVectorConfigured()) {
    throw new Error('Upstash Vector is not configured. Check your environment variables.');
  }

  return {
    url: upstashEnv.UPSTASH_VECTOR_REST_URL,
    token: upstashEnv.UPSTASH_VECTOR_REST_TOKEN,
    namespace: upstashEnv.UPSTASH_VECTOR_NAMESPACE,
    embeddingModel: upstashEnv.UPSTASH_EMBEDDING_MODEL,
    dimensions: upstashEnv.UPSTASH_EMBEDDING_DIMENSIONS,
    useHostedEmbeddings: upstashEnv.UPSTASH_USE_HOSTED_EMBEDDINGS,
  };
}

/**
 * Type for Upstash Vector configuration
 */
export type UpstashVectorConfig = ReturnType<typeof getUpstashVectorConfig>;

/**
 * Environment variable templates for documentation
 */
export const envTemplate = `
# Upstash Vector Configuration
UPSTASH_VECTOR_REST_URL=https://your-vector-endpoint.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_vector_token

# Optional Configuration
UPSTASH_VECTOR_NAMESPACE=your_namespace

# Embedding Configuration
UPSTASH_EMBEDDING_MODEL=text-embedding-3-small
UPSTASH_EMBEDDING_DIMENSIONS=1536
UPSTASH_USE_HOSTED_EMBEDDINGS=false
`;

/**
 * Validation helper for manual configuration
 */
export function validateUpstashConfig(config: {
  url?: string;
  token?: string;
  namespace?: string;
}) {
  const schema = z.object({
    url: z.string().url(),
    token: z.string().min(1),
    namespace: z.string().optional(),
  });

  return schema.parse(config);
}
