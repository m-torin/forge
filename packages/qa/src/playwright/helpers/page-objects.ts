import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Base Page Object for common functionality
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a specific path
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForLoad() {
    await expect(this.page.locator('body')).toBeVisible();
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Take a screenshot for debugging
   */
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * Check if an element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return this.page.isVisible(selector);
  }

  /**
   * Wait for an element to be visible
   */
  async waitForSelector(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }
}

/**
 * Common authentication page object
 */
export class AuthPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
    this.successMessage = page.locator('[role="status"]');
  }

  /**
   * Fill in the login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submit();
  }

  /**
   * Check if login was successful
   */
  async isLoggedIn(): Promise<boolean> {
    // Check for common indicators of being logged in
    // This might need to be customized per app
    try {
      await this.page.waitForURL(url => !url.pathname.includes('sign-in'), { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorMessage.isVisible()) {
      return this.errorMessage.textContent();
    }
    return null;
  }
}

/**
 * Factory to create page objects
 */
export class PageObjectFactory {
  constructor(private readonly page: Page) {}

  /**
   * Create an auth page object
   */
  createAuthPage(): AuthPage {
    return new AuthPage(this.page);
  }

  /**
   * Create a custom page object
   */
  createPage<T extends BasePage>(PageClass: new (page: Page) => T): T {
    return new PageClass(this.page);
  }
}

/**
 * Utility to wait for specific conditions
 */
export class WaitUtils {
  constructor(private readonly page: Page) {}

  /**
   * Wait for a specific text to appear
   */
  async forText(text: string, _options?: { timeout?: number }) {
    await expect(this.page.locator(`text=${text}`)).toBeVisible();
  }

  /**
   * Wait for URL to match pattern
   */
  async forUrl(urlPattern: string | RegExp, options?: { timeout?: number }) {
    await this.page.waitForURL(urlPattern, options);
  }

  /**
   * Wait for navigation to complete
   */
  async forNavigation(_options?: { timeout?: number }) {
    await expect(this.page.locator('body')).toBeVisible();
  }

  /**
   * Wait for element to be clickable
   */
  async forClickable(selector: string, options?: { timeout?: number }) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', ...options });
    await element.waitFor({ state: 'attached', ...options });
  }

  /**
   * Wait for API response
   */
  async forResponse(urlPattern: string | RegExp, options?: { timeout?: number }) {
    return this.page.waitForResponse(urlPattern, options);
  }
}
