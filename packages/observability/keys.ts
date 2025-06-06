import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const _isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasSentryVars = Boolean(
  process.env.SENTRY_DSN ||
    process.env.SENTRY_AUTH_TOKEN ||
    process.env.SENTRY_ORG ||
    process.env.SENTRY_PROJECT,
);
const hasLogtailVars = Boolean(process.env.LOGTAIL_SOURCE_TOKEN);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireSentryInProduction = isProduction && hasSentryVars;
const requireLogtailInProduction = isProduction && hasLogtailVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      SENTRY_DSN: process.env.SENTRY_DSN || undefined,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || undefined,
      SENTRY_ORG: process.env.SENTRY_ORG || undefined,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT || undefined,
      LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN || undefined,
    },
    server: {
      SENTRY_DSN: requireSentryInProduction
        ? z.string().url()
        : z.string().url().optional().or(z.literal('')),
      SENTRY_AUTH_TOKEN: requireSentryInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
      SENTRY_ORG: requireSentryInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
      SENTRY_PROJECT: requireSentryInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
      LOGTAIL_SOURCE_TOKEN: requireLogtailInProduction
        ? z.string().min(1)
        : z.string().optional().or(z.literal('')),
    },
  });
