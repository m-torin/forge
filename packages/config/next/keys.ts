import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_WEB_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_API_URL: z.string().min(1).url().optional(),
      NEXT_PUBLIC_APP_URL: requireInProduction
        ? z.string().min(1).url()
        : z.string().min(1).url().optional(),
      NEXT_PUBLIC_DOCS_URL: z.string().min(1).url().optional(),
      NEXT_PUBLIC_WEB_URL: requireInProduction
        ? z.string().min(1).url()
        : z.string().min(1).url().optional(),
    },
    extends: [vercel()],
    runtimeEnv: {
      ANALYZE: process.env.ANALYZE,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
      NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
      NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    },
    server: {
      ANALYZE: z.string().optional(),

      // Added by Vercel
      NEXT_RUNTIME: z.enum(['nodejs', 'edge']).optional(),
    },
  });
