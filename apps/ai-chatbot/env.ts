import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v3';

/**
 * Environment configuration for the AI Chatbot.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Auth configuration
    AUTH_SECRET: z.string().min(32).optional(),
    // AI Gateway configuration
    AI_GATEWAY_API_KEY: z.string().optional(),
    // Storage configuration
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    // Database configuration
    DATABASE_URL: z.string().url().optional(),
    // Redis configuration
    REDIS_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().default('AI Chatbot'),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
  },
  onValidationError: error => {
    console.error('❌ Invalid environment variables:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('Environment validation failed in production');
    }
    throw new Error('Invalid environment variables');
  },
  emptyStringAsUndefined: true,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});

// Type export for better DX
export type Env = typeof env;
