import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { keys as analytics } from "@repo/analytics-legacy/keys";
import { keys as auth } from "@repo/auth-new/keys";
import { keys as core } from "@repo/config/next/keys";
import { keys as database } from "@repo/database/keys";
import { keys as email } from "@repo/email/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as security } from "@repo/security/keys";

// For the template, we'll make auth, database, and email optional for demonstration
export const env = createEnv({
  client: {},
  extends: [
    core(),
    auth(),
    database(),
    email(),
    observability(),
    analytics(),
    security(),
  ] as any[],
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_FROM: process.env.RESEND_FROM,
    RESEND_TOKEN: process.env.RESEND_TOKEN,
    SERVICE_API_KEY: process.env.SERVICE_API_KEY,
  },
  server: {
    // Make these optional for the template
    BETTER_AUTH_SECRET: z.string().optional().default("template-secret"),
    DATABASE_URL: z
      .string()
      .optional()
      .default("postgresql://localhost:5432/template"),
    RESEND_FROM: z.string().email().optional().default("noreply@example.com"),
    RESEND_TOKEN: z.string().optional().default("re_template_token"),
    // Service API Key - can be rotated via Doppler
    SERVICE_API_KEY: z.string().min(32).optional(),
  },
});
