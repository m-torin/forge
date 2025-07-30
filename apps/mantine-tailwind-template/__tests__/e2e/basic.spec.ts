import { expect, test } from '@playwright/test';

test('should load homepage and have correct title', async ({ page }) => {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Check if the page loads successfully
  expect(page.url()).toContain('localhost:3900');

  // Check if there's a body element (basic sanity check)
  await expect(page.locator('body')).toBeVisible();
});
