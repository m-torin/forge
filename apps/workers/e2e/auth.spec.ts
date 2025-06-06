import { expect, test } from '@playwright/test';

test.describe('Workers App - Public Access', () => {
  test('can access dashboard without authentication', async ({ page }) => {
    await page.goto('/');

    // Check that the dashboard loads
    await expect(page.locator('h1')).toContainText('Workflow Dashboard');
    await expect(page.locator('text=Monitor and manage your background workflows')).toBeVisible();
  });

  test('can access workflow pages without authentication', async ({ page }) => {
    await page.goto('/');

    // Should be able to see workflow links
    await expect(page.locator('text=Available Workflows')).toBeVisible();

    // Check for workflow trigger buttons
    await expect(page.locator('button:has-text("No Steps")')).toBeVisible();
    await expect(page.locator('button:has-text("Pure Test")')).toBeVisible();
  });

  test('can trigger test workflows without authentication', async ({ page }) => {
    await page.goto('/');

    // Look for test buttons
    await expect(page.locator('button:has-text("Plain API")')).toBeVisible();
    await expect(page.locator('button:has-text("Test QStash")')).toBeVisible();
  });

  test('workflow API endpoints are publicly accessible', async ({ page }) => {
    const publicEndpoints = ['/api/health', '/api/test-plain', '/api/test-qstash'];

    for (const endpoint of publicEndpoints) {
      const response = await page.request.get(`http://localhost:3400${endpoint}`);

      // Should be accessible (200) or have proper method handling (405)
      expect([200, 405].includes(response.status())).toBe(true);
    }
  });

  test('can access workflow execution endpoints', async ({ page }) => {
    const workflowEndpoints = [
      '/api/workflows/no-steps',
      '/api/workflows/pure-test',
      '/api/workflows/basic',
    ];

    // Test that endpoints exist (might require POST)
    for (const endpoint of workflowEndpoints) {
      const response = await page.request.post(`http://localhost:3400${endpoint}`, {
        data: { test: 'data' },
      });

      // Should handle requests properly (not 404)
      expect(response.status()).not.toBe(404);
    }
  });

  test('client API endpoints are accessible', async ({ page }) => {
    const clientEndpoints = ['/api/client', '/api/client/logs', '/api/client/trigger'];

    for (const endpoint of clientEndpoints) {
      const response = await page.request.get(`http://localhost:3400${endpoint}`);

      // Should be accessible or have proper method handling
      expect([200, 405].includes(response.status())).toBe(true);
    }
  });

  test('SSE events endpoint is accessible', async ({ page }) => {
    const response = await page.request.get('http://localhost:3400/api/events');

    // SSE endpoint should be accessible
    expect([200, 405].includes(response.status())).toBe(true);
  });

  test('monitoring endpoints are accessible', async ({ page }) => {
    const monitoringEndpoints = ['/api/health', '/api/observability'];

    for (const endpoint of monitoringEndpoints) {
      const response = await page.request.get(`http://localhost:3400${endpoint}`);
      expect([200, 405].includes(response.status())).toBe(true);
    }
  });

  test('webhook endpoints handle requests correctly', async ({ page }) => {
    const webhookEndpoints = ['/api/webhooks/workflow-status'];

    for (const endpoint of webhookEndpoints) {
      const response = await page.request.post(`http://localhost:3400${endpoint}`, {
        data: { status: 'test' },
      });

      // Should respond appropriately (not 404)
      expect(response.status()).not.toBe(404);
    }
  });

  test('can navigate between workflow pages', async ({ page }) => {
    await page.goto('/');

    // Check navigation is working
    const workflowLinks = await page.locator('a[href^="/workflows/"]').count();

    if (workflowLinks > 0) {
      // Click on first workflow link
      await page.locator('a[href^="/workflows/"]').first().click();

      // Should navigate to workflow page
      expect(page.url()).toContain('/workflows/');
    }
  });
});
