import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(process.env.SVIX_TOKEN);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      SVIX_TOKEN: process.env.SVIX_TOKEN || undefined,
    },
    server: {
      SVIX_TOKEN: requireInProduction
        ? z.union([z.string().min(1).startsWith('sk_'), z.string().min(1).startsWith('testsk_')])
        : z
            .union([z.string().min(1).startsWith('sk_'), z.string().min(1).startsWith('testsk_')])
            .optional(),
    },
  });
