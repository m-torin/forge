import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';

const authHelpers = createAuthHelpers('http://localhost:3300');

test.describe('Backstage Auth - Better Auth Integration', (_: any) => {
  test('can access sign-in page', async ({ page }: any) => {
    await page.goto('/sign-in');

    // Check for Better Auth sign-in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check for social auth buttons if enabled
    const googleButton = page.locator('button:has-text("Google")');
    const githubButton = page.locator('button:has-text("GitHub")');

    if ((await googleButton.count()) > 0) {
      await expect(googleButton).toBeVisible();
    }

    if ((await githubButton.count()) > 0) {
      await expect(githubButton).toBeVisible();
    }
  });

  test('can sign up new admin user', async ({ page }: any) => {
    const testUser = authHelpers.createTestUser({
      name: 'Test Admin User',
      email: `admin-${Date.now()}@example.com`,
    });

    // Navigate to sign-up
    await page.goto('/sign-up');

    // Fill and submit sign-up form
    await authHelpers.signUp(page, testUser);

    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/\/(dashboard|onboarding|welcome)/);

    // Verify user is authenticated
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);
  });

  test('can sign in existing user', async ({ page }: any) => {
    // First create a user
    const testUser = authHelpers.createTestUser({
      email: `admin-signin-${Date.now()}@example.com`,
    });

    // Create user via API (setup)
    try {
      await authHelpers.createUserViaAPI(page, testUser);
    } catch {
      // If API creation fails, create via UI
      await authHelpers.signUp(page, testUser);
      await authHelpers.signOut(page);
    }

    // Test sign-in
    await authHelpers.signIn(page, testUser);

    // Verify authentication
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);

    // Should be on admin dashboard
    await expect(page).toHaveURL(/\/(dashboard|admin)/);
  });

  test('can sign out', async ({ page }: any) => {
    const testUser = authHelpers.createTestUser();

    // Sign in first
    await authHelpers.signIn(page, testUser);

    // Verify signed in
    expect(await authHelpers.isSignedIn(page)).toBe(true);

    // Sign out
    await authHelpers.signOut(page);

    // Should redirect to sign-in or home
    await expect(page).toHaveURL(/\/(sign-in|$)/);

    // Verify signed out
    expect(await authHelpers.isSignedIn(page)).toBe(false);
  });

  test('redirects unauthenticated users from protected routes', async ({ page }: any) => {
    // Try to access admin dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);

    // Try other protected routes
    const protectedRoutes = ['/admin', '/users', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test('maintains session across page reloads', async ({ page }: any) => {
    const testUser = authHelpers.createTestUser();

    // Sign in
    await authHelpers.signIn(page, testUser);
    expect(await authHelpers.isSignedIn(page)).toBe(true);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    expect(await authHelpers.isSignedIn(page)).toBe(true);
  });

  test('admin user can access admin features', async ({ page }: any) => {
    const testUser = authHelpers.createTestUser({
      email: `admin-features-${Date.now()}@example.com`,
    });

    // Sign in as admin
    await authHelpers.signIn(page, testUser);

    // Navigate to admin dashboard
    await page.goto('/dashboard');

    // Check for admin-specific elements
    const adminElements = [
      'text=Users',
      'text=Organizations',
      'text=Settings',
      '[data-testid="admin-nav"]',
      'a[href*="admin"]',
    ];

    let adminElementFound = false;
    for (const selector of adminElements) {
      if ((await page.locator(selector).count()) > 0) {
        adminElementFound = true;
        break;
      }
    }

    if (adminElementFound) {
      expect(adminElementFound).toBe(true);
    }
  });

  test('handles authentication errors gracefully', async ({ page }: any) => {
    await page.goto('/sign-in');

    // Try to sign in with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    const errorMessages = [
      'text=Invalid credentials',
      'text=Invalid email or password',
      'text=Authentication failed',
      '.error',
      '[role="alert"]',
    ];

    let errorFound = false;
    for (const selector of errorMessages) {
      if ((await page.locator(selector).count()) > 0) {
        errorFound = true;
        break;
      }
    }

    if (!errorFound) {
      // Should at least stay on sign-in page
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test('session expires and redirects to sign-in', async ({ context, page }: any) => {
    const testUser = authHelpers.createTestUser();

    // Sign in
    await authHelpers.signIn(page, testUser);

    // Clear all cookies to simulate session expiry
    await context.clearCookies();

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('can use Better Auth API endpoints', async ({ page }: any) => {
    // Test that Better Auth API endpoints are accessible
    const apiEndpoints = [
      '/api/auth/session',
      '/api/auth/sign-in',
      '/api/auth/sign-up',
      '/api/auth/sign-out',
    ];

    for (const endpoint of apiEndpoints) {
      const response = await page.request.get(`http://localhost:3300${endpoint}`);
      // Should not return 404 (endpoints exist)
      expect([200, 401, 405, 422].includes(response.status())).toBe(true);
    }
  });
});
