import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    // QStash Configuration
    QSTASH_URL: z.string().url().default('http://localhost:8080'),
    QSTASH_TOKEN: z.string().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),

    // Redis Configuration (optional for dev mode)
    REDIS_URL: z.string().url().optional(),

    // WebSocket Configuration
    WS_PORT: z.coerce.number().default(3101),

    // Development Configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Performance Configuration
    MAX_CONCURRENT_WORKFLOWS: z.coerce.number().default(10),
    WORKFLOW_TIMEOUT: z.coerce.number().default(300000), // 5 minutes
    METRICS_RETENTION_DAYS: z.coerce.number().default(7),
  },
  client: {
    // Client-side environment variables
    NEXT_PUBLIC_WS_URL: z.string().url().default('ws://localhost:3101'),
    NEXT_PUBLIC_APP_NAME: z.string().default('Workflows'),
  },
  runtimeEnv: {
    // Server
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    REDIS_URL: process.env.REDIS_URL,
    WS_PORT: process.env.WS_PORT,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    MAX_CONCURRENT_WORKFLOWS: process.env.MAX_CONCURRENT_WORKFLOWS,
    WORKFLOW_TIMEOUT: process.env.WORKFLOW_TIMEOUT,
    METRICS_RETENTION_DAYS: process.env.METRICS_RETENTION_DAYS,

    // Client
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },
});
