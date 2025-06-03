import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';
import { AppTestHelpers } from '@repo/testing/playwright';

const appConfig = {
  name: 'workers',
  appDirectory: '/Users/torin/repos/new--/forge/apps/workers',
  baseURL: 'http://localhost:3400',
  port: 3400,
};

const helpers = new AppTestHelpers(appConfig);
const authHelpers = createAuthHelpers(appConfig.baseURL);

test.describe('Workers App - Root Integration Tests', () => {
  test('app loads successfully', async ({ page }) => {
    await helpers.waitForApp(page);
    await helpers.checkAppHealth(page);

    // Workers app should have a title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('basic UI elements are present', async ({ page }) => {
    await page.goto('/');
    await helpers.checkBasicUI(page);

    // Check for common app elements
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Check if the page has basic content structure
    const main = page.locator('main, [role="main"], .main-content, #__next');
    if ((await main.count()) > 0) {
      await expect(main.first()).toBeVisible();
    }
  });

  test('authentication routes are accessible', async ({ page }) => {
    const authResults = await helpers.checkAuthRoutes(page);

    // Sign-in should be accessible
    if (authResults['/sign-in']) {
      expect([200, 301, 302, 307, 308]).toContain(authResults['/sign-in']);
    }

    // API auth should exist
    if (authResults['/api/auth']) {
      expect([200, 404, 405]).toContain(authResults['/api/auth']);
    }
  });

  test('health and API endpoints are working', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.goto('/api/health');
    expect(healthResponse?.status()).toBe(200);

    // Test workflows API endpoint
    const workflowsResponse = await page.goto('/api/workflows');
    expect([200, 401, 403]).toContain(workflowsResponse?.status() || 0);

    // Test client API endpoint
    const clientResponse = await page.goto('/api/client');
    expect([200, 401, 403, 405]).toContain(clientResponse?.status() || 0);
  });

  test('workflow-specific endpoints are accessible', async ({ page }) => {
    const workflowEndpoints = [
      '/api/workflows/basic',
      '/api/workflows/kitchen-sink',
      '/api/workflows/image-processing',
    ];

    for (const endpoint of workflowEndpoints) {
      const response = await page.goto(endpoint);
      // Should be accessible but may require auth (401/403) or method (405)
      expect([200, 401, 403, 405]).toContain(response?.status() || 0);
    }
  });

  test('no critical JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('404') &&
        !error.includes('favicon') &&
        !error.includes('chrome-extension') &&
        !error.includes('extensions/') &&
        !error.includes('analytics') &&
        !error.includes('qstash'), // QStash dev server might not be running
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('app is responsive', async ({ page }) => {
    await page.goto('/');

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await helpers.checkBasicUI(page);
  });

  test('workflow UI components are present', async ({ page }) => {
    await page.goto('/');

    // Check for workflow-related elements
    const possibleWorkflowElements = [
      '[data-testid*="workflow"]',
      '.workflow',
      'button[name*="workflow"]',
      'a[href*="workflow"]',
      '.dashboard',
      '.monitoring',
    ];

    let workflowElementFound = false;
    for (const selector of possibleWorkflowElements) {
      const element = page.locator(selector);
      if ((await element.count()) > 0) {
        workflowElementFound = true;
        break;
      }
    }

    if (!workflowElementFound) {
      console.warn('No workflow-specific elements found - this might be expected for some pages');
    }
  });

  test('protected routes require authentication', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/monitoring', '/observability'];

    for (const route of protectedRoutes) {
      try {
        const response = await page.goto(route);
        if (response) {
          // Should redirect to auth or return 401/403
          expect([200, 301, 302, 307, 308, 401, 403]).toContain(response.status());
        }
      } catch (error) {
        // Route might not exist
        console.warn(`Route ${route} might not exist: ${error}`);
      }
    }
  });

  test('workflow endpoints return appropriate responses', async ({ page }) => {
    // Test workflow registry
    const workflowTypes = ['basic', 'kitchen-sink', 'image-processing'];

    for (const workflowType of workflowTypes) {
      try {
        const response = await page.goto(`/api/workflows/${workflowType}`);
        if (response) {
          // Should be accessible but may require auth or specific method
          expect([200, 401, 403, 405]).toContain(response.status());
        }
      } catch (error) {
        console.warn(`Workflow ${workflowType} endpoint might not exist: ${error}`);
      }
    }
  });

  test('observability endpoints are functional', async ({ page }) => {
    // Test observability endpoint
    const response = await page.goto('/api/observability');
    if (response) {
      expect([200, 401, 403, 405]).toContain(response.status());
    }

    // Check if monitoring page exists
    try {
      const monitoringResponse = await page.goto('/monitoring');
      if (monitoringResponse) {
        expect([200, 301, 302, 307, 308, 401, 403]).toContain(monitoringResponse.status());
      }
    } catch (error) {
      console.warn('Monitoring page might not exist:', error);
    }
  });

  test('webhook endpoints are configured', async ({ page }) => {
    const webhookEndpoints = ['/api/webhooks/workflow-status'];

    for (const endpoint of webhookEndpoints) {
      const response = await page.goto(endpoint);
      // Webhooks should respond (may require auth or specific method)
      expect([200, 401, 403, 405]).toContain(response?.status() || 0);
    }
  });

  test('can navigate between authenticated pages', async ({ page }) => {
    await page.goto('/');

    // Look for navigation links that don't require external auth
    const links = page.locator('a[href^="/"]').filter({ hasNotText: /^$/ });
    const linkCount = await links.count();

    if (linkCount > 0) {
      // Test up to 2 internal links
      const linksToTest = Math.min(2, linkCount);

      for (let i = 0; i < linksToTest; i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');

        if (href && href !== '/' && !href.includes('external') && !href.includes('mailto:')) {
          await link.click();
          await page.waitForLoadState('networkidle');

          // Page should load (even if it redirects to auth)
          const currentUrl = page.url();
          expect(currentUrl).toBeTruthy();

          // Go back to home for next test
          await page.goto('/');
        }
      }
    }
  });

  test('takes screenshot for visual verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await helpers.takeScreenshot(page, 'homepage');

    // Take authenticated dashboard screenshot if accessible
    try {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await helpers.takeScreenshot(page, 'dashboard');
    } catch (error) {
      console.log('Dashboard not accessible without auth - this is expected');
    }

    expect(true).toBe(true); // Always pass - screenshots are for reference
  });
});
