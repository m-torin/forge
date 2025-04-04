/**
 * Test Values
 *
 * Common test values that can be used by both Vitest and Cypress.
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

/**
 * Common test user data
 */
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  name: 'Test User',
  role: 'user',
};

/**
 * Common test admin data
 */
export const testAdmin = {
  id: 'test-admin-id',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  name: 'Admin User',
  role: 'admin',
};

/**
 * Common test organization data
 */
export const testOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  slug: 'test-org',
};

/**
 * Common test dates
 */
export const testDates = {
  now: new Date('2025-01-01T12:00:00Z'),
  yesterday: new Date('2024-12-31T12:00:00Z'),
  tomorrow: new Date('2025-01-02T12:00:00Z'),
  lastWeek: new Date('2024-12-25T12:00:00Z'),
  nextWeek: new Date('2025-01-08T12:00:00Z'),
  lastMonth: new Date('2024-12-01T12:00:00Z'),
  nextMonth: new Date('2025-02-01T12:00:00Z'),
};
