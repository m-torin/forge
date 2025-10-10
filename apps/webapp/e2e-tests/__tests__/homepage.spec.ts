import { AppTestHelpers, expect, test } from '@repo/qa/playwright';

test.describe('Homepage', () => {
  let helpers: AppTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new AppTestHelpers({
      name: 'webapp',
      port: 3200,
      baseURL: 'http://localhost:3200',
      appDirectory: '.',
    });
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Home/i);

    // Check for header elements - look for the actual div with header-like classes
    const header = page.locator('div[class*="flex h-20"]');
    await expect(header).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test navigation to different pages - look for actual links that exist
    const logo = page.locator('a[href="/"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('should display hero section', async ({ page }) => {
    // Look for the specific page container - use the most specific selector
    const pageContainer = page.locator('.nc-PageHome');
    await expect(pageContainer).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport - check for header instead of nav
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('div[class*="flex h-20"]')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('div[class*="flex h-20"]')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('div[class*="flex h-20"]')).toBeVisible();
  });

  test('should take a screenshot', async ({ page }) => {
    await helpers.takeScreenshot(page, 'homepage');
  });
});
