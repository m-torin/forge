import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { keys as analytics } from '@repo/analytics-legacy/keys';
import { keys as auth } from '@repo/auth-new/keys';
import { keys as core } from '@repo/config/next/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_WORKERS_URL: z.string().url().optional(),
  },
  extends: [
    auth(),
    analytics(),
    core(),
    database(),
    email(),
    observability(),
    payments(),
    security(),
  ],
  runtimeEnv: {
    NEXT_PUBLIC_WORKERS_URL: process.env.NEXT_PUBLIC_WORKERS_URL,
    SERVICE_API_KEY: process.env.SERVICE_API_KEY,
  },
  server: {
    // Service API Key - can be rotated via Doppler
    SERVICE_API_KEY: z.string().min(32).optional(),
  },
});
