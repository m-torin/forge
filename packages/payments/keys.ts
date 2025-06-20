import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
const isBuild = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET,
);

// Make env vars optional in development, local builds, or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && !isBuild && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? undefined,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? undefined,
      PAYMENTS_LOG_PROVIDER: process.env.PAYMENTS_LOG_PROVIDER ?? undefined,
    },
    server: {
      STRIPE_SECRET_KEY: requireInProduction
        ? z.string().startsWith('sk_')
        : z.string().startsWith('sk_').optional().or(z.literal('')),
      STRIPE_WEBHOOK_SECRET: requireInProduction
        ? z.string().startsWith('whsec_')
        : z.string().startsWith('whsec_').optional().or(z.literal('')),
      PAYMENTS_LOG_PROVIDER: z.string().optional(),
    },
  });
