import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for webpack inline replacement
export const env = createEnv({
  server: {
    // Environment Detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

    // Storybook Configuration
    STORYBOOK_PORT: z
      .string()
      .transform(val => parseInt(val, 10))
      .default(3700),

    // Chromatic Configuration (for visual testing)
    CHROMATIC_PROJECT_TOKEN: z.string().optional(),
    CHROMATIC_APP_CODE: z.string().optional(),
  },
  client: {
    // Public environment variables
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXT_PUBLIC_APP_NAME: z.string().default('storybook'),

    // Public Chromatic configuration
    NEXT_PUBLIC_CHROMATIC_PROJECT_TOKEN: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    STORYBOOK_PORT: process.env.STORYBOOK_PORT,
    CHROMATIC_PROJECT_TOKEN: process.env.CHROMATIC_PROJECT_TOKEN,
    CHROMATIC_APP_CODE: process.env.CHROMATIC_APP_CODE,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_CHROMATIC_PROJECT_TOKEN: process.env.NEXT_PUBLIC_CHROMATIC_PROJECT_TOKEN,
  },
  onValidationError: (_error: any) => {
    // Prevent white screens in production
    if (process.env.NODE_ENV === 'production') {
      // Silently handle validation errors to prevent crashes
      process.exit(1);
    } else {
      throw new Error('Invalid environment variables');
    }
  },
});

// Type export for better DX
export type Env = typeof env;
