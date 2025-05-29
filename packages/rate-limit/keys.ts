import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || undefined,
    },
    server: {
      UPSTASH_REDIS_REST_TOKEN: isProduction ? z.string().min(1) : z.string().min(1).optional(),
      UPSTASH_REDIS_REST_URL: isProduction
        ? z.string().min(1).url()
        : z.string().min(1).url().optional(),
    },
  });
