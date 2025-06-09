import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION || process.env.DEMO_MODE === "true",
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3900"),
    NEXT_PUBLIC_ENV: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
    // PostHog client configuration
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DEMO_MODE: process.env.DEMO_MODE,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    LOCAL_FLAGS: process.env.LOCAL_FLAGS,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NODE_ENV: process.env.NODE_ENV,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    // PostHog server configuration
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_PERSONAL_API_KEY: process.env.POSTHOG_PERSONAL_API_KEY,
    POSTHOG_PROJECT_ID: process.env.POSTHOG_PROJECT_ID,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  },
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_TRUSTED_ORIGINS: z.string().optional(),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3900"),
    DATABASE_URL:
      process.env.DEMO_MODE === "true"
        ? z.string().optional()
        : z.string().url(),
    DEMO_MODE: z
      .string()
      .transform((val) => val === "true")
      .default("false")
      .optional(),
    DIRECT_DATABASE_URL: z.string().url().optional(),
    LOCAL_FLAGS: z.string().optional(),
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
    // PostHog server configuration for feature flags
    POSTHOG_KEY: z.string().optional(),
    POSTHOG_PERSONAL_API_KEY: z.string().optional(),
    POSTHOG_PROJECT_ID: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
  },
});
