import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // Claude CLI Configuration
    CLAUDE_MODEL: z.string().default('claude-3-opus-20240229'),
    CLAUDE_MAX_TOKENS: z.string().default('8192'),
    CLAUDE_TEMPERATURE: z.string().default('0.2'),

    // Upstash Configuration
    UPSTASH_WORKFLOW_URL: z.string().optional(),
    UPSTASH_WORKFLOW_TOKEN: z.string().optional(),
    QSTASH_URL: z.string().optional(),
    QSTASH_TOKEN: z.string().optional(),

    // Git Configuration
    GITHUB_TOKEN: z.string().optional(),
    GIT_AUTHOR_NAME: z.string().default('Autonomous System'),
    GIT_AUTHOR_EMAIL: z.string().default('autonomous@example.com'),

    // Database
    DATABASE_URL: z.string().optional(),

    // Observability
    SENTRY_DSN: z.string().optional(),

    // Feature Flags
    ENABLE_AUTONOMOUS_LEARNING: z.string().default('true'),
    ENABLE_GIT_OPERATIONS: z.string().default('false'), // Disabled by default for safety
    ENABLE_CI_CD_INTEGRATION: z.string().default('false'),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3900'),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    CLAUDE_MODEL: process.env.CLAUDE_MODEL,
    CLAUDE_MAX_TOKENS: process.env.CLAUDE_MAX_TOKENS,
    CLAUDE_TEMPERATURE: process.env.CLAUDE_TEMPERATURE,
    UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
    UPSTASH_WORKFLOW_TOKEN: process.env.UPSTASH_WORKFLOW_TOKEN,
    QSTASH_URL: process.env.QSTASH_URL,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME,
    GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL,
    DATABASE_URL: process.env.DATABASE_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ENABLE_AUTONOMOUS_LEARNING: process.env.ENABLE_AUTONOMOUS_LEARNING,
    ENABLE_GIT_OPERATIONS: process.env.ENABLE_GIT_OPERATIONS,
    ENABLE_CI_CD_INTEGRATION: process.env.ENABLE_CI_CD_INTEGRATION,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
