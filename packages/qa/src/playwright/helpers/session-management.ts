import { expect, type BrowserContext, type Page } from '@playwright/test';

/**
 * Session and cookie management utilities for authentication and state management
 */
export class SessionUtils {
  constructor(private readonly page: Page) {}

  /**
   * Set authentication cookies for a session
   */
  async setAuthCookies(
    cookies: Array<{
      name: string;
      value: string;
      domain?: string;
      path?: string;
      expires?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    }>,
  ) {
    const context = this.page.context();

    const cookiesWithDefaults = cookies.map(cookie => ({
      ...cookie,
      domain: cookie.domain || new URL(this.page.url()).hostname,
      path: cookie.path || '/',
      expires: cookie.expires || Math.floor(Date.now() / 1000) + 3600, // 1 hour default
    }));

    await context.addCookies(cookiesWithDefaults);
  }

  /**
   * Clear all cookies for the current domain
   */
  async clearCookies() {
    const context = this.page.context();
    await context.clearCookies();
  }

  /**
   * Clear specific cookies by name
   */
  async clearCookiesByName(cookieNames: string[]) {
    const context = this.page.context();
    const cookies = await context.cookies();

    const cookiesToClear = cookies.filter(cookie => cookieNames.includes(cookie.name));

    for (const cookie of cookiesToClear) {
      await context.clearCookies({
        name: cookie.name,
        domain: cookie.domain,
      });
    }
  }

  /**
   * Get specific cookie value
   */
  async getCookie(name: string): Promise<string | null> {
    const context = this.page.context();
    const cookies = await context.cookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  /**
   * Verify cookie exists and has expected value
   */
  async verifyCookie(name: string, expectedValue?: string) {
    const cookieValue = await this.getCookie(name);
    expect(cookieValue, `Cookie ${name} should exist`).not.toBeNull();

    if (expectedValue !== undefined) {
      expect(cookieValue, `Cookie ${name} should have expected value`).toBe(expectedValue);
    }
  }

  /**
   * Set session storage item
   */
  async setSessionStorage(key: string, value: string) {
    await this.page.evaluate(
      ({ key, value }) => {
        sessionStorage.setItem(key, value);
      },
      { key, value },
    );
  }

  /**
   * Get session storage item
   */
  async getSessionStorage(key: string): Promise<string | null> {
    return this.page.evaluate(key => sessionStorage.getItem(key), key);
  }

  /**
   * Clear all session storage
   */
  async clearSessionStorage() {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /**
   * Set local storage item
   */
  async setLocalStorage(key: string, value: string) {
    await this.page.evaluate(
      ({ key, value }) => {
        localStorage.setItem(key, value);
      },
      { key, value },
    );
  }

  /**
   * Get local storage item
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return this.page.evaluate(key => localStorage.getItem(key), key);
  }

  /**
   * Clear all local storage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Save current session state (cookies + storage)
   */
  async saveSessionState(): Promise<{
    cookies: any[];
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  }> {
    const context = this.page.context();
    const cookies = await context.cookies();

    const localStorage = await this.page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          storage[key] = window.localStorage.getItem(key) || '';
        }
      }
      return storage;
    });

    const sessionStorage = await this.page.evaluate(() => {
      const storage: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          storage[key] = window.sessionStorage.getItem(key) || '';
        }
      }
      return storage;
    });

    return { cookies, localStorage, sessionStorage };
  }

  /**
   * Restore session state from saved state
   */
  async restoreSessionState(sessionState: {
    cookies: any[];
    localStorage: Record<string, string>;
    sessionStorage: Record<string, string>;
  }) {
    const context = this.page.context();

    // Restore cookies
    await context.addCookies(sessionState.cookies);

    // Restore localStorage
    await this.page.evaluate(storage => {
      Object.entries(storage).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }, sessionState.localStorage);

    // Restore sessionStorage
    await this.page.evaluate(storage => {
      Object.entries(storage).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });
    }, sessionState.sessionStorage);
  }

  /**
   * Create authenticated session with token
   */
  async createAuthenticatedSession(options: {
    token: string;
    tokenType?: 'bearer' | 'jwt' | 'session';
    storageType?: 'cookie' | 'localStorage' | 'sessionStorage';
    cookieName?: string;
    localStorageKey?: string;
  }) {
    const {
      token,
      tokenType = 'bearer',
      storageType = 'cookie',
      cookieName = 'auth-token',
      localStorageKey = 'authToken',
    } = options;

    switch (storageType) {
      case 'cookie':
        await this.setAuthCookies([
          {
            name: cookieName,
            value: token,
            httpOnly: tokenType === 'session',
            secure: true,
            sameSite: 'Lax',
          },
        ]);
        break;

      case 'localStorage':
        await this.setLocalStorage(localStorageKey, token);
        break;

      case 'sessionStorage':
        await this.setSessionStorage(localStorageKey, token);
        break;
    }
  }

  /**
   * Verify user is authenticated
   */
  async verifyAuthenticated(
    options: {
      storageType?: 'cookie' | 'localStorage' | 'sessionStorage';
      cookieName?: string;
      localStorageKey?: string;
      redirectUrl?: string;
    } = {},
  ) {
    const {
      storageType = 'cookie',
      cookieName = 'auth-token',
      localStorageKey = 'authToken',
      redirectUrl,
    } = options;

    let authValue: string | null = null;

    switch (storageType) {
      case 'cookie':
        authValue = await this.getCookie(cookieName);
        break;
      case 'localStorage':
        authValue = await this.getLocalStorage(localStorageKey);
        break;
      case 'sessionStorage':
        authValue = await this.getSessionStorage(localStorageKey);
        break;
    }

    expect(authValue, 'User should be authenticated').not.toBeNull();
    expect(authValue, 'Auth token should not be empty').not.toBe('');

    // Check if redirected to login page
    if (redirectUrl) {
      const currentUrl = this.page.url();
      expect(currentUrl, 'Should not redirect to login when authenticated').not.toContain(
        redirectUrl,
      );
    }
  }

  /**
   * Verify user is not authenticated
   */
  async verifyNotAuthenticated(
    options: {
      storageType?: 'cookie' | 'localStorage' | 'sessionStorage';
      cookieName?: string;
      localStorageKey?: string;
      shouldRedirect?: boolean;
      loginUrl?: string;
    } = {},
  ) {
    const {
      storageType = 'cookie',
      cookieName = 'auth-token',
      localStorageKey = 'authToken',
      shouldRedirect = false,
      loginUrl = '/login',
    } = options;

    let authValue: string | null = null;

    switch (storageType) {
      case 'cookie':
        authValue = await this.getCookie(cookieName);
        break;
      case 'localStorage':
        authValue = await this.getLocalStorage(localStorageKey);
        break;
      case 'sessionStorage':
        authValue = await this.getSessionStorage(localStorageKey);
        break;
    }

    expect(authValue, 'User should not be authenticated').toBeNull();

    // Check if redirected to login page
    if (shouldRedirect && loginUrl) {
      const currentUrl = this.page.url();
      expect(currentUrl, 'Should redirect to login when not authenticated').toContain(loginUrl);
    }
  }

  /**
   * Simulate session expiry
   */
  async expireSession(
    options: {
      storageType?: 'cookie' | 'localStorage' | 'sessionStorage';
      cookieName?: string;
      localStorageKey?: string;
    } = {},
  ) {
    const {
      storageType = 'cookie',
      cookieName = 'auth-token',
      localStorageKey = 'authToken',
    } = options;

    switch (storageType) {
      case 'cookie':
        await this.clearCookiesByName([cookieName]);
        break;
      case 'localStorage':
        await this.page.evaluate(key => localStorage.removeItem(key), localStorageKey);
        break;
      case 'sessionStorage':
        await this.page.evaluate(key => sessionStorage.removeItem(key), localStorageKey);
        break;
    }
  }

  /**
   * Test session persistence across page reloads
   */
  async testSessionPersistence(
    options: {
      storageType?: 'cookie' | 'localStorage' | 'sessionStorage';
      cookieName?: string;
      localStorageKey?: string;
      shouldPersist?: boolean;
    } = {},
  ) {
    const {
      storageType = 'cookie',
      cookieName = 'auth-token',
      localStorageKey = 'authToken',
      shouldPersist = true,
    } = options;

    // Get auth value before reload
    let authValueBefore: string | null = null;
    switch (storageType) {
      case 'cookie':
        authValueBefore = await this.getCookie(cookieName);
        break;
      case 'localStorage':
        authValueBefore = await this.getLocalStorage(localStorageKey);
        break;
      case 'sessionStorage':
        authValueBefore = await this.getSessionStorage(localStorageKey);
        break;
    }

    // Reload page
    await this.page.reload();

    // Get auth value after reload
    let authValueAfter: string | null = null;
    switch (storageType) {
      case 'cookie':
        authValueAfter = await this.getCookie(cookieName);
        break;
      case 'localStorage':
        authValueAfter = await this.getLocalStorage(localStorageKey);
        break;
      case 'sessionStorage':
        authValueAfter = await this.getSessionStorage(localStorageKey);
        break;
    }

    if (shouldPersist) {
      expect(authValueAfter, 'Session should persist after reload').toBe(authValueBefore);
    } else {
      expect(authValueAfter, 'Session should not persist after reload').toBeNull();
    }
  }
}

/**
 * Context-level session utilities for managing sessions across multiple pages
 */
export class ContextSessionUtils {
  constructor(private readonly context: BrowserContext) {}

  /**
   * Save context storage state
   */
  async saveStorageState(path?: string) {
    return this.context.storageState({ path });
  }

  /**
   * Create new context with saved storage state
   */
  async createContextWithState(browser: any, statePath: string) {
    return browser.newContext({ storageState: statePath });
  }

  /**
   * Set cookies for all pages in context
   */
  async setContextCookies(cookies: any[]) {
    await this.context.addCookies(cookies);
  }

  /**
   * Clear all cookies in context
   */
  async clearContextCookies() {
    await this.context.clearCookies();
  }

  /**
   * Get all cookies in context
   */
  async getContextCookies() {
    return this.context.cookies();
  }
}

/**
 * Create session utilities instance
 */
export function createSessionUtils(page: Page) {
  return new SessionUtils(page);
}

/**
 * Create context session utilities instance
 */
export function createContextSessionUtils(context: BrowserContext) {
  return new ContextSessionUtils(context);
}
