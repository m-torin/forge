import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_HOST && process.env.NEXT_PUBLIC_POSTHOG_KEY,
);
const hasToolbarEnvVars = Boolean(process.env.FLAGS_SECRET);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;
const requireToolbarInProduction = isProduction && hasToolbarEnvVars;

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR: z.enum(['true', 'false']).optional(),
      // Toolbar control environment variables
      NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR: z.enum(['true', 'false']).optional(),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().startsWith('G-').optional().or(z.literal('')),
      NEXT_PUBLIC_LOCAL_FLAGS: z.string().optional(),
      NEXT_PUBLIC_POSTHOG_HOST: requireInProduction
        ? z.string().url()
        : z.string().url().optional().or(z.literal('')),
      NEXT_PUBLIC_POSTHOG_KEY: requireInProduction
        ? z.string().startsWith('phc_')
        : z.string().startsWith('phc_').optional().or(z.literal('')),
      NEXT_PUBLIC_SEGMENT_WRITE_KEY: z.string().min(1).optional().or(z.literal('')),
    },
    runtimeEnv: {
      FLAGS_SECRET: process.env.FLAGS_SECRET || undefined,
      NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR: process.env.NEXT_PUBLIC_ENABLE_POSTHOG_TOOLBAR || undefined,
      NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR: process.env.NEXT_PUBLIC_ENABLE_VERCEL_TOOLBAR || undefined,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || undefined,
      NEXT_PUBLIC_LOCAL_FLAGS: process.env.NEXT_PUBLIC_LOCAL_FLAGS || undefined,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST || undefined,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
      NEXT_PUBLIC_SEGMENT_WRITE_KEY: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY || undefined,
      SEGMENT_WRITE_KEY: process.env.SEGMENT_WRITE_KEY || undefined,
    },
    server: {
      FLAGS_SECRET: requireToolbarInProduction ? z.string().min(1) : z.string().min(1).optional(),
      SEGMENT_WRITE_KEY: z.string().min(1).optional().or(z.literal('')),
    },
  });
