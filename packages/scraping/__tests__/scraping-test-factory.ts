/**
 * Test factory functions for scraping tests
 */

import { vi } from 'vitest';

interface TestCase {
  name: string;
  input: any;
  expected: any;
  assertion: (result: any) => void;
}

interface TestSuite {
  name: string;
  cases: TestCase[];
}

interface TestScenario {
  name: string;
  args: any[];
  assertion: (result: any) => void;
  shouldThrow?: boolean;
  errorMessage?: string;
}

interface UtilityTestSuite {
  utilityName: string;
  utilityFunction: (...args: any[]) => any;
  scenarios: TestScenario[];
}

export const createUtilityTestSuite = (suite: UtilityTestSuite) => {
  const { utilityName, utilityFunction, scenarios } = suite;

  describe('Utility: ' + utilityName, () => {
    scenarios.forEach(scenario => {
      test('should ' + scenario.name, async () => {
        if (scenario.shouldThrow) {
          try {
            const result = utilityFunction(...scenario.args);
            // Check if it's a promise
            if (result && typeof result.then === 'function') {
              await expect(result).rejects.toThrow(scenario.errorMessage);
            } else {
              // It should have thrown synchronously, but didn't
              expect.fail('Expected function to throw, but it returned a value');
            }
          } catch (error) {
            // Synchronous throw
            if (scenario.errorMessage) {
              expect((error as Error).message).toBe(scenario.errorMessage);
            } else {
              expect(error).toBeDefined();
            }
          }
        } else {
          const result = utilityFunction(...scenario.args);
          // Check if it's a promise
          if (result && typeof result.then === 'function') {
            const resolvedResult = await result;
            scenario.assertion(resolvedResult);
          } else {
            scenario.assertion(result);
          }
        }
      });
    });
  });
};

export const createMockProvider = (providerName: string, mockImplementation?: any) => {
  const defaultMock = {
    initialize: vi.fn().mockResolvedValue(undefined),
    scrape: vi.fn().mockResolvedValue({
      url: 'https://example.com',
      html: '<html><body>Mock content</body></html>',
      metadata: {
        title: 'Mock Title',
        statusCode: 200,
      },
      provider: providerName,
      data: {
        title: 'Mock Title',
        description: 'Mock description',
      },
    }),
    extract: vi.fn().mockResolvedValue({
      title: 'Mock Title',
      description: 'Mock description',
    }),
  };

  return {
    ...defaultMock,
    ...mockImplementation,
  };
};

export const createMockScrapingManager = (overrides: any = {}) => {
  const defaultMock = {
    scrape: vi.fn().mockResolvedValue({
      url: 'https://example.com',
      html: '<html><body>Mock content</body></html>',
      metadata: {
        title: 'Mock Title',
        statusCode: 200,
      },
      provider: 'mock',
      data: {
        title: 'Mock Title',
        description: 'Mock description',
      },
    }),
    extract: vi.fn().mockResolvedValue({
      title: 'Mock Title',
      description: 'Mock description',
    }),
    getProvider: vi.fn().mockReturnValue(createMockProvider('mock')),
    hasProvider: vi.fn().mockReturnValue(true),
    listProviders: vi.fn().mockReturnValue(['mock']),
  };

  return {
    ...defaultMock,
    ...overrides,
  };
};

export const createTestConfig = (overrides: any = {}) => ({
  providers: {
    'mock-provider': {
      timeout: 5000,
      retries: 3,
    },
  },
  extraction: {
    defaultTimeout: 10000,
    maxRetries: 2,
  },
  options: {
    headless: true,
    userAgent: 'Test User Agent',
  },
  ...overrides,
});

export const createTestUrl = (path: string = '') => {
  const baseUrl = 'https://example.com';
  return path ? `${baseUrl}/${path}` : baseUrl;
};

export const createTestHtml = (content: string = 'Test content') => `
  <html>
    <head>
      <title>Test Page</title>
      <meta name="description" content="Test description">
    </head>
    <body>
      <h1>Test Heading</h1>
      <div class="content">${content}</div>
    </body>
  </html>
`;

export const createTestSelectors = (overrides: any = {}) => ({
  title: 'h1',
  description: { selector: 'meta[name="description"]', attribute: 'content' },
  content: '.content',
  ...overrides,
});
