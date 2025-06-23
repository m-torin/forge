import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Package keys to compose environment validation
import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as security } from '@repo/security/keys';
import { keys as storage } from '@repo/storage/keys';

// Server-side only env configuration
export const serverEnv = createEnv({
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.DEMO_MODE === 'true',
  server: {
    // Application configuration
    DEMO_MODE: z
      .string()
      .transform((val: any) => val === 'true')
      .default('false')
      .optional(),

    // Internationalization
    DEEPSEEK_API_KEY: z.string().optional(),

    // Feature flags
    LOCAL_FLAGS: z.string().optional(),
  },
  emptyStringAsUndefined: true,
  extends: [analytics(), auth(), database(), security(), storage()],
  runtimeEnv: {
    // Application configuration
    DEMO_MODE: process.env.DEMO_MODE,

    // Internationalization
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

    // Feature flags
    LOCAL_FLAGS: process.env.LOCAL_FLAGS,
  },
});