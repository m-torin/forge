import { expect, test } from '@playwright/test';

test.describe('Email Preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the email preview app', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/React Email/i);

    // Check for main content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should display email templates list', async ({ page }) => {
    // Check for email templates sidebar
    const sidebar = page.locator('[data-testid="email-sidebar"], aside');
    await expect(sidebar).toBeVisible();

    // Check for at least one email template
    const emailTemplates = page.locator('[data-testid="email-template"], a[href*="/"]');
    await expect(emailTemplates.first()).toBeVisible();
  });

  test('should preview email template when selected', async ({ page }) => {
    // Click on first email template
    const firstTemplate = page.locator('[data-testid="email-template"], a[href*="/"]').first();
    await firstTemplate.click();

    // Wait for preview to load
    await page.waitForLoadState('networkidle');

    // Check for email preview iframe or content
    const preview = page.locator('[data-testid="email-preview"], iframe, .email-preview');
    await expect(preview).toBeVisible();
  });

  test('should have code view option', async ({ page }) => {
    // Check for code view toggle
    const codeViewToggle = page.locator('button', { hasText: /code|source/i });
    await expect(codeViewToggle).toBeVisible();
  });
});
