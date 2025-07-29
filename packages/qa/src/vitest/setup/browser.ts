/**
 * Browser testing setup with centralized third-party mocks
 * This file provides consistent browser API mocking across all tests
 * Enhanced with @vitest/browser support
 */

import '@testing-library/jest-dom';
import { setupBrowserMocks as setupBrowserApiMocks } from '../mocks/internal/browser';

// Browser-specific cleanup and setup
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { CONSOLE_PRESETS, setupConsoleSuppression } from '../utils/console';

// Setup browser APIs that are not available in jsdom
setupBrowserApiMocks();

// Browser testing utilities (available when using @vitest/browser)
let page: any;
let userEvent: any;

// Initialize with null values
page = null;
userEvent = null;

// Try to load browser context dynamically
if (typeof window !== 'undefined' || process.env.VITEST_BROWSER) {
  try {
    // This will only work in browser testing environments
    Promise.resolve()
      .then(async () => {
        try {
          const browserContext = await import('@vitest/browser' + '/context');
          page = browserContext.page;
          userEvent = browserContext.userEvent;
        } catch {
          // Module not available, use fallbacks
          page = null;
          userEvent = null;
        }
      })
      .catch(() => {
        // Silently fail for non-browser environments
        page = null;
        userEvent = null;
      });
  } catch {
    // Fallback for non-browser environments
    page = null;
    userEvent = null;
  }
}

// Browser-specific setup
beforeEach(async () => {
  // Wait for page to be ready in browser mode
  if (page) {
    try {
      await page.waitForLoadState?.('domcontentloaded');
    } catch {
      // Ignore if method doesn't exist
    }
  }
});

// Browser-specific cleanup
afterEach(async () => {
  cleanup();
  vi.clearAllMocks();

  // Clear browser state if in browser mode
  if (page && typeof window !== 'undefined') {
    try {
      // Clear localStorage
      await page.evaluate(() => {
        localStorage.clear();
      });

      // Clear sessionStorage
      await page.evaluate(() => {
        sessionStorage.clear();
      });

      // Clear cookies
      await page.evaluate(() => {
        document.cookie.split(';').forEach((cookie: string) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      });
    } catch (error) {
      // Ignore cleanup errors - they might occur if page is already closed
      console.warn('Browser cleanup warning:', error);
    }
  }
});

// Apply browser console suppression
setupConsoleSuppression(CONSOLE_PRESETS.browser);

// Browser-specific environment variables
if (typeof process !== 'undefined' && process.env) {
  process.env.NODE_ENV = 'test';
  process.env.VITEST_BROWSER = page ? 'true' : 'false';
}

// Global browser test utilities
declare global {
  var browserTestUtils: {
    page: typeof page;
    userEvent: typeof userEvent;
    waitForElement: (selector: string, timeout?: number) => Promise<any>;
    waitForText: (text: string, timeout?: number) => Promise<any>;
    screenshot: (name?: string) => Promise<Buffer | null>;
    isBrowserMode: boolean;
  };
}

// Browser test utilities
globalThis.browserTestUtils = {
  page,
  userEvent,
  isBrowserMode: !!page,

  async waitForElement(selector: string, timeout = 5000) {
    if (page?.waitForSelector) {
      return await page.waitForSelector(selector, { timeout });
    }

    // Fallback implementation for jsdom
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Element "${selector}" not found within ${timeout}ms`);
  },

  async waitForText(text: string, timeout = 5000) {
    if (page?.waitForFunction) {
      return await page.waitForFunction(
        (searchText: string) => {
          return document.body.textContent?.includes(searchText);
        },
        [text],
        { timeout },
      );
    }

    // Fallback implementation for jsdom
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (document.body.textContent?.includes(text)) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Text "${text}" not found within ${timeout}ms`);
  },

  async screenshot(name?: string) {
    if (page?.screenshot) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = name ? `${name}-${timestamp}.png` : `screenshot-${timestamp}.png`;
      return await page.screenshot({ path: `./test-results/screenshots/${filename}` });
    }

    console.warn('Screenshot not available - not in browser mode');
    return null;
  },
};

// Additional browser-specific setup
export function setupBrowserMocks() {
  // This function can be called in individual test files if needed
  // for additional browser-specific mock setup
}

// Export browser utilities for tests
export { page, userEvent };
export const { waitForElement, waitForText, screenshot, isBrowserMode } =
  globalThis.browserTestUtils;
export * from '@testing-library/react';
export * from '../utils/test-helpers';
