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
      PRISMA_LOG_LEVEL: process.env.PRISMA_LOG_LEVEL,
      PRISMA_LOG_PERFORMANCE: process.env.PRISMA_LOG_PERFORMANCE,
      PRISMA_LOG_PROVIDER: process.env.PRISMA_LOG_PROVIDER,
      PRISMA_LOG_QUERIES: process.env.PRISMA_LOG_QUERIES,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_VECTOR_REST_TOKEN: process.env.UPSTASH_VECTOR_REST_TOKEN,
      UPSTASH_VECTOR_REST_URL: process.env.UPSTASH_VECTOR_REST_URL,
    },
    server: {
      DATABASE_PROVIDER: z
        .enum(['prisma', 'firestore', 'upstash-vector', 'upstash-redis'])
        .default('prisma'),
      DATABASE_URL: z.string().url().optional(),
      FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
      FIREBASE_PRIVATE_KEY: z.string().optional(),
      FIREBASE_PROJECT_ID: z.string().optional(),
      PRISMA_LOG_LEVEL: z.enum(['query', 'info', 'warn', 'error']).default('error'),
      PRISMA_LOG_PERFORMANCE: z
        .string()
        .transform((val: any) => val === 'true')
        .default('false'),
      PRISMA_LOG_PROVIDER: z.enum(['console', 'sentry', 'pino']).default('console'),
      PRISMA_LOG_QUERIES: z
        .string()
        .transform((val: any) => val === 'true')
        .default('false'),
      UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
      UPSTASH_REDIS_REST_URL: z.string().url().optional(),
      UPSTASH_VECTOR_REST_TOKEN: z.string().optional(),
      UPSTASH_VECTOR_REST_URL: z.string().url().optional(),
    },
  });
