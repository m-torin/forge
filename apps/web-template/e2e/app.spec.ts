import { expect, test } from '@playwright/test';

test.describe('Web Template App', () => {
  test('app should load successfully', async ({ page }) => {
    await page.goto('/');

    // The web-template app should respond with a 200 status
    await expect(page).toHaveTitle(/.*/); // Any title is acceptable for now

    // Check that the page loaded without major errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display homepage content', async ({ page }) => {
    await page.goto('/');

    // Check that the page has some content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText?.length).toBeGreaterThan(100); // Should have substantial content
  });

  test('should handle navigation to different locales', async ({ page }) => {
    // Test default locale (should redirect to /en or similar)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should be on a locale-specific URL
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(en|es|fr|de|pt)\/?/);
  });

  test('should load static assets correctly', async ({ page }) => {
    const resourceErrors: string[] = [];

    page.on('response', (response) => {
      if (response.status() >= 400) {
        resourceErrors.push(`${response.status()} - ${response.url()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for any 4xx or 5xx responses
    expect(resourceErrors).toHaveLength(0);
  });

  test('should have basic accessibility features', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility elements
    const hasMainLandmark = (await page.locator("main, [role='main']").count()) > 0;
    expect(hasMainLandmark).toBeTruthy();

    // Check for navigation
    const hasNavigation = (await page.locator("nav, [role='navigation']").count()) > 0;
    expect(hasNavigation).toBeTruthy();
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');

    // Should return 404 status
    expect(response?.status()).toBe(404);

    // Should still render a page (Next.js custom 404)
    await expect(page.locator('body')).toBeVisible();
  });
});
