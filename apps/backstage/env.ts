import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Analytics keys to be implemented in new package
// import { keys as analytics } from '@repo/analytics/keys';
import { keys as core } from '@repo/config/next/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WORKERS_URL: z.string().url().optional(),
    // PostHog client configuration
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
  },
  extends: [core(), database(), email(), observability(), payments(), security()],
  runtimeEnv: {
    NEXT_PUBLIC_WORKERS_URL: process.env.NEXT_PUBLIC_WORKERS_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    SERVICE_API_KEY: process.env.SERVICE_API_KEY,
    // PostHog server configuration
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
  },
  server: {
    // Service API Key - can be rotated via Doppler
    SERVICE_API_KEY: z.string().min(32).optional(),
    // PostHog server configuration for feature flags
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_HOST: z.string().url().default('https://app.posthog.com'),
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
  },
});
