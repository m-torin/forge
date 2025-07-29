/**
 * Centralized Test Data Generators
 *
 * Provides consistent test data generation across scraping test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

// Common test data patterns
export const testPatterns = {
  // Valid URLs for testing
  validUrls: [
    'https://example.com',
    'https://example.com/page',
    'https://example.com/page?param=value',
    'https://example.com/page#section',
    'https://subdomain.example.com',
    'https://example.com/deep/nested/path',
    'http://localhost:3000',
    'http://127.0.0.1:8080',
  ],

  // Invalid URLs for error testing
  invalidUrls: [
    'not-a-url',
    'ftp://example.com',
    'file:///etc/passwd',
    'javascript:alert(1)',
    '',
    'http://',
    'https://',
    'http://.',
    'http://..',
  ],

  // HTML content samples
  htmlSamples: [
    '<html><head><title>Test</title></head><body><h1>Test Page</h1></body></html>',
    '<div class="content"><p>Simple paragraph</p></div>',
    '<article><header><h1>Article Title</h1></header><p>Article content</p></article>',
    '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>',
    '<table><tr><td>Cell 1</td><td>Cell 2</td></tr></table>',
  ],

  // CSS selectors
  cssSelectors: [
    'h1',
    '.content',
    '#main',
    'article header h1',
    'ul li',
    'table tr td',
    '.article:first-child',
    'div[data-test="example"]',
    'a[href^="https://"]',
    'img[alt*="test"]',
  ],

  // XPath selectors
  xpathSelectors: [
    '//h1',
    '//div[@class="content"]',
    '//article//h1',
    '//ul/li[1]',
    '//table//td',
    '//a[contains(@href, "example")]',
    '//img[@alt]',
    '//div[text()="Test"]',
  ],

  // User agents
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
  ],

  // HTTP headers
  httpHeaders: [
    { 'User-Agent': 'Test Browser' },
    { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    { 'Accept-Language': 'en-US,en;q=0.5' },
    { 'Accept-Encoding': 'gzip, deflate' },
    { 'Cache-Control': 'no-cache' },
    { Pragma: 'no-cache' },
  ],

  // Timeout values
  timeouts: [1000, 5000, 10000, 30000, 60000],

  // Viewport sizes
  viewports: [
    { width: 1920, height: 1080 }, // Desktop
    { width: 1366, height: 768 }, // Laptop
    { width: 768, height: 1024 }, // Tablet
    { width: 375, height: 812 }, // Mobile
  ],
};

/**
 * Generates realistic scraping test data
 */
export const scrapingTestData = {
  // Mock HTML responses
  htmlResponses: [
    {
      url: 'https://example.com',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Example Domain</title>
          <meta name="description" content="This domain is for use in illustrative examples">
        </head>
        <body>
          <div>
            <h1>Example Domain</h1>
            <p>This domain is for use in illustrative examples in documents.</p>
            <p><a href="https://www.iana.org/domains/example">More information...</a></p>
          </div>
        </body>
        </html>
      `,
      expectedData: {
        title: 'Example Domain',
        description: 'This domain is for use in illustrative examples',
        links: ['https://www.iana.org/domains/example'],
      },
    },
    {
      url: 'https://news.example.com',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>News Site</title>
        </head>
        <body>
          <article class="news-article">
            <header>
              <h1>Breaking News</h1>
              <time datetime="2024-01-01">January 1, 2024</time>
            </header>
            <div class="content">
              <p>This is a breaking news story.</p>
              <p>More details will follow.</p>
            </div>
          </article>
        </body>
        </html>
      `,
      expectedData: {
        title: 'Breaking News',
        date: '2024-01-01',
        content: ['This is a breaking news story.', 'More details will follow.'],
      },
    },
    {
      url: 'https://shop.example.com',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Product Page</title>
        </head>
        <body>
          <div class="product">
            <h1 class="product-title">Amazing Product</h1>
            <span class="price">$99.99</span>
            <div class="description">
              <p>This is an amazing product that you'll love.</p>
            </div>
            <ul class="features">
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </body>
        </html>
      `,
      expectedData: {
        title: 'Amazing Product',
        price: '$99.99',
        description: "This is an amazing product that you'll love.",
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
      },
    },
  ],

  // Error responses
  errorResponses: [
    {
      url: 'https://404.example.com',
      statusCode: 404,
      statusText: 'Not Found',
      html: '<html><body><h1>404 - Page Not Found</h1></body></html>',
    },
    {
      url: 'https://500.example.com',
      statusCode: 500,
      statusText: 'Internal Server Error',
      html: '<html><body><h1>500 - Internal Server Error</h1></body></html>',
    },
    {
      url: 'https://timeout.example.com',
      error: 'TIMEOUT',
      message: 'Request timeout',
    },
    {
      url: 'https://blocked.example.com',
      statusCode: 403,
      statusText: 'Forbidden',
      html: '<html><body><h1>403 - Access Denied</h1></body></html>',
    },
  ],

  // Scraping configurations
  configurations: [
    {
      name: 'basic-config',
      options: {
        timeout: 5000,
        userAgent: 'Test Scraper',
        followRedirects: true,
      },
    },
    {
      name: 'headless-config',
      options: {
        headless: true,
        timeout: 10000,
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'mobile-config',
      options: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        viewport: { width: 375, height: 812 },
        isMobile: true,
      },
    },
  ],

  // Extraction patterns
  extractionPatterns: [
    {
      name: 'title-extraction',
      selectors: ['h1', 'title', '.page-title', '#title'],
      expectedFormat: 'string',
    },
    {
      name: 'link-extraction',
      selectors: ['a[href]'],
      attribute: 'href',
      expectedFormat: 'array',
    },
    {
      name: 'image-extraction',
      selectors: ['img[src]'],
      attribute: 'src',
      expectedFormat: 'array',
    },
    {
      name: 'text-extraction',
      selectors: ['p', '.content', '.description'],
      expectedFormat: 'array',
    },
  ],
};

/**
 * Generates edge case test data
 */
export const edgeCaseTestData = {
  // Malformed HTML
  malformedHtml: [
    '<html><head><title>Unclosed tags<body><p>Content',
    '<div><span>Nested <div>without closing</span>',
    '<<invalid>>tags<<//invalid>>',
    '<script>alert("xss")</script><p>Content</p>',
    '',
    'Plain text without HTML tags',
  ],

  // Large content
  largeContent: {
    hugePage: '<html><body>' + '<p>Content</p>'.repeat(10000) + '</body></html>',
    manyLinks:
      '<html><body>' +
      Array.from(
        { length: 1000 },
        (_, i) => `<a href="https://example.com/page${i}">Link ${i}</a>`,
      ).join('') +
      '</body></html>',
    deepNesting: '<div>'.repeat(100) + 'Content' + '</div>'.repeat(100),
  },

  // Special characters
  specialCharacters: [
    'Content with émojis 🎉🚀⭐',
    'Unicode: café, naïve, résumé',
    'Asian characters: 北京 東京 한국어',
    'Special symbols: ©®™€£¥',
    'Math symbols: ∑∆∫∞√',
    'Arrows: ←→↑↓⬅➡⬆⬇',
  ],

  // Performance test cases
  performance: {
    // URLs that simulate slow responses
    slowUrls: ['https://httpbin.org/delay/5', 'https://httpbin.org/delay/10'],

    // Large response sizes
    largeSizes: [
      'https://httpbin.org/bytes/1048576', // 1MB
      'https://httpbin.org/bytes/5242880', // 5MB
    ],

    // Many redirects
    redirectChains: ['https://httpbin.org/redirect/5', 'https://httpbin.org/redirect/10'],
  },

  // Security test cases
  security: {
    // Potentially dangerous URLs
    dangerousUrls: [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///etc/passwd',
      'ftp://malicious.example.com',
    ],

    // Content with security issues
    maliciousContent: [
      '<script>alert("XSS")</script>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<img src="x" onerror="alert(1)">',
      '<a href="javascript:alert(1)">Click me</a>',
    ],
  },
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates a scraping request with specific characteristics
   */
  scrapingRequest: (overrides = {}) => ({
    url: 'https://example.com',
    options: {
      timeout: 5000,
      userAgent: 'Test Scraper',
      followRedirects: true,
    },
    expectedSelectors: ['h1', 'p', 'a'],
    ...overrides,
  }),

  /**
   * Creates a scraping response with specific characteristics
   */
  scrapingResponse: (overrides = {}) => ({
    url: 'https://example.com',
    statusCode: 200,
    statusText: 'OK',
    html: '<html><body><h1>Test</h1></body></html>',
    text: 'Test',
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
    timing: {
      start: Date.now(),
      end: Date.now() + 1000,
      duration: 1000,
    },
    ...overrides,
  }),

  /**
   * Creates extraction rules with specific characteristics
   */
  extractionRules: (overrides = {}) => ({
    title: { selector: 'h1', attribute: 'textContent' },
    links: { selector: 'a', attribute: 'href', multiple: true },
    images: { selector: 'img', attribute: 'src', multiple: true },
    text: { selector: 'p', attribute: 'textContent', multiple: true },
    ...overrides,
  }),

  /**
   * Creates browser configuration with specific characteristics
   */
  browserConfig: (overrides = {}) => ({
    headless: true,
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Test Browser)',
    timeout: 30000,
    waitForSelector: 'body',
    ...overrides,
  }),

  /**
   * Creates performance test data
   */
  performance: {
    // Many URLs for batch testing
    manyUrls: (count = 100) =>
      Array.from({ length: count }, (_, i) => `https://example.com/page${i}`),

    // Many selectors for extraction testing
    manySelectors: (count = 50) => Array.from({ length: count }, (_, i) => `.class${i}`),

    // Large extraction rules
    largeExtractionRules: (ruleCount = 100) =>
      Array.from({ length: ruleCount }, (_, i) => [
        `rule_${i}`,
        {
          selector: `.selector${i}`,
          attribute: 'textContent',
        },
      ]).reduce((acc, [key, value]) => ({ ...acc, [key as string]: value }), {}),
  },
};

/**
 * Validation helpers for test data
 */
export const validateTestData = {
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
   * Validates that HTML content is well-formed
   */
  isValidHtml: (html: string) => {
    // Basic validation - could be enhanced with proper HTML parser
    const openTags = (html.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (html.match(/<\/[^>]*>/g) || []).length;
    const selfClosing = (html.match(/<[^>]*\/>/g) || []).length;

    // Allow for self-closing tags and basic structure
    return Math.abs(openTags - closeTags - selfClosing) <= 5;
  },

  /**
   * Validates that extraction result has expected structure
   */
  hasValidExtractionResult: (result: any, expectedKeys: string[]) => {
    if (!result || typeof result !== 'object') {
      return false;
    }

    return expectedKeys.every(key => key in result);
  },

  /**
   * Validates that scraping response has required properties
   */
  hasValidScrapingResponse: (response: any) => {
    const required = ['url', 'statusCode', 'html'];
    return required.every(prop => prop in response && response[prop] !== undefined);
  },

  /**
   * Validates that timing data is reasonable
   */
  hasValidTiming: (timing: any) => {
    if (!timing || typeof timing !== 'object') return false;
    if (!timing.start || !timing.end || !timing.duration) return false;

    return timing.end >= timing.start && timing.duration > 0 && timing.duration < 300000; // < 5 minutes
  },
};
