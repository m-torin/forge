/**
 * Basic E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import {
  AppTestConfig,
  AppTestHelpers,
  expect,
  PerformanceUtils,
  test,
  WaitUtils,
} from '@repo/qa/playwright';

test.describe('Application E2E Tests', () => {
  let helpers: AppTestHelpers;
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    const appConfig: AppTestConfig = {
      name: 'test-app',
      appDirectory: process.cwd(),
      baseURL: 'http://localhost:3000',
      port: 3000,
    };
    helpers = new AppTestHelpers(appConfig);
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');
    await helpers.waitForApp(page);

    // Verify app loaded
    await expect(page).toHaveTitle(/.+/); // Any title
    await helpers.checkBasicUI(page);
  });

  test('should have good performance metrics', async ({ page }) => {
    await page.goto('/');

    // Measure page load performance
    const metrics = await perfUtils.measurePageLoad();

    // Assert performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(metrics.firstContentfulPaint).toBeLessThan(1500); // 1.5 seconds
  });

  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');

    // Example: Navigate to about page
    const aboutLink = page.getByRole('link', { name: /about/i });
    const isVisible = aboutLink;
    await expect(isVisible).toBeVisible();
    await aboutLink.click();
    await waitUtils.forNavigation();
    await expect(page).toHaveURL(/about/);
  });

  test('should be responsive across different viewports', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Verify layout works at this viewport
      await helpers.checkBasicUI(page);

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/viewport-${viewport.width}x${viewport.height}.png`,
      });

      // Assert that a known element is visible
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('health check endpoint should be accessible', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('status');
  });
});
