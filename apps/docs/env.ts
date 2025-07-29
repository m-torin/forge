import { logError } from '@repo/observability';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for webpack inline replacement
export const env = createEnv({
  server: {
    // Environment Detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // Mintlify Configuration (if needed)
    MINTLIFY_TOKEN: z.string().optional(),
  },
  client: {
    // Public environment variables
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_APP_NAME: z.string().default('docs'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    MINTLIFY_TOKEN: process.env.MINTLIFY_TOKEN,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
  onValidationError: (error: any) => {
    logError('❌ Invalid environment variables:', error);
    // Prevent white screens in production
    if (process.env.NODE_ENV === 'production') {
      logError('Using fallback values');
      process.exit(1);
    } else {
      throw new Error('Invalid environment variables');
    }
  },
});

// Type export for better DX
export type Env = typeof env;
