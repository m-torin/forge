import { afterEach, beforeEach } from 'vitest';

/**
 * Common test environment variables
 */
export const TEST_ENV_DEFAULTS = {
  // Node environment
  NODE_ENV: 'test',

  // Next.js defaults
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_NODE_ENV: 'test',
  NEXT_RUNTIME: 'nodejs',

  // Database defaults
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  DATABASE_PROVIDER: 'prisma',

  // Upstash defaults
  UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
  UPSTASH_VECTOR_REST_URL: 'https://mock-vector.upstash.io',
  UPSTASH_VECTOR_REST_TOKEN: 'mock-vector-token',

  // QStash defaults
  QSTASH_URL: 'http://localhost:8081',
  QSTASH_TOKEN: 'eyJVc2VySUQiOiJkZWZhdWx0VXNlciIsIlBhc3N3b3JkIjoiZGVmYXVsdFBhc3N3b3JkIn0=',
  QSTASH_CURRENT_SIGNING_KEY: 'sig_7kYjw48mhY7kAjqNGcy6cr29RJ6r',
  QSTASH_NEXT_SIGNING_KEY: 'sig_5ZB6DVzB1wjE8S6rZ7eenA8Pdnhs',

  // Auth defaults
  NEXTAUTH_SECRET: 'mock-secret',
  BETTER_AUTH_SECRET: 'mock-better-auth-secret',

  // Third-party services
  STRIPE_SECRET_KEY: 'sk_test_mock',
  RESEND_API_KEY: 'mock-resend-key',
  SENDGRID_API_KEY: 'mock-sendgrid-key',
  TWILIO_ACCOUNT_SID: 'mock-twilio-sid',
  TWILIO_AUTH_TOKEN: 'mock-twilio-token',

  // Firebase defaults
  FIREBASE_PROJECT_ID: 'mock-project',
  FIREBASE_CLIENT_EMAIL: 'mock@example.com',
  FIREBASE_PRIVATE_KEY: 'mock-private-key',

  // Analytics defaults
  NEXT_PUBLIC_POSTHOG_KEY: 'mock-posthog-key',
  NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-MOCKGA123',
};

/**
 * Environment configuration for different test types
 */
export const ENV_PRESETS = {
  minimal: {
    NODE_ENV: 'test',
  },

  nextjs: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_RUNTIME: 'nodejs',
  },

  database: {
    NODE_ENV: 'test',
    DATABASE_URL: TEST_ENV_DEFAULTS.DATABASE_URL,
    DATABASE_PROVIDER: TEST_ENV_DEFAULTS.DATABASE_PROVIDER,
    UPSTASH_REDIS_REST_URL: TEST_ENV_DEFAULTS.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: TEST_ENV_DEFAULTS.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_VECTOR_REST_URL: TEST_ENV_DEFAULTS.UPSTASH_VECTOR_REST_URL,
    UPSTASH_VECTOR_REST_TOKEN: TEST_ENV_DEFAULTS.UPSTASH_VECTOR_REST_TOKEN,
    FIREBASE_PROJECT_ID: TEST_ENV_DEFAULTS.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: TEST_ENV_DEFAULTS.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: TEST_ENV_DEFAULTS.FIREBASE_PRIVATE_KEY,
  },

  qstash: {
    NODE_ENV: 'test',
    QSTASH_URL: TEST_ENV_DEFAULTS.QSTASH_URL,
    QSTASH_TOKEN: TEST_ENV_DEFAULTS.QSTASH_TOKEN,
    QSTASH_CURRENT_SIGNING_KEY: TEST_ENV_DEFAULTS.QSTASH_CURRENT_SIGNING_KEY,
    QSTASH_NEXT_SIGNING_KEY: TEST_ENV_DEFAULTS.QSTASH_NEXT_SIGNING_KEY,
  },

  auth: {
    NODE_ENV: 'test',
    NEXTAUTH_SECRET: TEST_ENV_DEFAULTS.NEXTAUTH_SECRET,
    BETTER_AUTH_SECRET: TEST_ENV_DEFAULTS.BETTER_AUTH_SECRET,
  },

  services: {
    NODE_ENV: 'test',
    STRIPE_SECRET_KEY: TEST_ENV_DEFAULTS.STRIPE_SECRET_KEY,
    RESEND_API_KEY: TEST_ENV_DEFAULTS.RESEND_API_KEY,
    SENDGRID_API_KEY: TEST_ENV_DEFAULTS.SENDGRID_API_KEY,
    TWILIO_ACCOUNT_SID: TEST_ENV_DEFAULTS.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: TEST_ENV_DEFAULTS.TWILIO_AUTH_TOKEN,
  },
};

/**
 * Create an environment setup utility
 */
export function createEnvironmentSetup(
  customEnv: Record<string, string | undefined> = {},
  preset?: keyof typeof ENV_PRESETS,
) {
  const originalEnv = { ...process.env };
  const presetEnv = preset ? ENV_PRESETS[preset] : {};
  const mergedEnv = { ...presetEnv, ...customEnv };

  return {
    setup: () => {
      Object.entries(mergedEnv).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value !== null) {
            process.env[key] = String(value);
          } else {
            delete process.env[key];
          }
        }
      });
    },

    restore: () => {
      // Remove all test env vars
      Object.keys(mergedEnv).forEach(key => {
        delete process.env[key];
      });

      // Restore original values
      Object.entries(originalEnv).forEach(([key, value]) => {
        if (value !== undefined) {
          process.env[key] = value;
        }
      });
    },

    get: (key: string): string | undefined => {
      return process.env[key];
    },

    set: (key: string, value: string) => {
      process.env[key] = value;
    },
  };
}

/**
 * Apply environment setup for the test suite
 */
export function setupTestEnvironment(
  customEnv: Record<string, string | undefined> = {},
  preset?: keyof typeof ENV_PRESETS,
) {
  const env = createEnvironmentSetup(customEnv, preset);

  beforeEach(() => {
    env.setup();
  });

  afterEach(() => {
    env.restore();
  });

  return env;
}

/**
 * Legacy support - maps to new environment setup
 */
export function setupTestEnv(vars: Record<string, string>) {
  return setupTestEnvironment(vars);
}

/**
 * Clean all test environment variables
 */
export function cleanupTestEnvironment() {
  const allTestKeys = Object.keys(TEST_ENV_DEFAULTS);
  allTestKeys.forEach(key => {
    delete process.env[key];
  });
}
