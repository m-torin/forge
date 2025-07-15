import { expect, type BrowserContext, type Page } from '@playwright/test';

/**
 * Common E2E test patterns and utilities
 */

/**
 * Retry utilities for flaky operations
 */
export class RetryUtils {
  /**
   * Retry an operation with exponential backoff
   */
  static async withBackoff<T>(
    operation: () => Promise<T>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      factor?: number;
    } = {},
  ): Promise<T> {
    const { factor = 2, initialDelay = 1000, maxAttempts = 3, maxDelay = 10000 } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) {
          throw lastError;
        }

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Poll until condition is met
   */
  static async pollUntil<T>(
    condition: () => Promise<T | null>,
    options: {
      timeout?: number;
      interval?: number;
    } = {},
  ): Promise<T> {
    const { interval = 100, timeout = 30000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result !== null) {
        return result;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Polling timeout after ${timeout}ms`);
  }
}

/**
 * Network utilities for intercepting and mocking
 */
export class NetworkUtils {
  constructor(private readonly page: Page) {}

  /**
   * Mock API endpoint
   */
  async mockEndpoint(
    pattern: string | RegExp,
    response: {
      status?: number;
      body?: any;
      headers?: Record<string, string>;
    },
  ) {
    await this.page.route(pattern, route => {
      route.fulfill({
        body: JSON.stringify(response.body || {}),
        headers: {
          'Content-Type': 'application/json',
          ...response.headers,
        },
        status: response.status || 200,
      });
    });
  }

  /**
   * Intercept and log network requests
   */
  async logRequests(filter?: (url: string) => boolean) {
    const requests: {
      url: string;
      method: string;
      headers: Record<string, string>;
      timestamp: number;
    }[] = [];

    this.page.on('request', request => {
      if (!filter || filter(request.url())) {
        requests.push({
          url: request.url(),
          headers: request.headers(),
          method: request.method(),
          timestamp: Date.now(),
        });
      }
    });

    return requests;
  }

  /**
   * Wait for specific network idle state
   */
  async waitForNetworkIdle(_options?: { timeout?: number }) {
    await expect(this.page.locator('body')).toBeVisible();
  }

  /**
   * Block resources by type
   */
  async blockResources(types: ('image' | 'stylesheet' | 'font' | 'script')[]) {
    await this.page.route('**/*', route => {
      if (types.includes(route.request().resourceType() as any)) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }
}

/**
 * Browser context utilities
 */
export class ContextUtils {
  /**
   * Create authenticated context
   */
  static async createAuthenticatedContext(browser: any, authState: any): Promise<BrowserContext> {
    const context = await browser.newContext({
      storageState: authState,
    });
    return context;
  }

  /**
   * Create context with custom permissions
   */
  static async createContextWithPermissions(
    browser: any,
    permissions: string[],
  ): Promise<BrowserContext> {
    const context = await browser.newContext({
      permissions,
    });
    return context;
  }

  /**
   * Create mobile context
   */
  static async createMobileContext(
    browser: any,
    device: 'iPhone 12' | 'Pixel 5' | 'Galaxy S21',
  ): Promise<BrowserContext> {
    const devices = {
      'Galaxy S21': {
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Samsung Galaxy S21)',
        viewport: { width: 360, height: 800 },
      },
      'iPhone 12': {
        deviceScaleFactor: 3,
        hasTouch: true,
        isMobile: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        viewport: { width: 390, height: 844 },
      },
      'Pixel 5': {
        deviceScaleFactor: 2.75,
        hasTouch: true,
        isMobile: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        viewport: { width: 393, height: 851 },
      },
    };

    return browser.newContext(devices[device]);
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceUtils {
  constructor(private readonly page: Page) {}

  /**
   * Measure page load performance
   */
  async measurePageLoad() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    return metrics;
  }

  /**
   * Measure operation duration
   */
  async measureDuration<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await operation();
    const duration = Date.now() - start;
    return { duration, result };
  }

  /**
   * Check for memory leaks
   */
  async checkMemoryUsage() {
    return this.page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  }
}

/**
 * Multi-tab testing utilities
 */
export class MultiTabUtils {
  constructor(private readonly context: BrowserContext) {}

  /**
   * Open new tab and return page
   */
  async openNewTab(url?: string): Promise<Page> {
    const page = await this.context.newPage();
    if (url) {
      await page.goto(url);
    }
    return page;
  }

  /**
   * Switch between tabs
   */
  async switchToTab(index: number): Promise<Page> {
    const pages = this.context.pages();
    if (index >= 0 && index < pages.length) {
      await pages[index].bringToFront();
      return pages[index];
    }
    throw new Error(`Tab index ${index} out of range`);
  }

  /**
   * Close all tabs except one
   */
  async closeOtherTabs(keepPage: Page) {
    const pages = this.context.pages();
    for (const page of pages) {
      if (page !== keepPage) {
        await page.close();
      }
    }
  }
}

/**
 * File upload/download utilities
 */
export class FileUtils {
  constructor(private readonly page: Page) {}

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    const fileInput = this.page.locator(selector);
    await fileInput.setInputFiles(filePath);
  }

  /**
   * Download file and return path
   */
  async downloadFile(triggerSelector: string): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click(triggerSelector),
    ]);

    const path = await download.path();
    return path || '';
  }

  /**
   * Wait for download to complete
   */
  async waitForDownload(action: () => Promise<void>) {
    const downloadPromise = this.page.waitForEvent('download');
    await action();
    const download = await downloadPromise;
    await download.saveAs(`./test-downloads/${download.suggestedFilename()}`);
    return download;
  }
}
