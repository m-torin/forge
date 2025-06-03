import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as core } from '@repo/config/next/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  client: {},
  extends: [auth(), analytics(), core(), database(), email(), observability(), security()],
  runtimeEnv: {
    // QStash Core
    QSTASH_CURRENT_SIGNING_KEY: process.env.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: process.env.QSTASH_NEXT_SIGNING_KEY,
    QSTASH_TOKEN: process.env.QSTASH_TOKEN,
    QSTASH_URL: process.env.QSTASH_URL,
    // Service API Key for service-to-service authentication
    SERVICE_API_KEY: process.env.SERVICE_API_KEY,

    // Upstash Redis
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_WORKFLOW_URL: process.env.UPSTASH_WORKFLOW_URL,

    AI_DLQ_ENDPOINT: process.env.AI_DLQ_ENDPOINT,
    EVENT_DLQ_ENDPOINT: process.env.EVENT_DLQ_ENDPOINT,
    ORDER_FAILURE_WEBHOOK_URL: process.env.ORDER_FAILURE_WEBHOOK_URL,
    // Orchestration - Failure Handling
    PIPELINE_FAILURE_WEBHOOK_URL: process.env.PIPELINE_FAILURE_WEBHOOK_URL,
    SAAS_DLQ_ENDPOINT: process.env.SAAS_DLQ_ENDPOINT,

    BILLING_API_BASE: process.env.BILLING_API_BASE,
    BILLING_API_TOKEN: process.env.BILLING_API_TOKEN,
    FEATURE_FLAGS_API: process.env.FEATURE_FLAGS_API,
    FEATURE_FLAGS_TOKEN: process.env.FEATURE_FLAGS_TOKEN,
    // Orchestration - SaaS Operations
    SAAS_API_BASE: process.env.SAAS_API_BASE,
    SAAS_API_TOKEN: process.env.SAAS_API_TOKEN,

    ANALYTICS_API: process.env.ANALYTICS_API,
    CDN_API: process.env.CDN_API,
    EMAIL_SERVICE_TOKEN: process.env.EMAIL_SERVICE_TOKEN,
    EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
    // Orchestration - External Services
    SCRAPING_API_KEY: process.env.SCRAPING_API_KEY,
    SCRAPING_API_URL: process.env.SCRAPING_API_URL,
    SEARCH_API: process.env.SEARCH_API,

    SKIP_AUTO_APPROVAL: process.env.SKIP_AUTO_APPROVAL,
    // Orchestration - Development
    SKIP_WORKFLOW_DEDUPLICATION: process.env.SKIP_WORKFLOW_DEDUPLICATION,
    WORKFLOW_DEV_MODE: process.env.WORKFLOW_DEV_MODE,
  },
  server: {
    // Service API Key - can be rotated via Doppler
    SERVICE_API_KEY: z.string().min(32).optional(),

    // QStash Core
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
    QSTASH_TOKEN: z.string().min(1),
    QSTASH_URL: z.string().url().optional(),

    // Upstash Redis
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_WORKFLOW_URL: z.string().url().optional(),

    AI_DLQ_ENDPOINT: z.string().url().optional(),
    EVENT_DLQ_ENDPOINT: z.string().url().optional(),
    ORDER_FAILURE_WEBHOOK_URL: z.string().url().optional(),
    // Orchestration - Failure Handling
    PIPELINE_FAILURE_WEBHOOK_URL: z.string().url().optional(),
    SAAS_DLQ_ENDPOINT: z.string().url().optional(),

    BILLING_API_BASE: z.string().url().optional(),
    BILLING_API_TOKEN: z.string().optional(),
    FEATURE_FLAGS_API: z.string().url().optional(),
    FEATURE_FLAGS_TOKEN: z.string().optional(),
    // Orchestration - SaaS Operations
    SAAS_API_BASE: z.string().url().optional(),
    SAAS_API_TOKEN: z.string().optional(),

    ANALYTICS_API: z.string().url().optional(),
    CDN_API: z.string().url().optional(),
    EMAIL_SERVICE_TOKEN: z.string().optional(),
    EMAIL_SERVICE_URL: z.string().url().optional(),
    // Orchestration - External Services
    SCRAPING_API_KEY: z.string().optional(),
    SCRAPING_API_URL: z.string().url().optional(),
    SEARCH_API: z.string().url().optional(),

    SKIP_AUTO_APPROVAL: z.string().optional(),
    // Orchestration - Development
    SKIP_WORKFLOW_DEDUPLICATION: z.string().optional(),
    WORKFLOW_DEV_MODE: z.string().optional(),
  },
});
