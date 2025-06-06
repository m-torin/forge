import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Analytics keys to be implemented in new package
// import { keys as analytics } from '@repo/analytics/keys';
import { keys as core } from '@repo/config/next/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
// Observability-new package doesn't have keys export
// import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WORKERS_URL: z.string().url().optional(),
  },
  extends: [core(), database(), email(), payments(), security()],
  runtimeEnv: {
    NEXT_PUBLIC_WORKERS_URL: process.env.NEXT_PUBLIC_WORKERS_URL,
    SERVICE_API_KEY: process.env.SERVICE_API_KEY,
  },
  server: {
    // Service API Key - can be rotated via Doppler
    SERVICE_API_KEY: z.string().min(32).optional(),
  },
});
