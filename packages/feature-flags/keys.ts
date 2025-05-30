import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(process.env.FLAGS_SECRET);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET || undefined,
    },
    server: {
      FLAGS_SECRET: requireInProduction
        ? z.string().min(1)
        : z.string().min(1).optional(),
    },
  });
