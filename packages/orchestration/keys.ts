/**
 * Environment variable keys for the orchestration package
 * These keys are used throughout the orchestration workflows and QStash integrations
 */

// Core QStash Configuration
export const QSTASH_TOKEN = 'QSTASH_TOKEN';
export const QSTASH_URL = 'QSTASH_URL';

// QStash Request Signing
export const QSTASH_CURRENT_SIGNING_KEY = 'QSTASH_CURRENT_SIGNING_KEY';
export const QSTASH_NEXT_SIGNING_KEY = 'QSTASH_NEXT_SIGNING_KEY';
export const QSTASH_SIGNING_KEY = 'QSTASH_SIGNING_KEY'; // Fallback
export const QSTASH_CLOCK_TOLERANCE = 'QSTASH_CLOCK_TOLERANCE';

// AI Integration - Anthropic
export const ANTHROPIC_API_KEY = 'ANTHROPIC_API_KEY';
export const ANTHROPIC_MODEL = 'ANTHROPIC_MODEL';
export const ANTHROPIC_MAX_TOKENS = 'ANTHROPIC_MAX_TOKENS';
export const ANTHROPIC_TEMPERATURE = 'ANTHROPIC_TEMPERATURE';
export const ANTHROPIC_BASE_URL = 'ANTHROPIC_BASE_URL';

// Dead Letter Queue Configuration
export const AI_DLQ_ENDPOINT = 'AI_DLQ_ENDPOINT';
export const SAAS_DLQ_ENDPOINT = 'SAAS_DLQ_ENDPOINT';
export const EVENT_DLQ_ENDPOINT = 'EVENT_DLQ_ENDPOINT';
export const PIPELINE_FAILURE_WEBHOOK_URL = 'PIPELINE_FAILURE_WEBHOOK_URL';
export const ORDER_FAILURE_WEBHOOK_URL = 'ORDER_FAILURE_WEBHOOK_URL';

// SaaS Multi-Tenant Operations
export const SAAS_API_BASE = 'SAAS_API_BASE';
export const SAAS_API_TOKEN = 'SAAS_API_TOKEN';
export const BILLING_API_BASE = 'BILLING_API_BASE';
export const BILLING_API_TOKEN = 'BILLING_API_TOKEN';
export const FEATURE_FLAGS_API = 'FEATURE_FLAGS_API';
export const FEATURE_FLAGS_TOKEN = 'FEATURE_FLAGS_TOKEN';

// Email Service
export const EMAIL_SERVICE_URL = 'EMAIL_SERVICE_URL';
export const EMAIL_SERVICE_TOKEN = 'EMAIL_SERVICE_TOKEN';

// External Service APIs
export const ANALYTICS_API = 'ANALYTICS_API';
export const SEARCH_API = 'SEARCH_API';
export const CDN_API = 'CDN_API';

// Payment Processing
export const STRIPE_KEY = 'STRIPE_KEY';
export const STRIPE_SECRET_KEY = 'STRIPE_SECRET_KEY';

// Development and Testing
export const SKIP_WORKFLOW_DEDUPLICATION = 'SKIP_WORKFLOW_DEDUPLICATION';
export const SKIP_AUTO_APPROVAL = 'SKIP_AUTO_APPROVAL';
export const WORKFLOW_DEV_MODE = 'WORKFLOW_DEV_MODE';

// Redis Configuration (for production rate limiting and deduplication)
export const REDIS_URL = 'REDIS_URL';
export const REDIS_TOKEN = 'REDIS_TOKEN';

/**
 * Environment variable validation helpers
 */
export const requiredKeys = {
  // Core QStash
  qstash: [QSTASH_TOKEN],

  // AI Features
  ai: [ANTHROPIC_API_KEY],

  // SaaS Operations
  saas: [SAAS_API_BASE, SAAS_API_TOKEN],

  // Billing
  billing: [BILLING_API_BASE, BILLING_API_TOKEN],

  // Email
  email: [EMAIL_SERVICE_URL, EMAIL_SERVICE_TOKEN],
} as const;

export const optionalKeys = {
  // Signing (optional but recommended for production)
  signing: [QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY, QSTASH_CLOCK_TOLERANCE],

  // DLQ (optional but recommended for production)
  dlq: [AI_DLQ_ENDPOINT, SAAS_DLQ_ENDPOINT, EVENT_DLQ_ENDPOINT],

  // External services (optional)
  external: [ANALYTICS_API, SEARCH_API, CDN_API],

  // Development
  development: [SKIP_WORKFLOW_DEDUPLICATION, SKIP_AUTO_APPROVAL, WORKFLOW_DEV_MODE],

  // Redis (optional but recommended for production)
  redis: [REDIS_URL, REDIS_TOKEN],
} as const;

/**
 * Validate that required environment variables are set
 */
export function validateRequiredKeys(feature: keyof typeof requiredKeys): string[] {
  const missing: string[] = [];
  const keys = requiredKeys[feature];

  for (const key of keys) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  return missing;
}

/**
 * Check if optional keys are available
 */
export function checkOptionalKeys(feature: keyof typeof optionalKeys): {
  available: string[];
  missing: string[];
} {
  const available: string[] = [];
  const missing: string[] = [];
  const keys = optionalKeys[feature];

  for (const key of keys) {
    if (process.env[key]) {
      available.push(key);
    } else {
      missing.push(key);
    }
  }

  return { available, missing };
}

/**
 * Get all environment variables used by the orchestration package
 */
export function getAllOrchestrationKeys(): {
  required: Record<string, string[]>;
  optional: Record<string, string[]>;
} {
  return {
    optional: Object.fromEntries(
      Object.entries(optionalKeys).map(([feature, keys]) => [feature, [...keys]]),
    ),
    required: Object.fromEntries(
      Object.entries(requiredKeys).map(([feature, keys]) => [feature, [...keys]]),
    ),
  };
}

/**
 * Default environment variable values for development
 */
export const developmentDefaults = {
  [ANTHROPIC_BASE_URL]: 'https://api.anthropic.com',
  [ANTHROPIC_MAX_TOKENS]: '1000',
  [ANTHROPIC_MODEL]: 'claude-3-sonnet-20240229',
  [ANTHROPIC_TEMPERATURE]: '0.1',
  [QSTASH_CLOCK_TOLERANCE]: '300', // 5 minutes
  [QSTASH_URL]: 'https://qstash.upstash.io',
  [SKIP_AUTO_APPROVAL]: 'false',
  [SKIP_WORKFLOW_DEDUPLICATION]: 'false',
  [WORKFLOW_DEV_MODE]: 'true',
} as const;

/**
 * Apply development defaults if not already set
 */
export function applyDevelopmentDefaults(): void {
  if (process.env.NODE_ENV === 'development') {
    Object.entries(developmentDefaults).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  }
}
