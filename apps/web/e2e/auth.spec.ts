import { test, expect } from '@playwright/test';
import { AppTestHelpers } from '@repo/testing/playwright';
import { authTestHelpers } from '@repo/testing/auth-helpers';

test.describe('Authentication', () => {
  let helpers: AppTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new AppTestHelpers(page);
  });

  test('should show sign in page', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Check for sign in form elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show sign up page', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Check for sign up form elements
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should navigate between sign in and sign up', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Click on sign up link
    const signUpLink = page.getByRole('link', { name: /sign up/i });
    await signUpLink.click();
    
    await expect(page).toHaveURL(/sign-up/);
    
    // Navigate back to sign in
    const signInLink = page.getByRole('link', { name: /sign in/i });
    await signInLink.click();
    
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should redirect to sign in when accessing protected route', async ({ page }) => {
    // Attempt to access a protected route
    await page.goto('/dashboard');
    
    // Should be redirected to sign in
    await expect(page).toHaveURL(/sign-in/);
  });

  test('should handle sign in with test user', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword';
    
    await page.goto('/sign-in');
    
    // Fill in credentials
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation or error message
    await page.waitForLoadState('networkidle');
    
    // Check if sign in was successful (adjust based on your app's behavior)
    // This might need to be customized based on your app's actual behavior
  });
});