import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET || undefined,
    },
    server: {
      FLAGS_SECRET: isProduction ? z.string().min(1) : z.string().min(1).optional(),
    },
  });
