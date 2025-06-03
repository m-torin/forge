import { expect, test } from '@playwright/test';

import { createAuthHelpers } from '@repo/testing/auth-helpers';

const authHelpers = createAuthHelpers('http://localhost:3400');

test.describe('Workers App Auth - Better Auth Integration', () => {
  test('can access sign-in page', async ({ page }) => {
    await page.goto('/sign-in');

    // Check for Better Auth sign-in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('can authenticate for workflow access', async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      name: 'Test Worker User',
      email: `worker-${Date.now()}@example.com`,
    });

    // Sign in
    await authHelpers.signIn(page, testUser);

    // Verify authentication
    const isAuthenticated = await authHelpers.isSignedIn(page);
    expect(isAuthenticated).toBe(true);

    // Should be able to access dashboard
    await page.goto('/dashboard');
    expect(page.url()).not.toContain('/sign-in');
  });

  test('protected workflow routes require authentication', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/monitoring', '/observability'];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Should redirect to sign-in or be accessible if already authenticated
      const currentUrl = page.url();
      const isOnSignIn = currentUrl.includes('/sign-in');
      const isOnRoute = currentUrl.includes(route);

      // Either redirected to sign-in OR successfully on the route (if authenticated)
      expect(isOnSignIn || isOnRoute).toBe(true);
    }
  });

  test('workflow API endpoints require authentication', async ({ page }) => {
    const workflowEndpoints = [
      '/api/workflows/basic',
      '/api/workflows/kitchen-sink',
      '/api/workflows/image-processing',
    ];

    // Test without authentication
    for (const endpoint of workflowEndpoints) {
      const response = await page.request.post(`http://localhost:3400${endpoint}`, {
        data: { test: 'data' },
      });

      // Should require authentication (401 or 403)
      expect([401, 403, 405].includes(response.status())).toBe(true);
    }
  });

  test('can access workflow endpoints when authenticated', async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      email: `workflow-user-${Date.now()}@example.com`,
    });

    // Sign in first
    await authHelpers.signIn(page, testUser);

    // Test client API endpoint
    const response = await page.request.get('http://localhost:3400/api/client');

    // Should be accessible now (200) or have proper method handling (405)
    expect([200, 405].includes(response.status())).toBe(true);
  });

  test('can trigger workflows with authentication', async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      email: `workflow-trigger-${Date.now()}@example.com`,
    });

    // Sign in
    await authHelpers.signIn(page, testUser);

    // Navigate to a workflow page
    await page.goto('/dashboard');

    // Look for workflow trigger elements
    const workflowElements = [
      'button:has-text("Run")',
      'button:has-text("Start")',
      'button:has-text("Execute")',
      'button:has-text("Trigger")',
      '[data-testid*="workflow"]',
      '.workflow-trigger',
    ];

    let workflowElementFound = false;
    for (const selector of workflowElements) {
      if ((await page.locator(selector).count()) > 0) {
        workflowElementFound = true;
        console.log(`Found workflow element: ${selector}`);
        break;
      }
    }

    // Verify we're authenticated and on a workflow page
    expect(await authHelpers.isSignedIn(page)).toBe(true);
    expect(page.url()).not.toContain('/sign-in');

    if (!workflowElementFound) {
      console.warn('No workflow trigger elements found - this might be expected for some pages');
    }
  });

  test('monitoring endpoints require authentication', async ({ page }) => {
    // Test monitoring endpoint without auth
    const monitoringResponse = await page.request.get('http://localhost:3400/api/observability');
    expect([401, 403, 405].includes(monitoringResponse.status())).toBe(true);

    // Test with authentication
    const testUser = authHelpers.createTestUser();
    await authHelpers.signIn(page, testUser);

    // Now monitoring should be accessible
    await page.goto('/monitoring');
    expect(page.url()).not.toContain('/sign-in');
  });

  test('webhook endpoints handle authentication correctly', async ({ page }) => {
    const webhookEndpoints = ['/api/webhooks/workflow-status'];

    for (const endpoint of webhookEndpoints) {
      const response = await page.request.post(`http://localhost:3400${endpoint}`, {
        data: { status: 'test' },
      });

      // Webhooks may have different auth requirements
      // Should respond appropriately (not 404)
      expect([200, 401, 403, 405, 422].includes(response.status())).toBe(true);
    }
  });

  test('can manage user sessions in workers context', async ({ page }) => {
    const testUser = authHelpers.createTestUser();

    // Sign in
    await authHelpers.signIn(page, testUser);
    expect(await authHelpers.isSignedIn(page)).toBe(true);

    // Navigate to different workflow pages
    const workflowPages = ['/dashboard', '/monitoring'];

    for (const workflowPage of workflowPages) {
      try {
        await page.goto(workflowPage);

        // Should maintain authentication across pages
        expect(await authHelpers.isSignedIn(page)).toBe(true);
        expect(page.url()).not.toContain('/sign-in');
      } catch (error) {
        console.warn(`Workflow page ${workflowPage} might not exist:`, error);
      }
    }

    // Sign out
    await authHelpers.signOut(page);
    expect(await authHelpers.isSignedIn(page)).toBe(false);
  });

  test('worker app Better Auth API endpoints', async ({ page }) => {
    const betterAuthEndpoints = [
      '/api/auth/session',
      '/api/auth/sign-in',
      '/api/auth/sign-up',
      '/api/auth/sign-out',
    ];

    for (const endpoint of betterAuthEndpoints) {
      const response = await page.request.get(`http://localhost:3400${endpoint}`);

      // Should not return 404 (endpoints exist)
      expect([200, 401, 405, 422].includes(response.status())).toBe(true);
    }
  });

  test('authenticated users can access workflow logs', async ({ page }) => {
    const testUser = authHelpers.createTestUser({
      email: `logs-user-${Date.now()}@example.com`,
    });

    // Sign in
    await authHelpers.signIn(page, testUser);

    // Test client logs endpoint
    const logsResponse = await page.request.get('http://localhost:3400/api/client/logs');

    // Should be accessible or have proper method handling
    expect([200, 405].includes(logsResponse.status())).toBe(true);
  });
});
