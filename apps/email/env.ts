import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for webpack inline replacement
export const env = createEnv({
  server: {
    // Environment Detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // React Email Configuration
    REACT_EMAIL_PORT: z
      .string()
      .transform(val => parseInt(val, 10))
      .default(3500),

    // Email Service Configuration (Resend integration)
    RESEND_API_KEY: z.string().optional(),
  },
  client: {
    // Public environment variables
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_APP_NAME: z.string().default('email'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    REACT_EMAIL_PORT: process.env.REACT_EMAIL_PORT,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  onValidationError: (error: any) => {
    console.error('❌ Invalid environment variables:', error);
    // Prevent white screens in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Using fallback values');
      process.exit(1);
    } else {
      throw new Error('Invalid environment variables');
    }
  },
});

// Type export for better DX
export type Env = typeof env;
