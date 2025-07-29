import { env as emailEnv } from '@repo/email/env';
import { logError } from '@repo/observability';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

/**
 * Environment configuration for the email preview app.
 * Extends the email package configuration since this app uses email functionality.
 */
export const env = createEnv({
  extends: [emailEnv],
  server: {
    // Vercel environment detection
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // React Email Configuration
    REACT_EMAIL_PORT: z.coerce.number().default(3500),

    // Note: RESEND_API_KEY is provided by emailEnv
    // We're just adding app-specific variables here
  },
  client: {
    // Public environment variables
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_APP_NAME: z.string().default('email'),
  },
  runtimeEnv: {
    VERCEL_ENV: process.env.VERCEL_ENV,
    REACT_EMAIL_PORT: process.env.REACT_EMAIL_PORT,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV || process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  onValidationError: error => {
    logError('❌ Invalid environment variables:', error);
    if (process.env.NODE_ENV === 'production') {
      logError('Using fallback values to prevent crashes');
    }
    throw new Error('Invalid environment variables');
  },
  emptyStringAsUndefined: true,
});

// Type export for better DX
export type Env = typeof env;
