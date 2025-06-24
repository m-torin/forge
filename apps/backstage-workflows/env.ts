import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Detect if we're in a build environment
const isBuildTime =
  process.env.NODE_ENV === 'test' ||
  process.env.CI === 'true' ||
  process.env.VERCEL_ENV === 'preview' ||
  process.env.SKIP_ENV_VALIDATION === 'true';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Database configuration (optional for builds)
    POSTGRES_URL: z.string().url().optional(),
    // QStash configuration for Upstash Workflow (optional for builds)
    QSTASH_TOKEN: isBuildTime
      ? z.string().optional()
      : z.string().min(1, 'QSTASH_TOKEN is required at runtime'),
    QSTASH_URL: z.string().url().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  },
  client: {
    // Public environment variables for client-side access
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL: process.env.POSTGRES_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  // Skip validation during builds or tests
  skipValidation: isBuildTime,
});
