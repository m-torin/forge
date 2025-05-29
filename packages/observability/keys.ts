import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    client: {
      // Added by Sentry Integration, Vercel Marketplace
      NEXT_PUBLIC_SENTRY_DSN: isProduction
        ? z.string().url()
        : z.string().url().optional().or(z.literal('')),
    },
    runtimeEnv: {
      BETTERSTACK_API_KEY: process.env.BETTERSTACK_API_KEY || undefined,
      BETTERSTACK_URL: process.env.BETTERSTACK_URL || undefined,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
      SENTRY_ORG: process.env.SENTRY_ORG || undefined,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT || undefined,
    },
    server: {
      BETTERSTACK_API_KEY: isProduction ? z.string().min(1) : z.string().min(1).optional(),
      BETTERSTACK_URL: isProduction ? z.string().url() : z.string().url().optional(),

      // Added by Sentry Integration, Vercel Marketplace
      SENTRY_ORG: isProduction ? z.string().min(1) : z.string().min(1).optional(),
      SENTRY_PROJECT: isProduction ? z.string().min(1) : z.string().min(1).optional(),
    },
  });
