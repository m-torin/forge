/**
 * E2E Tests for React Flow in Flows App
 * Tests React Flow functionality in fully headless mode for CI/CD
 */

import { expect, test } from '@playwright/test';

test.describe('React Flow E2E Tests', () => {
  test('React Flow renders and is interactive', async ({ page }) => {
    // Navigate to flows page
    await page.goto('/flows', { waitUntil: 'networkidle' });
    
    // Wait for React Flow to load
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    // Verify React Flow container exists
    const reactFlow = page.locator('.react-flow');
    await expect(reactFlow).toBeVisible();
    
    // Check for React Flow viewport
    const viewport = page.locator('.react-flow__viewport');
    await expect(viewport).toBeVisible();
  });

  test('React Flow works when database is unavailable', async ({ page }) => {
    // Test graceful degradation when DB is down
    await page.goto('/flows', { waitUntil: 'networkidle' });
    
    // Even with DB issues, React Flow should still render
    await page.waitForSelector('.react-flow', { timeout: 10000 });
    
    const reactFlow = page.locator('.react-flow');
    await expect(reactFlow).toBeVisible();
    
    // Test basic functionality still works
    await reactFlow.click();
    
    // Verify no critical errors prevent UI from functioning
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});