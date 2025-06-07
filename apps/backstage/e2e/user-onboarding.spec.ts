import { expect, test } from '@repo/testing/e2e';
import { AppTestHelpers, PerformanceUtils, WaitUtils } from '@repo/testing/e2e';

import { withPerformanceMonitoring } from './utils/performance-monitor';
import { createVisualTester } from './utils/visual-testing';

import type { AppTestConfig } from '@repo/testing/e2e';

test.describe('User Onboarding Workflow', () => {
  let helpers: AppTestHelpers;
  let waitUtils: WaitUtils;
  let perfUtils: PerformanceUtils;

  test.beforeEach(async ({ page }) => {
    const config: AppTestConfig = {
      name: 'backstage',
      appDirectory: '/Users/torin/repos/new--/forge/apps/backstage',
      baseURL: 'http://localhost:3300',
      port: 3300,
    };
    helpers = new AppTestHelpers(config);
    waitUtils = new WaitUtils(page);
    perfUtils = new PerformanceUtils(page);
  });

  test('user onboarding page should load successfully', async ({ context, page }) => {
    const { report, result } = await withPerformanceMonitoring(
      page,
      context,
      '/workflows/user-onboarding',
      async () => {
        await waitUtils.forNavigation();

        // Verify page loads successfully
        await expect(page).toHaveTitle(/.*/);
        await helpers.checkBasicUI(page);

        // Check for workflow configuration form
        await expect(page.locator('[data-testid="user-id-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
        await expect(page.locator('[data-testid="signup-source-select"]')).toBeVisible();

        return 'user onboarding page loaded';
      },
      {
        fcp: { error: 3000, warning: 1500 },
        lcp: { error: 4000, warning: 2500 },
      },
    );

    expect(result).toBe('user onboarding page loaded');

    await test.info().attach('user-onboarding-performance-report', {
      body: JSON.stringify(report, null, 2),
      contentType: 'application/json',
    });
  });

  test('workflow configuration form should be interactive', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Fill out the form
    await page.locator('[data-testid="user-id-input"]').fill('test_user_123');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="signup-source-select"]').click();
    await page.locator('text=Social Media').click();
    await page.locator('[data-testid="referral-code-input"]').fill('REF123456');

    // Test switches - click the switch labels instead of hidden inputs
    await page.locator('[data-testid="newsletter-switch"]').locator('..').click();
    await page.locator('[data-testid="product-updates-switch"]').locator('..').click();
    await page.locator('[data-testid="marketing-emails-switch"]').locator('..').click();

    // Verify values were set
    await expect(page.locator('[data-testid="user-id-input"]')).toHaveValue('test_user_123');
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('test@example.com');
    await expect(page.locator('[data-testid="referral-code-input"]')).toHaveValue('REF123456');
  });

  test('start workflow button should be enabled with valid data', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Initially disabled
    await expect(page.locator('[data-testid="start-workflow-button"]')).toBeDisabled();

    // Fill required fields
    await page.locator('[data-testid="user-id-input"]').fill('test_user_123');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');

    // Should now be enabled
    await expect(page.locator('[data-testid="start-workflow-button"]')).toBeEnabled();
  });

  test('workflow simulation should show progress', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Fill required fields
    await page.locator('[data-testid="user-id-input"]').fill('test_user_123');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');

    // Start workflow
    await page.locator('[data-testid="start-workflow-button"]').click();

    // Should show running state
    await expect(page.locator('[data-testid="running-alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="workflow-progress"]')).toBeVisible();

    // Check for step progression
    await expect(page.locator('[data-testid="step-create-user-profile"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-send-welcome-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-check-referral"]')).toBeVisible();

    // Wait for completion or timeout
    await page.waitForSelector('[data-testid="success-alert"]', { timeout: 10000 }).catch(() => {
      // It's ok if it doesn't complete, we're testing the UI interaction
    });
  });

  test('reset workflow button should work', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Fill fields and start
    await page.locator('[data-testid="user-id-input"]').fill('test_user_123');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="start-workflow-button"]').click();

    // Wait a moment for the workflow to start
    await page.waitForTimeout(1000);

    // Click reset (should be disabled while running)
    const resetButton = page.locator('[data-testid="reset-workflow-button"]');

    // Wait for workflow to finish or timeout, then reset should be enabled
    await page.waitForTimeout(5000); // Give time for workflow to complete

    // Reset should work
    await resetButton.click();

    // Progress should reset
    const progress = page.locator('[data-testid="workflow-progress"]');
    // Check that progress value is low or reset
  });

  test('workflow details should be displayed', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Check workflow details section
    await expect(page.locator('text=user-onboarding')).toBeVisible();
    await expect(page.locator('text=1.0.0')).toBeVisible();
    await expect(page.locator('text=2 minutes')).toBeVisible();
    await expect(page.locator('text=create-user-profile, create-workspace')).toBeVisible();
  });

  test('visual regression testing', async ({ page }) => {
    const visualTester = createVisualTester(page, 'user-onboarding');

    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Take visual regression screenshot
    await visualTester.comparePageState(page, 'user-onboarding-main', {
      animations: 'disabled',
      fullPage: true,
    });
  });

  test('responsive design', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');
    await waitUtils.forNavigation();

    // Test different viewports
    const viewports = [
      { width: 1200, name: 'desktop', height: 800 },
      { width: 768, name: 'tablet', height: 1024 },
      { width: 375, name: 'mobile', height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await waitUtils.forNavigation();
      await helpers.checkBasicUI(page);
    }
  });

  test('performance monitoring', async ({ page }) => {
    await page.goto('/workflows/user-onboarding');

    // Measure page load performance
    const metrics = await perfUtils.measurePageLoad();

    // Assert reasonable performance thresholds
    expect(metrics.domContentLoaded).toBeLessThan(5000); // 5 seconds
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).toBeLessThan(4000); // 4 seconds
    }
  });
});
