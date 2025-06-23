import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Only include client-side environment variables
export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.DEMO_MODE === 'true',
  client: {
    // Algolia search configuration
    NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().default('latency'),
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().default('6be0576ff61c053d5f9a3225e2a90f76'),
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string().default('autocomplete_demo_products'),

    // Analytics
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),

    // Auth
    NEXT_PUBLIC_APP_URL: z.string().min(1).url().optional(),

    // Feature flags
    NEXT_PUBLIC_LOCAL_FLAGS: z.string().optional(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    // Algolia search configuration
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,

    // Analytics
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,

    // Auth
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    // Feature flags
    NEXT_PUBLIC_LOCAL_FLAGS: process.env.NEXT_PUBLIC_LOCAL_FLAGS,
  },
});
