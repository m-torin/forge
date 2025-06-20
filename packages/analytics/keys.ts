import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const _isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const _hasRequiredEnvVars = Boolean(process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY);

export const keys = () =>
  createEnv({
    client: {
      // PostHog client configuration
      NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
      NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),

      // Segment client configuration
      NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().optional(),

      // Vercel Analytics
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID: z.string().optional(),
    },
    runtimeEnv: {
      // Client-side variables (NEXT_PUBLIC_*)
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
      NEXT_PUBLIC_VERCEL_ANALYTICS_ID: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,

      // Server-side variables
      POSTHOG_HOST: process.env.POSTHOG_HOST,
      POSTHOG_KEY: process.env.POSTHOG_KEY,
      POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
      POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
      SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY,
      ANALYTICS_LOG_PROVIDER: process.env.ANALYTICS_LOG_PROVIDER,
    },
    server: {
      // PostHog server configuration for feature flags and analytics
      POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
      POSTHOG_KEY: z.string().optional(),
      POSTHOG_PERSONAL_API_KEY: z.string().optional(),
      POSTHOG_PROJECT_ID: z.string().optional(),

      // Segment server configuration
      SEGMENT_WRITE_KEY: z.string().optional(),

      // Analytics logging configuration
      ANALYTICS_LOG_PROVIDER: z.enum(['console', 'sentry']).default('console'),
    },
  });
