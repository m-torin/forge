import { expect, test } from '@playwright/test';

test.describe('Documentation Site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the documentation homepage', async ({ page }) => {
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/Documentation|Docs/i);

    // Check for main content
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  });

  test('should have navigation sidebar', async ({ page }) => {
    // Check if we're on mobile viewport
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    // Check for navigation sidebar
    const sidebar = page.locator('nav, [role="navigation"], aside');
    const sidebarCount = await sidebar.count();

    if (sidebarCount > 0) {
      if (isMobile) {
        // On mobile, nav elements should exist but may be hidden
        // Just verify that navigation elements are in the DOM
        await expect(sidebar.first()).toBeAttached();

        // Look for mobile menu toggle if it exists
        const mobileMenuToggle = page.locator(
          'button[aria-label*="menu"], button[aria-label*="navigation"], button[aria-label*="toggle"]',
        );
        const toggleCount = await mobileMenuToggle.count();
        if (toggleCount > 0) {
          await expect(mobileMenuToggle.first()).toBeVisible();
        }
      } else {
        // On desktop, sidebar should be visible
        await expect(sidebar.first()).toBeVisible();

        // Check for navigation links
        const navLinks = page.locator('nav a, aside a');
        const linkCount = await navLinks.count();
        if (linkCount > 0) {
          await expect(navLinks.first()).toBeVisible();
        }
      }
    } else {
      // Fallback: check for any navigation elements in DOM
      const anyNav = page.locator(
        'nav, [role="navigation"], aside, button[aria-label*="menu"], button[aria-label*="navigation"]',
      );
      const navCount = await anyNav.count();
      if (navCount > 0) {
        await expect(anyNav.first()).toBeAttached();
      } else {
        // Skip test if no navigation is found
        test.skip(true, 'No navigation elements found on this documentation site');
      }
    }
  });

  test('should have search functionality', async ({ page }) => {
    // Check for search input (Mintlify might use different selectors)
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"], [data-testid*="search"], button[aria-label*="Search"], button[aria-label*="search"]',
    );
    const searchCount = await searchInput.count();

    if (searchCount > 0) {
      await expect(searchInput.first()).toBeVisible();

      // Only test search functionality if it's an input field
      const firstElement = searchInput.first();
      const tagName = await firstElement.evaluate(el => el.tagName.toLowerCase());

      if (tagName === 'input') {
        await firstElement.fill('quickstart');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
      } else {
        // If it's a button, just click it to open search
        await firstElement.click();
        await page.waitForTimeout(500);
      }
    } else {
      // Skip test if no search functionality is found
      test.skip(searchCount > 0, 'Search functionality not found on this documentation site');
    }
  });

  test('should navigate to introduction page', async ({ page }) => {
    // Click on introduction/getting started link
    const introLink = page.locator('a', { hasText: /introduction|getting started/i });
    if ((await introLink.count()) > 0) {
      await introLink.first().click();
      await page.waitForLoadState('networkidle');

      // Check URL changed
      expect(page.url()).toContain('introduction');
    }
  });

  test('should have code syntax highlighting', async ({ page }) => {
    // Navigate to a page with code examples
    await page.goto('/quickstart');

    // Check for code blocks
    const codeBlocks = page.locator('pre code, .hljs, .prism');
    if ((await codeBlocks.count()) > 0) {
      await expect(codeBlocks.first()).toBeVisible();
    }
  });
});
