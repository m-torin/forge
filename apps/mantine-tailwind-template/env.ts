import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const env = createEnv({
  server: {
    // Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Feature Flags
    FLAGS_SECRET: z.string().optional(),
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
    EDGE_CONFIG: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: z.string().url().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  },
  runtimeEnv: {
    // Server
    NODE_ENV: process.env.NODE_ENV,
    FLAGS_SECRET: process.env.FLAGS_SECRET,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    EDGE_CONFIG: process.env.EDGE_CONFIG,

    // Client
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  onValidationError: (error: any) => {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  },
});
