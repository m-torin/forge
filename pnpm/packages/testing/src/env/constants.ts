/**
 * Standard Test Environment Constants
 *
 * This file defines standard test values for environment variables
 * that can be used across all testing frameworks (Vitest, Cypress, etc.)
 */

/**
 * Common test environment variables with standardized values
 */
export const testEnvVars = {
  // Authentication
  CLERK_SECRET_KEY: 'sk_test_clerk_secret_key',
  CLERK_PUBLISHABLE_KEY: 'pk_test_clerk_publishable_key',

  // Database
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test',

  // Email
  RESEND_API_KEY: 're_test_resend_token',

  // Analytics
  GOOGLE_ANALYTICS_ID: 'G-TEST12345',
  POSTHOG_API_KEY: 'phc_test12345',

  // Payments
  STRIPE_SECRET_KEY: 'sk_test_stripe_secret_key',
  STRIPE_WEBHOOK_SECRET: 'whsec_test_stripe_webhook_secret',

  // Feature flags
  FEATURE_FLAGS_API_KEY: 'test_feature_flags_key',
};

/**
 * Environment-specific validation patterns
 */
export const validationPatterns = {
  // Authentication
  clerk: {
    secretKeyTest: /^sk_test_/,
    secretKeyProd: /^sk_live_/,
    publishableKeyTest: /^pk_test_/,
    publishableKeyProd: /^pk_live_/,
  },

  // Email
  resend: {
    apiKeyTest: /^re_test_/,
    apiKeyProd: /^re_/,
  },

  // Payments
  stripe: {
    secretKeyTest: /^sk_test_/,
    secretKeyProd: /^sk_live_/,
    webhookSecretTest: /^whsec_test_/,
    webhookSecretProd: /^whsec_/,
  },

  // Analytics
  analytics: {
    googleIdTest: /^G-TEST/,
    googleIdProd: /^G-/,
    posthogKeyTest: /^phc_test/,
    posthogKeyProd: /^phc_/,
  },
};
