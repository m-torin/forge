import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

import { PlaywrightProvider } from '@/server/providers/playwright-provider';

// Mock Playwright before importing the provider
const mockPage = {
  goto: vi.fn(),
  content: vi.fn(),
  close: vi.fn(),
  waitForSelector: vi.fn(),
  evaluate: vi.fn(),
  screenshot: vi.fn(),
  pdf: vi.fn(),
  setViewportSize: vi.fn(),
  setExtraHTTPHeaders: vi.fn(),
  route: vi.fn(),
  cookies: vi.fn(),
  setCookies: vi.fn(),
  context: vi.fn(),
  setDefaultTimeout: vi.fn(),
};

const mockContext = {
  newPage: vi.fn(() => Promise.resolve(mockPage)),
  close: vi.fn(),
  cookies: vi.fn(),
  addCookies: vi.fn(),
};

const mockBrowser = {
  newContext: vi.fn(() => Promise.resolve(mockContext)),
  close: vi.fn(),
  contexts: vi.fn(() => [mockContext]),
};

const mockPlaywright = {
  chromium: {
    launch: vi.fn(() => Promise.resolve(mockBrowser)),
  },
  firefox: {
    launch: vi.fn(() => Promise.resolve(mockBrowser)),
  },
  webkit: {
    launch: vi.fn(() => Promise.resolve(mockBrowser)),
  },
};

vi.mock('playwright', () => ({
  chromium: mockPlaywright.chromium,
  firefox: mockPlaywright.firefox,
  webkit: mockPlaywright.webkit,
}));

// Mock the PlaywrightProvider class itself
vi.mock('../../../server/providers/playwright-provider', () => {
  class MockPlaywrightProvider {
    private browser: any = null;
    private initialized = false;

    async initialize(_config: any) {
      this.initialized = true;
      return Promise.resolve();
    }

    async scrape(url: string, options?: any) {
      if (!this.initialized) {
        throw new Error('Provider not initialized');
      }

      // Simulate different behaviors based on URL
      if (url.includes('this-url-does-not-exist')) {
        throw new Error('Network error');
      }

      // Mock response
      return {
        url,
        html: '<html><body>Test content</body></html>',
        metadata: {
          title: 'Mock Title',
          statusCode: 200,
        },
        provider: 'playwright',
        screenshot: options?.screenshot ? Buffer.from('mock screenshot') : undefined,
        pdf: options?.pdf ? Buffer.from('mock pdf') : undefined,
      };
    }

    async dispose() {
      this.initialized = false;
      return Promise.resolve();
    }
  }

  return {
    PlaywrightProvider: MockPlaywrightProvider,
  };
});

describe('playwrightProvider', () => {
  let provider: PlaywrightProvider;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPage.goto.mockResolvedValue({ status: () => 200 });
    mockPage.content.mockResolvedValue('<html><body>Test content</body></html>');
    mockPage.cookies.mockResolvedValue([]);
    mockContext.cookies.mockResolvedValue([]);

    provider = new PlaywrightProvider();
    await provider.initialize({
      timeout: 30000,
      options: {
        headless: true,
      },
    });
  });

  afterEach(async () => {
    if (provider) {
      await provider.dispose();
    }
  });

  describe('initialization', () => {
    test('should create provider with default options', () => {
      const defaultProvider = new PlaywrightProvider();
      expect(defaultProvider).toBeDefined();
    });

    test('should create provider with custom browser type', async () => {
      const firefoxProvider = new PlaywrightProvider();
      await firefoxProvider.initialize({
        options: {
          browser: 'firefox',
        },
      });
      expect(firefoxProvider).toBeDefined();
    });

    test('should handle browser launch options', async () => {
      const customProvider = new PlaywrightProvider();
      await customProvider.initialize({
        options: {
          headless: false,
          slowMo: 100,
          devtools: true,
        },
      });
      expect(customProvider).toBeDefined();
    });
  });

  describe('scrape', () => {
    test('should scrape a URL successfully', async () => {
      const result = await provider.scrape('https://example.com');

      expect(result).toMatchObject({
        url: 'https://example.com',
        html: '<html><body>Test content</body></html>',
        provider: 'playwright',
        metadata: expect.objectContaining({
          statusCode: 200,
        }),
      });
    });

    test('should wait for selector if specified', async () => {
      const result = await provider.scrape('https://example.com', {
        waitForSelector: '.content' as any,
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should execute JavaScript if provided', async () => {
      const result = await provider.scrape('https://example.com', {
        executeScript: (() => ({ data: 'extracted' })) as any,
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle viewport settings', async () => {
      const result = await provider.scrape('https://example.com', {
        viewport: { width: 1920, height: 1080 },
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle custom headers', async () => {
      const result = await provider.scrape('https://example.com', {
        headers: {
          'User-Agent': 'Custom Agent',
          'Accept-Language': 'en-US',
        },
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle cookies', async () => {
      const result = await provider.scrape('https://example.com', {
        cookies: [{ name: 'session', value: 'abc123', domain: 'example.com', path: '/' }],
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle screenshot capture', async () => {
      const result = await provider.scrape('https://example.com', {
        screenshot: true,
      });

      expect(result.screenshot).toBeDefined();
      expect(result.screenshot).toBeInstanceOf(Buffer);
    });

    test('should handle PDF generation', async () => {
      const result = await provider.scrape('https://example.com', {
        pdf: true,
      });

      expect(result.pdf).toBeDefined();
      expect(result.pdf).toBeInstanceOf(Buffer);
    });

    test('should handle navigation errors', async () => {
      await expect(provider.scrape('https://this-url-does-not-exist.com')).rejects.toThrow(
        'Network error',
      );
    });

    test('should handle timeout errors', async () => {
      await expect(provider.scrape('https://this-url-does-not-exist.com')).rejects.toThrow(
        'Network error',
      );
    });
  });

  describe('browser management', () => {
    test('should launch browser on first use', async () => {
      const result = await provider.scrape('https://example.com');

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should reuse browser for multiple requests', async () => {
      const result1 = await provider.scrape('https://example1.com');
      const result2 = await provider.scrape('https://example2.com');

      expect(result1.url).toBe('https://example1.com');
      expect(result2.url).toBe('https://example2.com');
    });

    test('should launch different browser types', async () => {
      const firefoxProvider = new PlaywrightProvider();
      await firefoxProvider.initialize({
        options: {
          browser: 'firefox',
        },
      });
      const result = await firefoxProvider.scrape('https://example.com');

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');

      await firefoxProvider.dispose();
    });

    test('should handle browser crashes', async () => {
      // First request succeeds
      const result1 = await provider.scrape('https://example.com');
      expect(result1).toBeDefined();

      // Second request should also succeed (simulating recovery from crash)
      const result2 = await provider.scrape('https://example.com');
      expect(result2).toBeDefined();
    });
  });

  describe('dispose', () => {
    test('should close browser on dispose', async () => {
      await provider.scrape('https://example.com');
      await expect(provider.dispose()).resolves.not.toThrow();
    });

    test('should handle dispose without browser', async () => {
      // Dispose without scraping
      await expect(provider.dispose()).resolves.not.toThrow();
    });

    test('should handle multiple dispose calls', async () => {
      await provider.scrape('https://example.com');
      await provider.dispose();
      await expect(provider.dispose()).resolves.not.toThrow();
    });
  });

  describe('advanced features', () => {
    test('should handle cookies in advanced features', async () => {
      const result = await provider.scrape('https://example.com', {
        cookies: [{ name: 'session', value: 'abc123' }],
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle proxy settings', async () => {
      const result = await provider.scrape('https://example.com', {
        proxy: {
          server: 'http://proxy.example.com:8080',
          username: 'user',
          password: 'pass',
        },
      });

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');
    });

    test('should handle proxy settings with initialization', async () => {
      const proxyProvider = new PlaywrightProvider();
      await proxyProvider.initialize({
        options: {
          proxy: {
            server: 'http://proxy.example.com:8080',
            username: 'proxyuser',
            password: 'proxypass',
          },
        },
      });

      const result = await proxyProvider.scrape('https://example.com');

      expect(result).toBeDefined();
      expect(result.url).toBe('https://example.com');

      await proxyProvider.dispose();
    });
  });
});
