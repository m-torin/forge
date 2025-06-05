import { test, expect } from '@playwright/test';
import { AppTestHelpers } from '@repo/testing/playwright';

test.describe('Web App', () => {
  let helpers: AppTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new AppTestHelpers(page);
  });

  test('app should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Web App/);
  });

  test('should display the homepage content', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading or content that indicates the page loaded
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Add navigation tests based on your app's structure
    // Example: clicking a link and verifying the new page loads
    const aboutLink = page.getByRole('link', { name: /about/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/about/);
    }
  });
});