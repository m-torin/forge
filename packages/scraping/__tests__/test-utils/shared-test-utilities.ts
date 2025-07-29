/**
 * Shared Test Utilities
 *
 * Common utilities and patterns used across scraping test suites.
 * Provides helpers for mocking, assertions, and test data generation.
 */

import { vi } from 'vitest';

/**
 * Creates a mock scraping response
 */
export function createMockScrapingResponse(overrides: any = {}) {
  return {
    url: 'https://example.com',
    statusCode: 200,
    statusText: 'OK',
    html: '<html><body><h1>Test Page</h1></body></html>',
    text: 'Test Page',
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
    timing: {
      start: Date.now(),
      end: Date.now() + 1000,
      duration: 1000,
    },
    provider: 'test',
    data: {
      title: 'Test Page',
    },
    ...overrides,
  };
}

/**
 * Creates a mock browser page for Playwright testing
 */
export function createMockBrowserPage() {
  return {
    goto: vi.fn().mockResolvedValue(null),
    content: vi.fn().mockResolvedValue('<html><body><h1>Test</h1></body></html>'),
    $: vi.fn().mockResolvedValue({ textContent: 'Test' }),
    $$: vi.fn().mockResolvedValue([{ textContent: 'Test' }]),
    evaluate: vi.fn().mockResolvedValue('Test'),
    waitForSelector: vi.fn().mockResolvedValue(null),
    close: vi.fn().mockResolvedValue(null),
    setViewport: vi.fn().mockResolvedValue(null),
    setUserAgent: vi.fn().mockResolvedValue(null),
  };
}

/**
 * Creates a mock fetch response
 */
export function createMockFetchResponse(overrides: any = {}) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'text/html' }),
    text: vi.fn().mockResolvedValue('<html><body><h1>Test</h1></body></html>'),
    json: vi.fn().mockResolvedValue({}),
    blob: vi.fn().mockResolvedValue(new Blob()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    formData: vi.fn().mockResolvedValue(new FormData()),
    clone: vi.fn().mockReturnThis(),
    body: null,
    bodyUsed: false,
    redirected: false,
    type: 'basic' as ResponseType,
    url: 'https://example.com',
    ...overrides,
  };
}

/**
 * Creates a mock Cheerio object
 */
export function createMockCheerio() {
  const mockElement = {
    text: vi.fn().mockReturnValue('Test'),
    attr: vi.fn().mockReturnValue('test-value'),
    html: vi.fn().mockReturnValue('<span>Test</span>'),
    find: vi.fn().mockReturnThis(),
    first: vi.fn().mockReturnThis(),
    length: 1,
  };

  const mockCheerio = vi.fn().mockReturnValue(mockElement) as any;
  vi.spyOn(mockCheerio, 'load').mockImplementation(() => mockCheerio);

  return mockCheerio;
}

/**
 * Assertion helpers for scraping tests
 */
export const scrapingAssertions = {
  /**
   * Asserts that a scraping result has the expected structure
   */
  hasValidScrapingResult: (result: any) => {
    expect(result).toBeDefined();
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('html');
    expect(result).toHaveProperty('provider');
  },

  /**
   * Asserts that extracted data has expected properties
   */
  hasValidExtractedData: (data: any, expectedKeys: string[]) => {
    expect(data).toBeDefined();
    expect(typeof data).toBe('object');

    expectedKeys.forEach(key => {
      expect(data).toHaveProperty(key);
    });
  },

  /**
   * Asserts that HTML content is properly sanitized
   */
  hasCleanHTML: (html: string) => {
    expect(html).toBeDefined();
    expect(typeof html).toBe('string');

    // Should not contain dangerous scripts
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('onload=');
    expect(html).not.toContain('onerror=');
  },

  /**
   * Asserts that timing data is reasonable
   */
  hasValidTiming: (timing: any) => {
    expect(timing).toBeDefined();
    expect(timing).toHaveProperty('start');
    expect(timing).toHaveProperty('end');
    expect(timing).toHaveProperty('duration');

    expect(timing.end).toBeGreaterThanOrEqual(timing.start);
    expect(timing.duration).toBeGreaterThan(0);
    expect(timing.duration).toBeLessThan(300000); // < 5 minutes
  },
};

/**
 * Test data generators for common scenarios
 */
export const testDataGenerators = {
  /**
   * Generates test URLs with various characteristics
   */
  generateTestUrls: (count = 10) => {
    const domains = ['example.com', 'test.org', 'demo.net'];
    const paths = ['', '/page', '/deep/path', '/with-params?a=1', '/with-hash#section'];

    return Array.from({ length: count }, (_, i) => {
      const domain = domains[i % domains.length];
      const path = paths[i % paths.length];
      return `https://${domain}${path}`;
    });
  },

  /**
   * Generates test HTML content with various structures
   */
  generateTestHTML: (options: any = {}) => {
    const title = options.title || 'Test Page';
    const content = options.content || 'Test content';
    const hasLinks = options.hasLinks !== false;
    const hasImages = options.hasImages !== false;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta name="description" content="Test description">
      </head>
      <body>
        <h1>${title}</h1>
        <div class="content">
          <p>${content}</p>
    `;

    if (hasLinks) {
      html += '<a href="https://example.com">Test Link</a>';
    }

    if (hasImages) {
      html += '<img src="https://example.com/image.jpg" alt="Test Image">';
    }

    html += `
        </div>
      </body>
      </html>
    `;

    return html;
  },

  /**
   * Generates test selector maps
   */
  generateSelectorMaps: () => [
    {
      title: 'h1',
      description: 'meta[name="description"]',
      content: '.content',
    },
    {
      title: { selector: 'h1', attribute: 'textContent' },
      links: { selector: 'a', attribute: 'href', multiple: true },
      images: { selector: 'img', attribute: 'src', multiple: true },
    },
    {
      heading: 'h1, h2, h3',
      paragraphs: { selector: 'p', multiple: true },
      metadata: { selector: 'meta', attribute: 'content', multiple: true },
    },
  ],
};

/**
 * Performance test helpers
 */
export const performanceHelpers = {
  /**
   * Measures execution time of a function
   */
  measureExecutionTime: async <T>(
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    return { result, duration };
  },

  /**
   * Runs a function multiple times and measures average execution time
   */
  measureAverageTime: async <T>(
    fn: () => Promise<T>,
    iterations = 5,
  ): Promise<{ results: T[]; averageDuration: number }> => {
    const results: T[] = [];
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await performanceHelpers.measureExecutionTime(fn);
      results.push(result);
      durations.push(duration);
    }

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

    return { results, averageDuration };
  },

  /**
   * Creates a timeout promise for testing slow operations
   */
  createTimeout: (ms: number) =>
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
};

/**
 * Mock setup helpers
 */
export const mockHelpers = {
  /**
   * Sets up standard scraping environment mocks
   */
  setupScrapingMocks: () => {
    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue(createMockFetchResponse());
    vi.stubGlobal('fetch', mockFetch);

    // Mock performance for timing tests
    const mockPerformance = {
      now: vi.fn().mockReturnValue(Date.now()),
    };
    vi.stubGlobal('performance', mockPerformance);

    return { mockFetch, mockPerformance };
  },

  /**
   * Sets up Playwright mocks
   */
  setupPlaywrightMocks: () => {
    const mockPage = createMockBrowserPage();
    const mockBrowser = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      close: vi.fn().mockResolvedValue(null),
    };
    const mockChromium = {
      launch: vi.fn().mockResolvedValue(mockBrowser),
    };

    vi.doMock('playwright', () => ({
      chromium: mockChromium,
    }));

    return { mockChromium, mockBrowser, mockPage };
  },

  /**
   * Sets up Cheerio mocks
   */
  setupCheerioMocks: () => {
    const mockCheerio = createMockCheerio();

    vi.doMock('cheerio', () => ({
      load: mockCheerio.load,
      default: mockCheerio,
    }));

    return { mockCheerio };
  },

  /**
   * Resets all mocks to their default state
   */
  resetAllMocks: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  },
};

/**
 * Error testing helpers
 */
export const errorHelpers = {
  /**
   * Creates common error scenarios for testing
   */
  createErrorScenarios: () => [
    {
      name: 'Network Error',
      error: new Error('Network request failed'),
      expectedMessage: 'Network request failed',
    },
    {
      name: 'Timeout Error',
      error: new Error('Request timeout'),
      expectedMessage: 'timeout',
    },
    {
      name: 'Invalid URL Error',
      error: new Error('Invalid URL'),
      expectedMessage: 'Invalid URL',
    },
    {
      name: 'Parse Error',
      error: new Error('Failed to parse response'),
      expectedMessage: 'parse',
    },
  ],

  /**
   * Tests error handling for a given function
   */
  testErrorHandling: async (fn: Function, errorScenarios: any[]) => {
    for (const scenario of errorScenarios) {
      try {
        await fn();
        // If we get here, the function didn't throw as expected
        throw new Error(`Expected ${scenario.name} to throw an error`);
      } catch (error) {
        expect((error as Error).message).toContain(scenario.expectedMessage);
      }
    }
  },
};
