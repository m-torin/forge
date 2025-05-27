import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
    },
    server: {
      DATABASE_URL: z.string().min(1).url(),
    },
  });
