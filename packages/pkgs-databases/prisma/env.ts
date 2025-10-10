import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProductionEnv = process.env.NODE_ENV === 'production';
const isBuildEnv = process.env.NODE_ENV === 'production' && !process.env.VERCEL;

// In local dev or build:local, DATABASE_URL might not be set if using .env.local
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

// Make DATABASE_URL optional in development, local builds, or when it's missing (indicating .env.local usage)
const requireInProduction = isProductionEnv && !isBuildEnv && hasDatabaseUrl;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    DATABASE_URL: requireInProduction
      ? z.string().url()
      : z.string().url().optional().or(z.literal('')),

    // Optional database configurations
    POSTGRES_URL: z.string().url().optional(),
    POSTGRES_PRISMA_URL: z.string().url().optional(),
    POSTGRES_URL_NON_POOLING: z.string().url().optional(),

    // SQLite configuration (for local development or testing)
    SQLITE_DATABASE_URL: z.string().optional(),

    // D1 configuration (for Cloudflare Workers)
    CLOUDFLARE_D1_TOKEN: z.string().optional(),
    CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
    CLOUDFLARE_DATABASE_ID: z.string().optional(),

    // Neon configuration
    NEON_DATABASE_URL: z.string().url().optional(),

    // PlanetScale configuration
    PLANETSCALE_DATABASE_URL: z.string().url().optional(),

    // Turso configuration
    TURSO_DATABASE_URL: z.string().url().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),

    // Connection pooling settings
    DATABASE_POOL_SIZE: z.string().optional(),
    DATABASE_CONNECTION_LIMIT: z.string().optional(),

    // Environment detection
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    VERCEL: z.string().optional(),

    // Build-time flags
    NEXT_PHASE: z.string().optional(),
    WEBPACK: z.string().optional(),
    BUILD_PHASE: z.string().optional(),

    // SQLite specific settings
    SQLITE_READONLY: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL ?? undefined,
    POSTGRES_URL: process.env.POSTGRES_URL ?? undefined,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL ?? undefined,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ?? undefined,
    SQLITE_DATABASE_URL: process.env.SQLITE_DATABASE_URL ?? undefined,
    CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN ?? undefined,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ?? undefined,
    CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID ?? undefined,
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL ?? undefined,
    PLANETSCALE_DATABASE_URL: process.env.PLANETSCALE_DATABASE_URL ?? undefined,
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? undefined,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ?? undefined,
    DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE ?? undefined,
    DATABASE_CONNECTION_LIMIT: process.env.DATABASE_CONNECTION_LIMIT ?? undefined,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    NEXT_PHASE: process.env.NEXT_PHASE,
    WEBPACK: process.env.WEBPACK,
    BUILD_PHASE: process.env.BUILD_PHASE,
    SQLITE_READONLY: process.env.SQLITE_READONLY,
  },
  onValidationError: error => {
    const errorMessage = Array.isArray(error)
      ? error.map(e => e.message).join(', ')
      : String(error);

    console.warn('Database environment validation failed:', errorMessage);
    // Don't throw in packages - use fallbacks for resilience
    return undefined as never;
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    DATABASE_URL: process.env.DATABASE_URL || '',
    POSTGRES_URL: process.env.POSTGRES_URL || '',
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL || '',
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING || '',
    SQLITE_DATABASE_URL: process.env.SQLITE_DATABASE_URL || '',
    CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN || '',
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
    CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID || '',
    NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
    PLANETSCALE_DATABASE_URL: process.env.PLANETSCALE_DATABASE_URL || '',
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL || '',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN || '',
    DATABASE_POOL_SIZE: process.env.DATABASE_POOL_SIZE || '',
    DATABASE_CONNECTION_LIMIT: process.env.DATABASE_CONNECTION_LIMIT || '',
    NODE_ENV: (process.env.NODE_ENV as 'development' | 'test' | 'production') || 'development',
    VERCEL: process.env.VERCEL || '',
    NEXT_PHASE: process.env.NEXT_PHASE || '',
    WEBPACK: process.env.WEBPACK || '',
    BUILD_PHASE: process.env.BUILD_PHASE || '',
    SQLITE_READONLY: process.env.SQLITE_READONLY || '',
  };
}

// Helper functions for common patterns
export function isProduction(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production';
}

export function isBuild(): boolean {
  const env = safeEnv();
  return env.NODE_ENV === 'production' && !env.VERCEL;
}

export function hasDatabaseConfig(): boolean {
  const env = safeEnv();
  return Boolean(env.DATABASE_URL || env.POSTGRES_URL || env.SQLITE_DATABASE_URL);
}

export function getDatabaseUrl(): string | undefined {
  const env = safeEnv();
  return env.DATABASE_URL || env.POSTGRES_URL || env.POSTGRES_PRISMA_URL;
}

// Export type for better DX
export type Env = typeof env;
