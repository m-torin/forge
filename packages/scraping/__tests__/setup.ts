import { ProviderRegistry } from '#/shared/types/scraping-types';
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';
import { createMockProvider } from './scraping-test-factory';

// Import centralized mocks from @repo/qa (when available)
// TODO: Re-enable when @repo/qa exports are built
// import '@repo/qa/vitest/mocks/providers/playwright';

// Mock console methods for cleaner test output
const originalConsole = console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Mock Playwright completely
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue({ status: () => 200 }),
          content: vi.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
          title: vi.fn().mockResolvedValue('Mock Title'),
          close: vi.fn().mockResolvedValue(undefined),
          waitForSelector: vi.fn().mockResolvedValue({}),
          $: vi.fn().mockResolvedValue(null),
          $$: vi.fn().mockResolvedValue([]),
          screenshot: vi.fn().mockResolvedValue(Buffer.from('mock screenshot')),
          setViewportSize: vi.fn().mockResolvedValue(undefined),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
  firefox: {
    launch: vi.fn().mockImplementation(() => ({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue({ status: () => 200 }),
          content: vi.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
          title: vi.fn().mockResolvedValue('Mock Title'),
          close: vi.fn().mockResolvedValue(undefined),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    })),
  },
  webkit: {
    launch: vi.fn().mockImplementation(() => ({
      newContext: vi.fn().mockResolvedValue({
        newPage: vi.fn().mockResolvedValue({
          goto: vi.fn().mockResolvedValue({ status: () => 200 }),
          content: vi.fn().mockResolvedValue('<html><body>Mock content</body></html>'),
          title: vi.fn().mockResolvedValue('Mock Title'),
          close: vi.fn().mockResolvedValue(undefined),
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock Cheerio
vi.mock('cheerio', () => ({
  load: vi.fn().mockImplementation((html: string) => {
    const mockCheerio = (selector: string) => ({
      text: vi.fn().mockReturnValue('Mock text'),
      html: vi.fn().mockReturnValue('<span>Mock HTML</span>'),
      attr: vi.fn().mockReturnValue('mock-attribute'),
      length: 1,
      get: vi.fn().mockReturnValue([{ tagName: 'div', textContent: 'Mock element' }]),
      map: vi.fn().mockImplementation((fn: any) => [fn(0, { textContent: 'Mock item' })]),
    });
    return mockCheerio;
  }),
}));

// Mock global fetch for FetchProvider
vi.spyOn(global, 'fetch').mockImplementation((url: string | URL | Request) => {
  const urlString = typeof url === 'string' ? url : url.toString();
  if (urlString.includes('error')) {
    return Promise.reject(new Error('Network error'));
  }
  if (urlString.includes('404')) {
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve(''),
      headers: new Headers(),
      redirected: false,
      type: 'basic' as ResponseType,
      url: urlString,
      json: () => Promise.resolve({}),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      bytes: () => Promise.resolve(new Uint8Array()),
      clone: () => new Response(),
      body: null,
      bodyUsed: false,
    } as Response);
  }
  return Promise.resolve(
    new Response('<html><body>Fetch content</body></html>', {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'text/html' },
    }),
  );
});

// Mock browser environment detection
export const setupBrowserMocks = () => {
  Object.defineProperty(global, 'window', {
    value: {
      location: { href: 'https://example.com' },
      navigator: { userAgent: 'Mozilla/5.0 (Test Browser)' },
      document: {
        createElement: vi.fn().mockReturnValue({}),
        querySelector: vi.fn().mockReturnValue({}),
      },
    },
    writable: true,
  });

  Object.defineProperty(global, 'document', {
    value: {
      createElement: vi.fn().mockReturnValue({}),
      querySelector: vi.fn().mockReturnValue({}),
      querySelectorAll: vi.fn().mockReturnValue([]),
    },
    writable: true,
  });
};

// Mock Node.js environment
export const setupNodeMocks = () => {
  delete (global as any).window;
  delete (global as any).document;
};

// Common scraping test configuration
export const createScrapingTestConfig = (overrides: any = {}) => ({
  providers: {
    playwright: {
      enabled: true,
      headless: true,
      timeout: 30000,
      ...overrides.playwright,
    },
    fetch: {
      enabled: true,
      timeout: 10000,
      ...overrides.fetch,
    },
    cheerio: {
      enabled: true,
      ...overrides.cheerio,
    },
    ...overrides.providers,
  },
  extraction: {
    defaultSelectors: {
      title: 'h1, h2, title',
      content: 'p, .content, article',
      links: 'a[href]',
      images: 'img[src]',
    },
    timeout: 30000,
    ...overrides.extraction,
  },
  options: {
    concurrent: false,
    retries: 1,
    delay: 0,
    ...overrides.options,
  },
  ...overrides,
});

// Common scraper manager creation patterns
export const createTestScrapingManager = async (config = createScrapingTestConfig()) => {
  const { createScrapingManager } = await import('#/shared/utils/scraping-manager');
  const mockProviderRegistry: ProviderRegistry = {
    playwright: () => createMockProvider('playwright'),
    fetch: () => createMockProvider('fetch'),
  };
  return createScrapingManager(config, mockProviderRegistry);
};

export const createTestPlaywrightProvider = async () => {
  return createMockProvider('playwright');
};

export const createTestFetchProvider = async () => {
  return createMockProvider('fetch');
};

// Export test factories and generators
export * from './scraping-mocks';
export * from './scraping-test-data';
export * from './scraping-test-factory';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  setupBrowserMocks();
});
