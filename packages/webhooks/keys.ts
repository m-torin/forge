import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      SVIX_TOKEN: process.env.SVIX_TOKEN || undefined,
    },
    server: {
      SVIX_TOKEN: isProduction
        ? z.union([z.string().min(1).startsWith('sk_'), z.string().min(1).startsWith('testsk_')])
        : z
            .union([z.string().min(1).startsWith('sk_'), z.string().min(1).startsWith('testsk_')])
            .optional(),
    },
  });
