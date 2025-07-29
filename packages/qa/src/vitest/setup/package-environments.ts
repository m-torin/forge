// Dynamic package environment setup for all tests in the monorepo
import { vi } from 'vitest';

/**
 * Type for custom environment variables
 */
export type CustomEnvironment = Record<string, string>;

/**
 * Type for environment testing predicates
 */
export type EnvironmentPredicate = () => boolean;

/**
 * Interface for dynamic environment setup
 */
export interface DynamicEnvironmentConfig {
  /** Base environments to include */
  environments?: (keyof typeof packageEnvironments)[];
  /** Custom environment variables to add */
  custom?: CustomEnvironment;
  /** Conditional environments based on predicates */
  conditional?: Array<{
    condition: EnvironmentPredicate;
    environment: keyof typeof packageEnvironments | CustomEnvironment;
  }>;
  /** Environment variables to override */
  overrides?: CustomEnvironment;
  /** Environment variables to exclude */
  exclude?: string[];
}

/**
 * Environment variable categories for different package types
 */
export const packageEnvironments = {
  /**
   * Web scraping and browser automation
   */
  scraping: {
    BROWSERLESS_API_KEY: 'test-browserless-key',
    BROWSERLESS_URL: 'https://test.browserless.io',
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
    PLAYWRIGHT_BROWSERS_PATH: '/tmp/playwright',
  },

  /**
   * Payment processing (Stripe)
   */
  payments: {
    STRIPE_SECRET_KEY: 'sk_test_1234567890',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_1234567890',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_1234567890',
    STRIPE_API_VERSION: '2023-10-16',
  },

  /**
   * Security and rate limiting
   */
  security: {
    ARCJET_KEY: 'ajkey_test_key_12345',
    RATE_LIMIT_REDIS_URL: 'redis://localhost:6379',
    SECURITY_HEADERS_ENABLED: 'true',
  },

  /**
   * Internationalization and translation
   */
  internationalization: {
    DEEPSEEK_API_KEY: 'test_api_key',
    TRANSLATION_CACHE_TTL: '3600',
    DEFAULT_LOCALE: 'en',
    SUPPORTED_LOCALES: 'en,es,fr,de,pt',
  },

  /**
   * Feature flags and analytics
   */
  featureFlags: {
    POSTHOG_KEY: 'test-posthog-key',
    POSTHOG_HOST: 'https://app.posthog.com',
    POSTHOG_PERSONAL_API_KEY: 'test-personal-key',
    POSTHOG_PROJECT_ID: 'test-project-id',
    EDGE_CONFIG: 'https://edge-config.vercel.com/test-edge-config',
    NEXT_PUBLIC_POSTHOG_KEY: 'test-key',
    NEXT_PUBLIC_POSTHOG_HOST: 'https://app.posthog.com',
    NEXT_PUBLIC_VERCEL_ENV: 'development',
    FEATURE_FLAGS_CACHE_TTL: '300',
  },

  /**
   * Authentication and authorization
   */
  auth: {
    BETTER_AUTH_SECRET: 'test_auth_secret_key_1234567890',
    BETTER_AUTH_URL: 'http://localhost:3000',
    SESSION_MAX_AGE: '2592000', // 30 days
    ORGANIZATION_INVITE_TTL: '86400', // 24 hours
  },

  /**
   * Email services
   */
  email: {
    RESEND_API_KEY: 're_test_1234567890',
    EMAIL_FROM: 'noreply@test.example.com',
    EMAIL_REPLY_TO: 'support@test.example.com',
  },

  /**
   * Notifications
   */
  notifications: {
    KNOCK_API_KEY: 'sk_test_1234567890',
    KNOCK_PUBLIC_API_KEY: 'pk_test_1234567890',
    NOTIFICATION_WEBHOOK_SECRET: 'whsec_test_1234567890',
  },

  /**
   * Storage services
   */
  storage: {
    AWS_ACCESS_KEY_ID: 'test_access_key',
    AWS_SECRET_ACCESS_KEY: 'test_secret_key',
    AWS_REGION: 'us-east-1',
    S3_BUCKET_NAME: 'test-bucket',
    R2_ACCOUNT_ID: 'test_account_id',
    R2_ACCESS_KEY_ID: 'test_r2_access_key',
    R2_SECRET_ACCESS_KEY: 'test_r2_secret_key',
  },

  /**
   * Database and caching
   */
  database: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
    REDIS_URL: 'redis://localhost:6379',
    UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
    UPSTASH_REDIS_REST_TOKEN: 'test_token',
    UPSTASH_VECTOR_REST_URL: 'https://test-vector.upstash.io',
    UPSTASH_VECTOR_REST_TOKEN: 'test_vector_token',
  },

  /**
   * AI and machine learning
   */
  ai: {
    OPENAI_API_KEY: 'sk-test_1234567890',
    ANTHROPIC_API_KEY: 'sk-ant-test_1234567890',
    DEEPSEEK_API_KEY: 'test_deepseek_key',
    MCP_SERVER_URL: 'http://localhost:3001',
  },

  /**
   * Monitoring and observability
   */
  observability: {
    SENTRY_DSN: 'https://test@test.ingest.sentry.io/test',
    SENTRY_ORG: 'test-org',
    SENTRY_PROJECT: 'test-project',
    OTEL_EXPORTER_OTLP_ENDPOINT: 'http://localhost:4318',
  },

  /**
   * Analytics
   */
  analytics: {
    NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-TEST123456',
    SEGMENT_WRITE_KEY: 'test_segment_key',
    POSTHOG_API_KEY: 'test_posthog_key',
  },

  /**
   * Orchestration and workflows
   */
  orchestration: {
    QSTASH_URL: 'https://qstash.upstash.io',
    QSTASH_TOKEN: 'test_qstash_token',
    QSTASH_CURRENT_SIGNING_KEY: 'test_signing_key',
    QSTASH_NEXT_SIGNING_KEY: 'test_next_signing_key',
  },

  /**
   * SEO and metadata
   */
  seo: {
    NEXT_PUBLIC_SITE_URL: 'https://test.example.com',
    METADATA_CACHE_TTL: '3600',
  },

  /**
   * Link management
   */
  links: {
    LINK_CACHE_TTL: '300',
    SHORT_LINK_DOMAIN: 'test.ly',
  },

  /**
   * Configuration packages
   */
  config: {
    CONFIG_VALIDATION: 'false',
    STRICT_MODE: 'false',
  },

  /**
   * Common test environment
   */
  common: {
    NODE_ENV: 'test',
    CI: 'true',
    SKIP_ENV_VALIDATION: 'true',
  },
};

/**
 * Special mocks for specific packages
 */
export const packageMocks = {
  internationalization: {
    'languine.json': () => ({
      default: {
        locale: {
          source: 'en',
          targets: ['es', 'fr', 'de', 'pt'],
        },
      },
    }),
  },

  security: {
    console: () => ({
      ...console,
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },

  featureFlags: {
    clipboard: () => ({
      navigator: {
        clipboard: {
          writeText: async () => {},
          readText: async () => '',
        },
      },
    }),
  },
};

/**
 * Setup environment for a specific package type
 */
export function setupPackageEnvironment(packageType: keyof typeof packageEnvironments) {
  const envVars = {
    ...packageEnvironments.common,
    ...packageEnvironments[packageType],
  };

  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return envVars;
}

/**
 * Dynamic environment setup - allows packages/apps to compose their own environment
 */
export function setupDynamicEnvironment(config: DynamicEnvironmentConfig) {
  let envVars: Record<string, string> = { ...packageEnvironments.common };

  // Add base environments
  if (config.environments) {
    config.environments.forEach(packageType => {
      Object.assign(envVars, packageEnvironments[packageType]);
    });
  }

  // Add custom environment variables
  if (config.custom) {
    Object.assign(envVars, config.custom);
  }

  // Apply overrides early so they're available for conditionals
  if (config.overrides) {
    Object.assign(envVars, config.overrides);
  }

  // Set environment variables so far so conditionals can access them
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  // Process conditional environments
  if (config.conditional) {
    config.conditional.forEach(({ condition, environment }) => {
      if (condition()) {
        if (typeof environment === 'string') {
          // It's a package type
          Object.assign(envVars, packageEnvironments[environment]);
        } else {
          // It's custom environment variables
          Object.assign(envVars, environment);
        }
      }
    });
  }

  // Remove excluded variables
  if (config.exclude) {
    config.exclude.forEach(key => {
      delete envVars[key];
    });
  }

  // Set environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return envVars;
}

/**
 * Test for environment variable presence
 */
export function hasEnvironment(key: string): boolean {
  return key in process.env && process.env[key] !== undefined;
}

/**
 * Test for package environment availability
 */
export function hasPackageEnvironment(packageType: keyof typeof packageEnvironments): boolean {
  const packageEnv = packageEnvironments[packageType];
  return Object.keys(packageEnv).every(key => hasEnvironment(key));
}

/**
 * Conditionally setup environments based on available dependencies
 */
export function setupConditionalEnvironments() {
  const envs: (keyof typeof packageEnvironments)[] = [];

  // Test for common package availability
  try {
    require.resolve('@prisma/client');
    envs.push('database');
  } catch {}

  try {
    require.resolve('stripe');
    envs.push('payments');
  } catch {}

  try {
    require.resolve('@repo/auth');
    envs.push('auth');
  } catch {}

  try {
    require.resolve('resend');
    envs.push('email');
  } catch {}

  try {
    require.resolve('@knocklabs/node');
    envs.push('notifications');
  } catch {}

  return setupMultipleEnvironments(envs);
}

/**
 * Setup multiple package environments
 */
export function setupMultipleEnvironments(packageTypes: (keyof typeof packageEnvironments)[]) {
  const allEnvVars = { ...packageEnvironments.common };

  packageTypes.forEach(packageType => {
    Object.assign(allEnvVars, packageEnvironments[packageType]);
  });

  Object.entries(allEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return allEnvVars;
}

/**
 * Apply package-specific mocks
 */
export function applyPackageMocks(packageType: keyof typeof packageMocks) {
  const mocks = packageMocks[packageType];

  if (packageType === 'internationalization') {
    const intlMocks = mocks as typeof packageMocks.internationalization;
    if (intlMocks && intlMocks['languine.json']) {
      vi.mock('./languine.json', () => intlMocks['languine.json']());
    }
  }

  if (packageType === 'security') {
    const securityMocks = mocks as typeof packageMocks.security;
    if (securityMocks.console) {
      global.console = securityMocks.console() as any;
    }
  }

  if (packageType === 'featureFlags') {
    const flagsMocks = mocks as typeof packageMocks.featureFlags;
    if (flagsMocks.clipboard) {
      const clipboardMock = flagsMocks.clipboard();
      Object.defineProperty(window, 'navigator', {
        value: clipboardMock.navigator,
        writable: true,
      });
    }
  }
}

/**
 * Complete package setup (environment + mocks)
 */
export function setupPackage(packageType: keyof typeof packageEnvironments) {
  setupPackageEnvironment(packageType);

  if (packageType in packageMocks) {
    applyPackageMocks(packageType as keyof typeof packageMocks);
  }
}

/**
 * Reset all package environments
 */
export function resetPackageEnvironments() {
  const allKeys = new Set<string>();
  const preservedKeys = new Set(['NODE_ENV', 'CI']); // Preserve essential test environment vars

  Object.values(packageEnvironments).forEach(envVars => {
    Object.keys(envVars).forEach(key => allKeys.add(key));
  });

  allKeys.forEach(key => {
    if (!preservedKeys.has(key)) {
      delete process.env[key];
    }
  });

  // Ensure test environment basics are set
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test';
  }
}

/**
 * Get environment variables for a specific package
 */
export function getPackageEnvironment(packageType: keyof typeof packageEnvironments) {
  return {
    ...packageEnvironments.common,
    ...packageEnvironments[packageType],
  };
}

/**
 * Environment testing utilities
 */
export const environmentTests = {
  /** Test if running in CI */
  isCI: (): boolean => process.env.CI === 'true',

  /** Test if running in development */
  isDevelopment: (): boolean => process.env.NODE_ENV === 'development',

  /** Test if running in test environment */
  isTest: (): boolean => process.env.NODE_ENV === 'test',

  /** Test if Next.js environment */
  isNextJs: (): boolean => {
    try {
      require.resolve('next');
      return true;
    } catch {
      return false;
    }
  },

  /** Test if React environment */
  isReact: (): boolean => {
    try {
      require.resolve('react');
      return true;
    } catch {
      return false;
    }
  },

  /** Test if specific package is available */
  hasPackage: (packageName: string): boolean => {
    try {
      require.resolve(packageName);
      return true;
    } catch {
      return false;
    }
  },

  /** Test if environment variable exists and is truthy */
  hasEnvVar: (key: string): boolean => {
    return hasEnvironment(key) && process.env[key] !== 'false';
  },
};

/**
 * Common environment composition patterns
 */
export const environmentPatterns = {
  /** Full-stack Next.js app with all services */
  fullStack: (): DynamicEnvironmentConfig => ({
    environments: [
      'database',
      'auth',
      'payments',
      'email',
      'notifications',
      'analytics',
      'storage',
    ],
    conditional: [
      {
        condition: environmentTests.hasPackage.bind(null, '@repo/ai'),
        environment: 'ai',
      },
      {
        condition: environmentTests.hasPackage.bind(null, '@repo/scraping'),
        environment: 'scraping',
      },
    ],
  }),

  /** Backend/API only */
  backend: (): DynamicEnvironmentConfig => ({
    environments: ['database', 'auth', 'email', 'security'],
    conditional: [
      {
        condition: environmentTests.hasPackage.bind(null, '@repo/payments'),
        environment: 'payments',
      },
    ],
  }),

  /** Frontend only */
  frontend: (): DynamicEnvironmentConfig => ({
    environments: ['featureFlags', 'analytics'],
    custom: {
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    },
  }),

  /** Package library */
  library: (): DynamicEnvironmentConfig => ({
    environments: ['common'],
  }),

  /** Microservice */
  microservice: (): DynamicEnvironmentConfig => ({
    environments: ['database', 'observability', 'orchestration'],
  }),
};

// Export utilities for easy access
export {
  applyPackageMocks as applyMocks,
  resetPackageEnvironments as resetEnv,
  setupConditionalEnvironments as setupConditional,
  setupDynamicEnvironment as setupDynamic,
  setupPackageEnvironment as setupEnv,
  setupMultipleEnvironments as setupMultiEnv,
};
