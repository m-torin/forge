import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
    },
    server: {
      DATABASE_URL: z.string().url().optional(),
      DATABASE_PROVIDER: z.enum(['prisma', 'firestore']).default('prisma'),
      FIREBASE_PROJECT_ID: z.string().optional(),
      FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
      FIREBASE_PRIVATE_KEY: z.string().optional(),
    },
  });
