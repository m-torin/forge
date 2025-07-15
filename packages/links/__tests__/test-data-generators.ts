/**
 * Centralized Test Data Generators for Links Package
 *
 * Provides consistent test data generation across links test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
export const testPatterns = {
  // Link URLs
  urls: [
    'https://example.com',
    'https://example.com/path',
    'https://example.com/path?param=value',
    'https://example.com/path#fragment',
    'https://subdomain.example.com/deep/path',
    'https://example.com/very/long/path/with/many/segments',
    'https://example.com/path-with-dashes',
    'https://example.com/path_with_underscores',
    'https://example.com/path.with.dots',
    'https://example.com/path/with spaces',
    'https://example.com/path/with%20encoded%20spaces',
    'https://example.com/path/with/unicode/字符',
    'https://localhost:3000/dev',
    'http://localhost:8080/api',
    'invalid-url',
    '',
  ],

  // Short link keys
  shortKeys: [
    'abc123',
    'test-key',
    'marketing-campaign',
    'product_launch',
    'social.media',
    'email-newsletter',
    'a'.repeat(50), // Long key
    'unicode-字符',
    'key-with-dashes',
    'key_with_underscores',
    'UPPERCASE',
    'mixedCASE',
    '12345',
    'key with spaces',
    '',
  ],

  // Domains
  domains: [
    'dub.sh',
    'example.com',
    'custom.link',
    'brand.co',
    'short.ly',
    'go.company.com',
    'link.brand.io',
    'app.domain.dev',
    'staging.example.com',
    'prod.example.com',
  ],

  // Link titles
  titles: [
    'Test Link',
    'Marketing Campaign Landing Page',
    'Product Launch Announcement',
    'Social Media Post',
    'Email Newsletter',
    'Blog Post: How to Use Our Product',
    'Documentation: Getting Started',
    'API Reference Guide',
    'Case Study: Customer Success',
    'Webinar Registration',
    'Free Trial Signup',
    'Contact Us',
    'About Our Company',
    'Pricing Information',
    'Support Center',
    'Unicode Title with 字符',
    'Title with "quotes" and symbols!',
    'Very Long Title That Exceeds Normal Length Expectations And Continues On',
    '',
  ],

  // Link descriptions
  descriptions: [
    'A test link for development',
    'Marketing campaign landing page with conversion tracking',
    'Product launch announcement with detailed features',
    'Social media post driving traffic to our website',
    'Monthly newsletter with latest updates and news',
    'Comprehensive guide for new users',
    'Technical documentation for developers',
    'Real customer success story and case study',
    'Registration page for upcoming webinar',
    'Free trial signup with no credit card required',
    'Contact form for sales inquiries',
    'Detailed pricing information and plans',
    'Help center with FAQs and tutorials',
    'Unicode description with 字符 characters',
    'Description with "quotes" and symbols!',
    'Very long description that provides extensive detail about the link destination and its purpose for users',
    '',
  ],

  // Tags
  tags: [
    ['marketing', 'campaign'],
    ['social', 'media'],
    ['email', 'newsletter'],
    ['product', 'launch'],
    ['blog', 'content'],
    ['documentation', 'help'],
    ['api', 'reference'],
    ['case-study', 'success'],
    ['webinar', 'event'],
    ['trial', 'signup'],
    ['contact', 'sales'],
    ['pricing', 'plans'],
    ['support', 'help'],
    ['unicode', '字符'],
    ['special-chars', '!@#$%'],
    [],
  ],

  // Countries
  countries: [
    'US',
    'CA',
    'UK',
    'DE',
    'FR',
    'JP',
    'AU',
    'BR',
    'IN',
    'CN',
    'RU',
    'MX',
    'IT',
    'ES',
    'NL',
    'SE',
    'CH',
    'SG',
    'HK',
    'KR',
  ],

  // Browsers
  browsers: [
    'Chrome',
    'Safari',
    'Firefox',
    'Edge',
    'Opera',
    'Internet Explorer',
    'Samsung Internet',
    'Chrome Mobile',
    'Safari Mobile',
    'Firefox Mobile',
    'Unknown',
  ],

  // User agents
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/119.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Test User Agent',
    '',
  ],

  // Referrers
  referrers: [
    'https://google.com',
    'https://facebook.com',
    'https://twitter.com',
    'https://linkedin.com',
    'https://instagram.com',
    'https://youtube.com',
    'https://reddit.com',
    'https://github.com',
    'https://stackoverflow.com',
    'https://medium.com',
    'https://example.com',
    'direct',
    '',
  ],

  // IP addresses
  ipAddresses: [
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.1',
    '127.0.0.1',
    '8.8.8.8',
    '1.1.1.1',
    '::1',
    '2001:db8::1',
    '203.0.113.0',
    '198.51.100.0',
    '192.0.2.0',
    'invalid-ip',
    '',
  ],
};

/**
 * Generates realistic link test data
 */
export const linkTestData = {
  // Basic link data
  links: [
    {
      id: 'link-test-001',
      url: 'https://example.com',
      shortUrl: 'https://dub.sh/abc123',
      domain: 'dub.sh',
      key: 'abc123',
      title: 'Test Link',
      description: 'A test link for development',
      tags: ['test', 'development'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      clicks: 0,
      uniqueClicks: 0,
      userId: 'user-123',
      workspaceId: 'workspace-123',
    },
    {
      id: 'link-marketing-002',
      url: 'https://example.com/marketing',
      shortUrl: 'https://dub.sh/marketing',
      domain: 'dub.sh',
      key: 'marketing',
      title: 'Marketing Campaign',
      description: 'Marketing campaign landing page',
      tags: ['marketing', 'campaign'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      clicks: 150,
      uniqueClicks: 125,
      userId: 'user-456',
      workspaceId: 'workspace-123',
    },
    {
      id: 'link-social-003',
      url: 'https://example.com/social',
      shortUrl: 'https://custom.link/social',
      domain: 'custom.link',
      key: 'social',
      title: 'Social Media Post',
      description: 'Social media campaign link',
      tags: ['social', 'media'],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
      clicks: 75,
      uniqueClicks: 68,
      userId: 'user-789',
      workspaceId: 'workspace-456',
    },
  ],

  // Link creation requests
  createRequests: [
    {
      url: 'https://example.com',
      title: 'Test Link',
      description: 'A test link for development',
      tags: ['test'],
    },
    {
      url: 'https://example.com/marketing',
      domain: 'custom.link',
      key: 'marketing',
      title: 'Marketing Campaign',
      description: 'Marketing campaign landing page',
      tags: ['marketing', 'campaign'],
      expiresAt: '2024-12-31T23:59:59Z',
    },
    {
      url: 'https://example.com/social',
      domain: 'dub.sh',
      prefix: 'social',
      title: 'Social Media Post',
      description: 'Social media campaign link',
      tags: ['social', 'media'],
      trackConversion: true,
      publicStats: true,
    },
  ],

  // Link update requests
  updateRequests: [
    {
      title: 'Updated Test Link',
      description: 'An updated test link for development',
      tags: ['test', 'updated'],
    },
    {
      url: 'https://example.com/updated',
      title: 'Updated Marketing Campaign',
      description: 'Updated marketing campaign landing page',
      tags: ['marketing', 'campaign', 'updated'],
    },
    {
      title: 'Updated Social Media Post',
      description: 'Updated social media campaign link',
      tags: ['social', 'media', 'updated'],
      trackConversion: false,
      publicStats: false,
    },
  ],

  // Bulk operations
  bulkCreateRequests: [
    {
      links: [
        { url: 'https://example.com/1', title: 'Link 1' },
        { url: 'https://example.com/2', title: 'Link 2' },
        { url: 'https://example.com/3', title: 'Link 3' },
      ],
    },
    {
      links: [
        { url: 'https://example.com/batch1', title: 'Batch Link 1', tags: ['batch'] },
        { url: 'https://example.com/batch2', title: 'Batch Link 2', tags: ['batch'] },
        { url: 'https://example.com/batch3', title: 'Batch Link 3', tags: ['batch'] },
        { url: 'https://example.com/batch4', title: 'Batch Link 4', tags: ['batch'] },
        { url: 'https://example.com/batch5', title: 'Batch Link 5', tags: ['batch'] },
      ],
    },
  ],

  // Analytics data
  analytics: [
    {
      clicks: 100,
      uniqueClicks: 85,
      topCountries: [
        { country: 'US', clicks: 50 },
        { country: 'CA', clicks: 20 },
        { country: 'UK', clicks: 15 },
      ],
      topReferrers: [
        { referrer: 'google.com', clicks: 40 },
        { referrer: 'facebook.com', clicks: 25 },
        { referrer: 'twitter.com', clicks: 15 },
      ],
      topBrowsers: [
        { browser: 'Chrome', clicks: 60 },
        { browser: 'Safari', clicks: 25 },
        { browser: 'Firefox', clicks: 15 },
      ],
    },
    {
      clicks: 250,
      uniqueClicks: 200,
      topCountries: [
        { country: 'US', clicks: 125 },
        { country: 'UK', clicks: 50 },
        { country: 'DE', clicks: 25 },
      ],
      topReferrers: [
        { referrer: 'google.com', clicks: 100 },
        { referrer: 'linkedin.com', clicks: 75 },
        { referrer: 'direct', clicks: 50 },
      ],
      topBrowsers: [
        { browser: 'Chrome', clicks: 150 },
        { browser: 'Safari', clicks: 75 },
        { browser: 'Edge', clicks: 25 },
      ],
    },
  ],

  // Click events
  clickEvents: [
    {
      timestamp: '2024-01-01T10:00:00Z',
      country: 'US',
      city: 'San Francisco',
      region: 'CA',
      browser: 'Chrome',
      device: 'Desktop',
      os: 'macOS',
      referrer: 'google.com',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    {
      timestamp: '2024-01-01T11:00:00Z',
      country: 'UK',
      city: 'London',
      region: 'England',
      browser: 'Safari',
      device: 'Mobile',
      os: 'iOS',
      referrer: 'facebook.com',
      ip: '203.0.113.1',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    },
    {
      timestamp: '2024-01-01T12:00:00Z',
      country: 'DE',
      city: 'Berlin',
      region: 'Berlin',
      browser: 'Firefox',
      device: 'Desktop',
      os: 'Windows',
      referrer: 'twitter.com',
      ip: '198.51.100.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
    },
  ],

  // Domains
  domains: [
    {
      slug: 'dub.sh',
      verified: true,
      primary: true,
      archived: false,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      slug: 'custom.link',
      verified: true,
      primary: false,
      archived: false,
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
    },
    {
      slug: 'example.com',
      verified: false,
      primary: false,
      archived: false,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2023-03-01T00:00:00Z',
    },
  ],
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
  },

  // Special characters in URLs
  specialUrls: [
    'https://example.com/path with spaces',
    'https://example.com/path%20with%20encoded%20spaces',
    'https://example.com/path/with/unicode/字符',
    'https://example.com/path/with/emoji/🎉',
    'https://example.com/path/with/special/chars/@#$%^&*()',
    'https://example.com/path/with/quotes/"test"',
    "https://example.com/path/with/apostrophes/'test'",
    'https://example.com/path/with/brackets/<test>',
    'https://example.com/path/with/square/[test]',
    'https://example.com/path/with/curly/{test}',
    'https://example.com/path/with/plus/+test',
    'https://example.com/path/with/question/?test',
    'https://example.com/path/with/ampersand/&test',
    'https://example.com/path/with/equals/=test',
    'https://example.com/path/with/hash/#test',
  ],

  // Large data sets
  largeUrl: 'https://example.com/' + 'a'.repeat(2000),
  largeTitle: 'a'.repeat(1000),
  largeDescription: 'a'.repeat(5000),
  largeTags: Array.from({ length: 100 }, (_, i) => `tag-${i}`),

  // Unicode and international
  unicode: {
    chinese: '中文链接测试',
    japanese: '日本語リンクテスト',
    korean: '한국어 링크 테스트',
    arabic: 'اختبار الرابط العربي',
    hebrew: 'בדיקת קישור בעברית',
    russian: 'тест русской ссылки',
    emoji: '🎉 Emoji Link Test 🚀',
    mixed: 'Mixed 中文 English 日本語 Test',
  },

  // Malformed data
  malformed: {
    urls: [
      'not-a-url',
      'http://',
      'https://',
      'ftp://example.com',
      'javascript:alert("test")',
      'data:text/plain;base64,SGVsbG8gV29ybGQ=',
      'mailto:test@example.com',
      'tel:+1234567890',
      'file:///etc/passwd',
      'about:blank',
    ],
    keys: [
      'key with spaces',
      'key/with/slashes',
      'key\\with\\backslashes',
      'key"with"quotes',
      "key'with'apostrophes",
      'key<with>brackets',
      'key[with]square',
      'key{with}curly',
      'key@with@at',
      'key#with#hash',
      'key%with%percent',
      'key&with&ampersand',
      'key=with=equals',
      'key?with?question',
      'key+with+plus',
    ],
  },

  // Numeric edge cases
  numbers: {
    zero: 0,
    negative: -1,
    large: Number.MAX_SAFE_INTEGER,
    small: Number.MIN_SAFE_INTEGER,
    infinity: Number.POSITIVE_INFINITY,
    negativeInfinity: Number.NEGATIVE_INFINITY,
    nan: Number.NaN,
    decimal: 3.14159,
    negativeDecimal: -3.14159,
    scientific: 1e10,
    smallScientific: 1e-10,
  },

  // Date edge cases
  dates: {
    epoch: new Date('1970-01-01T00:00:00Z'),
    y2k: new Date('2000-01-01T00:00:00Z'),
    y2038: new Date('2038-01-19T03:14:07Z'),
    early: new Date('1900-01-01T00:00:00Z'),
    future: new Date('2100-12-31T23:59:59Z'),
    invalid: new Date('invalid'),
    maxSafe: new Date(Number.MAX_SAFE_INTEGER),
    minSafe: new Date(Number.MIN_SAFE_INTEGER),
  },
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates a link with specific characteristics
   */
  link: (overrides = {}) => ({
    id: 'link-test-001',
    url: 'https://example.com',
    shortUrl: 'https://dub.sh/test',
    domain: 'dub.sh',
    key: 'test',
    title: 'Test Link',
    description: 'A test link for development',
    tags: ['test'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    clicks: 0,
    uniqueClicks: 0,
    userId: 'user-123',
    workspaceId: 'workspace-123',
    ...overrides,
  }),

  /**
   * Creates a link creation request with specific characteristics
   */
  createRequest: (overrides = {}) => ({
    url: 'https://example.com',
    title: 'Test Link',
    description: 'A test link for development',
    tags: ['test'],
    ...overrides,
  }),

  /**
   * Creates a link update request with specific characteristics
   */
  updateRequest: (overrides = {}) => ({
    title: 'Updated Test Link',
    description: 'An updated test link for development',
    tags: ['test', 'updated'],
    ...overrides,
  }),

  /**
   * Creates analytics data with specific characteristics
   */
  analytics: (overrides = {}) => ({
    clicks: 100,
    uniqueClicks: 85,
    topCountries: [
      { country: 'US', clicks: 50 },
      { country: 'UK', clicks: 35 },
    ],
    topReferrers: [
      { referrer: 'google.com', clicks: 60 },
      { referrer: 'direct', clicks: 40 },
    ],
    topBrowsers: [
      { browser: 'Chrome', clicks: 70 },
      { browser: 'Safari', clicks: 30 },
    ],
    ...overrides,
  }),

  /**
   * Creates a click event with specific characteristics
   */
  clickEvent: (overrides = {}) => ({
    timestamp: '2024-01-01T10:00:00Z',
    country: 'US',
    city: 'San Francisco',
    region: 'CA',
    browser: 'Chrome',
    device: 'Desktop',
    os: 'macOS',
    referrer: 'google.com',
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Test User Agent)',
    ...overrides,
  }),

  /**
   * Creates a domain with specific characteristics
   */
  domain: (overrides = {}) => ({
    slug: 'dub.sh',
    verified: true,
    primary: true,
    archived: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Large but manageable datasets for performance testing
    manyLinks: (count = 1000) =>
      Array.from({ length: count }, (_, i) => ({
        id: `link-${i}`,
        url: `https://example.com/${i}`,
        shortUrl: `https://dub.sh/${i}`,
        domain: 'dub.sh',
        key: `key-${i}`,
        title: `Link ${i}`,
        description: `Test link ${i}`,
        tags: [`tag-${i % 10}`],
        clicks: i * 5,
        uniqueClicks: i * 4,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
      })),

    manyClickEvents: (count = 1000) =>
      Array.from({ length: count }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        country: testPatterns.countries[i % testPatterns.countries.length],
        browser: testPatterns.browsers[i % testPatterns.browsers.length],
        device: i % 2 === 0 ? 'Desktop' : 'Mobile',
        referrer: testPatterns.referrers[i % testPatterns.referrers.length],
        ip: `192.168.1.${i % 255}`,
      })),

    largeBulkCreate: (count = 100) => ({
      links: Array.from({ length: count }, (_, i) => ({
        url: `https://example.com/bulk/${i}`,
        title: `Bulk Link ${i}`,
        description: `Bulk created link ${i}`,
        tags: [`bulk`, `batch-${Math.floor(i / 10)}`],
      })),
    }),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
  /**
   * Validates that a link has all required properties
   */
  hasRequiredLinkProperties: (link: any) => {
    const required = ['id', 'url', 'shortUrl', 'domain', 'key'];
    const missing = required.filter(prop => !link[prop]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that a link creation request has required properties
   */
  hasRequiredCreateProperties: (request: any) => {
    const required = ['url'];
    const missing = required.filter(prop => !request[prop]);
    return missing.length === 0 ? null : missing;
  },

  /**
   * Validates that a URL is properly formatted
   */
  isValidUrl: (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates that a key is properly formatted
   */
  isValidKey: (key: string) => {
    if (!key || typeof key !== 'string') return false;
    if (key.length === 0 || key.length > 50) return false;
    return true;
  },

  /**
   * Validates that a domain is properly formatted
   */
  isValidDomain: (domain: string) => {
    if (!domain || typeof domain !== 'string') return false;
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
    return domainRegex.test(domain);
  },

  /**
   * Validates that a timestamp is reasonable
   */
  isValidTimestamp: (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    return date >= oneYearAgo && date <= oneYearFromNow;
  },

  /**
   * Validates that analytics data is properly structured
   */
  isValidAnalyticsData: (analytics: any) => {
    if (!analytics || typeof analytics !== 'object') return false;

    const required = ['clicks', 'uniqueClicks'];
    const missing = required.filter(prop => typeof analytics[prop] !== 'number');

    if (missing.length > 0) return false;
    if (analytics.clicks < 0 || analytics.uniqueClicks < 0) return false;
    if (analytics.uniqueClicks > analytics.clicks) return false;

    return true;
  },
};
