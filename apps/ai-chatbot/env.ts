/**
 * Use console.log instead of observability to avoid Edge Runtime issues
 */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Environment variable validation and type-safe access
 */
export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().url().optional(),
    POSTGRES_URL: z.string().url().optional(),
    POSTGRES_PRISMA_URL: z.string().url().optional(),
    POSTGRES_URL_NON_POOLING: z.string().url().optional(),

    // Auth
    BETTER_AUTH_SECRET: z.string().min(1),
    AUTH_GITHUB_ID: z.string().min(1).optional(),
    AUTH_GITHUB_SECRET: z.string().min(1).optional(),
    AUTH_GOOGLE_ID: z.string().min(1).optional(),
    AUTH_GOOGLE_SECRET: z.string().min(1).optional(),

    // AI Providers
    OPENAI_API_KEY: z.string().min(1).optional(),
    ANTHROPIC_API_KEY: z.string().min(1).optional(),
    GOOGLE_AI_API_KEY: z.string().min(1).optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
    XAI_API_KEY: z.string().min(1).optional(),
    PERPLEXITY_API_KEY: z.string().min(1).optional(),

    // RAG / Vector Database
    UPSTASH_VECTOR_REST_URL: z.string().url().optional(),
    UPSTASH_VECTOR_REST_TOKEN: z.string().min(1).optional(),
    UPSTASH_VECTOR_NAMESPACE: z.string().min(1).optional(),

    // Storage
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),

    // Redis
    REDIS_URL: z.string().url().optional(),
    REDIS_TOKEN: z.string().min(1).optional(),

    // Monitoring
    SENTRY_DSN: z.string().url().optional(),

    // Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // MCP Feature Flags (JSON Configuration)
    MCP_CONFIG: z.string().optional(),

    // Feature Flags SDK Configuration
    FLAGS_SECRET: z.string().min(32).optional(),
    POSTHOG_KEY: z.string().min(1).optional(),
    POSTHOG_HOST: z.string().url().optional(),
    EDGE_CONFIG: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_PROTOTYPE_MODE: z.enum(['true', 'false']).default('false'),

    // MCP Feature Flags (Client JSON Configuration)
    NEXT_PUBLIC_MCP_CONFIG: z.string().optional(),

    // Feature Flags SDK (Client)
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  },
  runtimeEnv: {
    // Server
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    XAI_API_KEY: process.env.XAI_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
    UPSTASH_VECTOR_NAMESPACE: process.env.UPSTASH_VECTOR_NAMESPACE,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_TOKEN: process.env.REDIS_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,

    // MCP Feature Flags (JSON Configuration)
    MCP_CONFIG: process.env.MCP_CONFIG,

    // Feature Flags SDK Configuration (Server)
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    EDGE_CONFIG: process.env.EDGE_CONFIG,

    // Client
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_PROTOTYPE_MODE: process.env.NEXT_PUBLIC_PROTOTYPE_MODE,

    // MCP Feature Flags (Client JSON Configuration)
    NEXT_PUBLIC_MCP_CONFIG: process.env.NEXT_PUBLIC_MCP_CONFIG,

    // Feature Flags SDK (Client)
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  },
  onValidationError: (error: any) => {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  },
});
