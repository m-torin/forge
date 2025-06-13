import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.DEMO_MODE === 'true',
  client: {
    // Application URLs (@repo/config)
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_WEB_URL: z.string().url().optional(),
    NEXT_PUBLIC_API_URL: z.string().url().optional(),
    NEXT_PUBLIC_DOCS_URL: z.string().url().optional(),
    NEXT_PUBLIC_ENV: z.string().optional(),

    // Analytics (@repo/analytics)
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().optional(),
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),

    // Error tracking
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

    // Algolia search configuration (uses e-commerce federated demo dataset by default)
    NEXT_PUBLIC_ALGOLIA_APP_ID: z.string().default('latency'),
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: z.string().default('6be0576ff61c053d5f9a3225e2a90f76'),
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: z.string().default('autocomplete_demo_products'),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    // Authentication
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,

    // Application configuration
    DEMO_MODE: process.env.DEMO_MODE,
    NODE_ENV: process.env.NODE_ENV,
    ANALYZE: process.env.ANALYZE,

    // Client-side variables (NEXT_PUBLIC_*)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
    NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
    NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    NEXT_PUBLIC_ALGOLIA_INDEX_NAME: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,

    // Analytics (server-side)
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,

    // Security
    ARCJET_KEY: process.env.ARCJET_KEY,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,

    // Error tracking and observability
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,

    // Internationalization
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

    // Feature flags
    LOCAL_FLAGS: process.env.LOCAL_FLAGS,

    // Production deployment
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  server: {
    // Authentication (Better Auth)
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),

    // Database
    DATABASE_URL: process.env.DEMO_MODE === 'true' ? z.string().optional() : z.string().url(),
    DIRECT_DATABASE_URL: z.string().url().optional(),

    // Application configuration
    DEMO_MODE: z
      .string()
      .transform((val: any) => val === 'true')
      .default('false')
      .optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    ANALYZE: z
      .string()
      .transform((val: any) => val === 'true')
      .default('false')
      .optional(),

    // Analytics (@repo/analytics)
    POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
    SEGMENT_WRITE_KEY: z.string().optional(),

    // Security (@repo/security)
    ARCJET_KEY: z.string().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),

    // Error tracking and observability
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),

    // Internationalization (@repo/internationalization)
    DEEPSEEK_API_KEY: z.string().optional(),

    // Feature flags
    LOCAL_FLAGS: z.string().optional(),

    // Production deployment
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_URL: z.string().optional(),
  },
});
