/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across observability test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

import type { Breadcrumb, LogLevel, ObservabilityContext, ObservabilityUser } from '#/core/types';

// Common test data patterns
export const testPatterns = {
  // User identifiers
  userIds: [
    'user-123',
    'user@example.com',
    'uuid-1234-5678-9012-3456',
    'special-id!@#$%',
    'user with spaces',
    'user-with-very-long-identifier-that-exceeds-normal-length',
    '',
    'a'.repeat(255), // Very long ID
  ],

  // Error messages
  errorMessages: [
    'Connection failed',
    'Database timeout',
    'Invalid input provided',
    'Network error occurred',
    'Permission denied',
    'File not found',
    'Memory allocation failed',
    'Service unavailable',
    'Authentication failed',
    'Validation error',
    '',
    'A very long error message that contains multiple sentences and detailed information about what went wrong during the operation execution process.',
  ],

  // Log messages
  logMessages: [
    'User logged in successfully',
    'Processing payment',
    'Cache miss for key',
    'Database query executed',
    'File uploaded',
    'Email sent',
    'API request processed',
    'Configuration updated',
    'Backup completed',
    'Cleanup task finished',
    'Debug message with special chars: !@#$%^&*()',
    'Unicode message: 🔥 系统错误 発生しました',
    '',
    'A'.repeat(1000), // Very long message
  ],

  // Email addresses
  emails: [
    'test@example.com',
    'user.name@domain.co.uk',
    'user+tag@example.com',
    'user@subdomain.example.com',
    'test@localhost',
    'user@example-domain.com',
    'invalid-email',
    'user@',
    '@example.com',
    '',
  ],

  // IP addresses
  ipAddresses: [
    '192.168.1.1',
    '10.0.0.1',
    '127.0.0.1',
    '8.8.8.8',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    '::1',
    'invalid-ip',
    '',
  ],

  // URLs
  urls: [
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path?param=value',
    'https://example.com/path#fragment',
    'http://localhost:3000',
    'https://subdomain.example.com/deep/path',
    'https://example.com/very/long/path/that/goes/deep/into/the/application',
    'invalid-url',
    'ftp://example.com',
    '',
  ],

  // Environments
  environments: [
    'development',
    'staging',
    'production',
    'test',
    'local',
    'preview',
    'canary',
    'beta',
  ],

  // Services
  services: [
    'api-gateway',
    'user-service',
    'payment-service',
    'notification-service',
    'auth-service',
    'file-service',
    'analytics-service',
    'reporting-service',
  ],

  // Log levels
  logLevels: ['debug', 'info', 'warning', 'error'] as LogLevel[],

  // Breadcrumb categories
  breadcrumbCategories: [
    'navigation',
    'http',
    'db',
    'auth',
    'ui',
    'console',
    'error',
    'transaction',
    'query',
    'cache',
  ],

  // Component names
  components: [
    'UserProfile',
    'PaymentForm',
    'Dashboard',
    'Navigation',
    'LoginModal',
    'SearchResults',
    'ProductList',
    'ShoppingCart',
    'OrderSummary',
    'Settings',
  ],

  // Actions
  actions: [
    'click',
    'submit',
    'load',
    'error',
    'success',
    'redirect',
    'validate',
    'save',
    'delete',
    'update',
    'create',
    'fetch',
  ],
};

/**
 * Generates realistic observability test data
 */
export const observabilityTestData = {
  errors: [
    {
      name: 'ValidationError',
      message: 'Invalid email format provided',
      stack: `ValidationError: Invalid email format provided
    at validateEmail (auth.js:42:15)`,
      code: 'INVALID_EMAIL',
    },
    {
      name: 'DatabaseError',
      message: 'Connection timeout after 30 seconds',
      stack: `DatabaseError: Connection timeout after 30 seconds
    at Database.connect (db.js:127:22)`,
      code: 'DB_TIMEOUT',
    },
    {
      name: 'NetworkError',
      message: 'Failed to fetch user data',
      stack: `NetworkError: Failed to fetch user data
    at fetchUser (api.js:89:11)`,
      code: 'NETWORK_ERROR',
    },
    {
      name: 'AuthenticationError',
      message: 'Invalid token provided',
      stack: `AuthenticationError: Invalid token provided
    at authenticate (auth.js:156:18)`,
      code: 'INVALID_TOKEN',
    },
    {
      name: 'PaymentError',
      message: 'Credit card declined',
      stack: `PaymentError: Credit card declined
    at processPayment (payment.js:78:9)`,
      code: 'PAYMENT_DECLINED',
    },
  ],

  contexts: [
    {
      extra: {
        userId: 'user-123',
        sessionId: 'session-456',
        feature: 'user-profile',
        component: 'ProfileForm',
        action: 'update',
        formData: {
          name: 'John Doe',
          email: 'john@example.com',
          preferences: { theme: 'dark', notifications: true },
        },
      },
      tags: {
        environment: 'production',
        service: 'user-service',
        version: '1.2.3',
        team: 'frontend',
      },
    },
    {
      extra: {
        orderId: 'order-789',
        paymentId: 'payment-101',
        amount: 99.99,
        currency: 'USD',
        gateway: 'stripe',
        customerId: 'customer-234',
      },
      tags: {
        environment: 'production',
        service: 'payment-service',
        version: '2.1.0',
        team: 'payments',
      },
    },
    {
      extra: {
        query: 'SELECT * FROM users WHERE id = ?',
        params: ['user-123'],
        duration: 45,
        rows: 1,
        database: 'primary',
      },
      tags: {
        environment: 'staging',
        service: 'database',
        version: '1.0.0',
        team: 'backend',
      },
    },
  ],

  users: [
    {
      id: 'user-123',
      username: 'johndoe',
      email: 'john@example.com',
      ip_address: '192.168.1.100',
      segment: 'premium',
      subscription: 'pro',
      plan: 'monthly',
      created_at: '2023-01-15T10:30:00Z',
    },
    {
      id: 'user-456',
      username: 'janedoe',
      email: 'jane@example.com',
      ip_address: '10.0.0.50',
      segment: 'free',
      subscription: 'basic',
      plan: 'free',
      created_at: '2023-06-20T14:15:30Z',
    },
    {
      id: 'user-789',
      username: 'admin',
      email: 'admin@example.com',
      ip_address: '127.0.0.1',
      segment: 'admin',
      subscription: 'enterprise',
      plan: 'unlimited',
      created_at: '2022-12-01T09:00:00Z',
    },
  ],

  breadcrumbs: [
    {
      message: 'User navigated to dashboard',
      level: 'info' as const,
      category: 'navigation',
      timestamp: Date.now() / 1000,
      data: {
        from: '/login',
        to: '/dashboard',
        method: 'GET',
      },
    },
    {
      message: 'API request to user service',
      level: 'info' as const,
      category: 'http',
      timestamp: Date.now() / 1000,
      data: {
        url: 'https://api.example.com/users/123',
        method: 'GET',
        status: 200,
        duration: 156,
      },
    },
    {
      message: 'Database query executed',
      level: 'debug' as const,
      category: 'db',
      timestamp: Date.now() / 1000,
      data: {
        query: 'SELECT * FROM orders WHERE user_id = $1',
        duration: 23,
        rows: 5,
      },
    },
    {
      message: 'Form validation failed',
      level: 'warning' as const,
      category: 'ui',
      timestamp: Date.now() / 1000,
      data: {
        form: 'payment-form',
        field: 'email',
        error: 'Invalid email format',
      },
    },
    {
      message: 'Payment processing error',
      level: 'error' as const,
      category: 'error',
      timestamp: Date.now() / 1000,
      data: {
        gateway: 'stripe',
        amount: 99.99,
        currency: 'USD',
        error: 'card_declined',
      },
    },
  ],

  transactions: [
    {
      name: 'GET /api/users',
      operation: 'http.server',
      description: 'Fetch user list',
      status: 'ok',
      tags: {
        method: 'GET',
        route: '/api/users',
        status_code: '200',
      },
    },
    {
      name: 'POST /api/orders',
      operation: 'http.server',
      description: 'Create new order',
      status: 'ok',
      tags: {
        method: 'POST',
        route: '/api/orders',
        status_code: '201',
      },
    },
    {
      name: 'DB: SELECT users',
      operation: 'db',
      description: 'Query user data',
      status: 'ok',
      tags: {
        db: 'postgresql',
        table: 'users',
        operation: 'SELECT',
      },
    },
  ],

  performance: {
    webVitals: [
      { name: 'FCP', value: 1200, rating: 'good' },
      { name: 'LCP', value: 2100, rating: 'good' },
      { name: 'CLS', value: 0.05, rating: 'good' },
      { name: 'FID', value: 80, rating: 'good' },
      { name: 'TTFB', value: 600, rating: 'good' },
    ],
    metrics: [
      { name: 'page_load_time', value: 1800, unit: 'ms' },
      { name: 'api_response_time', value: 250, unit: 'ms' },
      { name: 'db_query_time', value: 45, unit: 'ms' },
      { name: 'bundle_size', value: 2048, unit: 'kb' },
    ],
  },
};

/**
 * Generates edge case test data
 */
export const edgeCaseTestData = {
  // Empty/null/undefined values
  empty: {
    string: '',
    array: [],
    object: {},
    null: null,
    undefined: undefined,
    zero: 0,
    false: false,
  },

  // Special characters and encoding
  specialChars: [
    'test@#$%^&*()',
    'test with spaces',
    'test-with-dashes',
    'test_with_underscores',
    'test.with.dots',
    'test/with/slashes',
    'test\\with\\backslashes',
    'test"with"quotes',
    "test'with'apostrophes",
    'test<with>brackets',
    'test[with]square',
    'test{with}curly',
    'test=with=equals',
    'test+with+plus',
    'test?with?question',
    'test&with&ampersand',
    'test|with|pipes',
    'test~with~tildes',
    "test`with`backticks",
  ],

  // Large data sets
  largeString: 'a'.repeat(100000),
  largeArray: Array.from({ length: 10000 }, (_, i) => `item-${i}`),
  largeObject: Array.from({ length: 1000 }, (_, i) => [`prop_${i}`, `value_${i}`]).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {},
  ),

  // Unicode and international characters
  unicode: [
    'café',
    'naïve',
    'résumé',
    'Beijing 北京',
    'Tokyo 東京',
    'Moscow Москва',
    'Paris 🇫🇷',
    'emoji test 🎉🚀⭐🔥💯',
    'Arabic العربية',
    'Chinese 中文',
    'Japanese 日本語',
    'Korean 한국어',
    'Russian Русский',
    'Thai ไทย',
    'Hebrew עברית',
    'Hindi हिन्दी',
    'Emoji mixed with text: Hello 👋 World 🌍',
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
    0.1 + 0.2, // Floating point precision issue
  ],

  // Date edge cases
  dates: [
    new Date('1970-01-01T00:00:00Z'), // Unix epoch
    new Date('2038-01-19T03:14:07Z'), // Year 2038 problem
    new Date('1900-01-01T00:00:00Z'), // Early date
    new Date('2100-12-31T23:59:59Z'), // Future date
    new Date('invalid'), // Invalid date
    new Date(0), // Unix epoch as number
    new Date(Number.MAX_SAFE_INTEGER), // Far future
    new Date(-62135596800000), // Year 1 AD
  ],

  // Boolean edge cases
  booleans: [true, false, 'true', 'false', 1, 0, 'yes', 'no', 'on', 'off'],

  // Array edge cases
  arrays: [
    [],
    [null],
    [undefined],
    [1, 2, 3],
    ['a', 'b', 'c'],
    [true, false],
    [{ key: 'value' }],
    Array.from({ length: 1000 }, (_, i) => i), // Large array
    [1, 'string', true, null, undefined, { key: 'value' }], // Mixed types
  ],

  // Object edge cases
  objects: [
    {},
    { key: 'value' },
    { null: null },
    { undefined: undefined },
    { number: 123 },
    { boolean: true },
    { array: [1, 2, 3] },
    { nested: { deep: { value: 'test' } } },
    { 'key with spaces': 'value' },
    { 'key-with-dashes': 'value' },
    { key_with_underscores: 'value' },
    { '123numeric': 'value' },
    { '!@#$%^&*()': 'special chars' },
  ],
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates an error with specific characteristics
   */
  error: (overrides: Partial<Error> = {}) => {
    const error = new Error('Test error');
    error.name = 'TestError';
    error.stack = `TestError: Test error
    at testFunction (test.js:123:45)`;
    Object.assign(error, overrides);
    return error;
  },

  /**
   * Creates observability context with specific characteristics
   */
  context: (overrides: Partial<ObservabilityContext> = {}): ObservabilityContext => ({
    extra: {
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      feature: 'test-feature',
      component: 'TestComponent',
      action: 'test-action',
      timestamp: Date.now(),
      ...(overrides.extra || {}),
    },
    tags: {
      environment: 'test',
      service: 'test-service',
      version: '1.0.0',
      team: 'test-team',
      ...(overrides.tags || {}),
    },
    ...overrides,
  }),

  /**
   * Creates a user with specific characteristics
   */
  user: (overrides: Partial<ObservabilityUser> = {}): ObservabilityUser => ({
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    ip_address: '192.168.1.1',
    segment: 'test',
    ...overrides,
  }),

  /**
   * Creates a breadcrumb with specific characteristics
   */
  breadcrumb: (overrides: Partial<Breadcrumb> = {}): Breadcrumb => ({
    message: 'Test breadcrumb',
    level: 'info',
    category: 'test',
    timestamp: Date.now() / 1000,
    data: {
      key: 'value',
      action: 'test-action',
    },
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Generate test data for performance testing
    manyErrors: (count = 1000) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.error({ message: `Performance test error ${i}` }),
      ),

    manyMessages: (count = 1000) =>
      Array.from({ length: count }, (_, i) => `Performance test message ${i}`),

    manyContexts: (count = 1000) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.context({
          extra: { index: i, batch: Math.floor(i / 100) },
          tags: { batch: `batch-${Math.floor(i / 100)}` },
        }),
      ),

    manyUsers: (count = 1000) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.user({
          id: `perf-user-${i}`,
          username: `user${i}`,
          email: `user${i}@example.com`,
        }),
      ),

    manyBreadcrumbs: (count = 1000) =>
      Array.from({ length: count }, (_, i) =>
        createTestData.breadcrumb({
          message: `Performance breadcrumb ${i}`,
          data: { index: i },
        }),
      ),

    largePayload: (sizeKb = 1024) => ({
      data: 'x'.repeat(sizeKb * 1024),
      metadata: {
        size: sizeKb,
        type: 'large_payload_test',
        timestamp: Date.now(),
      },
    }),
  },

  /**
   * Creates realistic scenario data
   */
  scenarios: {
    userLogin: () => ({
      user: createTestData.user({
        id: 'user-login-123',
        username: 'loginuser',
        email: 'login@example.com',
      }),
      breadcrumbs: [
        createTestData.breadcrumb({
          message: 'Login form displayed',
          category: 'ui',
          data: { form: 'login' },
        }),
        createTestData.breadcrumb({
          message: 'Login credentials submitted',
          category: 'auth',
          data: { method: 'POST', endpoint: '/api/login' },
        }),
      ],
      context: createTestData.context({
        extra: { feature: 'authentication', action: 'login' },
        tags: { flow: 'user-login' },
      }),
    }),

    paymentProcessing: () => ({
      context: createTestData.context({
        extra: {
          orderId: 'order-payment-456',
          amount: 99.99,
          currency: 'USD',
          gateway: 'stripe',
          feature: 'payment',
          action: 'process',
        },
        tags: { flow: 'payment-processing' },
      }),
      breadcrumbs: [
        createTestData.breadcrumb({
          message: 'Payment form submitted',
          category: 'ui',
          data: { form: 'payment', amount: 99.99 },
        }),
        createTestData.breadcrumb({
          message: 'Payment gateway request',
          category: 'http',
          data: { gateway: 'stripe', amount: 99.99 },
        }),
      ],
    }),

    databaseError: () => ({
      error: createTestData.error({
        name: 'DatabaseError',
        message: 'Connection timeout',
        stack: `DatabaseError: Connection timeout
    at Database.query (db.js:45:12)`,
      }),
      context: createTestData.context({
        extra: {
          query: 'SELECT * FROM users WHERE id = $1',
          params: ['user-123'],
          duration: 30000,
          feature: 'database',
          action: 'query',
        },
        tags: { flow: 'database-error' },
      }),
    }),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  /**
   * Validates that an object has all required properties
   */
  hasRequiredProperties: (obj: any, requiredProps: string[]) => {
    const missing = requiredProps.filter(prop => obj[prop] === undefined || obj[prop] === null);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that an object has the expected property types
   */
  hasCorrectTypes: (obj: any, typeMap: Record<string, string>) => {
    const errors: string[] = [];

    Object.entries(typeMap).forEach(([prop, expectedType]) => {
      const value = obj[prop];
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
    if (typeof timestamp !== 'number') return false;
    if (isNaN(timestamp)) return false;

    const now = Date.now() / 1000;
    const oneYearAgo = now - 365 * 24 * 60 * 60;
    const oneYearFromNow = now + 365 * 24 * 60 * 60;

    return timestamp >= oneYearAgo && timestamp <= oneYearFromNow;
  },

  /**
   * Validates that an error object has required properties
   */
  isValidError: (error: any) => {
    return (
      error instanceof Error || (typeof error === 'object' && error !== null && 'message' in error)
    );
  },

  /**
   * Validates context structure
   */
  isValidContext: (context: any) => {
    return (
      typeof context === 'object' && context !== null && ('extra' in context || 'tags' in context)
    );
  },

  /**
   * Validates user object structure
   */
  isValidUser: (user: any) => {
    return typeof user === 'object' && user !== null && 'id' in user && typeof user.id === 'string';
  },

  /**
   * Validates breadcrumb structure
   */
  isValidBreadcrumb: (breadcrumb: any) => {
    return (
      typeof breadcrumb === 'object' &&
      breadcrumb !== null &&
      'message' in breadcrumb &&
      typeof breadcrumb.message === 'string'
    );
  },
};
