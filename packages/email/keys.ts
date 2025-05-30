import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
// In local dev or build:local, these env vars might not be set if using .env.local
const hasRequiredEnvVars = Boolean(process.env.RESEND_FROM && process.env.RESEND_TOKEN);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

export const keys = () =>
  createEnv({
    runtimeEnv: {
      RESEND_FROM: process.env.RESEND_FROM || undefined,
      RESEND_TOKEN: process.env.RESEND_TOKEN || undefined,
    },
    server: {
      RESEND_FROM: requireInProduction ? z.string().email() : z.string().email().optional(),
      RESEND_TOKEN: requireInProduction
        ? z.string().startsWith('re_')
        : z.string().startsWith('re_').optional(),
    },
  });
