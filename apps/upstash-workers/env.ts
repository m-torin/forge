import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // QStash configuration - production
    QSTASH_TOKEN: z.string().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(), 
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
    
    // QStash local development server
    QSTASH_URL: z.string().url().optional(),
    
    // Analytics/Feature flags
    POSTHOG_API_KEY: z.string().optional(),
    
    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  },
  
  client: {
    // Public analytics keys
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    
    // Feature flags for client-side
    NEXT_PUBLIC_USE_LOCAL_QSTASH: z.string().optional(),
  },
  
  runtimeEnv: {
    // Server
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    QSTASH_URL: process.env.QSTASH_URL,
    POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    
    // Client
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_USE_LOCAL_QSTASH: process.env.NEXT_PUBLIC_USE_LOCAL_QSTASH,
  },
});