import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3900'),
  },
  runtimeEnv: {
    CLAUDE_MAX_TOKENS: process.env.CLAUDE_MAX_TOKENS,
    CLAUDE_MODEL: process.env.CLAUDE_MODEL,
    CLAUDE_TEMPERATURE: process.env.CLAUDE_TEMPERATURE,
    DATABASE_URL: process.env.DATABASE_URL,
    ENABLE_AUTONOMOUS_LEARNING: process.env.ENABLE_AUTONOMOUS_LEARNING,
    ENABLE_CI_CD_INTEGRATION: process.env.ENABLE_CI_CD_INTEGRATION,
    ENABLE_GIT_OPERATIONS: process.env.ENABLE_GIT_OPERATIONS,
    GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL,
    GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_URL: process.env.QSTASH_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    UPSTASH_WORKFLOW_TOKEN: process.env.UPSTASH_WORKFLOW_TOKEN,
    UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,
  },
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    CLAUDE_MAX_TOKENS: z.string().default('8192'),
    // Claude CLI Configuration
    CLAUDE_MODEL: z.string().default('claude-3-opus-20240229'),
    CLAUDE_TEMPERATURE: z.string().default('0.2'),

    QSTASH_TOKEN: z.string().optional(),
    QSTASH_URL: z.string().optional(),
    UPSTASH_WORKFLOW_TOKEN: z.string().optional(),
    // Upstash Configuration
    UPSTASH_WORKFLOW_URL: z.string().optional(),

    GIT_AUTHOR_EMAIL: z.string().default('autonomous@example.com'),
    GIT_AUTHOR_NAME: z.string().default('Autonomous System'),
    // Git Configuration
    GITHUB_TOKEN: z.string().optional(),

    // Database
    DATABASE_URL: z.string().optional(),

    // Observability
    SENTRY_DSN: z.string().optional(),

    // Feature Flags
    ENABLE_AUTONOMOUS_LEARNING: z.string().default('true'),
    ENABLE_CI_CD_INTEGRATION: z.string().default('false'),
    ENABLE_GIT_OPERATIONS: z.string().default('false'), // Disabled by default for safety
  },
});
