/**
 * Browser testing helper utilities for Vitest
 * Provides cross-browser compatibility and enhanced testing utilities
 */

import { vi } from 'vitest';

// Try to import browser context, fallback to null if not available
let page: any = null;
let userEvent: any = null;

// Initialize with null values
page = null;
userEvent = null;

// Try to load browser context dynamically
if (typeof window !== 'undefined' || process.env.VITEST_BROWSER) {
  try {
    // This will only work in browser testing environments
    Promise.resolve()
      .then(async () => {
        const browserContext = await import('@vitest/browser' + '/context');
        page = browserContext.page;
        userEvent = browserContext.userEvent;
      })
      .catch(() => {
        // Silently fail for non-browser environments
      });
  } catch {
    // Fallback for non-browser environments
  }
}

// Browser detection utilities
const browserDetection = {
  /**
   * Check if running in browser mode
   */
  isBrowserMode(): boolean {
    return !!page && typeof window !== 'undefined';
  },

  /**
   * Check if running in Node.js environment
   */
  isNodeMode(): boolean {
    return !this.isBrowserMode();
  },

  /**
   * Get current browser provider
   */
  getProvider(): 'playwright' | 'webdriverio' | 'unknown' {
    if (typeof process !== 'undefined' && process.env.VITEST_BROWSER_PROVIDER) {
      return process.env.VITEST_BROWSER_PROVIDER as 'playwright' | 'webdriverio';
    }
    return 'unknown';
  },

  /**
   * Check if using Playwright
   */
  isPlaywright(): boolean {
    return this.getProvider() === 'playwright';
  },

  /**
   * Check if using WebDriverIO
   */
  isWebdriverio(): boolean {
    return this.getProvider() === 'webdriverio';
  },
};

// Element interaction utilities
const elementInteraction = {
  /**
   * Wait for element to be present in DOM
   */
  async waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
    if (page?.waitForSelector) {
      return await page.waitForSelector(selector, { timeout });
    }

    // Fallback implementation
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  },

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string, timeout = 5000): Promise<Element | null> {
    const element = await this.waitForElement(selector, timeout);

    if (!element) return null;

    if (page?.waitForFunction) {
      await page.waitForFunction(
        (sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          return el && el.offsetWidth > 0 && el.offsetHeight > 0;
        },
        [selector],
        { timeout },
      );
    } else {
      // Fallback for jsdom
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const currentElement = document.querySelector(selector);
        if (currentElement && (currentElement as HTMLElement).offsetWidth > 0) {
          return currentElement;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return element;
  },

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string, timeout = 5000): Promise<boolean> {
    if (page?.waitForFunction) {
      await page.waitForFunction(
        (sel: string) => {
          const el = document.querySelector(sel) as HTMLElement;
          return !el || el.offsetWidth === 0 || el.offsetHeight === 0;
        },
        [selector],
        { timeout },
      );
      return true;
    }

    // Fallback for jsdom
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (!element || (element as HTMLElement).offsetWidth === 0) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
  },

  /**
   * Wait for text to appear in document
   */
  async waitForText(text: string, timeout = 5000): Promise<boolean> {
    if (page?.waitForFunction) {
      await page.waitForFunction(
        (searchText: string) => {
          return document.body.textContent?.includes(searchText);
        },
        [text],
        { timeout },
      );
      return true;
    }

    // Fallback for jsdom
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (document.body.textContent?.includes(text)) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return false;
  },

  /**
   * Safe click with error handling
   */
  async safeClick(selector: string, options: { timeout?: number } = {}): Promise<boolean> {
    try {
      const element = await this.waitForVisible(selector, options.timeout);
      if (!element) return false;

      if (userEvent) {
        await userEvent.click(element);
      } else {
        (element as HTMLElement).click();
      }

      return true;
    } catch (error) {
      console.warn(`Failed to click element "${selector}":`, error);
      return false;
    }
  },

  /**
   * Safe type with error handling
   */
  async safeType(
    selector: string,
    text: string,
    options: { timeout?: number; clear?: boolean } = {},
  ): Promise<boolean> {
    try {
      const element = await this.waitForVisible(selector, options.timeout);
      if (!element) return false;

      if (options.clear) {
        (element as HTMLInputElement).value = '';
      }

      if (userEvent) {
        await userEvent.type(element, text);
      } else {
        (element as HTMLInputElement).value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }

      return true;
    } catch (error) {
      console.warn(`Failed to type in element "${selector}":`, error);
      return false;
    }
  },

  /**
   * Get element text content
   */
  async getTextContent(selector: string, timeout = 5000): Promise<string | null> {
    const element = await this.waitForElement(selector, timeout);
    return element?.textContent || null;
  },

  /**
   * Get element attribute
   */
  async getAttribute(selector: string, attribute: string, timeout = 5000): Promise<string | null> {
    const element = await this.waitForElement(selector, timeout);
    return element?.getAttribute(attribute) || null;
  },

  /**
   * Get computed style property
   */
  async getComputedStyle(
    selector: string,
    property: string,
    timeout = 5000,
  ): Promise<string | null> {
    const element = await this.waitForElement(selector, timeout);

    if (!element) return null;

    if (page?.evaluate) {
      return await page.evaluate(
        ({ sel, prop }: { sel: string; prop: string }) => {
          const el = document.querySelector(sel);
          return el ? window.getComputedStyle(el).getPropertyValue(prop) : null;
        },
        { sel: selector, prop: property },
      );
    }

    // Fallback for jsdom
    if (typeof window !== 'undefined') {
      return window.getComputedStyle(element as Element).getPropertyValue(property);
    }

    return null;
  },
};

// Screenshot utilities
const screenshotUtils = {
  /**
   * Take a screenshot of the current page
   */
  async takeScreenshot(name?: string): Promise<Buffer | null> {
    if (page?.screenshot) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = name ? `${name}-${timestamp}.png` : `screenshot-${timestamp}.png`;
      return await page.screenshot({ path: `./test-results/screenshots/${filename}` });
    }

    console.warn('Screenshot not available - not in browser mode');
    return null;
  },

  /**
   * Take a screenshot of a specific element
   */
  async takeElementScreenshot(selector: string, name?: string): Promise<Buffer | null> {
    const element = await elementInteraction.waitForElement(selector);

    if (!element || !page?.screenshot) {
      console.warn('Element screenshot not available');
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = name ? `${name}-element-${timestamp}.png` : `element-${timestamp}.png`;

    if (page.locator) {
      return await page
        .locator(selector)
        .screenshot({ path: `./test-results/screenshots/${filename}` });
    }

    return null;
  },

  /**
   * Take a full page screenshot
   */
  async takeFullPageScreenshot(name?: string): Promise<Buffer | null> {
    if (page?.screenshot) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = name ? `${name}-fullpage-${timestamp}.png` : `fullpage-${timestamp}.png`;
      return await page.screenshot({
        path: `./test-results/screenshots/${filename}`,
        fullPage: true,
      });
    }

    console.warn('Full page screenshot not available - not in browser mode');
    return null;
  },
};

// Browser state utilities
const browserState = {
  /**
   * Clear browser storage
   */
  async clearStorage(): Promise<void> {
    if (page?.evaluate) {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } else if (typeof window !== 'undefined') {
      window.localStorage.clear();
      window.sessionStorage.clear();
    }
  },

  /**
   * Set localStorage item
   */
  async setLocalStorage(key: string, value: string): Promise<void> {
    if (page?.evaluate) {
      await page.evaluate(
        ({ k, v }: { k: string; v: string }) => {
          localStorage.setItem(k, v);
        },
        { k: key, v: value },
      );
    } else if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },

  /**
   * Get localStorage item
   */
  async getLocalStorage(key: string): Promise<string | null> {
    if (page?.evaluate) {
      return await page.evaluate((k: string) => {
        return localStorage.getItem(k);
      }, key);
    } else if (typeof window !== 'undefined') {
      return window.localStorage.getItem(key);
    }

    return null;
  },

  /**
   * Set sessionStorage item
   */
  async setSessionStorage(key: string, value: string): Promise<void> {
    if (page?.evaluate) {
      await page.evaluate(
        ({ k, v }: { k: string; v: string }) => {
          sessionStorage.setItem(k, v);
        },
        { k: key, v: value },
      );
    } else if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(key, value);
    }
  },

  /**
   * Get sessionStorage item
   */
  async getSessionStorage(key: string): Promise<string | null> {
    if (page?.evaluate) {
      return await page.evaluate((k: string) => {
        return sessionStorage.getItem(k);
      }, key);
    } else if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(key);
    }

    return null;
  },

  /**
   * Clear all cookies
   */
  async clearCookies(): Promise<void> {
    if (page?.evaluate) {
      await page.evaluate(() => {
        document.cookie.split(';').forEach((cookie: string) => {
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
      });
    }
  },

  /**
   * Set a cookie
   */
  async setCookie(
    name: string,
    value: string,
    options: { path?: string; domain?: string; expires?: string } = {},
  ): Promise<void> {
    const cookieString = `${name}=${value}${options.path ? `; path=${options.path}` : ''}${options.domain ? `; domain=${options.domain}` : ''}${options.expires ? `; expires=${options.expires}` : ''}`;

    if (page?.evaluate) {
      await page.evaluate((cookie: string) => {
        document.cookie = cookie;
      }, cookieString);
    } else if (typeof document !== 'undefined') {
      document.cookie = cookieString;
    }
  },

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    if (page?.url) {
      return await page.url();
    } else if (typeof window !== 'undefined') {
      return window.location.href;
    }

    return '';
  },

  /**
   * Navigate to URL
   */
  async navigateTo(url: string): Promise<void> {
    if (page?.goto) {
      await page.goto(url);
    } else if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    if (page?.reload) {
      await page.reload();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },

  /**
   * Go back in history
   */
  async goBack(): Promise<void> {
    if (page?.goBack) {
      await page.goBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  },

  /**
   * Go forward in history
   */
  async goForward(): Promise<void> {
    if (page?.goForward) {
      await page.goForward();
    } else if (typeof window !== 'undefined') {
      window.history.forward();
    }
  },
};

// Mock utilities for browser testing
const browserMocks = {
  /**
   * Mock console methods
   */
  mockConsole() {
    return {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    };
  },

  /**
   * Mock window.alert
   */
  mockAlert() {
    return vi.spyOn(window, 'alert').mockImplementation(() => {});
  },

  /**
   * Mock window.confirm
   */
  mockConfirm(returnValue = true) {
    return vi.spyOn(window, 'confirm').mockImplementation(() => returnValue);
  },

  /**
   * Mock window.prompt
   */
  mockPrompt(returnValue = '') {
    return vi.spyOn(window, 'prompt').mockImplementation(() => returnValue);
  },

  /**
   * Mock fetch
   */
  mockFetch(mockResponse: any) {
    return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  },

  /**
   * Mock geolocation
   */
  mockGeolocation(coords: { latitude: number; longitude: number }) {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation(success => {
        success({
          coords: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    return mockGeolocation;
  },

  /**
   * Mock clipboard
   */
  mockClipboard() {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
      write: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue([]),
    };

    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    return mockClipboard;
  },

  /**
   * Restore all mocks
   */
  restoreAllMocks() {
    vi.restoreAllMocks();
  },
};

// Accessibility testing utilities
const accessibilityUtils = {
  /**
   * Check if element has accessible name
   */
  async hasAccessibleName(selector: string): Promise<boolean> {
    const element = await elementInteraction.waitForElement(selector);
    if (!element) return false;

    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const title = element.getAttribute('title');
    const alt = element.getAttribute('alt');

    return !!(ariaLabel || ariaLabelledBy || title || alt || element.textContent?.trim());
  },

  /**
   * Check if element has proper ARIA attributes
   */
  async hasProperAria(selector: string): Promise<{ valid: boolean; issues: string[] }> {
    const element = await elementInteraction.waitForElement(selector);
    if (!element) return { valid: false, issues: ['Element not found'] };

    const issues: string[] = [];

    // Check for required ARIA attributes based on role
    const role = element.getAttribute('role');
    if (role) {
      switch (role) {
        case 'button':
          if (!(await this.hasAccessibleName(selector))) {
            issues.push('Button must have accessible name');
          }
          break;
        case 'textbox':
          if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
            issues.push('Textbox must have aria-label or aria-labelledby');
          }
          break;
        case 'checkbox':
          if (!element.hasAttribute('aria-checked')) {
            issues.push('Checkbox must have aria-checked attribute');
          }
          break;
      }
    }

    return { valid: issues.length === 0, issues };
  },

  /**
   * Check if element is keyboard accessible
   */
  async isKeyboardAccessible(selector: string): Promise<boolean> {
    const element = await elementInteraction.waitForElement(selector);
    if (!element) return false;

    const tabIndex = element.getAttribute('tabindex');
    const tagName = element.tagName.toLowerCase();

    // Interactive elements are naturally keyboard accessible
    const interactiveElements = ['button', 'input', 'textarea', 'select', 'a'];
    if (interactiveElements.includes(tagName)) {
      return tabIndex !== '-1';
    }

    // Non-interactive elements need tabindex to be keyboard accessible
    if (element.hasAttribute('onclick') || element.hasAttribute('onkeydown')) {
      return tabIndex !== null && tabIndex !== '-1';
    }

    return false;
  },
};

// Export all utilities
export const browserHelpers = {
  browserDetection,
  elementInteraction,
  screenshotUtils,
  browserState,
  browserMocks,
  accessibilityUtils,
};

// Export individual utilities for convenience
export {
  accessibilityUtils,
  browserDetection,
  browserMocks,
  browserState,
  elementInteraction,
  screenshotUtils,
};

// Export default
export default browserHelpers;
