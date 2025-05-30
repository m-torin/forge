import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
      DATABASE_URL: process.env.DATABASE_URL,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    },
    server: {
      DATABASE_PROVIDER: z.enum(['prisma', 'firestore']).default('prisma'),
      DATABASE_URL: z.string().url().optional(),
      FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
      FIREBASE_PRIVATE_KEY: z.string().optional(),
      FIREBASE_PROJECT_ID: z.string().optional(),
    },
  });
