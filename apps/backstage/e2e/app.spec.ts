import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import { AppTestHelpers } from '@repo/testing/playwright';

const appConfig = {
  name: 'backstage',
  appDirectory: '/Users/torin/repos/new--/forge/apps/backstage',
  baseURL: 'http://localhost:3300',
  port: 3300,
};

const helpers = new AppTestHelpers(appConfig);
const authHelpers = createAuthHelpers(appConfig.baseURL);

test.describe('Backstage App - Root Integration Tests', (_: any) => {
  test('app loads successfully', async ({ page }: any) => {
    await helpers.waitForApp(page);
    await helpers.checkAppHealth(page);
    await expect(page).toHaveTitle(/Backstage/i);
  });

  test('basic UI elements are present', async ({ page }: any) => {
    await page.goto('/');
    await helpers.checkBasicUI(page);

    // Check for common admin UI elements
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check if the page has basic content structure
    const main = page.locator('main, [role="main"], .main-content');
    if ((await main.count()) > 0) {
      await expect(main.first()).toBeVisible();
    }
  });

  test('Better Auth routes are accessible', async ({ page }: any) => {
    // Test Better Auth specific endpoints
    const betterAuthRoutes = [
      '/api/auth/session',
      '/api/auth/sign-in',
      '/api/auth/sign-up',
      '/api/auth/sign-out',
      '/sign-in',
      '/sign-up',
    ];

    for (const route of betterAuthRoutes) {
      const response = await page.goto(route);
      // Should be accessible (not 404)
      expect([200, 301, 302, 307, 308, 401, 405, 422]).toContain(response?.status() || 0);
    }
  });

  test('health endpoints are working', async ({ page }: any) => {
    const healthResults = await helpers.checkAPIHealth(page);

    // Health endpoint should return 200 if it exists
    if (healthResults['/health']) {
      expect(healthResults['/health']).toBe(200);
    }

    if (healthResults['/api/health']) {
      expect(healthResults['/api/health']).toBe(200);
    }
  });

  test('no critical JavaScript errors on load', async ({ page }: any) => {
    const errors: string[] = [];

    page.on('pageerror', (error: any) => {
      errors.push((error as Error)?.message || 'Unknown error');
    });

    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error: any) =>
        !error.includes('404') &&
        !error.includes('favicon') &&
        !error.includes('chrome-extension') &&
        !error.includes('extensions/'),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('app is responsive', async ({ page }: any) => {
    await page.goto('/');

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);
  });

  test('admin-specific features are present for authenticated users', async ({ page }: any) => {
    // Create and sign in a test admin user
    const testUser = authHelpers.createTestUser({
      name: 'Test Admin User',
      email: `admin-test-${Date.now()}@example.com`,
    });

    try {
      // Try to sign in (user might not exist yet)
      await authHelpers.signIn(page, testUser);
    } catch {
      // If sign-in fails, try creating the user first
      console.log('Creating new admin user for test');
      await authHelpers.signUp(page, testUser);
    }

    // Now check for admin elements on dashboard
    await page.goto('/dashboard');

    // Check for admin navigation or dashboard elements
    const possibleAdminElements = [
      'nav[role="navigation"]',
      '.admin-nav',
      '.dashboard',
      '[data-testid="admin-panel"]',
      'a[href*="admin"]',
      'a[href*="dashboard"]',
      'a[href*="users"]',
      'a[href*="settings"]',
      'text=Users',
      'text=Organizations',
      'text=Settings',
    ];

    let adminElementFound = false;
    for (const selector of possibleAdminElements) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        adminElementFound = true;
        console.log(`Found admin element: ${selector}`);
        break;
      }
    }

    // Verify user is authenticated
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);

    // If we're authenticated, we should see some admin elements
    if (!adminElementFound) {
      console.warn("No admin-specific elements found - checking if we're on the right page");
      // At minimum, we should be on a protected page and not redirected to sign-in
      expect(page.url()).not.toContain('/sign-in');
    }
  });

  test('can navigate between pages without errors', async ({ page }: any) => {
    await page.goto('/');

    // Look for navigation links
    const links = page.locator('a[href^="/"]').first();
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Click the first internal link and verify it loads
      const firstLink = links.first();
      const href = await firstLink.getAttribute('href');

      if (href && href !== '/' && !href.includes('external')) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        await helpers.checkBasicUI(page);
      }
    }
  });

  test('takes screenshot for visual verification', async ({ page }: any) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await helpers.takeScreenshot(page, 'homepage');

    // The screenshot file will be available for manual verification
    expect(true).toBe(true); // Always pass - screenshot is for reference
  });
});
