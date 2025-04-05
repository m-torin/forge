/**
 * Environment Variable Validation Patterns
 *
 * This file defines validation patterns for environment variables
 * that can be used across all testing frameworks (Vitest, Cypress, etc.)
 *
 * NOTE: Each application should maintain its own environment values in .env files.
 * These example values are for documentation purposes only and should not be used directly.
 */

/**
 * Example environment variables with standardized formats
 *
 * IMPORTANT: These are EXAMPLE values for documentation purposes only.
 * Each application should define its own values in its .env.test file.
 * Do not import and use these values directly in your tests.
 */
export const exampleEnvVars = {
  // Authentication
  CLERK_SECRET_KEY: "sk_test_clerk_secret_key",
  CLERK_PUBLISHABLE_KEY: "pk_test_clerk_publishable_key",

  // Database
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test",

  // Email
  RESEND_API_KEY: "re_test_resend_token",

  // Analytics
  GOOGLE_ANALYTICS_ID: "G-TEST12345",
  POSTHOG_API_KEY: "phc_test12345",

  // Payments
  STRIPE_SECRET_KEY: "sk_test_stripe_secret_key",
  STRIPE_WEBHOOK_SECRET: "whsec_test_stripe_webhook_secret",

  // Feature flags
  FEATURE_FLAGS_API_KEY: "test_feature_flags_key",
};

/**
 * Environment-specific validation patterns
 *
 * Use these patterns to validate environment variables in your application.
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

/**
 * @deprecated Use exampleEnvVars instead
 */
export const testEnvVars = exampleEnvVars;
