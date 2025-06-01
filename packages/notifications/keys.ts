import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.KNOCK_SECRET_API_KEY ||
    process.env.NEXT_PUBLIC_KNOCK_API_KEY ||
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const _requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    client: {
      // Always optional for notifications
      NEXT_PUBLIC_KNOCK_API_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string().min(1).optional(),
    },
    runtimeEnv: {
      KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY || undefined,
      NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY || undefined,
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID || undefined,
    },
    server: {
      // Always optional for notifications
      KNOCK_SECRET_API_KEY: z.string().min(1).optional(),
    },
  });
