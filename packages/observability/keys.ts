import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () => {
  // For tests, return mock values if we're in a test environment
  if (process.env.NODE_ENV === "test") {
    return {
      BETTERSTACK_API_KEY: "test-api-key",
      BETTERSTACK_URL: "https://test.betterstack.com",
      NEXT_PUBLIC_SENTRY_DSN: "https://test@dsn.ingest.sentry.io/test",
      SENTRY_ORG: "test-org",
      SENTRY_PROJECT: "test-project",
    };
  }

  // For production/development, use actual env vars
  return createEnv({
    client: {
      // Added by Sentry Integration, Vercel Marketplace
      NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).url().optional(),
    },
    runtimeEnv: {
      BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY,
      BETTERSTACK_URL: process.env.BETTERSTACK_URL,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    },
    server: {
      BETTERSTACK_API_KEY: z.string().min(1).optional(),
      BETTERSTACK_URL: z.string().min(1).url().optional(),

      // Added by Sentry Integration, Vercel Marketplace
      SENTRY_ORG: z.string().min(1).optional(),
      SENTRY_PROJECT: z.string().min(1).optional(),
    },
  });
};
