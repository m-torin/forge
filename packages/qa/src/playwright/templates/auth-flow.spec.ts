/**
 * Authentication Flow E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import {
  AuthPage,
  BetterAuthTestHelpers,
  createAuthHelpers,
  EnvironmentData,
  expect,
  PageObjectFactory,
  test,
  TestDataGenerator,
} from '@repo/qa/playwright';

test.describe('Authentication Flow', () => {
  let authHelpers: BetterAuthTestHelpers;
  let authPage: AuthPage;
  let pageFactory: PageObjectFactory;

  test.beforeEach(async ({ page }) => {
    authHelpers = createAuthHelpers(EnvironmentData.getApiUrl());
    pageFactory = new PageObjectFactory(page);
    authPage = pageFactory.createAuthPage();
  });

  test('should show login page with all elements', async ({ page }) => {
    await page.goto('/sign-in');

    // Check all form elements are present
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.passwordInput).toBeVisible();
    await expect(authPage.submitButton).toBeVisible();

    // Check for additional UI elements
    await expect(page.getByText(/sign in/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    await page.goto('/sign-in');

    // Use environment-specific test user
    const userData = EnvironmentData.getTestUser();
    const testUser = authHelpers.createTestUser(userData);

    // Login using page object
    await authPage.login(testUser.email, testUser.password);

    // Verify successful login
    const isLoggedIn = await authPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(url => !url.pathname.includes('sign-in'));
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.goto('/sign-in');

    // Try to login with invalid credentials
    await authPage.login('invalid@example.com', 'wrongpassword');

    // Should show error message
    const errorMessage = await authPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('Invalid');

    // Should stay on login page
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should handle registration flow', async ({ page }) => {
    await page.goto('/sign-up');

    // Generate unique test user
    const newUser = TestDataGenerator.user();

    // Fill registration form
    await page.fill('input[type="email"]', newUser.email);
    await page.fill('input[type="password"]', newUser.password);
    await page.fill('input[name="confirmPassword"]', newUser.password);

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click();

    // Wait for registration to complete
    await Promise.race([
      await expect(page.locator('.dashboard, [data-testid="user-menu"]')).toBeVisible({
        timeout: 10000,
      }),
      await expect(page.locator('text=success')).toBeVisible({ timeout: 10000 }),
    ]);

    // Check for success (might redirect or show message)
    // Customize based on your app's behavior
    const successIndicator = page.locator('.dashboard, [data-testid="user-menu"], text=success');
    await expect(successIndicator).toBeVisible();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/sign-in/);

    // Should show redirect message if your app does this
    const message = page.getByText(/please sign in/i);
    const isVisible = message;
    await expect(isVisible).toBeVisible();
    await expect(message).toHaveText(/please sign in/i);
  });

  test('should handle logout', async ({ page }) => {
    // First login
    const userData = EnvironmentData.getTestUser();
    const testUser = authHelpers.createTestUser(userData);
    await authHelpers.bypassAuth(page, testUser);

    // Navigate to a protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/dashboard/);

    // Logout
    await authHelpers.signOut(page);

    // Should redirect to login or home
    await expect(page).toHaveURL(url => url.pathname === '/' || url.pathname.includes('sign-in'));

    // Try to access protected route again
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    const userData = EnvironmentData.getTestUser();
    const testUser = authHelpers.createTestUser(userData);
    await page.goto('/sign-in');
    await authPage.login(testUser.email, testUser.password);

    // Verify logged in
    await expect(page).toHaveURL(url => !url.pathname.includes('sign-in'));

    // Reload page
    await page.reload();

    // Should still be logged in
    const isStillLoggedIn = await authHelpers.isSignedIn(page);
    expect(isStillLoggedIn).toBeTruthy();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Enter email
    const testEmail = TestDataGenerator.email('reset');
    await page.fill('input[type="email"]', testEmail);
    await page.getByRole('button', { name: /reset password/i }).click();

    // Should show success message
    await expect(page.getByText(/email sent/i)).toBeVisible();

    // In a real test, you might:
    // 1. Check test email inbox
    // 2. Extract reset link
    // 3. Complete password reset
  });
});
