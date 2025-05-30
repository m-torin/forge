import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(process.env.OPENAI_API_KEY);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    },
    server: {
      OPENAI_API_KEY: requireInProduction
        ? z.string().min(1).startsWith('sk-')
        : z.string().min(1).startsWith('sk-').optional(),
    },
  });
