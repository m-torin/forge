import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasArcjetVars = Boolean(process.env.ARCJET_KEY);
const hasUpstashVars = Boolean(
  process.env.UPSTASH_REDIS_REST_TOKEN && process.env.UPSTASH_REDIS_REST_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireArcjetInProduction = isProduction && hasArcjetVars;
const requireUpstashInProduction = isProduction && hasUpstashVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      ARCJET_KEY: process.env.ARCJET_KEY ?? undefined,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? undefined,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? undefined,
    },
    server: {
      ARCJET_KEY: requireArcjetInProduction
        ? z.string().min(1).startsWith('ajkey_')
        : z.string().startsWith('ajkey_').optional().or(z.literal('')),
      UPSTASH_REDIS_REST_TOKEN: requireUpstashInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
      UPSTASH_REDIS_REST_URL: requireUpstashInProduction
        ? z.string().min(1).url()
        : z.string().url().optional().or(z.literal('')),
    },
  });
