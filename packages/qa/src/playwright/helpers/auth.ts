import { expect, type BrowserContext, type Page } from '@playwright/test';

export interface TestUser {
  email: string;
  name: string;
  password: string;
}

export interface AuthTestHelpers {
  bypassAuth(page: Page, user: TestUser): Promise<void>;
  createTestUser(userData: Partial<TestUser>): TestUser;
  getSessionFromCookies(context: BrowserContext): Promise<any>;
  isSignedIn(page: Page): Promise<boolean>;
  signIn(page: Page, user: TestUser): Promise<void>;
  signOut(page: Page): Promise<void>;
  signUp(page: Page, user: TestUser): Promise<void>;
  waitForAuth(page: Page): Promise<void>;
}

/**
 * Better Auth test helpers for Playwright E2E tests
 */
export class BetterAuthTestHelpers implements AuthTestHelpers {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Create a test user with default values
   */
  createTestUser(userData: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now();
    return {
      name: userData.name || `Test User ${timestamp}`,
      email: userData.email || `test-${timestamp}@example.com`,
      password: userData.password || 'TestPassword123!',
    };
  }

  /**
   * Sign in a user through the UI
   */
  async signIn(page: Page, user: TestUser): Promise<void> {
    // Navigate to sign-in page
    await page.goto('/sign-in');

    // Wait for the sign-in form to be visible
    await expect(page.locator('form, [data-testid="sign-in-form"]')).toBeVisible({
      timeout: 10000,
    });

    // Fill in credentials
    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[placeholder*="email" i]',
    );
    await emailInput.waitFor();
    await emailInput.fill(user.email);

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"], input[placeholder*="password" i]',
    );
    await passwordInput.waitFor();
    await passwordInput.fill(user.password);

    // Submit the form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In")',
    );
    await submitButton.click();

    // Wait for redirect or success
    await this.waitForAuth(page);
  }

  /**
   * Sign out the current user
   */
  async signOut(page: Page): Promise<void> {
    // Look for sign-out button or menu
    const signOutSelectors = [
      'button:has-text("Sign out")',
      'button:has-text("Sign Out")',
      'button:has-text("Logout")',
      '[data-testid="sign-out"]',
      'a[href*="sign-out"]',
      'a[href*="logout"]',
    ];

    for (const selector of signOutSelectors) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        await element.click();
        break;
      }
    }

    // Wait for redirect to sign-in or home page
    await page.waitForURL('**/sign-in', { timeout: 5000 }).catch(() => {
      // Sign-out might redirect to home page instead
    });
  }

  /**
   * Sign up a new user through the UI
   */
  async signUp(page: Page, user: TestUser): Promise<void> {
    // Navigate to sign-up page
    await page.goto('/sign-up');

    // Wait for the sign-up form to be visible
    await expect(page.locator('form, [data-testid="sign-up-form"]')).toBeVisible({
      timeout: 10000,
    });

    // Fill in user details
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    if ((await nameInput.count()) > 0) {
      await nameInput.fill(user.name);
    }

    const emailInput = page.locator(
      'input[type="email"], input[name="email"], input[placeholder*="email" i]',
    );
    await emailInput.waitFor();
    await emailInput.fill(user.email);

    const passwordInput = page
      .locator('input[type="password"], input[name="password"], input[placeholder*="password" i]')
      .first();
    await passwordInput.waitFor();
    await passwordInput.fill(user.password);

    // Confirm password if field exists
    const confirmPasswordInput = page.locator(
      'input[name*="confirm"], input[placeholder*="confirm" i]',
    );
    if ((await confirmPasswordInput.count()) > 0) {
      await confirmPasswordInput.fill(user.password);
    }

    // Submit the form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign up"), button:has-text("Create")',
    );
    await submitButton.click();

    // Wait for redirect or success
    await this.waitForAuth(page);
  }

  /**
   * Check if user is currently signed in
   */
  async isSignedIn(page: Page): Promise<boolean> {
    try {
      // Check for authenticated user indicators
      const authIndicators = [
        '[data-testid="user-menu"]',
        'button:has-text("Sign out")',
        'a[href*="dashboard"]',
        'a[href*="profile"]',
        '.user-avatar',
        '[data-testid="authenticated"]',
      ];

      for (const selector of authIndicators) {
        if ((await page.locator(selector).count()) > 0) {
          return true;
        }
      }

      // Check if we're on a protected page
      const currentUrl = page.url();
      const protectedPages = ['/dashboard', '/profile', '/settings', '/admin'];
      const isOnProtectedPage = protectedPages.some(path => currentUrl.includes(path));

      if (isOnProtectedPage) {
        // If we're on a protected page and not redirected to sign-in, we're authenticated
        return !currentUrl.includes('/sign-in');
      }

      return false;
    } catch (error) {
      console.warn('Error checking auth status:', error);
      return false;
    }
  }

  /**
   * Get session data from browser cookies
   */
  async getSessionFromCookies(context: BrowserContext): Promise<any> {
    try {
      const cookies = await context.cookies();

      // Look for Better Auth session cookies
      const sessionCookies = cookies.filter(
        (cookie: any) =>
          cookie.name.includes('session') ||
          cookie.name.includes('auth') ||
          cookie.name.includes('better-auth'),
      );

      if (sessionCookies.length === 0) {
        return null;
      }

      // Return the session cookie data
      return sessionCookies[0];
    } catch (error) {
      console.warn('Error getting session from cookies:', error);
      return null;
    }
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(page: Page): Promise<void> {
    try {
      // Wait for either authenticated state or redirect
      await Promise.race([
        // Wait for authenticated indicators
        await expect(
          page.locator('[data-testid="user-menu"], button:has-text("Sign out"), .user-avatar'),
        ).toBeVisible({ timeout: 10000 }),
        // Or wait for redirect away from auth pages
        page.waitForURL(
          (url: URL) => !url.href.includes('/sign-in') && !url.href.includes('/sign-up'),
          { timeout: 10000 },
        ),
        // Or wait for dashboard/protected page
        page.waitForURL('**/dashboard', { timeout: 10000 }),
      ]);

      // Additional wait for page to stabilize
      await expect(
        page.locator('[data-testid="user-menu"], .dashboard, .main-content'),
      ).toBeVisible({ timeout: 10000 });
    } catch (error) {
      console.warn('Auth wait timeout, continuing with test: ', error);
    }
  }

  /**
   * Bypass authentication by directly setting session cookies
   * Useful for testing authenticated states without going through the UI
   */
  async bypassAuth(page: Page, user: TestUser): Promise<void> {
    try {
      // Create a session by calling the auth API directly
      const response = await page.request.post(`${this.baseURL}/api/auth/sign-in`, {
        data: {
          email: user.email,
          password: user.password,
        },
      });

      if (!response.ok()) {
        throw new Error(`Failed to create session: ${response.status()}`);
      }

      // The cookies should be automatically set by the browser
      // Navigate to a protected page to verify
      await page.goto('/dashboard');
      await this.waitForAuth(page);
    } catch (error) {
      console.warn('Bypass auth failed, falling back to UI sign-in:', error);
      await this.signIn(page, user);
    }
  }

  /**
   * Create a test user account via API (for test setup)
   */
  async createUserViaAPI(page: Page, user: TestUser): Promise<void> {
    try {
      const response = await page.request.post(`${this.baseURL}/api/auth/sign-up`, {
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
      });

      if (!response.ok()) {
        throw new Error(`Failed to create user: ${response.status()}`);
      }
    } catch (error) {
      console.warn('API user creation failed:', error);
      throw error;
    }
  }

  /**
   * Clean up test user (for test teardown)
   */
  async cleanupUser(page: Page, _user: TestUser): Promise<void> {
    try {
      // This would require an admin API endpoint to delete users
      // For now, we'll just sign out
      if (await this.isSignedIn(page)) {
        await this.signOut(page);
      }
    } catch (error) {
      console.warn('User cleanup failed: ', error);
    }
  }

  /**
   * Test social authentication (if enabled)
   */
  async signInWithSocial(page: Page, provider: 'google' | 'github'): Promise<void> {
    await page.goto('/sign-in');

    const socialButton = page.locator(`button:has-text("${provider}"), a:has-text("${provider}")`, {
      hasText: provider.charAt(0).toUpperCase() + provider.slice(1),
    });

    if ((await socialButton.count()) > 0) {
      await socialButton.click();
      // Note: In tests, social auth would typically be mocked
      // This is just the UI interaction part
    } else {
      throw new Error(`Social sign-in button for ${provider} not found`);
    }
  }

  /**
   * Test organization functionality (if enabled)
   */
  async switchOrganization(page: Page, orgName: string): Promise<void> {
    // Look for organization switcher
    const orgSwitcher = page.locator(
      '[data-testid="org-switcher"], .organization-switcher, button:has-text("Organization")',
    );

    if ((await orgSwitcher.count()) > 0) {
      await orgSwitcher.click();
      await page.locator(`text=${orgName}`).click();
      // Wait for org switch to complete (e.g., dashboard or org name visible)
      await expect(page.locator('.dashboard, [data-testid="org-name"]')).toBeVisible({
        timeout: 10000,
      });
    }
  }
}

/**
 * Factory function to create auth helpers for different apps
 */
export function createAuthHelpers(baseURL: string): BetterAuthTestHelpers {
  return new BetterAuthTestHelpers(baseURL);
}
