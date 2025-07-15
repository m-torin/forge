/**
 * Test factory functions for scraping tests
 */

import { vi } from 'vitest';

export interface TestCase {
  name: string;
  input: any;
  expected: any;
  assertion: (result: any) => void;
}

export interface TestSuite {
  name: string;
  cases: TestCase[];
}

export interface TestScenario {
  name: string;
  args: any[];
  assertion: (result: any) => void;
  shouldThrow?: boolean;
  errorMessage?: string;
}

export interface UtilityTestSuite {
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
          await expect(utilityFunction(...scenario.args)).rejects.toThrow(scenario.errorMessage);
        } else {
          const result = await utilityFunction(...scenario.args);
          scenario.assertion(result);
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
