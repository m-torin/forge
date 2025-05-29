import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || undefined,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || undefined,
    },
    server: {
      STRIPE_SECRET_KEY: isProduction
        ? z.string().startsWith('sk_')
        : z.string().startsWith('sk_').optional(),
      STRIPE_WEBHOOK_SECRET: isProduction
        ? z.string().startsWith('whsec_')
        : z.string().startsWith('whsec_').optional(),
    },
  });
