import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // AI service providers
    ANTHROPIC_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),

    // Browserless configuration (for web scraping)
    BROWSERLESS_API_KEY: z.string().optional(),
    BROWSERLESS_URL: z.string().url().optional(),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Puppeteer configuration
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: z
      .string()
      .transform(val => val === 'true')
      .optional(),
  },
  runtimeEnv: {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BROWSERLESS_API_KEY: process.env.BROWSERLESS_API_KEY,
    BROWSERLESS_URL: process.env.BROWSERLESS_URL,
    NODE_ENV: process.env.NODE_ENV,
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD,
  },
  onValidationError: issues => {
    console.error(
      'Scraping environment validation failed:',
      issues.map(issue => issue.message).join(', '),
    );
    // Always throw to satisfy TypeScript's never return type
    throw new Error(
      `Invalid scraping environment configuration: ${issues.map(issue => issue.message).join(', ')}`,
    );
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    BROWSERLESS_API_KEY: process.env.BROWSERLESS_API_KEY || '',
    BROWSERLESS_URL: process.env.BROWSERLESS_URL || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true',
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'test';
}

export function isDevelopment(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'development';
}

export function hasAnthropicKey(): boolean {
  const env = safeEnv();
  return Boolean(env.ANTHROPIC_API_KEY);
}

export function hasOpenAIKey(): boolean {
  const env = safeEnv();
  return Boolean(env.OPENAI_API_KEY);
}

// Export type for better DX
export type Env = typeof env;
