import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Safe environment variable validation that prevents white screens
let env: any = null;
let envError: string | null = null;

try {
  env = createEnv({
    server: {
      HOTELBEDS_API_KEY: z.string().min(1),
      HOTELBEDS_SECRET: z.string().min(1),
      HOTELBEDS_API_BASE: z.string().url().default('https://api.test.hotelbeds.com'),
    },
    runtimeEnv: {
      HOTELBEDS_API_KEY: process.env.HOTELBEDS_API_KEY,
      HOTELBEDS_SECRET: process.env.HOTELBEDS_SECRET,
      HOTELBEDS_API_BASE: process.env.HOTELBEDS_API_BASE,
    },
  });
} catch (error) {
  envError = error instanceof Error ? error.message : 'Unknown environment error';
}

export { env, envError };

// Helper function to safely get environment values
export function safeEnv() {
  if (env) return env;
  // Return safe fallback values
  return {
    HOTELBEDS_API_KEY: 'test-key',
    HOTELBEDS_SECRET: 'test-secret',
    HOTELBEDS_API_BASE: 'https://api.test.hotelbeds.com',
  };
}
