import { vi } from 'vitest';

// Mock for @t3-oss/env-nextjs pattern used throughout the codebase
const createEnvMock = (overrides = {}) => {
  const defaultEnv = {
    // Server variables
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    BETTER_AUTH_SECRET: 'test-secret-key-for-better-auth',
    BETTER_AUTH_URL: 'http://localhost:3000',
    UPSTASH_REDIS_REST_URL: 'https://mock-redis.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'mock-redis-token',
    UPSTASH_VECTOR_REST_URL: 'https://mock-vector.upstash.io',
    UPSTASH_VECTOR_REST_TOKEN: 'mock-vector-token',
    QSTASH_URL: 'https://qstash.upstash.io',
    QSTASH_TOKEN: 'mock-qstash-token',
    SENTRY_DSN: 'https://mock@sentry.io/123456',
    SENTRY_AUTH_TOKEN: 'mock-sentry-token',
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_mock',
    RESEND_API_KEY: 'mock-resend-key',
    POSTHOG_API_KEY: 'mock-posthog-key',
    GOOGLE_CLIENT_ID: 'mock-google-client-id',
    GOOGLE_CLIENT_SECRET: 'mock-google-client-secret',
    AWS_ACCESS_KEY_ID: 'mock-aws-access-key',
    AWS_SECRET_ACCESS_KEY: 'mock-aws-secret-key',
    AWS_REGION: 'us-east-1',
    S3_BUCKET: 'test-bucket',
    PERPLEXITY_API_KEY: 'mock-perplexity-key',
    ANTHROPIC_API_KEY: 'mock-anthropic-key',
    OPENAI_API_KEY: 'mock-openai-key',

    // Client variables
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_NODE_ENV: 'test',
    NEXT_PUBLIC_SENTRY_DSN: 'https://mock@sentry.io/123456',
    NEXT_PUBLIC_POSTHOG_KEY: 'mock-posthog-public-key',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-MOCKGA123',
    NEXT_PUBLIC_SEGMENT_WRITE_KEY: 'mock-segment-key',
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_mock',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: 'mock-google-client-id',
    ...overrides,
  };

  return {
    env: defaultEnv,
    safeEnv: () => defaultEnv,
    safeServerEnv: () => defaultEnv,
    envError: null,
  };
};

// Mock the env module pattern
const mockEnvModule = (modulePath: string, overrides = {}) => {
  const mock = createEnvMock(overrides);

  vi.doMock(modulePath, () => ({
    env: mock.env,
    safeEnv: mock.safeEnv,
    safeServerEnv: mock.safeServerEnv,
    safeClientEnv: () => {
      // Filter only NEXT_PUBLIC_ variables for client env
      const clientEnv: any = {};
      Object.entries(mock.env).forEach(([key, value]) => {
        if (key.startsWith('NEXT_PUBLIC_') || key === 'NODE_ENV') {
          clientEnv[key] = value;
        }
      });
      return clientEnv;
    },
    envError: mock.envError,
    // Add helper functions that some packages might use
    isProduction: () => false,
    isDevelopment: () => false,
    isTest: () => true,
    isEdgeRuntime: () => false,
    isNodeRuntime: () => true,
    isVercelEnvironment: () => false,
    isBuildEnvironment: () => false,
    default: mock.env,
  }));

  return mock;
};

// Setup function to be called in test setup files
export const setupEnvironmentMocks = (overrides = {}) => {
  const mock = createEnvMock(overrides);

  // Set process.env values
  Object.entries(mock.env).forEach(([key, value]) => {
    process.env[key] = value as string;
  });

  // Mock common env import paths
  const envPaths = ['#/env', '../env', '../../env', '../../../env', './env'];

  envPaths.forEach(path => {
    vi.doMock(path, () => ({
      env: mock.env,
      safeEnv: mock.safeEnv,
      safeServerEnv: mock.safeServerEnv,
      envError: mock.envError,
    }));
  });

  return mock;
};

// Cleanup function
export const cleanupEnvironmentMocks = () => {
  // Remove all env vars that start with common prefixes
  const prefixes = [
    'NEXT_PUBLIC_',
    'DATABASE_',
    'BETTER_AUTH_',
    'UPSTASH_',
    'QSTASH_',
    'SENTRY_',
    'STRIPE_',
    'RESEND_',
    'POSTHOG_',
    'GOOGLE_',
    'AWS_',
    'S3_',
    'PERPLEXITY_',
    'ANTHROPIC_',
    'OPENAI_',
  ];

  Object.keys(process.env).forEach(key => {
    if (prefixes.some(prefix => key.startsWith(prefix))) {
      delete process.env[key];
    }
  });
};
