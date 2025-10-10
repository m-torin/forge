/**
 * Centralized Test Data Generators for Feature Flags
 *
 * Provides consistent test data generation across feature flag test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
const testPatterns = {
  // Flag keys
  flagKeys: [
    'simple-flag',
    'feature-toggle',
    'experiment-variant',
    'complex-config-flag',
    'boolean-flag',
    'string-flag',
    'object-flag',
    'number-flag',
    'flag-with-spaces',
    'flag-with-dashes',
    'flag_with_underscores',
    'flag.with.dots',
    '',
    'a'.repeat(100), // Long flag name
  ],

  // Flag values
  flagValues: {
    boolean: [true, false],
    strings: [
      'enabled',
      'disabled',
      'control',
      'variant-a',
      'variant-b',
      'test-value',
      'complex string with spaces',
      'string-with-dashes',
      'string_with_underscores',
      'string.with.dots',
      '',
      'a'.repeat(1000), // Long string value
    ],
    numbers: [0, 1, -1, 42, 100, 3.14, -3.14, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    objects: [
      { config: 'simple' },
      { theme: 'dark', features: ['a', 'b'] },
      { nested: { deep: { value: 'test' } } },
      { array: [1, 2, 3] },
      { mixed: { string: 'value', number: 42, boolean: true } },
      {},
      { large: 'a'.repeat(1000) },
    ],
  },

  // User identifiers
  userIds: [
    'user-123',
    'user@example.com',
    'uuid-1234-5678-9012',
    'special-id!@#$%',
    '',
    'a'.repeat(100), // Long ID
  ],

  // Environments
  environments: ['development', 'staging', 'production', 'test'],

  // Team slugs
  teamSlugs: ['my-team', 'team-alpha', 'team-beta', 'enterprise-team'],

  // Edge Config IDs
  edgeConfigIds: ['ecfg_abc123', 'ecfg_def456', 'ecfg_xyz789', 'custom-client'],

  // PostHog project IDs
  posthogProjectIds: ['project-123', 'project-456', 'project-789'],

  // API keys
  apiKeys: ['test-api-key-123', 'phc_test_key_456', 'sk_test_789'],
};

/**
 * Generates realistic feature flag test data
 */
export const featureFlagTestData = {
  // Basic flag configurations
  flags: {
    boolean: {
      'feature-enabled': true,
      'feature-disabled': false,
      'experimental-feature': true,
      'legacy-feature': false,
    },

    variants: {
      'experiment-variant': 'variant-a',
      'ab-test': 'control',
      'multivariate-test': 'variant-b',
      'control-flag': 'control',
    },

    strings: {
      'string-flag': 'enabled',
      'mode-flag': 'dark',
      'environment-flag': 'production',
      'complex-string': 'complex value with spaces',
    },

    numbers: {
      'number-flag': 42,
      'percentage-flag': 0.5,
      'count-flag': 100,
      'negative-flag': -1,
    },

    objects: {
      'config-flag': {
        theme: 'dark',
        features: ['feature-a', 'feature-b'],
        limits: { requests: 1000, users: 500 },
      },
      'complex-config': {
        ui: {
          layout: 'grid',
          theme: 'dark',
          animations: true,
        },
        api: {
          version: 'v2',
          timeout: 5000,
          retries: 3,
        },
        features: {
          experimental: true,
          beta: false,
          analytics: true,
        },
      },
      'nested-config': {
        level1: {
          level2: {
            level3: {
              value: 'deeply nested',
            },
          },
        },
      },
    },
  },

  // Edge Config specific data
  edgeConfig: {
    connectionStrings: [
      'https://edge-config.vercel.com/ecfg_abc123',
      'https://edge-config.vercel.com/ecfg_def456',
      'https://edge-config.vercel.com/ecfg_xyz789',
    ],

    itemKeys: ['flags', 'feature-flags', 'experiments', 'custom-flags'],

    responses: {
      valid: {
        'boolean-flag': true,
        'variant-flag': 'variant-a',
        'string-flag': 'enabled',
        'number-flag': 42,
        'object-flag': { config: 'value' },
      },

      empty: {},

      null: null,

      invalid: 'not-an-object',

      mixed: {
        'true-flag': true,
        'false-flag': false,
        'string-flag': 'value',
        'number-flag': 123,
        'object-flag': { nested: true },
        'array-flag': [1, 2, 3],
      },
    },
  },

  // PostHog specific data
  posthog: {
    projectIds: ['project-123', 'project-456', 'project-789'],

    apiKeys: ['phc_test_key_123', 'phc_test_key_456', 'phc_test_key_789'],

    hosts: ['https://app.posthog.com', 'https://eu.posthog.com', 'https://us.posthog.com'],

    responses: {
      featureFlags: {
        'feature-enabled': true,
        'feature-disabled': false,
        'variant-flag': 'variant-a',
        'string-flag': 'enabled',
        'number-flag': 42,
        'object-flag': { config: 'value' },
      },

      allFlags: {
        'flag-1': true,
        'flag-2': 'variant-a',
        'flag-3': { config: 'value' },
        'flag-4': 42,
        'flag-5': false,
      },

      empty: {},

      error: new Error('PostHog API error'),
    },
  },

  // User contexts
  userContexts: [
    {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
      properties: {
        plan: 'premium',
        country: 'US',
        signup_date: '2023-01-01',
      },
    },
    {
      id: 'user-456',
      email: 'admin@example.com',
      name: 'Admin User',
      properties: {
        plan: 'enterprise',
        country: 'UK',
        role: 'admin',
      },
    },
    {
      id: 'anonymous-user',
      properties: {
        session_id: 'session-123',
        device: 'mobile',
      },
    },
  ],

  // Evaluation contexts
  evaluationContexts: [
    {
      user: {
        id: 'user-123',
        email: 'user@example.com',
      },
      environment: 'production',
      timestamp: new Date('2024-01-01T00:00:00Z'),
    },
    {
      user: {
        id: 'user-456',
        properties: {
          plan: 'premium',
        },
      },
      environment: 'staging',
      timestamp: new Date('2024-01-01T12:00:00Z'),
    },
    {
      anonymous: true,
      environment: 'development',
      timestamp: new Date(),
    },
  ],
};

/**
 * Generates edge case test data
 */
const edgeCaseTestData = {
  // Empty/null/undefined values
  empty: {
    string: '',
    array: [],
    object: {},
    null: null,
    undefined: undefined,
  },

  // Special characters in flag keys
  specialCharKeys: [
    'flag@#$%^&*()',
    'flag with spaces',
    'flag-with-dashes',
    'flag_with_underscores',
    'flag.with.dots',
    'flag/with/slashes',
    'flag\\with\\backslashes',
    'flag"with"quotes',
    "flag'with'apostrophes",
    'flag<with>brackets',
    'flag[with]square',
    'flag{with}curly',
    'flag=with=equals',
    'flag+with+plus',
    'flag?with?question',
    'flag&with&ampersand',
  ],

  // Large data sets
  largeString: 'a'.repeat(10000),
  largeArray: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
  largeObject: Array.from({ length: 100 }, (_, i) => [`prop_${i}`, `value_${i}`]).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  ),

  // Unicode and international
  unicode: [
    'café',
    'naïve',
    'résumé',
    'Beijing 北京',
    'Tokyo 東京',
    'Moscow Москва',
    'Paris 🇫🇷',
    'emoji test 🎉🚀⭐',
    'Arabic العربية',
    'Chinese 中文',
    'Japanese 日本語',
    'Korean 한국어',
    'Russian Русский',
    'Thai ไทย',
    'Hebrew עברית',
  ],

  // Numeric edge cases
  numbers: [
    0,
    -1,
    1,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NaN,
    3.14159,
    -3.14159,
    1e10,
    1e-10,
  ],

  // Date edge cases
  dates: [
    new Date('1970-01-01T00:00:00Z'), // Unix epoch
    new Date('2038-01-19T03:14:07Z'), // Year 2038 problem
    new Date('1900-01-01T00:00:00Z'), // Early date
    new Date('2100-12-31T23:59:59Z'), // Future date
    new Date('invalid'), // Invalid date
    new Date(0), // Unix epoch
    new Date(Number.MAX_SAFE_INTEGER), // Far future
  ],
};

/**
 * Creates test data with specific patterns
 */
const createTestData = {
  /**
   * Creates a flag configuration with specific characteristics
   */
  flag: (overrides = {}) => ({
    key: 'test-flag',
    value: true,
    environment: 'test',
    ...overrides,
  }),

  /**
   * Creates a user context with specific characteristics
   */
  user: (overrides = {}) => ({
    id: 'test-user',
    email: 'test@example.com',
    properties: {
      plan: 'basic',
      country: 'US',
    },
    ...overrides,
  }),

  /**
   * Creates an evaluation context with specific characteristics
   */
  evaluationContext: (overrides = {}) => ({
    user: createTestData.user(),
    environment: 'test',
    timestamp: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  }),

  /**
   * Creates an adapter configuration with specific characteristics
   */
  adapterConfig: (overrides = {}) => ({
    provider: 'test',
    apiKey: 'test-key',
    projectId: 'test-project',
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Large but manageable datasets for performance testing
    manyFlags: (count = 1000) =>
      Array.from({ length: count }, (_, i) => ({
        key: `flag-${i}`,
        value: i % 2 === 0,
        environment: 'test',
      })),

    manyUsers: (count = 100) =>
      Array.from({ length: count }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        properties: {
          plan: i % 3 === 0 ? 'premium' : 'basic',
          country: i % 2 === 0 ? 'US' : 'UK',
        },
      })),

    largeConfig: (propCount = 100) =>
      Array.from({ length: propCount }, (_, i) => [`config_${i}`, `value_${i}`]).reduce(
        (acc, [key, value]) => ({ ...acc, [key]: value }),
        {},
      ),
  },
};

/**
 * Validation helpers for test data
 */
const validateTestData = {
  /**
   * Validates that a flag has all required properties
   */
  hasRequiredFlagProperties: (flag: any, requiredProps: string[]) => {
    const missing = requiredProps.filter(
      prop => flag[prop] === undefined || flag[prop] === null || flag[prop] === '',
    );
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that a flag has the expected property types
   */
  hasCorrectFlagTypes: (flag: any, typeMap: Record<string, string>) => {
    const errors: string[] = [];

    Object.entries(typeMap).forEach(([prop, expectedType]) => {
      const value = flag[prop];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (value !== undefined && actualType !== expectedType) {
        errors.push(`${prop}: expected ${expectedType}, got ${actualType}`);
      }
    });

    return errors.length === 0 ? null : errors;
  },

  /**
   * Validates that a timestamp is reasonable
   */
  isValidTimestamp: (timestamp: any) => {
    if (!(timestamp instanceof Date)) return false;
    if (isNaN(timestamp.getTime())) return false;

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    return timestamp >= oneYearAgo && timestamp <= oneYearFromNow;
  },

  /**
   * Validates that a flag key is properly formatted
   */
  isValidFlagKey: (key: string) => {
    if (typeof key !== 'string') return false;
    if (key.length === 0) return false;
    if (key.length > 255) return false;

    // Allow letters, numbers, dashes, underscores, dots
    const validKeyRegex = /^[a-zA-Z0-9_.-]+$/;
    return validKeyRegex.test(key);
  },

  /**
   * Validates that a user ID is properly formatted
   */
  isValidUserId: (userId: string) => {
    if (typeof userId !== 'string') return false;
    if (userId.length === 0) return false;
    if (userId.length > 255) return false;

    return true;
  },
};

/**
 * Mock data generators for external services
 */
const mockServiceData = {
  /**
   * Creates mock Edge Config client responses
   */
  edgeConfigClient: {
    success: (data: any) => Promise.resolve(data),
    error: (message: string) => Promise.reject(new Error(message)),
    null: () => Promise.resolve(null),
    invalid: () => Promise.resolve('not-an-object'),
  },

  /**
   * Creates mock PostHog client responses
   */
  posthogClient: {
    success: (data: any) => Promise.resolve(data),
    error: (message: string) => Promise.reject(new Error(message)),
    featureFlags: (flags: Record<string, any>) => Promise.resolve(flags),
    allFlags: (flags: Record<string, any>) => Promise.resolve(flags),
  },

  /**
   * Creates mock environment variables
   */
  environment: {
    complete: {
      EDGE_CONFIG: 'https://edge-config.vercel.com/ecfg_test123',
      POSTHOG_API_KEY: 'phc_test_key_123',
      POSTHOG_PROJECT_ID: 'project-123',
      POSTHOG_HOST: 'https://app.posthog.com',
      NODE_ENV: 'test',
      NEXT_PUBLIC_NODE_ENV: 'test',
    },
    minimal: {
      NODE_ENV: 'test',
      NEXT_PUBLIC_NODE_ENV: 'test',
    },
    empty: {},
  },
};
