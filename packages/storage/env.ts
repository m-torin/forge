import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

const isProduction = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = Boolean(process.env.STORAGE_PROVIDER);

// Make env vars optional in development or when they're missing (indicating .env.local usage)
const requireInProduction = isProduction && hasRequiredEnvVars;

// Direct export for Next.js webpack inlining
export const env = createEnv({
  server: {
    // Vercel Blob
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    // Cloudflare Images
    CLOUDFLARE_IMAGES_ACCOUNT_ID: z.string().min(1).optional(),
    CLOUDFLARE_IMAGES_API_TOKEN: z.string().min(1).optional(),
    CLOUDFLARE_IMAGES_DELIVERY_URL: z.string().url().optional(),
    CLOUDFLARE_IMAGES_SIGNING_KEY: z.string().min(1).optional(),
    // Cloudflare R2 - Legacy single config
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_ACCOUNT_ID: z.string().min(1).optional(),
    R2_BUCKET: z.string().min(1).optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    // Multi-R2 config as JSON
    R2_CREDENTIALS: z
      .string()
      .transform(val => {
        if (!val) return undefined;
        try {
          return JSON.parse(val);
        } catch {
          throw new Error('R2_CREDENTIALS must be valid JSON');
        }
      })
      .pipe(
        z
          .array(
            z.object({
              name: z.string().optional(),
              bucket: z.string(),
              accountId: z.string(),
              accessKeyId: z.string(),
              secretAccessKey: z.string(),
            }),
          )
          .optional(),
      )
      .optional(),
    // Full storage config as JSON
    STORAGE_CONFIG: z
      .string()
      .transform(val => {
        if (!val) return undefined;
        try {
          return JSON.parse(val);
        } catch {
          throw new Error('STORAGE_CONFIG must be valid JSON');
        }
      })
      .optional(),
    STORAGE_LOG_LEVEL: z.enum(['info', 'warn', 'error']).default('error'),
    STORAGE_LOG_PERFORMANCE: z
      .string()
      .default('false')
      .transform((val: any) => val === 'true'),
    STORAGE_LOG_PROVIDER: z.enum(['console', 'sentry', 'pino']).default('console'),
    STORAGE_PROVIDER: requireInProduction
      ? z.enum(['vercel-blob', 'cloudflare-r2', 'cloudflare-images', 'multi'])
      : z.enum(['vercel-blob', 'cloudflare-r2', 'cloudflare-images', 'multi']).optional(),
  },
  runtimeEnv: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ?? undefined,
    CLOUDFLARE_IMAGES_ACCOUNT_ID: process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID ?? undefined,
    CLOUDFLARE_IMAGES_API_TOKEN: process.env.CLOUDFLARE_IMAGES_API_TOKEN ?? undefined,
    CLOUDFLARE_IMAGES_DELIVERY_URL: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL ?? undefined,
    CLOUDFLARE_IMAGES_SIGNING_KEY: process.env.CLOUDFLARE_IMAGES_SIGNING_KEY ?? undefined,
    // Legacy single R2 config (backward compatibility)
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ?? undefined,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ?? undefined,
    R2_BUCKET: process.env.R2_BUCKET ?? undefined,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ?? undefined,
    // New multi-R2 config as JSON array
    R2_CREDENTIALS: process.env.R2_CREDENTIALS ?? undefined,
    STORAGE_CONFIG: process.env.STORAGE_CONFIG ?? undefined,
    STORAGE_LOG_LEVEL: process.env.STORAGE_LOG_LEVEL ?? undefined,
    STORAGE_LOG_PERFORMANCE: process.env.STORAGE_LOG_PERFORMANCE ?? undefined,
    STORAGE_LOG_PROVIDER: process.env.STORAGE_LOG_PROVIDER ?? undefined,
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER ?? undefined,
  },
  onValidationError: error => {
    const message = Array.isArray(error) ? error.map(e => e.message).join(', ') : String(error);
    console.warn('Storage environment validation failed:', message);
    // Don't throw in packages - use fallbacks for resilience
    throw new Error('Storage environment validation failed');
  },
});

// Helper for non-Next.js contexts (Node.js, workers, tests)
export function safeEnv() {
  if (env) return env;

  // Fallback values for resilience
  return {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
    CLOUDFLARE_IMAGES_ACCOUNT_ID: process.env.CLOUDFLARE_IMAGES_ACCOUNT_ID || '',
    CLOUDFLARE_IMAGES_API_TOKEN: process.env.CLOUDFLARE_IMAGES_API_TOKEN || '',
    CLOUDFLARE_IMAGES_DELIVERY_URL: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL || '',
    CLOUDFLARE_IMAGES_SIGNING_KEY: process.env.CLOUDFLARE_IMAGES_SIGNING_KEY || '',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    R2_BUCKET: process.env.R2_BUCKET || '',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    R2_CREDENTIALS: process.env.R2_CREDENTIALS || '',
    STORAGE_CONFIG: process.env.STORAGE_CONFIG || '',
    STORAGE_LOG_LEVEL: process.env.STORAGE_LOG_LEVEL || 'error',
    STORAGE_LOG_PERFORMANCE: process.env.STORAGE_LOG_PERFORMANCE === 'true',
    STORAGE_LOG_PROVIDER: process.env.STORAGE_LOG_PROVIDER || 'console',
    STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || '',
  };
}

// Export type for better DX
export type Env = typeof env;
