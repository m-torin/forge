/**
 * Basic E2E Test Template
 * Copy this file to your app's e2e folder and customize
 */

import { expect, test } from '@repo/qa/playwright';

// Simple infrastructure tests for the QA package

test.describe('QA Package Infrastructure', () => {
  test('should load example.com and have correct title', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('should generate a fake user with TestDataGenerator', async () => {
    // Import dynamically to avoid circular deps
    const { TestDataGenerator } = await import('../helpers/data-helpers');
    const user = TestDataGenerator.user();
    expect(user.email).toMatch(/@example.com$/);
    expect(user.firstName).toBeTruthy();
    expect(user.lastName).toBeTruthy();
    expect(user.password).toBe('Test123!@#');
  });

  test('should create a BasePage and get title', async ({ page }) => {
    const { BasePage } = await import('../helpers/page-objects');
    class DummyPage extends BasePage {}
    const dummy = new DummyPage(page);
    await page.goto('https://example.com');
    const title = await dummy.getTitle();
    expect(title).toMatch(/Example Domain/);
  });
});
