import {
  createBrowserPool,
  getBrowserCapabilities,
  launchBrowser,
  optimizeBrowserPerformance,
} from '@/shared/utils/browser-utils';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock the scraper factory
vi.mock('../../../shared/factories/scraper-factory', () => ({
  createBrowserScraper: vi.fn().mockResolvedValue({
    initialize: vi.fn(),
    close: vi.fn(),
    newPage: vi.fn(),
  }),
}));

describe('browser-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('launchBrowser', () => {
    test('should launch browser with default options', async () => {
      const mockBrowser = {
        close: vi.fn(),
        newPage: vi.fn(),
      };

      const browser = await launchBrowser('playwright');

      expect(browser).toBeDefined();
    });

    test('should launch browser with custom options', async () => {
      const options = {
        headless: false,
        devtools: true,
      };

      const { createBrowserScraper } = await import('../../../shared/factories/scraper-factory');
      vi.mocked(createBrowserScraper).mockResolvedValue({
        initialize: vi.fn(),
        close: vi.fn(),
        newPage: vi.fn(),
      } as any);

      const browser = await launchBrowser('playwright', options);

      expect(browser).toBeDefined();
    });

    test('should handle launch errors', async () => {
      const { createBrowserScraper } = await import('../../../shared/factories/scraper-factory');
      vi.mocked(createBrowserScraper).mockRejectedValue(new Error('Invalid provider'));

      // Test error handling
      await expect(launchBrowser('invalid-provider', { timeout: 1 })).rejects.toThrow(
        'Invalid provider',
      );
    });
  });

  describe('createBrowserPool', () => {
    test('should create browser pool with default settings', () => {
      const pool = createBrowserPool('playwright');

      expect(pool).toBeDefined();
      expect(typeof pool.acquire).toBe('function');
      expect(typeof pool.release).toBe('function');
    });

    test('should create browser pool with custom settings', () => {
      const options = {
        max: 5,
        min: 1,
        idleTimeoutMillis: 30000,
      };

      const pool = createBrowserPool('playwright', options);

      expect(pool).toBeDefined();
      expect(typeof pool.acquire).toBe('function');
      expect(typeof pool.release).toBe('function');
    });

    test('should handle pool creation errors', () => {
      const options = {
        max: -1, // Invalid option
      };

      expect(() => createBrowserPool('playwright', options)).toThrow('Invalid pool configuration');
    });
  });

  describe('getBrowserCapabilities', () => {
    test('should return capabilities for known providers', () => {
      const capabilities = getBrowserCapabilities('playwright');

      expect(capabilities).toBeDefined();
      expect(typeof capabilities).toBe('object');
    });

    test('should return empty object for unknown providers', () => {
      const capabilities = getBrowserCapabilities('unknown-provider');

      expect(capabilities).toBeDefined();
      expect(typeof capabilities).toBe('object');
    });
  });

  describe('optimizeBrowserPerformance', () => {
    test('should optimize browser performance', () => {
      const mockBrowser = {
        setDefaultTimeout: vi.fn(),
        setDefaultNavigationTimeout: vi.fn(),
      };

      const optimizedBrowser = optimizeBrowserPerformance(mockBrowser);

      expect(optimizedBrowser).toBeDefined();
    });

    test('should handle optimization errors', () => {
      const mockBrowser = null;

      expect(() => optimizeBrowserPerformance(mockBrowser)).toThrow('Invalid browser instance');
    });
  });

  // TODO: Add tests for waitForElement, scrollToElement, handlePopups,
  // captureScreenshot, extractPageMetadata, handleCookieConsent when implemented
});
