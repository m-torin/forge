/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across security test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
export const testPatterns = {
  // IP addresses for testing
  ipAddresses: {
    valid: ['192.168.1.1', '10.0.0.1', '172.16.0.1', '127.0.0.1', '8.8.8.8', '1.1.1.1'],
    invalid: ['999.999.999.999', '192.168.1', 'not-an-ip', '', '192.168.1.1.1'],
    malicious: [
      '192.168.1.1; DROP TABLE users;',
      '<script>alert("xss")</script>',
      '192.168.1.1\nX-Forwarded-For: malicious',
    ],
  },

  // User agents for testing
  userAgents: {
    legitimate: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ],
    suspicious: [
      'curl/7.68.0',
      'wget/1.20.3',
      'Python-urllib/3.8',
      'PostmanRuntime/7.28.4',
      'Googlebot/2.1 (+http://www.google.com/bot.html)',
    ],
    malicious: [
      '<script>alert("xss")</script>',
      'User-Agent\nX-Custom-Header: malicious',
      "'; DROP TABLE users; --",
      'Mozilla/5.0 (Compatible MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2;) UNION SELECT * FROM users',
    ],
  },

  // Request paths for testing
  requestPaths: {
    normal: ['/', '/api/users', '/api/products', '/dashboard', '/profile', '/settings'],
    sensitive: ['/admin', '/api/admin', '/config', '/api/keys', '/api/secrets', '/internal'],
    malicious: [
      '/api/users/../../../etc/passwd',
      '/api/users?id=1; DROP TABLE users;',
      '/api/users?id=<script>alert("xss")</script>',
      '/api/users?id=1 UNION SELECT * FROM passwords',
    ],
  },

  // HTTP methods
  httpMethods: {
    safe: ['GET', 'HEAD', 'OPTIONS'],
    unsafe: ['POST', 'PUT', 'DELETE', 'PATCH'],
    unusual: ['TRACE', 'CONNECT', 'PROPFIND', 'MKCOL'],
  },

  // Rate limiting patterns
  rateLimits: {
    perSecond: [1, 5, 10, 50, 100],
    perMinute: [10, 60, 300, 1000, 5000],
    perHour: [100, 1000, 10000, 50000],
    perDay: [1000, 10000, 100000, 500000],
  },

  // Security headers
  securityHeaders: {
    required: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    optional: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    dangerous: {
      'X-Frame-Options': 'ALLOWALL',
      'X-XSS-Protection': '0',
      'Content-Security-Policy': 'default-src *',
    },
  },
};

/**
 * Generates realistic security test data
 */
export const securityTestData = {
  // Rate limiting scenarios
  rateLimitScenarios: [
    {
      name: 'low traffic',
      config: { requests: 10, window: 60 },
      testRequests: 5,
      expectedOutcome: 'all_allowed',
    },
    {
      name: 'burst traffic',
      config: { requests: 10, window: 60 },
      testRequests: 15,
      expectedOutcome: 'some_blocked',
    },
    {
      name: 'sustained high traffic',
      config: { requests: 100, window: 3600 },
      testRequests: 150,
      expectedOutcome: 'rate_limited',
    },
    {
      name: 'DDoS simulation',
      config: { requests: 5, window: 1 },
      testRequests: 50,
      expectedOutcome: 'heavily_limited',
    },
  ],

  // Security middleware scenarios
  middlewareScenarios: [
    {
      name: 'legitimate user request',
      request: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        path: '/api/users',
        method: 'GET',
      },
      expectedAction: 'allow',
    },
    {
      name: 'admin panel access attempt',
      request: {
        ip: '10.0.0.1',
        userAgent: 'curl/7.68.0',
        path: '/admin',
        method: 'GET',
      },
      expectedAction: 'challenge',
    },
    {
      name: 'SQL injection attempt',
      request: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        path: '/api/users?id=1; DROP TABLE users;',
        method: 'GET',
      },
      expectedAction: 'block',
    },
    {
      name: 'XSS attempt',
      request: {
        ip: '192.168.1.1',
        userAgent: '<script>alert("xss")</script>',
        path: '/api/search?q=<script>alert("xss")</script>',
        method: 'GET',
      },
      expectedAction: 'block',
    },
  ],

  // Security headers test data
  headersTestData: [
    {
      name: 'default security headers',
      config: {},
      expectedHeaders: testPatterns.securityHeaders.required,
    },
    {
      name: 'strict security headers',
      config: { strict: true },
      expectedHeaders: {
        ...testPatterns.securityHeaders.required,
        ...testPatterns.securityHeaders.optional,
      },
    },
    {
      name: 'custom CSP header',
      config: {
        contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'",
      },
      expectedHeaders: {
        ...testPatterns.securityHeaders.required,
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      },
    },
  ],

  // Environment configurations
  environmentConfigs: [
    {
      name: 'development',
      env: {
        NODE_ENV: 'development',
        RATE_LIMIT_REQUESTS: '1000',
        RATE_LIMIT_WINDOW: '3600',
        SECURITY_HEADERS_STRICT: 'false',
      },
    },
    {
      name: 'production',
      env: {
        NODE_ENV: 'production',
        RATE_LIMIT_REQUESTS: '100',
        RATE_LIMIT_WINDOW: '3600',
        SECURITY_HEADERS_STRICT: 'true',
        UPSTASH_REDIS_REST_URL: 'https://prod-redis.upstash.io',
        UPSTASH_REDIS_REST_TOKEN: 'prod-token',
      },
    },
    {
      name: 'testing',
      env: {
        NODE_ENV: 'test',
        RATE_LIMIT_REQUESTS: '10',
        RATE_LIMIT_WINDOW: '60',
        SECURITY_HEADERS_STRICT: 'false',
        UPSTASH_REDIS_REST_URL: 'memory',
      },
    },
  ],
};

/**
 * Generates edge case test data
 */
export const edgeCaseTestData = {
  // Malformed requests
  malformedRequests: [
    {
      name: 'missing user agent',
      request: {
        ip: '192.168.1.1',
        headers: {},
        path: '/api/test',
      },
    },
    {
      name: 'malformed IP in X-Forwarded-For',
      request: {
        ip: '192.168.1.1',
        headers: {
          'X-Forwarded-For': 'not-an-ip, 10.0.0.1',
        },
      },
    },
    {
      name: 'extremely long user agent',
      request: {
        ip: '192.168.1.1',
        headers: {
          'User-Agent': 'Mozilla/5.0 ' + 'A'.repeat(10000),
        },
      },
    },
    {
      name: 'null bytes in headers',
      request: {
        ip: '192.168.1.1',
        headers: {
          'User-Agent': 'Mozilla/5.0\x00malicious',
          'X-Custom': 'value\x00injection',
        },
      },
    },
  ],

  // Extreme rate limiting scenarios
  extremeRateLimit: [
    {
      name: 'zero requests allowed',
      config: { requests: 0, window: 1 },
      testRequests: 1,
      expectedOutcome: 'all_blocked',
    },
    {
      name: 'negative rate limit',
      config: { requests: -1, window: 1 },
      testRequests: 1,
      expectedOutcome: 'error',
    },
    {
      name: 'very large window',
      config: { requests: 1, window: Number.MAX_SAFE_INTEGER },
      testRequests: 2,
      expectedOutcome: 'all_allowed',
    },
    {
      name: 'concurrent requests',
      config: { requests: 1, window: 1 },
      concurrentRequests: 10,
      expectedOutcome: 'race_condition',
    },
  ],

  // Security bypass attempts
  bypassAttempts: [
    {
      name: 'X-Forwarded-For spoofing',
      request: {
        ip: '192.168.1.1',
        headers: {
          'X-Forwarded-For': '127.0.0.1',
          'X-Real-IP': '127.0.0.1',
        },
      },
    },
    {
      name: 'case manipulation in headers',
      request: {
        headers: {
          'user-agent': 'legitimate browser',
          'USER-AGENT': 'malicious bot',
          'User-Agent': 'another value',
        },
      },
    },
    {
      name: 'unicode normalization attack',
      request: {
        path: '/api/users/admin', // Normal
        pathNormalized: '/api/users/\u0061\u0064\u006D\u0069\u006E', // Unicode
      },
    },
  ],

  // Memory and performance stress tests
  stressTestData: {
    highVolumeRequests: Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      ip: `192.168.${Math.floor(i / 255)}.${i % 255}`,
      timestamp: Date.now() + i * 10,
    })),

    largeCookies: {
      name: 'large cookie test',
      cookies: Array.from({ length: 100 }, (_, i) => `cookie${i}=${'x'.repeat(1000)}`).join('; '),
    },

    manyHeaders: Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [`X-Custom-${i}`, `value-${i}`]),
    ),
  },
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates a rate limit configuration with specific characteristics
   */
  rateLimitConfig: (overrides = {}) => ({
    requests: 100,
    window: 3600, // 1 hour
    identifier: 'ip',
    skipOnError: false,
    ...overrides,
  }),

  /**
   * Creates a security middleware configuration
   */
  middlewareConfig: (overrides = {}) => ({
    enableRateLimit: true,
    enableSecurityHeaders: true,
    enableBlocking: true,
    allowedIPs: [],
    blockedIPs: [],
    ...overrides,
  }),

  /**
   * Creates a mock request with specific characteristics
   */
  mockRequest: (overrides = {}) => ({
    ip: '192.168.1.1',
    method: 'GET',
    url: 'https://test.com/api/test',
    headers: new Headers({
      'User-Agent': 'Mozilla/5.0 (Test Browser)',
      'X-Forwarded-For': '192.168.1.1',
    }),
    nextUrl: {
      pathname: '/api/test',
      searchParams: new URLSearchParams(),
    },
    ...overrides,
  }),

  /**
   * Creates a security incident report
   */
  securityIncident: (overrides = {}) => ({
    timestamp: new Date().toISOString(),
    type: 'rate_limit_exceeded',
    severity: 'medium',
    ip: '192.168.1.1',
    userAgent: 'curl/7.68.0',
    path: '/api/sensitive',
    details: 'Rate limit exceeded for IP address',
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Many IP addresses for rate limiting tests
    manyIPs: (count = 1000) =>
      Array.from({ length: count }, (_, i) => {
        const a = Math.floor(i / (256 * 256)) % 256;
        const b = Math.floor(i / 256) % 256;
        const c = i % 256;
        return `10.${a}.${b}.${c}`;
      }),

    // Many requests for load testing
    manyRequests: (count = 10000) =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        timestamp: Date.now() + i,
        ip: `192.168.${Math.floor(i / 255) % 255}.${i % 255}`,
        path: `/api/endpoint${i % 10}`,
        method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
      })),

    // Large headers for testing limits
    largeHeaders: (size = 100) =>
      Object.fromEntries(
        Array.from({ length: size }, (_, i) => [
          `X-Large-Header-${i}`,
          'x'.repeat(1000), // 1KB per header
        ]),
      ),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  /**
   * Validates that an IP address is properly formatted
   */
  isValidIP: (ip: string) => {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },

  /**
   * Validates that rate limit configuration is reasonable
   */
  hasValidRateLimitConfig: (config: any) => {
    if (!config || typeof config !== 'object') return false;
    if (typeof config.requests !== 'number' || config.requests < 0) return false;
    if (typeof config.window !== 'number' || config.window <= 0) return false;
    return true;
  },

  /**
   * Validates that security headers are properly set
   */
  hasSecureHeaders: (headers: any) => {
    const required = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
    return required.every(header => headers[header]);
  },

  /**
   * Validates that request data is safe
   */
  hasSafeRequestData: (request: any) => {
    if (!request) return false;

    // Check for common injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /\x00/, // Null bytes
    ];

    const checkString = JSON.stringify(request);
    return !dangerousPatterns.some(pattern => pattern.test(checkString));
  },

  /**
   * Validates that response is secure
   */
  hasSecureResponse: (response: any) => {
    if (!response) return false;

    // Check for security headers
    const headers = response.headers || {};
    const hasSecurityHeaders = validateTestData.hasSecureHeaders(headers);

    // Check for sensitive data exposure
    const responseStr = JSON.stringify(response);
    const exposesSecrets = /password|secret|key|token/i.test(responseStr);

    return hasSecurityHeaders && !exposesSecrets;
  },
};
