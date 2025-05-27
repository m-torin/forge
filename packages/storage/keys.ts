import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
      R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
      R2_BUCKET: process.env.R2_BUCKET,
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
    },
    server: {
      // Vercel Blob
      BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
      R2_ACCESS_KEY_ID: z.string().min(1).optional(),
      // Cloudflare R2
      R2_ACCOUNT_ID: z.string().min(1).optional(),
      R2_BUCKET: z.string().min(1).optional(),
      R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
      STORAGE_PROVIDER: z.enum(['vercel-blob', 'cloudflare-r2']),
    },
  });
