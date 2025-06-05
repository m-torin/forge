import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL && process.env.NEXT_PUBLIC_APP_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_APP_URL: requireInProduction
        ? z.string().min(1).url()
        : z.string().min(1).url().optional(),
    },
    runtimeEnv: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    server: {
      BETTER_AUTH_SECRET: requireInProduction ? z.string().min(1) : z.string().min(1).optional(),
      DATABASE_URL: requireInProduction
        ? z.string().min(1).url()
        : z.string().min(1).url().optional(),
      GITHUB_CLIENT_ID: z.string().optional(),
      GITHUB_CLIENT_SECRET: z.string().optional(),
      GOOGLE_CLIENT_ID: z.string().optional(),
      GOOGLE_CLIENT_SECRET: z.string().optional(),
    },
  });
