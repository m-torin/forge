import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const isProduction = process.env.NODE_ENV === 'production';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || undefined,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || undefined,
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || undefined,
      R2_BUCKET: process.env.R2_BUCKET || undefined,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || undefined,
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || undefined,
    },
    server: {
      // Vercel Blob
      BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
      R2_ACCESS_KEY_ID: z.string().min(1).optional(),
      // Cloudflare R2
      R2_ACCOUNT_ID: z.string().min(1).optional(),
      R2_BUCKET: z.string().min(1).optional(),
      R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
      STORAGE_PROVIDER: isProduction
        ? z.enum(['vercel-blob', 'cloudflare-r2'])
        : z.enum(['vercel-blob', 'cloudflare-r2']).optional(),
    },
  });
