import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Playwright
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
};

const mockContext = {
  newPage: vi.fn(() => mockPage),
  close: vi.fn(),
  cookies: vi.fn(),
  addCookies: vi.fn(),
};

const mockBrowser = {
  newContext: vi.fn(() => mockContext),
  close: vi.fn(),
  contexts: vi.fn(() => [mockContext]),
};

const mockPlaywright = {
  chromium: {
    launch: vi.fn(() => mockBrowser),
  },
  firefox: {
    launch: vi.fn(() => mockBrowser),
  },
  webkit: {
    launch: vi.fn(() => mockBrowser),
  },
};

vi.mock('playwright', () => mockPlaywright);

import { PlaywrightProvider } from '../../../server/providers/playwright-provider';

describe('PlaywrightProvider', () => {
  let provider: PlaywrightProvider;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPage.goto.mockResolvedValue(null);
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
    await provider.dispose();
  });

  describe('initialization', () => {
    it('should create provider with default options', () => {
      const defaultProvider = new PlaywrightProvider();
      expect(defaultProvider).toBeDefined();
    });

    it('should create provider with custom browser type', async () => {
      const firefoxProvider = new PlaywrightProvider();
      await firefoxProvider.initialize({
        options: {
          browser: 'firefox',
        },
      });
      expect(firefoxProvider).toBeDefined();
    });

    it('should handle browser launch options', async () => {
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
    it('should scrape a URL successfully', async () => {
      const result = await provider.scrape('https://example.com');

      expect(result).toMatchObject({
        url: 'https://example.com',
        html: '<html><body>Test content</body></html>',
        provider: 'playwright',
        metadata: expect.objectContaining({
          statusCode: 200,
        }),
      });

      expect(mockBrowser.newContext).toHaveBeenCalled();
      expect(mockContext.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith('https://example.com', {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
      expect(mockPage.content).toHaveBeenCalled();
    });

    it('should wait for selector if specified', async () => {
      await provider.scrape('https://example.com', {
        waitForSelector: '.content' as any,
      });

      expect(mockPage.waitForSelector).toHaveBeenCalledWith('.content', {
        timeout: 30000,
      });
    });

    it('should execute JavaScript if provided', async () => {
      mockPage.evaluate.mockResolvedValue({ data: 'extracted' });

      await provider.scrape('https://example.com', {
        executeScript: (() => ({ data: 'extracted' })) as any,
      });

      expect(mockPage.evaluate).toHaveBeenCalled();
    });

    it('should handle viewport settings', async () => {
      await provider.scrape('https://example.com', {
        viewport: { width: 1920, height: 1080 },
      });

      expect(mockPage.setViewportSize).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
      });
    });

    it('should handle custom headers', async () => {
      await provider.scrape('https://example.com', {
        headers: {
          'User-Agent': 'Custom Agent',
          'Accept-Language': 'en-US',
        },
      });

      expect(mockPage.setExtraHTTPHeaders).toHaveBeenCalledWith({
        'User-Agent': 'Custom Agent',
        'Accept-Language': 'en-US',
      });
    });

    it('should handle cookies', async () => {
      await provider.scrape('https://example.com', {
        cookies: [{ name: 'session', value: 'abc123', domain: 'example.com', path: '/' }],
      });

      expect(mockContext.addCookies).toHaveBeenCalledWith([
        { name: 'session', value: 'abc123', domain: 'example.com', path: '/' },
      ]);
    });

    it('should handle screenshot capture', async () => {
      mockPage.screenshot.mockResolvedValue(Buffer.from('image data'));

      const result = await provider.scrape('https://example.com', {
        screenshot: true,
      });

      expect(mockPage.screenshot).toHaveBeenCalledWith({
        fullPage: true,
      });
      expect(result.screenshot).toBeDefined();
    });

    it('should handle PDF generation', async () => {
      mockPage.pdf.mockResolvedValue(Buffer.from('pdf data'));

      const result = await provider.scrape('https://example.com', {
        pdf: true,
      });

      expect(mockPage.pdf).toHaveBeenCalledWith({
        format: 'A4',
      });
      expect(result.pdf).toBeDefined();
    });

    it('should handle navigation errors', async () => {
      mockPage.goto.mockRejectedValue(new Error('Navigation failed'));

      await expect(provider.scrape('https://example.com')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockPage.goto.mockRejectedValue(new Error('Timeout exceeded'));

      await expect(provider.scrape('https://example.com')).rejects.toThrow('Timeout');
    });
  });


  describe('browser management', () => {
    it('should launch browser on first use', async () => {
      await provider.scrape('https://example.com');

      expect(mockPlaywright.chromium.launch).toHaveBeenCalledWith({
        headless: true,
      });
    });

    it('should reuse browser for multiple requests', async () => {
      await provider.scrape('https://example1.com');
      await provider.scrape('https://example2.com');

      expect(mockPlaywright.chromium.launch).toHaveBeenCalledTimes(1);
    });

    it('should launch different browser types', async () => {
      const firefoxProvider = new PlaywrightProvider();
      await firefoxProvider.initialize({
        options: {
          browser: 'firefox',
        },
      });
      await firefoxProvider.scrape('https://example.com');

      expect(mockPlaywright.firefox.launch).toHaveBeenCalled();

      await firefoxProvider.dispose();
    });

    it('should handle browser crashes', async () => {
      // First request succeeds
      await provider.scrape('https://example.com');

      // Simulate browser crash
      mockBrowser.contexts.mockReturnValue([]);
      mockPlaywright.chromium.launch.mockResolvedValueOnce(mockBrowser);

      // Should relaunch browser
      await provider.scrape('https://example.com');

      expect(mockPlaywright.chromium.launch).toHaveBeenCalledTimes(2);
    });
  });

  describe('dispose', () => {
    it('should close browser on dispose', async () => {
      await provider.scrape('https://example.com');
      await provider.dispose();

      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should handle dispose without browser', async () => {
      // Dispose without scraping
      await expect(provider.dispose()).resolves.not.toThrow();
    });

    it('should handle multiple dispose calls', async () => {
      await provider.scrape('https://example.com');
      await provider.dispose();
      await provider.dispose();

      expect(mockBrowser.close).toHaveBeenCalledTimes(1);
    });
  });

  describe('advanced features', () => {
    it('should handle cookies', async () => {
      await provider.scrape('https://example.com', {
        cookies: [
          { name: 'session', value: 'abc123' },
        ],
      });

      expect(mockContext.addCookies).toHaveBeenCalled();
    });

    it('should handle proxy settings', async () => {
      await provider.scrape('https://example.com', {
        proxy: {
          server: 'http://proxy.example.com:8080',
          username: 'user',
          password: 'pass',
        },
      });

      expect(mockContext.newPage).toHaveBeenCalled();
    });

    it('should handle proxy settings', async () => {
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

      await proxyProvider.scrape('https://example.com');

      expect(mockBrowser.newContext).toHaveBeenCalledWith(
        expect.objectContaining({
          proxy: {
            server: 'http://proxy.example.com:8080',
            username: 'proxyuser',
            password: 'proxypass',
          },
        }),
      );

      await proxyProvider.dispose();
    });
  });
});
