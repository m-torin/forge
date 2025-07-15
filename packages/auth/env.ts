import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = Boolean(
  process.env.BETTER_AUTH_SECRET && process.env.DATABASE_URL && process.env.NEXT_PUBLIC_APP_URL,
);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Core auth configuration
    BETTER_AUTH_SECRET: requireInProduction ? z.string().min(1) : z.string().min(1).optional(),
    AUTH_SECRET: z.string().optional(), // Fallback for BETTER_AUTH_SECRET
    DATABASE_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),

    // App configuration
    BETTER_AUTH_URL: z.string().url().optional(),
    TRUSTED_ORIGINS: z.string().optional(), // Comma-separated string

    // OAuth providers
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),

    // Feature flags for auth
    AUTH_FEATURES_ADMIN: z.string().optional(),
    AUTH_FEATURES_API_KEYS: z.string().optional(),
    AUTH_FEATURES_ORGANIZATIONS: z.string().optional(),
    AUTH_FEATURES_MAGIC_LINKS: z.string().optional(),
    AUTH_FEATURES_TWO_FACTOR: z.string().optional(),
  },
  client: {
    // Public app configuration
    NEXT_PUBLIC_APP_URL: requireInProduction
      ? z.string().min(1).url()
      : z.string().min(1).url().optional(),
    NEXT_PUBLIC_APP_NAME: z.string().optional(),
    // Feature flags for client-side access
    NEXT_PUBLIC_AUTH_FEATURES_ADMIN: z.string().optional(),
    NEXT_PUBLIC_AUTH_FEATURES_API_KEYS: z.string().optional(),
    NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS: z.string().optional(),
    NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS: z.string().optional(),
    NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR: z.string().optional(),
    NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS: z.string().optional(),
  },
  runtimeEnv: {
    // Server-side environment variables
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN,
    AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS,
    AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS,
    AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS,
    AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR,

    // Client-side environment variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_AUTH_FEATURES_ADMIN: process.env.NEXT_PUBLIC_AUTH_FEATURES_ADMIN,
    NEXT_PUBLIC_AUTH_FEATURES_API_KEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_API_KEYS,
    NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS: process.env.NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS,
    NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS: process.env.NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS,
    NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR: process.env.NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR,
    NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS,
  },
  onValidationError: (error) => {
    console.warn('Auth environment validation failed:', error);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    // Server variables
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    AUTH_SECRET: process.env.AUTH_SECRET || '',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dev',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS || 'http://localhost:3000',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || '',
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || '',
    AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN || 'true',
    AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS || 'true',
    AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS || 'true',
    AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS || 'true',
    AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR || 'true',

    // Client variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Forge',
    NEXT_PUBLIC_AUTH_FEATURES_ADMIN: process.env.NEXT_PUBLIC_AUTH_FEATURES_ADMIN || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_API_KEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_API_KEYS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS || 'true',
  };
}

// Separate server and client env helpers for better separation
export function safeServerEnv() {
  if (env) {
    // Return only server variables
    return {
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET || '',
      AUTH_SECRET: env.AUTH_SECRET || '',
      DATABASE_URL: env.DATABASE_URL || 'postgresql://localhost:5432/dev',
      BETTER_AUTH_URL: env.BETTER_AUTH_URL || '',
      TRUSTED_ORIGINS: env.TRUSTED_ORIGINS || 'http://localhost:3000',
      GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID || '',
      GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET || '',
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET || '',
      FACEBOOK_CLIENT_ID: env.FACEBOOK_CLIENT_ID || '',
      FACEBOOK_CLIENT_SECRET: env.FACEBOOK_CLIENT_SECRET || '',
      DISCORD_CLIENT_ID: env.DISCORD_CLIENT_ID || '',
      DISCORD_CLIENT_SECRET: env.DISCORD_CLIENT_SECRET || '',
      MICROSOFT_CLIENT_ID: env.MICROSOFT_CLIENT_ID || '',
      MICROSOFT_CLIENT_SECRET: env.MICROSOFT_CLIENT_SECRET || '',
      AUTH_FEATURES_ADMIN: env.AUTH_FEATURES_ADMIN || 'true',
      AUTH_FEATURES_API_KEYS: env.AUTH_FEATURES_API_KEYS || 'true',
      AUTH_FEATURES_ORGANIZATIONS: env.AUTH_FEATURES_ORGANIZATIONS || 'true',
      AUTH_FEATURES_MAGIC_LINKS: env.AUTH_FEATURES_MAGIC_LINKS || 'true',
      AUTH_FEATURES_TWO_FACTOR: env.AUTH_FEATURES_TWO_FACTOR || 'true',
    };
  }

  // Fallback values
  return {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    AUTH_SECRET: process.env.AUTH_SECRET || '',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/dev',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS || 'http://localhost:3000',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID || '',
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET || '',
    AUTH_FEATURES_ADMIN: process.env.AUTH_FEATURES_ADMIN || 'true',
    AUTH_FEATURES_API_KEYS: process.env.AUTH_FEATURES_API_KEYS || 'true',
    AUTH_FEATURES_ORGANIZATIONS: process.env.AUTH_FEATURES_ORGANIZATIONS || 'true',
    AUTH_FEATURES_MAGIC_LINKS: process.env.AUTH_FEATURES_MAGIC_LINKS || 'true',
    AUTH_FEATURES_TWO_FACTOR: process.env.AUTH_FEATURES_TWO_FACTOR || 'true',
  };
}

export function safeClientEnv() {
  if (env) {
    // Return only client variables
    return {
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME || 'Forge',
      NEXT_PUBLIC_AUTH_FEATURES_ADMIN: env.NEXT_PUBLIC_AUTH_FEATURES_ADMIN || 'true',
      NEXT_PUBLIC_AUTH_FEATURES_API_KEYS: env.NEXT_PUBLIC_AUTH_FEATURES_API_KEYS || 'true',
      NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS:
        env.NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS || 'true',
      NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS: env.NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS || 'true',
      NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR: env.NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR || 'true',
      NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS: env.NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS || 'true',
    };
  }

  // Fallback values
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Forge',
    NEXT_PUBLIC_AUTH_FEATURES_ADMIN: process.env.NEXT_PUBLIC_AUTH_FEATURES_ADMIN || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_API_KEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_API_KEYS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_ORGANIZATIONS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_MAGIC_LINKS || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR:
      process.env.NEXT_PUBLIC_AUTH_FEATURES_TWO_FACTOR || 'true',
    NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS: process.env.NEXT_PUBLIC_AUTH_FEATURES_PASSKEYS || 'true',
  };
}

// Export type for better DX
export type Env = typeof env;
