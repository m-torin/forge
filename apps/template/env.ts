import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

import { keys as auth } from "@repo/auth/keys";
import { keys as database } from "@repo/database/keys";
import { keys as flags } from "@repo/feature-flags/keys";
import { keys as internationalization } from "@repo/internationalization/keys";
import { keys as core } from "@repo/next-config/keys";
import { keys as observability } from "@repo/observability/keys";
import { keys as rateLimit } from "@repo/rate-limit/keys";
import { keys as security } from "@repo/security/keys";

// For the template, we'll make auth, database, and email optional for demonstration
export const env = createEnv({
  client: {},
  extends: [
    core(),
    auth(),
    database(),
    observability(),
    flags(),
    security(),
    rateLimit(),
    internationalization(),
  ],
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_FROM: process.env.RESEND_FROM,
    RESEND_TOKEN: process.env.RESEND_TOKEN,
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
  },
});
