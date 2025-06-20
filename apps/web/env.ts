import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Package keys to compose environment validation
import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as security } from '@repo/security/keys';
import { keys as storage } from '@repo/storage/keys';

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.DEMO_MODE === 'true',
  client: {
    // Algolia search configuration (uses e-commerce federated demo dataset by default)
    NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().default('latency'),
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().default('6be0576ff61c053d5f9a3225e2a90f76'),
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string().default('autocomplete_demo_products'),
  },
  emptyStringAsUndefined: true,
  extends: [analytics(), auth(), database(), observability(), security(), storage()],
  runtimeEnv: {
    // Algolia search configuration
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,

    // Application configuration (not covered by packages)
    DEMO_MODE: process.env.DEMO_MODE,

    // Internationalization (temporary until package is updated)
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

    // Feature flags
    LOCAL_FLAGS: process.env.LOCAL_FLAGS,

    // Missing from observability package
    SENTRY_DSN: process.env.SENTRY_DSN,
  },
  server: {
    // Application configuration
    DEMO_MODE: z
      .string()
      .transform((val: any) => val === 'true')
      .default('false')
      .optional(),

    // Internationalization (temporary until package is updated)
    DEEPSEEK_API_KEY: z.string().optional(),

    // Feature flags
    LOCAL_FLAGS: z.string().optional(),

    // Missing from observability package
    SENTRY_DSN: z.string().url().optional(),
  },
});
